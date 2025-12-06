const useReactApexChart = () => {
  // Always provide NON-NULL categories
  const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const zoomAbleLineChartSeries = [
    {
      name: "Sent",
      data: [120, 150, 100, 180, 140, 160, 200],
    },
    {
      name: "Delivered",
      data: [100, 130, 90, 160, 130, 150, 190],
    },
    {
      name: "Read",
      data: [80, 110, 70, 140, 120, 130, 170],
    },
  ];

  const zoomAbleLineChartOptions = {
    chart: {
      type: "area",
      height: 266,
      toolbar: { show: false },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    dataLabels: { enabled: false },

    markers: {
      size: 0,
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0.1,
      },
    },

    xaxis: {
      categories: categories,
      labels: { style: { fontSize: "13px" } },
    },

    yaxis: {
      labels: {
        formatter: (val) => val,
        style: { fontSize: "13px" },
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val} messages` },
    },

    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
    },
  };

  return {
    zoomAbleLineChartOptions,
    zoomAbleLineChartSeries,
    categories,
  };
};

export default useReactApexChart;
