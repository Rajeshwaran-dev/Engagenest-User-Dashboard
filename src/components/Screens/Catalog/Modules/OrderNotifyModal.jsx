import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Trash } from "feather-icons-react";
import { useSnackbar } from "notistack";
import TriggerTemplateModal from "./TriggerTemplateModal";
import { Alert } from "react-bootstrap";

const OrderNotifyModal = ({ isOpen, onClose }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [notifications, setNotifications] = useState([]);
    const [formData, setFormData] = useState({
        phoneNumber: "",
        triggerTemplate: "",
        status: "",
    });
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateVariables, setTemplateVariables] = useState([]);
    const [variableValues, setVariableValues] = useState({});
    const [selectedTemplateName, setSelectedTemplateName] = useState("");

    // File upload states - SingleMsg-ல இருந்து copy
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [carouselFiles, setCarouselFiles] = useState({});
    const [carouselMediaType, setCarouselMediaType] = useState(null);
    const [templateType, setTemplateType] = useState("");
    const [allowedFileTypes, setAllowedFileTypes] = useState([]);
    const [maxFileSize, setMaxFileSize] = useState(0);

    const fileInputRef = useRef(null);

    // Extract variables from template when template changes
    useEffect(() => {
        if (formData.triggerTemplate) {
            extractVariablesFromTemplate(formData.triggerTemplate);
        } else {
            setTemplateVariables([]);
            setVariableValues({});
        }
    }, [formData.triggerTemplate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle variable value change - SingleMsg-ல இருந்து copy
    const handleVariableChange = (variableName, value) => {
        setVariableValues(prev => ({
            ...prev,
            [variableName]: value
        }));
    };

    // Handle template selection from modal
    const handleTemplateSelect = (templateData) => {
        setFormData((prev) => ({
            ...prev,
            triggerTemplate: templateData.description,
        }));
        setSelectedTemplateName(templateData.name);

        // Set template type and file restrictions - SingleMsg-ல இருந்து copy
        setTemplateType(templateData.type);
        setAllowedFileTypes(templateData.allowedFileTypes || []);
        setMaxFileSize(templateData.maxFileSize || 0);
        setCarouselMediaType(templateData.carouselMediaType || null);

        // Clear any existing files when template changes
        setSelectedFile(null);
        setCarouselFiles({});
        setFileError("");

        // Extract variables from template
        extractVariablesFromTemplate(templateData.description);
        setShowTemplateModal(false);
    };

    // Function to extract variables from template - SingleMsg-ல இருந்து copy
    const extractVariablesFromTemplate = (template) => {
        const variableRegex = /\{\{(\w+)\}\}/g;
        const matches = [...template.matchAll(variableRegex)];
        const variables = matches.map(match => ({
            name: match[1],
            placeholder: match[0]
        }));

        // Remove duplicates
        const uniqueVariables = Array.from(
            new Map(variables.map(v => [v.name, v])).values()
        );

        setTemplateVariables(uniqueVariables);

        // Initialize variable values
        const initialValues = {};
        uniqueVariables.forEach(variable => {
            initialValues[variable.name] = "";
        });
        setVariableValues(initialValues);
    };

    // Clear template selection
    const handleClearTemplate = () => {
        setFormData((prev) => ({
            ...prev,
            triggerTemplate: "",
        }));
        setSelectedTemplateName("");
        setTemplateVariables([]);
        setVariableValues({});
        setSelectedFile(null);
        setCarouselFiles({});
        setFileError("");
        setTemplateType("");
        setAllowedFileTypes([]);
        setMaxFileSize(0);
        setCarouselMediaType(null);
    };

    // File upload functions - SingleMsg-ல இருந்து copy
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedTypes = allowedFileTypes || [];

        if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
            setFileError(`Only ${allowedTypes.join(', ')} files are allowed`);
            setSelectedFile(null);
            return;
        }

        // Validate file size
        const maxSize = (maxFileSize || 0) * 1024 * 1024;
        if (file.size > maxSize) {
            setFileError(`File size must be less than ${maxFileSize}MB`);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setFileError("");
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Carousel file functions - SingleMsg-ல இருந்து copy
    const handleCarouselFileSelect = (variableName, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedTypes = allowedFileTypes || [];

        if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
            setFileError(`Only ${allowedTypes.join(', ')} files are allowed`);
            return;
        }

        const maxSize = (maxFileSize || 0) * 1024 * 1024;
        if (file.size > maxSize) {
            setFileError(`File size must be less than ${maxFileSize}MB`);
            return;
        }

        if (carouselMediaType === "image" && !file.type.startsWith('image/')) {
            setFileError(`Only image files are allowed for this carousel template`);
            return;
        }

        if (carouselMediaType === "video" && !file.type.startsWith('video/')) {
            setFileError(`Only video files are allowed for this carousel template`);
            return;
        }

        setCarouselFiles(prev => ({
            ...prev,
            [variableName]: file
        }));

        setFileError("");
    };

    const handleRemoveCarouselFile = (variableName) => {
        setCarouselFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[variableName];
            return newFiles;
        });
    };

    const getFileType = (file) => {
        if (!file) return null;
        if (file.type.startsWith('image/')) return "image";
        if (file.type.startsWith('video/')) return "video";
        return "document";
    };

    const getUploadButtonText = () => {
        const maxSize = maxFileSize;
        switch (templateType) {
            case 'image':
                return `Choose Image (Max ${maxSize}MB)`;
            case 'video':
                return `Choose Video (Max ${maxSize}MB)`;
            case 'document':
                return `Choose File (Max ${maxSize}MB)`;
            default:
                return 'Upload File';
        }
    };

    const getAcceptedFileTypes = () => {
        return allowedFileTypes.map(type => `.${type}`).join(',');
    };

    // Show upload section only for templates that support files AND are NOT carousel
    const showUploadSection = allowedFileTypes &&
        allowedFileTypes.length > 0 &&
        templateType !== "carousel";

    const handleConfig = () => {
        // Country code validation
        const phoneRegex = /^\+\d{1,4}\s?\d{6,14}$/; // +91 1234567890 or +123 1234567890
        if (!formData.phoneNumber.trim() || !phoneRegex.test(formData.phoneNumber.trim())) {
            enqueueSnackbar("Please enter a valid phone number with country code (e.g., +91 1234567890)", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        if (!formData.triggerTemplate.trim()) {
            enqueueSnackbar("Please select a trigger template.", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        if (!formData.status.trim()) {
            enqueueSnackbar("Please select a status.", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        // Check if all variables are filled
        const emptyVariables = templateVariables.filter(variable => !variableValues[variable.name]?.trim());
        if (emptyVariables.length > 0) {
            enqueueSnackbar("Please fill all variable values before configuring.", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        // Check file requirements for non-carousel templates
        if (showUploadSection && !selectedFile) {
            enqueueSnackbar("Please upload the required file before configuring.", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        // Check carousel file requirements
        if (templateType === "carousel") {
            const missingCarouselFiles = templateVariables.filter(variable => !carouselFiles[variable.name]);
            if (missingCarouselFiles.length > 0) {
                enqueueSnackbar("Please upload all required carousel files before configuring.", {
                    variant: "error",
                    autoHideDuration: 2500,
                });
                return;
            }
        }

        enqueueSnackbar("Order notification configured successfully!", {
            variant: "success",
            autoHideDuration: 2500,
        });

        // Save notification with all data
        setNotifications([...notifications, {
            ...formData,
            id: Date.now(),
            variableValues: { ...variableValues },
            templateName: selectedTemplateName,
            templateType: templateType,
            attachedFile: selectedFile,
            carouselFiles: templateType === "carousel" ? carouselFiles : null
        }]);

        // RESET ALL FORM FIELDS
        setFormData({
            phoneNumber: "",
            triggerTemplate: "",
            status: "",
        });
        setSelectedTemplateName("");
        setTemplateVariables([]);
        setVariableValues({});
        setSelectedFile(null);
        setCarouselFiles({});
        setFileError("");
        setTemplateType("");
        setAllowedFileTypes([]);
        setMaxFileSize(0);
        setCarouselMediaType(null);
    };

    const handleDelete = (id) => {
        setNotifications(notifications.filter((n) => n.id !== id));
        enqueueSnackbar("Notification deleted.", { variant: "success", autoHideDuration: 2000 });
    };

    const handleClear = () => {
        setNotifications([]);
        setFormData({
            phoneNumber: "",
            triggerTemplate: "",
            status: "",
        });
        setSelectedTemplateName("");
        setTemplateVariables([]);
        setVariableValues({});
        setSelectedFile(null);
        setCarouselFiles({});
        setFileError("");
        setTemplateType("");
        setAllowedFileTypes([]);
        setMaxFileSize(0);
        setCarouselMediaType(null);
        enqueueSnackbar("All configurations cleared.", { variant: "success", autoHideDuration: 2000 });
    };

    const handleSave = () => {
        if (notifications.length === 0) {
            enqueueSnackbar("Please configure at least one notification before saving.", {
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        enqueueSnackbar("Order notifications saved successfully!", {
            variant: "success",
            autoHideDuration: 2500,
        });

        console.log("Saving notifications:", notifications);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div style={{ width: "1100px" }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="d-flex align-items-center">
                        <div>
                            <Icon
                                className="icon-adjustments"
                                icon="iconamoon:notification-bold"
                            />
                        </div>
                        <h3 className="modal-title">
                            Order Notify
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <Icon icon="material-symbols:close-rounded" />
                    </button>
                </div>

                <div className="modal-body-custom">
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label-custom">Phone Number</label>

                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    placeholder="+919876543210"
                                    className="form-input"
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Allow only numbers and +
                                        if (!/^[0-9+]*$/.test(value)) return;

                                        handleInputChange(e);
                                    }}
                                />

                                {/* Validation message */}
                                {formData.phoneNumber &&
                                    !/^\+91[0-9]{10}$/.test(formData.phoneNumber) && (
                                        <small className="text-danger">
                                            Enter valid Mobile Number (Format: +91 followed by 10 digits)
                                        </small>
                                    )}
                            </div>


                            <div className="form-group">
                                <label className="form-label-custom">Trigger Template</label>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        name="triggerTemplate"
                                        value={selectedTemplateName || formData.triggerTemplate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Click to select template"
                                        onClick={() => setShowTemplateModal(true)}
                                        readOnly
                                        style={{ cursor: "pointer", paddingRight: "40px" }}
                                    />
                                    {formData.triggerTemplate && (
                                        <button
                                            type="button"
                                            className="btn-sm position-absolute"
                                            onClick={handleClearTemplate}
                                            style={{
                                                right: "8px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "transparent",
                                                border: "none",
                                                borderLeft: "1px solid #2125295e",
                                                color: "#dc3545",
                                                padding: "4px"
                                            }}
                                        >
                                            <Icon icon="mi:delete" width="24" height="24" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label-custom">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <button className="btn-config" onClick={handleConfig}>
                                    Config
                                </button>
                            </div>
                        </div>

                        {/* Variable Input Section - For manual variable entry */}
                        {templateVariables.length > 0 && templateType !== "carousel" && (
                            <div className="mt-3">
                                <div className="form-group" style={{ width: "100%" }}>
                                    <label className="form-label-custom fw-semibold">
                                        Enter Variable Values
                                    </label>
                                    <div className="variable-input-section border rounded p-3 bg-light">
                                        <div className="row g-3">
                                            {templateVariables.map((variable, index) => (
                                                <div className="col-md-6" key={variable.name}>
                                                    <div className="form-group">
                                                        <label className="form-label-custom mb-2">
                                                            {variable.name}
                                                        </label>
                                                        <select
                                                            value={variableValues[variable.name] || ""}
                                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                            className="form-select"
                                                            style={{
                                                                borderColor: "#e0e0e0",
                                                                borderRadius: "10px",
                                                            }}
                                                        >
                                                            <option value="">Select {variable.name}</option>
                                                            <option value="User Name">User Name</option>
                                                            <option value="Profile Name">Profile Name</option>
                                                            <option value="Total Price">Total Price</option>
                                                            <option value="Order Id">Order Id</option>
                                                            <option value="Product">Product</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Upload Section - Only shown for templates that support files AND are NOT carousel */}
                        {showUploadSection && (
                            <div className="mt-3">
                                <div className="form-group" style={{ width: "100%" }}>
                                    <label className="form-label-custom fw-semibold">
                                        Attach File
                                    </label>
                                    <div className="file-upload-section border rounded p-3 bg-light">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept={getAcceptedFileTypes()}
                                            style={{ display: 'none' }}
                                        />

                                        <div style={{ marginBottom: "12px" }} className="d-flex align-items-center justify-content-center">
                                            <button
                                                type="button"
                                                onClick={handleUploadClick}
                                                className="btn btn-outline-primary d-flex align-items-center gap-2"
                                                style={{
                                                    borderColor: "#e0e0e0",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <Icon style={{ fontSize: "20px" }} icon="humbleicons:upload" />
                                                {getUploadButtonText()}
                                            </button>
                                        </div>

                                        {selectedFile && (
                                            <div className="selected-file-info d-flex align-items-center gap-2 p-2 border rounded">
                                                <Icon
                                                    icon={templateType === 'image' ? "eva:image-fill" :
                                                        templateType === 'video' ? "eva:video-fill" : "eva:file-text-fill"}
                                                    style={{ color: "#6c757d" }}
                                                />
                                                <span className="flex-grow-1 small">
                                                    {selectedFile.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-0"
                                                    onClick={handleRemoveFile}
                                                >
                                                    <Icon icon="eva:close-fill" />
                                                </button>
                                            </div>
                                        )}

                                        {fileError && (
                                            <Alert variant="danger" className="py-2 mt-2 small">
                                                {fileError}
                                            </Alert>
                                        )}

                                        <div className="text-muted small mt-1">
                                            Allowed types: {allowedFileTypes.join(', ')} • Max size: {maxFileSize}MB
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Carousel Upload Section - Only shown for carousel templates */}
                        {templateType === "carousel" && templateVariables.length > 0 && (
                            <div className="mt-3">
                                <div className="form-group" style={{ width: "100%" }}>
                                    <label className="form-label-custom fw-semibold">
                                        Carousel Media Upload ({carouselMediaType || 'image/video'})
                                    </label>
                                    <div className="carousel-upload-section border rounded p-3 bg-light">
                                        <div className="row g-3">
                                            {templateVariables.map((variable) => (
                                                <div className="col-md-6" key={variable.name}>
                                                    <div className="carousel-variable-upload border rounded p-3">
                                                        <h6 className="fw-semibold mb-3">{variable.name}</h6>

                                                        <input
                                                            type="file"
                                                            id={`carousel-${variable.name}`}
                                                            onChange={(e) => handleCarouselFileSelect(variable.name, e)}
                                                            accept={getAcceptedFileTypes()}
                                                            style={{ display: 'none' }}
                                                        />

                                                        {!carouselFiles[variable.name] ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => document.getElementById(`carousel-${variable.name}`).click()}
                                                                className="btn btn-outline-primary d-flex align-items-center gap-2 w-100"
                                                                style={{
                                                                    borderColor: "#e0e0e0",
                                                                    borderRadius: "10px",
                                                                }}
                                                            >
                                                                <Icon style={{ fontSize: "20px" }} icon="humbleicons:upload" />
                                                                Upload {variable.name} ({carouselMediaType || 'Image/Video'})
                                                            </button>
                                                        ) : (
                                                            <div className="selected-carousel-file d-flex align-items-center gap-2 p-2 border rounded bg-light">
                                                                <Icon
                                                                    icon={getFileType(carouselFiles[variable.name]) === 'image' ? "eva:image-fill" : "eva:video-fill"}
                                                                    style={{ color: "#6c757d" }}
                                                                />
                                                                <span className="flex-grow-1 small">
                                                                    {carouselFiles[variable.name].name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link text-danger p-0"
                                                                    onClick={() => handleRemoveCarouselFile(variable.name)}
                                                                >
                                                                    <Icon icon="eva:close-fill" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {fileError && (
                                            <Alert variant="danger" className="py-2 mt-2 small">
                                                {fileError}
                                            </Alert>
                                        )}

                                        <div className="text-muted small mt-2">
                                            Allowed types: {allowedFileTypes.join(', ')} • Max size: {maxFileSize}MB per file
                                            {carouselMediaType && ` • Media type: ${carouselMediaType}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="configured-section mt-4">
                        <div className="modal-header">
                            <h3 className="modal-title">Configured Notifications</h3>
                        </div>

                        <div className="card basic-data-table">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table bordered-table mb-0">
                                        <thead>
                                            <tr>
                                                <th scope="col">Phone Number</th>
                                                <th scope="col">Template</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Type</th>
                                                <th scope="col">Variables</th>
                                                <th scope="col">Files</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center p-3">
                                                        No Configurations Added
                                                    </td>
                                                </tr>
                                            ) : (
                                                notifications.map((n) => (
                                                    <tr key={n.id}>
                                                        <td>{n.phoneNumber}</td>
                                                        <td>{n.templateName || "Template"}</td>
                                                        <td>{n.status}</td>
                                                        <td>{n.templateType || "text"}</td>
                                                        <td>
                                                            {n.variableValues && Object.keys(n.variableValues).length > 0 ? (
                                                                <div className="small">
                                                                    {Object.entries(n.variableValues).map(([key, value]) => (
                                                                        <div key={key}><strong>{key}:</strong> {value}</div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                "No variables"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {n.attachedFile && (
                                                                <div className="small text-success">
                                                                    ✓ File Attached
                                                                </div>
                                                            )}
                                                            {n.carouselFiles && Object.keys(n.carouselFiles).length > 0 && (
                                                                <div className="small text-success">
                                                                    ✓ {Object.keys(n.carouselFiles).length} Carousel Files
                                                                </div>
                                                            )}
                                                            {!n.attachedFile && !n.carouselFiles && "No files"}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="w-32-px h-32-px bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                                                onClick={() => handleDelete(n.id)}
                                                            >
                                                                <Icon icon="mi:delete" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer-custom">
                    <button className="btn-secondary" onClick={handleClear}>
                        Clear
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <TriggerTemplateModal
                    onClose={() => setShowTemplateModal(false)}
                    onTemplateSelect={handleTemplateSelect}
                    messageType="single"
                />
            )}
        </div>
    );
};

export default OrderNotifyModal;