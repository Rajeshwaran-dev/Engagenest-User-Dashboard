import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import WebhookMessage from "./WebhookMessage";
import WebhookReport from "./WebhookReport";
import {
  useGenerateApiKeysMutation,
  useGetApieysQuery,
  useLazyGetSampleWebhookQuery,
  useLazyGetSampleReportWebhookQuery,
  useSaveApiConfigMutation,
  useGetSaveApiConfigQuery,
  useGetSaveReportConfigQuery,
  useSaveReportConfigMutation,
  useResetWebhookConfigMutation
} from "../../../../store/ApiFilesV2/UserApis";

const ApiSettings = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // API Hooks
  const [generateApiKeyMutation] = useGenerateApiKeysMutation();
  const { data: apiKeysData, refetch: refetchApiKeys, isLoading: isLoadingApiKeys } = useGetApieysQuery();
  const [saveApiConfig] = useSaveApiConfigMutation();
  const [saveReportConfig] = useSaveReportConfigMutation();
  const [resetWebhookConfig] = useResetWebhookConfigMutation();
  const { data: webhookConfigData, isLoading: isLoadingMessageWebhook } = useGetSaveApiConfigQuery();
  const { data: reportWebhookConfigData, isLoading: isLoadingReportWebhook } = useGetSaveReportConfigQuery();
  const [triggerSampleWebhook] = useLazyGetSampleWebhookQuery();
  const [triggerSampleReportWebhook] = useLazyGetSampleReportWebhookQuery();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("api-keys");
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Load API keys from backend
  useEffect(() => {
    if (apiKeysData) {
      // Transform backend data to match frontend structure
      const transformedKeys = apiKeysData.map((key, index) => ({
        id: key._id || index + 1,
        serialNo: index + 1,
        name: key.name || `API Key ${index + 1}`,
        createdAt: key.createdAt ? new Date(key.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) : "N/A",
        key: key.token ? `${key.token.substring(0, 20)}...` : "",
        fullKey: key.token || "",
      }));
      setApiKeys(transformedKeys);
      // Calculate total pages
      setTotalPages(Math.ceil(transformedKeys.length / itemsPerPage));
    }
  }, [apiKeysData, itemsPerPage]);

  // Calculate current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApiKeys = apiKeys.slice(indexOfFirstItem, indexOfLastItem);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pageNumbers.push(i);
        }
        if (totalPages > maxPagesToShow) {
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        }
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        if (currentPage > 3) pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          if (i > 1 && i < totalPages) pageNumbers.push(i);
        }
        if (currentPage < totalPages - 2) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "API Key name is required";
    }
    if (formData.name.length < 2) {
      return "API Key name must be at least 2 characters long";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      enqueueSnackbar(validationError, {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await generateApiKeyMutation({
        name: formData.name
      }).unwrap();

      enqueueSnackbar("API Key created successfully!", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });

      await refetchApiKeys();
      setCurrentPage(1);
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating API key:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to create API key. Please try again.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = (fullKey) => {
    navigator.clipboard
      .writeText(fullKey || "")
      .then(() => {
        enqueueSnackbar("API Key copied to clipboard!", {
          variant: "success",
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      })
      .catch((err) => {
        enqueueSnackbar("Failed to copy API Key", {
          variant: "error",
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      });
  };

  const handleDeleteClick = (id, name) => {
    setDeleteItem({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteItem) {
      try {
        enqueueSnackbar("Delete functionality needs to be implemented on backend", {
          variant: "warning",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });

        await refetchApiKeys();

        if (currentApiKeys.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setShowDeleteModal(false);
        setDeleteItem(null);
      } catch (error) {
        enqueueSnackbar("Failed to delete API key", {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== '...' && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getDisplaySerialNo = (index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  // Updated webhook configuration handlers to match backend structure
  const handleSaveMessageWebhook = async (data) => {
    try {
      // data = { url, headers: [{key, value}], events: ["All"] or [...] }
      await saveApiConfig(data).unwrap();
      enqueueSnackbar("Message webhook configuration saved successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to save message webhook configuration", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  const handleSaveReportWebhook = async (data) => {
    try {
      // data = { url, headers: [{key, value}] }
      await saveReportConfig(data).unwrap();
      enqueueSnackbar("Report webhook configuration saved successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to save report webhook configuration", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  const handleTestMessageWebhook = async () => {
    try {
      await triggerSampleWebhook().unwrap();
      enqueueSnackbar("Test message sent successfully! Check your webhook endpoint.", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to send test message", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  const handleTestReportWebhook = async () => {
    try {
      await triggerSampleReportWebhook().unwrap();
      enqueueSnackbar("Test report sent successfully! Check your webhook endpoint.", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to send test report", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  const handleResetMessageWebhook = async () => {
    try {
      await resetWebhookConfig("message").unwrap();
      enqueueSnackbar("Message webhook configuration reset successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to reset message webhook", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  const handleResetReportWebhook = async () => {
    try {
      await resetWebhookConfig("report").unwrap();
      enqueueSnackbar("Report webhook configuration reset successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to reset report webhook", {
        variant: "error",
        autoHideDuration: 2500,
      });
      throw error;
    }
  };

  return (
    <MasterLayout>
      <Breadcrumb title="API Configuration" />
      <div className="col-xxl-12">
        <div className="card h-100">
          {/* MAIN TABS */}
          <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
            <ul
              className="nav bordered-tab nav-pills mb-0"
              id="pills-tab-main"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link new-flex ${activeMainTab === "api-keys" ? "active" : ""}`}
                  id="pills-api-keys-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-api-keys"
                  type="button"
                  role="tab"
                  aria-controls="pills-api-keys"
                  aria-selected={activeMainTab === "api-keys"}
                  onClick={() => setActiveMainTab("api-keys")}
                >
                  <Icon
                    className="icon-adjustments"
                    icon="material-symbols-light:api"
                  />
                  API Keys
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link new-flex ${activeMainTab === "webhook-message" ? "active" : ""}`}
                  id="pills-webhook-message-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-webhook-message"
                  type="button"
                  role="tab"
                  aria-controls="pills-webhook-message"
                  aria-selected={activeMainTab === "webhook-message"}
                  onClick={() => setActiveMainTab("webhook-message")}
                >
                  <Icon
                    className="icon-adjustments"
                    icon="material-symbols:webhook"
                  />
                  Webhook Message Configuration
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link new-flex ${activeMainTab === "webhook-report" ? "active" : ""}`}
                  id="pills-webhook-report-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-webhook-report"
                  type="button"
                  role="tab"
                  aria-controls="pills-webhook-report"
                  aria-selected={activeMainTab === "webhook-report"}
                  onClick={() => setActiveMainTab("webhook-report")}
                >
                  <Icon className="icon-adjustments" style={{ fontSize: "20px" }} icon="file-icons:config" />
                  Webhook Report Configuration
                </button>
              </li>
            </ul>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="tab-content" id="pills-tabContent-main">
            {/* API Keys Tab */}
            <div
              className={`tab-pane fade ${activeMainTab === "api-keys" ? "show active" : ""}`}
              id="pills-api-keys"
              role="tabpanel"
              aria-labelledby="pills-api-keys-tab"
              tabIndex={0}
            >
              <div
                className="d-flex justify-content-end align-items-center"
                style={{ margin: "20px 0", paddingRight: "10px" }}
              >
                <button
                  className="btn-primary d-flex align-items-center gap-2"
                  onClick={() => setShowModal(true)}
                  disabled={isLoadingApiKeys}
                >
                  <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
                  Create New Api Key
                </button>
              </div>

              <div className="card basic-data-table">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table bordered-table mb-0">
                      <thead>
                        <tr>
                          <th scope="col">S.No</th>
                          <th scope="col">Name</th>
                          <th scope="col">Created At</th>
                          <th scope="col">Key</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingApiKeys ? (
                          <tr>
                            <td colSpan="5" className="text-center">Loading API keys...</td>
                          </tr>
                        ) : currentApiKeys.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">No API keys found</td>
                          </tr>
                        ) : (
                          currentApiKeys.map((apiKey, index) => (
                            <tr key={apiKey.id}>
                              <td>{getDisplaySerialNo(index)}</td>
                              <td>{apiKey.name}</td>
                              <td>{apiKey.createdAt}</td>
                              <td>{apiKey.key}</td>
                              <td>
                                <div className="d-flex">
                                  <button
                                    onClick={() => handleDeleteClick(apiKey.id, apiKey.name)}
                                    className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                                    style={{ cursor: "pointer" }}
                                    disabled={isLoadingApiKeys}
                                  >
                                    <Icon icon="mingcute:delete-2-line" />
                                  </button>
                                  <button
                                    onClick={() => handleCopyKey(apiKey.fullKey)}
                                    className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                                    style={{ cursor: "pointer" }}
                                    disabled={isLoadingApiKeys}
                                  >
                                    <Icon icon="nimbus:copy" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {apiKeys.length > itemsPerPage && (
                    <div className="col-md-12 mt-3">
                      <div className="card p-10 overflow-hidden position-relative radius-12">
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-end mb-0">
                          <li className="page-item">
                            <button
                              className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                            >
                              <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
                            </button>
                          </li>

                          {getPaginationNumbers().map((pageNumber, index) => (
                            <li className="page-item" key={index}>
                              {pageNumber === '...' ? (
                                <span className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px disabled">
                                  ...
                                </span>
                              ) : (
                                <button
                                  className={`page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${currentPage === pageNumber ? 'active' : ''}`}
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              )}
                            </li>
                          ))}

                          <li className="page-item">
                            <button
                              className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                            >
                              <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Webhook Message Configuration Tab */}
            <div
              className={`tab-pane fade ${activeMainTab === "webhook-message" ? "show active" : ""}`}
              id="pills-webhook-message"
              role="tabpanel"
              aria-labelledby="pills-webhook-message-tab"
              tabIndex={0}
            >
              {isLoadingMessageWebhook ? (
                <div style={{ textAlign: "center", padding: "48px" }}>
                  <p style={{ color: "#6b7280" }}>Loading configuration...</p>
                </div>
              ) : (
                <WebhookMessage
                  webhookConfigData={webhookConfigData}
                  onSave={handleSaveMessageWebhook}
                  onTest={handleTestMessageWebhook}
                  onReset={handleResetMessageWebhook}
                />
              )}
            </div>

            {/* Webhook Report Configuration Tab */}
            <div
              className={`tab-pane fade ${activeMainTab === "webhook-report" ? "show active" : ""}`}
              id="pills-webhook-report"
              role="tabpanel"
              aria-labelledby="pills-webhook-report-tab"
              tabIndex={0}
            >
              {isLoadingReportWebhook ? (
                <div style={{ textAlign: "center", padding: "48px" }}>
                  <p style={{ color: "#6b7280" }}>Loading configuration...</p>
                </div>
              ) : (
                <WebhookReport
                  webhookConfigData={reportWebhookConfigData}
                  onSave={handleSaveReportWebhook}
                  onTest={handleTestReportWebhook}
                  onReset={handleResetReportWebhook}
                />
              )}
            </div>
          </div>

          {/* Create API Key Modal */}
          {showModal && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="d-flex align-items-center">
                      <div>
                        <Icon className="modal-icon-adjustments" icon="ic:twotone-api" />
                      </div>
                      <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                        Create Api Key
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      <Icon icon="mingcute:close-line" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter API Key name"
                          required
                          disabled={isSubmitting}
                        />
                        <div className="form-text">
                          Give your API key a descriptive name for easy identification.
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create API Key"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="d-flex align-items-center">
                      <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                        Confirm Deletion
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleDeleteCancel}
                    >
                      <Icon icon="mingcute:close-line" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <p className="text-primary-2">
                      Are you sure you want to delete the API key "{deleteItem?.name}"? This action cannot be undone.
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleDeleteConfirm}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MasterLayout>
  );
};

export default ApiSettings;