# ReadAloud architecture

## Confidence

- **Inferred from source:** topology, ownership, and control flow below.
- No ADR evidence.

## Runtime topology

- Three runtime contexts divide responsibilities: worker orchestration,
  page-facing selection/liveness, preference UI.
- Typed message streams bridge contexts; Chrome API adapters isolate
  speech, storage, action, and menu calls.
- Worker ownership covers speech dispatch, action commands, queue
  feedback, and context-menu lifecycle.

## Speech transaction

1. Page selection, toolbar click, or shortcut -> typed request.
2. Worker throttle/debounce plus sender validation ->
   whitespace-normalized phrases, persisted options, badge increment.
3. Serial phrase dispatch -> Chrome TTS event adapter -> typed lifecycle
   message.
4. Content lifecycle handling -> refresh/end acknowledgement -> worker
   refresh plus badge decrement.

## State projection

- Storage façade owns persisted voice/rate/pitch, defaults, fallbacks,
  and TTS-option assembly.
- Context menus and options UI project shared storage, then react to
  storage notifications.
- BadgeCounter owns worker-local queue feedback and drives action badge.
  **Inferred:** worker suspension drops this feedback; avoid durability
  assumptions.

## Structural rules

- Add cross-context behavior through `message.ts` typed pairs; retain
  sender identity validation at every inbound subscriber.
- Keep speech execution, phrase sequencing, badge mutation, and action
  control in worker context; content/options contexts remain adapters.
- Route selection through typed requests; route engine events through
  lifecycle messages and content acknowledgements.
- Funnel every preference through storage façade plus storage-change
  projection; avoid per-surface preference state.
- Retain phrase splitting before queued speech; queue counts track split
  phrases and end acknowledgements.
