# Quick Start: Service Account Authentication

This guide gets you up and running with service account authentication in **under 10 minutes**.

## Prerequisites

- Google Cloud account
- Chrome Web Store Developer account
- Extension already published

## Step-by-Step Setup

### 1. Enable Chrome Web Store API (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Search for "Chrome Web Store API" in the search bar
4. Click **Enable**

### 2. Create Service Account (2 minutes)

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `chrome-webstore-publisher`
4. Click **Create and Continue**
5. Skip permissions (click **Continue**, then **Done**)

### 3. Download Service Account Key (1 minute)

1. Click on your new service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON**
5. Click **Create** (file downloads automatically)
6. Save this file - **you'll need it in step 5**

### 4. Link to Chrome Web Store (2 minutes)

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **Account** (gear icon, top right)
3. Scroll to **Service Accounts**
4. Click **Link Service Account**
5. Enter the email from step 3 (format: `chrome-webstore-publisher@your-project.iam.gserviceaccount.com`)
6. Click **Link**

### 5. Get Your Publisher ID (30 seconds)

1. In Chrome Web Store Developer Dashboard
2. Look at the URL: `https://chrome.google.com/webstore/devconsole/[PUBLISHER_ID]`
3. Copy the `PUBLISHER_ID` (long alphanumeric string)

### 6. Configure Project (2 minutes)

```bash
# Create secrets directory (if it doesn't exist)
mkdir -p secrets

# Move your downloaded service account key
mv ~/Downloads/your-project-*.json secrets/service-account-key.json

# Create the service account config file
cat > secrets/service-account-config.json <<EOF
{
  "type": "service_account",
  "publisherId": "PASTE_YOUR_PUBLISHER_ID_HERE",
  "extensionId": "jelomlaehalbblopojchlcibdemonfef",
  "serviceAccountKeyPath": "./secrets/service-account-key.json"
}
EOF
```

Replace:
- `PASTE_YOUR_PUBLISHER_ID_HERE` with your Publisher ID from step 5

### 7. Test Authentication (30 seconds)

```bash
npm run test-auth
```

You should see:
```
✅ Service account authentication is working!
```

### 8. Deploy! (1 minute)

```bash
npm run deploy
```

Or for a dry run (uploads but doesn't publish):
```bash
npm run deploy -- --dry-run
```

## GitHub Actions Setup (Optional)

If you want automated deployments on release:

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:

   **SECRET NAME**: `SERVICE_ACCOUNT_KEY`
   **VALUE**: Paste the **entire contents** of `secrets/service-account-key.json`

   **SECRET NAME**: `CHROME_PUBLISHER_ID`
   **VALUE**: Your publisher ID from step 5

   **SECRET NAME**: `CHROME_EXTENSION_ID`
   **VALUE**: `jelomlaehalbblopojchlcibdemonfef`

3. Done! Now every release will auto-deploy.

## Troubleshooting

### "Service account not found"
→ Double-check the service account email is linked in Chrome Web Store Dashboard (step 4)

### "Chrome Web Store API has not been used"
→ Make sure you enabled the API in Google Cloud Console (step 1)

### "Failed to load service account config"
→ Make sure `secrets/service-account-config.json` exists and has correct values

### Still having issues?
→ See detailed troubleshooting in [Service Account Setup Guide](./service-account-setup.md#troubleshooting)

## What's Next?

- Read the [full service account guide](./service-account-setup.md) for advanced options

## Commands Reference

```bash
# Test authentication
npm run test-auth

# Deploy (build + upload + publish)
npm run deploy

# Deploy without publishing (dry run)
npm run deploy -- --dry-run

# Build only
npm run build
```

---

**Need help?** Open an issue.
