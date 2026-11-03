# Deployment guide for `Chrome Web Store`

Deployments authenticate as a service account without stored keys:
`GitHub Actions` federates its `OIDC` token, and local runs impersonate
the service account.

## Setup

Follow the [setup guide](./service-account-setup.md) or the
[quick start](./QUICKSTART-SERVICE-ACCOUNT.md) checklist.

## Commands

| Command                       | Effect                                              |
| :---------------------------- | :-------------------------------------------------- |
| `npm run test-auth`           | Mint a token and read the store item; never uploads |
| `npm run deploy`              | Test, build, upload, and publish                    |
| `npm run deploy -- --dry-run` | Test, build, and upload; skip publishing            |

`deploy` refuses to upload while the store reviews a previous
submission.

## Configuration

`secrets/service-account-config.json` (`git-crypt` encrypts it):

```json
{
  "type": "service_account",
  "publisherId": "4a684ed8-70ab-41d7-a0f1-21f8bd9c88fa",
  "extensionId": "jelomlaehalbblopojchlcibdemonfef"
}
```

Authentication reads the identity from Application Default Credentials
(`ADC`), never from the config.

## `GitHub Actions`

| Workflow        | Trigger                                 | Effect                             |
| :-------------- | :-------------------------------------- | :--------------------------------- |
| `deploy.yml`    | Release published                       | Build, upload, publish             |
| `test-auth.yml` | Manual: `gh workflow run test-auth.yml` | Verify federation and store access |

Required repository secrets:

- `CHROME_PUBLISHER_ID`
- `CHROME_EXTENSION_ID`

## Troubleshooting

### "Service account authentication failed"

1. Run `npm run test-auth` to see the underlying error.
2. Locally, repeat the
   [impersonated `ADC` login](./service-account-setup.md#5-allow-local-impersonation).
3. See the
   [setup guide troubleshooting](./service-account-setup.md#troubleshooting).

### "A previous submission is still pending review"

Wait for the review to finish, or cancel it in the
[developer dashboard](https://chrome.google.com/webstore/devconsole).

### "Extension zip file not found"

Run `npm run build` to create the release package.

## Security notes

- No long-lived credential exists: issued tokens expire within an hour.
- `git-crypt` encrypts the configuration in `secrets/`.
