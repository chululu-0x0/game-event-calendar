Game Event Calendar v25
===========================

GitHub main の v24（index.html / style.css / script.js）を基準にした更新版です。

【PWA側の変更】
- 原神 / スターレイル / ゼンゼロ / アークナイツ / FF14 を固定URLからSupabase中継で取得
- 更新画面を高さ90dvhに固定
- アコーディオン展開時も更新画面本体の高さは変わらず、中だけスクロール
- 前回と完全に同じイベントは取得候補から除外
- 同名イベントの取得内容が変化した場合のみ「更新」表示
- 開催中一覧の左アイコン（仮の鉛筆マーク付き）からイベント編集
- 詳細画面に鉛筆の編集ボタンを追加
- イベント名 / 種類 / 限定報酬 / 開始・終了日時 / 元表記 / メモ / 出典URL を編集可能
- ダブルタップ拡大を抑制
- スクロールバーを全画面で非表示（スクロール機能は維持）
- カレンダーの左端を常に今日に固定
- 今日から30日先まで表示
- カレンダーバーをコンパクト化
- イベントごとに専用レーンを割り当て、バー同士の重なりを防止
- イベント数に応じてゲームタイトル枠とカレンダー行の高さを拡張
- 縦スクロール操作は左のゲームタイトル欄のみ。右カレンダーは同期して上下移動
- 開始または終了が「Ver.○○アップデート後 / Ver.○○終了まで」等で絶対日時不明でも保存可能
  （絶対日時が不足するイベントはカレンダーのバー表示からは除外）

【固定取得元】
原神
https://wikiwiki.jp/genshinwiki/イベント一覧

スターレイル
https://wikiwiki.jp/star-rail/イベント

ゼンレスゾーンゼロ
https://wikiwiki.jp/zenless/イベント

アークナイツ
https://arknights.wikiru.jp/?イベント一覧

FF14
https://game8.jp/ff14/296664

【重要：先にSupabaseを更新】
supabase/fetch-wiki-events/index.ts
の中身を、Supabase Dashboard の
Edge Functions > fetch-wiki-events
の index.ts に丸ごと貼り替えて Deploy function してください。

Verify JWT は v21 でOFFにした状態をそのまま維持してください。

新しいEdge FunctionはPOST Bodyでゲームを指定します。

原神:
{"game":"genshin"}

スターレイル:
{"game":"starrail"}

ゼンゼロ:
{"game":"zzz"}

アークナイツ:
{"game":"arknights"}

FF14:
{"game":"ff14"}

各Testで
"ok": true
と events 配列が返ることを確認してください。

※ FF14 Wiki は外部アクセスに403を返す構成になる場合があります。
   Edge Functionでも403になる場合は、PWA側ではなくFF14用取得方法だけ追加調整します。
   その場合はTest結果をそのまま共有してください。

【GitHubへ反映するファイル】
Supabase側のDeploy確認後、GitHub main の以下3ファイルをv25版で置き換えます。
- index.html
- style.css
- script.js

assets は変更していません。


v23 更新画面
- 上段: チェック進捗（全体進捗・全ゲームチェック・個別ゲームチェック・完了/チェック中/待機中/エラー）
- 下段: チェック結果（新規/変更・イベント名・日時のみ）
- 日時の編集は取得時には行わず、登録後のイベント編集へ統一
- 下部は「選択したイベントを登録（n件）」のみ


v24 更新内容
- 更新画面を95dvhへ拡大
- チェック進捗を折りたたみ式に変更。閉じるとタイトル行だけ残り、結果一覧を広く表示
- チェック進捗／チェック結果の見出しを小型化
- 登録済みで内容が完全一致するイベントは候補から自動除外
- 登録済み同名イベントと内容が異なる場合だけ「変更」候補として表示
- 登録時にチェックを外した候補は、その内容のfingerprintをlocalStorageへ保存し、次回以降同一内容なら自動除外
- 除外済みイベントの内容がWiki側で変化した場合は別fingerprintとなるため再び候補に表示


v25 更新内容
- 更新画面の×ボタンを進捗枠から分離し、×の下にチェック進捗を配置
- 更新画面の外枠／チェック進捗／各ゲーム結果／候補一覧のフレームを minidot-8 の16px TABLEフレームへ統一
- カレンダー画面では中央全体の縦スクロールを停止。左ゲーム欄だけ上下、右カレンダーだけ左右に操作可能
- 左ゲーム欄の縦移動を右カレンダー本文へ同期。日付ヘッダーは常時固定
- iOS等で端まで引っ張った時のラバーバンド（overscroll）を抑制
- カレンダーのゲーム名を横並び中央揃えにし、幅に応じて文字サイズを自動縮小
- カレンダー行を少し高く、イベントバーと文字をコンパクト化。イベントは開催中と同じ順序で1イベント1レーン
- 今日を示す縦線を削除
- 開催中の「進行度 xx%」文字を削除。残り期間バーは右端を固定し、左側から減る表現へ変更
- 開催中の更新ボタン左に「追加」を追加。既存の編集フォームを利用して手動イベントを追加可能


v26 changes:
- Inset fixed minidot outer frames for update and add/edit sheets; only inner content scrolls.
- Candidate count and candidate rows share one minidot frame with divider lines.
- Calendar game icon is above the game name.
- Removed 本日 label; enlarged ongoing event title/date and game tab labels.
- Compact top chrome and removed top border/shadow line from bottom navigation.


[v27]
- 詳細画面・追加/編集画面を中央モーダル化。外枠は画面内に固定し、内側だけスクロール。
- 詳細と追加/編集を外枠+内枠の二重16px minidotフレーム構成に変更。
- すべての静的フレームを16px表示に統一。
- スマホ操作対策を共通化（スクロールバー非表示、ズーム抑制、長押し選択/Callout抑制、タップハイライト非表示）。


[v28]
- 更新画面と追加/編集画面の外側minidotフレームを32px表示へ変更。内枠は16pxのまま。
- 詳細/編集/追加/更新のモーダルをsafe-area込みで画面内に必ず収まる固定領域へ変更。
- 外枠サイズは内容量に影響されず、長い内容は内側だけスクロール。
- 更新画面の登録ボタンを固定し、候補一覧だけをスクロールする構成を強化。


[v29]
- 更新画面のゲーム結果を「1ゲーム = 1つの16px minidotフレーム」に整理。候補一覧の内側TABLEフレームを廃止。
- 更新モーダル内の外周余白、進捗/結果間の余白、ゲームフレーム内の余白を縮小。
- チェック進捗、ゲーム名、候補件数、候補タイトル、日時、バッジ等の文字を少し拡大。
- 候補イベントはゲームフレーム内で区切り線だけで分離。


v30 更新画面調整
- 更新モーダル外枠の内側余白をさらに圧縮
- ゲームごとの結果フレーム内側余白をさらに圧縮


v31 更新画面調整
- 更新画面の最外枠は32pxを維持。
- チェック進捗フレームとゲームごとの結果フレームは16pxを明示。
- negative marginで内容をフレーム側へ少し食い込ませ、内側余白をさらに圧縮。


v34 更新画面調整
- ゲームごとの結果フレームを「枠画像レイヤー + 内容レイヤー」に変更。
- details/summary のアコーディオン構造は維持し、開閉に合わせて背面の16px minidot枠が自動伸縮。
- 内容を前面へ配置し、枠側へ食い込ませても文字やチェックボックスが枠セルの下へ隠れない構成へ変更。
- 更新画面の最外枠32px、チェック進捗フレーム16pxは維持。


v34 update:
- 更新画面のゲーム結果フレームは「枠レイヤー + 内容レイヤー」を維持。
- 背面16pxフレームの中央行を親の高さへ追従させ、左右の縦枠がアコーディオン開閉時も描画されるよう修正。


v36 targeted update (based strictly on GitHub v34):
- Update screen outer pixel frame: 32px -> 16px.
- Add-event screen outer pixel frame: 32px -> 16px.
- Edit-event screen remains 32px; all other v34 UI/behavior is unchanged.


v37 targeted update (based strictly on GitHub v36):
- Removed the minidot image TABLE from the inner content area of Add/Edit.
- Kept only the 16px image TABLE outer frame.
- Add/Edit header and bottom action buttons stay fixed.
- The entire middle form-content area scrolls vertically only when needed.
- Start/end display-text fields remain removed; date-time inputs are unchanged.


[v38]
- イベント編集画面の下段「キャンセル」を「削除」に変更。追加画面では従来どおりキャンセル。削除前に確認ダイアログを表示。
- 開始日時 / 終了日時を1列の全幅表示にし、他入力欄と同じ横幅へ統一。
- 終了日時から24時間経過したイベントを起動時および1分ごとの更新時に自動削除。終了日時不明は対象外。
- カレンダーの左ゲーム欄を縦位置の基準にし、右側の横スクロール時にもscrollTopを再同期して縦ずれを抑止。
- 上段のEvent Calendarタイトルとアイコンを削除し、上段タブを上へ移動。上段背景をchrome-fill 1色へ統一。
- 更新画面のチェック進捗と結果領域を少し下へ移動し、両者の間隔を少し拡大。
- 結果欄の候補件数をゲーム名の下・左寄せへ移し、＋/－ボタン専用の右列を確保。
- FF14取得元はGame8 (https://game8.jp/ff14/296664) を維持。
