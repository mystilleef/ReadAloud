# Technology Stack: ReadAloud

## Core Technologies
- **Language**: **TypeScript** - Provides static typing and modern JavaScript features for robust development.
- **Build System**: **Vite** with **@crxjs/vite-plugin** - Handles fast bundling and hot module replacement specifically for Chrome extensions.
- **Reactive Programming**: **RxJS** - Manages asynchronous event streams (e.g., text selection, TTS events) with powerful operators.
- **Extension Framework**: **Chrome Manifest V3** - Adheres to the latest security and performance standards for Chrome extensions.

## Quality Assurance
- **Linting & Formatting**: **Biome** - Ensures consistent code style and identifies potential issues with high performance.
- **Testing**: **Vitest** - Executes unit and integration tests with a focus on speed and compatibility with the Vite ecosystem.
- **Environment**: **jsdom** - Simulates a browser environment for testing DOM-dependent logic.

## Deployment & Automation
- **CI/CD**: **GitHub Actions** - Automates testing and deployment workflows.
- **Store Upload**: **chrome-webstore-upload** - Facilitates programmatic updates to the Chrome Web Store.
- **Release Management**: Custom scripts for version bumping and artifact generation.

## Libraries & Utilities
- **Messaging**: **@extend-chrome/messages** - Simplifies communication between background and content scripts.
- **Storage**: **@extend-chrome/storage** - Provides a typed wrapper for Chrome's storage API.
