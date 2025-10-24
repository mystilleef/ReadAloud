# Agent Guidelines

## Build/Lint/Test
- **Build**: `npm run build` (runs tsc + vite, Biome auto-fixes during build)
- **Watch**: `npm run watch` (dev mode with auto-rebuild)
- **Clean**: `npm run clean` (remove dist/ and build artifacts)
- **No test suite**: This project has no automated tests. Manual testing via loading unpacked extension from `dist/` at `chrome://extensions`

## Code Style
- **Linter**: Use Biome (NOT ESLint). Config in `biome.jsonc`. Biome runs automatically during build with `applyFixes: true`
- **Imports**: Biome auto-organizes imports. Import from `./constants`, `./utils`, `./error` before external deps like `rxjs`
- **Formatting**: 2-space indentation (Biome + .editorconfig), Unix LF line endings
- **Types**: Strict TypeScript with all safety flags. Use explicit types, avoid `any`. Chrome API types from `@types/chrome`
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces, UPPER_CASE for constants
- **Error Handling**: Always use `logError()` from `src/error.ts`. Add `.catch(logError)` to all promises. Use `logChromeErrorMessage()` for Chrome API callbacks
- **Async**: Prefer async/await over callbacks. All Chrome API message handlers check `sender.id !== EXTENSION_ID` for security
- **RxJS**: Use `pipe(throttleTime(), debounceTime())` pattern for event streams (see `background.ts`)
- **Comments**: Avoid comments unless documenting complex logic or non-obvious behavior

## Key Patterns
- Text splitting: Use `splitPhrases()` from `utils.ts` (640 char chunks) before TTS
- Message flow: All messages via `@extend-chrome/messages` streams (see `message.ts`)
- Version management: Version in `package.json` auto-injected into `manifest.json` during build
