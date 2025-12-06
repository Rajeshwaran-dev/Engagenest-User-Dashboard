import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSnackbar } from "notistack"; // ✅ import notistack
import FlowDetailsModal from "./FlowDetailsModal";

const FlowsTab = () => {
  const { enqueueSnackbar } = useSnackbar(); // ✅ snackbar hook

  const [flows, setFlows] = useState([
    {
      id: 1,
      flowName: "New Client",
      flowId: "#9894772827",
      status: "Published",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showFlowDetailsModal, setShowFlowDetailsModal] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation check
    if (!formData.name.trim() || !formData.role.trim()) {
      enqueueSnackbar("Please fill in all required fields.", {
        variant: "error",
        autoHideDuration: 2500,
      });
      return;
    }

    // ✅ Success message
    enqueueSnackbar("Flow created successfully!", {
      variant: "success",
      autoHideDuration: 2500,
    });

    console.log("Form Data Submitted:", formData);

    // Reset form
    setFormData({ name: "", role: "" });
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({ name: "", role: "" });
  };

  const handleRowClick = (flow) => {
    setSelectedFlow(flow);
    setShowFlowDetailsModal(true);
  };

  const handleCloseFlowDetails = () => {
    setShowFlowDetailsModal(false);
    setSelectedFlow(null);
  };

  // ✅ New functions for action buttons
  const handleCopyFlow = (flowId, e) => {
    e.stopPropagation();

    // Create a copy of the flow with "Draft" status
    const flowToCopy = flows.find(flow => flow.id === flowId);
    if (flowToCopy) {
      const newFlow = {
        ...flowToCopy,
        id: flows.length + 1,
        flowId: `#${Math.floor(Math.random() * 10000000000)}`,
        status: "Draft"
      };

      setFlows(prev => [...prev, newFlow]);

      enqueueSnackbar("Flow copied successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
    }
  };

  const handlePublishFlow = (flowId, e) => {
    e.stopPropagation();

    setFlows(prev =>
      prev.map(flow =>
        flow.id === flowId ? { ...flow, status: "Published" } : flow
      )
    );

    enqueueSnackbar("Flow published successfully!", {
      variant: "success",
      autoHideDuration: 2500,
    });
  };

  const handleDeprecateFlow = (flowId, e) => {
    e.stopPropagation();

    setFlows(prev =>
      prev.map(flow =>
        flow.id === flowId ? { ...flow, status: "Deprecated" } : flow
      )
    );

    enqueueSnackbar("Flow deprecated successfully!", {
      variant: "warning",
      autoHideDuration: 2500,
    });
  };

  return (
    <div className="table-responsive scroll-sm">
      <div className="d-flex justify-content-end align-items-center mb-4 p-12 gap-4">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-sm ps-5"
              placeholder="Search here"
            />
            <Icon
              icon="eva:search-fill"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
            Create Flow
          </button>
        </div>
      </div>

      <table className="table bordered-table mb-0">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Flow Name</th>
            <th>Flow ID</th>
            <th>Status</th>
            <th>Responses</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flows.map((flow, index) => (
            <tr
              key={flow.id}
              style={{ cursor: "pointer" }}
              onClick={() => handleRowClick(flow)}
            >
              <td>{String(index + 1).padStart(2, "0")}</td>
              <td>
                <h6 className="text-md mb-0 fw-medium flex-grow-1">
                  {flow.flowName}
                </h6>
              </td>
              <td>
                <h6 className="text-md mb-0 fw-medium flex-grow-1">
                  {flow.flowId}
                </h6>
              </td>
              <td>
                <span className={`badge text-sm fw-semibold px-20 py-9 radius-4 text-white ${
                  flow.status === "Published" ? "bg-success" :
                  flow.status === "Draft" ? "bg-warning" :
                  "bg-danger"
                }`}>
                  {flow.status}
                </span>
              </td>
              <td>
                <h6 className="text-md mb-0 fw-medium flex-grow-1"
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Show Responses
                </h6>
              </td>
              <td>
                <div className="d-flex">
                  {/* Copy Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="copy-tooltip">Copy</Tooltip>}
                  >
                    <button
                      to=""
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={(e) => handleCopyFlow(flow.id, e)}
                    >
                      <Icon icon="mingcute:copy-line" />
                    </button>
                  </OverlayTrigger>

                  {/* Publish Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="publish-tooltip">Publish</Tooltip>}
                  >
                    <button
                      to=""
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={(e) => handlePublishFlow(flow.id, e)}
                    >
                      <Icon icon="mingcute:send-plane-line" />
                    </button>
                  </OverlayTrigger>

                  {/* Deprecate Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="deprecate-tooltip">Deprecate</Tooltip>}
                  >
                    <button
                      to=""
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={(e) => handleDeprecateFlow(flow.id, e)}
                    >
                      <Icon icon="ic:baseline-block" />
                    </button>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "600px" }}>
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <Icon
                  className="modal-icon-adjustments"
                  icon="clarity:flow-chart-line"
                />
                <h3 className="ms-2">Create New Flow</h3>
              </div>
              <button type="button" className="btn-close" onClick={handleCancel}>
                <Icon icon="mingcute:close-line" />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Categories
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Sign up">Sign up</option>
                    <option value="Sign in">Sign in</option>
                    <option value="Appointment Booking">Appointment Booking</option>
                    <option value="Appointment Booking">Lead Generation</option>
                    <option value="Contact Us">Contact Us</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Survey">Survey</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="modal-footer gap-3">
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <FlowDetailsModal
        flow={selectedFlow}
        isOpen={showFlowDetailsModal}
        onClose={handleCloseFlowDetails}
      />
    </div>
  );
};

export default FlowsTab;