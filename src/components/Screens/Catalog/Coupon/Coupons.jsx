import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import DatePicker from "../../Calendar/DatePicker";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import ViewCouponModal from "../Modules/ViewCouponModal";
import EditCouponModal from "../Modules/EditCouponModal";

const Coupons = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Create form states
  const [couponCode, setCouponCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("fixed_cart");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [minimumSpend, setMinimumSpend] = useState("");
  const [maximumSpend, setMaximumSpend] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [unlimitedUsage, setUnlimitedUsage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Tooltip states
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Sample coupon data for demonstration
  const sampleCoupon = {
    code: "962JWV6E",
    description: "Test",
    discountType: "percentage",
    discountValue: "10",
    minimumSpend: "12",
    maximumSpend: "15",
    expiryDate: "2025-10-29",
    usageLimit: "12",
    usageLimitPerUser: "1",
    status: "In Active"
  };

  const generateCouponCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCouponCode(code);
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

  // Tooltip content
  const tooltipContent = {
    discountAmount: "Enter the discount amount for fixed discounts or percentage for percentage-based discounts",
    expiryDate: "Set when this coupon expires in YYYY-MM-DD format",
    minimumSpend: "Minimum amount required to use this coupon. Leave empty for no minimum",
    maximumSpend: "Maximum amount for which this coupon can be used. Leave empty for no maximum",
    usageLimitPerCoupon: "How many times this coupon can be used in total across all customers",
    usageLimitPerUser: "How many times each individual user can use this coupon"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const validationError = validateForm(couponCode, discountPercentage);
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

    setIsSubmitting(true);

    try {
      // Prepare form data
      const formData = {
        couponCode,
        description,
        discountType,
        discountPercentage: parseFloat(discountPercentage),
        expiryDate,
        minimumSpend: minimumSpend ? parseFloat(minimumSpend) : null,
        maximumSpend: maximumSpend ? parseFloat(maximumSpend) : null,
        usageLimit: unlimitedUsage ? null : (usageLimit ? parseInt(usageLimit) : null),
        usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : 1,
        unlimitedUsage
      };

      // Here you would typically send the data to your API
      console.log("Form Data:", formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      enqueueSnackbar("Coupon created successfully!", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });

      // Reset form after successful submission
      resetForm();

    } catch (error) {
      console.error("Error creating coupon:", error);
      enqueueSnackbar("Failed to create coupon. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCouponCode("");
    setDescription("");
    setDiscountType("fixed_cart");
    setDiscountPercentage("");
    setExpiryDate("");
    setMinimumSpend("");
    setMaximumSpend("");
    setUsageLimit("");
    setUsageLimitPerUser("");
    setUnlimitedUsage(false);
  };

  // Modal handlers
  const handleViewCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowEditModal(true);
  };

  const handleDeleteCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    console.log("Deleting coupon:", selectedCoupon);
    enqueueSnackbar("Coupon deleted successfully!", {
      variant: "success",
      autoHideDuration: 3000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    });
    setShowDeleteModal(false);
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Coupons" />

      {/* CREATE COUPON FORM */}
      <form onSubmit={handleSubmit}>
        <div className="coupon-card shadow-sm p-4">
          <h5 className="mb-4 fw-semibold">Create New Coupon</h5>

          {/* Coupon Code Section - Outside Tabs */}
          <div style={{ marginTop: "30px" }}>
            <div className="mb-3">
              <label className="form-label color-change">
                <span className="text-danger">*</span> Coupon code
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter coupon code or generate one"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  className="btn btn-primary fw-semibold text-white"
                  type="button"
                  onClick={generateCouponCode}
                >
                  Generate coupon code
                </button>
              </div>
            </div>

            {/* Description Section - Outside Tabs */}
            <div className="mb-4">
              <label className="form-label color-change">
                Description (optional)
              </label>
              <textarea
                className="form-control"
                rows="3"
                maxLength={100}
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="text-end text-muted small">
                {description.length} / 100
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="col-xxl-12 mt-4">
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
                      id="pills-general-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-general"
                      type="button"
                      role="tab"
                      aria-controls="pills-general"
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
                      id="pills-restrictions-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-restrictions"
                      type="button"
                      role="tab"
                      aria-controls="pills-restrictions"
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
                      id="pills-limits-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-limits"
                      type="button"
                      role="tab"
                      aria-controls="pills-limits"
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
                <div className="tab-content" id="pills-tabContent">
                  {/* General Tab */}
                  <div
                    className="tab-pane fade show active"
                    id="pills-general"
                    role="tabpanel"
                    aria-labelledby="pills-general-tab"
                    tabIndex={0}
                  >
                    {/* Discount Type Dropdown */}
                    <div className="mb-3">
                      <label className="form-label color-change fw-semibold">
                        <span className="text-danger">*</span> Discount type
                      </label>
                      <select
                        className="form-select"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
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
                        {discountType === "percentage"
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
                          discountType === "percentage"
                            ? "Enter percentage (e.g., 10)"
                            : "Enter amount"
                        }
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        min="0"
                        step={discountType === "percentage" ? "0.1" : "1"}
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
                        value={expiryDate}
                        onChange={setExpiryDate}
                      />

                    </div>
                  </div>

                  {/* Usage Restrictions Tab */}
                  <div
                    className="tab-pane fade"
                    id="pills-restrictions"
                    role="tabpanel"
                    aria-labelledby="pills-restrictions-tab"
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
                          value={minimumSpend}
                          onChange={(e) => setMinimumSpend(e.target.value)}
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
                          value={maximumSpend}
                          onChange={(e) => setMaximumSpend(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Usage Limits Tab */}
                  <div
                    className="tab-pane fade"
                    id="pills-limits"
                    role="tabpanel"
                    aria-labelledby="pills-limits-tab"
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
                        {!unlimitedUsage && (
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter usage limit"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(e.target.value)}
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
                          value={usageLimitPerUser}
                          onChange={(e) => setUsageLimitPerUser(e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Coupon Button */}
          <div style={{ marginTop: "20px" }} className="text-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
            >
              Reset
            </button>
            <button style={{ marginLeft: "10px" }}
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </div>
      </form>

      {/* EXISTING COUPONS TABLE */}
      <div className="shadow-sm mt-5 p-0">
        <h5 className="mb-4 fw-semibold" style={{ paddingBottom: "20px" }}>
          Existing Coupons
        </h5>
        <div className="card basic-data-table">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Coupon Code</th>
                    <th scope="col">Description</th>
                    <th scope="col">Discount Type</th>
                    <th scope="col">Discount Value</th>
                    <th scope="col">Minimum Spend</th>
                    <th scope="col">Expiry Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="text-md fw-medium text-primary-2 mb-0 flex-grow-1">
                        962JWV6E
                      </span>
                    </td>
                    <td>
                      Test
                    </td>
                    <td>
                      <span className="contact-badge coupon-badge">
                        Percentage discount
                      </span>
                    </td>
                    <td>
                      10 %
                    </td>
                    <td>
                      ₹ 12
                    </td>
                    <td>
                      29 Oct 2025
                    </td>
                    <td>
                      <span className="badge text-sm fw-semibold bg-danger px-20 py-9 radius-4 text-white">
                        In Active
                      </span>
                    </td>
                    <td>
                      <div className="d-flex">
                        <button
                          onClick={() => handleViewCoupon(sampleCoupon)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                        >
                          <Icon icon="iconamoon:eye-light" />
                        </button>
                        <button
                          onClick={() => handleEditCoupon(sampleCoupon)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                        >
                          <Icon icon="lucide:edit" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(sampleCoupon)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                        >
                          <Icon icon="mingcute:delete-2-line" />
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

      {/* View Coupon Modal */}
      {showViewModal && selectedCoupon && (
        <ViewCouponModal
          coupon={selectedCoupon}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && selectedCoupon && (
        <EditCouponModal
          coupon={selectedCoupon}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedCoupon) => {
            enqueueSnackbar("Coupon updated successfully!", {
              variant: "success",
              autoHideDuration: 3000,
              anchorOrigin: {
                vertical: "top",
                horizontal: "right"
              }
            });
            setShowEditModal(false);
          }}
        />
      )}

      {/* Delete Coupon Modal */}
      {showDeleteModal && selectedCoupon && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Delete Coupon</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <Icon icon="material-symbols:close-rounded" />
                </button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-4">
                  <h4 className="text-danger">{selectedCoupon.code}</h4>
                  <p className="text-primary-2">Are you sure you want to delete this coupon?</p>
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default Coupons;