import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import RenewModal from "../Modules/RenewModal";

const SubscriptionsModule = () => {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const handleRenewClick = () => {
    setShowRenewModal(true);
  };

  const handleActivateClick = () => {
    setShowActivateModal(true);
  };

  const handleCloseModal = () => {
    setShowRenewModal(false);
  };

  const handleCloseActivateModal = () => {
    setShowActivateModal(false);
  };

  const handleConfirmActivation = () => {
    // Add your activation logic here
    console.log("Plan activated");
    setShowActivateModal(false);
  };

  return (
    <>
      <div className="col-xxl-12 p-10">
        {/* Analytics Cards */}
        <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">Ecommerce Plan</h6>
            <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success">Active</span>
          </div>

          <div className="row h-100 g-0">
            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Started On
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      Jul 5, 2025
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      End Date
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      Jul 5, 2026
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Duration
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      12 months
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Price
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      ₹23,988
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 justify-content-end">
            <p>Next Billing on Jul 5, 2026</p>
            <button
              onClick={handleRenewClick}
              className="btn-primary d-flex align-items-center gap-2"
              style={{ marginTop: "-20px" }}
            >
              <Icon
                style={{ fontSize: "20px" }}
                icon="ic:baseline-autorenew"
              />
              Renew Plan
            </button>
          </div>
        </div>

        <h6 style={{ padding: "20px 0px" }}>Upcoming Plan</h6>

        <div className="card px-24 py-16 shadow-none radius-8 border h-100 bg-gradient-start">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">Standard Plan</h6>
            <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-warning">Scheduled</span>
          </div>

          <div className="row h-100 g-0">
            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Starts
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      Jul 5, 2026
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      End Date
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      Oct 3, 2026
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Duration
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      3 months
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-6 p-0 m-0 p-10">
              <div className="card-body p-24 h-100 d-flex flex-column justify-content-center border-top-1">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                  <div>
                    <span className="mb-1 fw-medium text-secondary-light text-md">
                      Price
                    </span>
                    <h6 className="fw-semibold text-primary-light mb-1">
                      ₹2,850
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 justify-content-end">
            <button
              onClick={handleActivateClick}
              className="btn-primary d-flex align-items-center gap-2"
              style={{ marginBottom: "10px" }}
            >
              <Icon
                style={{  fontSize: "20px" }}
                icon="ic:baseline-autorenew"
              />
              Active Now
            </button>
          </div>
        </div>
      </div>

      {showRenewModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            style={{ maxWidth: "1100px" }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <div>
                    <Icon
                      className="modal-icon-adjustments"
                      icon="material-symbols:autorenew"
                    />
                  </div>
                  <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                    Renew Your Plan
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                >
                  <Icon
                    style={{ fontSize: "20px" }}
                    icon="material-symbols:close-rounded"
                  />
                </button>
              </div>
              <div className="modal-body">
                <RenewModal />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCloseModal}
                >
                  Confirm Renewal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Confirmation Modal */}
      {showActivateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Are you sure you want to activate the next plan?</h3>
            </div>
            <div className="modal-body">
              <p className="text-primary-2">
                This will activate your upcoming plan and overwrite the current one.
              </p>
            </div>
            <div className="modal-footer">
              <div className="d-flex justify-content-end gap-3" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseActivateModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmActivation}
                >
                  Yes, Activate
                </button>
              </div>
            </div>
          </div>
        </div>

      )}

    </>
  );
};

export default SubscriptionsModule;