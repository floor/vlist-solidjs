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
  CreateVListConfig,
  VListPlugin,
} from "vlist";
import {
  createVList as createVListCore,
  page,
  autosize,
  data as dataPlugin,
  grid,
  masonry,
  groups,
  selection,
  scale,
  scrollbar,
  snapshots,
} from "vlist";
import type { VList } from "vlist";

// Re-export types that appear in CreateVListConfig / CreateVListReturn
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

export type UseVListConfig<T extends VListItem = VListItem> = Omit<
  CreateVListConfig<T>,
  "container"
>;

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
    const plugins: VListPlugin<T>[] = [];

    if (currentConfig.scroll?.element === window) {
      plugins.push(page());
    }

    const item = currentConfig.item;
    const isHorizontal = currentConfig.orientation === "horizontal";
    const hasExplicitSize = isHorizontal ? item.width != null : item.height != null;
    const hasEstimate = isHorizontal
      ? (item as unknown as Record<string, unknown>).estimatedWidth != null
      : (item as unknown as Record<string, unknown>).estimatedHeight != null;
    if (!hasExplicitSize && hasEstimate) {
      plugins.push(autosize());
    }

    if (currentConfig.adapter) {
      plugins.push(
        dataPlugin({
          adapter: currentConfig.adapter,
          ...(currentConfig.loading && { loading: currentConfig.loading }),
        }),
      );
    }

    if (currentConfig.layout === "grid" && currentConfig.grid) {
      plugins.push(grid(currentConfig.grid));
    }

    if (currentConfig.layout === "masonry" && currentConfig.masonry) {
      plugins.push(masonry(currentConfig.masonry));
    }

    if (currentConfig.groups) {
      const groupsConfig = currentConfig.groups;
      const headerHeight =
        typeof groupsConfig.headerHeight === "function"
          ? groupsConfig.headerHeight("", 0)
          : groupsConfig.headerHeight;
      plugins.push(
        groups({
          getGroupForIndex: groupsConfig.getGroupForIndex,
          headerHeight,
          headerTemplate: groupsConfig.headerTemplate,
          ...(groupsConfig.sticky !== undefined && { sticky: groupsConfig.sticky }),
        }),
      );
    }

    const selectionMode = currentConfig.selection?.mode || "none";
    if (selectionMode !== "none") {
      plugins.push(selection(currentConfig.selection));
    } else {
      plugins.push(selection({ mode: "none" }));
    }

    plugins.push(scale());

    const scrollbarConfig = currentConfig.scroll?.scrollbar || currentConfig.scrollbar;
    if (scrollbarConfig !== "none") {
      const scrollbarOptions =
        typeof scrollbarConfig === "object" ? scrollbarConfig : {};
      plugins.push(scrollbar(scrollbarOptions));
    }

    plugins.push(snapshots());

    instanceRef = createVListCore<T>({ ...currentConfig, container: containerEl }, plugins);
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
