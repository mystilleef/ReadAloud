# Project: ReadAloud

## Project Overview

ReadAloud is a Chrome extension designed to read aloud selected text from web pages. It provides a seamless user experience by allowing users to trigger text-to-speech functionality through triple-clicking, manual text selection, or a dedicated toolbar icon. The extension leverages Chrome's built-in Text-to-Speech (TTS) API and offers customizable options for voice, reading rate, and pitch, accessible via a right-click context menu or a dedicated options page.

The project is built with TypeScript and uses Vite for bundling. It incorporates RxJS for reactive programming patterns and `@extend-chrome/messages` and `@extend-chrome/storage` for efficient communication and data management within the Chrome extension environment.

## Architecture

The extension follows a standard Chrome extension architecture with:

*   **Background Script (`src/background.ts`):** This service worker handles extension-wide events, commands (e.g., keyboard shortcuts), and manages the TTS stream. It orchestrates communication between the content script and the TTS engine.
*   **Content Script (`src/content.ts`):** Injected into all web pages, this script is responsible for detecting text selections (including triple-clicks) and sending the selected text to the background script for processing. It also manages refreshing the TTS state.
*   **Options Page (`options.html` and `src/options.ts`):** Provides a user interface for configuring TTS settings such as voice, reading rate, and pitch. These settings are persisted using Chrome's storage API.
*   **Core Logic (`src/reader.ts`, `src/ttshandler.ts`):** These modules encapsulate the primary text-to-speech functionality, including handling TTS events, managing speech interruptions, and error logging.

## Technologies Used

*   **Language:** TypeScript
*   **Bundler:** Vite
*   **Linting/Formatting:** Biome (ESLint is disabled in favor of Biome)
*   **Reactive Programming:** RxJS
*   **Chrome Extension APIs:** `@extend-chrome/messages`, `@extend-chrome/storage`
*   **Deployment:** GitHub Actions, Service Account authentication for Chrome Web Store

## Building and Running

### Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mystilleef/ReadAloud.git
    cd ReadAloud
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the extension:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory containing the bundled extension files.
4.  **Load in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the `dist` directory.
5.  **Watch for changes (development mode):**
    ```bash
    npm run watch
    ```
    This command will automatically rebuild the extension when changes are detected in the source files.

### Testing Authentication

To verify service account credentials for deployment:

```bash
npm run test-auth
```

### Deployment

Deployment to the Chrome Web Store is automated via GitHub Actions. When a new release is published on GitHub, the extension is automatically built and deployed.

For manual deployment or to understand the process in detail, refer to `docs/DEPLOYMENT.md`.

## Development Conventions

*   **Code Style:** The project uses Biome for code linting and formatting. ESLint is explicitly disabled.
*   **Testing:** (TODO: Add details on testing strategy if available, otherwise state that it's not explicitly defined or covered by automated tests.)
*   **Secrets Management:** Sensitive configuration files (e.g., service account keys) are stored in the `secrets/` directory and encrypted using `git-crypt`.

## Further Documentation

*   `docs/DEPLOYMENT.md`: Detailed guide on deploying the extension to the Chrome Web Store.
*   `docs/QUICKSTART-SERVICE-ACCOUNT.md`: Quick start guide for setting up service account authentication.
*   `docs/service-account-setup.md`: Comprehensive guide for service account setup.
