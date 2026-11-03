# Quick start for service account authentication

Checklist for keyless deployment; the
[setup guide](./service-account-setup.md) holds every command.

## Prerequisites

- `gcloud` and `gh` signed in
- Owner access to the Google Cloud project
- A `Chrome Web Store` developer account with a published extension

## Checklist

1. [Enable the `APIs`](./service-account-setup.md#1-enable-apis)
2. [Create or reuse the service account](./service-account-setup.md#2-create-the-service-account)
3. [Link it to the store](./service-account-setup.md#3-link-the-service-account-to-the-store);
   note the publisher ID
4. [Trust `GitHub Actions`](./service-account-setup.md#4-trust-github-actions)
5. [Allow local impersonation](./service-account-setup.md#5-allow-local-impersonation)
6. [Configure the project](./service-account-setup.md#6-configure-the-project)
7. [Add `GitHub` secrets](./service-account-setup.md#7-add-github-secrets)
8. Verify locally and in CI:

   ```sh
   npm run test-auth
   gh workflow run test-auth.yml
   ```

   Local success prints
   `✅ Service account authentication is working!`

9. Deploy: publish a `GitHub` release, or run `npm run deploy`.

Stuck? See
[troubleshooting](./service-account-setup.md#troubleshooting).
