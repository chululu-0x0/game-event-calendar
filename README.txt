game-event-calendar / top tab main-frame rendering test v10

今回の目的
==============================

frame-tab-active-a1.png ～ a9.png の32px素材はそのまま維持し、
「描画方法」だけ frame-panel-main と同じ方式へ変更しました。

維持しているもの
==============================

--slice-tab: 32px
.top-tab height: 80px

Grid:
32px / 中央 / 32px

つまり、32px素材を使う構造自体は変更していません。


今回変更した部分
==============================

前回は、タブ用画像をすべて

background-size: 32px 32px;

で強制固定していました。

今回は frame-panel-main と同じ方式に戻しています。

通常パーツ:
background-size: 100% 100%;

横辺 2 / 8:
background-repeat: repeat-x;
background-size: auto 100%;

縦辺 4 / 6:
background-repeat: repeat-y;
background-size: 100% auto;

中央 5:
background-repeat: repeat;


確認してほしい部分
==============================

特に、

- 上辺の中央
- 下辺の中央

のぼけ方が変化するか確認してください。

角付近や縦線は今回の比較対象ではありません。


次の切り分け
==============================

この方式でも中央だけぼける場合は、
次にボタン横幅そのものを32pxグリッドへ丸めて、

左32 + 中央32×N + 右32

になるよう調整するのが次の検証候補です。
