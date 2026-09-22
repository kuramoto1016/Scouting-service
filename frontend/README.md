# スカウトサービス フロントエンド

[Next.js](https://nextjs.org)（App Router / TypeScript）で構築した、スカウトサービスのフロントエンドです。
バックエンドは Rails 製の API（[`../backend`](../backend)）です。

## 開発サーバーの起動

事前に `backend` 側の API サーバー（`http://localhost:3001`）を起動しておいてください。

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと画面が確認できます。

`.env.local` に API のベース URL を設定しています（`.env.local.example` を参照）。

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 主な画面

- `/` : トップページ
- `/signup/intern`, `/signup/company` : インターン生 / 企業の新規登録
- `/login` : ログイン
- `/mypage` : マイページ（メッセージのやり取り一覧）
- `/interns` : インターン生一覧（企業のみ閲覧可）
- `/messages/[type]/[id]` : メッセージのやり取り
- `/jobs`, `/jobs/new` : 募集一覧・掲載

## その他コマンド

```bash
npm run build   # 本番ビルド
npm run lint    # ESLint によるチェック
```
