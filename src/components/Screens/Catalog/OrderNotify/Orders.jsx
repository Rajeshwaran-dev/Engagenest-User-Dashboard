import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import DateRangePicker from "../../Calendar/DateRangePicker";
import "../../Catalog/Orders.css";
import Breadcrumb from "../../../Breadcrumb";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import { useSnackbar } from "notistack";
import OrderDetailsModal from "../Modules/OrderDetailsModal";
import OrderNotifyModal from "../Modules/OrderNotifyModal";

const Orders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample order data - replace with your actual data
  const ordersData = [
    {
      id: 1,
      orderDate: "30-10-2025 05:00 PM",
      customerName: "DJ",
      userNumber: "919894772827",
      totalPrice: 1.00,
      orderId: "ORDER-IE655W11",
      discount: "-",
      amountPaid: "-",
      itemCount: 1,
      paymentStatus: "Paid"
    }
    // Add more orders as needed
  ];

  // Handle row click to show order details
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Close order details modal
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Customers Orders" />
        <div className="d-flex justify-content-between align-items-center mb-4 p-12">
          {/* Left Side - Search and Filters */}
          <div className="d-flex align-items-center gap-3">
            {/* Status Filter Dropdown */}
            <div className="d-flex align-items-center gap-2 d-md-non">
              <select
                className="form-select form-select-sm"
                style={{ width: "120px" }}
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <button
              className="btn-primary d-flex align-items-center gap-2"
              onClick={() => setShowModal(true)}
            >
              <Icon
                style={{ fontSize: "20px" }}
                icon="mingcute:group-fill"
              />
              Order Notify
            </button>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="d-flex align-items-center gap-3 d-md-none">
            <DateRangePicker />
            <button className="btn-primary d-flex align-items-center gap-2">
              <Icon
                style={{ fontSize: "20px" }}
                icon="typcn:download"
              />
              Export
            </button>
          </div>
        </div>
        <div className="row gy-4">
          {/* UnitCountTwo Section - 8 columns */}
          <div className="col-xxl-12" style={{ marginTop: "30px" }}>
            <div className="row gy-4">
              {/* Marketing */}
              <div className="col-xxl-3 col-md-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                  <div className="card-body p-0">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                      <div className="d-flex align-items-center">
                        <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                          <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                            <Icon
                              icon="streamline-cyber:cash-hand-4"
                              className="icon"
                            />
                          </span>
                        </div>
                        <div>
                          <span className="mb-2 fw-medium text-secondary-light text-md">
                            Total Revenue
                          </span>
                          <h6 className="fw-semibold my-1">₹ 172</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="col-xxl-3 col-md-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                  <div className="card-body p-0">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                      <div className="d-flex align-items-center">
                        <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                          <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                            <Icon
                              icon="solar:wallet-bold"
                              className="text-white text-2xl mb-0"
                            />
                          </span>
                        </div>
                        <div>
                          <span className="mb-2 fw-medium text-secondary-light text-md">
                            Orders Paid
                          </span>
                          <h6 className="fw-semibold my-1">4</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utility */}
              <div className="col-xxl-3 col-md-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                  <div className="card-body p-0">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                      <div className="d-flex align-items-center">
                        <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                          <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                            <Icon
                              icon="mdi:account-pending-outline"
                              className="text-white text-2xl mb-0"
                            />
                          </span>
                        </div>
                        <div>
                          <span className="mb-2 fw-medium text-secondary-light text-md">
                            Orders Pending
                          </span>
                          <h6 className="fw-semibold my-1">46</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User initiated */}
              <div className="col-xxl-3 col-md-3 col-sm-6">
                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                  <div className="card-body p-0">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                      <div className="d-flex align-items-center">
                        <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                          <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                            <Icon
                              icon="icon-park-outline:folder-failed"
                              className="icon"
                            />
                          </span>
                        </div>
                        <div>
                          <span className="mb-2 fw-medium text-secondary-light text-md">
                            User Failed
                          </span>
                          <h6 className="fw-semibold my-1">0</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card basic-data-table">
            <div className="card-body" style={{ padding: "10px 0px" }}>
              <div className="table-responsive">
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">S.No.</th>
                      <th scope="col">Order Date</th>
                      <th scope="col">Customer Name</th>
                      <th scope="col">User Number</th>
                      <th scope="col">Total Price</th>
                      <th scope="col">Order Id</th>
                      <th scope="col">Discount</th>
                      <th scope="col">Amount Paid</th>
                      <th scope="col">Item Count</th>
                      <th scope="col">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.map((order, index) => (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order)}
                        style={{ cursor: 'pointer' }}
                        className="table-row-hover"
                      >
                        <td>{index + 1}</td>
                        <td>{order.orderDate}</td>
                        <td>{order.customerName}</td>
                        <td>{order.userNumber}</td>
                        <td>₹ {order.totalPrice.toFixed(2)}</td>
                        <td>{order.orderId}</td>
                        <td>{order.discount}</td>
                        <td>{order.amountPaid}</td>
                        <td>{order.itemCount}</td>
                        <td>
                          <span className={`badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success ${order.paymentStatus.toLowerCase()}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </MasterLayout>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={handleCloseOrderDetails}
        orderData={selectedOrder}
      />

      {/* Order Notify Modal */}
      <OrderNotifyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default Orders;