// vlist-solidjs
/**
 * SolidJS primitives for vlist - lightweight virtual scrolling
 */

import { onMount, onCleanup, createEffect, on } from "solid-js";
import type { Accessor } from "solid-js";
import type {
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "vlist";
import type { VList } from "vlist";
import { createVListFromConfig, type VListConfig } from "vlist/config";

// Re-export types that appear in UseVListConfig / CreateVListReturn
export type {
  VListItem,
  VListEvents,
  VList,
  CreateVListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
  VListPlugin,
} from "vlist";
export type { VListConfig } from "vlist/config";

/**
 * Configuration for {@link createVList}. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the primitive owns via
 * the bound ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

export interface CreateVListReturn<T extends VListItem = VListItem> {
  setRef: (el: HTMLDivElement) => void;
  instance: Accessor<VList<T> | null>;
}

export function createVList<T extends VListItem = VListItem>(
  config: Accessor<UseVListConfig<T>>,
): CreateVListReturn<T> {
  let containerEl: HTMLDivElement | null = null;
  let instanceRef: VList<T> | null = null;

  const setRef = (el: HTMLDivElement) => {
    containerEl = el;
  };

  const instance = (): VList<T> | null => instanceRef;

  onMount(() => {
    if (!containerEl) return;

    const currentConfig = config();

    instanceRef = createVListFromConfig<T>({ ...currentConfig, container: containerEl });
  });

  // React to items changes
  createEffect(
    on(
      () => config().items,
      (items) => {
        if (instanceRef && items) {
          instanceRef.setItems(items);
        }
      },
    ),
  );

  onCleanup(() => {
    if (instanceRef) {
      instanceRef.destroy();
      instanceRef = null;
    }
  });

  return {
    setRef,
    instance,
  };
}

export function createVListEvent<
  T extends VListItem,
  K extends keyof VListEvents<T>,
>(
  instance: Accessor<VList<T> | null>,
  event: K,
  handler: EventHandler<VListEvents<T>[K]>,
): void {
  onMount(() => {
    const inst = instance();
    if (!inst) return;

    const unsub: Unsubscribe = inst.on(event, handler);

    onCleanup(() => {
      unsub();
    });
  });
}
