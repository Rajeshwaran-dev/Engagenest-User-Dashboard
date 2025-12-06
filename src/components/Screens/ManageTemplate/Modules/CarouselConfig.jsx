// CarouselConfig.jsx
import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { X } from "@phosphor-icons/react";
import { useSnackbar } from "notistack";
import { OverlayTrigger, Tooltip, Alert } from "react-bootstrap";

export default function CarouselConfig({
    formData,
    carouselItems,
    setCarouselItems,
    carouselButtons,
    setCarouselButtons,
    carouselInteractiveData,
    setCarouselInteractiveData,
    errors,
    setErrors,
    fileConfig,
    enqueueSnackbar
}) {
    const [showCarouselModal, setShowCarouselModal] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState(null);
    const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);
    const carouselFileInputRef = useRef(null);

    const [newCarouselItem, setNewCarouselItem] = useState({
        headerText: "",
        body: "",
        file: null,
        preview: "",
        fileName: ""
    });

    // File configuration for carousel
    const carouselFileConfig = {
        image: {
            accept: "image/*",
            maxSize: 5 * 1024 * 1024,
            allowedTypes: ["png", "jpg", "jpeg", "gif", "webp"]
        },
        video: {
            accept: "video/*",
            maxSize: 16 * 1024 * 1024,
            allowedTypes: ["mp4", "avi", "mov", "wmv"]
        }
    };

    // Get enabled button count
    const getEnabledButtonCount = () => {
        return carouselButtons.filter(button => button.enabled).length;
    };

    // Toggle carousel button
    const toggleCarouselButton = (buttonType) => {
        const enabledCount = getEnabledButtonCount();
        const isCurrentlyEnabled = carouselButtons.find(b => b.type === buttonType)?.enabled;

        if (!isCurrentlyEnabled && enabledCount >= 2) {
            enqueueSnackbar("Only two buttons are allowed", { variant: "info", autoHideDuration: 2000 });
            return;
        }

        setCarouselButtons(prev =>
            prev.map(button =>
                button.type === buttonType
                    ? { ...button, enabled: !button.enabled }
                    : button
            )
        );
    };

    // Handle carousel file selection - FRESH UPLOAD for NEW ITEM
    const handleCarouselFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        const currentFileType = formData.carouselType.toLowerCase();
        const config = carouselFileConfig[currentFileType];
        if (!config) {
            enqueueSnackbar("Invalid file type for carousel", { variant: "error" });
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > config.maxSize) {
                enqueueSnackbar(`File "${file.name}" is too large. Maximum ${config.maxSize / 1024 / 1024}MB allowed`, { variant: "error" });
                return false;
            }

            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!config.allowedTypes.includes(fileExtension)) {
                enqueueSnackbar(`File "${file.name}" type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`, { variant: "error" });
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            const file = validFiles[0];

            if (currentEditingItem) {
                // Update existing item with new file
                updateCarouselItem(currentEditingItem.id, "file", file);
                updateCarouselItem(currentEditingItem.id, "preview", URL.createObjectURL(file));
                updateCarouselItem(currentEditingItem.id, "fileName", file.name);
                updateCarouselItem(currentEditingItem.id, "headerText", file.name);

                // Also update currentEditingItem state
                setCurrentEditingItem(prev => ({
                    ...prev,
                    file: file,
                    preview: URL.createObjectURL(file),
                    fileName: file.name,
                    headerText: file.name
                }));
            } else {
                // For new item
                setNewCarouselItem(prev => ({
                    ...prev,
                    file: file,
                    preview: URL.createObjectURL(file),
                    fileName: file.name,
                    headerText: file.name
                }));
            }
        }

        event.target.value = "";
    };

    // Remove carousel item
    const removeCarouselItem = (id) => {
        setCarouselItems(prev => {
            const itemToRemove = prev.find(item => item.id === id);
            if (itemToRemove && itemToRemove.preview) {
                URL.revokeObjectURL(itemToRemove.preview);
            }
            return prev.filter(item => item.id !== id);
        });
    };

    // Update carousel item
    const updateCarouselItem = (id, field, value) => {
        setCarouselItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Handle carousel interactive data changes
    const handleCarouselInteractiveChange = (type, field, value) => {
        setCarouselInteractiveData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    // Reset interactive data to empty for new carousel
    const resetInteractiveData = () => {
        setCarouselInteractiveData({
            quickReply: { title: "" },
            callToAction: { title: "", phoneNumber: "" },
            url: { title: "", url: "" }
        });
    };

    // Validate phone number with country code
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    };

    // URL validation helper
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Save carousel configuration
    const saveCarouselConfig = () => {
        const carouselErrors = {};

        const enabledButtonTypes = carouselButtons.filter(btn => btn.enabled).map(btn => btn.type);

        enabledButtonTypes.forEach(buttonType => {
            const data = carouselInteractiveData[buttonType];
            if (buttonType === "quickReply" && (!data.title || !data.title.trim())) {
                carouselErrors.carouselQuickReply = "Quick Reply button title is required";
            }
            if (buttonType === "callToAction") {
                if (!data.title || !data.title.trim()) {
                    carouselErrors.carouselCallToActionTitle = "Call to Action button title is required";
                }
                if (!data.phoneNumber || !data.phoneNumber.trim()) {
                    carouselErrors.carouselCallToActionPhone = "Phone number is required for Call to Action";
                } else if (!validatePhoneNumber(data.phoneNumber)) {
                    carouselErrors.carouselCallToActionPhone = "Please enter a valid phone number with country code (e.g., +123456789012)";
                }
            }
            if (buttonType === "url") {
                if (!data.title || !data.title.trim()) {
                    carouselErrors.carouselUrlTitle = "URL button title is required";
                }
                if (!data.url || !data.url.trim()) {
                    carouselErrors.carouselUrl = "URL is required";
                } else if (!isValidUrl(data.url)) {
                    carouselErrors.carouselUrl = "Please enter a valid URL";
                }
            }
        });

        // Validation for new item
        if (isCreatingNewItem) {
            if (!newCarouselItem.file) {
                carouselErrors.file = "Please upload a file";
            }
            if (!newCarouselItem.body.trim()) {
                carouselErrors.body = "Body text is required";
            }
        }

        if (Object.keys(carouselErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...carouselErrors }));
            enqueueSnackbar("Please fix the carousel configuration errors", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return;
        }

        // If creating new item, add it to carouselItems
        if (isCreatingNewItem) {
            const newItem = {
                id: Date.now() + Math.random(),
                file: newCarouselItem.file,
                preview: newCarouselItem.preview,
                fileName: newCarouselItem.fileName,
                headerText: newCarouselItem.headerText,
                body: newCarouselItem.body
            };
            setCarouselItems(prev => [...prev, newItem]);
        }

        setShowCarouselModal(false);
        setCurrentEditingItem(null);
        setIsCreatingNewItem(false);
        setNewCarouselItem({
            headerText: "",
            body: "",
            file: null,
            preview: "",
            fileName: ""
        });

        enqueueSnackbar(
            isCreatingNewItem
                ? "Carousel item added successfully"
                : "Carousel item updated successfully",
            {
                variant: "success",
                autoHideDuration: 2000,
            }
        );
    };

    // Open fresh modal for new item
    const openNewCarouselModal = () => {
        setCurrentEditingItem(null);
        setIsCreatingNewItem(true);
        resetInteractiveData(); // Reset interactive data for new carousel
        setNewCarouselItem({
            headerText: "",
            body: "",
            file: null,
            preview: "",
            fileName: ""
        });
        setShowCarouselModal(true);
    };

    // Open modal for editing existing item
    const openEditCarouselModal = (item) => {
        setCurrentEditingItem(item);
        setIsCreatingNewItem(false);
        // Pre-fill the newCarouselItem with existing data for editing
        setNewCarouselItem({
            headerText: item.headerText,
            body: item.body,
            file: item.file,
            preview: item.preview,
            fileName: item.fileName
        });
        setShowCarouselModal(true);
    };

    return (
        <>
            {/* Carousel Button Config Section */}
            <div style={{ marginBottom: "24px" }}>
                <label className="section-title">Carousel Button Config</label>

                <div className="carousel-buttons-grid">
                    {carouselButtons.map((button) => {
                        const enabledCount = getEnabledButtonCount();
                        const disableCheckbox = !button.enabled && enabledCount >= 2;
                        return (
                            <div key={button.type} className="carousel-button-item">
                                <label className={`carousel-button-checkbox ${button.enabled ? 'checked' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={button.enabled}
                                        onChange={() => toggleCarouselButton(button.type)}
                                        className="checkbox-input"
                                        disabled={disableCheckbox}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="button-label">{button.label}</span>
                                </label>
                            </div>
                        );
                    })}
                </div>

                {errors.carouselButtons && <div className="error-message" style={{ marginTop: "8px" }}>{errors.carouselButtons}</div>}

                <div className="carousel-config-section">
                    <div className="carousel-config-header">
                        <h3 className="modal-title">Carousel Config</h3>
                    </div>

                    {/* Carousel Items Summary */}
                    {carouselItems.length > 0 ? (
                        <div className="carousel-items-summary">
                            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                {carouselItems.map(item => (
                                    <div key={item.id} style={{ position: "relative", display: "inline-block" }}>
                                        <div
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 8,
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                border: "1px solid #e6e6e6"
                                            }}
                                            onClick={() => openEditCarouselModal(item)}
                                        >
                                            {formData.carouselType === "Image" ? (
                                                <img src={item.preview} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <video style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                                                    <source src={item.preview} type={item.file?.type} />
                                                </video>
                                            )}
                                        </div>
                                        <button
                                            style={{
                                                position: "absolute",
                                                top: -8,
                                                right: -8,
                                                background: "#fff",
                                                border: "1px solid #ddd",
                                                borderRadius: "50%",
                                                width: 20,
                                                height: 20,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                padding: 0,
                                                fontSize: "10px"
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCarouselItem(item.id);
                                            }}
                                            title="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add new item button */}
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 64,
                                        height: 64,
                                        borderRadius: 8,
                                        border: "1px dashed #bdbdbd",
                                        cursor: "pointer"
                                    }}
                                    onClick={openNewCarouselModal}
                                >
                                    <span style={{ fontSize: 22, color: "#3b7dd8" }}>＋</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <div className="summary-info">
                                    <Icon icon="bi:images" style={{ marginRight: "8px" }} />
                                    {carouselItems.length} {formData.carouselType.toLowerCase()}(s) configured
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="carousel-empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 64,
                                height: 64,
                                borderRadius: 8,
                                border: "1px dashed #bdbdbd",
                                marginBottom: "16px",
                                cursor: "pointer"
                            }} onClick={() => {
                                if (getEnabledButtonCount() === 2) {
                                    openNewCarouselModal();
                                } else {
                                    enqueueSnackbar("For carousel type, exactly 2 buttons must be selected", {
                                        variant: "error",
                                        autoHideDuration: 3000,
                                    });
                                }
                            }}>
                                <span style={{ fontSize: 24, color: "#3b7dd8" }}>＋</span>
                            </div>
                        </div>
                    )}

                    {errors.carouselItems && <div className="error-message">{errors.carouselItems}</div>}
                </div>
            </div>

            {/* Carousel Configuration Modal */}
            {showCarouselModal && (
                <div className="modal-overlay">
                    <div className="modal-content carousel-modal" style={{ width: "600px", maxHeight: "90vh" }}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Icon className="modal-icon-adjustments" icon="bi:images" />
                                {isCreatingNewItem ? "Add New Carousel Item" : "Edit Carousel Item"}
                            </h3>
                            <button type="button" className="btn-close" onClick={() => {
                                setShowCarouselModal(false);
                                setCurrentEditingItem(null);
                                setIsCreatingNewItem(false);
                                setNewCarouselItem({
                                    headerText: "",
                                    body: "",
                                    file: null,
                                    preview: "",
                                    fileName: ""
                                });
                            }}>
                                <Icon icon="mingcute:close-line" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="carousel-modal-content">
                                {/* Upload Section - ONLY for new items */}
                                {(isCreatingNewItem || currentEditingItem) && (
                                    <div className="carousel-upload-section" style={{ marginBottom: "24px" }}>
                                        <div className="upload-header">
                                            <div className="d-flex align-items-center gap-3">
                                                <input
                                                    type="file"
                                                    ref={carouselFileInputRef}
                                                    onChange={handleCarouselFileSelect}
                                                    accept={formData.carouselType === "Image" ? "image/*" : "video/*"}
                                                    className="file-input"
                                                    id="carousel-modal-file-upload"
                                                    style={{ display: "none" }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => carouselFileInputRef.current?.click()}
                                                    className="d-flex align-items-center gap-2 btn btn-secondary"
                                                    style={{
                                                        borderRadius: "10px",
                                                        border: "1px solid #ced4da",
                                                        backgroundColor: "white",
                                                        fontWeight: "500",
                                                        padding: "10px 15px",
                                                    }}
                                                >
                                                    <Icon icon="humbleicons:upload" style={{ fontSize: "20px" }} />
                                                    {currentEditingItem ? "Replace Image" : "Upload Image"}
                                                </button>

                                                {/* Tooltip Icon */}
                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                    <OverlayTrigger
                                                        placement="bottom"
                                                        trigger="click"
                                                        overlay={
                                                            <Tooltip id="carousel-file-tooltip">
                                                                Allowed types: {formData.carouselType === "Image" 
                                                                    ? "png, jpg, jpeg, gif, webp" 
                                                                    : "mp4, avi, mov, wmv"}
                                                                <br />
                                                                Max size: {formData.carouselType === "Image" ? "5MB" : "16MB"}
                                                            </Tooltip>
                                                        }
                                                        rootClose={true}
                                                    >
                                                        <Icon
                                                            icon="eva:info-outline"
                                                            style={{
                                                                fontSize: "20px",
                                                                cursor: "pointer",
                                                                color: "#6c757d",
                                                            }}
                                                        />
                                                    </OverlayTrigger>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error message positioned right below the upload button */}
                                        {errors.file && (
                                            <Alert variant="danger" className="py-2 small mt-2 w-100">
                                                {errors.file}
                                            </Alert>
                                        )}
                                    </div>
                                )}

                                {/* Card Config Section */}
                                <div className="card-config-section">
                                    {/* Header Field - Show file name and make it non-editable */}
                                    <div style={{ marginBottom: "16px" }}>
                                        <label className="form-label">Header</label>
                                        {currentEditingItem ? (
                                            // When editing, show file name as non-editable
                                            <div style={{
                                                padding: "8px 12px",
                                                background: "#f8f9fa",
                                                border: "1px solid #e6e6e6",
                                                borderRadius: "4px",
                                                color: "#495057"
                                            }}>
                                                {currentEditingItem.fileName}
                                            </div>
                                        ) : isCreatingNewItem && newCarouselItem.fileName ? (
                                            // When creating new and file is uploaded, show file name
                                            <div style={{
                                                padding: "8px 12px",
                                                background: "#f8f9fa",
                                                border: "1px solid #e6e6e6",
                                                borderRadius: "4px",
                                                color: "#495057"
                                            }}>
                                                {newCarouselItem.fileName}
                                            </div>
                                        ) : (
                                            // When no file uploaded
                                            <div style={{
                                                padding: "8px 12px",
                                                background: "#f8f9fa",
                                                border: "1px solid #e6e6e6",
                                                borderRadius: "4px",
                                                color: "#6c757d",
                                                fontStyle: "italic"
                                            }}>
                                                Upload a file to set header
                                            </div>
                                        )}
                                    </div>

                                    {/* Body Field - Editable in both cases */}
                                    <div style={{ marginBottom: "16px" }}>
                                        <label className="form-label">Body</label>
                                        <textarea
                                            style={{
                                                height: "90px",
                                                resize: "vertical",
                                                minHeight: "90px",
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                                wordWrap: "break-word",
                                                whiteSpace: "pre-wrap"
                                            }}
                                            placeholder="Enter body text"
                                            value={currentEditingItem ? currentEditingItem.body : newCarouselItem.body}
                                            onChange={(e) => {
                                                if (currentEditingItem) {
                                                    updateCarouselItem(currentEditingItem.id, "body", e.target.value);
                                                    setCurrentEditingItem(prev => ({ ...prev, body: e.target.value }));
                                                } else {
                                                    setNewCarouselItem(prev => ({ ...prev, body: e.target.value }));
                                                }
                                            }}
                                            className={`form-control ${errors.body ? 'error' : ''}`}
                                            rows="3"
                                            maxLength="160"
                                        />
                                        <div className="char-count" style={{ textAlign: "right", fontSize: "12px", color: "#6c757d" }}>
                                            {(currentEditingItem ? currentEditingItem.body : newCarouselItem.body).length} / 160 characters
                                        </div>
                                        {errors.body && <div className="error-message">{errors.body}</div>}
                                    </div>
                                </div>

                                {/* Interactive Actions Section */}
                                <div className="interactive-actions-modal-section">
                                    <label className="section-title">Interactive Actions</label>
                                    <p className="section-description">Add interactive buttons to your carousel items</p>

                                    <div className="action-sections-modal">
                                        {/* Quick Reply */}
                                        {carouselButtons.find(btn => btn.type === "quickReply" && btn.enabled) && (
                                            <div className="action-section-modal">
                                                <div className="action-section-header"><span className="action-section-title">Quick Reply</span></div>
                                                <div className="action-input-group d-flex align-items-center">
                                                    <label style={{ width: "160px" }}>Button Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter button title"
                                                        value={carouselInteractiveData.quickReply.title}
                                                        onChange={(e) => handleCarouselInteractiveChange("quickReply", "title", e.target.value)}
                                                        className={`action-input ${errors.carouselQuickReply ? 'error' : ''}`}
                                                    />
                                                </div>
                                                {errors.carouselQuickReply && <div className="error-message">{errors.carouselQuickReply}</div>}
                                            </div>
                                        )}

                                        {/* Call To Action */}
                                        {carouselButtons.find(btn => btn.type === "callToAction" && btn.enabled) && (
                                            <div className="action-section-modal">
                                                <div className="action-section-header"><span className="action-section-title">Call To Action</span></div>
                                                <div className="action-input-group d-flex align-items-center">
                                                    <label style={{ width: "160px" }}>Button Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter button title"
                                                        value={carouselInteractiveData.callToAction.title}
                                                        onChange={(e) => handleCarouselInteractiveChange("callToAction", "title", e.target.value)}
                                                        className={`action-input ${errors.carouselCallToActionTitle ? 'error' : ''}`}
                                                    />
                                                </div>
                                                {errors.carouselCallToActionTitle && (
                                                    <div className="error-message">{errors.carouselCallToActionTitle}</div>
                                                )}

                                                <div className="action-input-group d-flex align-items-center">
                                                    <label style={{ width: "160px" }}>Phone</label>

                                                    <input
                                                        type="number"
                                                        placeholder="Country code with Mobile number"
                                                        value={carouselInteractiveData.callToAction.phoneNumber}
                                                        className={`action-input ${errors.carouselCallToActionPhone ? "error" : ""
                                                            }`}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            // Allow only "+" and numbers
                                                            if (!/^[0-9+]*$/.test(value)) return;

                                                            // Pass value to parent
                                                            handleCarouselInteractiveChange(
                                                                "callToAction",
                                                                "phoneNumber",
                                                                value
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <small className="small-text" style={{ marginLeft: "160px" }}>
                                                    Enter valid number: +91 followed by 10 digits
                                                </small>

                                                {/* Validation message */}
                                                {carouselInteractiveData.callToAction.phoneNumber &&
                                                    !/^\+91[0-9]{10}$/.test(
                                                        carouselInteractiveData.callToAction.phoneNumber
                                                    ) && (
                                                        <div className="error-message" style={{ marginLeft: "160px" }}>
                                                            Enter valid Mobile Number (Format: +91XXXXXXXXXX)
                                                        </div>
                                                    )}

                                                {errors.carouselCallToActionPhone && (
                                                    <div className="error-message">{errors.carouselCallToActionPhone}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* URL */}
                                        {carouselButtons.find(btn => btn.type === "url" && btn.enabled) && (
                                            <div className="action-section-modal">
                                                <div className="action-section-header"><span className="action-section-title">URL</span></div>
                                                <div className="action-input-group d-flex align-items-center">
                                                    <label style={{ width: "160px" }}>Button Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter button title"
                                                        value={carouselInteractiveData.url.title}
                                                        onChange={(e) => handleCarouselInteractiveChange("url", "title", e.target.value)}
                                                        className={`action-input ${errors.carouselUrlTitle ? 'error' : ''}`}
                                                    />
                                                </div>
                                                {errors.carouselUrlTitle && <div className="error-message">{errors.carouselUrlTitle}</div>}
                                                <div className="action-input-group d-flex align-items-center">
                                                    <label style={{ width: "160px" }}>URL</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter URL"
                                                        value={carouselInteractiveData.url.url}
                                                        onChange={(e) => handleCarouselInteractiveChange("url", "url", e.target.value)}
                                                        className={`action-input ${errors.carouselUrl ? 'error' : ''}`}
                                                    />
                                                </div>
                                                {errors.carouselUrl && <div className="error-message">{errors.carouselUrl}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" onClick={() => {
                                setShowCarouselModal(false);
                                setCurrentEditingItem(null);
                                setIsCreatingNewItem(false);
                                setNewCarouselItem({
                                    headerText: "",
                                    body: "",
                                    file: null,
                                    preview: "",
                                    fileName: ""
                                });
                            }} className="btn-secondary">Cancel</button>
                            <button type="button" onClick={saveCarouselConfig} className="btn-primary">
                                {isCreatingNewItem ? "Add Carousel Item" : "Update Carousel Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}