import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react/dist/iconify.js";
import DatePicker from "../../Calendar/DatePicker";

const EditCouponModal = ({ coupon, onClose, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();

  // Edit form states
  const [editCouponCode, setEditCouponCode] = useState(coupon.code);
  const [editDescription, setEditDescription] = useState(coupon.description);
  const [editDiscountType, setEditDiscountType] = useState(coupon.discountType);
  const [editDiscountPercentage, setEditDiscountPercentage] = useState(coupon.discountValue);
  const [editExpiryDate, setEditExpiryDate] = useState(coupon.expiryDate);
  const [editMinimumSpend, setEditMinimumSpend] = useState(coupon.minimumSpend);
  const [editMaximumSpend, setEditMaximumSpend] = useState(coupon.maximumSpend);
  const [editUsageLimit, setEditUsageLimit] = useState(coupon.usageLimit);
  const [editUsageLimitPerUser, setEditUsageLimitPerUser] = useState(coupon.usageLimitPerUser);
  const [editUnlimitedUsage, setEditUnlimitedUsage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Tooltip states
  const [activeTooltip, setActiveTooltip] = useState(null);

  const generateEditCouponCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setEditCouponCode(code);
  };

  const validateForm = (code, discount) => {
    if (!code.trim()) {
      return "Coupon code is required";
    }
    if (!discount || parseFloat(discount) <= 0) {
      return "Discount amount/percentage is required and must be greater than 0";
    }
    return null;
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();

    // Form validation for edit
    const validationError = validateForm(editCouponCode, editDiscountPercentage);
    if (validationError) {
      enqueueSnackbar(validationError, {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Prepare edit form data
      const formData = {
        couponCode: editCouponCode,
        description: editDescription,
        discountType: editDiscountType,
        discountPercentage: parseFloat(editDiscountPercentage),
        expiryDate: editExpiryDate,
        minimumSpend: editMinimumSpend ? parseFloat(editMinimumSpend) : null,
        maximumSpend: editMaximumSpend ? parseFloat(editMaximumSpend) : null,
        usageLimit: editUnlimitedUsage ? null : (editUsageLimit ? parseInt(editUsageLimit) : null),
        usageLimitPerUser: editUsageLimitPerUser ? parseInt(editUsageLimitPerUser) : 1,
        unlimitedUsage: editUnlimitedUsage
      };

      // Here you would typically send the data to your API
      console.log("Update Form Data:", formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the update callback
      onUpdate(formData);

    } catch (error) {
      console.error("Error updating coupon:", error);
      enqueueSnackbar("Failed to update coupon. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Tooltip content
  const tooltipContent = {
    discountAmount: "Enter the discount amount for fixed discounts or percentage for percentage-based discounts",
    expiryDate: "Set when this coupon expires in YYYY-MM-DD format",
    minimumSpend: "Minimum amount required to use this coupon. Leave empty for no minimum",
    maximumSpend: "Maximum amount for which this coupon can be used. Leave empty for no maximum",
    usageLimitPerCoupon: "How many times this coupon can be used in total across all customers",
    usageLimitPerUser: "How many times each individual user can use this coupon"
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-content" style={{ maxWidth: "800px", margin: "2rem auto" }}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Coupon</h3>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          >
            <Icon icon="material-symbols:close-rounded" />
          </button>
        </div>
        <form onSubmit={handleUpdateCoupon}>
          <div className="modal-body">
            <div className="coupon-card p-0">
              {/* Coupon Code Section */}
              <div style={{ marginTop: "10px" }}>
                <div className="mb-3">
                  <label className="form-label">
                    <span className="text-danger">*</span> Coupon code
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code or generate one"
                      value={editCouponCode}
                      onChange={(e) => setEditCouponCode(e.target.value)}
                    />
                    <button
                      className="btn btn-primary fw-semibold text-white"
                      type="button"
                      onClick={generateEditCouponCode}
                    >
                      Generate coupon code
                    </button>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-4">
                  <label className="form-label">
                    Description (optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength={100}
                    placeholder="Description (optional)"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <div className="text-end text-muted small">
                    {editDescription.length} / 100
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="col-xxl-12 mt-4">
                <div className="card h-100">
                  <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
                    <ul
                      className="nav bordered-tab nav-pills mb-0"
                      id="pills-tab-edit"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active new-flex"
                          id="pills-general-tab-edit"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-general-edit"
                          type="button"
                          role="tab"
                          aria-controls="pills-general-edit"
                          aria-selected="true"
                        >
                          <Icon
                            className="icon-adjustments"
                            icon="solar:settings-linear"
                          />
                          General
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link new-flex"
                          id="pills-restrictions-tab-edit"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-restrictions-edit"
                          type="button"
                          role="tab"
                          aria-controls="pills-restrictions-edit"
                          aria-selected="false"
                          tabIndex={-1}
                        >
                          <Icon
                            style={{
                              fontSize: "24px",
                              marginRight: "10px",
                            }}
                            icon="stash:shield-duotone"
                          />
                          Usage Restrictions
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link new-flex"
                          id="pills-limits-tab-edit"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-limits-edit"
                          type="button"
                          role="tab"
                          aria-controls="pills-limits-edit"
                          aria-selected="false"
                          tabIndex={-1}
                        >
                          <Icon
                            style={{
                              fontSize: "24px",
                              marginRight: "10px",
                            }}
                            icon="fluent:data-usage-20-regular"
                          />
                          Usage Limits
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body p-24">
                    <div className="tab-content" id="pills-tabContent-edit">
                      {/* General Tab */}
                      <div
                        className="tab-pane fade show active"
                        id="pills-general-edit"
                        role="tabpanel"
                        aria-labelledby="pills-general-tab-edit"
                        tabIndex={0}
                      >
                        {/* Discount Type Dropdown */}
                        <div className="mb-3">
                          <label className="form-label color-change fw-semibold">
                            <span className="text-danger">*</span> Discount type
                          </label>
                          <select
                            className="form-select"
                            value={editDiscountType}
                            onChange={(e) => setEditDiscountType(e.target.value)}
                          >
                            <option value="Fixed_cart">Fixed cart discount</option>
                            <option value="Percentage">Percentage discount</option>
                            <option value="Fixed_product">
                              Fixed product discount
                            </option>
                          </select>
                        </div>

                        {/* Discount Percentage/Amount */}
                        <div className="mb-3">
                          <label className="form-label color-change fw-semibold d-flex align-items-center">
                            {editDiscountType === "percentage"
                              ? "Discount percentage"
                              : "Discount amount"}
                            <span className="text-danger">*</span>
                            <div className="position-relative d-inline-block ms-2">
                              <button 
                                type="button" 
                                className="btn-link p-0 d-flex align-items-center"
                                onMouseEnter={() => setActiveTooltip('discountAmount')}
                                onMouseLeave={() => setActiveTooltip(null)}
                              >
                                <Icon
                                  icon="fa-regular:question-circle"
                                  style={{
                                    fontSize: "20px",
                                    color: "var(--text-secondary)",
                                    marginLeft: "4px",
                                  }}
                                />
                              </button>
                              {activeTooltip === 'discountAmount' && (
                                <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                  style={{
                                    zIndex: 1000,
                                    width: "300px",
                                    bottom: "100%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    marginBottom: "10px"
                                  }}>
                                  <div className="tooltip-arrow position-absolute" 
                                    style={{
                                      top: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      borderLeft: "8px solid transparent",
                                      borderRight: "8px solid transparent",
                                      borderTop: "8px solid #000"
                                    }}></div>
                                  <p className="mb-2 fw-semibold">Discount Amount/Percentage</p>
                                  <p className="mb-0 small">{tooltipContent.discountAmount}</p>
                                </div>
                              )}
                            </div>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={
                              editDiscountType === "percentage"
                                ? "Enter percentage (e.g., 10)"
                                : "Enter amount"
                            }
                            value={editDiscountPercentage}
                            onChange={(e) => setEditDiscountPercentage(e.target.value)}
                            min="0"
                            step={editDiscountType === "percentage" ? "0.1" : "1"}
                          />
                        </div>

                        {/* Coupon Expiry Date */}
                        <div className="mb-3">
                          <label className="form-label color-change fw-semibold d-flex align-items-center">
                            Coupon expiry date
                            <div className="position-relative d-inline-block ms-2">
                              <button 
                                type="button" 
                                className="btn-link p-0 d-flex align-items-center"
                                onMouseEnter={() => setActiveTooltip('expiryDate')}
                                onMouseLeave={() => setActiveTooltip(null)}
                              >
                                <Icon
                                  icon="fa-regular:question-circle"
                                  style={{
                                    fontSize: "20px",
                                    color: "var(--text-secondary)",
                                    marginLeft: "4px",
                                  }}
                                />
                              </button>
                              {activeTooltip === 'expiryDate' && (
                                <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                  style={{
                                    zIndex: 1000,
                                    width: "300px",
                                    bottom: "100%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    marginBottom: "10px"
                                  }}>
                                  <div className="tooltip-arrow position-absolute" 
                                    style={{
                                      top: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      borderLeft: "8px solid transparent",
                                      borderRight: "8px solid transparent",
                                      borderTop: "8px solid #000"
                                    }}></div>
                                  <p className="mb-2 fw-semibold">Coupon Expiry Date</p>
                                  <p className="mb-0 small">{tooltipContent.expiryDate}</p>
                                </div>
                              )}
                            </div>
                          </label>
                          <DatePicker
                            value={editExpiryDate}
                            onChange={setEditExpiryDate}
                          />
                        </div>
                      </div>

                      {/* Usage Restrictions Tab */}
                      <div
                        className="tab-pane fade"
                        id="pills-restrictions-edit"
                        role="tabpanel"
                        aria-labelledby="pills-restrictions-tab-edit"
                        tabIndex={0}
                      >
                        <div style={{ marginTop: "10px" }}>
                          <div className="mb-3">
                            <label className="form-label color-change fw-semibold d-flex align-items-center">
                              Minimum spend
                              <div className="position-relative d-inline-block ms-2">
                                <button 
                                  type="button" 
                                  className="btn-link p-0 d-flex align-items-center"
                                  onMouseEnter={() => setActiveTooltip('minimumSpend')}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <Icon
                                    icon="fa-regular:question-circle"
                                    style={{
                                      fontSize: "20px",
                                      color: "var(--text-secondary)",
                                      marginLeft: "4px",
                                    }}
                                  />
                                </button>
                                {activeTooltip === 'minimumSpend' && (
                                  <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                    style={{
                                      zIndex: 1000,
                                      width: "300px",
                                      bottom: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      marginBottom: "10px"
                                    }}>
                                    <div className="tooltip-arrow position-absolute" 
                                      style={{
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        borderLeft: "8px solid transparent",
                                        borderRight: "8px solid transparent",
                                        borderTop: "8px solid #000"
                                      }}></div>
                                    <p className="mb-2 fw-semibold">Minimum Spend</p>
                                    <p className="mb-0 small">{tooltipContent.minimumSpend}</p>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="No minimum"
                              value={editMinimumSpend}
                              onChange={(e) => setEditMinimumSpend(e.target.value)}
                              min="0"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label color-change fw-semibold d-flex align-items-center">
                              Maximum spend
                              <div className="position-relative d-inline-block ms-2">
                                <button 
                                  type="button" 
                                  className="btn-link p-0 d-flex align-items-center"
                                  onMouseEnter={() => setActiveTooltip('maximumSpend')}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <Icon
                                    icon="fa-regular:question-circle"
                                    style={{
                                      fontSize: "20px",
                                      color: "var(--text-secondary)",
                                      marginLeft: "4px",
                                    }}
                                  />
                                </button>
                                {activeTooltip === 'maximumSpend' && (
                                  <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                    style={{
                                      zIndex: 1000,
                                      width: "300px",
                                      bottom: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      marginBottom: "10px"
                                    }}>
                                    <div className="tooltip-arrow position-absolute" 
                                      style={{
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        borderLeft: "8px solid transparent",
                                        borderRight: "8px solid transparent",
                                        borderTop: "8px solid #000"
                                      }}></div>
                                    <p className="mb-2 fw-semibold">Maximum Spend</p>
                                    <p className="mb-0 small">{tooltipContent.maximumSpend}</p>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="No maximum"
                              value={editMaximumSpend}
                              onChange={(e) => setEditMaximumSpend(e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Usage Limits Tab */}
                      <div
                        className="tab-pane fade"
                        id="pills-limits-edit"
                        role="tabpanel"
                        aria-labelledby="pills-limits-tab-edit"
                        tabIndex={0}
                      >
                        <div style={{ marginTop: "10px" }}>
                          <div className="mb-3">
                            <label className="form-label color-change fw-semibold d-flex align-items-center">
                              Usage limit per coupon
                              <div className="position-relative d-inline-block ms-2">
                                <button 
                                  type="button" 
                                  className="btn-link p-0 d-flex align-items-center"
                                  onMouseEnter={() => setActiveTooltip('usageLimitPerCoupon')}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <Icon
                                    icon="fa-regular:question-circle"
                                    style={{
                                      fontSize: "20px",
                                      color: "var(--text-secondary)",
                                      marginLeft: "4px",
                                    }}
                                  />
                                </button>
                                {activeTooltip === 'usageLimitPerCoupon' && (
                                  <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                    style={{
                                      zIndex: 1000,
                                      width: "300px",
                                      bottom: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      marginBottom: "10px"
                                    }}>
                                    <div className="tooltip-arrow position-absolute" 
                                      style={{
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        borderLeft: "8px solid transparent",
                                        borderRight: "8px solid transparent",
                                        borderTop: "8px solid #000"
                                      }}></div>
                                    <p className="mb-2 fw-semibold">Usage Limit Per Coupon</p>
                                    <p className="mb-0 small">{tooltipContent.usageLimitPerCoupon}</p>
                                  </div>
                                )}
                              </div>
                            </label>
                            {!editUnlimitedUsage && (
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter usage limit"
                                value={editUsageLimit}
                                onChange={(e) => setEditUsageLimit(e.target.value)}
                                min="1"
                              />
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label color-change fw-semibold d-flex align-items-center">
                              Usage limit per user
                              <div className="position-relative d-inline-block ms-2">
                                <button 
                                  type="button" 
                                  className="btn-link p-0 d-flex align-items-center"
                                  onMouseEnter={() => setActiveTooltip('usageLimitPerUser')}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <Icon
                                    icon="fa-regular:question-circle"
                                    style={{
                                      fontSize: "20px",
                                      color: "var(--text-secondary)",
                                      marginLeft: "4px",
                                    }}
                                  />
                                </button>
                                {activeTooltip === 'usageLimitPerUser' && (
                                  <div className="tooltip-content position-absolute bg-dark text-white p-3 rounded shadow-lg"
                                    style={{
                                      zIndex: 1000,
                                      width: "300px",
                                      bottom: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      marginBottom: "10px"
                                    }}>
                                    <div className="tooltip-arrow position-absolute" 
                                      style={{
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        borderLeft: "8px solid transparent",
                                        borderRight: "8px solid transparent",
                                        borderTop: "8px solid #000"
                                      }}></div>
                                    <p className="mb-2 fw-semibold">Usage Limit Per User</p>
                                    <p className="mb-0 small">{tooltipContent.usageLimitPerUser}</p>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="1"
                              value={editUsageLimitPerUser}
                              onChange={(e) => setEditUsageLimitPerUser(e.target.value)}
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCouponModal;