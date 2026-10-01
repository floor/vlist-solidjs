// vlist-solidjs
/**
 * SolidJS primitives for vlist - lightweight virtual scrolling
 *
 * Deprecated: use `vlist/solid` from the vlist package, which takes features
 * as plugins (`createVList(() => ({ items, item }), [selection()])`). This
 * package keeps the config-based API on top of it: the primitives are
 * `vlist/solid`'s, building the list with `createVListFromConfig` so feature
 * fields still resolve to plugins.
 */

import type { Accessor } from "solid-js";
import type { VListItem, VList } from "vlist";
import { createVListFromConfig, type VListConfig } from "vlist/config";
import { createVList as createEntry, createVListEvent } from "vlist/solid";

export { createVListEvent };

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
export type { VListConfig, VListFactory } from "vlist/config";

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

/** `vlist/solid`'s factory argument: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as Parameters<typeof createEntry>[2];

export function createVList<T extends VListItem = VListItem>(
  config: Accessor<UseVListConfig<T>>,
): CreateVListReturn<T> {
  return createEntry<T>(config as Parameters<typeof createEntry<T>>[0], [], fromConfig) as CreateVListReturn<T>;
}
