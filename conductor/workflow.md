# Project Workflow

## Guiding Principles

1.  **Plan as Source of Truth**: Track all work in `plan.md`.
2.  **Deliberate Tech Stack**: Document tech stack changes in `tech-stack.md` *before* implementation.
3.  **Test-Driven Development (TDD)**: Write unit tests before implementing functionality.
4.  **High Code Coverage**: Maintain >80% code coverage for all modules.
5.  **User Experience Priority**: Prioritize user experience in every decision.
6.  **Non-Interactive & CI-Aware**: Use non-interactive commands and `CI=true` for automated tools.

## Task Lifecycle

| Stage | Action | Requirement |
| :--- | :--- | :--- |
| **1. Select** | Choose next task from `plan.md` | Sequential order |
| **2. Start** | Change `[ ]` to `[~]` in `plan.md` | Mark before work |
| **3. Red** | Write failing unit tests | Confirm failure |
| **4. Green** | Implement minimum code to pass | Confirm pass |
| **5. Refactor** | Improve code/test clarity | Rerun tests |
| **6. Coverage** | Run coverage reports | Target >80% |
| **7. Deviations** | Update `tech-stack.md` if design changes | Stop and document |
| **8. Commit** | Stage and commit code changes | Follow `kbase/git-commit-guide.md` |
| **9. Note** | Attach summary via `git notes` | Include "why" and file list |
| **10. Record** | Update `plan.md` with `[x]` and `<sha7>` | Use first 7 characters |
| **11. Finalize** | Commit `plan.md` update | Use `chore(plan):` type |

## Phase Completion Protocol

Execute this protocol immediately after completing a phase in `plan.md`.

1.  **Identify Scope**: Find the previous checkpoint SHA in `plan.md`. List changed code files via `git diff --name-only <prev_sha> HEAD`.
2.  **Verify Tests**: Ensure a corresponding test file exists for every modified code file. Create missing tests that validate phase functionality.
3.  **Execute Suite**: Run the full test suite (for example, `CI=true npm test`). Debug failures (maximum two attempts) before seeking user guidance.
4.  **Manual Verification**: Analyze `product.md` and `plan.md` to draft a step-by-step manual verification plan. Present this plan to the user.
5.  **User Approval**: Await explicit user confirmation ("yes" or feedback) before proceeding.
6.  **Checkpoint Commit**: Create a checkpoint commit (for example, `chore(checkpoint): end of Phase X`).
7.  **Verification Report**: Attach the test command, manual steps, and user confirmation to the checkpoint commit via `git notes`.
8.  **Update Plan**: Record the checkpoint SHA in the phase heading of `plan.md` (format: `[checkpoint: <sha7>]`).
9.  **Commit Plan**: Stage and commit the `plan.md` update.

## Completion Criteria

Before marking any task or phase complete, verify:

- [ ] All automated tests pass.
- [ ] Code coverage exceeds 80%.
- [ ] Code adheres to `code_styleguides/`.
- [ ] Public functions/methods include documentation (for example, JSDoc).
- [ ] TypeScript types enforce strict safety.
- [ ] No linting or static analysis errors exist.
- [ ] Mobile functionality remains intact (if applicable).
- [ ] Documentation reflects all changes.
- [ ] No security vulnerabilities exist.

## Commit Guidelines

Follow the **Conventional Commits v1.0.0** specification as detailed in `kbase/git-commit-guide.md`.
