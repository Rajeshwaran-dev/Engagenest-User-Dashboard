import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";

const Unsubscribe = () => {
  const [showModal, setShowModal] = useState(false);

  const handleUnblockClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmUnblock = () => {
    setShowModal(false);
  };

  return (
    <>
      <Breadcrumb title="Unsubscribed Users" />
      <div className="col-xxl-12">
        <div className="card h-100">
          <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
            <ul
              className="nav bordered-tab nav-pills mb-0"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active new-flex"
                  id="pills-to-do-list-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-to-do-list"
                  type="button"
                  role="tab"
                  aria-controls="pills-to-do-list"
                  aria-selected="true"
                >
                  <Icon style={{ fontSize: "22px" }}
                    className="icon-adjustments"
                    icon="material-symbols:unsubscribe-outline"
                  />
                  Unsubscribed
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link new-flex"
                  id="pills-recent-leads-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-recent-leads"
                  type="button"
                  role="tab"
                  aria-controls="pills-recent-leads"
                  aria-selected="false"
                  tabIndex={-1}
                >
                  <Icon className="icon-adjustments" style={{ fontSize: "20px" }} icon="icomoon-free:blocked" />
                  Blocked
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-24">
            <div className="tab-content" id="pills-tabContent">
              {/* ---------- Unsubscribed Tab ---------- */}
              <div
                className="tab-pane fade show active"
                id="pills-to-do-list"
                role="tabpanel"
                aria-labelledby="pills-to-do-list-tab"
                tabIndex={0}
              >
                <div className="table-responsive scroll-sm">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">S.No.</th>
                        <th scope="col">Name</th>
                        <th scope="col">Mobile Number</th>
                        <th scope="col">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          01
                        </td>
                        <td>
                          Rajesh
                        </td>
                        <td>
                          9894772827
                        </td>
                        <td>
                          24/02/2025 & 11:00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---------- Blocked Tab ---------- */}
              <div
                className="tab-pane fade"
                id="pills-recent-leads"
                role="tabpanel"
                aria-labelledby="pills-recent-leads-tab"
                tabIndex={0}
              >
                <div className="d-flex align-items-center gap-3 justify-content-end">
                  <button style={{ marginBottom: "20px" }}
                    className="btn-primary d-flex align-items-center gap-2"
                    onClick={() => document.getElementById("fileUpload").click()}
                  >
                    <Icon
                      style={{ fontSize: "20px" }}
                      icon="tdesign:upload"
                    />
                    Upload
                  </button>

                  <input
                    type="file"
                    id="fileUpload"
                    style={{ display: "none" }}
                    accept=".json,.csv,.txt"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log("Selected file:", file.name);
                        // handle file upload logic here
                      }
                    }}
                  />
                </div>

                <div className="table-responsive scroll-sm">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Mobile Number</th>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          01
                        </td>
                        <td>
                          Vignesh
                        </td>
                        <td>
                          9874563210
                        </td>
                        <td>
                          24/02/2025 & 11:00
                        </td>
                        <td>
                          <div className="d-flex">
                            <button

                              className="btn-primary"
                              onClick={handleUnblockClick}
                            >
                              Unblock
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Unblock</h3>
              <button type="button" className="close-btn" onClick={handleCloseModal}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <div className="modal-body">
              <h6 className="text-primary-2">Are you sure you want to unblock this user?</h6>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>
                No
              </button>
              <button className="btn-primary" onClick={handleConfirmUnblock}>
                Yes, Unblock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Unsubscribe;
