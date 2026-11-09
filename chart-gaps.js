// Runs in the page's MAIN world. Alpaca's portfolio chart (Chart.js scatter on a
// linear x axis of timestamps) stretches over market-closed periods (nights,
// weekends), drawing long flat interpolated segments. Re-plot x by sample index
// instead, so every data point gets equal horizontal space and gaps collapse.
//
// Point objects keep their original `x` Date: Alpaca's hover readout reads it
// from the raw point. We add an index key and point the dataset's parsing at it.
(() => {
  const IDX_KEY = '__alpacaExtIdx';
  const TS_THRESHOLD = 1e11; // values above this are epoch-ms timestamps, not indices

  const isTimePoint = (p) => p != null && p.x instanceof Date;
  const hasTimeData = (ds) => Array.isArray(ds?.data) && ds.data.length > 0 && isTimePoint(ds.data[0]);

  // Map a timestamp bound (scales.x.min/max) into index space.
  function toIndex(value, times) {
    const ts = value instanceof Date ? value.getTime() : value;
    if (typeof ts !== 'number' || ts < TS_THRESHOLD) return value; // already an index (e.g. zoomed)
    let lo = 0;
    let hi = times.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (times[mid] < ts) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function compressGaps(chart) {
    if (chart.config?.type !== 'scatter') return;
    const datasets = chart.data?.datasets ?? [];
    if (!datasets.some(hasTimeData)) return;

    // Shared index across all series so multiple accounts stay aligned.
    const unique = new Set();
    for (const ds of datasets) {
      if (!hasTimeData(ds)) continue;
      for (const p of ds.data) if (isTimePoint(p)) unique.add(p.x.getTime());
    }
    const times = [...unique].sort((a, b) => a - b);
    const indexOf = new Map(times.map((t, i) => [t, i]));

    datasets.forEach((ds, i) => {
      if (!hasTimeData(ds)) return;
      for (const p of ds.data) {
        if (isTimePoint(p)) p[IDX_KEY] = indexOf.get(p.x.getTime());
      }
      ds.parsing = { xAxisKey: IDX_KEY, yAxisKey: 'y' };
      // Existing controllers cache parsing options; refresh so this update re-parses.
      chart.getDatasetMeta(i)?.controller?.configure?.();
    });

    const x = chart.config.options?.scales?.x;
    if (x && times.length) {
      if (x.min != null) x.min = toIndex(x.min, times);
      if (x.max != null) x.max = toIndex(x.max, times);
    }
  }

  let patched = false;

  function patchChartClass(Chart) {
    if (patched) return;
    patched = true;
    const origUpdate = Chart.prototype.update;
    Chart.prototype.update = function (mode) {
      try {
        compressGaps(this);
      } catch (e) {
        console.warn('[alpaca-ext] chart gap compression failed', e);
      }
      return origUpdate.call(this, mode);
    };
  }

  // Chart.js is bundled (no global), so reach an instance through React's fiber
  // tree: react-chartjs-2 keeps it in a useRef next to the <canvas>.
  function findChartForCanvas(canvas) {
    const fiberKey = Object.keys(canvas).find((k) => k.startsWith('__reactFiber$'));
    let fiber = fiberKey && canvas[fiberKey];
    for (let depth = 0; fiber && depth < 8; depth++, fiber = fiber.return) {
      let hook = fiber.memoizedState;
      for (let n = 0; hook && typeof hook === 'object' && 'next' in hook && n < 30; n++, hook = hook.next) {
        const chart = hook.memoizedState?.current;
        if (chart && chart.canvas === canvas && typeof chart.update === 'function') return chart;
      }
    }
    return null;
  }

  function scan() {
    for (const canvas of document.querySelectorAll('canvas')) {
      const chart = findChartForCanvas(canvas);
      if (!chart) continue;
      patchChartClass(chart.constructor);
      chart.update('none'); // apply to the chart that already rendered
    }
    if (!patched) setTimeout(scan, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }
})();