# vlist-solidjs

SolidJS primitives for [@floor/vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

## Install

```bash
npm install @floor/vlist vlist-solidjs
```

## Quick Start

```tsx
import { createVList } from 'vlist-solidjs';
import { createSignal } from 'solid-js';
import '@floor/vlist/styles';

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

Config accepts all [@floor/vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are translated into `.use(withX())` calls automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — SolidJS](https://vlist.dev/docs/frameworks#solidjs)**

## Synthetic input

Requires `vlist ^3.0.0-next.1`. Pass the synthetic entry as `factory` to opt in; the adapter forwards it unchanged through `vlist/config`. `VListFactory` is re-exported for typed custom factories. The factory is selected at mount; remount to change it.

```tsx
import { createVList } from "vlist-solidjs";
import { createVList as createSynthetic } from "vlist/synthetic";

function Rows() {
  const items = Array.from({ length: 1000 }, (_, id) => ({ id }));
  const { setRef } = createVList(() => ({
    factory: createSynthetic,
    items,
    item: { height: 48, template: item => String(item.id) },
  }));
  return <div ref={setRef} style={{ height: "400px" }} />;
}
```

## License

MIT © [Floor IO](https://floor.io)
