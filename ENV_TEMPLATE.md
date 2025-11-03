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
```

**注意**: 
- `OPENAI_API_KEY` は必須です
- `IMAGE_API_KEY` が設定されていない場合は、`OPENAI_API_KEY` が使用されます
- `NEXT_PUBLIC_BASE_URL` は Vercel にデプロイする場合、自動的に設定されます（オプション）

