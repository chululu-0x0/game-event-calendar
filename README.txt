game-event-calendar / Pixel Frame v3

今回の修正:
1. 大枠の角に出ていた隙間を修正
   - 外側を4px刻み3段
   - 内側を3px inset + 3px刻み3段
   - 外側と内側の階段位置が同じ座標に揃うように変更

2. アイコン・ボタンの角が消える問題を修正
   - inset box-shadow 方式を廃止
   - 小さい要素も「外側の枠 + 内側の面」の2レイヤーで描画
   - 2段のピクセル角に統一

差し替え:
GitHub の pixel-corners.css を、このZIP内の pixel-corners.css で上書きしてください。

index.html / style.css / script.js は今回は変更不要です。
