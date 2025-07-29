# Camp Application - Portfolio Project

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

4. .envファイルを編集
```env
# Database Configuration
DB_URL=mongodb://localhost:27017/yelp-camp

# Session Secret
SECRET=your-secret-key-here

# Cloudinary Configuration (if using image upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret

# Mapbox Configuration (if using maps)
MAPBOX_TOKEN=your-mapbox-token

# Environment
NODE_ENV=development
```

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

## クレジット

このプロジェクトは以下のリソースを基に作成されています：

- **元のプロジェクト**: [kenfdev/YelpCamp-ja](https://github.com/kenfdev/YelpCamp-ja)
- **講師**: kenfdev
- **ポートフォリオ版**: odafuta

## ライセンス
ISC

## 作者
odafuta (based on kenfdev's YelpCamp-ja) 