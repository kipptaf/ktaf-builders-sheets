// Shared Google Sheets client for KTAF Builders cohort apps on Vercel.
// Source: https://github.com/kipptaf/ktaf-builders-sheets
// Auth: Vercel OIDC federation -> Google service account. No keys or secrets.
// Server-only: never import this from a client component.
import 'server-only';

import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { google } from 'googleapis';

const REQUIRED = [
  'GCP_PROJECT_NUMBER',
  'GCP_WORKLOAD_IDENTITY_POOL_ID',
  'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
  'GCP_SERVICE_ACCOUNT_EMAIL',
] as const;

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(
    `Missing environment variables: ${missing.join(', ')}. Add them in Vercel -> Settings -> Environment Variables (Production).`,
  );
}

const {
  GCP_PROJECT_NUMBER,
  GCP_WORKLOAD_IDENTITY_POOL_ID,
  GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
  GCP_SERVICE_ACCOUNT_EMAIL,
} = process.env;

// Read-only apps: set GOOGLE_SHEETS_READ_ONLY=true in Vercel (optional).
const scope =
  process.env.GOOGLE_SHEETS_READ_ONLY === 'true'
    ? 'https://www.googleapis.com/auth/spreadsheets.readonly'
    : 'https://www.googleapis.com/auth/spreadsheets';

const auth = ExternalAccountClient.fromJSON({
  type: 'external_account',
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  token_url: 'https://sts.googleapis.com/v1/token',
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: { getSubjectToken: getVercelOidcToken },
  scopes: [scope],
});

if (!auth) {
  throw new Error('Could not build the Google auth client. Check the GCP_* environment variables.');
}

export const sheets = google.sheets({ version: 'v4', auth });
