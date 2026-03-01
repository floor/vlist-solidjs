// vlist-solidjs
/**
 * SolidJS primitives for vlist - lightweight virtual scrolling
 */

import { onMount, onCleanup, createEffect, on } from "solid-js";
import type { Accessor } from "solid-js";
import type {
  VListConfig,
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "@floor/vlist";
import { vlist, type VList } from "@floor/vlist";
import {
  withAsync,
  withGrid,
  withMasonry,
  withGroups,
  withSelection,
  withScrollbar,
  withScale,
  withSnapshots,
  withPage,
} from "@floor/vlist";

export type UseVListConfig<T extends VListItem = VListItem> = Omit<
  VListConfig<T>,
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
    let builder = vlist<T>({
      ...currentConfig,
      container: containerEl,
    });

    if (currentConfig.scroll?.element === window) {
      builder = builder.use(withPage());
    }

    if (currentConfig.adapter) {
      builder = builder.use(
        withAsync({
          adapter: currentConfig.adapter,
          ...(currentConfig.loading && {
            loading: currentConfig.loading,
          }),
        }),
      );
    }

    if (currentConfig.layout === "grid" && currentConfig.grid) {
      builder = builder.use(withGrid(currentConfig.grid));
    }

    if (currentConfig.layout === "masonry" && currentConfig.masonry) {
      builder = builder.use(withMasonry(currentConfig.masonry));
    }

    if (currentConfig.groups) {
      const groupsConfig = currentConfig.groups;
      const headerHeight =
        typeof groupsConfig.headerHeight === "function"
          ? groupsConfig.headerHeight("", 0)
          : groupsConfig.headerHeight;

      builder = builder.use(
        withGroups({
          getGroupForIndex: groupsConfig.getGroupForIndex,
          headerHeight,
          headerTemplate: groupsConfig.headerTemplate,
          ...(groupsConfig.sticky !== undefined && {
            sticky: groupsConfig.sticky,
          }),
        }),
      );
    }

    const selectionMode = currentConfig.selection?.mode || "none";
    if (selectionMode !== "none") {
      builder = builder.use(withSelection(currentConfig.selection));
    } else {
      builder = builder.use(withSelection({ mode: "none" }));
    }

    builder = builder.use(withScale());

    const scrollbarConfig =
      currentConfig.scroll?.scrollbar || currentConfig.scrollbar;
    if (scrollbarConfig !== "none") {
      const scrollbarOptions =
        typeof scrollbarConfig === "object" ? scrollbarConfig : {};
      builder = builder.use(withScrollbar(scrollbarOptions));
    }

    builder = builder.use(withSnapshots());

    instanceRef = builder.build();
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
