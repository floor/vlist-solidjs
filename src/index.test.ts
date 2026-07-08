/**
 * vlist-solidjs — real render tests
 *
 * Drives the `createVList` primitive inside a Solid reactive root (`createRoot`),
 * wiring the container via `setRef` so `onMount` builds a real vlist instance.
 * Asserts virtualization and that disposing the root tears the instance down.
 * Includes floor/vlist#119 coverage: a `plugins` array overlapping the
 * primitive's auto-wiring must run without a "Duplicate plugin" throw.
 */

// happy-dom is registered via the ./happydom.ts preload (see bunfig.toml) so
// that solid-js/web captures a live `document` at import time.
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { render } from "solid-js/web";
import { createVList } from "./index";
import { grid, autosize, type VListItem } from "vlist";
import type { UseVListConfig } from "./index";

interface Row extends VListItem {
  id: string;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `row-${i}` }));
const template = (r: Row): string => `<div class="row" data-id="${r.id}">${r.id}</div>`;

const VIEWPORT_H = 500;
const VIEWPORT_W = 300;

function installLayoutShims(): () => void {
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => VIEWPORT_H });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => VIEWPORT_W });
  const RealRO = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) { this.cb = cb; }
    observe(target: Element): void {
      this.cb([{ target, contentRect: { width: VIEWPORT_W, height: VIEWPORT_H } as DOMRectReadOnly } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;
  const realRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number) as typeof requestAnimationFrame;
  return () => { globalThis.ResizeObserver = RealRO; globalThis.requestAnimationFrame = realRAF; };
}

let restoreShims: () => void;
beforeAll(() => { restoreShims = installLayoutShims(); });
afterAll(() => { restoreShims?.(); });

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 5));

/**
 * Mount the primitive with Solid's real renderer so onMount fires. The mounted
 * component creates the container element, wires it via setRef, and returns it
 * for insertion. `render` returns a dispose() that tears the root down.
 */
async function mount(config: UseVListConfig<Row>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  let api!: ReturnType<typeof createVList<Row>>;
  const dispose = render(() => {
    const div = document.createElement("div") as HTMLDivElement;
    api = createVList<Row>(() => config);
    api.setRef(div);
    return div;
  }, host);
  await flush();
  const container = host.firstElementChild as HTMLElement;
  return { container, instance: api.instance, dispose };
}

describe("createVList — render", () => {
  it("mounts and virtualizes a large list", async () => {
    const { container, instance, dispose } = await mount({ item: { height: 40, template }, items: rows(1000) });
    expect(instance()).not.toBeNull();
    const rendered = container.querySelectorAll(".row");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);
    dispose();
  });

  it("tears down the instance when the root is disposed", async () => {
    const { instance, dispose } = await mount({ item: { height: 40, template }, items: rows(100) });
    expect(instance()).not.toBeNull();
    dispose();
    expect(instance()).toBeNull();
  });

  it("#119: accepts and runs a plugins array overlapping auto-wiring", async () => {
    const { container, instance, dispose } = await mount({
      item: { estimatedHeight: 200, template },
      items: rows(200),
      plugins: [grid({ columns: 3 }), autosize()],
    });
    expect(instance()).not.toBeNull();
    expect(container.querySelectorAll(".row").length).toBeGreaterThan(0);
    dispose();
  });
});
