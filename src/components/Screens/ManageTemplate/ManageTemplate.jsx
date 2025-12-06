import React, { useState, useEffect } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import ScratchTemplateModal from "./Modules/ScratchTemplateModal";
import UseTemplateModal from "./Modules/UseTemplateModal";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import CodeViewModal from "./Modules/CodeViewModal";
import DeleteConfirmationModal from "./Modules/DeleteConfirmationModal";
import ViewTemplateModal from "./Modules/ViewTemplateModal";

const ManageTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copyMode, setCopyMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [templateFromGallery, setTemplateFromGallery] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    const savedTemplates = localStorage.getItem("templates");
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error loading templates from localStorage:', error);
        setTemplates([]);
        localStorage.setItem("templates", JSON.stringify([]));
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("templates", JSON.stringify(templates));
    }
  }, [templates]);

  const handleSelectAll = (e) => {
    const filterableTemplateIds = filteredTemplates.map(t => t.id);
    if (e.target.checked) {
      setSelectedTemplates(filterableTemplateIds);
    } else {
      setSelectedTemplates([]);
    }
  };

  const handleSelectTemplate = (e, id) => {
    if (e.target.checked) {
      setSelectedTemplates(prev => [...prev, id]);
    } else {
      setSelectedTemplates(prev => prev.filter(templateId => templateId !== id));
    }
  };

  const handleStartFromScratch = () => {
    setShowModal(false);
    setCopyMode(false);
    setSelectedTemplate(null);
    setTemplateFromGallery(null);
    setShowScratchModal(true);
  };

  const handleUseTemplate = () => {
    setShowModal(false);
    setShowTemplateGalleryModal(true);
  };

  const handleTemplateSelect = (template) => {
    setTemplateFromGallery(template);
    setShowTemplateGalleryModal(false);
    setShowScratchModal(true);
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleCopy = (template) => {
    console.log('=== COPYING TEMPLATE ===');
    console.log('Original template:', {
      name: template.templateName,
      type: template.templateType,
      hasFile: !!template.selectedFile,
      filePreview: template.filePreview,
      fileType: template.fileType,
      selectedFile: template.selectedFile,
      allProps: Object.keys(template)
    });

    // Create a deep copy of the template with ALL data including template type
    const templateCopy = {
      ...template,
      id: Date.now(), // New ID for the copy
      templateName: `Copy of ${template.templateName}`,
      createdOn: new Date()
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", ""),
      status: "DRAFT",
      templateType: template.templateType,
      type: template.templateType,
      selectedFile: template.selectedFile,
      filePreview: template.filePreview,
      fileType: template.fileType,
    };

    console.log('Copied template:', {
      name: templateCopy.templateName,
      type: templateCopy.templateType,
      templateType: templateCopy.templateType,
      hasFile: !!templateCopy.selectedFile,
      filePreview: templateCopy.filePreview,
      fileType: templateCopy.fileType
    });

    setSelectedTemplate(templateCopy);
    setTemplateFromGallery(null);
    setCopyMode(true);
    setShowScratchModal(true);
  };

  const handleDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (showDeleteModal && selectedTemplate) {
      console.log('Deleting single template:', selectedTemplate.id);

      const updatedTemplates = templates.filter((t) => t.id !== selectedTemplate.id);
      setTemplates(updatedTemplates);
      localStorage.setItem("templates", JSON.stringify(updatedTemplates));

      setShowDeleteModal(false);
      setSelectedTemplate(null);
    } else if (showBulkDeleteModal && selectedTemplates.length > 0) {
      console.log(`Deleting ${selectedTemplates.length} templates in bulk.`);

      const updatedTemplates = templates.filter(
        (t) => !selectedTemplates.includes(t.id)
      );

      setTemplates(updatedTemplates);
      localStorage.setItem("templates", JSON.stringify(updatedTemplates));
      setSelectedTemplates([]);
      setShowBulkDeleteModal(false);
    }
  };

  const handleShowCode = (template) => {
    setSelectedTemplate(template);
    setShowCodeModal(true);
  };

  const handleSaveTemplate = (templateData) => {
    console.log('=== SAVING TEMPLATE ===');
    console.log('Template data received:', {
      name: templateData.templateName,
      type: templateData.templateType,
      hasFile: !!templateData.selectedFile,
      filePreview: templateData.filePreview,
      fileType: templateData.fileType,
      selectedFile: templateData.selectedFile
    });

    const newTemplate = {
      ...templateData,
      id: Date.now(),
      createdOn: new Date()
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", ""),
      // Ensure file data is explicitly included
      selectedFile: templateData.selectedFile,
      filePreview: templateData.filePreview,
      fileType: templateData.fileType,
    };

    console.log('Final template to save:', {
      name: newTemplate.templateName,
      type: newTemplate.templateType,
      hasFile: !!newTemplate.selectedFile,
      filePreview: newTemplate.filePreview,
      fileType: newTemplate.fileType
    });

    setTemplates([...templates, newTemplate]);
    setShowScratchModal(false);
    setCopyMode(false);
    setSelectedTemplate(null);
    setTemplateFromGallery(null);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.templateName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const isAllSelected = filteredTemplates.length > 0 && selectedTemplates.length === filteredTemplates.length;

  return (
    <MasterLayout>
      <Breadcrumb title="Template Manager" />

      <div className="d-flex justify-content-end align-items-center mb-4 gap-3 p-12">
        {/* Left Side - Search and Filters */}
        <div className="d-flex align-items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="d-flex align-items-center gap-2 d-md-none">
            <div className="position-relative">
              <input
                style={{ width: "200px" }}
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder="Search Template"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon
                icon="eva:search-fill"
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: "18px" }}
              />
            </div>
            <select
              style={{ width: "200px" }}
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Select Category</option>
              <option value="Marketing">Marketing</option>
              <option value="Utility">Utility</option>
              <option value="Authentication">Authentication</option>
            </select>
            <select
              style={{ width: "200px" }}
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Select Type</option>
              <option value="Text">Text</option>
              <option value="Video">Video</option>
              <option value="Image">Image</option>
              <option value="Carousel">Carousel</option>
              <option value="File">File</option>
            </select>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="mingcute:add-line"
            />
            Create New Template
          </button>
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowSyncModal(true)}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="fluent:cloud-sync-32-filled"
            />
            Sync
          </button>
          <button className="d-flex align-items-center justify-content-center" onClick={() => {
            if (selectedTemplates.length > 0) {
              setShowBulkDeleteModal(true);
            }
          }} title="Delete Selected" style={{
            color: selectedTemplates.length > 0 ? '#ff4d4f' : '',
            cursor: selectedTemplates.length > 0 ? 'pointer' : 'default',
            opacity: selectedTemplates.length > 0 ? 1 : 0.7
          }}>
            <Icon
              icon="icon-park-outline:delete"
              style={{ fontSize: "24px", }}
            />
          </button>
        </div>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "40px" }}>
                    <div className="form-check style-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        // Optionally disable if no filtered templates exist
                        disabled={filteredTemplates.length === 0}
                      />
                    </div>
                  </th>
                  <th scope="col">
                    <div className="form-check style-check d-flex align-items-center">
                      <label className="form-check-label">S.No.</label>
                    </div>
                  </th>
                  <th scope="col">Template Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Type</th>
                  <th scope="col">Created On</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template, index) => (
                  <tr key={template.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => handleSelectTemplate(e, template.id)}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <label className="form-check-label">
                          {String(index + 1).padStart(2, "0")}
                        </label>
                      </div>
                    </td>
                    <td>
                      {template.templateName}
                    </td>
                    <td>
                      {template.category}
                    </td>
                    <td>
                      <span
                        className={`badge text-sm fw-semibold px-20 py-9 radius-4 text-white ${template.status === "DRAFT"
                          ? "bg-warning"  // Warning color for DRAFT
                          : "bg-success"  // Success color for APPROVED
                          }`}
                      >
                        {template.status}
                      </span>
                    </td>
                    <td>
                      {template.type}
                    </td>
                    <td>
                      {template.createdOn}
                    </td>
                    <td>
                      <div className="d-flex">
                        <button
                          onClick={() => handleView(template)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <Icon icon="iconamoon:eye-light" />
                        </button>
                        <button
                          onClick={() => handleCopy(template)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <Icon icon="iconamoon:copy" />
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                        <button
                          onClick={() => handleShowCode(template)}
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <Icon icon="pajamas:code" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "600px" }}>
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <div>
                  <Icon
                    className="modal-icon-adjustments"
                    icon="tabler:template"
                  />
                </div>
                <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                  Create New Template
                </h3>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <Icon icon="mingcute:close-line" />
              </button>
            </div>

            <div className="modal-body">
              <div className="template-options">
                <div
                  className="option-card"
                  onClick={handleStartFromScratch}
                  style={{ cursor: "pointer" }}
                >
                  <h4>Start from scratch</h4>
                  <p>Start from a blank template</p>
                </div>

                <div
                  className="option-card"
                  onClick={handleUseTemplate}
                  style={{ cursor: "pointer" }}
                >
                  <h4>Use a template</h4>
                  <p>Use one of our pre-defined templates and edit them</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratch Template Modal */}
      {showScratchModal && (
        <ScratchTemplateModal
          onClose={() => {
            setShowScratchModal(false);
            setCopyMode(false);
            setSelectedTemplate(null);
            setTemplateFromGallery(null);
          }}
          onSave={handleSaveTemplate}
          copyMode={copyMode}
          initialData={selectedTemplate} // This should contain the complete template data with files
          templateData={templateFromGallery}
        />
      )}

      {/* Template Gallery Modal */}
      {showTemplateGalleryModal && (
        <UseTemplateModal
          onClose={() => setShowTemplateGalleryModal(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {/* View Template Modal */}
      {showViewModal && selectedTemplate && (
        <ViewTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTemplate && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTemplate(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* Code Modal */}
      {showCodeModal && selectedTemplate && (
        <CodeViewModal
          template={selectedTemplate}
          onClose={() => {
            setShowCodeModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmation</h3>
            </div>
            <div className="modal-body">
              <h6 className="mb-3 text-primary-2">
                You will get 0 new templates while syncing. Are you sure you
                want to sync the templates?
              </h6>


            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowSyncModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  console.log("Syncing templates...");
                  setShowSyncModal(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        // Replicating the general modal style from your reference images (image_1d3085.png / image_1e82fd.png)
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "500px" }}>
            {/* Modal Body Content */}
            <div className="modal-body">
              <div className="d-flex align-items-start mb-3">
                {/* Warning Icon */}
                <Icon
                  icon="clarity:warning-line"
                  color="#faad14"
                  style={{ fontSize: '24px', marginRight: '10px', marginTop: '2px' }}
                />
                <div>
                  <h6 className="mb-1 fw-bold">
                    Are you sure you want to delete {selectedTemplates.length} template(s)?
                  </h6>
                  <p className="text-muted">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end p-0 pt-3 border-0">
                <button
                  className="btn-secondary"
                  onClick={() => setShowBulkDeleteModal(false)}
                >
                  No, cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={confirmDelete}
                >
                  Yes, delete
                </button>
              </div>
            </div>

            {/* Modal Footer Buttons */}

          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default ManageTemplate;