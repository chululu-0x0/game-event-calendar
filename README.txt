game-event-calendar / top-tab a-image 16px v8b

今回の変更
==============================

上段の「開催中 / イベントカレンダー」ボタンだけ、
9分割サイズを 8px 扱いから 16px 扱いへ変更しました。

変更内容
==============================

style.css 内の変数:

--slice-tab: 8px;
↓
--slice-tab: 16px;

これにより、
frame-tab-active-a1.png ～ a9.png を
16px 素材として等倍で使用します。

それ以外のレイアウトやイベント一覧、カレンダー部分は
v8 から変更していません。

差し替えるファイル
==============================

index.html
style.css
script.js
README.txt
