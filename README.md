# Camp Application - Portfolio Project:
Node.jsによるExpressでの静的配信も含むフルスタックアプリケーション

## 概要
キャンプ場レビューアプリケーションです。ユーザーはキャンプ場を登録し、レビューを投稿できます。

## 機能
- ユーザー認証（登録・ログイン・ログアウト）
- キャンプ場の登録・編集・削除
- キャンプ場へのレビュー投稿
- 画像アップロード機能
- 地図表示機能
- レスポンシブデザイン

## 技術スタック
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Passport.js
- **Template Engine**: EJS
- **Styling**: Bootstrap
- **Image Upload**: Cloudinary
- **Maps**: Mapbox

## セットアップ

### 前提条件
- Node.js (v14以上)
- MongoDB
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/odafuta/Camp-Application.git
cd Camp-Application
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
# env.exampleをコピーして.envファイルを作成
cp env.example .env
```

4. .envファイルを編集（**重要**: 実際の値に置き換えてください）
```env
# Database Configuration
# 開発環境: ローカルMongoDB
DB_URL=mongodb://localhost:27017/yelp-camp
# 本番環境: MongoDB Atlas または クラウドDB
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/yelp-camp

# Session Secret (強力なランダム文字列を使用してください)
SECRET=your-secret-key-here

# Cloudinary Configuration (画像アップロード機能を使用)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret

# Mapbox Configuration (地図機能を使用)
MAPBOX_TOKEN=your-mapbox-token

# Environment
NODE_ENV=development
```

**⚠️ セキュリティ注意事項:**
- `.env`ファイルは絶対にGitにコミットしないでください
- 実際のAPIキーやトークンは安全に管理してください
- 本番環境では強力なシークレットキーを使用してください

### 開発環境での実行

```bash
# 開発サーバーを起動（nodemon使用）
npm run dev
```

### 本番環境での実行

```bash
# 本番サーバーを起動
npm start
```

## 使用方法

1. アプリケーションを起動後、ブラウザで `http://localhost:3000` にアクセス
2. 新規ユーザー登録またはログイン
3. キャンプ場を登録・編集・削除
4. キャンプ場にレビューを投稿

## プロジェクト構造

```
CampApp/
├── cloudinary/          # Cloudinary設定
├── controllers/         # コントローラー
├── models/             # データモデル
├── public/             # 静的ファイル
│   ├── javascripts/
│   └── stylesheets/
├── routes/             # ルーティング
├── seeds/              # シードデータ
├── utils/              # ユーティリティ
├── views/              # EJSテンプレート
│   ├── campgrounds/
│   ├── layouts/
│   ├── partials/
│   └── users/
├── app.js              # メインアプリケーションファイル
├── middleware.js        # ミドルウェア
├── package.json        # プロジェクト設定
└── schemas.js          # バリデーションスキーマ
```

## セキュリティ

### 環境変数の管理
このプロジェクトでは機密情報を環境変数で管理しています：

1. **`.env`ファイルの作成**:
   ```bash
   cp env.example .env
   ```

2. **必要な環境変数**:
   - `SECRET`: セッション暗号化用の強力なランダム文字列
   - `DB_URL`: MongoDB接続URL
     - 開発環境: `mongodb://localhost:27017/yelp-camp`
     - 本番環境: MongoDB Atlas または クラウドDBのURL
   - `CLOUDINARY_*`: 画像アップロード機能用（オプション）
   - `MAPBOX_TOKEN`: 地図機能用（オプション）

3. **セキュリティベストプラクティス**:
   - `.env`ファイルは絶対にGitにコミットしない
   - 本番環境では環境変数サービスを使用
   - 定期的にシークレットキーを更新
   - 最小権限の原則に従う
   - **データベース接続**: 本番環境では認証情報を含むURLを使用

### 依存関係のセキュリティ
```bash
# セキュリティ脆弱性のチェック
npm audit

# 自動修正（可能な場合）
npm audit fix
```

## クレジット

このプロジェクトは以下のリソースを基に作成されています：

- **元のプロジェクト**: [kenfdev/YelpCamp-ja](https://github.com/kenfdev/YelpCamp-ja)
- **講師**: kenfdev
- **ポートフォリオ版**: odafuta

## ライセンス
ISC

## 作者
odafuta (based on kenfdev's YelpCamp-ja) 