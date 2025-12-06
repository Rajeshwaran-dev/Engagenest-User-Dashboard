import React, { useState, useEffect } from "react";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import "../Integration/Flow.css";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react/dist/iconify.js";

const FailoverTrigger = () => {
  const [formData, setFormData] = useState({
    api: "",
    bearerToken: "",
    apiKey: "",
    tenantId: "",
    selectedTemplate: "ALL",
    endpointToken: "",
    authToken: "",
    generatedToken: ""
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Sample responses data for the report table
  const [responses] = useState([
  ]);

  // Sample template names - replace with your actual templates
  const templateNames = [
    "ALL",
    "User Registration",
    "Password Reset",
    "Order Confirmation",
    "Shipping Notification",
    "Payment Receipt",
    "Welcome Email",
    "Newsletter",
    "Account Verification",
    "Promotional Offer"
  ];

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const { api, bearerToken, apiKey, tenantId } = formData;
    const isValid = api.trim() !== "" && bearerToken.trim() !== "" &&
      apiKey.trim() !== "" &&
      tenantId.trim() !== "";
    setFormValid(isValid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConnect = (e) => {
    e.preventDefault();

    if (!formValid) {
      enqueueSnackbar("Please fill all required fields!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsConnecting(true);

    // Simulate API connection
    setTimeout(() => {
      console.log("API Configuration:", formData);

      enqueueSnackbar("API connected successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      api: "",
      bearerToken: "",
      apiKey: "",
      tenantId: "",
      selectedTemplate: "ALL",
      endpointToken: "",
      authToken: "",
      generatedToken: ""
    });
    setFormValid(false);
    setIsConnecting(false);
    setIsGenerating(false);
    setIsConnected(false);
  };

  const copyToClipboard = (fieldName) => {
    const value = formData[fieldName];

    if (!value || value.trim() === "") {
      enqueueSnackbar(`No ${fieldName} to copy!`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    navigator.clipboard.writeText(value)
      .then(() => {
        enqueueSnackbar(`${fieldName} copied to clipboard!`, {
          variant: "success",
          autoHideDuration: 2000,
        });
      })
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        enqueueSnackbar(`${fieldName} copied to clipboard!`, {
          variant: "success",
          autoHideDuration: 2000,
        });
      });
  };

  const generateToken = () => {
    const { endpointToken, authToken } = formData;

    if (endpointToken.trim() === "" || authToken.trim() === "") {
      enqueueSnackbar("Please fill both Endpoint Token and Authentication Token first!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsGenerating(true);

    enqueueSnackbar("Generating token...", {
      variant: "info",
      autoHideDuration: 2000,
    });

    setTimeout(() => {
      const generated = btoa(`${endpointToken}:${authToken}`);
      setFormData(prev => ({
        ...prev,
        generatedToken: generated
      }));

      setIsGenerating(false);
      setIsConnected(true);

      enqueueSnackbar("Token generated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    }, 2000);
  };

  const handleView = (response) => {
    console.log("View response:", response);
    enqueueSnackbar(`Viewing details for ${response.name}`, {
      variant: "info",
      autoHideDuration: 2000,
    });
  };

  const handleDownloadResponse = () => {
    enqueueSnackbar("Downloading response data...", {
      variant: "info",
      autoHideDuration: 2000,
    });
    // Add your download logic here
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Failover Trigger" />
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
                  <Icon
                    className="icon-adjustments"
                    icon="carbon:flow"
                  />
                  Configuration
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
                  <Icon
                    className="icon-adjustments"
                    icon="ri:question-answer-line"
                  />
                  Report
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-24">
            <div className="tab-content" id="pills-tabContent">
              {/* Configuration Tab */}
              <div
                className="tab-pane fade show active"
                id="pills-to-do-list"
                role="tabpanel"
                aria-labelledby="pills-to-do-list-tab"
                tabIndex={0}
              >
                <div className="configuration-container">
                  <div className="container-fluid">

                    <div className="row justify-content-start">
                      <div className="col-12 col-md-8 col-lg-6">
                        <div className="card configuration-card">
                          <div className="card-body p-4">
                            <form onSubmit={handleConnect}>
                              {/* API Field */}
                              <div className="mb-4">
                                <label
                                  className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  API *

                                  {/* Tooltip Icon */}
                                  <div className="custom-tooltip-container">
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      Enter the API authentication. Keep this secure.
                                    </span>
                                  </div>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="password"
                                    className="form-control configuration-input"
                                    id="api"
                                    name="api"
                                    placeholder="Enter API"
                                    value={formData.api}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="btn-secondary new-border"
                                    onClick={() => copyToClipboard('api')}
                                    disabled={!formData.api}
                                  >
                                    <Icon style={{ fontSize: "18px" }} icon="akar-icons:copy" />
                                  </button>
                                </div>
                              </div>

                              {/* Bearer Token Field */}
                              <div className="mb-4">
                                <label
                                  className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  Bearer Token *
                                  {/* Tooltip Icon */}
                                  <div className="custom-tooltip-container">
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      Enter the bearer token for API authentication. Keep this secure.
                                    </span>
                                  </div>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="password"
                                    className="form-control configuration-input"
                                    id="bearerToken"
                                    name="bearerToken"
                                    placeholder="Enter your bearer token"
                                    value={formData.bearerToken}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="btn-secondary new-border"
                                    onClick={() => copyToClipboard('bearerToken')}
                                    disabled={!formData.bearerToken}
                                  >
                                    <Icon style={{ fontSize: "18px" }} icon="akar-icons:copy" />
                                  </button>
                                </div>
                              </div>

                              {/* API Key Field */}
                              <div className="mb-4">
                                <label
                                  className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  API Key *
                                  {/* Tooltip Icon */}
                                  <div className="custom-tooltip-container">
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      Your unique API key for accessing the service endpoints.
                                    </span>
                                  </div>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="password"
                                    className="form-control configuration-input"
                                    id="apiKey"
                                    name="apiKey"
                                    placeholder="Enter your API key"
                                    value={formData.apiKey}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="btn-secondary new-border"
                                    onClick={() => copyToClipboard('apiKey')}
                                    disabled={!formData.apiKey}
                                  >
                                    <Icon style={{ fontSize: "18px" }} icon="akar-icons:copy" />
                                  </button>
                                </div>
                              </div>

                              {/* Tenant ID Field */}
                              <div className="mb-4">
                                <label
                                  className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  Tenant ID *
                                  {/* Tooltip Icon */}
                                  <div className="custom-tooltip-container">
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      The unique identifier for your tenant/organization.
                                    </span>
                                  </div>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control configuration-input"
                                    id="tenantId"
                                    name="tenantId"
                                    placeholder="Enter your tenant ID"
                                    value={formData.tenantId}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="btn-secondary new-border"
                                    onClick={() => copyToClipboard('tenantId')}
                                    disabled={!formData.tenantId}
                                  >
                                    <Icon style={{ fontSize: "18px" }} icon="akar-icons:copy" />
                                  </button>
                                </div>
                              </div>

                              {/* Template Selection Field */}
                              <div className="mb-4">
                                <label
                                  className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  Template Selection

                                  {/* Tooltip Icon */}
                                  <div className="custom-tooltip-container">
                                    <Icon
                                      icon="mdi:information-outline"
                                      style={{
                                        fontSize: "18px",
                                        color: "#6c757d",
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span className="custom-tooltip-text">
                                      Select a specific template or "ALL" to apply to all templates.
                                    </span>
                                  </div>
                                </label>
                                <select
                                  className="form-select configuration-input"
                                  id="selectedTemplate"
                                  name="selectedTemplate"
                                  value={formData.selectedTemplate}
                                  onChange={handleInputChange}
                                >
                                  {templateNames.map((template) => (
                                    <option key={template} value={template}>
                                      {template}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ marginTop: "20px" }} className="d-flex gap-3 flex-wrap justify-content-end">
                                <button
                                  type="button"
                                  className="btn-secondary text-center"
                                  onClick={resetForm}
                                  disabled={isConnecting}
                                >
                                  <i className="fas fa-redo me-2"></i>
                                  Reset Form
                                </button>
                                <button
                                  type="submit"
                                  className="btn-primary text-center"
                                  disabled={isConnecting || !formValid}
                                >
                                  <i className="fas fa-plug me-2"></i>
                                  {isConnecting ? "Connecting..." : "Connect API"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Tab */}
              <div
                className="tab-pane fade"
                id="pills-recent-leads"
                role="tabpanel"
                aria-labelledby="pills-recent-leads-tab"
                tabIndex={0}
              >
                <div className="table-responsive scroll-sm">

                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th scope="col">Api</th>
                        <th scope="col">Bearer Token</th>
                        <th scope="col">Api Key</th>
                        <th scope="col">Tenant Id</th>
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
                            <h6 className="text-md mb-0 fw-medium flex-grow-1">
                              {response.flowName}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default FailoverTrigger;