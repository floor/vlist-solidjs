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

Config accepts all [@floor/vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, and `scrollbar` are translated into `.use(withX())` calls automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — SolidJS](https://vlist.dev/docs/frameworks#solidjs)**

## License

MIT © [Floor IO](https://floor.io)