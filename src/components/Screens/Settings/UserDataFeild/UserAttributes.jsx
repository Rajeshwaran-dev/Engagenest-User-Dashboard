import React, { useState, useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import {
  useGetUserAttrQuery,
  useCreateUserAttrMutation,
  useUpdateUserAttrKeyMutation,
  useDeleteUserAttrMutation,
  useUserAttrDeleteMutation,
} from "../../../../store/ApiFilesV2/UserApis";

const UserAttributes = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Bulk delete confirmation modal
  const [deleteItem, setDeleteItem] = useState(null); // Item to be deleted
  const [isEditing, setIsEditing] = useState(false); // Track editing mode
  const [editingId, setEditingId] = useState(null); // Track which item is being edited
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    value: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use RTK Query hooks
  const { data: userAttributesData, refetch: refetchUserAttributes } = useGetUserAttrQuery();
  const [createUserAttr] = useCreateUserAttrMutation();
  const [updateUserAttrKey] = useUpdateUserAttrKeyMutation();
  const [deleteUserAttr] = useDeleteUserAttrMutation();
  const [userAttrDelete] = useUserAttrDeleteMutation();

  const [userAttributes, setUserAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  // Transform API data to local state
  useEffect(() => {
    if (userAttributesData) {
      const transformedAttributes = userAttributesData.map((attr, index) => ({
        id: index + 1,
        key: attr.key,
        name: `$${attr.key}`,
        value: attr.val,
        originalName: attr.key,
        originalValue: attr.val, // ✅ keep this
      }));
      setUserAttributes(transformedAttributes);
    }
  }, [userAttributesData]);

  // Calculate pagination values
  const totalItems = userAttributes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return userAttributes.slice(startIndex, endIndex);
  }, [userAttributes, currentPage, itemsPerPage]);

  // Get pagination numbers
  const getPaginationNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      // Show all pages if less than or equal to 5
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pageNumbers;
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== '...') {
      setCurrentPage(pageNumber);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      return "Attribute name is required";
    }
    if (formData.name.length < 2) {
      return "Attribute name must be at least 2 characters long";
    }
    if (isEditing && !formData.key.trim()) {
      return "Attribute key is required for editing";
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
          horizontal: "right",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update existing attribute
        const updateData = {
          key: formData.key,
          value: formData.name,
        };

        await updateUserAttrKey(updateData).unwrap();

        enqueueSnackbar("User Attribute updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      } else {
        // Create new attribute
        const createData = {
          attrName: formData.name,
          attrKey: formData.key || undefined, // Optional key
        };

        await createUserAttr(createData).unwrap();

        enqueueSnackbar("User Attribute created successfully!", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }

      // Refresh user attributes
      await refetchUserAttributes();

      // Reset form and close modal after successful submission
      resetForm();
      setIsEditing(false);
      setEditingId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user attribute:", error);
      const errorMessage = error?.data?.msg || error?.message || `Failed to ${isEditing ? 'update' : 'create'} user attribute.`;

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

  const handleEditAttribute = (attribute) => {
    setFormData({
      name: attribute.originalName,
      key: attribute.key,
      value: attribute.originalValue || attribute.val || attribute.value || "",
    });
    setIsEditing(true);
    setEditingId(attribute.id);
    setShowModal(true);
  };

  const handleDeleteClick = (id, name, key) => {
    // Open delete confirmation modal
    setDeleteItem({ id, name, key });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteItem) {
      try {
        // Call delete API
        const deleteData = {
          attrName: deleteItem.key,
        };

        await deleteUserAttr(deleteData).unwrap();

        // Refresh user attributes
        await refetchUserAttributes();

        // Also remove from selected attributes if present
        setSelectedAttributes((prev) => prev.filter((attrId) => attrId !== deleteItem.id));

        enqueueSnackbar("User Attribute deleted successfully!", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });

        // Close the modal
        setShowDeleteModal(false);
        setDeleteItem(null);
      } catch (error) {
        console.error("Error deleting attribute:", error);
        const errorMessage = error?.data?.msg || error?.message || "Failed to delete user attribute.";

        enqueueSnackbar(errorMessage, {
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
    // Close the modal without deleting
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const handleBulkDeleteClick = () => {
    if (selectedAttributes.length === 0) {
      enqueueSnackbar("Please select at least one attribute to delete", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    // Open bulk delete confirmation modal
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      // Delete each selected attribute
      const deletePromises = selectedAttributes.map(async (attrId) => {
        const attribute = userAttributes.find(attr => attr.id === attrId);
        if (attribute) {
          const deleteData = {
            attrName: attribute.key,
          };
          return deleteUserAttr(deleteData).unwrap();
        }
      });

      await Promise.all(deletePromises);

      // Refresh user attributes
      await refetchUserAttributes();

      // Clear selection
      setSelectedAttributes([]);

      enqueueSnackbar(
        `${selectedAttributes.length} attribute(s) deleted successfully!`,
        {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );

      // Close the modal
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      enqueueSnackbar("Failed to delete some attributes. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  };

  const handleBulkDeleteCancel = () => {
    // Close the modal without deleting
    setShowBulkDeleteModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      key: "",
      value: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
    setShowModal(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  // Handle checkbox selection
  const handleSelectAttribute = (id, checked) => {
    if (checked) {
      setSelectedAttributes((prev) => [...prev, id]);
    } else {
      setSelectedAttributes((prev) => prev.filter((attrId) => attrId !== id));
    }
  };

  // Handle select all (only current page)
  const handleSelectAllCurrentPage = (checked) => {
    if (checked) {
      // Select all items on current page
      const currentPageIds = currentItems.map(attr => attr.id);
      setSelectedAttributes((prev) => {
        // Combine previous selections with current page selections
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      // Deselect all items on current page
      const currentPageIds = currentItems.map(attr => attr.id);
      setSelectedAttributes((prev) => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  // Check if all items on current page are selected
  const isAllCurrentPageSelected = () => {
    if (currentItems.length === 0) return false;
    return currentItems.every(attr => selectedAttributes.includes(attr.id));
  };

  // Check if some items on current page are selected
  const isSomeCurrentPageSelected = () => {
    if (currentItems.length === 0) return false;
    return currentItems.some(attr => selectedAttributes.includes(attr.id)) && !isAllCurrentPageSelected();
  };

  return (
    <MasterLayout>
      <Breadcrumb title="User Data Fields" />

      {/* Bulk Actions and Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {selectedAttributes.length > 0 && (
            <button
              className="btn-secondary d-flex align-items-center gap-2 me-2"
              onClick={handleBulkDeleteClick}
            >
              <Icon icon="mingcute:delete-2-line" />
              Delete Selected ({selectedAttributes.length})
            </button>
          )}
        </div>
        <button
          className="btn-primary d-flex align-items-center gap-2"
          onClick={handleCreateClick}
        >
          <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
          Create User Attribute
        </button>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">
                    <div className="form-check style-check d-flex align-items-center">
                      <label className="form-check-label ms-2">S.No.</label>
                    </div>
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col">Value</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((attribute, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <tr key={attribute.id}>
                      <td>
                        <div className="form-check style-check d-flex align-items-center">
                          <label className="form-check-label ms-2">
                            {(actualIndex + 1).toString().padStart(2, "0")}
                          </label>
                        </div>
                      </td>
                      <td>{attribute.name}</td>
                      <td>{attribute.value}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            onClick={() => handleEditAttribute(attribute)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            style={{ cursor: "pointer" }}
                          >
                            <Icon icon="lucide:edit" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(attribute.id, attribute.name, attribute.key)
                            }
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            style={{ cursor: "pointer" }}
                          >
                            <Icon icon="mingcute:delete-2-line" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {userAttributes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No user attributes found. Create your first attribute!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userAttributes.length > itemsPerPage && (
            <div className="col-md-12 mt-3">
              <div className="card p-10 overflow-hidden position-relative radius-12">
                <div className="d-flex justify-content-end align-items-center">
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
            </div>
          )}
        </div>
      </div>

      {/* Create/Update User Attribute Modal */}
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
                    <Icon
                      className="modal-icon-adjustments"
                      icon="material-symbols:user-attributes-outline"
                    />
                  </div>
                  <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                    {isEditing ? "Update User Attribute" : "Create User Attribute"}
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
                  {/* Name Field */}
                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="name"
                      className="form-label"
                    >
                      Name {!isEditing && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter attribute name"
                      required={!isEditing}
                      disabled={isEditing || isSubmitting}
                      readOnly={isEditing}
                      style={isEditing ? {
                        backgroundColor: '#f8f9fa',
                        cursor: 'not-allowed',
                        opacity: 0.7
                      } : {}}
                    />
                    {isEditing && (
                      <small className="form-text text-muted">
                        Name cannot be changed when editing. The key is used as the identifier.
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="value"
                      className="form-label"
                    >
                      Value (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="Enter attribute value"
                      disabled={isSubmitting}
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
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Update Attribute" : "Create Attribute"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
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
                  <h3 className="text-primary-2" style={{ marginTop: "2px", marginLeft: "10px" }}>
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
                  Are you sure you want to delete the user attribute "
                  {deleteItem?.name}"? This action cannot be undone.
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
    </MasterLayout>
  );
};

export default UserAttributes;