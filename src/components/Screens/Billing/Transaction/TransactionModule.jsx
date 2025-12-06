import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { useGetWalletTransactionsQuery } from "../../../../store/ApiFilesV2/PaymentsApis";

const TransactionModule = () => {
  const [expandedRows, setExpandedRows] = useState({});
  const { data: transactionsData, isLoading } = useGetWalletTransactionsQuery();

  const toggleRow = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN') + " & " + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'credited':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
      case 'cancelled':
        return 'bg-danger';
      case 'deducted':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const categorizeTransactions = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        all: [],
        credited: [],
        pending: [],
        cancelled: [],
        deducted: []
      };
    }

    return {
      all: transactions,
      credited: transactions.filter(t => t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'success'),
      pending: transactions.filter(t => t.status?.toLowerCase() === 'pending'),
      cancelled: transactions.filter(t => t.status?.toLowerCase() === 'cancelled' || t.status?.toLowerCase() === 'failed'),
      deducted: transactions.filter(t => t.type?.toLowerCase() === 'debit' || t.amount < 0)
    };
  };

  const transactionCategories = categorizeTransactions(transactionsData);

  const renderTransactionTable = (transactions, tabName) => {
    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">No {tabName} transactions found.</p>
        </div>
      );
    }

    return (
      <div className="table-responsive scroll-sm">
        <table className="table bordered-table mb-0">
          <thead>
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Transaction ID</th>
              <th scope="col">Amount</th>
              <th scope="col">Date & Time</th>
              <th scope="col">Description</th>
              <th scope="col">Previous Balance</th>
              <th scope="col">Current Balance</th>
              <th scope="col">Status</th>
              <th scope="col">Invoice</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <React.Fragment key={`${tabName}-${transaction._id || transaction.id || index}`}>
                <tr>
                  <td>
                    <span>{index + 1}</span>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      {transaction.transactionId || transaction._id?.slice(-8) || "N/A"}
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      ₹{Math.abs(transaction.amount || 0).toFixed(2)}
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      {formatDate(transaction.createdAt || transaction.date)}
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      {transaction.description || transaction.reason || "N/A"}
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      ₹{(transaction.previousBalance || 0).toFixed(2)}
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      ₹{(transaction.currentBalance || 0).toFixed(2)}
                    </h6>
                  </td>
                  <td>
                    <span className={`badge text-sm fw-semibold px-20 py-9 radius-4 text-white ${getStatusClass(transaction.status)}`}>
                      {transaction.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    {transaction.invoiceUrl ? (
                      <a 
                        href={transaction.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                        title="Download Invoice"
                      >
                        <Icon icon="akar-icons:download" />
                      </a>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                        onClick={() => toggleRow(`${tabName}-${transaction._id || transaction.id || index}`)}
                        title="View Details"
                      >
                        <Icon
                          icon={expandedRows[`${tabName}-${transaction._id || transaction.id || index}`] ? "mdi:chevron-up" : "mdi:chevron-down"}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows[`${tabName}-${transaction._id || transaction.id || index}`] && (
                  <tr>
                    <td colSpan="10" className="bg-light">
                      <div className="p-3">
                        <div className="row">
                          <div className="col-md-3">
                            <strong>Transaction ID:</strong>
                            <br />
                            {transaction.transactionId || transaction._id || "N/A"}
                          </div>
                          <div className="col-md-3">
                            <strong>Payment Method:</strong>
                            <br />
                            {transaction.paymentMethod || "Wallet"}
                          </div>
                          <div className="col-md-3">
                            <strong>Payment Gateway:</strong>
                            <br />
                            {transaction.paymentGateway || "N/A"}
                          </div>
                          <div className="col-md-3">
                            <strong>Transaction Type:</strong>
                            <br />
                            {transaction.type || (transaction.amount >= 0 ? "Credit" : "Debit")}
                          </div>
                        </div>
                        {transaction.notes && (
                          <div className="row mt-3">
                            <div className="col-12">
                              <strong>Notes:</strong>
                              <br />
                              {transaction.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card-body p-24">
      <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
        <ul
          className="nav bordered-tab nav-pills mb-0"
          id="pills-tab-transaction-child"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active new-flex"
              id="pills-all-transaction-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-all-transaction"
              type="button"
              role="tab"
              aria-controls="pills-all-transaction"
              aria-selected="true"
            >
              <Icon
                className="icon-adjustments"
                icon="grommet-icons:transaction"
              />
              All Transaction
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link new-flex"
              id="pills-credited-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-credited"
              type="button"
              role="tab"
              aria-controls="pills-credited"
              aria-selected="false"
              tabIndex={-1}
            >
              <Icon className="icon-adjustments" icon="streamline-ultimate:credit-card-1" />
              Credited
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link new-flex"
              id="pills-pending-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-pending"
              type="button"
              role="tab"
              aria-controls="pills-pending"
              aria-selected="false"
              tabIndex={-1}
            >
              <Icon className="icon-adjustments" icon="mdi:account-pending-outline" />
              Pending
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link new-flex"
              id="pills-cancelled-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-cancelled"
              type="button"
              role="tab"
              aria-controls="pills-cancelled"
              aria-selected="false"
              tabIndex={-1}
            >
              <Icon className="icon-adjustments" icon="mdi:cancel-octagon-outline" />
              Cancelled
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link new-flex"
              id="pills-deducted-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-deducted"
              type="button"
              role="tab"
              aria-controls="pills-deducted"
              aria-selected="false"
              tabIndex={-1}
            >
              <Icon className="icon-adjustments" icon="fluent:wallet-credit-card-32-regular" />
              Deducted
            </button>
          </li>
        </ul>
      </div>

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
          {renderTransactionTable(transactionCategories.all, "all")}
        </div>

        {/* Credited Tab */}
        <div
          className="tab-pane fade"
          id="pills-credited"
          role="tabpanel"
          aria-labelledby="pills-credited-tab"
          tabIndex={0}
        >
          {renderTransactionTable(transactionCategories.credited, "credited")}
        </div>

        {/* Pending Tab */}
        <div
          className="tab-pane fade"
          id="pills-pending"
          role="tabpanel"
          aria-labelledby="pills-pending-tab"
          tabIndex={0}
        >
          {renderTransactionTable(transactionCategories.pending, "pending")}
        </div>

        {/* Cancelled Tab */}
        <div
          className="tab-pane fade"
          id="pills-cancelled"
          role="tabpanel"
          aria-labelledby="pills-cancelled-tab"
          tabIndex={0}
        >
          {renderTransactionTable(transactionCategories.cancelled, "cancelled")}
        </div>

        {/* Deducted Tab */}
        <div
          className="tab-pane fade"
          id="pills-deducted"
          role="tabpanel"
          aria-labelledby="pills-deducted-tab"
          tabIndex={0}
        >
          {renderTransactionTable(transactionCategories.deducted, "deducted")}
        </div>
      </div>
    </div>
  );
};

export default TransactionModule;