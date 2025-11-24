# `CLAUDE.md`

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

## Project overview

ReadAloud functions as a Chrome Manifest V3 extension that provides
text-to-speech functionality for selected text on web pages. Users can
trigger reading via:

- Triple-click to select a paragraph
- Manual text selection
- Toolbar button (click to start/stop)
- Keyboard shortcut: `Ctrl+Shift+Space` (configured in `manifest.json`
  under `commands`)

The extension uses Chrome's built-in `TTS` API with customizable voice,
rate, and pitch settings accessible through context menus.

## Development commands

### Building and development

```bash
npm run build          # TypeScript compilation + Vite build → dist/
npm run watch          # Development mode with auto-rebuild
npm run clean          # Remove dist/ and build artifacts
```

### Testing and coverage

```bash
npm test               # Run all tests with Vitest
npm run coverage       # Generate test coverage report
```

### Deployment and release

```bash
npm run release        # Bump version and create release
npm run deploy         # Deploy to Chrome Web Store (requires service account)
npm run test-auth      # Verify service account credentials
```

### Code quality

The project uses **`Biome`** (not `ESLint`) for linting and formatting.
The configuration explicitly disables `ESLint` via `eslint.config.js`.
The `biome.jsonc` file contains the `Biome` configuration, which runs
automatically during the build process via the `vite-plugin-biome`
plugin with `applyFixes: true` and `failOnError: true`.

## Architecture

### Core components

**Background Service Worker (`src/background.ts`)**

- Orchestrates extension lifecycle and command handling
- Uses RxJS streams with throttle/debounce for event management:
  - `readStream`: Handles incoming text selections (750 ms
    throttle+debounce)
  - `refreshTtsStream`: Keeps `TTS` alive (7 s throttle+debounce)
  - `gotEndSpeakingStream`: Cleanup on speech end (500 ms
    throttle+debounce)
- Manages badge counter showing queued phrases
- Coordinates between content scripts and `TTS` engine

**Content Script (`src/content.ts`)**

- Injected into all frames via `manifest.json`
- Monitors `document.onselectionchange` (500 ms `debounce`)
- Implements `TTS` refresh timer (5 s intervals during speaking) to
  prevent Chrome's `TTS` engine from timing out
- Sends messages to background script for text processing

**Message system (`src/message.ts`)**

- Built on `@extend-chrome/messages` library
- Defines typed message streams (for example, `READ`,
  `STARTED_SPEAKING`, `ENDED_SPEAKING`)
- All messages follow the pattern: `[sendFn, streamObservable, ?waitFn]`

**`TTS` pipeline**

1. Text selection → `content.ts` sends to background
2. `background.ts` splits text into phrases via `splitPhrases()` (640
   char chunks)
3. `reader.ts` `enqueues` phrases with options
4. `ttshandler.ts` processes `TTS` events (start/end/error/interrupted)
5. Badge counter updates to show progress

**Storage (`src/storage.ts`)**

- Uses `@extend-chrome/storage` wrapper around `chrome.storage.sync`
- Stores: `voiceName` (default: "Google `US` English"), `rate` (1-2x),
  `pitch` (0.8-1.2)
- Changes trigger context menu updates via `chrome.storage.onChanged`

**Context Menus (`src/context.ts`)**

- Dynamic radio menus for Voice/Speed/Pitch selection
- Menu IDs include extension ID to avoid conflicts
- Speed options: 1.0x - 2.0x (0.1x increments)
- Pitch options: 0.8 - 1.2 (0.1 increments)

### Build system

**`Vite` configuration (`vite.config.ts`)**

- `@crxjs/vite-plugin`: Handles Chrome extension bundling and manifest
  processing
- Injects `version` from `package.json` into `manifest.json` at build
  time
- `vite-plugin-biome`: Runs `Biome` checks during build
- `vite-plugin-static-copy`: Copies icon assets to `dist/images/`
- `vite-plugin-zip-pack`: Creates `releases/readaloud-{version}.zip` for
  distribution
- Configures `Vitest` with `jsdom` environment, test `globals`, and
  coverage reporting

**TypeScript (`tsconfig.json`)**

- Strict mode enabled with all safety flags
- Target: `ESNext` with `ESM` modules
- Uses composite builds with incremental compilation
- Types: `@types/chrome`, `@types/web`, `@types/node`
- Key flags: `exactOptionalPropertyTypes`, `noUnusedLocals`,
  `noImplicitReturns`

### Deployment

#### **Automated deployment**

- Triggered on GitHub release publication
  (`.github/workflows/deploy.yml`)
- Uses service account authentication (not `OAuth`)
- Secrets required: `SERVICE_ACCOUNT_KEY`, `CHROME_PUBLISHER_ID`,
  `CHROME_EXTENSION_ID`
- Build artifacts stored in `releases/` directory

#### **Manual deployment**

1. Run `npm run build` to create zip in `releases/`
2. Ensure `secrets/service-account-config.json` and
   `secrets/service-account-key.json` exist
3. Run `npm run deploy` (or `npm run deploy -- --dry-run` to skip
   publish)

**Service account files** (stored in `secrets/`, encrypted with
git-crypt):

- `service-account-config.json`: Contains `publisherId`, `extensionId`,
  `serviceAccountKeyPath`
- `service-account-key.json`: Google service account private key

## Important patterns

### Message flow

All extension-internal messages check sender ID to prevent external
interference:

```typescript
if (sender.id !== EXTENSION_ID) return;
```

### Error handling

Use `logError()` from `src/error.ts` for consistent error logging.
Chrome API callbacks use `logChromeErrorMessage()` to check for runtime
errors.

### Text splitting

The `splitPhrases()` function in `src/utils.ts` chunks text into
640-character segments to avoid Chrome `TTS` engine limitations. It
preserves word boundaries using a regex pattern.

### `TTS` `keep-alive`

Content script sends periodic refresh messages every 5 seconds while
speaking to prevent Chrome from stopping the `TTS` engine during long
reads.

### Testing

**Test setup (`src/__tests__/`)**

- Uses `Vitest` with `jsdom` environment for `DOM` testing
- Test files located in `src/__tests__/` directory
- Setup file: `src/__tests__/setup.ts` provides global test
  configuration
- Coverage configured to include all `src/**/*.ts` files (excluding
  tests)
- Tests verify core functionality: message passing, `TTS` handling,
  content scripts, storage, and utilities

## File organization

- `src/`: TypeScript source files
- `src/__tests__/`: `Vitest` test files
- `dist/`: Build output (git-ignored)
- `releases/`: Versioned zip files (git-ignored)
- `images/`: Extension icons and assets
- `scripts/`: Deployment and release automation
- `secrets/`: Service account credentials (git-crypted)
- `docs/`: Deployment and setup documentation

## Chrome extension loading

After `npm run build`, load the unpacked extension from the `dist/`
directory in Chrome at `chrome://extensions` with Developer Mode
enabled.
