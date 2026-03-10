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
| **8. Record** | Update `plan.md` with `[x]` | Mark completion |

## Phase Completion Protocol

Execute this protocol immediately after completing a phase in `plan.md`.

1.  **Identify Scope**: List all code files modified during the phase.
2.  **Verify Tests**: Ensure a corresponding test file exists for every modified code file. Create missing tests that validate phase functionality.
3.  **Execute Suite**: Run the full test suite (for example, `CI=true npm test`). Debug failures (maximum two attempts) before seeking user guidance.
4.  **Manual Verification**: Analyze `product.md` and `plan.md` to draft a step-by-step manual verification plan. Present this plan to the user.
5.  **User Approval**: Await explicit user confirmation ("yes" or feedback) before proceeding.
6.  **Update Plan**: Mark the phase as complete in `plan.md`.

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
