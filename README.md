# CHaserProgressionControlSystem
通称 : CHroS(チュロス)

大会の進行と、配信に載せる表示を管理するシステムです。
要件は [docs/requirements.md](./docs/requirements.md)、技術要件は
[docs/technical-requirements.md](./docs/technical-requirements.md) を参照してください。

## 構成

pnpm workspace による monorepo で、アプリは Next.js 単体です。

```
apps/chros/        Next.js (App Router) — Console / Viewer / API
packages/shared/   ドメイン型・イベント定義・Zod スキーマ（I/O を持たない）
packages/scoring/  スコア計算の純粋ロジック（I/O を持たない）
```

## 環境構築

Docker を使用する場合は、リポジトリのルートで `docker compose up -d` を実行してください。
`app` (Next.js, :3000) と `db` (PostgreSQL 17, :5432) が立ち上がります。

ローカルで動かす場合:

```sh
# DB だけ Docker で立てる
docker compose up -d db

pnpm install
cp apps/chros/.env.example apps/chros/.env
pnpm --filter chros exec prisma migrate deploy
pnpm dev
```

- Console: http://localhost:3000/console
- Viewer: http://localhost:3000/display

## リアルタイム配信

Viewer は `GET /api/stream` の SSE を購読します。接続直後に全状態のスナップショットが
1件届き、以降は差分イベントが流れます。WebSocket は使用しません（理由は技術要件 §1.1）。
