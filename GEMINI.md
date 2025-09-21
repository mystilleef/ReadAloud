# Project Overview

This project is a Chrome extension called "ReadAloud" that reads selected text aloud. It is built with TypeScript and Vite, and it uses the `@extend-chrome/messages` and `@extend-chrome/storage` libraries to interact with Chrome's extension APIs. The extension also uses `rxjs` to manage asynchronous events.

## Building and Running

To build the extension, run the following command:

```bash
npm run build
```

This will create a `dist` directory containing the bundled extension files. To install the extension in Chrome, open the Extensions page (`chrome://extensions`), enable "Developer mode", and click "Load unpacked". Then, select the `dist` directory.

To watch for changes and automatically rebuild the extension, run:

```bash
npm run watch
```

## Development Conventions

The project uses Biome for code formatting and linting. The configuration can be found in the `biome.jsonc` file. It is recommended to use an editor extension to automatically format code on save.

The project also uses ESLint for additional linting. The configuration can be found in the `eslint.config.js` file.

All source code is located in the `src` directory. The main files are:

*   `background.ts`: This script handles the main extension logic, including creating context menus, managing text-to-speech (TTS) operations, and handling user commands.
*   `content.ts`: This script runs on web pages and is responsible for detecting text selections and sending them to the background script for processing.
*   `reader.ts`: This module contains the core text-to-speech logic.
*   `storage.ts`: This module provides a simple key-value storage system for the extension's settings.
*   `message.ts`: This module defines the messages that are passed between the background script and the content scripts.
