# ktaf-builders-sheets

Shared server-side helper for KTAF Builders cohort apps on Vercel to read and write Google Sheets using Vercel OIDC federation. No Apps Script, no service account keys.

This repo holds one file, [`lib/sheets.ts`](lib/sheets.ts). Copy it into your app unchanged. It contains no secrets; it reads environment variable names only.

## Before you use it

Follow the setup guide first (Step 0 and B1–B2). You need:

- OIDC turned on in your Vercel project (Settings → Security, issuer mode **Team**)
- A service account for your app, created by Bini on the Google Cloud side

## Environment variables (Vercel → Settings → Environment Variables, Production)

| Name | Value |
|---|---|
| `GCP_PROJECT_NUMBER` | `690405383129` |
| `GCP_WORKLOAD_IDENTITY_POOL_ID` | `vercel` |
| `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` | `vercel` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | Your app's service account email (from Bini) |
| `GOOGLE_SHEETS_READ_ONLY` | Optional. Set to `true` if your app never writes |

## Install

```bash
npm i @vercel/oidc google-auth-library googleapis server-only
```

Then copy `lib/sheets.ts` into your app and use it from server-side route handlers only:

```ts
import { sheets } from '@/lib/sheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: 'YOUR_SHEET_ID',
    range: 'Sheet1!A1:D100',
  });
  return Response.json(res.data.values ?? []);
}
```

## Things to know

- **Production only.** It will not work on preview links or locally. That's intentional.
- **Share each sheet** with your service account email (Editor, or Viewer if read-only).
- **Never import from a client component.** `server-only` will fail the build if you do.

## Changes

Don't edit your copy. If something needs to change, tell Kevin Shaw and it gets fixed here for every app.
