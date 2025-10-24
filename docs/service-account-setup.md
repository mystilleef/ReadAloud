# Service Account Setup for Chrome Web Store API

This guide helps you set up **Service Account authentication** for Chrome Web Store deployments, which works with Google accounts that have **Advanced Protection Program** enabled.

## Why Service Accounts?

Service accounts are special Google Cloud accounts designed for automated, server-to-server interactions. Benefits:

- ✅ Works with Advanced Protection Program (APP)
- ✅ No manual OAuth flow needed for CI/CD
- ✅ More secure for automated deployments
- ✅ No expiring refresh tokens to manage
- ✅ Recommended by Google for enterprise workflows

## Prerequisites

- Google Cloud Project
- Chrome Web Store Developer account
- Extension already published in Chrome Web Store

## Step-by-Step Setup

### 1. Enable Chrome Web Store API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. In the search bar, type "Chrome Web Store API"
4. Click on the API and click **Enable**

### 2. Create a Service Account

1. In Google Cloud Console, navigate to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in the details:
   - **Name**: `chrome-webstore-publisher` (or any name you prefer)
   - **Description**: "Service account for automated Chrome Web Store deployments"
4. Click **Create and Continue**
5. **Skip** granting permissions (not needed at this stage)
6. Click **Done**

### 3. Create Service Account Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create**
6. A JSON file will download automatically - **save this securely**

The JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "chrome-webstore-publisher@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 4. Link Service Account to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click on **Account** (gear icon in top right)
3. Scroll to **Service Accounts** section
4. Click **Link Service Account**
5. Enter the service account email from step 3 (ends with `@[project-id].iam.gserviceaccount.com`)
6. Click **Link**

**Important:** Currently, you can only link **one service account** per Chrome Web Store publisher account.

### 5. Get Your Publisher ID

You'll need your Publisher ID for API calls:

1. In the Chrome Web Store Developer Dashboard
2. The URL will look like: `https://chrome.google.com/webstore/devconsole/[PUBLISHER_ID]`
3. Copy the `PUBLISHER_ID` (long alphanumeric string)

### 6. Save Credentials Locally

1. Rename your downloaded JSON key file to `service-account-key.json`
2. Move it to your project's `secrets/` directory:
   ```bash
   mv ~/Downloads/your-project-*.json secrets/service-account-key.json
   ```

3. Create a new secrets file `secrets/service-account-config.json`:
   ```json
   {
     "type": "service_account",
     "publisherId": "YOUR_PUBLISHER_ID_HERE",
     "extensionId": "jelomlaehalbblopojchlcibdemonfef",
     "serviceAccountKeyPath": "./secrets/service-account-key.json"
   }
   ```

### 7. Update GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

   - `CHROME_PUBLISHER_ID`: Your publisher ID from step 5
   - `CHROME_EXTENSION_ID`: `jelomlaehalbblopojchlcibdemonfef`
   - `SERVICE_ACCOUNT_KEY`: The entire contents of your `service-account-key.json` file

## Security Best Practices

1. **Never commit service account keys to Git**
   - Add `secrets/*.json` to `.gitignore` (already done)

2. **Restrict key file permissions** (Linux/Mac):
   ```bash
   chmod 600 secrets/service-account-key.json
   ```

3. **Rotate keys periodically**:
   - Create a new key every 90 days
   - Delete old keys from Google Cloud Console

4. **Use separate service accounts** for different environments:
   - One for local development
   - One for CI/CD
   - Different accounts for different extensions

5. **Monitor usage**:
   - Check [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Review audit logs regularly

## Verification

Test that your service account is working:

```bash
npm run test-auth
```

This will authenticate with your service account and verify access without publishing.

## Troubleshooting

### "Service account not found"
- Ensure the service account email is correct
- Verify it's linked in Chrome Web Store Developer Dashboard

### "Insufficient permissions"
- Re-link the service account in the Developer Dashboard
- Make sure Chrome Web Store API is enabled

### "Invalid key file"
- Verify the JSON key file is valid JSON
- Ensure it hasn't been modified
- Try downloading a fresh key from Google Cloud Console

### "Publisher ID not found"
- Double-check your Publisher ID from the Developer Dashboard URL
- It should be a long alphanumeric string

## Migration from OAuth

If you're currently using OAuth with refresh tokens:

1. Complete the service account setup above
2. Test deployment with service account authentication
3. Once verified, you can remove old OAuth credentials
4. Update deployment scripts to use service account method

## API Version Note

The Chrome Web Store API has two versions:

- **V1**: Current version (supported until October 15, 2026)
- **V2**: New version with better service account support

Our implementation uses the appropriate version based on the `chrome-webstore-upload` library. Google recommends migrating to V2 before the V1 deprecation date.

## References

- [Chrome Web Store Service Accounts Documentation](https://developer.chrome.com/docs/webstore/service-accounts)
- [Chrome Web Store API V2](https://developer.chrome.com/blog/cws-api-v2)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
