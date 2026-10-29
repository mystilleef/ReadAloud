# Agent

## Rules

- **MANDATORY:** Consult `ORIENT.md` before editing/writing code.
- When practical, only write testable, asynchronous, non-blocking code.
- After edits: run `npm run check`.
- After task completion: run `npm run verify`.

### Testing

- Read `TESTING.md` before writing tests.

## Gotchas

- `git-crypt` encrypts `secrets/**`; only `*.example.json` stays
  plaintext.
- Never run `npm run release` or `npm run deploy` unprompted—both
  publish to the Chrome Web Store.

## Commands

- `npm run check`—type-check, auto-fix lint (incl. unsafe fixes)
- `npm test`—full test suite
- `npm run verify`—comprehensive verification

### Constraints

Run scripts exactly as named. **Never** expand internals or pipe `npm`
commands—redirect output to a file first, then inspect:

```sh
# Forbidden — causes freezes
npm test 2>&1 | head -n 10
npm test | tail -n 10

# Approved
npm test > tmp.txt && cat tmp.txt | head -n 10
npm run verify
```

## Workflow

**CI:** GitHub release publish → `deploy.yml` → build, deploy to Chrome
Web Store.
