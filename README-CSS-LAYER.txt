CSS-LAYER EXPERIMENT 1
==========================

これは現在の game-event-calendar v42 を基準にした「構造比較用」の実験版です。
GitHub main の script.js / index.html / style.css のSHAと、手元v42 ZIPのgit blob SHAが一致することを確認してから作成しています。

今回変えた考え方
----------------
従来:
  TABLEそのものが 9分割画像の枠・幅・高さ・中身の領域を作る。

実験版:
  普通のCSSの箱 (.pixel-box) が幅・高さ・余白・スクロールを作る。
  PNGは .pixel-skin として position:absolute で上に重なるだけ。
  PNGを消しても、箱やスクロール自体は崩れない構造。

Safariのドットぼけ対策
----------------------
CSS主体にしても、横辺・縦辺・角は実際の <img> を整数倍で並べています。
background-repeatだけへ戻していないので、過去に起きたSafariの横線ぼけを避ける狙いです。
中央5番だけは装飾レイヤー内のbackgroundとして敷いています。

見るファイル
------------
pixel-ui.css
  新しい枠システムをまとめています。
  枠の太さ、padding、モーダルやボタンの箱サイズを触る場所です。

script.js
  pixelSkinMarkup() = 画像だけの装飾レイヤー
  pixelBoxMarkup()  = CSS箱 + 装飾レイヤー + 内容

index.html
  上段タブの巨大な9分割TABLEを削除し、空の .pixel-tab-skin だけにしています。

素材
----
このZIPには従来どおり画像素材そのものは含めていません。
新しい試験用リポジトリには、元のリポジトリから assets/ui/ をそのままコピーしてください。
現在参照する主な場所:
  assets/ui/frames/
  assets/ui/button/
  assets/ui/icon/

※これは比較テスト用です。実機iPhone Safariでの表示確認は行っていません。


[v2 adjustments]
- Top tabs switched to assets/ui/button/minidot-button-pink-on-1..9
- Fetch progress/result inner frames switched to assets/ui/frames/minidot-8pink-1..9
- Fetch sheet negative bleed removed; content padding/z-index adjusted to prevent content clipping under frame art.
