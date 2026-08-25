game-event-calendar / frame-panel-main 1〜9 対応版

■ 今回の前提
ユーザーが用意した枠画像は、以下の命名で 1〜9 を左上から右へ並べると枠になる構成です。

assets/ui/frames/
  frame-panel-main-1.png
  frame-panel-main-2.png
  frame-panel-main-3.png
  frame-panel-main-4.png
  frame-panel-main-5.png
  frame-panel-main-6.png
  frame-panel-main-7.png
  frame-panel-main-8.png
  frame-panel-main-9.png

並び順:
1 2 3
4 5 6
7 8 9

■ この版でやったこと
- 大きいパネル枠を 9分割画像で構成
- ヘッダー / 本日 / ゲームグループ / イベントカード / カレンダー外枠 / 詳細パネルに適用
- ボタンも同じ画像セットを使って簡易的に構成
- image-rendering: pixelated を付与

■ 重要
今回は「お試し版」として、枠画像はすべて frame-panel-main-1〜9 を共用しています。
このため、ボタンに少し大きすぎる・中央の伸び方が想定と違う可能性があります。
まずは表示確認用として使ってください。

■ 配置場所
GitHub Pages 側では以下のように置いてください。

game-event-calendar/
  index.html
  style.css
  script.js
  assets/
    ui/
      frames/
        frame-panel-main-1.png
        ...
        frame-panel-main-9.png

■ 次に詰めると良さそうな点
1. ボタン用に別画像を作るかどうか
2. frame-panel-main-5.png（中央面）をタイル想定にするか単色にするか
3. frame-size / frame-btn-size の値調整
