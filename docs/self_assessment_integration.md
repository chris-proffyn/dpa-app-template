# Self Assessment Integration

## 🔹 1. Enable the SA API in the Sandbox

- Go to HMRC Developer Hub  
- Select your sandbox application  
- Click “Subscribe to APIs”  
- Subscribe to:  
  - ✅ Self Assessment (MTD)  
  - Or legacy Self Assessment (Individual) APIs (depends on use case)  
- Note the required scopes, e.g., `read:self-assessment`, `write:self-assessment`

## 🔹 2. Create a Test User (Individual)

To test user-restricted endpoints, you'll need a test individual with a UTR (Unique Taxpayer Reference):

Go to: **Create Test User**

**Use the Self Assessment - Create Test User endpoint:**

```bash
POST https://test-api.service.hmrc.gov.uk/create-test-user/individuals

{
  "services": ["self-assessment"]
}
```

Save the returned:
- userId  
- password  
- utr  
- nino  

You'll use these to simulate OAuth login later.

## 🔹 3. Implement the OAuth 2.0 Authorization Code Grant Flow

This flow lets your users log in with their HMRC credentials and authorize your app to access their SA data.

**Key URLs:**
- **Authorization URL (sandbox):**  
  `https://test-www.tax.service.gov.uk/oauth/authorize`

- **Token URL (to exchange code for token):**  
  `https://test-api.service.hmrc.gov.uk/oauth/token`

**Sample OAuth Flow:**

**Step 1**: Redirect user to HMRC authorization screen

```ts
const authUrl = `https://test-www.tax.service.gov.uk/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:self-assessment write:self-assessment&state=abc123`;
```

**Step 2**: User logs in with test credentials and approves scopes  
**Step 3**: HMRC redirects back to your app

```perl
https://your-app.com/callback?code=AUTH_CODE_HERE&state=abc123
```

**Step 4**: Exchange code for tokens

```bash
POST https://test-api.service.hmrc.gov.uk/oauth/token
client_id=...
client_secret=...
code=...
grant_type=authorization_code
redirect_uri=...
```

**Step 5**: Store the `access_token` and `refresh_token` securely.

## 🔹 4. Call a User-Restricted Endpoint (e.g., retrieve tax return)

Use the user's access_token:

```bash
GET /individuals/self-assessment/utr/{utr}/taxYear/{taxYear}/return
Authorization: Bearer {access_token}
Accept: application/vnd.hmrc.1.0+json
```

Replace:
- `utr` with the one from your test user  
- `taxYear` with e.g. `2022-23`

## 🔹 5. Handle Errors & Refresh Tokens

- Access tokens last 4 hours  
- Refresh using:

```bash
grant_type=refresh_token
refresh_token=...
client_id=...
client_secret=...
```

## 🛠 Bonus Tips

- ✅ Add support for state and PKCE for security  
- ✅ Store tokens securely and encrypt refresh tokens  
- ✅ Build good error handling (401, 403, etc.)

## 📘 Resources

- Self Assessment API Docs  
- OAuth 2.0 Auth Guide  
- Reference Scopes List

---

## ✅ Part 1: OAuth 2.0 Code Flow (User Login + Token Exchange) in Next.js

### 1. Set Environment Variables (.env.local)

```env
HMRC_CLIENT_ID=your-sandbox-client-id
HMRC_CLIENT_SECRET=your-sandbox-client-secret
HMRC_REDIRECT_URI=http://localhost:3000/api/hmrc/callback
HMRC_SCOPES=read:self-assessment write:self-assessment
```

### 2. Redirect to HMRC Auth Page

**File: `/pages/api/hmrc/login.ts`**

```ts
export default async function handler(req, res) {
  const { HMRC_CLIENT_ID, HMRC_REDIRECT_URI, HMRC_SCOPES } = process.env;

  const authUrl = new URL('https://test-www.tax.service.gov.uk/oauth/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', HMRC_CLIENT_ID!);
  authUrl.searchParams.append('redirect_uri', HMRC_REDIRECT_URI!);
  authUrl.searchParams.append('scope', HMRC_SCOPES!);
  authUrl.searchParams.append('state', 'randomstate123'); // Use real CSRF token in production

  res.redirect(authUrl.toString());
}
```

### 3. Receive Auth Code and Exchange for Token

**File: `/pages/api/hmrc/callback.ts`**

```ts
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

  console.log('TOKEN DATA:', tokenData); // ⚠ Store this securely

  res.status(200).json(tokenData); // or redirect to frontend dashboard
}
```

---

## ✅ Part 2: Submitting a Self Assessment Tax Return

### Example Endpoint:

```http
PUT /individuals/self-assessment/utr/{utr}/taxYear/{taxYear}/return
```

### Required Headers:

```http
Authorization: Bearer {access_token}
Accept: application/vnd.hmrc.1.0+json
Content-Type: application/json
```

### Example Request Payload:

```json
{
  "income": {
    "selfEmployment": {
      "totalIncome": 25000.00
    },
    "ukProperty": {
      "totalIncome": 1000.00
    }
  },
  "deductions": {
    "tradingAllowance": 1000.00,
    "propertyAllowance": 500.00
  },
  "taxCalculation": {
    "totalIncomeTax": 4800.00,
    "totalCapitalGainsTax": 0.00
  },
  "submissionDate": "2024-12-01"
}
```

### Sample Call in Next.js API Route:

**File: `/pages/api/hmrc/submit-return.ts`**

```ts
export default async function handler(req, res) {
  const { accessToken, utr, taxYear } = req.body;

  const result = await fetch(`https://test-api.service.hmrc.gov.uk/individuals/self-assessment/utr/${utr}/taxYear/${taxYear}/return`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/vnd.hmrc.1.0+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      income: {
        selfEmployment: {
          totalIncome: 25000.00,
        },
        ukProperty: {
          totalIncome: 1000.00,
        }
      },
      deductions: {
        tradingAllowance: 1000.00,
        propertyAllowance: 500.00
      },
      taxCalculation: {
        totalIncomeTax: 4800.00,
        totalCapitalGainsTax: 0.00
      },
      submissionDate: '2024-12-01'
    }),
  });

  const responseBody = await result.json();
  res.status(result.status).json(responseBody);
}
```

---

### 🧪 Test User & UTR

- Use the UTR returned from the Create Test User endpoint.  
- Token must be for that test user's login session.

### 🧯 Errors to Watch For:

- 401 Unauthorized – token expired, wrong scope, or not authorized for UTR  
- 403 Forbidden – user hasn’t granted permission for that scope  
- 422 Unprocessable Entity – invalid or missing data  
