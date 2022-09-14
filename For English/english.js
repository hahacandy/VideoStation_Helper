//able drag
(function () {
    if (window.subvaAllowRightClick === undefined) {
        // https://greasyfork.org/en/scripts/23772-absolute-enable-right-click-copy/code
        window.subvaAllowRightClick = function (dom) {
            (function GetSelection() {
                var Style = dom.createElement('style');
                Style.type = 'text/css';
                var TextNode = '*{user-select:text!important;-webkit-user-select:text!important;}';
                if (Style.styleSheet) {
                    Style.styleSheet.cssText = TextNode;
                }
                else {
                    Style.appendChild(dom.createTextNode(TextNode));
                }
                dom.getElementsByTagName('head')[0].appendChild(Style);
            })();

        };
        function runAll(w) {
            try {
                window.subvaAllowRightClick(w.document);
            } catch (e) {
            }
            for (var i = 0; i < w.frames.length; i++) {
                runAll(w.frames[i]);
            }
        }
    }	
    runAll(window);
})();

// set video(save volume, click video pause)
var setCookie = function(name, value, exp) {
	var date = new Date();
	date.setTime(date.getTime() + exp*24*60*60*1000);
	document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
};
var getCookie = function(name) {
	var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value? value[2] : null;
};

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

var vid = null;
var subT = null;
var clickSO = null;
var clickSOOri = null;
var videoFound = false;
var vid_volume_cookie = null;
var vid_mute_cookie = null;
var menuList = null;
var menuClicked = false;
var menuWindow = null;

function controlPlayer(e){
	if(e.path.length == 14 || clickSO == vid){
		if (!vid.paused) {
			vid.pause();
		} else {
			vid.currentTime = vid.currentTime +0.1;
			vid.play();
		}
	}
}

function setVideo(){
	vid = document.getElementsByTagName('video')
	if (vid.length === 0) {
		console.log("finding player...");
		subT = null;
		videoFound = false;
		clickSO = null;
		clickSOOri = null;
	}else{
	
		vid = vid[0];
		
		subT = document.getElementsByClassName("subtitle");
		subT = subT[subT.length-1]
		if(subT.getAttribute("class").includes("x-hide-display")){
			clickSO = vid;
		}else{
			clickSO = subT;
		}
		if(!videoFound){
			videoFound = true;
			console.log("player find!");
			
			vid_volume_cookie = getCookie("vvc");
			if(vid_volume_cookie !== null){
				vid.volume = vid_volume_cookie;
			}
			vid_mute_cookie = getCookie("vmc");
			if(vid_mute_cookie !== null && vid_mute_cookie === "true"){
				vid.muted = true;
			}
			//clickScreen playerControl
			clickSOOri = clickSO;
			clickSO.addEventListener("mousedown", controlPlayer, true);
			//
			menuClicked = false;
		}else{
			if(clickSOOri != clickSO){
				//clickScreen playerControl
				clickSOOri = clickSO;
				clickSO.addEventListener("mousedown", controlPlayer, true);
				
			}
		}
		setCookie("vvc", vid.volume, 999);
		setCookie("vmc", vid.muted.toString(), 999);
		//If subtitles are applied, turn them off.
		try{
			if(!menuClicked){
				try{
					getElementByXpath("/html/body/div[10]/div[5]/div[3]/div[1]/div/div/div/div[6]/div[2]/div[3]/span[6]/em/button").click();
				}catch(error){}

				
				
				menuList = document.getElementsByClassName("item vc-ellipsis");
				if(menuList.length > 0){
					for (var i=0; i<menuList.length; i++) {
					  if(menuList[i].textContent.includes("자막 없음") || menuList[i].textContent.includes("サブタイトルなし")){
					     menuList[i].click();
					  }
					  menuClicked = true;
					}
					
			
					menuWindow = document.getElementsByClassName("syno-ux-button-menu");
					menuWindow = menuWindow[menuWindow.length-1]
					menuWindow.style.visibility = "hidden";
				}
			}
		}catch(error){}
	}
}
setInterval(setVideo, 1000);


//add player option
function beep() {
	var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
	snd.play();
}


var server_ip = '192.168.0.6'

//자막 가져오기
var webSocket = new WebSocket('ws://' + server_ip + ':9998');
var is_use_socket = false;

var sub_datas = '';

var late_file_name = '';

var sync_sub_second = 0;

function set_wsk(webSocket){
	
	webSocket.onclose = function(event) {
		onClose(event)
	};

	webSocket.onopen = function(event) {
		onOpen(event)
	};

	webSocket.onmessage = function(event) {
		onMessage(event)
	};
	
}

function onMessage(event) {
	if(!event.data.toString().includes('Could not read from Socket') && event.data.toString() != 'None'){
		sub_datas = event.data.toString();
	}
    is_use_socket = false;
}

function onOpen(event) {
	console.log('자막서버 연결 완료');
}

function onClose(event) {
	console.log('자막서버 접속 중');
	webSocket = new WebSocket('ws://' + server_ip + ':9998');
	setTimeout(set_wsk, 1000, webSocket)
}

function send(data) {
	
	if(!is_use_socket){
		is_use_socket = true;

		webSocket.send(JSON.stringify(data));
	}
}

set_wsk(webSocket);


function get_sub(){

	try{
		var data = new Object() ;
		
		folder_name = document.getElementsByClassName('list-template selected')[0].textContent
		
		path_names = getElementByXpath('/html/body/div[10]/div[2]/div[3]/div[1]/div/div/div[2]/div/div/div/div[2]/div[1]/div/div[1]/div[2]/div[1]/div/table/tbody/tr/td[1]/table/tbody/tr/td/div/div[2]/table/tbody/tr/td[1]/table/tbody/tr').childNodes;
		
		path_name = '';
		
		file_name = '';
		
	    for (var i = 1; i < path_names.length; i++) { 
	    	
	    	temp_path_name = path_names[i].textContent;
	    	if(temp_path_name.includes('.mp4') == false){
	    		path_name = path_name + temp_path_name + '/';
	    	}else{
	    		file_name = temp_path_name.replace('.mp4', '');
	    	}
	    	
	    	
	    }
	    

		data.anime_name = folder_name + '/' +  path_name
		data.file_name = file_name;
		
		if(late_file_name != data.file_name){
			send(data);
			late_file_name = data.file_name;
			sync_sub_second = 0;
		}

	}catch(error){}

}

setInterval(get_sub, 1000);

function get_video_time(mode){
	

	var sub_list = sub_datas.split('#!!#');
	
	var vid_time = vid.currentTime;
	

	for(var i=0; i<sub_list.length; i++){
		
		sub_data  = sub_list[i].split('#!#');
		
		temp_time_start = parseFloat(sub_data[0]) + sync_sub_second;
		temp_time_end = parseFloat(sub_data[1]) + sync_sub_second;

		

		if(vid_time < temp_time_start){
			
			if(mode == 'left' && i > 1){
		
				previous_sub_data = sub_list[i-2].split('#!#');

				vid.currentTime = parseFloat(previous_sub_data[0]) + sync_sub_second + 0.1;
				vid.play();
				break;
			
			}else if(mode == 'right'){
			
				next_sub_data = sub_list[i].split('#!#');

				vid.currentTime = parseFloat(next_sub_data[0]) + sync_sub_second + 0.1;
				vid.play();
				break;
				
			}else if(mode == 'down'){
				
				current_sub_data = sub_list[i-1].split('#!#');

				vid.currentTime = parseFloat(current_sub_data[0]) + sync_sub_second;
				vid.play();
				break;
			
			}
							
		}
				
			
	}


}

function set_player(){
	
	if (vid != null) {

		
		window.addEventListener("keyup", (e) => {
			console.log(e)
			if (e.key == "4" && e.code == "Numpad4" || e.code == "KeyA") {
				get_video_time('left');
			} else if (e.key == "6" && e.code == "Numpad6" || e.code == "KeyD") {
				get_video_time('right');
			} else if ((e.key == "0" && e.code == "Numpad0")) {
				if (!vid.paused) {
					vid.pause();
				} else {
					vid.currentTime = vid.currentTime +0.1;
					vid.play();
				}
			}else if (e.key == "8" && e.code == "Numpad8") {

				try {
					vid.volume = vid.volume + 0.1;

				} catch (e) {
					vid.volume = 1;
					beep();
				}
			} else if (e.key == "2" && e.code == "Numpad2") {
				get_video_time('down');
			}

		});
	
	}else{
		setTimeout(set_player, 1000);
	}

}
setTimeout(set_player, 1000);

//手動で字幕のsyncが調整されていたら対応する、しかし一度設定の同期画面を表す必要あり
function set_sync_sub_second(){
	try{
		sync_sub_second = parseFloat(getElementByXpath('/html/body/div[10]/div[9]/div[3]/div[1]/div/div/div/div/div/div/table/tbody/tr/td[1]/input').value)
	}catch(error){}
}
setInterval(set_sync_sub_second, 1000);




//英語の字幕欄追加

var webSocket2 = new WebSocket('ws://' + server_ip + ':9999');
var is_use_socket2 = false;

function set_wsk2(webSocket2){

	webSocket2.onclose = function(event) {
		onClose2(event)
	};

	webSocket2.onopen = function(event) {
		onOpen2(event)
	};

	webSocket2.onmessage = function(event) {
		onMessage2(event)
	};
	
}

function onMessage2(event) {

	if(!event.data.toString().includes('Could not read from Socket') && event.data.toString() != 'None'){
		
		try{
			var trans_sub = document.getElementById('trans_sub');
			trans_sub.innerHTML = '<br>' + event.data.toString();ㅇ
			
		}catch(error){}
		
	}
    is_use_socket2 = false;
}

function onOpen2(event) {
	console.log('번역서버 연결 완료');
}

function onClose2(event) {
	console.log('번역서버 접속 중');
	webSocket2 = new WebSocket('ws://' + server_ip + ':9999');
	setTimeout(set_wsk2, 1000, webSocket2)
}

function send2(msg) {
	
	if(!is_use_socket2){
		is_use_socket2 = true;
		
		var data = new Object() ;
		
		data.msg = msg;
		data.output_lng = 'ja'; //ko ja

		webSocket2.send(JSON.stringify(data));
	}
}

set_wsk2(webSocket2);

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


var late_eng_sub = '';
function set_trans_sub(){
	
	//create trans sub
	try{
		var subtitle_el = document.getElementsByClassName('subtitle')[1];
		if(subtitle_el.childElementCount == 1){
			
			var textnode = htmlToElement("<span id='trans_sub' style='background-color: rgba(0, 128, 0, 0.75);padding:5px;'></span>");
			
			document.getElementsByClassName('subtitle')[1].appendChild(textnode);
			
			
			var eng_sub_el = subtitle_el.childNodes[0];
			
			eng_sub_el.style.marginBottom='5px';
			eng_sub_el.style.padding='5px';
		}
		
	}catch(error){}	
	
	//show and hide trans_sub
	
	try{
		var subtitle_el = document.getElementsByClassName('subtitle')[1];
		var eng_sub = subtitle_el.childNodes[0];
		var trans_sub = document.getElementById('trans_sub');
		
		var eng_sub_text = subtitle_el.childNodes[0].textContent;
		if(late_eng_sub != eng_sub_text){
			send2(eng_sub_text);
		}
		late_eng_sub = eng_sub_text;
		

		if(subtitle_el.childNodes[0].textContent == ' '){
			trans_sub.style.display = 'none';
			trans_sub.textContent = '';
		}else{
			eng_sub.style.backgroundColor='rgba(0, 128, 0, 0.75)';
			trans_sub.style.backgroundColor='rgba(0, 128, 0, 0.75)';
			trans_sub.style.display = '';
		}

		
	}catch(error){}
	
}
setInterval(set_trans_sub, 100);


//こっちで字幕を表現する（次の字幕に行く前に止めるため）
var current_sub_start_time = 0;
var current_sub_end_time = 0;
var current_sub_text = '';
function get_current_sub(){
	
	try{
		
		var sub_list = sub_datas.split('#!!#');
		
		var vid_time = vid.currentTime;
		
		var subtitle_el = document.getElementsByClassName('subtitle')[1];
		
		var eng_sub_el = subtitle_el.childNodes[0];
		var trans_sub_el = subtitle_el.childNodes[1];
		
		var is_find_sub = false
		
		
		
		for(var i=0; i<sub_list.length; i++){
			
			sub_data  = sub_list[i].split('#!#');
			
			var temp_time_start = parseFloat(sub_data[0]) + sync_sub_second;
			var temp_time_end = parseFloat(sub_data[1]) + sync_sub_second;
			
			
			

			if(temp_time_start < vid_time && vid_time <= temp_time_end){


				is_find_sub= true;
			

				break;


			}
			
		}
		
		if(current_sub_end_time != 0 ){
			if(vid_time.toFixed(1) == current_sub_end_time.toFixed(1)){
				vid.pause();
				vid.currentTime = current_sub_end_time;
				
				eng_sub_el.style.backgroundColor='rgba(107, 153, 0, 0.75)';
				trans_sub_el.style.backgroundColor='rgba(107, 153, 0, 0.75)';
			}
		}

		
		if(is_find_sub == false){
			if(vid.paused == false){
				subtitle_el.className = 'subtitle x-hide-display';
			}
			
		}else{
				
			current_sub_start_time = temp_time_start;
			current_sub_end_time = temp_time_end;
			current_sub_text = sub_data[2];
			
			eng_sub_el.textContent = current_sub_text;
			
			subtitle_el.style.lineHeight = subtitle_el.style.fontSize;
			subtitle_el.className = 'subtitle';
		}
	
	}catch(error){}
	
}
setInterval(get_current_sub, 50);