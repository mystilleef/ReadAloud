# Service account setup for the `Chrome Web Store`

One-time setup for keyless deployments: `GitHub Actions` and local runs
both act as one service account, so no key file or refresh token needs
storing or rotating.

## How authentication works

- **CI**: [Workload Identity Federation][wif] trades the workflow's
  `GitHub` `OIDC` token for a short-lived service account token.
- **Local**: a `gcloud` login impersonates the service account through
  Application Default Credentials (`ADC`).
- **Store**: the developer dashboard links the service account, granting
  it access to every extension of the publisher.
- Works with Google accounts enrolled in the `Advanced Protection
  Program`.

## Project values

| Item            | Value                                                                   |
| :-------------- | :---------------------------------------------------------------------- |
| Project         | `readaloud-377407` (number `164998752727`)                              |
| Service account | `speakout-webstore-deployment@readaloud-377407.iam.gserviceaccount.com` |
| Pool, provider  | `github-pool`, `readaloud`                                              |
| Repository      | `mystilleef/ReadAloud` (ID `203431873`)                                 |
| Extension ID    | `jelomlaehalbblopojchlcibdemonfef`                                      |

- The dashboard links one service account per publisher, so ReadAloud
  shares the service account with the publisher's other extensions.

## Setup

Set shell variables for the commands below:

```sh
PROJECT=readaloud-377407
PROJECT_NUMBER=164998752727
SA="speakout-webstore-deployment@${PROJECT}.iam.gserviceaccount.com"
REPO_ID="$(gh api repos/mystilleef/ReadAloud --jq .id)"
```

### 1. Enable `APIs`

```sh
gcloud services enable chromewebstore.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com --project="${PROJECT}"
```

### 2. Create the service account

Skip when the publisher already links one; reuse it instead.

```sh
gcloud iam service-accounts create speakout-webstore-deployment \
  --project="${PROJECT}" --display-name="Chrome Web Store deployment"
```

Skip project roles; the store link alone grants access.

### 3. Link the service account to the store

1. Open the
   [developer dashboard](https://chrome.google.com/webstore/devconsole)
2. **Account** (gear icon) → **Service Accounts** → **Link Service
   Account**
3. Enter the service account email

The dashboard `URL` contains the publisher ID:
`https://chrome.google.com/webstore/devconsole/[PUBLISHER_ID]`

### 4. Trust `GitHub Actions`

Create the pool (once per project), then a provider restricted to this
repository:

```sh
gcloud iam workload-identity-pools create github-pool \
  --project="${PROJECT}" --location=global \
  --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc readaloud \
  --project="${PROJECT}" --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_id=assertion.repository_id" \
  --attribute-condition="assertion.repository_id == '${REPO_ID}'"

gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --project="${PROJECT}" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository_id/${REPO_ID}"
```

- Matching the numeric repository ID blocks forks and look-alike
  repositories; fork pull requests never receive an `OIDC` token.
- `deploy.yml` and `test-auth.yml` reference the provider and service
  account.

### 5. Allow local impersonation

```sh
gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --project="${PROJECT}" --role=roles/iam.serviceAccountTokenCreator \
  --member="user:$(gcloud config get-value account)"

gcloud auth application-default login --impersonate-service-account="${SA}"
```

The login replaces the machine-wide `ADC` file; other tools reading
`ADC` then act as the service account too.

### 6. Configure the project

`secrets/service-account-config.json` (`git-crypt` encrypts it):

```json
{
  "type": "service_account",
  "publisherId": "YOUR_PUBLISHER_ID",
  "extensionId": "jelomlaehalbblopojchlcibdemonfef"
}
```

### 7. Add `GitHub` secrets

**Settings** → **Secrets and variables** → **Actions**:

- `CHROME_PUBLISHER_ID`: the publisher ID
- `CHROME_EXTENSION_ID`: `jelomlaehalbblopojchlcibdemonfef`

### 8. Verify

- Local: `npm run test-auth`
- CI: `gh workflow run test-auth.yml`, then `gh run watch`

Both mint a token and read the store item; neither uploads nor
publishes.

## Security best practices

- Create no service account keys; federation and impersonation replace
  them.
- Keep the provider condition pinned to this repository.
- Grant `roles/iam.serviceAccountTokenCreator` only to maintainers who
  deploy locally.
- Review service account activity in the
  [audit logs](https://console.cloud.google.com/logs).

## Troubleshooting

### `Permission 'iam.serviceAccounts.getAccessToken' denied`

- Confirm step 5 grants the role to the active `gcloud` account.
- Wait a few minutes; new `IAM` bindings propagate gradually.

### `Could not load the default credentials`

- Locally, run the `ADC` login from step 5.
- In CI, confirm the workflow grants `id-token: write` and authenticates
  before running `npm`.

### `rejected by the attribute condition`

- Confirm the provider condition and the step 4 binding both match the
  repository ID.

### `403 Forbidden` from the store

- Confirm the dashboard links the service account (step 3).

### `Chrome Web Store API has not been used`

- Enable the `API` (step 1).

## References

- [Chrome Web Store service accounts](https://developer.chrome.com/docs/webstore/service-accounts)
- [Chrome Web Store API V2](https://developer.chrome.com/blog/cws-api-v2)
- [Workload Identity Federation with deployment pipelines][wif]
- [`google-github-actions/auth`](https://github.com/google-github-actions/auth)

[wif]:
  https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
