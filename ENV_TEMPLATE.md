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

# Gmail メルマガ（中島聡「週刊Life is beautiful」）— gmail.readonly スコープ
# 詳しい取得手順は GMAIL_SETUP.md を参照。

# 方式A: アクセストークン直挿し（お試し / 約1時間で失効）
# GMAIL_ACCESS_TOKEN=ya29....

# 方式B: リフレッシュトークン（推奨 / 自動更新で永続）
# GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GMAIL_CLIENT_SECRET=xxxxx
# GMAIL_REFRESH_TOKEN=1//xxxxx

# 検索クエリ（既定は送信元で絞り込み。本編だけにするなら subject も付与）
# GMAIL_NAKASHIMA_QUERY=from:mailmag@mag2premium.com
```

**注意**: 
- `OPENAI_API_KEY` は必須です
- `IMAGE_API_KEY` が設定されていない場合は、`OPENAI_API_KEY` が使用されます
- `NEXT_PUBLIC_BASE_URL` は Vercel にデプロイする場合、自動的に設定されます（オプション）
- ダッシュボード用の変数はすべて任意です。`X_BEARER_TOKEN` / `GMAIL_ACCESS_TOKEN` を設定すると、それぞれ実データに切り替わります。SemiAnalysis は設定不要で RSS から取得します。

