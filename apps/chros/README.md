# CHroS WebApp
Next.js製のWebアプリケーション。Viewer・Console・API を1つのアプリに内包しています。

## 環境構築
必要なツール
- Node.js 22 LTS
- pnpm

依存の解決は monorepo のルートで行います。手順はルートの `README.md` を参照してください。

1. リポジトリのルートで `pnpm install` を実行
2. `.env.example` を `.env` にコピー
3. 環境変数を設定する

## 環境変数
|キー|必須？|内容|
|---|---|---|
|`DATABASE_URL`|`true`|PostgreSQL 接続文字列|
|`NEXT_PUBLIC_APP_URL`|`false`|Viewer が SSE を張る先。同一オリジンなら空でよい|

## ディレクトリ
- `app/console/` 運営向け操作画面
- `app/display/` 配信用 Viewer 画面。SSE で状態に追従し、画面切り替えはルーティングではなく状態で行う
- `app/api/` Route Handlers（REST + SSE）
