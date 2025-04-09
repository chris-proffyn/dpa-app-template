# Part 1: OAuth 2.0 Code Flow (User Login + Token Exchange) in Next.js

This guide enables your users to log into HMRC (via the sandbox), authorize your app, and retrieve tokens to call Self Assessment APIs.

## 📁 1. Set Environment Variables (.env.local)

```env
HMRC_CLIENT_ID=your-sandbox-client-id
HMRC_CLIENT_SECRET=your-sandbox-client-secret
HMRC_REDIRECT_URI=http://localhost:3000/api/hmrc/callback
HMRC_SCOPES=read:self-assessment write:self-assessment
```

## 🔁 2. Redirect to HMRC Auth Page

**File**: `/pages/api/hmrc/login.ts`

```ts
// pages/api/hmrc/login.ts
export default async function handler(req, res) {
  const { HMRC_CLIENT_ID, HMRC_REDIRECT_URI, HMRC_SCOPES } = process.env;

  const authUrl = new URL('https://test-www.tax.service.gov.uk/oauth/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', HMRC_CLIENT_ID!);
  authUrl.searchParams.append('redirect_uri', HMRC_REDIRECT_URI!);
  authUrl.searchParams.append('scope', HMRC_SCOPES!);
  authUrl.searchParams.append('state', 'randomstate123'); // use real CSRF token in production

  res.redirect(authUrl.toString());
}
```

## 🔄 3. Receive Auth Code and Exchange for Token

**File**: `/pages/api/hmrc/callback.ts`

```ts
// pages/api/hmrc/callback.ts
export default async function handler(req, res) {
  const { code } = req.query;
  const { HMRC_CLIENT_ID, HMRC_CLIENT_SECRET, HMRC_REDIRECT_URI } = process.env;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code as string,
    client_id: HMRC_CLIENT_ID!,
    client_secret: HMRC_CLIENT_SECRET!,
    redirect_uri: HMRC_REDIRECT_URI!,
  });

  const tokenRes = await fetch('https://test-api.service.hmrc.gov.uk/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const tokenData = await tokenRes.json();

  console.log('TOKEN DATA:', tokenData); // ⚠️ Store this securely

  res.status(200).json(tokenData); // or redirect to frontend dashboard
}
```
