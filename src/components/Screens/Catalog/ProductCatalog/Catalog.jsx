import React, { useState } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSnackbar } from "notistack";

const Catalog = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [showModal, setShowModal] = useState(false);
  const [shippingShowModal, setShippingShowModal] = useState(false);
  const [deleteShowModal, setDeleteShowModal] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "",
  });

  const renderFileTooltip = (props) => (
    <Tooltip id="file-tooltip" {...props}>
      Supported formats: PNG, JPG, JPEG
      <br />
      Max size: 5MB
    </Tooltip>
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar("Please upload only PNG, JPG, or JPEG images.", {
        variant: "error",
        autoHideDuration: 3000,
      });
      e.target.value = ""; // Clear the file input
      setSelectedImage(null);
      setImagePreview(null); // Clear preview
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      enqueueSnackbar("File size must be less than 5MB.", {
        variant: "error",
        autoHideDuration: 3000,
      });
      e.target.value = ""; // Clear the file input
      setSelectedImage(null);
      setImagePreview(null); // Clear preview
      return;
    }

    // If validation passes, set the selected image
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    enqueueSnackbar("Image uploaded successfully!", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById("file1");
    if (fileInput) {
      fileInput.value = "";
    }

    enqueueSnackbar("Image removed!", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation using notistack
    if (!formData.name.trim() || !formData.role.trim()) {
      enqueueSnackbar("Please fill all required fields.", {
        variant: "error",
        autoHideDuration: 2500,
      });
      return;
    }

    if (!selectedImage) {
      enqueueSnackbar("Please upload an image for the catalog.", {
        variant: "error",
        autoHideDuration: 2500,
      });
      return;
    }

    enqueueSnackbar("Catalog created successfully!", {
      variant: "success",
      autoHideDuration: 2500,
    });

    console.log("Form Data:", formData);
    console.log("Selected Image:", selectedImage);

    // ✅ Reset form and close modals
    setShowModal(false);
    setShippingShowModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      mobileNumber: "",
      role: "",
    });
    setSelectedImage(null); // Reset selected image
    setImagePreview(null); // Reset image preview
  };

  const handleCancel = () => {
    setShowModal(false);
    setShippingShowModal(false);
    setDeleteShowModal(false);
    setCatalogToDelete(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      mobileNumber: "",
      role: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle delete confirmation
  const handleDeleteClick = (catalogName) => {
    setCatalogToDelete(catalogName);
    setDeleteShowModal(true);
  };

  const handleConfirmDelete = () => {
    // Here you would typically make an API call to delete the catalog
    enqueueSnackbar(`Catalog "${catalogToDelete}" deleted successfully!`, {
      variant: "success",
      autoHideDuration: 2500,
    });

    console.log("Deleting catalog:", catalogToDelete);

    // Close the modal and reset
    setDeleteShowModal(false);
    setCatalogToDelete(null);
  };

  return (
    <>
      <Breadcrumb title="Product Catalog" />
      <div className="d-flex justify-content-between align-items-center mb-4 p-12">
        <div className="d-flex align-items-center gap-3">
          {/* Search Input */}
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-sm ps-5 "
              placeholder="Search Catalog"
            />
            <Icon
              icon="eva:search-fill"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>

        {/* Add Chat Agent Button */}
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div></div> {/* Empty div for spacing */}
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
            Add Catalog
          </button>
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShippingShowModal(true)}
          >
            <Icon style={{ fontSize: "20px" }} icon="la:shipping-fast" />
            Add Shipping Price
          </button>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://media.istockphoto.com/id/1457979959/photo/snack-junk-fast-food-on-table-in-restaurant-soup-sauce-ornament-grill-hamburger-french-fries.jpg?s=612x612&w=0&k=20&c=QbFk2SfDb-7oK5Wo9dKmzFGNoi-h8HVEdOYWZbIjffo="
              className="card-img-top"
              alt=""
            />
            <div className="card-body p-16">
              <h5
                className="card-title text-lg text-primary-light
             mb-6"
              >
                Non Vegetarian
              </h5>
              <div className="card-body">
                <div className="d-flex align-items-center flex-wrap justify-content-between">
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="horizontal3"
                    />
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => navigate("/products")}
                      to="#"
                      className="text-md w-36-px h-36-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </button>
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => handleDeleteClick("Non Vegetarian")}
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="material-symbols:delete-outline-rounded" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg"
              className="card-img-top"
              alt=""
            />
            <div className="card-body p-16">
              <h5
                className="card-title text-lg text-primary-light
             mb-6"
              >
                Vegetarian
              </h5>
              <div className="card-body">
                <div className="d-flex align-items-center flex-wrap justify-content-between">
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="horizontal3"
                    />
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => navigate("/products")}
                      to="#"
                      className="text-md w-36-px h-36-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </button>
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => handleDeleteClick("Vegetarian")}
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="material-symbols:delete-outline-rounded" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://img.freepik.com/free-vector/flat-design-smartphone-different-perspectives_52683-52558.jpg?semt=ais_hybrid&w=740&q=80"
              className="card-img-top"
              alt=""
            />
            <div className="card-body p-16">
              <h5
                className="card-title text-lg text-primary-light
             mb-6"
              >
                Ios Phones
              </h5>
              <div className="card-body">
                <div className="d-flex align-items-center flex-wrap justify-content-between">
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="horizontal3"
                    />
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => navigate("/products")}
                      to="#"
                      className="text-md w-36-px h-36-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </button>
                  </div>
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <button
                      onClick={() => handleDeleteClick("Ios Phones")}
                      className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="material-symbols:delete-outline-rounded" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Catalog Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ width: "600px" }}>
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <Icon
                    className="modal-icon-adjustments"
                    icon="fluent-mdl2:product-catalog"
                  />
                  <h3 className="modal-title" style={{ marginLeft: "10px", marginTop: "4px" }}>Create New Catalog</h3>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel}
                >
                  <Icon icon="mingcute:close-line" />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="name"
                      className="form-label"
                    >
                      Catalog Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Catalog Name"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="role"
                      className="form-label"
                    >
                      Category Type
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Adoptable Pets">Adoptable Pets</option>
                      <option value="Automotive Models">
                        Automotive Models
                      </option>
                      <option value="Avatar">Avatar</option>
                      <option value="Bookable">Bookable</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Destination">Destination</option>
                      <option value="Flights">Flights</option>
                      <option value="Home Listing">Home Listing</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      className="form-label d-flex align-items-center gap-2"
                    >
                      Upload Image
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
                    {selectedImage && (
                      <div className="mb-3">
                        <div className="selected-file-info d-flex align-items-center gap-2 p-2 border rounded bg-light">
                          <Icon
                            icon="eva:image-fill"
                            style={{ color: "#6c757d" }}
                          />
                          <span
                            className="small"
                            onClick={() => handleFileClick(selectedImage)}
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                              color: "#007bff",
                            }}
                            title="Click to view image"
                          >
                            {selectedImage.name}
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
                        onChange={handleImageUpload}
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
                        {selectedImage ? `Change Image` : "Choose Image (Max 5MB)"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Price Modal */}
      {shippingShowModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ width: "600px" }}>
              <div className="modal-header">
                <h3 className="modal-title">Set Shipping Price</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel}
                >
                  <Icon icon="mingcute:close-line" />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="name"
                      className="form-label"
                    >
                      Shipping Price
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Shipping Price"
                    />
                  </div>
                  <span className="text-primary-2">This price will be applied to all catalog items.</span>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteShowModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ width: "500px" }}>
              <div className="modal-header">
                <h3 className="modal-title">Delete Confirmation</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel}
                >
                  <Icon icon="mingcute:close-line" />
                </button>
              </div>
              <div className="modal-body">
                <div className="text-start">
                  <h6 className="mb-3">Are you sure you want to delete this "{catalogToDelete}"</h6>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Catalog;