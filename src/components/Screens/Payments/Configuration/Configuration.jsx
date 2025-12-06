import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import EmptyState from "../../EmptyTables/EmptyTables";
import PaymentConfigModal from "../Modules/PaymentConfigModal";

const Configuration = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete modal state
  const [payments, setPayments] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null); // Track which gateway to delete

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConfigure = (gateway) => {
    // Add your configuration logic here
    console.log(`Configuring ${gateway}`);
    closeModal();
  };

  // Open delete confirmation modal
  const openDeleteModal = (gatewayName) => {
    setSelectedGateway(gatewayName);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setSelectedGateway(null);
    setShowDeleteModal(false);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    console.log(`Deleting ${selectedGateway}`);
    // Add your delete logic here (e.g., API call to remove the gateway)
    closeDeleteModal();
  };

  return (
    <div className="card-body p-24">
      <div className="d-flex justify-content-end align-items-center mb-4 p-12">
        {/* Right Side - Export Button */}
        <div className="d-flex align-items-center  gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={openModal}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="fa6-solid:plus"
            />
            New Configuration
          </button>
        </div>
      </div>
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
              <Icon className="icon-adjustments" icon="ri:whatsapp-line" />
              Whatsapp Pay
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
              <Icon className="icon-adjustments" icon="ri:link" />
              Payment Link
            </button>
          </li>
        </ul>
      </div>

      {/* TRANSACTION CHILD TAB CONTENT */}
      <div className="tab-content" id="pills-tabContent-transaction-child">
        {/* Whatsapp Pay */}
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
                  <th scope="col">S.No</th>
                  <th scope="col">Name</th>
                  <th scope="col">Provider</th>
                  <th scope="col">Status</th>
                  <th scope="col">In Use</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>01</span>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      razorepay-097
                    </h6>
                  </td>
                  <td>
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      Razorpay
                    </h6>
                  </td>
                  <td>
                    <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success">Active</span>
                  </td>
                  <td>
                    <div className="form-switch switch-success d-flex align-items-center gap-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="horizontal3"
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={() => openDeleteModal("razorepay-097")} // Open delete modal
                    >
                      <Icon icon="mi:delete" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Link */}
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
                  <th scope="col">Provider</th>
                  <th scope="col">Key Id</th>
                  <th scope="col">Key Secret</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <td colSpan="6" className="text-center text-muted py-4">
                  <div style={{ textAlign: "center" }}>
                    <EmptyState />
                    <p className="empty-text">No Payment Link</p>
                  </div>
                </td>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Configuration Modal */}
      {showModal && (
        <PaymentConfigModal
          showModal={showModal}
          closeModal={closeModal}
          handleConfigure={handleConfigure}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Confirm Delete</h3>
                <button type="button" className="btn-close" onClick={closeDeleteModal}>
                  <Icon icon="material-symbols:close-rounded"/>
                </button>
              </div>
              <div className="modal-body">
                <p className="text-primary-2">Are you sure you want to delete <strong>{selectedGateway}</strong>? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;