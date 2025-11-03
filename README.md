# 🍜 Ramen Menu Vision

Next.js (App Router) アプリケーションで、レストランのメニュー画像をアップロードし、AI が料理のプレビューを生成します。

## 機能

1. **画像アップロード**: ドラッグ&ドロップでメニュー画像をアップロード（日本語/英語対応）
2. **LLM 解析**: OpenAI GPT-4o でメニューから料理名と説明を抽出し、画像プロンプトを生成
3. **画像生成**: DALL-E 3 で各料理の 512×512 プレビュー画像を生成
4. **レスポンシブグリッド**: 料理をタイトル、説明と共に表示
5. **共有機能**: 結果を JSON で保存し、共有可能なスラッグ URL を生成
6. **UI/UX**: Tailwind CSS、スケルトン読み込み、空の状態

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の変数を設定してください：

```env
OPENAI_API_KEY=your_openai_api_key_here
IMAGE_API_KEY=your_openai_api_key_here  # または同じ OPENAI_API_KEY を使用
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## テスト

### E2E テスト（Playwright）

```bash
# テスト実行
npm run test:e2e

# UI モードでテスト実行
npm run test:e2e:ui
```

## デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数を設定：
   - `OPENAI_API_KEY`
   - `IMAGE_API_KEY` (または同じ OPENAI_API_KEY を使用)
   - `NEXT_PUBLIC_BASE_URL` (自動設定される場合は不要)
3. デプロイ

または、Vercel CLI を使用：

```bash
npm i -g vercel
vercel
```

## プロジェクト構造

```
ramen-menu-vision/
├── app/
│   ├── api/
│   │   ├── parse/          # メニュー解析 API
│   │   ├── generate-image/ # 画像生成 API
│   │   └── share/          # 共有機能 API
│   ├── share/[slug]/       # 共有ページ
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── DishGrid.tsx        # 料理グリッド表示
│   └── ImageUpload.tsx     # 画像アップロード
├── lib/
│   ├── llm.ts              # LLM 統合
│   ├── imageGen.ts         # 画像生成
│   └── storage.ts          # ストレージ（メモリ）
├── types/
│   └── index.ts            # 型定義
├── e2e/                    # E2E テスト
└── playwright.config.ts
```

## 技術スタック

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **OpenAI API** (GPT-4o, DALL-E 3)
- **Playwright** (E2E テスト)
- **Vercel** (デプロイ)

## 注意事項

- 現在のストレージ実装はメモリベースです。本番環境ではデータベース（PostgreSQL、MongoDB など）に置き換える必要があります。
- OpenAI API の使用には費用がかかります。適切なレート制限を設定してください。

## ライセンス

MIT

