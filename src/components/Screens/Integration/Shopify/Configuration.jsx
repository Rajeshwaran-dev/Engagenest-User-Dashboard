import React, { useState, useEffect } from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import "../Flow.css";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const Configuration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeUrl: "",
    accessToken: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Validate form whenever formData changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const { storeUrl, accessToken } = formData;

    // Basic validation - both fields are required and not empty
    const isValid = storeUrl.trim() !== "" && accessToken.trim() !== "";

    setFormValid(isValid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();

    if (!formValid) {
      enqueueSnackbar("Please fill both Store URL and Access Token!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsTesting(true);

    // Show testing notification
    enqueueSnackbar("Testing connection to Shopify store...", {
      variant: "success",
      autoHideDuration: 2000,
    });

    // Simulate API call to test connection
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);

      enqueueSnackbar("Successfully connected to Shopify store!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      // In real implementation, you would check the actual connection status
    }, 2000);
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

    if (!isConnected) {
      enqueueSnackbar("Please test the connection first!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    // Handle the actual connection logic here
    console.log("Connecting with:", formData);

    enqueueSnackbar("Shopify store connected successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const resetForm = () => {
    setFormData({
      storeUrl: "",
      accessToken: "",
    });
    setIsConnected(false);
    setFormValid(false);
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Shopify" />
      <div className="configuration-container">
        <div className="container-fluid">
          <div className="row justify-content-start">
            <div className="d-flex align-items-center gap-3" style={{ marginBottom: "20px" }}>
              <button
                className="btn-primary d-flex align-items-center gap-2"
                onClick={() => navigate("/integration")}
              >
                <Icon
                  style={{ fontSize: "20px" }}
                  icon="typcn:arrow-left-outline"
                />
                Back
              </button>
            </div>
            <div className="col-12 col-md-8 col-lg-6">
              {/* Configuration Card */}
              <div className="card configuration-card">
                <div className="card-body p-4">
                  <form onSubmit={handleConnect}>
                    {/* Store URL Field */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Shopify Store URL *

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
                            Enter your Shopify store URL without https:// (e.g., your-store.myshopify.com)
                          </span>
                        </div>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text configuration-input-prefix">
                          https://
                        </span>
                        <input
                          type="text"
                          className="form-control configuration-input"
                          id="storeUrl"
                          name="storeUrl"
                          placeholder="your-store.myshopify.com"
                          value={formData.storeUrl}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Access Token Field */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Access Token *

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
                            You can generate access tokens from your Shopify admin
                            panel under Apps Develop apps
                          </span>
                        </div>
                      </label>
                      <input
                        type="password"
                        className="form-control configuration-input"
                        id="accessToken"
                        name="accessToken"
                        placeholder="Enter your access token"
                        value={formData.accessToken}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-3 flex-wrap mt-16">
                      <button
                        type="button"
                        className="configuration-test-btn text-center"
                        onClick={handleTestConnection}
                      >
                        <i className="fas fa-plug me-2"></i>
                        Test Connection
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Configuration;
