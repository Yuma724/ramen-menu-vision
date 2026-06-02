# 環境変数テンプレート

`.env.local` ファイルを作成し、以下の変数を設定してください：

```env
# OpenAI API Key for LLM (menu parsing and prompt generation)
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI API Key for DALL-E image generation (or use same key)
# OPENAI_API_KEY can be used for both, or set separately:
IMAGE_API_KEY=your_openai_api_key_here

# Base URL for share links (e.g., https://your-domain.vercel.app)
# For local development, use: http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ─────────────────────────────────────────────
# Content Dashboard (/dashboard) — すべて任意。未設定のソースはモック表示になります。
# ─────────────────────────────────────────────

# X (Twitter) — @aleabitoreddit の投稿取得（X API v2 / 有料プラン）
# X_HANDLE=aleabitoreddit
# X_BEARER_TOKEN=your_x_api_v2_bearer_token

# SemiAnalysis RSS（デフォルトで実データ取得。URL変更時のみ設定）
# SEMIANALYSIS_FEED_URL=https://www.semianalysis.com/feed

# Gmail メルマガ（さとしなかしま）— gmail.readonly スコープのアクセストークン
# GMAIL_ACCESS_TOKEN=your_gmail_oauth_access_token
# GMAIL_NAKASHIMA_QUERY=subject:("Life is beautiful") OR "中島聡"
```

**注意**: 
- `OPENAI_API_KEY` は必須です
- `IMAGE_API_KEY` が設定されていない場合は、`OPENAI_API_KEY` が使用されます
- `NEXT_PUBLIC_BASE_URL` は Vercel にデプロイする場合、自動的に設定されます（オプション）
- ダッシュボード用の変数はすべて任意です。`X_BEARER_TOKEN` / `GMAIL_ACCESS_TOKEN` を設定すると、それぞれ実データに切り替わります。SemiAnalysis は設定不要で RSS から取得します。

