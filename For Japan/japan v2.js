// 2023.11.20 14:47 by hahacandy
(function(){
	var vs_video = null
	var subT = null;
	var clickSO = null;
	
	var vid_volume_cookie = null;
	var vid_mute_cookie = null;
	var is_vid_volume_set = false;
	
	var menuClicked = false;
	var sync_sub_second = 0;
	
	var confirm_text = null;
	
	var vs_is_init_set = false;
	var vs_is_init_set_listener = false;
	
	var vs_subtitle_storage = null;
	var vs_subtitles = null;
	
	var latest_volume = '';
	var cnt_change_volume = 0;
	
	var is_while = false;
	
	
	//// main
	setInterval(function () {
		if(is_while == false){
			is_while = true;
			vs_video = window.document.getElementsByTagName('video')[0];
			if(vs_video != null){
				
				if(vs_subtitle_storage == null){
					try{
						get_subtitle();
					}catch{}
				}
				
				if(vs_is_init_set == false){
					
					vs_is_init_set = true;
					set_click_pause_and_play();
					set_video_key_listener();
					set_subtitle_setting();
				}
				
				set_sync_sub_second();
				set_volume();
				close_auto_volume_window();
				
			}else{
				
				init_value();
				set_sort_folder();
			}
		}
		is_while = false;
	}, 100);
	
	
	
	//// functions
	
	function set_sort_folder(){
		//메인 페이지에서 자동으로 폴더별 버튼을 눌러줌
		try{
			
			var main_filter_button = null
			
			for(var i=0; i<30; i++){
				main_filter_button = getElementByXpath('/html/body/div[' +i+ ']/div[2]/div[3]/div[1]/div/div/div[2]/div/div/div/div[2]/div[1]/div/div[1]/div[2]/div[1]/div/table/tbody/tr/td[1]/table/tbody/tr/td/div/div[1]/table/tbody/tr/td[1]/table/tbody/tr/td[1]/span/em/button');
				
				if(main_filter_button != null){
					break;
				}
			}
			
			
			if(confirm_text == null || main_filter_button.textContent != confirm_text){
				main_filter_button.click();
				
				var main_filter_button2_els = document.getElementsByClassName('x-menu x-menu-floating x-layer syno-ux-menu syno-vs2-basic-menu syno-vs2-dropdown-menu no-icon syno-ux-button-menu');
				main_filter_button2_els = main_filter_button2_els[0].childNodes[1];
				var main_filter_button2 = main_filter_button2_els.childNodes[4];
				main_filter_button2.click();
				confirm_text = main_filter_button2.textContent;
			}
			
		}catch{}
	}
	
	function init_value(){
		vs_video = null;
		subT = null;
		clickSO = null;
		vs_is_init_set = false;
		is_vid_volume_set = false;
		menuClicked = false;
		sync_sub_second = 0;
		vs_subtitle_storage = null;
		vs_subtitles = null;
	}
	
	function set_sync_sub_second(){
		try{
			
			var sync_sub_second_el = null
			
			for(var i=0; i<30; i++){
				sync_sub_second_el = getElementByXpath('/html/body/div[' + i + ']/div[9]/div[3]/div[1]/div/div/div/div/div/div/table/tbody/tr/td[1]/input');
				
				if(sync_sub_second_el != null){
					break;
				}
			}

			sync_sub_second = parseFloat(sync_sub_second_el.value);
			
		}catch(error){}
	}
	
	function set_subtitle_setting(){
		//load external subtitle and sync time
		try{
			if(!menuClicked){
				
				
				var menu_button = null;
				
				for(var i=0; i<30; i++){
					menu_button = getElementByXpath("/html/body/div[' + i + ']/div[5]/div[3]/div[1]/div/div/div/div[6]/div[2]/div[3]/span[6]/em/button");
					
					if(menu_button != null){
						break;
					}
				}
				
				menu_button.click();
				
				menuList = document.getElementsByClassName("item vc-ellipsis");
				if(menuList.length > 0){
					for (var i=0; i<menuList.length; i++) {
					  if(menuList[i].textContent.includes("외부 자막") || menuList[i].textContent.includes("外部サブタイトル") || menuList[i].textContent.includes("External subtitles")){
						 menuList[i].click();
					  }
					  menuClicked = true;
					}
					menuWindow = document.getElementsByClassName("syno-ux-button-menu");
					menuWindow = menuWindow[menuWindow.length-1];
					menuWindow.style.visibility = "hidden";
				}

				
				setTimeout(function() {
					
					var menu_button = null;
					
					for(var i=0; i<30; i++){
						menu_button = getElementByXpath("/html/body/div[' + i + ']/div[5]/div[3]/div[1]/div/div/div/div[6]/div[2]/div[3]/span[6]/em/button");
						
						if(menu_button != null){
							break;
						}
					}
	
					menu_button.click();
	
					
					menuList = document.getElementsByClassName("item vc-ellipsis");
					if(menuList.length > 0){
						for (var i=0; i<menuList.length; i++) {
						  if(menuList[i].textContent.includes("자막 동기화") || menuList[i].textContent.includes("サブタイトルを同期") || menuList[i].textContent.includes("Sync subtitles")){
						     menuList[i].click();
						  }
						}
						
						for(var i=0; i<30; i++){
							sync_sub_second_el = getElementByXpath('/html/body/div[' + i + ']/div[9]/div[3]/div[1]/div/div/div/div/div/div/table/tbody/tr/td[1]/input');
							
							if(sync_sub_second_el != null){
								break;
							}
						}
						
						sync_sub_second = parseFloat(sync_sub_second_el.value);
	
						
						menuWindow = document.getElementsByClassName("x-btn syno-vc-button syno-ux-button syno-ux-button-blue x-btn-noicon");
						menuWindow = menuWindow[menuWindow.length-1];
						menuWindow.click();
					}
				
				}, 1500);
								
	
			}
		}catch(error){}
	}
	
	function set_volume(){
		if(is_vid_volume_set == false){
			
			is_vid_volume_set = true;
			
			vid_volume_cookie = getCookie("vvc");
			if(vid_volume_cookie !== null){
				vs_video.volume = vid_volume_cookie;
			}
			vid_mute_cookie = getCookie("vmc");
			if(vid_mute_cookie !== null && vid_mute_cookie === "true"){
				vs_video.muted = true;
			}
			
		}else{
			setCookie("vvc", vs_video.volume, 999);
			setCookie("vmc", vs_video.muted.toString(), 999);
		}
	
	}
	
	function set_click_pause_and_play(){
		subT = document.getElementsByClassName("subtitle");
		subT = subT[subT.length-1];
		try{
			if(subT.getAttribute("class").includes("x-hide-display")){
				clickSO = vs_video;
			}else{
				clickSO = subT;
			}
		}catch{
			clickSO = vs_video;
		}
		clickSO.addEventListener("mousedown", controlPlayer, true);
	}
	
	function set_video_key_listener(){
		
		if(vs_is_init_set_listener == false){
			
			window.addEventListener("keyup", (e) => {
				//console.log(e)
				try{
					if (e.code == "KeyA") {
						if(vs_subtitles == null){
							var preTime = vs_video.currentTime - 3;
							if (preTime > 0) {
								vs_video.currentTime = preTime;
							}
						}else{
							get_video_time('left');
						}
					} else if (e.code == "KeyD") {
						if(vs_subtitles == null){
							var nextTime = vs_video.currentTime + 3;
							if (nextTime+3 < vs_video.duration) {
								vs_video.currentTime = nextTime;
							}
						}else{
							get_video_time('right');
						}
					} else if (e.code == "KeyW") {
						get_video_time('up');
					}
				}catch{}
		
			});
			
			vs_is_init_set_listener = true;
		
		}
			
	}
	
	function get_video_time(mode){
		
		//console.log(mode);
		
	    var vid_current_time = vs_video.currentTime;
		var sub_current_idx = null;
		
	
		if(mode == 'right'){
			for(i=vs_subtitles.length-1;i>0;i--){
			    if(vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second){
					sub_current_idx = i;
		    		break;
			    }
			}
			if(sub_current_idx == null){
				var near_subtitles = [];
				for(i=0;i<vs_subtitles.length;i++){
				    var near_value = vs_subtitles[i].from + sync_sub_second-vid_current_time;
				    if(near_value < 0){
				    	near_subtitles.push(near_value);
				    }
				}
				sub_current_idx = near_subtitles.length-1;
			}
			
			try{
				if (vs_video.paused) {
					vs_video.currentTime = vs_subtitles[sub_current_idx+1].from + sync_sub_second + 0.01;
				}else{
					vs_video.currentTime = vs_subtitles[sub_current_idx+1].from + sync_sub_second;
				}
			}catch{}
		}else if(mode == 'left'){
			for(i=0;i<vs_subtitles.length;i++){
			    if(vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second){
					sub_current_idx = i;
		    		break;
			    }
			}
			if(sub_current_idx == null){
				var near_subtitles = [];
				for(i=0;i<vs_subtitles.length;i++){
				    var near_value = vs_subtitles[i].from + sync_sub_second-vid_current_time;
				    if(near_value > 0){
				    	near_subtitles.push(near_value);
				    }
				}
				sub_current_idx = ((vs_subtitles.length - near_subtitles.length) - 1);
			}
			
			try{
				if (vs_video.paused) {
					vs_video.currentTime = vs_subtitles[sub_current_idx-1].from + sync_sub_second + 0.01;
				}else{
					vs_video.currentTime = vs_subtitles[sub_current_idx-1].from + sync_sub_second;
				}
			}catch{}
		}else if(mode == 'up'){
			for(i=0;i<vs_subtitles.length;i++){
			    if(vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second){
					sub_current_idx = i;
		    		break;
			    }
			}
			if(sub_current_idx == null){
				var near_subtitles = [];
				for(i=0;i<vs_subtitles.length;i++){
				    var near_value = vs_subtitles[i].from + sync_sub_second-vid_current_time;
				    if(near_value < 0){
				    	near_subtitles.push(near_value);
				    }
				}
				sub_current_idx = near_subtitles.length-1;
			}
			
			try{
				if (vs_video.paused) {
					vs_video.currentTime = vs_subtitles[sub_current_idx].from + sync_sub_second + 0.01;
				}else{
					vs_video.currentTime = vs_subtitles[sub_current_idx].from + sync_sub_second;
				}
			}catch{}
		}
	}
	
	function get_subtitle(){
		
		try{
			vs_subtitle_storage = SYNO.ux.ComponentARIA.initList;
		}catch{
			vs_subtitle_storage = Ext.ComponentMgr.all.items;
		}
		
		for (var i = 0; i < vs_subtitle_storage.length; i++) {
			try{
				vs_subtitles = vs_subtitle_storage[i].controller.subtitle_parser.subtitles;
				break;
			}catch{}
		}
	}
	
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
	
	function controlPlayer(e){
		//영상을 마우스로 누르면 멈추거나, 플레이되는데, 자막칸이라면 작동안하게
		if(e.srcElement.className == 'subtitle' || clickSO == vs_video){
			if (!vs_video.paused) {
				vs_video.pause();
			} else {
				vs_video.play();
			}
		}
	}
	
	function close_auto_volume_window(){
		//볼륨 창 켜져있고, 3초동안 볼륨이 안바뀌면 볼륨창 닫음
		try{
			var current_volume = document.getElementsByClassName('volume')[1].style.height;
			if(document.getElementsByClassName('syno-vc-volume-menu')[0].style.visibility == 'visible'){
				if(current_volume == latest_volume){
					cnt_change_volume = cnt_change_volume + 1;
					if(cnt_change_volume >= 30){
						document.getElementsByClassName('syno-vc-volume-menu')[0].style.visibility='hidden';
						cnt_change_volume = 0;
					}
				}else{
					cnt_change_volume = 0;
				}
			}
			latest_volume = current_volume;
		}
		catch{}
	}
})();

///////////////////////////////////////////

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

////////////////////////////////////////////////////
