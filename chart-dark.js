// Runs in the page's MAIN world. Alpaca's portfolio chart (Chart.js) paints
// hard-coded light area fills onto the canvas, which CSS cannot override.
// While dark mode is on (content.js sets the attribute below), swap those
// fills for translucent versions of their line colors.
(() => {
  const DARK_ATTR = 'data-alpaca-ext-dark';
  const FILL_MAP = {
    '#fefde8': 'rgba(236, 185, 6, 0.12)',  // portfolio / master total (line #ECB906)
    '#f0f9ff': 'rgba(14, 165, 233, 0.12)', // default sub-account (line #0EA5E9)
    '#eef2ff': 'rgba(99, 102, 241, 0.12)', // other sub-account (line #6366F1)
  };

  const proto = CanvasRenderingContext2D.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'fillStyle');
  if (!desc?.set) return;

  Object.defineProperty(proto, 'fillStyle', {
    configurable: true,
    enumerable: desc.enumerable,
    get() {
      return desc.get.call(this);
    },
    set(value) {
      if (typeof value === 'string' && document.documentElement.hasAttribute(DARK_ATTR)) {
        value = FILL_MAP[value.toLowerCase()] ?? value;
      }
      desc.set.call(this, value);
    },
  });
})();