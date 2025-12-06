import React, { useState } from "react";
import { useSnackbar } from "notistack";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const AddProductModal = ({ showModal, setShowModal }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "",
    retailId: "",
    brandName: "",
    productLink: "",
    salePrice: ""
  });

  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Tooltip for file upload information
  const renderFileTooltip = (props) => (
    <Tooltip id="file-tooltip" {...props}>
      Supported formats: PNG, JPG, JPEG
      <br />
      Max size: 5MB
    </Tooltip>
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setProductImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar("Please upload only PNG, JPG, or JPEG images.", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });
      e.target.value = "";
      setProductImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      enqueueSnackbar("File size must be less than 5MB.", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });
      e.target.value = "";
      setProductImage(null);
      setImagePreview(null);
      return;
    }

    // If validation passes, set the selected image
    setProductImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    enqueueSnackbar("Image uploaded successfully!", {
      variant: "success",
      autoHideDuration: 2000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    });
  };

  // Handle file click to open in new tab
  const handleFileClick = (file) => {
    if (file && file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }
  };

  // Add remove image function
  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById("file1");
    if (fileInput) {
      fileInput.value = "";
    }

    enqueueSnackbar("Image removed!", {
      variant: "success",
      autoHideDuration: 2000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required";
    }
    if (!formData.description.trim()) {
      return "Product description is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      return "Product price is required and must be greater than 0";
    }
    if (!formData.currency) {
      return "Currency is required";
    }
    if (!formData.retailId.trim()) {
      return "Retail ID is required";
    }
    if (!formData.brandName.trim()) {
      return "Brand name is required";
    }
    if (!formData.productLink.trim()) {
      return "Product link is required";
    }
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      return "Sale price is required and must be greater than 0";
    }
    if (!productImage) {
      return "Product image is required";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const validationError = validateForm();
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
      // Prepare form data for submission
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: parseFloat(formData.salePrice),
        productImage: productImage.name
      };

      // Here you would typically send the data to your API
      console.log("Product Form Data:", submissionData);
      console.log("Product Image:", productImage);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      enqueueSnackbar("Product created successfully!", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right"
        }
      });

      // Reset form and close modal after successful submission
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error("Error creating product:", error);
      enqueueSnackbar("Failed to create product. Please try again.", {
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
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "",
      retailId: "",
      brandName: "",
      productLink: "",
      salePrice: ""
    });
    setProductImage(null);
    setImagePreview(null);

    // Reset file input
    const fileInput = document.getElementById('file1');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ width: "600px" }}>
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <div>
                <Icon
                  className="modal-icon-adjustments"
                  icon="fluent-mdl2:product"
                />
              </div>
              <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                Create Product
              </h3>
            </div>
            <button type="button" className="btn-close" onClick={handleCancel}>
              <Icon icon="mingcute:close-line" />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="name"
                  className="form-label"
                >
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Product Name"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="description"
                  className="form-label"
                >
                  Product Description <span className="text-danger">*</span>
                </label>

                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      handleInputChange(e);
                    }
                  }}
                  maxLength={500}
                  placeholder="Enter Product Description"
                  required
                />
                <div className="text-end">
                  <small >{formData.description?.length || 0} / 500</small>
                </div>

              </div>


              {/* Price Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="price"
                  className="form-label"
                >
                  Product Price <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter Product Price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Currency Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="currency"
                  className="form-label"
                >
                  Currency <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Currency</option>
                  <option value="Indian Rupee">Indian Rupee</option>
                  <option value="Euro">Euro</option>
                  <option value="Japanese Yen">Japanese Yen</option>
                  <option value="British Pound Sterling">
                    British Pound Sterling
                  </option>
                  <option value="Australian Dollar">Australian Dollar</option>
                  <option value="Canadian Dollar">Canadian Dollar</option>
                  <option value="United States Dollar">
                    United States Dollar
                  </option>
                  <option value="South African Rand">South African Rand</option>
                </select>
              </div>

              {/* File Upload Field - Updated with New Style */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  className="form-label d-flex align-items-center gap-2"
                >
                  Product Image <span className="text-danger">*</span>
                  <OverlayTrigger
                    placement="top"
                    trigger="click"
                    overlay={renderFileTooltip}
                    rootClose={true}
                  >
                    <Icon
                      icon="eva:info-outline"
                      style={{
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#6c757d",
                      }}
                    />
                  </OverlayTrigger>
                </label>

                {/* Image Preview - Show file name with click functionality */}
                {productImage && (
                  <div className="mb-3">
                    <div className="selected-file-info d-flex align-items-center gap-2 p-2 border rounded bg-light">
                      <Icon
                        icon="eva:image-fill"
                        style={{ color: "#6c757d" }}
                      />
                      <span
                        className="small"
                        onClick={() => handleFileClick(productImage)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          color: "#007bff",
                        }}
                        title="Click to view image"
                      >
                        {productImage.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 ms-2"
                        onClick={removeImage}
                      >
                        <Icon icon="eva:close-fill" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button - New Style */}
                <div className="file-upload-section">
                  <input
                    type="file"
                    id="file1"
                    style={{ display: "none" }}
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileChange}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => document.getElementById("file1").click()}
                    className="btn btn-secondary d-flex align-items-center gap-2 mb-2"
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #ced4da",
                      backgroundColor: "white",
                      fontWeight: "500",
                      padding: "10px 15px",
                    }}
                  >
                    <Icon
                      style={{ fontSize: "20px" }}
                      icon="humbleicons:upload"
                    />
                    {productImage ? `Change Image` : "Choose Image (Max 5MB)"}
                  </button>
                </div>
              </div>

              {/* Retail id Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="retailId"
                  className="form-label"
                >
                  Retail Id <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="retailId"
                  name="retailId"
                  value={formData.retailId}
                  onChange={handleInputChange}
                  placeholder="Enter Retail Id"
                  required
                />
              </div>

              {/* Brand Name Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="brandName"
                  className="form-label"
                >
                  Brand Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  placeholder="Enter Brand Name"
                  required
                />
              </div>

              {/* Product link Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="productLink"
                  className="form-label"
                >
                  Product link to your website <span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="productLink"
                  name="productLink"
                  value={formData.productLink}
                  onChange={handleInputChange}
                  placeholder="Enter Product link to your website"
                  required
                />
              </div>

              {/* Sale Price Field */}
              <div className="mb-3">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  htmlFor="salePrice"
                  className="form-label"
                >
                  Sale Price <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="Enter Sale Price"
                  min="0"
                  step="0.01"
                  required
                />
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
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;