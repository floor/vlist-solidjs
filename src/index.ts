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
import type {
  VListItem,
  VList,
  VListPlugin,
  TableMethods,
  ColumnPinMethods,
  ColumnReorderMethods,
} from "vlist";
import { createVListFromConfig, type VListConfig, type ConfigMethods } from "vlist/config";
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
  TableColumn,
  TablePluginConfig,
  TableMethods,
  TableFeature,
  TableFeatureMethods,
  ColumnPinConfig,
  ColumnPinMethods,
  ColumnReorderConfig,
  ColumnReorderMethods,
} from "vlist";
export type { VListConfig, VListFactory, ConfigMethods } from "vlist/config";

/**
 * Configuration for {@link createVList}. vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the primitive owns via
 * the bound ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

type InstanceMethods<T extends VListItem, M> = M extends UseVListConfig<T> ? ConfigMethods<T, M> : M;

export interface CreateVListReturn<
  T extends VListItem = VListItem,
  M = {},
> {
  setRef: (el: HTMLDivElement) => void;
  instance: Accessor<(VList<T> & InstanceMethods<T, M>) | null>;
}

type WithPlugin<T extends VListItem, M> = Omit<UseVListConfig<T>, "plugins"> & {
  plugins:
    | readonly [VListPlugin<any, M>, ...(readonly VListPlugin<any, any>[])]
    | readonly [...(readonly VListPlugin<any, any>[]), VListPlugin<any, M>];
};

/** `vlist/solid`'s factory argument: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as Parameters<typeof createEntry>[2];

export function createVList<
  T extends VListItem,
  const C extends UseVListConfig<NoInfer<T>> & { items: readonly T[] },
>(
  config: Accessor<{ items: readonly T[] } & UseVListConfig<NoInfer<T>> & C>,
): CreateVListReturn<T, ConfigMethods<T, C>>;
export function createVList<
  T extends VListItem,
  const C extends UseVListConfig<T>,
>(
  config: Accessor<UseVListConfig<T> & C>,
): CreateVListReturn<T, ConfigMethods<T, C>>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<WithPlugin<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>>,
): CreateVListReturn<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<WithPlugin<T, TableMethods<T> & ColumnPinMethods>>,
): CreateVListReturn<T, TableMethods<T> & ColumnPinMethods>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<WithPlugin<T, TableMethods<T> & ColumnReorderMethods>>,
): CreateVListReturn<T, TableMethods<T> & ColumnReorderMethods>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<WithPlugin<T, TableMethods<T>>>,
): CreateVListReturn<T, TableMethods<T>>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<UseVListConfig<T>>,
): CreateVListReturn<T>;
export function createVList<T extends VListItem = VListItem>(
  config: Accessor<UseVListConfig<T> | WithPlugin<T, unknown>>,
): CreateVListReturn<T, never> {
  return createEntry<T>(config as Parameters<typeof createEntry<T>>[0], [], fromConfig) as CreateVListReturn<T, never>;
}
