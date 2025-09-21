# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReadAloud is a Chrome extension that provides text-to-speech functionality for selected text on web pages. Built with TypeScript and uses Vite as the build system with Chrome Extensions Manifest V3.

## Development Commands

- `npm run build` - Build the extension for production (TypeScript compile + Vite build)
- `npm run watch` - Development mode with hot reload
- `npm run clean` - Clean build artifacts
- `npm run preview` - Preview the built extension

## Code Quality & Linting

- Uses **Biome** for linting and formatting (not ESLint/Prettier)
- Configuration in `biome.jsonc`
- Biome is integrated into Vite build process with `failOnError: true`
- Formatting: 2 spaces, multiline attributes
- Run via Vite plugin during build/watch

## Architecture

### Extension Structure
- **Background Script** (`background.ts`): Service worker handling extension lifecycle, context menus, commands, and TTS coordination
- **Content Script** (`content.ts`): Injected into web pages, handles text selection and communicates with background
- **Message System** (`message.ts`): Uses `@extend-chrome/messages` for type-safe communication between background and content scripts

### Key Components
- **TTS Handler** (`ttshandler.ts`): Manages Chrome TTS API, event handling, and speech lifecycle
- **Reader** (`reader.ts`): High-level TTS interface wrapping the TTS handler
- **Storage** (`storage.ts`): Manages extension settings (voice, rate, pitch) via `@extend-chrome/storage`
- **Context Menu** (`context.ts`): Dynamically creates right-click context menus for voice/speed/pitch selection

### Message Flow
1. User selects text → Content script detects selection change
2. Content script sends "READ" message to background
3. Background script calls TTS API with stored options
4. TTS events flow back through content script for UI updates
5. Background manages speech state and badge counter

### State Management
- Uses RxJS streams for message handling with throttling/debouncing
- Chrome storage for persistent settings (voice, rate, pitch)
- Badge counter tracks active speech instances

## Build System

- **Vite** with `@crxjs/vite-plugin` for Chrome extension development
- **Static assets** copied to `images/` folder (icons for different states)
- **ZIP packaging** via `vite-plugin-zip-pack` to `releases/` folder
- Build outputs extension files to `dist/` directory

## Key Dependencies

- `@extend-chrome/messages` - Type-safe extension messaging
- `@extend-chrome/storage` - Chrome storage API wrapper
- `rxjs` - Reactive streams for message handling
- `@crxjs/vite-plugin` - Vite Chrome extension plugin

## Commit Message Standards

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for all commit messages:

**Format**: `<type>[optional scope]: <description>`
- Keep the entire commit message under 80 characters
- Use present tense, imperative mood ("add" not "added")
- No period at the end of the description

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic changes)
- `refactor` - Code refactoring (no new features or bug fixes)
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks

**Examples**:
- `feat(tts): add voice pitch control`
- `fix(context): resolve menu type errors`
- `docs: update README installation steps`
- `refactor(storage): simplify options handling`