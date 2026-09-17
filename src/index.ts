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
import { createVListFromConfig, type VListConfig, type ConfigItem, type ConfigMethods } from "vlist/config";

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
export type { VListConfig, VListFactory, ConfigItem, ConfigMethods } from "vlist/config";

/**
 * Configuration for {@link createVList}. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the primitive owns via
 * the bound ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

/**
 * The list a config builds: its item type read from `items` or the template,
 * and the methods its feature fields wire — `selection` brings `select()`,
 * `adapter` brings `reload()`, `layout: "grid"` brings `getGridLayout()`.
 */
export type CreateVListInstance<C extends UseVListConfig<any>> =
  VList<ConfigItem<C>> & ConfigMethods<ConfigItem<C>, C>;

export interface CreateVListReturn<C extends UseVListConfig<any>> {
  setRef: (el: HTMLDivElement) => void;
  instance: Accessor<CreateVListInstance<C> | null>;
}

/**
 * One type parameter, the config itself, inferred from the accessor's return.
 * Do not pass a type argument: the item type comes from `items` or
 * `item.template`, and the plugin methods from the feature fields.
 */
export function createVList<const C extends UseVListConfig<any>>(
  config: Accessor<C>,
): CreateVListReturn<C> {
  let containerEl: HTMLDivElement | null = null;
  let instanceRef: CreateVListInstance<C> | null = null;

  const setRef = (el: HTMLDivElement) => {
    containerEl = el;
  };

  const instance = (): CreateVListInstance<C> | null => instanceRef;

  onMount(() => {
    if (!containerEl) return;

    const currentConfig = config();

    instanceRef = createVListFromConfig({ ...currentConfig, container: containerEl }) as CreateVListInstance<C>;
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
