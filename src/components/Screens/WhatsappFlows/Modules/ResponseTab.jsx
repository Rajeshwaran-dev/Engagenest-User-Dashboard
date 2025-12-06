import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ResponseTab = () => {
  // Sample data - replace with props or API data
  const responses = [
    {
      id: 1,
      name: "919786742563",
      mobileNumber: "reminder-send",
    },
    // Add more response items here
  ];

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const handleView = (response) => {
    console.log("View response:", response.id);
    setSelectedResponse(response);
    setIsModalOpen(true);
  };

  const handleEdit = (responseId) => {
    console.log("Edit response:", responseId);
    // Add your logic to edit the response
  };

  const handleDelete = (responseId) => {
    console.log("Delete response:", responseId);
    // Add your logic to delete the response
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResponse(null);
  };

  return (
    <>
      <div className="table-responsive scroll-sm">
        <div className="d-flex justify-content-end align-items-center mb-4 p-12 gap-4">
          {/* Right Side - Action Buttons */}
          <div className="d-flex align-items-center gap-3">
            <button className="btn-primary d-flex align-items-center gap-2">
              <Icon style={{ fontSize: "20px" }} icon="typcn:download" />
              Download Response
            </button>
          </div>
        </div>
        <table className="table bordered-table mb-0">
          <thead>
            <tr>
              <th>S.No.</th>
              <th scope="col">User Number</th>
              <th scope="col">Flow Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => (
              <tr key={response.id}>
                <td>
                  <span>{String(index + 1).padStart(2, "0 ")}</span>
                </td>
                <td>
                  <h6 className="text-md mb-0 fw-medium flex-grow-1">
                    {response.name}
                  </h6>
                </td>
                <td>
                  <h6 className="text-md mb-0 fw-medium flex-grow-1">
                    {response.mobileNumber}
                  </h6>
                </td>
                <td>
                  <div className="d-flex">
                    <button
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(response)}
                    >
                      <Icon icon="lucide:eye" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Response Details */}
      {isModalOpen && selectedResponse && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Response Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                >
                  <Icon
                    style={{ fontSize: "20px" }}
                    icon="material-symbols:close-rounded"
                  />
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3" style={{ color: "var(--text-secondary)" }}>
                  <strong>Flow Name:</strong> {selectedResponse.mobileNumber}
                </div>
                <div className="mb-3" style={{ color: "var(--text-secondary)" }}>
                  <strong >User:</strong> {selectedResponse.name}
                </div>

                <hr />

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Name</td>
                        <td>Vicky</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Service</td>
                        <td>Good</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Ratings</td>
                        <td>5 STAR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseTab;