import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import ReactApexChart from "react-apexcharts";
import { sanitizeChartData } from "../../../../utils/sanitizeChartData";
import moment from "moment";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import DateRangePicker from "../../Calendar/DateRangePicker";
import {
  useGetBroadCastChartQuery,
  useGetAllCampainsQuery,
  useGetCampaignDataQuery
} from "../../../../store/ApiFilesV2/UserApis";
import { useGetAllSchedulesQuery } from "../../../../store/ApiFilesV2/TemplateApisV2";
import _ from "lodash";

const BroadcastLogs = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [pagination, setPagination] = useState({
    ofset: 0,
    limit: 10,
  });

  // Fetch broadcast chart data
  const { data: chartData, isLoading: chartLoading, error: chartError, refetch: refetchChartData } = useGetBroadCastChartQuery({
    startDate: selectedDateRange.startDate,
    endDate: selectedDateRange.endDate
  });

  const apexChartPayload = React.useMemo(() => {
    const defaults = {
      options: {
        chart: { type: "area", height: 350, toolbar: { show: false } },
        stroke: { curve: "smooth" },
        xaxis: { categories: [] },
      },
      series: [
        { name: "Sent", data: [] },
        { name: "Delivered", data: [] },
        { name: "Read", data: [] },
      ],
    };
    if (!chartData || chartError) return sanitizeChartData(null, defaults);
    return sanitizeChartData(chartData, defaults);
  }, [chartData, chartError]);

  // Fetch all campaigns
  const { data: allCampaigns = [], isLoading: campaignsLoading, refetch: refetchTableData } = useGetAllCampainsQuery();

  // Fetch scheduled campaigns to exclude them - FIXED: using proper parameters
  const { data: scheduledCampaignsResponse = [], refetch: scheduleRefetch } = useGetAllSchedulesQuery({
    ofset: pagination.ofset,
    limit: pagination.limit,
    groups: "", // Changed from "all" to empty string as in old code
  });

  // Extract scheduled campaign IDs
  const scheduledCampaignIds = React.useMemo(() => {
    return scheduledCampaignsResponse?.data?.map(schedule => schedule.campaignId) || [];
  }, [scheduledCampaignsResponse]);

  // Filter campaigns: Only broadcast (exclude API, scheduled, and filter by date range)
  const campaigns = React.useMemo(() => {
    if (!allCampaigns || allCampaigns.length === 0) return [];

    return allCampaigns.filter(campaign => {
      // Filter by date range (from old code)
      const itemDate = moment(campaign?.publishedTime).format("YYYY-MM-DD");
      const isInDateRange = moment(itemDate).isBetween(
        selectedDateRange.startDate,
        selectedDateRange.endDate,
        null,
        "[]"
      );

      // Exclude scheduled campaigns (from old code)
      const isNotInSchedules = !scheduledCampaignIds.includes(campaign._id);
      
      // Exclude API campaigns (from old code logic: no method = broadcast)
      const isNotApiCampaign = !campaign.method;

      // Exclude scheduled campaigns (from old code)
      const isNotScheduled = !campaign.isScheduled;

      return isInDateRange && isNotInSchedules && isNotApiCampaign && isNotScheduled;
    });
  }, [allCampaigns, scheduledCampaignIds, selectedDateRange]);

  // Fetch campaign details when selected - INCLUDES DATE RANGE
  const { data: campaignDetails, isLoading: detailsLoading, refetch: refetchCampaignDetails } = useGetCampaignDataQuery(
    {
      id: selectedCampaign?._id,
      offset: (detailCurrentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      number: searchTerm || null,
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate
    },
    { skip: !selectedCampaign }
  );

  // Refetch data when date range changes (from old code)
  React.useEffect(() => {
    if (selectedDateRange?.startDate && selectedDateRange?.endDate) {
      refetchChartData({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
      });

      refetchTableData();
      scheduleRefetch();
    }
  }, [selectedDateRange, refetchChartData, refetchTableData, scheduleRefetch]);

  // Set first record as selected when campaign details load
  React.useEffect(() => {
    if (campaignDetails?.data?.length > 0 && !selectedRecord) {
      setSelectedRecord(campaignDetails.data[0]);
    }
  }, [campaignDetails]);

  // Pagination for main table
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

  // Pagination for detail view
  const detailTotalPages = Math.ceil((campaignDetails?.total || 0) / itemsPerPage);

  const getPaginationNumbers = (current, total) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handleDateChange = ({ startDate, endDate }) => {
    const newStartDate = moment(startDate).format('YYYY-MM-DD');
    const newEndDate = moment(endDate).format('YYYY-MM-DD');
    
    setSelectedDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });

    // Reset to first page when date changes
    setCurrentPage(1);

    // Refetch campaign details if a campaign is selected
    if (selectedCampaign) {
      refetchCampaignDetails();
    }
  };

  const handleRowClick = (campaign) => {
    setSelectedCampaign(campaign);
    setSelectedRecord(null);
    setDetailCurrentPage(1);
    setSearchTerm("");
  };

  const handleBack = () => {
    setSelectedCampaign(null);
    setSelectedRecord(null);
    setDetailCurrentPage(1);
    setSearchTerm("");
  };

  const handleDownloadReport = () => {
    const campaignId = selectedCampaign?._id;
    const url = `${process.env.REACT_APP_API_URL}users/exportCampaign/${campaignId}?startDate=${selectedDateRange.startDate}&endDate=${selectedDateRange.endDate}`;
    const loginDetails = JSON.parse(localStorage.getItem("loginData"));

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${loginDetails?.token}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${campaignId}-report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download error:', error));
  };

  // Add global report download function from old code
  const handleGlobalReportDownload = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}users/globalcampaignreport`;
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginDetails?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${new Date(selectedDateRange.startDate).getTime()}-${new Date(
        selectedDateRange.endDate
      ).getTime()}-Report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleEyeClick = (record) => {
    setSelectedRecord(record);
  };

  // Detail view when campaign is selected
  if (selectedCampaign) {
    return (
      <MasterLayout>
        <Breadcrumb title="Broadcast Reports" />

        {/* Action Bar */}
        <div style={{ marginTop: "20px", marginBottom: "20px" }} className="d-flex align-items-center justify-content-between">
          <div className="d-flex gap-3">
            <button
              onClick={handleBack}
              className="btn-primary d-flex align-items-center gap-2"
              style={{ height: "40px" }}
            >
              <Icon icon="solar:arrow-left-outline" style={{ fontSize: "20px" }} />
              Back
            </button>
            <input
              type="text"
              placeholder="Search Contact"
              className="form-control"
              style={{ width: "250px", height: "40px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-3">
            <DateRangePicker
              onDateChange={handleDateChange}
              placeholder="Select date range"
              initialStartDate={selectedDateRange.startDate}
              initialEndDate={selectedDateRange.endDate}
            />
            <button
              onClick={handleDownloadReport}
              className="btn-primary d-flex align-items-center gap-2"
              style={{ height: "40px" }}
            >
              <Icon icon="typcn:download" style={{ fontSize: "20px" }} />
              Download Report
            </button>
          </div>
        </div>

        <div className="row">
          {/* Table Section */}
          <div className="col-xxl-8 col-xl-7">
            <div className="card basic-data-table">
              <div className="card-body">
                {detailsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table bordered-table mb-0">
                        <thead>
                          <tr>
                            <th scope="col">S.No.</th>
                            <th scope="col">Mobile Number</th>
                            <th scope="col" className="text-center">Failed</th>
                            <th scope="col" className="text-center">Sent</th>
                            <th scope="col" className="text-center">Delivered</th>
                            <th scope="col" className="text-center">Read</th>
                            <th scope="col" className="text-center">Replied</th>
                            <th scope="col" className="text-center">Reason</th>
                            <th scope="col" className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaignDetails?.data?.map((item, index) => (
                            <tr key={index}>
                              <td>{(detailCurrentPage - 1) * itemsPerPage + index + 1}</td>
                              <td>
                                <h6 className="text-md mb-0 fw-medium">
                                  {item.data.to}
                                </h6>
                              </td>
                              <td className="text-center">
                                {item.data.status === 'failed' ? '✓' : ''}
                              </td>
                              <td className="text-center">
                                {item.data.status === 'sent' || item.data.status === 'delivered' || item.data.status === 'read' ? '✓' : ''}
                              </td>
                              <td className="text-center">
                                {item.data.status === 'delivered' || item.data.status === 'read' ? '✓' : ''}
                              </td>
                              <td className="text-center">
                                {item.data.status === 'read' ? '✓' : ''}
                              </td>
                              <td className="text-center">
                                {item.reply ? '✓' : ''}
                              </td>
                              <td className="text-center">
                                {item.data.status === 'failed' ? (
                                  <div className="custom-tooltip-container" style={{ display: 'inline-block' }}>
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      {item.data.error?.message || item.data.error?.title || 'Failed - No reason provided'}
                                    </span>
                                  </div>
                                ) : '-'}
                              </td>
                              <td className="text-center">
                                <Icon
                                  icon="solar:eye-linear"
                                  style={{
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: "#28a745"
                                  }}
                                  onClick={() => handleEyeClick(item)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {campaignDetails?.total > itemsPerPage && (
                      <div className="col-md-12 mt-3">
                        <div className="card p-10 overflow-hidden position-relative radius-12">
                          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-end mb-0">
                            <li className="page-item">
                              <button
                                className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                                onClick={() => setDetailCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={detailCurrentPage === 1}
                              >
                                <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
                              </button>
                            </li>

                            {getPaginationNumbers(detailCurrentPage, detailTotalPages).map((pageNumber, index) => (
                              <li className="page-item" key={index}>
                                {pageNumber === '...' ? (
                                  <span className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px disabled">
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    className={`page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${detailCurrentPage === pageNumber ? 'active bg-primary text-white' : ''}`}
                                    onClick={() => setDetailCurrentPage(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                )}
                              </li>
                            ))}

                            <li className="page-item">
                              <button
                                className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                                onClick={() => setDetailCurrentPage(prev => Math.min(detailTotalPages, prev + 1))}
                                disabled={detailCurrentPage === detailTotalPages}
                              >
                                <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Preview Section */}
          <div className="col-xxl-4 col-xl-5">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                {/* iPhone Frame */}
                <div style={{ position: "relative", width: "280px", height: "570px" }}>
                  <div style={{
                    position: "absolute",
                    inset: "0",
                    background: "#1a1a1a",
                    borderRadius: "45px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    padding: "12px"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "0",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "128px",
                      height: "24px",
                      background: "#1a1a1a",
                      borderRadius: "0 0 20px 20px",
                      zIndex: "10"
                    }}></div>

                    <div style={{
                      position: "relative",
                      background: "#fff",
                      width: "100%",
                      height: "100%",
                      borderRadius: "35px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        background: "#075e54",
                        height: "80px",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "0 16px 8px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "end",
                          width: "100%"
                        }}>
                          <div style={{ color: "#fff", fontSize: "20px" }}>⋮</div>
                        </div>
                      </div>

                      <div style={{
                        background: "#e5ddd5",
                        height: "calc(100% - 132px)",
                        padding: "16px",
                        overflowY: "auto"
                      }}>
                        {selectedRecord && (
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                            <div style={{
                              background: "#dcf8c6",
                              borderRadius: "8px",
                              padding: "12px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                              maxWidth: "220px",
                              position: "relative"
                            }}>
                              <div style={{
                                position: "absolute",
                                right: "-8px",
                                top: "0",
                                width: "0",
                                height: "0",
                                borderLeft: "8px solid #dcf8c6",
                                borderTop: "8px solid transparent"
                              }}></div>

                              {/* Header */}
                              {selectedRecord.data.template?.header && (
                                <div style={{ marginBottom: "8px" }}>
                                  {selectedRecord.data.template?.headerType === 'image' && (
                                    <img
                                      src={selectedRecord.data.template.header}
                                      alt="header"
                                      style={{ width: "100%", borderRadius: "4px" }}
                                    />
                                  )}
                                  {selectedRecord.data.template?.headerType === 'video' && (
                                    <video
                                      controls
                                      style={{ width: "100%", borderRadius: "4px" }}
                                    >
                                      <source src={selectedRecord.data.template.header} type="video/mp4" />
                                    </video>
                                  )}
                                  {selectedRecord.data.template?.headerType === 'text' && (
                                    <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                                      {selectedRecord.data.template.header}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Message Body */}
                              <p style={{
                                fontSize: "13px",
                                color: "#303030",
                                lineHeight: "1.5",
                                margin: "0",
                                whiteSpace: "pre-wrap"
                              }}>
                                {selectedRecord.data.template?.message || selectedCampaign._id}
                              </p>

                              {/* Footer */}
                              {selectedRecord.data.template?.footer && (
                                <p style={{
                                  fontSize: "11px",
                                  color: "#667781",
                                  marginTop: "8px",
                                  marginBottom: "0"
                                }}>
                                  {selectedRecord.data.template.footer}
                                </p>
                              )}

                              {/* Timestamp and Status */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: "4px",
                                marginTop: "4px"
                              }}>
                                <span style={{ fontSize: "11px", color: "#667781" }}>
                                  {moment(selectedRecord.data.createdAt).format('hh:mm A')}
                                </span>
                                <Icon icon="bi:check-all" style={{ fontSize: "14px", color: "#53bdeb" }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        background: "#f0f0f0",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderTop: "1px solid #ddd"
                      }}>
                        <span style={{ fontSize: "20px" }}>😊</span>
                        <input
                          type="text"
                          placeholder="Message"
                          style={{
                            flex: "1",
                            background: "#fff",
                            border: "none",
                            borderRadius: "20px",
                            padding: "8px 16px",
                            fontSize: "13px",
                            outline: "none"
                          }}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  // Main table view
  return (
    <MasterLayout>
      <Breadcrumb title="Broadcast Reports" />

      <div className="col-xxl-12">
        <div className="card h-100 radius-8 border-0">
          <div className="card-body">
            <div className="d-flex align-items-start flex-wrap gap-2">
              <div>
                <h6 className="mb-2 text-lg">
                  Delivery Chart for last 7 Days Report
                </h6>
              </div>
              <div className="ms-auto">
                <DateRangePicker
                  onDateChange={handleDateChange}
                  placeholder="Select date range"
                  initialStartDate={selectedDateRange.startDate}
                  initialEndDate={selectedDateRange.endDate}
                />
              </div>
            </div>
            <div id="barChart">
              {chartLoading ? (
                <div className="text-center py-4">Loading chart...</div>
              ) : chartError ? (
                <div className="text-center py-4 text-danger">Error loading chart</div>
              ) : (
                <ReactApexChart
                  options={apexChartPayload.options || {}}
                  series={apexChartPayload.series || []}
                  type="area"
                  height={360}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div style={{ marginBottom: "20px" }} className="d-flex align-items-center flex-wrap gap-2 justify-content-end">
            <div className="d-flex gap-3 align-items-center">
              <DateRangePicker
                onDateChange={handleDateChange}
                placeholder="Select date range"
                initialStartDate={selectedDateRange.startDate}
                initialEndDate={selectedDateRange.endDate}
              />
              <button
                style={{ height: "40px", marginTop: "0px" }}
                className="btn-primary d-flex align-items-center gap-2"
                onClick={handleGlobalReportDownload}
              >
                <Icon style={{ fontSize: "20px" }} icon="typcn:download" />
                Download Report
              </button>
              <div className="tooltip-container">
                <button className="d-flex align-items-center justify-content-center">
                  <Icon
                    icon="fa-regular:question-circle"
                    style={{ fontSize: "24px", color: "var(--text-secondary)" }}
                  />
                </button>
                <div className="custom-tooltip">
                  Click "Download Report" for the last 7 days report or select a date for a
                  specific report on the filter.
                </div>
              </div>
            </div>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-4">Loading campaigns...</div>
          ) : (
            <>
              <div className="table-responsive position-relative">
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">
                        <div className="form-check style-check d-flex align-items-center">
                          <label className="form-check-label">S.No.</label>
                        </div>
                      </th>
                      <th scope="col">Campaign ID</th>
                      <th scope="col">Published Time</th>
                      <th scope="col">Target Users</th>
                      <th scope="col">Failed</th>
                      <th scope="col">Sent</th>
                      <th scope="col">Delivered</th>
                      <th scope="col">Read</th>
                      <th scope="col">Pending</th>
                      <th scope="col">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCampaigns.map((campaign, index) => (
                      <tr
                        key={campaign._id}
                        onClick={() => handleRowClick(campaign)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="form-check style-check d-flex align-items-center">
                            <label className="form-check-label">{startIndex + index + 1}</label>
                          </div>
                        </td>
                        <td className="fw-bold text-primary-2">
                          {campaign._id}
                        </td>
                        <td>
                          {moment(campaign.publishedTime).format('DD/MM/YYYY hh:mm A')}
                        </td>
                        <td>{campaign.tagetUsers || 0}</td>
                        <td>{campaign.failed || 0}</td>
                        <td>{campaign.sent || 0}</td>
                        <td>{campaign.delivered || 0}</td>
                        <td>{campaign.read || 0}</td>
                        <td>{campaign.pending || 0}</td>
                        <td>{campaign.error || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {campaigns.length > itemsPerPage && (
                <div className="col-md-12 mt-3">
                  <div className="card p-10 overflow-hidden position-relative radius-12">
                    <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-end mb-0">
                      <li className="page-item">
                        <button
                          className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
                        </button>
                      </li>

                      {getPaginationNumbers(currentPage, totalPages).map((pageNumber, index) => (
                        <li className="page-item" key={index}>
                          {pageNumber === '...' ? (
                            <span className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px disabled">
                              ...
                            </span>
                          ) : (
                            <button
                              className={`page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${currentPage === pageNumber ? 'active bg-primary text-white' : ''}`}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          )}
                        </li>
                      ))}

                      <li className="page-item">
                        <button
                          className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MasterLayout>
  );
};

export default BroadcastLogs;