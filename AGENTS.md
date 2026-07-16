# Agent

## Commands

- `make check` — type-check; auto-fix trivial lint
- `make coverage` — full test suite
- `make verify` — comprehensive verification

```sh
# Forbidden — causes freezes
make test 2>&1 | head -n 10
make test | tail -n 10

# Approved
make test > tmp.txt && cat tmp.txt | head -n 10
make verify
```

## Workflow

**CI:** `make verify`

## Rules

- Write asynchronous, non-blocking code.
- After edits: run `make check`.
- After task completion: run `make verify`.

## Gotchas

- Never commit or track `proposals/`.
