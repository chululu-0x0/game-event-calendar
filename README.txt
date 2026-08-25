game-event-calendar / compact layout v7

今回の変更
==============================

1. ゲーム外枠の左上
   frame-chip-game-1 → frame-chip-game-4
   に変更して、ゲーム名タブの左縦線から外枠左縦線へ
   そのまま繋がるようにしました。

2. スマホの上下段
   - 左右の枠線を非表示
   - app-shell の左右影も非表示
   - 画面端まで同じ青紫色
   - グラデーションを廃止して単色化

3. 上段をコンパクト化
   - タイトル文字を小さく
   - タイトルアイコンも小さく
   - 開催中 / カレンダーの高さを44px → 32px
   - ヘッダー全体の上下余白を縮小

4. 下段をコンパクト化
   - 約76px → 約54px
   - アイコン30px → 24px
   - スマホではさらに約50px

5. 中央の表示領域を拡大
   上下段を狭めたぶん、中央スクロール領域が広くなります。

6. 開催中のゲーム外枠
   左右に少し余白を追加して、背景が見える範囲を増加。

7. 外枠 ↔ 内側カード
   paddingを縮めて、二重枠の間隔を狭くしました。

8. イベントカード内部
   - 1行の高さを112px → 92px前後
   - アイコン62px → 50px
   - タイトル18px → 16px
   - 各種margin / gapを縮小
   情報をぎゅっと詰めたレイアウトです。

9. イベントカレンダー
   - 「イベントカレンダー」の見出しを削除
   - 「今日へ」ボタンを削除
   - 9-sliceの外枠を削除
   - 中央領域いっぱいに表を表示
   - 左列=ゲームタイトル、上列=日付 の構造は維持


どこを変えるとサイズが変わる？
==============================

■ ゲームイベントメモの文字
.title-row h1 {
  font-size: ...
}

■ タイトル周辺の高さ
.title-row {
  min-height: ...
}

.top-chrome {
  padding: ...
}

■ 上段「開催中 / カレンダー」の縦幅
.top-tab {
  height: 32px;
}

■ 上段ボタンの文字
.top-tab-label {
  font-size: 14px;
}

■ 下段全体の高さ
.bottom-chrome {
  min-height: ...
  padding: ...
}

■ 下段アイコン
.bottom-icon {
  font-size: ...
}

■ 開催中の外枠と画面端の隙間
.game-list {
  padding-left: ...
  padding-right: ...
}

■ 外枠と内側カードの隙間
.game-shell > .frame9-grid > .f5 {
  padding: ...
}

■ イベント1件の高さ
.event-row {
  min-height: ...
  padding: ...
  gap: ...
}

■ イベントアイコン
.event-icon {
  width: ...
  height: ...
}

■ イベントタイトル
.event-title {
  font-size: ...
}

差し替えるファイル
==============================

index.html
style.css
script.js
