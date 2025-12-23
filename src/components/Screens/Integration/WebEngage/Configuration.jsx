import React, { useState, useEffect } from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import "../Flow.css";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";

const Configuration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    endpointToken: "",
    authToken: "",
    generatedToken: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const { endpointToken, authToken } = formData;
    const isValid = endpointToken.trim() !== "" && authToken.trim() !== "";
    setFormValid(isValid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const copyToClipboard = () => {
    if (formData.generatedToken.trim() === "") {
      enqueueSnackbar("No token to copy! Please generate token first.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    navigator.clipboard.writeText(formData.generatedToken)
      .then(() => {
        enqueueSnackbar("Token copied to clipboard!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      })
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = formData.generatedToken;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        enqueueSnackbar("Token copied to clipboard!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      });
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
      enqueueSnackbar("Please generate the token first!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    console.log("Connecting with:", formData);

    enqueueSnackbar("Connected successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const resetForm = () => {
    setFormData({
      endpointToken: "",
      authToken: "",
      generatedToken: "",
    });
    setIsConnected(false);
    setFormValid(false);
    setIsGenerating(false);
  };

  return (
    <>
      <Breadcrumb title="Webengage" />
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
              <div className="card configuration-card">
                <div className="card-body p-4">
                  <form onSubmit={handleConnect}>
                    {/* Endpoint Token Field */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Endpoint Token *
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
                            Enter the endpoint token provided in your Webengage dashboard (do not share publicly).
                          </span>
                        </div>
                      </label>
                      <input
                        type="text"
                        className="form-control configuration-input"
                        id="endpointToken"
                        name="endpointToken"
                        placeholder="Enter your endpoint token"
                        value={formData.endpointToken}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Authentication Token Field */}
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Authentication Token *

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
                            You can generate the authentication token from your account → API settings → Tokens.
                          </span>
                        </div>
                      </label>
                      <input
                        type="text"
                        className="form-control configuration-input"
                        id="authToken"
                        name="authToken"
                        placeholder="Enter your authentication token"
                        value={formData.authToken}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div style={{ marginTop: "20px" }} className="d-flex gap-3 flex-wrap">
                      <button
                        type="button"
                        className="configuration-test-btn text-center"
                        onClick={generateToken}
                        disabled={isGenerating || !formValid}
                      >
                        <i className="fas fa-key me-2"></i>
                        {isGenerating ? "Generating..." : "Generate Token"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Configuration;
