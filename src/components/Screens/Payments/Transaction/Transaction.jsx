import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import DateRangePicker from "../../Calendar/DateRangePicker";

const Transaction = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleDateChange = ({ startDate, endDate }) => {
    setSelectedDateRange({ startDate, endDate });
    console.log("Selected Date Range:", { startDate, endDate });
    // You can perform API calls or data filtering here
  };
  return (
    <>
      <div className="col-xxl-12">
        {/* Analytics Cards */}
        <div className="row h-100 g-0 p-10">
          <div className="col-xxl-3 col-lg-3 col-md-3 col-sm-12 p-0 m-0 p-10">
            <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                <div>
                  <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                    <Icon icon="fluent-mdl2:product" className="icon" />
                  </span>
                  <span className="mb-1 fw-medium text-secondary-light text-md">
                    Total revenue
                  </span>
                  <h6 className="fw-semibold text-primary-light mb-1">
                    ₹ 122.80
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-lg-3 col-md-3 col-sm-12 p-0 m-0 p-10">
            <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                <div>
                  <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                    <Icon icon="gridicons:product" className="icon" />
                  </span>
                  <span className="mb-1 fw-medium text-secondary-light text-md">
                    Order success
                  </span>
                  <h6 className="fw-semibold text-primary-light mb-1">23</h6>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-lg-3 col-md-3 col-sm-12 p-0 m-0 p-10">
            <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                <div>
                  <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                    <Icon
                      icon="icon-park-outline:folder-failed"
                      className="icon"
                    />
                  </span>
                  <span className="mb-1 fw-medium text-secondary-light text-md">
                    Order failed
                  </span>
                  <h6 className="fw-semibold text-primary-light mb-1">8</h6>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-lg-3 col-md-3 col-sm-12 p-0 m-0 p-10">
            <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                <div>
                  <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                    <Icon icon="ic:sharp-pending-actions" className="icon" />
                  </span>
                  <span className="mb-1 fw-medium text-secondary-light text-md">
                    Order pending
                  </span>
                  <h6 className="fw-semibold text-primary-light mb-1">89</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BILLING CHILD TABS SECTION */}
      <div className="card-body p-24">
        <div className="d-flex justify-content-between align-items-center mb-4 p-12">
          {/* Right Side - Export Button */}
          <div className="d-flex align-items-center d-md-none gap-3">
            <select
              style={{ width: "200px" }}
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All Payments">All Payments</option>
              <option value="Whatsapp Pay">Whatsapp Pay</option>
              <option value="Notify Payment">Notify Payment</option>
              <option value="Catalog">Catalog</option>
              <option value="Ai Catalog">Ai Catalog</option>
              <option value="Others">Others</option>
            </select>

            <select
              style={{ width: "200px" }}
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Complete">Complete</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          {/* Right Side - Export Button */}
          <div className="d-flex align-items-center  gap-3">
            <div className="d-md-none">
            <DateRangePicker
              onDateChange={handleDateChange}
              placeholder="Select date range"
            />
            </div>
            <button className="btn-primary d-flex align-items-center gap-2">
              <Icon
                style={{ fontSize: "20px" }}
                icon="typcn:download"
              />
              Export
            </button>
          </div>
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
            <div className="table-responsive scroll-sm">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Transaction ID</th>
                    <th scope="col">Order ID</th>
                    <th scope="col">Payment Type</th>
                    <th scope="col">Recipient</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method</th>
                    <th scope="col">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span>01</span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        order_RZfWWvScueYmXN
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ORDER-IE655Wl1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        CATALOG
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        918825668098
                      </h6>
                    </td>
                    <td>
                      <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success">
                        Complete
                      </span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ₹1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        UPI
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        30/10/25, 5:01 pm
                      </h6>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>01</span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        order_RZfWWvScueYmXN
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ORDER-IE655Wl1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        CATALOG
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        918825668098
                      </h6>
                    </td>
                    <td>
                      <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-danger">
                        Failed
                      </span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ₹1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        UPI
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        30/10/25, 5:01 pm
                      </h6>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>01</span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        order_RZfWWvScueYmXN
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ORDER-IE655Wl1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        CATALOG
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        918825668098
                      </h6>
                    </td>
                    <td>
                      <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-warning">
                        Pending
                      </span>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        ₹1
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        UPI
                      </h6>
                    </td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium flex-grow-1">
                        30/10/25, 5:01 pm
                      </h6>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transaction;
