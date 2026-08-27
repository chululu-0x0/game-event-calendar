Game Event Calendar v21

GitHub main の v20（script.js / index.html / style.css のblob SHAを照合）を基準に更新。

変更点:
- 原神の「更新」から Supabase Edge Function fetch-wiki-events を呼び出すよう接続
- 中継URL: https://vdcnicyobhnqwqswsspw.supabase.co/functions/v1/fetch-wiki-events
- 取得候補に「種類」「限定報酬」「Wiki上の期間表記」を表示
- start=null / 「Ver.7.0アプデ後」等の開始表記を保持したまま反映可能
- 日付未確定のイベントは開催中一覧・詳細には表示し、絶対日付が必要なカレンダーでは非表示
- 詳細画面に「種類」「限定報酬」を追加
- バージョン表示 v21
- 既存 localStorage キーは v20 のまま維持し、保存済みデータを引き継ぐ

Supabase側について:
ブラウザから呼び出した際に HTTP 401 になる場合、Edge Function の JWT 検証設定が有効な可能性があります。
現在のPWAコードは公開エンドポイントとして呼ぶ構成です。
