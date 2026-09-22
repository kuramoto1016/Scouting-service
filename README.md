# Scouting-service

インターン生と企業をマッチングするスカウトサービスのプロトタイプです。

## 構成

- `backend/` : Rails 8 (APIモード) + SQLite3
- `frontend/` : Next.js (App Router, TypeScript)

## 主な機能

- インターン生 / 企業の新規登録・ログイン（JWTトークン認証）
- 企業によるインターン生一覧の閲覧
- 企業とインターン生間のメッセージのやり取り
- 企業による募集情報の掲載・一覧表示

## セットアップ

### バックエンド (Rails)

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server # http://localhost:3001
```

### フロントエンド (Next.js)

```bash
cd frontend
npm install
npm run dev # http://localhost:3000
```

`frontend/.env.local` に `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` を設定しています。

## シードデータ

`rails db:seed` で以下のアカウントが作成されます。

- インターン生: `intern@example.com` / `password123`
- 企業: `company@example.com` / `password123`
