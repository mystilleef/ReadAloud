# ReadAloud

**`Read Aloud`** is a simple Chrome extension to read aloud
selected text.

## Usage

- Triple click to read a paragraph
- Manually select text to read selection
- Use the toolbar icon to start or stop reading selected
  text
- `Right-click` then **`Read Aloud > Voices`** to change
  reading voice
- `Right-click` then **`Read Aloud > Speed`** to change
  reading rate
- `Right-click` then **`Read Aloud > Pitch`** to change
  reading pitch
- `Right-click` then **`Read Aloud > Reset to Default`** to
  set default options

## Installation

Install this extension from the
[Chrome Web Store.](https://chrome.google.com/webstore/detail/jelomlaehalbblopojchlcibdemonfef)

## Development

To build the extension, run the following command:

```bash
npm run build
```

This will create a `dist` directory containing the bundled extension files. To install the extension in Chrome, open the Extensions page (`chrome://extensions`), enable "Developer mode", and click "Load unpacked". Then, select the `dist` directory.

To watch for changes and automatically rebuild the extension, run:

```bash
npm run watch
```

## Deployment

The deployment process is automated using GitHub Actions. When a new release is published on GitHub, the extension is automatically built and deployed to the Chrome Web Store.

For more details on the deployment process and how to set it up, please refer to the following documents:

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Quick Start: Service Account Authentication](./docs/QUICKSTART-SERVICE-ACCOUNT.md)
- [Service Account Setup Guide](./docs/service-account-setup.md)
