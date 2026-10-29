# Testing

`Vitest` runs tests through the project's `Vite` pipeline—same plugins,
aliases, and `TypeScript` transforms—with `Jest`-compatible `APIs`,
snapshots, mocks, and fake timers.

## Requirements

- `Vitest` 5.0+, `Vite` 6.4+, `Node.js` 22.12+; check with
  `npx vitest -v`.
- List `vite` in `devDependencies`; `Vitest` 5 requires it as a peer.
- Import test `APIs` from `vitest`; never install `jest` or
  `@types/jest`.
  - `globals: true` injects them instead; add `"vitest/globals"` to
    `types` in `tsconfig.json`.
- `Vitest` strips types without checking them; run `tsc --noEmit`.

## Scope

- Prefer unit tests.
- Escalate to integration tests only when behavior crosses a system
  boundary.
- Reserve end-to-end tests for critical user flows.

## Commands

```bash
npx vitest run                     # Run every discovered test file once
npx vitest run src/parser          # Run files whose paths match a filter
npx vitest run -t "parses ports"   # Run tests whose full names match a regex
npx vitest list -t "parses ports"  # List matching tests without running them
npx vitest run --typecheck         # Also type-check *.test-d.ts files
npx vitest run --sequence.shuffle  # Shuffle files and tests; prints the seed
npx vitest run --repeats=20        # Rerun each test to expose flakiness
npx vitest run --no-isolate        # Share modules across files; leaks state
npx vitest run --coverage          # Report coverage
npx vitest run -u                  # Rewrite stored snapshots
```

- Discovery: `*.test.*`, `*.spec.*`; `*_test.*` and `*_spec.*` need a
  custom `include`.
- `vitest` without `run` enters watch mode in a `TTY`; scripts and
  agents call `vitest run`.
- `-t` matches the full name joined by `>`: `"parsePort > parses"`.
- A `-t` pattern matching zero tests skips every test and exits `0`;
  confirm matches with `vitest list`.
- Replay a shuffled order with `--sequence.seed=<seed>`.
- `--coverage` requires `@vitest/coverage-v8`.
- `CI=true` fails runs containing `.only` or missing snapshots.

## Configuration

```ts
// vitest.config.ts, or the `test` key of vite.config.ts
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"], // Runs before every test file
    restoreMocks: true, // Restores vi.spyOn spies before each test
    unstubEnvs: true, // Reverts vi.stubEnv before each test
    unstubGlobals: true, // Reverts vi.stubGlobal before each test
    env: {TZ: "UTC"}, // Pins the timezone
    coverage: {
      provider: "v8",
      include: ["src"], // Counts files no test imports
      // Fails --coverage runs below 90%
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
```

- `clearMocks` defaults to `true`: `Vitest` clears call history on every
  mock before each test.

Restore timers after every test from the setup file:

```ts
// test/setup.ts
import {afterEach, vi} from "vitest";

afterEach(() => {
  vi.useRealTimers(); // Also restores vi.setSystemTime
});
```

## Structure

- Name tests `verb + subject + condition + outcome`.
- Group related cases with `describe`.
- Keep each test focused on one behavior.
- Extract repeated setup into helpers or hooks; keep bodies lean.
- Extend existing suites for established units; add files only for new
  modules or distinct boundaries.
- Use `test.each` for input tables sharing one invariant; never
  copy-paste test bodies.

```ts
import {describe, expect, test} from "vitest";
import {parsePort} from "./config.ts";

describe("parsePort", () => {
  test.each([
    ["80", 80],
    ["65535", 65535]
  ])("parses %s as port %d", (input, port) => {
    expect(parsePort(input)).toBe(port);
  });

  test.each(["0", "65536", "-1"])("throws RangeError for %s", input => {
    expect(() => parsePort(input)).toThrow(RangeError);
  });
});
```

| Token  | Interpolates        |
| :----- | :------------------ |
| `%s`   | String              |
| `%d`   | Number              |
| `%i`   | Integer             |
| `%f`   | Float               |
| `%j`   | `JSON`              |
| `%o`   | Object              |
| `%#`   | Case index, 0-based |
| `%$`   | Case index, 1-based |
| `%%`   | Literal `%`         |
| `$key` | Object row property |

- `Vitest` lacks `%p`; use `%s` or `%o`.
- `test.for` passes each row as one argument plus the test context;
  prefer it when cases need context `expect`.

## Modifiers

| Modifier                     | Rule                                             |
| :--------------------------- | :----------------------------------------------- |
| `test.only`, `describe.only` | Local focus only; never commit                   |
| `test.skip`, `describe.skip` | Never commit                                     |
| `test.todo`                  | Planned coverage; reported, never run            |
| `test.fails`                 | Known bug; fails once fixed, prompting removal   |
| `test.runIf`, `test.skipIf`  | Environment guards; `describe` supports them too |

Guard tests needing optional environment:

```ts
const databaseUrl = process.env["DATABASE_URL"];

describe.skipIf(!databaseUrl)("OrderRepository", () => {
  // Integration tests against a real database
});
```

## Isolation

- Each test passes alone and in any order; verify with
  `--sequence.shuffle`.
- `Vitest` gives each file fresh modules and globals (`isolate: true`);
  module state and `vi.mock()` replacements stay inside the file.
  - `--no-isolate` shares them across files within a worker; adopt it
    only after shuffled runs pass.
- Module state persists across tests within a file; reset shared
  registries and stores in `beforeEach`.
- Mutate `process.env` and globals through `vi.stubEnv` and
  `vi.stubGlobal`; `unstubEnvs` and `unstubGlobals` revert them.
- Restore other mutated globals in `afterEach`.

## CI parity

| Hazard                           | Remedy                                                  |
| :------------------------------- | :------------------------------------------------------ |
| Absolute paths                   | `join(import.meta.dirname, "fixtures", "input.json")`   |
| Read-only working directory      | Temp directories under `tmpdir()`                       |
| Undeclared environment variables | Defaults or `skipIf` guards; unset `NODE_ENV` → `test`  |
| Running services                 | Mock in unit tests; skip-guard integration tests        |
| Live network                     | Mock `fetch` and `node:dns`; bind `server.listen(0)`    |
| Timezone                         | Inherits host `TZ`; pin `env: {TZ: "UTC"}`; freeze time |
| Locale                           | Pass explicit locales: `toLocaleString("en-US")`        |
| OS commands, separators          | `node:path` helpers; spawn `process.execPath`           |
| Case sensitivity                 | Normalize paths and filenames explicitly                |

Create a temp directory per test; `beforeEach` returns its cleanup:

```ts
import {mkdtemp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {beforeEach} from "vitest";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "app-test-"));
  return () => rm(workDir, {recursive: true, force: true});
});
```

Never assume runner privilege; root and `CAP_DAC_OVERRIDE` bypass mode
bits in containers:

- Simulate `EACCES`/`EPERM` in unit tests with stubs; never via `chmod`.
- Never assert mode-bit denial in integration or end-to-end tests.
- Assert permission-setting behavior through `stat` mode values.

## Asynchronous

- Use `async`/`await`; `Vitest` passes the test context, never a `done`
  callback.
- `await` every promise; never fire-and-forget inside a test.
  - `.resolves`, `.rejects`, and `toMatchFileSnapshot` fail the test
    unless awaited.
- Await events through promises; never sleep:

```ts
test("emits drained after the last job completes", async () => {
  const queue = new JobQueue();
  const {promise: drained, resolve} = Promise.withResolvers<void>();
  queue.once("drained", resolve);

  queue.push(async () => {});
  await drained;

  expect(queue.size).toBe(0);
});
```

- Reserve `vi.waitFor` and `expect.poll` for conditions lacking an event
  or promise; never hand-roll polling loops.
- Drive cancellation with `AbortController`; never rely on real
  timeouts:

```ts
test("rejects with AbortError when the caller aborts", async () => {
  const controller = new AbortController();
  const pending = exportReport({signal: controller.signal});

  controller.abort();

  await expect(pending).rejects.toMatchObject({name: "AbortError"});
});
```

### Timeouts, retries, and repeats

- Set timeouts via the third argument (milliseconds), `{timeout}`, or
  `--testTimeout`; default `5000`.
- Pass options as the second argument: `test(name, {repeats}, fn)`.
- Never mask flakiness with `retry` (`{retry: n}`, `--retry.count`); fix
  the root cause.
- Expose flakiness with `{repeats: n}` (runs `n + 1` times) or
  `--repeats=n`.

```ts
test(
  "drains every job under concurrent pushes",
  {repeats: 50},
  async () => {
    const queue = new JobQueue();
    const {promise: drained, resolve} = Promise.withResolvers<void>();
    queue.once("drained", resolve);

    queue.push(async () => {});
    queue.push(async () => {});
    await drained;

    expect(queue.completed).toBe(2);
  }
);
```

## Time and timers

Use fake timers for time-dependent logic; never introduce real delays:

```ts
import {expect, test, vi} from "vitest";

test("retries the request after one second of backoff", () => {
  vi.useFakeTimers({now: new Date("2026-01-01T00:00:00.000Z")});
  const send = vi.fn();

  scheduleRetry(send, 1000);
  vi.advanceTimersByTime(999);
  expect(send).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  expect(send).toHaveBeenCalledTimes(1);
});
```

- `vi.useFakeTimers()` fakes timers, `Date`, and `Temporal`;
  `process.nextTick` and `queueMicrotask` stay real.
- Advance with `advanceTimersByTime`, `runOnlyPendingTimers`, or
  `runAllTimers`; `*Async` variants flush promise callbacks between
  timers.
- `vi.setSystemTime(date)` moves `Date` and `Temporal` clocks without
  faking timers; `vi.useRealTimers()` restores both.
- Zone-specific cases call `vi.stubEnv("TZ", "Asia/Tokyo")`;
  `unstubEnvs` restores the zone.

## Mocking

- Unit tests: mock every external process, I/O call, network request,
  and event source; never trigger live events.
- Integration and end-to-end tests: use real dependencies; never mix in
  mocks.
- Prefer fakes over spies, spies over stubs.
- Restore every mock after each test; see `vitest.config.ts`.

### Fakes

Inject collaborators; pass working in-memory implementations:

```ts
class MemoryStore implements Store {
  readonly #items = new Map<string, string>();

  async get(key: string) {
    return this.#items.get(key);
  }

  async set(key: string, value: string) {
    this.#items.set(key, value);
  }
}

test("returns the stored value on lookup", async () => {
  const cache = new Cache(new MemoryStore());

  await cache.set("user:1", "Ada");

  expect(await cache.get("user:1")).toBe("Ada");
});
```

### Spies

`vi.spyOn` records calls on an existing method; chain a stub to block
side effects:

```ts
test("fetches each profile once across repeated lookups", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json({id: 1, name: "Ada"}));
  const profiles = createProfileClient();

  await profiles.get(1);
  await profiles.get(1);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
});
```

### Stubs

`vi.fn(impl)` creates a tracked function; program results with
`mockReturnValue`, `mockResolvedValue`, `mockRejectedValue`,
`mockImplementation`, and their `Once` variants:

```ts
test("reports unreadable config when the read fails with EACCES", async () => {
  const denied = Object.assign(new Error("permission denied"), {
    code: "EACCES"
  });
  const readFile = vi.fn().mockRejectedValue(denied);

  await expect(loadConfig("app.json", {readFile})).rejects.toThrow(
    "unreadable config"
  );
  expect(readFile).toHaveBeenCalledWith("app.json", "utf8");
});
```

`vi.mocked(fn)` types an imported mock without casts.

### Module mocks

Reserve `vi.mock()` for modules lacking an injection seam:

```ts
vi.mock(import("./client.ts"), async importOriginal => ({
  ...(await importOriginal()),
  fetchData: vi.fn(async () => ({data: "mocked"}))
}));
```

- Hoists ahead of imports and applies to every importer in the file;
  call it at the top level—nested calls throw.
- `import()` paths type the factory; `importOriginal` keeps the
  remaining real exports.
- `vi.mock(path, {spy: true})` tracks calls while keeping real
  implementations.
- Share factory variables through `vi.hoisted`.
- `restoreMocks` never undoes `vi.mock()`; isolation scopes it to the
  file.
- Vary mocks per test with `vi.doMock` plus a dynamic `import()`.

## Assertions

- Assert observable behavior—return values, output, state—never
  internals.
- Cover the happy path plus every distinct failure and cancellation
  path.
- Never duplicate existing coverage or assertions.
- Fail loudly on bad state:
  - `expect.assertions(n)` or `expect.hasAssertions()` in tests with
    callbacks or branches.
  - `expect.unreachable(message)` on paths that must never run.
  - Throw on missing fixtures; never return early.

### Matcher selection

| Intent               | Matcher                                                   |
| :------------------- | :-------------------------------------------------------- |
| Primitives, identity | `toBe`                                                    |
| Structural equality  | `toEqual`; `toStrictEqual` also checks `undefined`, class |
| Partial objects      | `toMatchObject`, `expect.objectContaining`                |
| Dynamic values       | `expect.any(Type)`, `expect.stringMatching(pattern)`      |
| Errors               | `toThrow(ErrorClass)` or `toThrow("message")`             |
| Promises             | `await expect(promise).resolves` or `.rejects`            |
| Mock calls           | `toHaveBeenCalledWith(...)` over `toHaveBeenCalled()`     |
| Floats               | `toBeCloseTo(value, digits)`                              |
| Object keys, values  | `toHaveProperty(path, value)`, `toContainEqual(item)`     |

Avoid `toBeTruthy` and `toBeDefined` when a precise expected value
exists.

### Static types

`expectTypeOf` does nothing at runtime; place type tests in
`*.test-d.ts` and run `vitest run --typecheck` (experimental):

```ts
// config.test-d.ts
import {expectTypeOf, test} from "vitest";
import {normalizeConfig} from "./config.ts";

test("infers the normalized config shape", () => {
  expectTypeOf(normalizeConfig({port: 80})).toMatchObjectType<{
    port: number;
  }>();
});
```

## Snapshots

- Snapshot large, stable serialized output; assert small values
  explicitly.
- Mask dynamic fields with asymmetric matchers:

```ts
test("serializes a new session with masked dynamic fields", () => {
  expect(createSession("ada")).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date)
  });
});
```

- Review every diff before `vitest run -u`; commit `__snapshots__/`
  alongside tests.
- `CI=true` fails missing snapshots; record them locally.
- Concurrent tests snapshot through the context `expect`.

## Lifecycle hooks

| Placement        | Scope                  |
| :--------------- | :--------------------- |
| `setupFiles`     | Every test in the run  |
| File top level   | Every test in the file |
| `describe` block | Tests in that block    |

Order: outer `beforeAll` → inner `beforeAll` → outer `beforeEach` →
inner `beforeEach` → test → inner `afterEach` → outer `afterEach` →
`onTestFinished` → inner `afterAll` → outer `afterAll`.

- A throwing `beforeAll` skips every test in its scope.
- A throwing `beforeEach` fails each test in its scope.
- `beforeEach` and `beforeAll` may return a cleanup function; it runs as
  teardown.
- `onTestFinished(fn)` registers cleanup for the current test;
  concurrent tests call it from the test context.

## Concurrency

- `test.concurrent`, `describe.concurrent`, or `--sequence.concurrent`
  run tests concurrently within a file; `maxConcurrency` caps them
  (default `5`).
- Concurrent tests never share mutable state; destructure `expect` from
  the test context for snapshots and `expect.assertions`.
- `{concurrent: false}` opts a test or suite out of concurrency.
- Files already run in parallel across workers; tune with
  `fileParallelism` and `maxWorkers`.

## Output hygiene

- Never commit `console.*` calls or `debugger` statements in tests;
  assert instead of printing.
- Capture intended output and assert on it:

```ts
test("warns when the config omits the port", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  normalizeConfig({});

  expect(warn).toHaveBeenCalledWith(expect.stringContaining("port"));
});
```

- Spawn CLIs with
  `spawnSync(process.execPath, ["src/cli.ts"], {encoding: "utf8"})`;
  assert on `stdout` and `status`.
  - `Node.js` 22.18+ runs `.ts` files with erasable syntax only; spawn
    the build output otherwise.
- Silence expected logs from code under test; a clean run prints only
  the test report.

## `DOM` testing

```bash
npm install -D jsdom @testing-library/dom @testing-library/react @testing-library/jest-dom
```

```ts
// vitest.config.ts
export default defineConfig({
  plugins: [react()], // From @vitejs/plugin-react
  test: {
    environment: "jsdom", // Or "happy-dom"
    setupFiles: ["./test/dom-setup.ts", "./test/setup.ts"]
  }
});
```

- Scope the environment per file with a first-line comment:
  `// @vitest-environment jsdom`; keep `node` as the default.

Register `jest-dom` matchers and cleanup in `test/dom-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"; // Registers matchers and types
import {cleanup} from "@testing-library/react";
import {afterEach} from "vitest";

afterEach(() => {
  cleanup(); // Testing Library auto-cleans only under globals: true
});
```

Type `DOM` globals through `"dom"` in `tsconfig.json` `lib`, or per file
with a triple-slash directive:

```tsx
/// <reference lib="dom" />

import {render, screen} from "@testing-library/react";
import {expect, test} from "vitest";
import {Welcome} from "./welcome.tsx";

test("renders the greeting heading with the user name", () => {
  render(<Welcome name="Ada" />);

  expect(screen.getByRole("heading")).toHaveTextContent("Hello Ada");
});
```

## Verification

Before writing tests, confirm their dependencies appear in
`devDependencies` and their imports resolve. Before declaring a task
done:

1. `npx vitest run <file>` passes.
2. `npx vitest list <file> -t "<name>"` lists each new or updated test.
3. `npx tsc --noEmit` reports zero type errors.
4. `npx vitest run --typecheck` passes when `*.test-d.ts` files exist.
5. `CI=true npx vitest run --sequence.shuffle` shows zero new failures.
6. Changed test files contain no `console.*`, `debugger`, `.only`, or
   `.skip`.
