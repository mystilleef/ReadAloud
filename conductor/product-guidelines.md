# Product Guidelines: ReadAloud

## Prose Style
- **Clarity**: Use simple, direct language for all user-facing text.
- **Conciseness**: Keep instructions and menu labels brief to minimize cognitive load.
- **Tone**: Maintain a helpful, neutral, and professional tone.
- **E-Prime**: Avoid "to be" verbs in documentation, user-facing strings, and commit messages to ensure active, precise communication.

## Development Standards
- **Conventional Commits**: Strictly follow the Conventional Commits v1.0.0 specification for all Git commits.
- **Imperative Mood**: Use the imperative mood in commit descriptions (e.g., "add," not "added").
- **Brevity**: Keep commit subject lines ≤ 50 characters.
- **Plain Text**: Use plain text in commit messages; avoid markdown backticks to prevent shell execution errors.

## User Experience (UX) Principles
- **Non-Intrusiveness**: The extension remains silent and invisible until the user explicitly triggers it.
- **Consistency**: UI elements (context menus, options page) follow Chrome's native design patterns.
- **Accessibility**: Prioritize WCAG 2.1 compliance. Ensure all interactive elements support keyboard navigation and screen readers.
- **Feedback**: Provide immediate visual or auditory confirmation for user actions (e.g., starting/stopping speech).

## Visual Design
- **Iconography**: Use clear, high-contrast icons. The speaker icon represents active reading, while the stop icon indicates cessation.
- **Color Palette**: Adhere to a minimalist palette that complements standard web page backgrounds.
- **Typography**: Use system fonts for the options page and menus to ensure a native feel.

## Interaction Design
- **Direct Action**: Minimize the number of clicks required to perform core tasks.
- **Discoverability**: Ensure users can easily find customization options (voice, speed, pitch) within the context menu.
- **Predictability**: Maintain consistent behavior across different websites and document structures.
