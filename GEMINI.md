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

**Caution:** The `npm run release` command triggers various GitHub Actions, including a code review, when the extension is deployed to the Google Chrome Web Store. Therefore, it should be used with extreme caution.

## Releasing

The release process is automated. To release a new version, follow these steps:

1.  **Prerequisites:**
    *   Ensure you are on the `main` branch.
    *   Your working directory must be clean (no uncommitted changes).
    *   Your local `main` branch must be in sync with `origin/main`.
    *   You must have the [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`).

2.  **Run the release command:**

    ```bash
    npm run release -- <major|minor|patch>
    ```

    Replace `<major|minor|patch>` with the type of version bump you want to perform.

3.  **Automated Process:**
    The `npm run release` command will:
    *   Bump the version in `package.json`.
    *   Build the extension.
    *   Commit the version bump.
    *   Create a new git tag.
    *   Push the commit and tag to the `main` branch.
    *   Create a new release on GitHub.

4.  **Deployment:**
    Creating a new release on GitHub will automatically trigger the "Deploy to Chrome Web Store" GitHub Action. This action will build the extension, package it, and upload it to the Chrome Web Store for review and publishing.

## Development Conventions

The project uses Biome for code formatting and linting. The configuration can be found in the `biome.jsonc` file. It is recommended to use an editor extension to automatically format code on save.

### Node.js & TypeScript Best Practices

*   **Strict Type-Checking:** `tsconfig.json` is configured to be as strict as possible to catch errors early.
*   **ES Modules:** Use `import`/`export` syntax for all modules.
*   **Asynchronous Code:** Use `async/await` for all asynchronous operations, ensuring proper error handling with `try...catch` blocks.
*   **SOLID Principles:** Apply SOLID principles to create modular, maintainable, and testable code.
*   **Clear Contracts:** Use `interface` and `type` to define clear data structures and contracts.
*   **Security:** Never commit secrets. Validate and sanitize all external inputs.
*   **Testing:** Write unit and integration tests to ensure code quality and prevent regressions.

### Core Protocol: Verification-First Development

Our primary function is not to write code, but to produce **verifiable solutions**. Before we devise a solution, we must first answer the question: ***"How will we prove this is correct?"*** This discipline governs the entire development lifecycle.

**1. The Mindset: Design for Testability**
The commitment to verification begins with design. All systems we architect and code we write must be inherently testable. This principle guides our choices towards modularity, pure functions, dependency injection, and clear interfaces, ensuring every component can be validated.

**2. The Strategy: A Multi-Layered Approach**
To ensure complete confidence, verification must occur at multiple layers. For any given task, we will formulate a strategy that includes:
*   **Internal Verification (Unit & Integration Tests):** To validate the correctness of the code's internal logic and the interactions between components.
*   **External Verification (Acceptance & E2E Tests):** To validate that the system meets the user's requirements from an external perspective.

All verification methods must be **automated and reproducible**.

**3. The Practice: Test-Driven Development (TDD)**
For internal verification, our default practice is Test-Driven Development. This is the **"Red-Green-Refactor"** cycle:
1.  **RED:** First, write a failing automated test that captures the requirements.
2.  **GREEN:** Write the simplest possible code to make that test pass.
3.  **REFACTOR:** Clean up and improve the implementation, with the test suite as a safety net.

This practice ensures that every line of code is written with a clear purpose and is verifiable by default.

**4. Mandatory Verification Checklist**
A task is not considered "done" until this checklist is complete and verified:
*   `[ ]` All new code is covered by automated tests.
*   `[ ]` All project-specific tests passed (e.g., `npm run test`, `pytest`).
*   `[ ]` All project-specific linters and quality checks passed (e.g., `biome check .`, `npm run lint`).
*   `[ ]` The application builds successfully without errors.


All source code is located in the `src` directory. The main files are:

*   `background.ts`: This script handles the main extension logic, including creating context menus, managing text-to-speech (TTS) operations, and handling user commands.
*   `content.ts`: This script runs on web pages and is responsible for detecting text selections and sending them to the background script for processing.
*   `reader.ts`: This module contains the core text-to-speech logic.
*   `storage.ts`: This module provides a simple key-value storage system for the extension's settings.
*   `message.ts`: This module defines the messages that are passed between the background script and the content scripts.
*   `constants.ts`: This module defines various constants used throughout the extension.
*   `context.ts`: This module manages the creation and interaction of context menus in the Chrome extension.
*   `counter.ts`: This module implements a badge counter for the extension icon and updates the browser icon.
*   `error.ts`: This module provides utility functions for logging errors.
*   `ttshandler.ts`: This module handles the core text-to-speech (TTS) operations and events.
*   `utils.ts`: This module contains various utility functions, including TTS control and messaging to content scripts.
