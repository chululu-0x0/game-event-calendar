Game Event Calendar v22
===========================

GitHub main の v21（index.html / style.css / script.js）を基準にした更新版です。

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
https://ff14wiki.info/?公式イベント

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
Supabase側のDeploy確認後、GitHub main の以下3ファイルをv22版で置き換えます。
- index.html
- style.css
- script.js

assets は変更していません。
