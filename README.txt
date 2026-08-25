game-event-calendar / 素材追加調整 v3

今回の反映:
- frame-card-event-1～9：開催中の内側カード
- frame-chip-game-1～9：ゲーム外枠 + 左上のゲーム名タブ
- frame-tab-active-1～9：上段「開催中 / イベントカレンダー」
- lace-line.png：上段と中央の境目にrepeat-x

開催中は、
[chip外枠]
  ├─ 左上にchipタブ
  └─ 内側にevent-card
       └─ イベント内容
という3層構造です。

新素材は8x8なのでCSSでは16px（2倍）で使用しています。
lace-line.png は16x16原寸で横に繰り返しています。

非選択タブはまだ素材がないため、active素材をCSS filterで一時的に淡い青紫へ変換しています。

差し替え:
- index.html
- style.css
- script.js

画像素材はGitHub上の既存ファイルをそのまま参照します。
