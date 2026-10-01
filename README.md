# vlist-solidjs

SolidJS primitives for [vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

> **Deprecated.** Use [`vlist/solid`](https://github.com/floor/vlist#frameworks) from the `vlist` package instead. Change the import path, and pass features as plugins:
>
> ```ts
> // before
> import { createVList } from "vlist-solidjs";
> createVList(() => ({ items, item, selection: { mode: "single" } }));
>
> // after
> import { createVList } from "vlist/solid";
> import { selection } from "vlist";
> createVList(() => ({ items, item }), [selection({ mode: "single" })]);
> ```
>
> From 3.1 this package is built on `vlist/solid` and keeps its config-based API, so existing code keeps working while you migrate. It needs `vlist ^3.1.0-next.3`; on vlist 3.0.x, stay on `vlist-solidjs` 3.0.x.

## Install

```bash
npm install vlist vlist-solidjs
```

## Quick Start

```tsx
import { createVList } from 'vlist-solidjs';
import { createSignal } from 'solid-js';
import 'vlist/styles';

function UserList() {
  const [users] = createSignal(
    Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `User ${i + 1}` }))
  );

  const { setRef, instance } = createVList(() => ({
    items: users(),
    item: {
      height: 48,
      template: (user) => `<div>${user.name}</div>`,
    },
  }));

  return <div ref={setRef} style={{ height: '400px' }} />;
}
```

## API

- **`createVList(config)`** — Creates a virtual list. Config is an accessor returning the vlist config. Returns `{ setRef, instance }`.
- **`createVListEvent(instance, event, handler)`** — Subscribe to vlist events with automatic cleanup.

Config accepts all [vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are resolved into plugins automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — SolidJS](https://vlist.dev/docs/frameworks#solidjs)**

## Synthetic input

Every list scrolls natively by default, and hands itself to synthetic input past the browser's element size limit: `scroll.mode` is `"auto"`. Pass `scroll: { mode: "synthetic" }` for synthetic input from the start, or `"native"` to stay native; the adapter forwards `scroll` unchanged through `vlist/config`. A synthetic list draws its own scrollbar. Requires `vlist ^3.1.0-next.3`. A carousel honours `"synthetic"` too. `VListFactory` is re-exported for typed custom factories.

```tsx
import { createVList } from "vlist-solidjs";

function Rows() {
  const items = Array.from({ length: 1000 }, (_, id) => ({ id }));
  const { setRef } = createVList(() => ({
    items,
    item: { height: 48, template: item => String(item.id) },
    scroll: { mode: "synthetic" },
  }));
  return <div ref={setRef} style={{ height: "400px" }} />;
}
```

## License

MIT © [Floor IO](https://floor.io)
