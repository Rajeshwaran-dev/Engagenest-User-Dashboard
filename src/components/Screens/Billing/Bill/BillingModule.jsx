import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import DateRangePicker from "../../Calendar/DateRangePicker";
import {
  useGetBillingReportsQuery,
  useGetUserBalanceQuery,
  useGetBillingAnalyticsQuery
} from "../../../../store/ApiFilesV2/UserApis";
import { useGetWalletTransactionsQuery } from "../../../../store/ApiFilesV2/PaymentsApis";
import moment from "moment";

const BillingModule = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: moment().subtract(7, 'days').valueOf(),
    endDate: moment().valueOf(),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: balanceData, isLoading: balanceLoading } = useGetUserBalanceQuery();
  const { data: billingReports, isLoading: reportsLoading } = useGetBillingReportsQuery({
    startDate: selectedDateRange.startDate,
    endDate: selectedDateRange.endDate,
  });
  const { data: billingAnalytics, isLoading: analyticsLoading } = useGetBillingAnalyticsQuery({
    startDate: selectedDateRange.startDate,
    endDate: selectedDateRange.endDate,
  });

  const handleDateChange = ({ startDate, endDate }) => {
    setSelectedDateRange({
      startDate: moment(startDate).valueOf(),
      endDate: moment(endDate).valueOf()
    });
    setCurrentPage(1);
  };

  // Calculate pagination values
  const totalItems = billingAnalytics?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = billingAnalytics?.slice(indexOfFirstItem, indexOfLastItem) || [];

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pageNumbers;
  };

  // ✅ FIXED: Billing cards now use billingReports (which comes from /conversationCost)
  const billingCards = [
    {
      id: 1,
      title: "MC Central Balance Usage",
      value: billingReports?.marketing ? `₹ ${billingReports.marketing.toFixed(2)}` : "₹ 0.00",
      icon: "ic:outline-account-balance",
      color: "primary",
    },
    {
      id: 2,
      title: "UC Central Balance Usage",
      value: billingReports?.utility ? `₹ ${billingReports.utility.toFixed(2)}` : "₹ 0.00",
      icon: "ic:outline-account-balance",
      color: "primary",
    },
    {
      id: 3,
      title: "AC Central Balance Usage",
      value: billingReports?.authentication ? `₹ ${billingReports.authentication.toFixed(2)}` : "₹ 0.00",
      icon: "ic:outline-account-balance",
      color: "primary",
    },
    {
      id: 4,
      title: "BIC Central Balance Usage",
      value: billingReports?.business ? `₹ ${billingReports.business.toFixed(2)}` : "₹ 0.00",
      icon: "ic:outline-account-balance",
      color: "primary",
    },
    {
      id: 5,
      title: "SM Central Balance Usage",
      value: billingReports?.service ? `₹ ${billingReports.service.toFixed(2)}` : "₹ 0.00",
      icon: "ic:outline-account-balance",
      color: "primary",
    },
    {
      id: 6,
      title: "Total Usage",
      value: billingReports?.total ? `₹ ${billingReports.total.toFixed(2)}` : "₹ 0.00",
      icon: "solar:wallet-outline",
      color: "primary",
    },
  ];

  return (
    <>
      <div className="col-xxl-12">
        <div className="d-flex justify-content-end align-items-center mb-4 p-12">
          <div className="d-flex align-items-center gap-3">
            <div className="d-md-none">
              <DateRangePicker
                onDateChange={handleDateChange}
                placeholder="Select date range"
              />
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="row h-100 g-0 p-10">
          {billingCards.map((card) => (
            <div key={card.id} className="col-xxl-4 col-md-6 col-sm-12 p-0 m-0 p-10">
              <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className={`mb-0 w-40-px h-40-px bg-${card.color} flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-2`}>
                      <Icon icon={card.icon} className="icon" />
                    </span>
                    <span className="fw-medium text-secondary-light text-md mb-4">
                      {card.title}
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      {reportsLoading ? (
                        <span className="" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                      ) : (
                        card.value
                      )}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BILLING CHILD TABS SECTION */}
      <div className="card-body p-24">
        <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
          <ul
            className="nav bordered-tab nav-pills mb-0"
            id="pills-tab-billing-child"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active new-flex"
                id="pills-billing-reports-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-billing-reports"
                type="button"
                role="tab"
                aria-controls="pills-billing-reports"
                aria-selected="false"
                tabIndex={-1}
              >
                Billing Reports
              </button>
            </li>
          </ul>
        </div>

        {/* BILLING CHILD TAB CONTENT */}
        <div className="tab-content" id="pills-tabContent-billing-child">
          {/* Billing Reports Tab */}
          <div
            className="tab-pane fade show active"
            id="pills-billing-reports"
            role="tabpanel"
            aria-labelledby="pills-billing-reports-tab"
            tabIndex={0}
          >
            {analyticsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : totalItems > 0 ? (
              <>
                <div className="table-responsive scroll-sm">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Marketing Cost</th>
                        <th scope="col">Service Cost</th>
                        <th scope="col">Utility Cost</th>
                        <th scope="col">Authentication Cost</th>
                        <th scope="col">Business Cost</th>
                        <th scope="col">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <span>{item._id}</span>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{item.marketing?.toFixed(2) || "0.00"}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{item.service?.toFixed(2) || "0.00"}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{item.utility?.toFixed(2) || "0.00"}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{item.authentication?.toFixed(2) || "0.00"}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{item.business?.toFixed(2) || "0.00"}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              ₹{((item.marketing || 0) + (item.service || 0) + (item.utility || 0) + (item.authentication || 0) + (item.business || 0)).toFixed(2)}
                            </h6>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Component */}
                {totalItems > itemsPerPage && (
                  <div className="mt-4">
                    <div className="d-flex flex-wrap align-items-center justify-content-end">
                      <div className="card p-10 overflow-hidden position-relative radius-12 mt-3">
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-end mb-0">
                          <li className="page-item">
                            <button
                              className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                            >
                              <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
                            </button>
                          </li>

                          {getPaginationNumbers().map((pageNumber, index) => (
                            <li className="page-item" key={index}>
                              {pageNumber === '...' ? (
                                <span className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px disabled">
                                  ...
                                </span>
                              ) : (
                                <button
                                  className={`page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${currentPage === pageNumber ? 'active' : ''}`}
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              )}
                            </li>
                          ))}

                          <li className="page-item">
                            <button
                              className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                            >
                              <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No billing data available for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingModule;