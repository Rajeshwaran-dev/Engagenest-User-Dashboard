export const sanitizeChartData = (chartData, defaults = {}) => {
  if (!chartData) {
    return {
      options: defaults.options || { chart: { type: "area" }, xaxis: { categories: [] } },
      series: defaults.series || [],
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
    };
  }

  // Simple deep clone that removes functions (JSON.stringify drops functions)
  // This also ensures we don't pass frozen objects from RTK Query.
  let cloned;
  try {
    cloned = JSON.parse(JSON.stringify(chartData));
  } catch (err) {
    // Fallback: shallow copy
    cloned = Object.assign({}, chartData);
  }

  // Ensure series data are numeric arrays (no NaN, no undefined)
  cloned.series = (cloned.series || []).map((s) => {
    return {
      name: s.name,
      data: (s.data || []).map((v) => {
        const num = Number(v);
        return Number.isFinite(num) ? num : 0;
      }),
    };
  });

  // If xaxis.categories missing, provide a safe default (Apex can handle empty)
  cloned.options = cloned.options || {};
  cloned.options.xaxis = cloned.options.xaxis || { categories: [] };

  // Some charts rely on formatters — reattach safe formatters here
  // (formatter functions must be created here, not coming from state)
  if (cloned.options.yaxis) {
    // Attach a safe formatter that simply returns the value
    cloned.options.yaxis.labels = cloned.options.yaxis.labels || {};
    cloned.options.yaxis.labels.formatter = function (val) {
      // avoid fractional display if wanted
      return Math.floor(Number(val)) || 0;
    };
  } else {
    cloned.options.yaxis = {
      labels: {
        formatter: function (val) {
          return Math.floor(Number(val)) || 0;
        },
      },
    };
  }

  // Tooltip y formatter (if present in original, it was lost by stringify; add safe)
  cloned.options.tooltip = cloned.options.tooltip || {};
  cloned.options.tooltip.y = cloned.options.tooltip.y || {};
  cloned.options.tooltip.y.formatter = function (val) {
    return `${val} messages`;
  };

  // Ensure counts are numeric
  cloned.sent_count = Number(cloned.sent_count) || 0;
  cloned.delivered_count = Number(cloned.delivered_count) || 0;
  cloned.read_count = Number(cloned.read_count) || 0;

  return cloned;
};