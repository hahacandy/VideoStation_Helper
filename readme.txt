Synology の　VideoStation で字幕を見やすくする機能

DSM 7.1
VideoStationバージョン：3.0.4-2107
VideoStationで”フォルダ別”にする必要がある

"For Japan"の機能
音量の記憶
該当の字幕があれば自動で適用
numpadを使って　前、今、後　の字幕に便利に移動できる

"For English"の機能
"For Japan"を持ちながら英語の翻訳機能を搭載
当時の字幕が終わればそのまま停止、再び再生するには"画面クリック"または"numpad0 押し"  が必要

pip install selenium webdriver_manager nest_asyncio asyncio websockets srt ass webvtt-py



chromeの場合は
https://www.damirscorner.com/blog/posts/20210528-AllowingInsecureWebsocketConnections.html
このurlの通りに設定する必要あり(Insecure content 設定をオフ、videostationサイトだけ)