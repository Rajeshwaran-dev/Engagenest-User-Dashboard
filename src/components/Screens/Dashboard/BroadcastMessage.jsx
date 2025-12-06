import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Icon } from "@iconify/react/dist/iconify.js";
import DateRangePicker from "../Calendar/DateRangePicker";
import useReactApexChart from "../../../hook/useReactApexChart";
import {
  useGetBroadCastChartQuery,
  useGetApiBroadCastChartQuery
} from "../../../store/ApiFilesV2/UserApis";

const BroadcastMessage = () => {
  const { zoomAbleLineChartOptions } = useReactApexChart();
  const [broadcastFrequency, setBroadcastFrequency] = useState("Last 7 Days");
  const [apiFrequency, setApiFrequency] = useState("Last 7 Days");
  
  // New state for controlling calendar visibility
  const [showBroadcastCalendar, setShowBroadcastCalendar] = useState(false);
  const [showApiCalendar, setShowApiCalendar] = useState(false);

  // Calculate default dates
  const getDefaultDateRange = (daysBack = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Ensure dates are valid
    return {
      startDate: startDate instanceof Date && !isNaN(startDate) ? startDate : new Date(),
      endDate: endDate instanceof Date && !isNaN(endDate) ? endDate : new Date()
    };
  };

  const [broadcastDateRange, setBroadcastDateRange] = useState(getDefaultDateRange(7));
  const [apiDateRange, setApiDateRange] = useState(getDefaultDateRange(7));

  // Format dates for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format dates for API
  const formatDateForAPI = (date) => {
    if (!date) {
      return '';
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  };

  // Fetch broadcast chart data
  const { data: broadcastChartData, isLoading: broadcastLoading } = useGetBroadCastChartQuery({
    startDate: formatDateForAPI(broadcastDateRange.startDate),
    endDate: formatDateForAPI(broadcastDateRange.endDate)
  }, {
    skip: !broadcastDateRange.startDate || !broadcastDateRange.endDate ||
      formatDateForAPI(broadcastDateRange.startDate) === '' ||
      formatDateForAPI(broadcastDateRange.endDate) === ''
  });

  // Fetch API broadcast chart data
  const { data: apiChartData, isLoading: apiLoading } = useGetApiBroadCastChartQuery({
    startDate: formatDateForAPI(apiDateRange.startDate),
    endDate: formatDateForAPI(apiDateRange.endDate)
  }, {
    skip: !apiDateRange.startDate || !apiDateRange.endDate ||
      formatDateForAPI(apiDateRange.startDate) === '' ||
      formatDateForAPI(apiDateRange.endDate) === ''
  });

  // Handle frequency changes for Broadcast Messages
  const handleBroadcastFrequencyChange = (frequency) => {
    setBroadcastFrequency(frequency);
    const now = new Date();
    let startDate = new Date();

    switch (frequency) {
      case "Today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "Last 7 Days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "Last 28 Days":
        startDate.setDate(now.getDate() - 28);
        break;
      default:
        return;
    }

    setBroadcastDateRange({
      startDate,
      endDate: now
    });
  };

  // Handle frequency changes for API Messages
  const handleApiFrequencyChange = (frequency) => {
    setApiFrequency(frequency);
    const now = new Date();
    let startDate = new Date();

    switch (frequency) {
      case "Today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "Last 7 Days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "Last 28 Days":
        startDate.setDate(now.getDate() - 28);
        break;
      default:
        return;
    }

    setApiDateRange({
      startDate,
      endDate: now
    });
  };

  // Handle date range changes for Broadcast
  const handleBroadcastDateChange = (newDateRange) => {
    setBroadcastDateRange(newDateRange);
    setBroadcastFrequency("Custom");
  };

  // Handle date range changes for API
  const handleApiDateChange = (newDateRange) => {
    setApiDateRange(newDateRange);
    setApiFrequency("Custom");
  };

  // Toggle calendar visibility for Broadcast
  const toggleBroadcastCalendar = () => {
    setShowBroadcastCalendar(!showBroadcastCalendar);
    if (showApiCalendar) setShowApiCalendar(false); // Close other calendar if open
  };

  // Toggle calendar visibility for API
  const toggleApiCalendar = () => {
    setShowApiCalendar(!showApiCalendar);
    if (showBroadcastCalendar) setShowBroadcastCalendar(false); // Close other calendar if open
  };

  // Safely extract stats from API data
  const getBroadcastStats = () => {
    if (!broadcastChartData || broadcastLoading) {
      return { sent: 0, delivered: 0, read: 0 };
    }

    return {
      sent: broadcastChartData.sent_count || 0,
      delivered: broadcastChartData.delivered_count || 0,
      read: broadcastChartData.read_count || 0
    };
  };

  const getApiStats = () => {
    if (!apiChartData || apiLoading) {
      return { sent: 0, delivered: 0, read: 0 };
    }

    return {
      sent: apiChartData.sent_count || 0,
      delivered: apiChartData.delivered_count || 0,
      read: apiChartData.read_count || 0
    };
  };

  // Create DEEP COPIES of chart configuration to avoid immutable object issues
  const createChartConfig = (apiData, isLoading, frequency) => {
    // Use the original line/area chart options
    const baseOptions = zoomAbleLineChartOptions;

    if (!apiData || isLoading) {
      // Return a completely new object
      return {
        options: JSON.parse(JSON.stringify({
          ...baseOptions,
          xaxis: {
            ...baseOptions.xaxis,
            categories: []
          }
        })),
        series: []
      };
    }

    // Check if data has already been processed by RTK Query transformResponse
    if (apiData.options && apiData.series) {
      // Create deep copies to ensure mutability
      const optionsCopy = JSON.parse(JSON.stringify({
        ...baseOptions,
        ...apiData.options,
        chart: {
          ...baseOptions.chart,
          ...apiData.options?.chart
        },
        xaxis: {
          ...baseOptions.xaxis,
          ...apiData.options?.xaxis,
          categories: [...(apiData.options?.xaxis?.categories || apiData.newCategories || [])]
        }
      }));

      const seriesCopy = JSON.parse(JSON.stringify(apiData.series || []));

      return {
        options: optionsCopy,
        series: seriesCopy
      };
    }

    // Fallback: Generate chart data based on frequency
    let categories = [];
    let defaultData = [];

    if (frequency === "Today") {
      // For today, create time periods
      categories = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
      defaultData = [0, 0, 0, 0, 0, 0];
    } else if (frequency === "Last 7 Days") {
      // Generate last 7 days
      categories = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        categories.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      defaultData = [0, 0, 0, 0, 0, 0, 0];
    } else if (frequency === "Last 28 Days") {
      // For 28 days, show weekly breakdown
      categories = ["Week 1", "Week 2", "Week 3", "Week 4"];
      defaultData = [0, 0, 0, 0];
    } else {
      // Custom or fallback
      categories = ["1", "2", "3", "4"];
      defaultData = [0, 0, 0, 0];
    }

    // Create completely new objects
    const options = JSON.parse(JSON.stringify({
      ...baseOptions,
      xaxis: {
        ...baseOptions.xaxis,
        categories: categories
      }
    }));

    const series = [
      { name: "Sent", data: [...defaultData] },
      { name: "Delivered", data: [...defaultData] },
      { name: "Read", data: [...defaultData] }
    ];

    return {
      options,
      series
    };
  };

  const currentBroadcastStats = getBroadcastStats();
  const currentApiStats = getApiStats();

  // Create chart configurations with deep copies
  const broadcastChartConfig = createChartConfig(broadcastChartData, broadcastLoading, broadcastFrequency);
  const apiChartConfig = createChartConfig(apiChartData, apiLoading, apiFrequency);

  return (
    <>
      {/* Broadcast Message Card */}
      <div className="col-xxl-6">
        <div className="card h-100 radius-8 border-0">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <div>
                <h6 className="mb-2 text-lg">
                  Overview Summary of Broadcast Message
                </h6>
              </div>
              <div className="">
                <select
                  className="form-select form-select-sm w-auto bg-base border text-secondary-light new-width"
                  value={broadcastFrequency}
                  onChange={(e) => handleBroadcastFrequencyChange(e.target.value)}
                >
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 28 Days">Last 28 Days</option>
                </select>
              </div>
            </div>

            {/* Broadcast Stats Section */}
            <div className="mt-20 mb-10 d-flex justify-content-center flex-wrap gap-3">
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="hugeicons:sent-02" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Sent
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentBroadcastStats.sent}</h6>
                </div>
              </div>
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="hugeicons:package-delivered" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Delivered
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentBroadcastStats.delivered}</h6>
                </div>
              </div>
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="octicon:read-24" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Read
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentBroadcastStats.read}</h6>
                </div>
              </div>
            </div>

            {/* Broadcast Date Range and Report Title */}
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h6 className="mb-1 text-md">
                  {broadcastFrequency === "Custom"
                    ? `Custom Report`
                    : `${broadcastFrequency} Report`
                  }
                </h6>
              </div>

              {/* Broadcast Calendar Icon and Date Range Picker */}
              <div className="position-relative">
                {showBroadcastCalendar ? (
                  <div className="d-flex align-items-center gap-2">
                    <DateRangePicker
                      onDateChange={handleBroadcastDateChange}
                      placeholder="Select date range"
                      requireApply={false}
                      autoCloseOnSelect={true}
                      initialStartDate={broadcastDateRange.startDate}
                      initialEndDate={broadcastDateRange.endDate}
                    />
                    <button style={{ padding: "10px" }}
                      type="button"
                      className="btn-secondary"
                      onClick={toggleBroadcastCalendar}
                      title="Close calendar"
                    >
                      <Icon style={{ fontSize: "20px" }} icon="uil:calender" className="icon" />
                    </button>
                  </div>
                ) : (
                  <button style={{ padding: "10px" }}
                    type="button"
                    className="btn-secondary"
                    onClick={toggleBroadcastCalendar}
                    title="Open calendar"
                  >
                    <Icon style={{ fontSize: "20px" }} icon="uil:calender" className="icon" />
                    <span>
                      {broadcastFrequency === "Custom" 
                        ? `${formatDateForDisplay(broadcastDateRange.startDate)} ${formatDateForDisplay(broadcastDateRange.endDate)}`
                        : ""
                      }
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Broadcast Chart */}
            <div id="broadcastChart">
              {broadcastLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ReactApexChart
                  key={`broadcast-${broadcastFrequency}-${broadcastDateRange.startDate?.getTime()}`}
                  options={broadcastChartConfig.options}
                  series={broadcastChartConfig.series}
                  type="area"
                  height={264}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Message Card */}
      <div className="col-xxl-6">
        <div className="card h-100 radius-8 border-0">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <div>
                <h6 className="mb-2 text-lg">
                  Overview Summary of API Message
                </h6>
              </div>
              <div className="">
                <select
                  className="form-select form-select-sm w-auto bg-base border text-secondary-light new-width"
                  value={apiFrequency}
                  onChange={(e) => handleApiFrequencyChange(e.target.value)}
                >
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 28 Days">Last 28 Days</option>
                </select>
              </div>
            </div>

            {/* API Stats Section */}
            <div className="mt-20 mb-10 d-flex justify-content-center flex-wrap gap-3">
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="hugeicons:sent-02" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Sent
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentApiStats.sent}</h6>
                </div>
              </div>
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="hugeicons:package-delivered" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Delivered
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentApiStats.delivered}</h6>
                </div>
              </div>
              <div className="d-inline-flex align-items-center gap-2 p-2 radius-8 border pe-36 br-hover-primary group-item">
                <span className="bg-neutral-100 w-44-px h-44-px text-xxl radius-8 d-flex justify-content-center align-items-center text-secondary-light group-hover:bg-primary-600 group-hover:text-white">
                  <Icon icon="octicon:read-24" className="icon" />
                </span>
                <div>
                  <span className="text-secondary-light text-sm fw-medium">
                    Read
                  </span>
                  <h6 className="text-md fw-semibold mb-0">{currentApiStats.read}</h6>
                </div>
              </div>
            </div>

            {/* API Date Range and Report Title */}
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h6 className="mb-1 text-md">
                  {apiFrequency === "Custom"
                    ? `Custom Report`
                    : `${apiFrequency} Report`
                  }
                </h6>
                {apiLoading && (
                  <small className="text-primary">Loading...</small>
                )}
              </div>

              {/* API Calendar Icon and Date Range Picker */}
              <div className="position-relative">
                {showApiCalendar ? (
                  <div className="d-flex align-items-center gap-2">
                    <DateRangePicker
                      onDateChange={handleApiDateChange}
                      placeholder="Select date range"
                      requireApply={false}
                      autoCloseOnSelect={true}
                      initialStartDate={apiDateRange.startDate}
                      initialEndDate={apiDateRange.endDate}
                    />
                    <button style={{ padding: "10px" }}
                      type="button"
                      className="btn-secondary"
                      onClick={toggleApiCalendar}
                      title="Close calendar"
                    >
                      <Icon style={{ fontSize: "20px" }} icon="uil:calender" className="icon" />
                    </button>
                  </div>
                ) : (
                  <button style={{ padding: "10px" }}
                    type="button"
                    className="btn-secondary"
                    onClick={toggleApiCalendar}
                    title="Open calendar"
                  >
                    <Icon style={{ fontSize: "20px" }} icon="uil:calender"  className="icon" />
                    <span>
                      {apiFrequency === "Custom" 
                        ? `${formatDateForDisplay(apiDateRange.startDate)} ${formatDateForDisplay(apiDateRange.endDate)}`
                        : ""
                      }
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* API Chart */}
            <div id="apiChart">
              {apiLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ReactApexChart
                  key={`api-${apiFrequency}-${apiDateRange.startDate?.getTime()}`}
                  options={apiChartConfig.options}
                  series={apiChartConfig.series}
                  type="area"
                  height={264}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BroadcastMessage;