(function () {
    var vs_video = null;
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
    var new_subtitle_box = null;
    var subtitle_text_box = null; // 자막 텍스트를 위한 div 추가
    var drag_handle = null; // 드래그 핸들 추가
    
    var last_subtitle = ''; // 마지막 자막을 추적
    
    var soundbar_bottom_limit = 0; // 사운드바의 상단 위치를 저장할 변수

    // 스타일을 head에 추가하여 root에 스타일 지정
    function addSubtitleStyles() {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .subtitle > div {
                text-shadow: black 0px 0px 7px, rgb(0 0 0 / 80%) 0px 0px 18px;
                font-size: calc(18px + 2vw);
            }
        `;
        document.head.appendChild(style);
    }

    addSubtitleStyles(); // 자막 스타일 적용

    //// main
    setInterval(function () {
        if (is_while == false) {
            is_while = true;
            vs_video = window.document.getElementsByTagName('video')[0];
    
            if (vs_video != null) {
    
                if (vs_subtitle_storage == null) {
                    try {
                        get_subtitle();
                    } catch { }
                }
    
                if (vs_is_init_set == false) {
    
                    // 새로운 비디오가 로드될 때 기존 자막창이 있으면 삭제
                    if (new_subtitle_box != null) {
                        new_subtitle_box.remove();
                    }
    
                    vs_is_init_set = true;
                    set_click_pause_and_play();
                    set_video_key_listener();
                    set_subtitle_setting();
                    create_new_subtitle_box(); // 새로운 자막 창 생성
                }
    
                set_sync_sub_second();
                set_volume();
                close_auto_volume_window();
    
                // 자막 업데이트
                update_subtitle();
    
            } else {
                // 비디오 객체가 사라졌을 때 자막창도 삭제
                if (new_subtitle_box != null) {
                    new_subtitle_box.remove();
                    new_subtitle_box = null;
                }
                init_value();
                set_sort_folder();
            }
        }
        is_while = false;
    }, 100);
    
    //// New Subtitle Box Creation
    function create_new_subtitle_box() {
        // 새로운 자막 창을 화면에 추가
        new_subtitle_box = document.createElement('div');
        new_subtitle_box.id = 'custom-subtitle-box'; // ID 추가 (스타일 및 디버깅에 유용)
        new_subtitle_box.style.position = 'fixed'; // fixed로 고정
        new_subtitle_box.style.top = '10%'; // 화면 상단 10%에 위치
        new_subtitle_box.style.left = '50%'; // 가로 중앙 정렬
        new_subtitle_box.style.transform = 'translateX(-50%)'; // 중앙 정렬을 위해 가로 축 이동
        new_subtitle_box.style.backgroundColor = 'rgba(47, 157, 39, 0.5)'; // 지정한 색상과 50% 투명도 적용
        new_subtitle_box.style.color = 'white'; // 텍스트 색상: 흰색
        new_subtitle_box.style.padding = '20px'; // 패딩 추가
        new_subtitle_box.style.fontSize = 'calc(1.5vw + 1.5vh + 2vmin)'; // 창 크기에 따른 폰트 크기 조정
        new_subtitle_box.style.borderRadius = '5px'; // 모서리 둥글게
        new_subtitle_box.style.zIndex = '9999'; // 자막창이 최상단에 위치하도록 z-index 수정
        new_subtitle_box.style.userSelect = 'text'; // 자막 텍스트 드래그 가능하게 설정
        new_subtitle_box.style.display = 'none'; // 자막이 없을 때는 숨김 상태로 시작
    
        // 자막 텍스트를 표시할 박스를 추가
        subtitle_text_box = document.createElement('div');
        subtitle_text_box.style.userSelect = 'text'; // 텍스트만 드래그 가능
        subtitle_text_box.style.whiteSpace = 'pre-wrap'; // 자막 텍스트가 여러 줄일 경우 처리

        new_subtitle_box.appendChild(subtitle_text_box); // 자막창 안에 텍스트 박스를 추가

        document.body.appendChild(new_subtitle_box); // 자막 창을 body에 추가

        // 드래그 핸들 추가 (오른쪽 아래에 위치)
        drag_handle = document.createElement('div');
        drag_handle.style.position = 'absolute';
        drag_handle.style.width = '30px'; // 크기 키움
        drag_handle.style.height = '30px'; // 크기 키움
        drag_handle.style.bottom = '0px';
        drag_handle.style.right = '0px';
        drag_handle.style.backgroundColor = '#5CD1E5'; // 배경색 변경
        drag_handle.style.border = '3px solid #000'; // 검은색 테두리 추가
        drag_handle.style.borderRadius = '50%'; // 둥근 모서리로 변경
        drag_handle.style.cursor = 'move'; // 마우스 커서를 이동 모양으로 설정
        drag_handle.style.zIndex = '10000'; // 최상단으로 위치하도록 z-index 높임

        new_subtitle_box.appendChild(drag_handle); // 자막창에 핸들 추가

        // 드래그 핸들로 위/아래만 이동 가능하게 설정
        drag_handle.onmousedown = dragMouseDown;

        // 사운드바의 상단 위치를 계산
        var soundbar = getElementByXpath('/html/body/div[6]/div[5]/div[3]/div[1]/div/div/div/div[6]');
        if (soundbar) {
            soundbar_bottom_limit = soundbar.getBoundingClientRect().top;
        }
    }
    
    // 자막창 위/아래만 드래그 가능
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
    
        var pos4 = e.clientY; // 세로 위치만 추적

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
    
            var deltaY = e.clientY - pos4;
            pos4 = e.clientY;

            // 현재 자막창 위치와 계산된 이동 후 위치
            var newTop = new_subtitle_box.offsetTop + deltaY;

            // 상단 제한 (0 이상)과 사운드바 상단에 도달하지 않도록 제한
            if (newTop > 0 && (newTop + new_subtitle_box.offsetHeight < soundbar_bottom_limit)) {
                new_subtitle_box.style.top = newTop + "px";
            }

            // 항상 좌우 중앙 정렬 유지
            new_subtitle_box.style.left = '50%';
            new_subtitle_box.style.transform = 'translateX(-50%)'; // 가로 중앙 정렬 유지
        }
    
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function update_subtitle() {
        if (vs_subtitles) {
            var currentTime = vs_video.currentTime; // 현재 재생 중인 시간
            var foundSubtitle = false;
    
            for (var i = 0; i < vs_subtitles.length; i++) {
                var startTime = vs_subtitles[i].from + sync_sub_second; // 자막 시작 시간
                var endTime = vs_subtitles[i].to + sync_sub_second; // 자막 종료 시간
    
                if (currentTime >= startTime && currentTime <= endTime) {
                    // 중복 자막 삽입 방지
                    if (vs_subtitles[i].text !== last_subtitle) {
                        subtitle_text_box.innerHTML = vs_subtitles[i].text; // 자막 텍스트를 새로 추가한 텍스트 박스에 삽입
                        last_subtitle = vs_subtitles[i].text; // 마지막으로 표시된 자막 업데이트
                        new_subtitle_box.style.display = 'block'; // 자막이 있으면 보여줌
                    }
                    foundSubtitle = true;
                    break;
                }
            }
    
            // 자막이 없는 경우 자막창을 숨김
            if (!foundSubtitle) {
                new_subtitle_box.style.display = 'none';
                last_subtitle = ''; // 자막이 없을 때 마지막 자막을 초기화
            }
        }
    }

    function set_sort_folder() {
        // 메인 페이지에서 자동으로 폴더별 버튼을 눌러줌
        try {
            var main_filter_button = null;
    
            for (var i = 0; i < 30; i++) {
                main_filter_button = getElementByXpath('/html/body/div[' + i + ']/div[2]/div[3]/div[1]/div/div/div[2]/div/div/div/div[2]/div[1]/div/div[1]/div[2]/div[1]/div/table/tbody/tr/td[1]/table/tbody/tr/td/div/div[1]/table/tbody/tr/td[1]/table/tbody/tr/td[1]/span/em/button');
    
                if (main_filter_button != null) {
                    break;
                }
            }
    
            if (confirm_text == null || main_filter_button.textContent != confirm_text) {
                main_filter_button.click();
    
                var main_filter_button2_els = document.getElementsByClassName('x-menu x-menu-floating x-layer syno-ux-menu syno-vs2-basic-menu syno-vs2-dropdown-menu no-icon syno-ux-button-menu');
                main_filter_button2_els = main_filter_button2_els[0].childNodes[1];
                var main_filter_button2 = main_filter_button2_els.childNodes[4];
                main_filter_button2.click();
                confirm_text = main_filter_button2.textContent;
            }
    
        } catch { }
    }

    function init_value() {
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

    function set_sync_sub_second() {
        try {
            var sync_sub_second_el = null;
    
            for (var i = 0; i < 30; i++) {
                sync_sub_second_el = getElementByXpath('/html/body/div[' + i + ']/div[9]/div[3]/div[1]/div/div/div/div/div/div/table/tbody/tr/td[1]/input');
    
                if (sync_sub_second_el != null) {
                    break;
                }
            }
            sync_sub_second = parseFloat(sync_sub_second_el.value);
        } catch (error) { }
    }

    function set_subtitle_setting() {
        // 기존 자막 창 숨기기
        try {
            var old_subtitle = getElementByXpath('/html/body/div[6]/div[5]/div[3]/div[1]/div/div/div/div[5]/div[1]/div[2]/div');
            if (old_subtitle) {
                old_subtitle.style.display = 'none';
            }
        } catch (error) { }
    }

    function set_volume() {
        if (is_vid_volume_set == false) {
            is_vid_volume_set = true;
    
            vid_volume_cookie = getCookie("vvc");
            if (vid_volume_cookie !== null) {
                vs_video.volume = vid_volume_cookie;
            }
            vid_mute_cookie = getCookie("vmc");
            if (vid_mute_cookie !== null && vid_mute_cookie === "true") {
                vs_video.muted = true;
            }
        } else {
            setCookie("vvc", vs_video.volume, 999);
            setCookie("vmc", vs_video.muted.toString(), 999);
        }
    
    }

    function set_click_pause_and_play() {
        subT = document.getElementsByClassName("subtitle");
        subT = subT[subT.length - 1];
        try {
            if (subT.getAttribute("class").includes("x-hide-display")) {
                clickSO = vs_video;
            } else {
                clickSO = subT;
            }
        } catch {
            clickSO = vs_video;
        }
        clickSO.addEventListener("mousedown", controlPlayer, true);
    }

    function set_video_key_listener() {
    
        if (vs_is_init_set_listener == false) {
    
            window.addEventListener("keyup", (e) => {
                try {
                    if (e.code == "KeyA") {
                        if (vs_subtitles == null) {
                            var preTime = vs_video.currentTime - 3;
                            if (preTime > 0) {
                                vs_video.currentTime = preTime;
                            }
                        } else {
                            get_video_time('left');
                        }
                    } else if (e.code == "KeyD") {
                        if (vs_subtitles == null) {
                            var nextTime = vs_video.currentTime + 3;
                            if (nextTime + 3 < vs_video.duration) {
                                vs_video.currentTime = nextTime;
                            }
                        } else {
                            get_video_time('right');
                        }
                    } else if (e.code == "KeyW") {
                        get_video_time('up');
                    }
                } catch { }
    
            });
            vs_is_init_set_listener = true;
    
        }
    
    }

    function get_video_time(mode) {
    
        var vid_current_time = vs_video.currentTime;
        var sub_current_idx = null;
    
    
        if (mode == 'right') {
            for (i = vs_subtitles.length - 1; i > 0; i--) {
                if (vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second) {
                    sub_current_idx = i;
                    break;
                }
            }
            if (sub_current_idx == null) {
                var near_subtitles = [];
                for (i = 0; i < vs_subtitles.length; i++) {
                    var near_value = vs_subtitles[i].from + sync_sub_second - vid_current_time;
                    if (near_value < 0) {
                        near_subtitles.push(near_value);
                    }
                }
                sub_current_idx = near_subtitles.length - 1;
            }
    
            try {
                if (vs_video.paused) {
                    vs_video.currentTime = vs_subtitles[sub_current_idx + 1].from + sync_sub_second + 0.01;
                } else {
                    vs_video.currentTime = vs_subtitles[sub_current_idx + 1].from + sync_sub_second;
                }
            } catch { }
        } else if (mode == 'left') {
            for (i = 0; i < vs_subtitles.length; i++) {
                if (vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second) {
                    sub_current_idx = i;
                    break;
                }
            }
            if (sub_current_idx == null) {
                var near_subtitles = [];
                for (i = 0; i < vs_subtitles.length; i++) {
                    var near_value = vs_subtitles[i].from + sync_sub_second - vid_current_time;
                    if (near_value > 0) {
                        near_subtitles.push(near_value);
                    }
                }
                sub_current_idx = ((vs_subtitles.length - near_subtitles.length) - 1);
            }
    
            try {
                if (vs_video.paused) {
                    vs_video.currentTime = vs_subtitles[sub_current_idx - 1].from + sync_sub_second + 0.01;
                } else {
                    vs_video.currentTime = vs_subtitles[sub_current_idx - 1].from + sync_sub_second;
                }
            } catch { }
        } else if (mode == 'up') {
            for (i = 0; i < vs_subtitles.length; i++) {
                if (vs_subtitles[i].from + sync_sub_second <= vid_current_time && vid_current_time < vs_subtitles[i].to + sync_sub_second) {
                    sub_current_idx = i;
                    break;
                }
            }
            if (sub_current_idx == null) {
                var near_subtitles = [];
                for (i = 0; i < vs_subtitles.length; i++) {
                    var near_value = vs_subtitles[i].from + sync_sub_second - vid_current_time;
                    if (near_value < 0) {
                        near_subtitles.push(near_value);
                    }
                }
                sub_current_idx = near_subtitles.length - 1;
            }
    
            try {
                if (vs_video.paused) {
                    vs_video.currentTime = vs_subtitles[sub_current_idx].from + sync_sub_second + 0.01;
                } else {
                    vs_video.currentTime = vs_subtitles[sub_current_idx].from + sync_sub_second;
                }
            } catch { }
        }
    }

    function get_subtitle() {
        try {
            vs_subtitle_storage = SYNO.ux.ComponentARIA.initList;
        } catch {
            vs_subtitle_storage = Ext.ComponentMgr.all.items;
        }
    
        for (var i = 0; i < vs_subtitle_storage.length; i++) {
            try {
                vs_subtitles = vs_subtitle_storage[i].controller.subtitle_parser.subtitles;
                break;
            } catch { }
        }
    }

    var setCookie = function (name, value, exp) {
        var date = new Date();
        date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    };
    var getCookie = function (name) {
        var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return value ? value[2] : null;
    };
    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function controlPlayer(e) {
        // 영상을 마우스로 누르면 멈추거나, 플레이되는데, 자막칸이라면 작동안하게
        if (e.srcElement.className == 'subtitle' || clickSO == vs_video) {
            if (!vs_video.paused) {
                vs_video.pause();
            } else {
                vs_video.play();
            }
        }
    }

    function close_auto_volume_window() {
        try {
            var current_volume = document.getElementsByClassName('volume')[1].style.height;
            if (document.getElementsByClassName('syno-vc-volume-menu')[0].style.visibility == 'visible') {
                if (current_volume == latest_volume) {
                    cnt_change_volume = cnt_change_volume + 1;
                    if (cnt_change_volume >= 30) {
                        document.getElementsByClassName('syno-vc-volume-menu')[0].style.visibility = 'hidden';
                        cnt_change_volume = 0;
                    }
                } else {
                    cnt_change_volume = 0;
                }
            }
            latest_volume = current_volume;
        } catch { }
    }
})();
