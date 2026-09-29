# Scouting-service

インターン生と企業をマッチングするスカウトサービスのプロトタイプです。

## 構成

- `backend/` : Rails 8 (APIモード) + PostgreSQL
- `frontend/` : Next.js (App Router, TypeScript)

## 実装済み機能

### 認証・ホーム

- インターン生 / 企業の新規登録・ログイン（JWTトークン認証）
- アカウント種別に応じたホーム表示
- 学生ホームで最新メッセージ、おすすめ募集、エントリー済み募集を表示
- 認証エラー時のセッション無効化とログイン画面への誘導

### 学生プロフィール

- 学生プロフィールの閲覧
- 基本情報、希望条件、スキル、制作物、ハイライト、自己PR、リンクの編集
- プロフィール完成度と未入力項目の表示
- 企業による学生一覧・学生詳細の閲覧

### 求人・エントリー

- 企業による求人・インターン募集の作成、一覧表示、詳細表示
- 卒業年度、職種、働き方、勤務地、企業IDによる募集検索
- 学生による求人へのエントリー
- エントリー済み求人の「エントリー済み」表示
- 既にエントリー済みの求人へ再エントリーした場合の案内表示
- 企業ホームで自社掲載求人を表示

### メッセージ

- 企業と学生の会話作成・一覧・詳細表示
- メッセージ送信、編集、削除
- 本文最大3000文字の制限
- Enterで送信、Shift+Enterで改行
- 添付ファイル付きメッセージ
- 会話参加者だけが取得できる添付ファイル配信
- 画像添付の遅延読み込みとBlob URLの解放
- 非画像添付のダウンロード
- チャット欄の自動スクロールと過去ログスクロール

### 日程調整

- 企業による日程調整の作成
- 求人詳細から、エントリー済み学生だけを対象にした日程調整作成
- 学生による候補日時への回答
- 企業による候補日時の確定
- 日程調整のキャンセル
- open状態の日程だけ回答・確定・キャンセル可能
- 候補日時の不正な日付・時刻入力の検証

## セットアップ

### バックエンド (Rails)

事前にローカルでPostgreSQLを起動し、`backend/.env.example` を `backend/.env` にコピーして自分のpostgresユーザーのパスワードを設定してください（`DATABASE_PASSWORD` は必須で、未設定だと起動時にエラーになります）。

```bash
cd backend
cp .env.example .env
# .env を編集し、DATABASE_PASSWORD に自分の postgres ユーザーのパスワードを設定
bundle install
rails db:create db:migrate db:seed
rails server # http://localhost:3001
```

`DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_USERNAME` は未設定の場合それぞれ `localhost` / `5432` / `postgres` が使われます。

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
