# vlist-solidjs

SolidJS primitives for [vlist](https://github.com/floor/vlist) - a lightweight, high-performance virtual list.

## Installation

```bash
npm install vlist-solidjs @floor/vlist
```

## Quick Start

```tsx
import { createVList } from 'vlist-solidjs';
import { createSignal } from 'solid-js';

function MyList() {
  const [items] = createSignal(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
  );

  const { setRef, instance } = createVList(() => ({
    items: items(),
    item: {
      height: 48,
      template: (item) => `<div>${item.name}</div>`
    }
  }));

  return <div ref={setRef} />;
}
```

## API

### `createVList(config)`

Creates a virtual list instance.

**Parameters:**
- `config` - An accessor returning the vlist configuration (without container)

**Returns:**
- `setRef` - Ref callback to attach to the container element
- `instance` - Accessor to the vlist instance

### `createVListEvent(instance, event, handler)`

Subscribe to vlist events.

**Parameters:**
- `instance` - The vlist instance accessor
- `event` - Event name
- `handler` - Event handler function

**Example:**
```tsx
import { createVListEvent } from 'vlist-solidjs';

createVListEvent(instance, 'item:click', ({ item, index }) => {
  console.log('Clicked:', item, 'at index:', index);
});
```

## Features

All vlist features are supported:

- **Selection** - Single and multiple selection modes
- **Grid layout** - Multi-column grid virtualization
- **Sections** - Grouped lists with sticky headers
- **Infinite scroll** - Async data loading
- **Horizontal** - Horizontal scrolling support
- **Scale** - Handle 1M+ items with compression
- **Scrollbar** - Custom scrollbar with auto-hide

## License

MIT © Floor IO
