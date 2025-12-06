import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const HistoryModule = () => {
  return (
    <div className="card-body p-24">
      {/* TRANSACTION CHILD TAB CONTENT */}
      <div className="tab-content" id="pills-tabContent-transaction-child">
        {/* All Transaction Tab */}
        <div
          className="tab-pane fade show active"
          id="pills-all-transaction"
          role="tabpanel"
          aria-labelledby="pills-all-transaction-tab"
          tabIndex={0}
        >
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">Plan Name</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Plan</td>
                  <td>Jan 5, 2025</td>
                  <td>Jul 5, 2025</td>
                  <td>6 months</td>
                  <td>₹4,950</td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-danger">Expired</span>
                  </td>
                </tr>
                <tr>
                  <td>Enterprises Plan</td>
                  <td>Jan 5, 2025</td>
                  <td>Jul 5, 2025</td>
                  <td>12 months</td>
                  <td>₹15,588 </td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-warning">Upgraded</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Credited Tab */}
        <div
          className="tab-pane fade"
          id="pills-credited"
          role="tabpanel"
          aria-labelledby="pills-credited-tab"
          tabIndex={0}
        >
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Amount Paid</th>
                  <th scope="col">Date & Time</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Previous Balance</th>
                  <th scope="col">Current Balance</th>
                  <th scope="col">Status</th>
                  <th scope="col">Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>01</span>
                  </td>
                  <td>₹500.00</td>
                  <td>24/02/2025 & 11:00</td>
                  <td>Payment Received</td>
                  <td>₹800.00</td>
                  <td>₹1300.00</td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success">Credited</span>
                  </td>
                  <td>
                    <button className="btn-primary">
                      <Icon icon="mdi:download" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Tab */}
        <div
          className="tab-pane fade"
          id="pills-pending"
          role="tabpanel"
          aria-labelledby="pills-pending-tab"
          tabIndex={0}
        >
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Amount Paid</th>
                  <th scope="col">Date & Time</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Previous Balance</th>
                  <th scope="col">Current Balance</th>
                  <th scope="col">Status</th>
                  <th scope="col">Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>01</span>
                  </td>
                  <td>₹300.00</td>
                  <td>24/02/2025 & 09:00</td>
                  <td>Payment Processing</td>
                  <td>₹800.00</td>
                  <td>₹800.00</td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-warning">Pending</span>
                  </td>
                  <td>
                    <span className="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancelled Tab */}
        <div
          className="tab-pane fade"
          id="pills-cancelled"
          role="tabpanel"
          aria-labelledby="pills-cancelled-tab"
          tabIndex={0}
        >
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Amount Paid</th>
                  <th scope="col">Date & Time</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Previous Balance</th>
                  <th scope="col">Current Balance</th>
                  <th scope="col">Status</th>
                  <th scope="col">Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>01</span>
                  </td>
                  <td>₹200.00</td>
                  <td>23/02/2025 & 15:00</td>
                  <td>User Cancelled</td>
                  <td>₹800.00</td>
                  <td>₹800.00</td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-danger">Cancelled</span>
                  </td>
                  <td>
                    <span className="text-muted">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deducted Tab */}
        <div
          className="tab-pane fade"
          id="pills-deducted"
          role="tabpanel"
          aria-labelledby="pills-deducted-tab"
          tabIndex={0}
        >
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Amount Paid</th>
                  <th scope="col">Date & Time</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Previous Balance</th>
                  <th scope="col">Current Balance</th>
                  <th scope="col">Status</th>
                  <th scope="col">Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>01</span>
                  </td>
                  <td>₹0.20</td>
                  <td>24/02/2025 & 11:00</td>
                  <td>WhatsApp API Usage</td>
                  <td>₹500.00</td>
                  <td>₹499.80</td>
                  <td>
                    <span className="badge bg-info">Deducted</span>
                  </td>
                  <td>
                    <button className="btn-primary">
                      <Icon icon="mdi:download" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModule;
