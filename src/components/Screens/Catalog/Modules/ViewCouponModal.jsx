import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const ViewCouponModal = ({ coupon, onClose }) => {

  // Helper function to get discount type label
  const getDiscountTypeLabel = (type) => {
    switch (type) {
      case "fixed_cart": return "Fixed cart discount";
      case "percentage": return "Percentage discount";
      case "fixed_product": return "Fixed product discount";
      default: return type;
    }
  };

  // Helper function to check if coupon is expired
  const isCouponExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ width: "800px" }}>
          <div className="modal-header">
            <h3 className="modal-title">Coupon Details</h3>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            >
              <Icon icon="material-symbols:close-rounded" />
            </button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <h6 className="mb-2 text-primary-2">{coupon.code}</h6>
              {isCouponExpired(coupon.expiryDate) && (
                <div className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-danger mb-2">EXPIRED</div>
              )}
              <h5 className="mb-1 text-primary-2" style={{ marginTop: "20px" }}>Discount Value</h5>
              <h6 className="text-primary-2">{coupon.discountValue}%</h6>
              <div className="badge bg-info mb-2">{getDiscountTypeLabel(coupon.discountType)}</div>
            </div>

            <hr />

            <h6 className="mb-3 text-primary-2">Coupon Details</h6>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Description</div>
              <div className="col-6 text-primary-2">{coupon.description || "No description provided"}</div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Expiry Date</div>
              <div className="col-6 text-primary-2">
                {coupon.expiryDate}
                {isCouponExpired(coupon.expiryDate) && (
                  <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-danger" style={{ marginLeft: "10px" }} >Expired</span>
                )}
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Minimum Spend</div>
              <div className="col-6 text-primary-2">₹{coupon.minimumSpend}</div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Maximum Spend</div>
              <div className="col-6 text-primary-2">₹{coupon.maximumSpend}</div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Usage Limit Per Coupon</div>
              <div className="col-6 text-primary-2">{coupon.usageLimit} times</div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Usage Limit Per User</div>
              <div className="col-6 text-primary-2">{coupon.usageLimitPerUser} times per user</div>
            </div>
            <div className="row mb-2">
              <div className="col-6 fw-semibold text-primary-2">Associated Products</div>
              <div className="col-6 text-primary-2">Applicable to all products</div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button type="button" className="btn-primary">Print</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCouponModal; 