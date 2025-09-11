## Vercel でのデプロイ: 特徴と制約（本リポジトリ向けメモ）

本プロジェクト（Express + EJS + MongoDB + Cloudinary + Mapbox）を Vercel にデプロイする際の要点を整理します。

### 何が得意か（Vercel の特徴）
- **グローバル配信**: 静的ファイルはCDNから配信、動的処理はサーバーレス/エッジで低レイテンシ。
- **自動デプロイ**: Git連携のプッシュ/PR毎にプレビューURLを自動発行。
- **環境ごとの切り替え**: `development`/`preview`/`production` を明確に分離（`VERCEL_ENV`）。

### 実行モデルと制約（重要）
- **常駐プロセスは不可**: いわゆる「VPSのように node app.js を常時起動」はできません。Nodeは基本的に
  - Serverless Functions（Node.js ランタイム）
  - Edge Functions（軽量・グローバル）
 で動作します（実行ごとに短時間で起動・終了）。
- **タイムアウト**: 処理時間には上限があります（目安: Hobby≈10s、Pro≈60s、より長い処理は別基盤推奨）。
- **メモリ/サイズ**: 関数のメモリやバンドルサイズに上限あり（大容量依存関係は注意）。
- **ファイルシステム**: 読み取り専用。`/tmp` のみ一時書き込み可（エフェメラル、永続化不可）。
- **コールドスタート**: 初回（またはしばらく未使用）実行時は起動遅延が発生する場合があります。
- **長時間/長寿命接続**: 長いバッチ処理、常時接続のWebSocket等は用途により制限・工夫が必要。

### ネットワーク・リージョン
- **リージョン**: 関数の実行リージョンを指定可能。DB（MongoDB Atlas）に近いリージョンを選ぶとレイテンシ低減。
- **アウトバウンド通信**: 外部API（Cloudinary、Mapbox、MongoDB等）への接続は可能。タイムアウトと再試行戦略を考慮。

### リクエスト/レスポンスのサイズ・アップロード
- **本文サイズ上限**: サーバーレス関数のリクエスト/レスポンスにサイズ上限があります（数MB程度が目安）。
- **推奨方針**: 画像等の大きなアップロードは、サーバー経由にせず **Cloudinary へ直接アップロード**（署名付き）を推奨。

### 環境変数（本プロジェクトで必要なもの）
Vercel のプロジェクト設定 → Environment Variables で設定してください。
- `NODE_ENV=production`（Vercel本番では自動的にproduction相当ですが、明示設定を推奨）
- `DB_URL`（MongoDB Atlas 接続文字列）
- `SECRET`（セッション用シークレット）
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`
- `MAPBOX_TOKEN`

注: 本アプリは `if (process.env.NODE_ENV !== 'production') require('dotenv').config()` のため、**本番では `.env` は読まれません**。Vercel側に必ず登録してください。

### Express/セッション周りの注意（本プロジェクト特有）
- **trust proxy**: 逆プロキシ配下での `secure` クッキーの扱い向上のため、本番では
  ```js
  app.set('trust proxy', 1)
  ```
  の併用を推奨。
- **セキュアクッキー**: 本番は `session.cookie.secure = true` を検討（HTTPS前提）。
- **MongoDB接続**: サーバーレスの特性上、接続はモジュールスコープで行い**再利用**するのが基本（本アプリはトップレベルで `mongoose.connect` 済。コールドスタート時に初期化され、その後は再利用されます）。

### 静的アセット
- `public/` 配下は Express の `express.static` で配信可能ですが、静的ファイルはVercelの静的配信に載せると高速・安定です。
- 大容量/高頻度の静的アセットは、VercelのCDNまたは外部ストレージ（例: Cloudinary, S3等）利用を推奨。

### よくあるエラーと対処
- **504/タイムアウト**: 処理が時間上限を超過。処理の短縮、キューイング/別基盤（ワーカー）へ分離、Proプラン等を検討。
- **413 Payload Too Large**: 本文サイズ超過。Cloudinary等へのブラウザ直送に切り替え。
- **ディスク書き込み不可**: 永続書き込みは不可。必要なら外部ストレージを使用。テンポラリは `/tmp` のみ。
- **CSP/外部ドメインブロック**: `helmet.contentSecurityPolicy` の許可リストに Cloudinary/Mapbox 等を正しく追加（本アプリは対応済み、Cloudinaryのクラウド名が環境変数依存）。

### 推奨設定例（`vercel.json` を使う場合のヒント）
プロジェクトにより異なりますが、以下のように関数のメモリや最大実行時間、リージョンを指定できます。
```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60,
      "regions": ["hnd1", "sin1"]
    }
  },
  "routes": [
    { "src": "/(.*)", "dest": "/api/index.js" }
  ]
}
```

（注意）純粋な Express サーバーをそのまま常駐させる構成はVercelでは非推奨/非対応です。必要に応じて Serverless Function 化（例: `api/index.js` で Express をエクスポート）してください。

### 運用
- **ログ/監視**: Vercel のダッシュボードから関数ログを確認可能。エラー通知や計測は外部SaaS（Sentry等）併用が便利。
- **プレビュー環境**: PR単位でURLが発行されるため、ステージング代替として活用可能。プレビュー用に別のDB/Cloudinaryフォルダを使う場合は、環境変数を `Preview` スコープで分ける。

---
困ったら: 何が遅い/大きい/常時必要かを見極め、
- 重い処理→ワーカー/キューへ
- 大きいファイル→直送 or 外部ストレージ
- 長時間接続→専用サービス（Pusher/Ably等）やVercelの対応機能
を検討してください。


