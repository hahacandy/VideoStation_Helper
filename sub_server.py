import webvtt
import srt
import ass
import nest_asyncio
import asyncio              # 웹 소켓 모듈을 선언한다.
import websockets           # 클라이언트 접속이 되면 호출된다.
import json
from io import StringIO
import time

eng_anime_path = 'Y:/'

def subtime_to_second(sub_time):
    
    
    sub_time = str(sub_time)
    sub_times = sub_time.split(':')
    sum_time = (float(sub_times[0])*60*60) + (float(sub_times[1])*60) + float(sub_times[2])
    
    return str(sum_time)

def read_sub_file(anime_name, file_name):
    global eng_anime_path
    
    sub_list = []
    
    # srt
    try:
        srt_sub_data = None

        with open(eng_anime_path + anime_name + file_name + '.srt', 'r', encoding = 'utf-8') as file_data:
            srt_sub_data = file_data.read()

        srt_sub_list = list(srt.parse(srt_sub_data))

        for srt_sub in srt_sub_list:

            sub = subtime_to_second(srt_sub.start) + '#!#' + subtime_to_second(srt_sub.end) + '#!#' + srt_sub.content

            sub_list.append(sub)

        return sub_list
    
    except Exception as e:
        print(e)
    
    # If there are no "srt" subtitles, look for "ass" subtitles.
    if len(sub_list) == 0:

        try:

            with open(eng_anime_path + anime_name + file_name + '.ass', encoding='utf_16') as f:
                doc = ass.parse(f)

            for ass_sub in doc.events:
                sub = subtime_to_second(ass_sub.start) + '#!#' + subtime_to_second(ass_sub.end) + '#!#' + ass_sub.text
                sub_list.append(sub)

            return sub_list

        except Exception as e:
            print(e)
            return None

async def accept_func(websocket, path):
    while True:
        data = await websocket.recv();# 클라이언트로부터 메시지를 대기한다.
        print("receive : " + data);
        
        io = StringIO(data)
        json_data = json.load(io)
        
        anime_name = json_data['anime_name']
        file_name = json_data['file_name']
        
        text = None
        text = read_sub_file(anime_name, file_name)
                               
        if text != None:
            
            text = '#!!#'.join(text)
            
            text.strip()
            print(anime_name + file_name , '전송 완료!')
            #client_socket.sendall(text.encode(encoding="utf-8"))
            
            await websocket.send(text);# 클라인언트로 echo를 붙여서 재 전송한다.
        else:
            await websocket.send('None');# 클라인언트로 echo를 붙여서 재 전송한다.

nest_asyncio.apply()


# "0.0.0.0" => 서버 pc에 ip 주소를 입력해준다.
# 0000 => 서버 pc에 포트를 입력 해 준다.
start_server = websockets.serve(accept_func, "localhost", 9998);

print('자막 서버 시작')

# 비동기로 서버를 대기한다.
asyncio.get_event_loop().run_until_complete(start_server);
asyncio.get_event_loop().run_forever();


