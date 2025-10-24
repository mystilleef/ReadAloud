# Chrome Web Store Deployment Guide

This project uses **Service Account authentication** for deploying to the Chrome Web Store.

## Prerequisites

- Google Cloud account with Chrome Web Store API enabled
- Service account created and linked to Chrome Web Store
- Service account credentials configured locally

## Quick Start

If you haven't set up service account authentication yet, follow the [Quick Start Guide](./QUICKSTART-SERVICE-ACCOUNT.md).

## Commands

### Test Authentication

Verify your service account credentials are working:

```bash
npm run test-auth
```

This will:
- Load your service account configuration
- Request an access token from Google
- Display the result (does not deploy anything)

### Deploy Extension

Deploy your extension to Chrome Web Store:

```bash
npm run deploy
```

This will:
1. Build the extension (`npm run build`)
2. Authenticate using your service account
3. Upload the extension ZIP file
4. Publish the extension

### Dry Run (Upload Only)

Upload the extension without publishing:

```bash
npm run deploy -- --dry-run
```

Useful for testing the upload process without making the extension public.

## Configuration Files

All configuration files are in the `secrets/` directory (encrypted with git-crypt):

- **`service-account-key.json`** - Your Google Cloud service account key
- **`service-account-config.json`** - Extension configuration:
  ```json
  {
    "type": "service_account",
    "publisherId": "4a684ed8-70ab-41d7-a0f1-21f8bd9c88fa",
    "extensionId": "jelomlaehalbblopojchlcibdemonfef",
    "serviceAccountKeyPath": "./secrets/service-account-key.json"
  }
  ```

## GitHub Actions (CI/CD)

Deployments are automatically triggered when you publish a GitHub release.

### Required GitHub Secrets

Add these secrets to your repository (Settings → Secrets → Actions):

1. **`SERVICE_ACCOUNT_KEY`**
   - The entire contents of your `service-account-key.json` file

2. **`CHROME_PUBLISHER_ID`**
   - Your Chrome Web Store Publisher ID: `4a684ed8-70ab-41d7-a0f1-21f8bd9c88fa`

3. **`CHROME_EXTENSION_ID`**
   - Your extension ID: `jelomlaehalbblopojchlcibdemonfef`

### Workflow File

The deployment workflow is located at `.github/workflows/deploy.yml`.

It runs automatically when you publish a release:
1. Builds the extension
2. Authenticates with service account
3. Uploads to Chrome Web Store
4. Publishes the extension

## Troubleshooting

### "Service account authentication failed"

**Check:**
1. Service account key file exists at `secrets/service-account-key.json`
2. Chrome Web Store API is enabled in Google Cloud Console
3. Service account is linked in Chrome Web Store Developer Dashboard

### "Extension zip file not found"

**Solution:** Run `npm run build` first to create the release package.

### "Error 403: Forbidden"

**Cause:** Service account not linked to Chrome Web Store.

**Solution:**
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click Account (gear icon)
3. Scroll to Service Accounts
4. Link the service account email above

### "Chrome Web Store API has not been used"

**Cause:** API not enabled in Google Cloud Console.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project
3. Search for "Chrome Web Store API"
4. Enable the API

## Security Notes

- Service account credentials are encrypted using **git-crypt**
- Never share your service account key file
- The key file is committed to the repository (encrypted)
- GitHub Actions receives the key via encrypted secrets

## Further Reading

- [Service Account Setup Guide](./service-account-setup.md) - Detailed setup instructions
- [Quick Start Guide](./QUICKSTART-SERVICE-ACCOUNT.md) - Get started in 10 minutes
