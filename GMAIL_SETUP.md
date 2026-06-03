# Gmail メルマガ取り込みのセットアップ

Content Dashboard の「中島聡 メルマガ（週刊Life is beautiful）」を**実データ化**する手順です。
Gmail API（`gmail.readonly` スコープ）を使い、送信元 `mailmag@mag2premium.com` のメールを読み取ります。

> 読み取り専用です。メールの送信・削除・変更は一切行いません。

---

## 方式は2つ

| 方式 | 必要な env | 寿命 | 用途 |
|---|---|---|---|
| **A. アクセストークン直挿し** | `GMAIL_ACCESS_TOKEN` | 約1時間で失効 | 動作確認・お試し |
| **B. リフレッシュトークン（推奨）** | `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` / `GMAIL_REFRESH_TOKEN` | 自動更新で永続 | 本番デプロイ |

両方設定されている場合は **B（リフレッシュトークン）が優先**されます。

---

## 方式 A: まずは動作確認（OAuth Playground / 約5分）

1. https://developers.google.com/oauthplayground を開く
2. 右上の歯車 → **"Use your own OAuth credentials"** はオフのままでOK（お試し用）
3. 左の「Select & authorize APIs」の入力欄に下記スコープを貼り付けて **Authorize APIs**
   ```
   https://www.googleapis.com/auth/gmail.readonly
   ```
4. 対象の Google アカウント（メルマガが届く方）でログイン・許可
5. **"Exchange authorization code for tokens"** をクリック
6. 表示された **Access token** をコピーし、env に設定
   ```env
   GMAIL_ACCESS_TOKEN=ya29....
   ```
7. ダッシュボードを開く → メルマガが実データに切り替わります（約1時間後に失効）

---

## 方式 B: 本番用（リフレッシュトークン / 自動更新）

### 1. Google Cloud プロジェクトを用意
1. https://console.cloud.google.com/ でプロジェクト作成（既存でも可）
2. **APIとサービス → ライブラリ** で **Gmail API** を有効化

### 2. OAuth 同意画面
1. **APIとサービス → OAuth 同意画面**
2. User Type は **External**、アプリ名等を入力
3. **スコープを追加** で `.../auth/gmail.readonly` を追加
4. **テストユーザー** に自分の Gmail アドレスを追加（公開審査は不要。テストユーザーのままで使えます）

### 3. OAuth クライアント ID を作成
1. **APIとサービス → 認証情報 → 認証情報を作成 → OAuth クライアント ID**
2. アプリの種類 **ウェブアプリケーション**
3. **承認済みのリダイレクト URI** に追加：
   ```
   https://developers.google.com/oauthplayground
   ```
4. 発行された **クライアント ID** と **クライアント シークレット** を控える

### 4. リフレッシュトークンを取得（OAuth Playground）
1. https://developers.google.com/oauthplayground を開く
2. 右上の歯車 → **"Use your own OAuth credentials"** にチェックし、上記の Client ID / Secret を入力
3. スコープ `https://www.googleapis.com/auth/gmail.readonly` を Authorize
4. **"Exchange authorization code for tokens"** → 表示された **Refresh token** を控える

### 5. env を設定
```env
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=1//xxxxx
```
Vercel の場合は **Settings → Environment Variables** に登録して再デプロイ。

これでアクセストークンはリクエストごとに自動更新され、失効しません。

---

## 検索クエリのカスタマイズ（任意）

デフォルトは送信元で絞っています：

```env
# 既定値（中島聡メルマガの送信元）
GMAIL_NAKASHIMA_QUERY=from:mailmag@mag2premium.com
```

本編だけに絞りたい場合の例：
```env
GMAIL_NAKASHIMA_QUERY=from:mailmag@mag2premium.com subject:"Life is beautiful"
```

クエリは [Gmail 検索演算子](https://support.google.com/mail/answer/7190) がそのまま使えます。

---

## トラブルシュート

| 症状 | 原因 / 対処 |
|---|---|
| ソースが🔴（エラー）になる | トークン失効/権限不足。方式Bへ移行、またはトークン再取得 |
| `invalid_grant` | リフレッシュトークン失効（テストアプリは未使用が続くと失効することあり）→ 再取得 |
| 0件しか出ない | クエリを見直す。`GMAIL_NAKASHIMA_QUERY` を一時的に広げて確認 |
| 🟡（サンプル）のまま | env が読み込まれていない。デプロイ環境の変数設定と再デプロイを確認 |
