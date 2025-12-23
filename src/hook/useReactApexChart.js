const useReactApexChart = () => {
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

  let multipleSeriesChartSeries = [20, 22, 28, 10, 25, 20];
  let multipleSeriesChartOptions = {
    chart: {
      type: "polarArea",
      height: 264,
    },
    labels: ["New Lead", "Hot", "Warm", "Cold", "Converted", "Invalid"],
    colors: ["#487FFF", "#FF9F29", "#9935FE", "#EF4A00", "#211f60", "var(--primary)"],
    stroke: {
      colors: [
        "#487FFF",
        "#FF9F29",
        "#9935FE",
        "#EF4A00",
        "#211f60",
        "var(--primary)",
      ],
    },
    fill: {
      opacity: 0.8,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center", // Align the legend horizontally
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return {
    zoomAbleLineChartOptions,
    zoomAbleLineChartSeries,
    multipleSeriesChartOptions,
    multipleSeriesChartSeries,
    categories,
  };
};

export default useReactApexChart;
