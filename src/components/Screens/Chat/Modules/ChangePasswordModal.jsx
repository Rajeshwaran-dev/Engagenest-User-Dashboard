import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const ChangePasswordModal = ({
  showModal,
  handleCancel,
  selectedAgent,
  passwordFormData,
  handlePasswordInputChange,
  handleSubmit,
  isLoading = false,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  if (!showModal) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ width: "500px" }}>
          <div className="modal-header">
            <h3 className="modal-title">
              <Icon icon="ic:outline-lock" className="me-2" />
              Change Password
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <Icon icon="mingcute:close-line" />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleFormSubmit}>
              {/* Email Display */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={selectedAgent?.email || ""}
                  disabled
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              {/* Current Password */}
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <div className="input-group">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="form-control"
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border"
                    onClick={() => togglePasswordVisibility("current")}
                    disabled={isLoading}
                  >
                    <Icon
                      icon={
                        showCurrentPassword
                          ? "lucide:eye-off"
                          : "bi:eye"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border"
                    onClick={() => togglePasswordVisibility("new")}
                    disabled={isLoading}
                  >
                    <Icon
                      icon={
                        showNewPassword
                          ? "lucide:eye-off"
                          : "bi:eye"
                      }
                    />
                  </button>
                </div>
                <small className="text-muted">
                  Password must be at least 8 characters
                </small>
              </div>

              {/* Confirm New Password */}
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border"
                    onClick={() => togglePasswordVisibility("confirm")}
                    disabled={isLoading}
                  >
                    <Icon
                      icon={
                        showConfirmPassword
                          ? "lucide:eye-off"
                          : "bi:eye"
                      }
                    />
                  </button>
                </div>
                {passwordFormData.confirmPassword &&
                  passwordFormData.newPassword !==
                    passwordFormData.confirmPassword && (
                    <small className="text-danger">
                      Passwords do not match
                    </small>
                  )}
              </div>

              <div className="modal-footer justify-content-end px-0">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;