import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  useCancelScheduleMutation,
  useReScheduleMutation,
} from "../../../../store/ApiFilesV2/TemplateApisV2"; // Update this import path

const EditScheduleModal = ({
  isOpen,
  onClose,
  campaignData,
  onSave,
  refetch
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    campaignId: "",
    scheduledTimeZone: "Asia/Kolkata",
    scheduledTime: "",
    status: "",
    phoneNumber: "",
    type: "",
    createdAt: ""
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [cancelSchedule, { isLoading: isCancelling }] = useCancelScheduleMutation();
  const [reSchedule, { isLoading: isRescheduling }] = useReScheduleMutation();

  useEffect(() => {
    if (isOpen && campaignData) {
      setFormData({
        campaignId: campaignData?.campaignId || "",
        scheduledTimeZone: campaignData?.timezone || "Asia/Kolkata",
        scheduledTime: campaignData?.scheduleTime ?
          new Date(campaignData.scheduleTime).toISOString().slice(0, 16) : "",
        status: campaignData?.status || "Scheduled",
        phoneNumber: campaignData?.phoneNumber || campaignData?.bodyData?.contactNumber || "",
        type: campaignData?.type || "Marketing",
        createdAt: campaignData?.createdAt || ""
      });

      // Reset edit mode when modal opens
      setIsEditing(false);
    }
  }, [isOpen, campaignData]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelSchedule = async () => {
    try {
      const response = await cancelSchedule({
        campaignId: formData.campaignId,
      }).unwrap();

      if (refetch) refetch();

      enqueueSnackbar("Campaign cancelled successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setShowCancelConfirm(false);
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Failed to cancel campaign", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scheduledTime) {
      enqueueSnackbar("Please select schedule time", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      // Convert to ISO format for API
      const scheduleDateTime = new Date(formData.scheduledTime).toISOString();

      const response = await reSchedule({
        campaignId: formData.campaignId,
        newDateTime: scheduleDateTime,
        timeZone: formData.scheduledTimeZone,
      }).unwrap();

      if (refetch) refetch();

      enqueueSnackbar("Campaign rescheduled successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });

      if (onSave) {
        onSave({
          ...campaignData,
          scheduleTime: scheduleDateTime,
          timezone: formData.scheduledTimeZone
        });
      }

      onClose();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.msg ||
        "Rescheduling failed. Please choose a different time.",
        {
          variant: "error",
          autoHideDuration: 4000,
        }
      );
    }
  };

  const canEdit = () => {
    return formData.status !== "Sent" &&
      formData.status !== "Cancelled" &&
      formData.status !== "Completed";
  };

  const canCancel = () => {
    return formData.status !== "Sent" &&
      formData.status !== "Cancelled" &&
      formData.status !== "Completed";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: "block",
          paddingRight: "17px"
        }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Edit Schedule" : "View Schedule"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              >
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Campaign ID */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Campaign ID</label>
                  <input
                    style={{ cursor: "not-allowed" }}
                    type="text"
                    className="form-control"
                    value={formData.campaignId}
                    disabled
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    style={{ cursor: "not-allowed" }}
                    type="text"
                    className="form-control"
                    value={formData.phoneNumber}
                    placeholder="+919876543210"
                    disabled
                  />
                  {formData.phoneNumber &&
                    !/^\+91[0-9]{10}$/.test(formData.phoneNumber) && (
                      <small className="text-danger">
                        Enter valid Mobile Number (Format: +91 followed by 10 digits)
                      </small>
                    )}
                </div>

                {/* Timezone */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Timezone</label>
                  <select
                    style={{ cursor: isEditing ? "pointer" : "not-allowed" }}
                    className="form-select"
                    disabled={!isEditing}
                    value={formData.scheduledTimeZone}
                    onChange={(e) => handleInputChange("scheduledTimeZone", e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </select>
                </div>

                {/* Schedule Time */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Schedule Time</label>
                  <input
                    style={{ cursor: isEditing ? "pointer" : "not-allowed" }}
                    type="datetime-local"
                    className="form-control"
                    value={formData.scheduledTime}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Type */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Type</label>
                  <select
                    className="form-select"
                    style={{ cursor: "not-allowed" }}
                    disabled
                    value={formData.type}
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Service">Service</option>
                    <option value="Authentication">Authentication</option>
                  </select>
                </div>

                {/* Status */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    style={{ cursor: "not-allowed" }}
                    className="form-select"
                    disabled
                    value={formData.status}
                  >
                    <option value="Sent">Sent</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Created At (Additional Info) */}
                {formData.createdAt && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Created At</label>
                    <input
                      style={{ cursor: "not-allowed" }}
                      type="text"
                      className="form-control"
                      value={new Date(formData.createdAt).toLocaleString()}
                      disabled
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>

                {canCancel() && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleCancelConfirm}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Schedule"}
                  </button>
                )}

                {canEdit() && !isEditing && (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Schedule
                  </button>
                )}

                {canEdit() && isEditing && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isRescheduling}
                    >
                      {isRescheduling ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowCancelConfirm(false)}
          ></div>

          <div
            className="modal fade show"
            style={{
              display: "block",
              paddingRight: "17px"
            }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cancel Schedule</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCancelConfirm(false)}
                    aria-label="Close"
                  >
                    <Icon icon="material-symbols:close-rounded" />
                  </button>
                </div>

                <div className="modal-body">
                  <p>Are you sure you want to cancel this schedule?</p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleCancelSchedule}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditScheduleModal;