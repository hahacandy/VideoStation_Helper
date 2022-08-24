from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
from urllib import parse
import nest_asyncio
import asyncio              # 웹 소켓 모듈을 선언한다.
import websockets           # 클라이언트 접속이 되면 호출된다.
import json
from io import StringIO




def driver_set():
    option = webdriver.ChromeOptions()

    option.add_argument('--start-maximized')
    option.add_argument("disable-gpu")
    option.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
    option.add_argument("lang=ko_KR") # 한국어!
    
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=option)
    return driver
    
def set_trans_hompage():
    driver = driver_set()
    driver.implicitly_wait(3)
    driver.get('https://papago.naver.com/?sk=auto&tk=ko')
    return driver


def trans_text(query, driver):
    
    input_lng = None
    output_lng = None
    input_msg = None
    
    io = StringIO(query)
    json_data = json.load(io)
    
    query = json_data['msg']

    input_lng = 'auto'
    output_lng = 'ko'
    input_msg = query.strip()

    if len(input_msg) == 0:
        return None
    
    url = 'https://papago.naver.com/?'

    query = {'sk':input_lng, 'tk':output_lng, 'st':input_msg}
    result = parse.urlencode(query, doseq=True).replace('+','%20')
        
    driver.get(url+result)
    try:
        input_el = driver.find_element(By.XPATH,'//*[@id="txtSource"]')

        while True:
            if '감지된 언어가 없습니다.' in driver.find_element(By.XPATH,'//*[@id="root"]').text:
                return None
            else:
                output_el = driver.find_element(By.XPATH,'//*[@id="txtTarget"]')
                out_text = output_el.text
                if len(out_text)>0:
                    break
    except:
        print(3)
        return None
    

    return out_text.replace('\n', ' ').strip()
        
        
        
        
        

async def accept_func(websocket, path):
    while True:
        data = await websocket.recv();# 클라이언트로부터 메시지를 대기한다.
        print("receive : " + data);
        text = None
        text = trans_text(data, driver)
        print(text)
                                   
        if text != None:
            text.strip()
            print(data + '->' + text)
            #client_socket.sendall(text.encode(encoding="utf-8"))
            
            await websocket.send(text);# 클라인언트로 echo를 붙여서 재 전송한다.
        else:
            await websocket.send('None');# 클라인언트로 echo를 붙여서 재 전송한다.
            





driver = set_trans_hompage()

nest_asyncio.apply()


# "0.0.0.0" => 서버 pc에 ip 주소를 입력해준다.
# 0000 => 서버 pc에 포트를 입력 해 준다.
start_server = websockets.serve(accept_func, "localhost", 9999);

# 비동기로 서버를 대기한다.
asyncio.get_event_loop().run_until_complete(start_server);
asyncio.get_event_loop().run_forever();

########################




