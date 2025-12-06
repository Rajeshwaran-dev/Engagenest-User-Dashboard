import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import "../Orders.css"

const OrderDetailsModal = ({ isOpen, onClose, orderData }) => {
    if (!isOpen || !orderData) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="order-details-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="d-flex align-items-center">
                        <div>
                            <Icon
                                className="icon-adjustments"
                                icon="mdi:file-document-outline"
                            />
                        </div>
                        <h3 className="modal-title">
                            Order Details
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <Icon icon="material-symbols:close-rounded" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body-custom">
                    {/* Payment Status */}
                    <div className="status-section text-center">
                        <h6 className="status-title">Payment Status : <span className="status-pending bg-success">Paid</span></h6>
                    </div>

                    <div className="col-xxl-12" style={{ marginTop: "30px" }}>
                        <div className="row gy-4">
                            {/* Marketing */}
                            <div className="col-xxl-3 col-md-3 col-sm-6">
                                <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
                                    <div className="card-body p-0">
                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                                        User Number
                                                    </span>
                                                    <h6 className="fw-semibold my-1">919495204766</h6>
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
                                                <div>
                                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                                        Order Value
                                                    </span>
                                                    <h6 className="fw-semibold my-1">₹100</h6>
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
                                                <div>
                                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                                        Shipping Price
                                                    </span>
                                                    <h6 className="fw-semibold my-1">₹10</h6>
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
                                                <div>
                                                    <span className="mb-2 fw-medium text-secondary-light text-md">
                                                        Total Price
                                                    </span>
                                                    <h6 className="fw-semibold my-1">₹110</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Product Details */}
                    <div className="product-section">
                        <h6 className="section-title">Flow Responses</h6>
                        <div className="table-responsive">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Product Image</th>
                                        <th>Quantity</th>
                                        <th>Product Name</th>
                                        <th>Description</th>
                                        <th>Retailer Id</th>
                                        <th>Brand</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>
                                            <div className="product-image">
                                                <img className="w-64-px h-64-px" src="assets/images/logo.png" />
                                            </div>
                                        </td>
                                        <td>1</td>
                                        <td>test</td>
                                        <td>test</td>
                                        <td>123456</td>
                                        <td>-</td>
                                        <td>₹100.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-section text-end" style={{ marginTop: "10px" }}>
                        <button className="btn-secondary">
                            Cancel
                        </button>
                        <button className="btn-primary" style={{ marginLeft: "10px" }}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;