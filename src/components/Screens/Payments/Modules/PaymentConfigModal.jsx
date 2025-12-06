import React from "react";
import "../Payments.css";
import { Icon } from "@iconify/react/dist/iconify.js";

const PaymentConfigModal = ({ showModal, closeModal, handleConfigure }) => {
  return (
    <>
      <div
        className={`modal-backdrop ${showModal ? "show" : ""}`}
        onClick={closeModal}
      ></div>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content payment-modal">
            <div className="modal-header border-0">
              <div>
                <div className="d-flex align-items-center">
                  <div>
                    <Icon
                      className="modal-icon-adjustments"
                      icon="fluent-mdl2:payment-card"
                    />
                  </div>
                  <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                    Payment Gateways
                  </h3>
                </div>
                <p className="modal-subtitle">
                  You can set up multiple payment configurations
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="gateway-card">
                    <div className="gateway-logo razorpay-logo">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <path d="M8 32L18 8L24 20L14 32H8Z" fill="#0C4B8C" />
                        <path d="M24 20L28 12L32 20H24Z" fill="#1A7DC4" />
                      </svg>
                    </div>
                    <h6 className="gateway-name">Razorpay</h6>
                    <button
                      className="btn-configure"
                      onClick={() => handleConfigure("Razorpay")}
                    >
                      Configure
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="gateway-card">
                    <div className="gateway-logo payu-logo">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <rect width="40" height="40" rx="4" fill="#0B4D3B" />
                        <path
                          d="M15 12V20C15 22 16 24 18 24H22C24 24 25 22 25 20V12H22V20C22 21 21 21 21 21H19C18 21 18 20 18 20V12H15Z"
                          fill="white"
                        />
                        <path d="M15 26H25V28H15V26Z" fill="#1AC79D" />
                      </svg>
                    </div>
                    <h6 className="gateway-name">Payu</h6>
                    <button
                      className="btn-configure"
                      onClick={() => handleConfigure("Payu")}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentConfigModal;