var vs_video = null
var subT = null;
var clickSO = null;

var vid_volume_cookie = null;
var vid_mute_cookie = null;
var is_vid_volume_set = false;

var vs_is_init_set = false;
var vs_is_init_set_listener = false;

var vs_subtitle_storage = null;
var vs_subtitles = null;

//// main
setInterval(function () {
	
	try{
		vs_video = window.document.getElementsByTagName('video')[0]
		
		try{
			get_subtitle(vs_subtitle_storage);
		}catch{}
		
		if(vs_is_init_set == false){
			
			vs_is_init_set = true;
			set_click_pause_and_play();
			set_video_key_listener();

		}
		
		set_volume();
		
	}catch{
		vs_video = null;
		subT = null;
		clickSO = null;
		vs_is_init_set = false;
		is_vid_volume_set = false;
	}
	
}, 1000);



//// functions

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
				if (e.key == "4" && e.code == "Numpad4" || e.code == "KeyA") {
					if(vs_subtitles == null){
						var preTime = vs_video.currentTime - 3;
						if (preTime > 0) {
							vs_video.currentTime = preTime;
						}
					}else{
						get_video_time('left');
					}
				} else if (e.key == "6" && e.code == "Numpad6" || e.code == "KeyD") {
					if(vs_subtitles == null){
						var nextTime = vs_video.currentTime + 3;
						if (nextTime+3 < vs_video.duration) {
							vs_video.currentTime = nextTime;
						}
					}else{
						get_video_time('right');
					}
				} else if (e.key == "8" && e.code == "Numpad8" || e.code == "KeyW") {
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
	
	for(i=0;i<vs_subtitles.length;i++){
	    if(vs_subtitles[i].from <= vid_current_time && vid_current_time < vs_subtitles[i].to){
			sub_current_idx = i;
    		break;
	    }
	}
	
	if(mode == 'right'){
		if(sub_current_idx == null){
			var near_subtitles = [];
			for(i=0;i<vs_subtitles.length;i++){
			    var near_value = vs_subtitles[i].from-vid_current_time;
			    if(near_value < 0){
			    	near_subtitles.push(near_value);
			    }
			}
			sub_current_idx = near_subtitles.length-1;
		}
		
		try{
			vs_video.currentTime = vs_subtitles[sub_current_idx+1].from;
		}catch{}
	}else if(mode == 'left'){
		if(sub_current_idx == null){
			var near_subtitles = [];
			for(i=0;i<vs_subtitles.length;i++){
			    var near_value = vs_subtitles[i].from-vid_current_time;
			    if(near_value > 0){
			    	near_subtitles.push(near_value);
			    }
			}
			sub_current_idx = ((vs_subtitles.length - near_subtitles.length) - 1);
		}
		
		try{
			vs_video.currentTime = vs_subtitles[sub_current_idx-1].from;
		}catch{}
	}else if(mode == 'up'){
		if(sub_current_idx == null){
			var near_subtitles = [];
			for(i=0;i<vs_subtitles.length;i++){
			    var near_value = vs_subtitles[i].from-vid_current_time;
			    if(near_value < 0){
			    	near_subtitles.push(near_value);
			    }
			}
			sub_current_idx = near_subtitles.length-1;
		}
		
		try{
			vs_video.currentTime = vs_subtitles[sub_current_idx].from;
		}catch{}
	}
	
}

function get_subtitle(vs_subtitle_storage){
	
	vs_subtitle_storage = null;
	vs_subtitles = null;
	
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

function controlPlayer(e){
	if(e.path.length == 14 || clickSO == vs_video){
		if (!vs_video.paused) {
			vs_video.pause();
		} else {
			vs_video.play();
		}
	}
}

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