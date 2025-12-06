import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useSnackbar } from "notistack";

const WhatsAppPayType = ({
  formData,
  handleInputChange,
  handleBodyTextChange,
  handleAddVariable,
}) => {
  const [variableName, setVariableName] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);
  const [additionalCharges, setAdditionalCharges] = useState({
    shipping: { enabled: false, amount: "" },
    discount: { enabled: false, amount: "" },
    tax: { enabled: false, percentage: "" },
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "1",
    total: "0",
  });

  const [products, setProducts] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleAddVariableClick = () => {
    if (variableName.trim()) {
      handleAddVariable(variableName);
      setVariableName("");
    }
  };

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormatText = (format) => {
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.bodyText.substring(start, end);
    let newText = formData.bodyText;

    switch (format) {
      case "bold":
        newText =
          formData.bodyText.substring(0, start) +
          `**${selectedText}**` +
          formData.bodyText.substring(end);
        break;
      case "italic":
        newText =
          formData.bodyText.substring(0, start) +
          `*${selectedText}*` +
          formData.bodyText.substring(end);
        break;
      default:
        break;
    }

    handleBodyTextChange(newText);
  };

  // Add emoji to text
  const onEmojiClick = (emojiObject) => {
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText =
      formData.bodyText.substring(0, start) +
      emojiObject.emoji +
      formData.bodyText.substring(end);

    handleBodyTextChange(newText);
    setEmojiOpen(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file format first
      const formatError = validateFileFormat(file);
      if (formatError) {
        enqueueSnackbar(formatError, {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }

      // Check file size
      const maxSize = getMaxFileSize();
      if (file.size > maxSize) {
        enqueueSnackbar(
          `File size exceeds the maximum limit of ${formatFileSize(maxSize)}`,
          {
            variant: "error",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          }
        );
        return;
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });

      // Create image preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }

      enqueueSnackbar(
        `File "${file.name}" uploaded successfully (${formatFileSize(file.size)})`,
        {
          variant: "success",
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
    }
  };

  // Add remove image function
  const removeImage = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    enqueueSnackbar("Image removed!", {
      variant: "success",
      autoHideDuration: 2000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });
  };

  // Validate file format
  const validateFileFormat = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    const allowedImageFormats = ['png', 'jpg', 'jpeg'];

    if (!allowedImageFormats.includes(fileExtension)) {
      return `Only PNG, JPG, JPEG files are allowed for images. Your file: .${fileExtension}`;
    }

    return null;
  };

  const getMaxFileSize = () => {
    return 5 * 1024 * 1024; // 5 MB
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileSizeInfo = () => {
    return "* Maximum file size: 5 MB | Allowed formats: PNG, JPG, JPEG";
  };

  const handleChargeToggle = (chargeType) => {
    setAdditionalCharges((prev) => ({
      ...prev,
      [chargeType]: {
        ...prev[chargeType],
        enabled: !prev[chargeType].enabled,
      },
    }));
  };

  const handleChargeChange = (chargeType, value) => {
    setAdditionalCharges((prev) => ({
      ...prev,
      [chargeType]: {
        ...prev[chargeType],
        [chargeType === "tax" ? "percentage" : "amount"]: value,
      },
    }));
  };

  const handleNewProductChange = (field, value) => {
    const updatedProduct = {
      ...newProduct,
      [field]: value,
    };

    if (field === "price" || field === "quantity") {
      const price = parseFloat(updatedProduct.price) || 0;
      const quantity = parseInt(updatedProduct.quantity) || 0;
      updatedProduct.total = (price * quantity).toFixed(2);
    }

    setNewProduct(updatedProduct);
  };

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.price) {
      const product = {
        id: Date.now(),
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price).toFixed(2),
        quantity: parseInt(newProduct.quantity) || 1,
        total: (
          parseFloat(newProduct.price) * (parseInt(newProduct.quantity) || 1)
        ).toFixed(2),
      };

      setProducts([...products, product]);
      setNewProduct({
        name: "",
        price: "",
        quantity: "1",
        total: "0",
      });
    }
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId));
  };

  const isAppointmentType = formData.whatsappPayType === "Appointment";

  return (
    <>
      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Whatsapp Pay</h6>
        </div>
        <label>Type:</label>
        <select
          className="form-select"
          value={formData.whatsappPayType}
          onChange={(e) => handleInputChange("whatsappPayType", e.target.value)}
        >
          <option value="Products">Products</option>
          <option value="Appointment">Appointment</option>
        </select>
      </div>

      {!isAppointmentType && (
        <>
          <div className="form-group text-center">
            <label>
              <input
                className="form-check-input form-round"
                type="radio"
                name="headerType"
                value="Image"
                checked={formData.headerType === "Image"}
                onChange={(e) =>
                  handleInputChange("headerType", e.target.value)
                }
              />
              Image
            </label>
          </div>

          {formData.headerType === "Image" && (
            <div className="form-group">
              <div className="update-btn">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".png,.jpg,.jpeg"
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3">
                    <div className="image-preview-container position-relative d-inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                        onClick={removeImage}
                        style={{ transform: "translate(50%, -50%)" }}
                      >
                        <Icon icon="mingcute:close-line" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Box */}
                <div
                  className="upload-box d-flex align-items-center justify-content-between"
                  onClick={handleUploadClick}
                  style={{
                    cursor: "pointer",
                    padding: "12px",
                    border: "2px dashed #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: uploadedFile ? "#f8f9fa" : "#fff",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <Icon
                      icon="mingcute:upload-line"
                      style={{ marginRight: "8px" }}
                    />
                    {uploadedFile ? `Uploaded: ${uploadedFile.name}` : "Click to Upload"}
                  </span>
                </div>

                {/* File Info for uploaded files */}
                {uploadedFile && (
                  <div
                    className="file-info-container"
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                          {uploadedFile.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatFileSize(uploadedFile.size)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteFile}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                        }}
                        title="Delete file"
                      >
                        <Icon icon="mdi:delete-outline" style={{ fontSize: "20px" }} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-text">
                  {getFileSizeInfo()}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="type-heading-wrapper">
              <h6 className="type-heading">Add New Product</h6>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
              >
                <div style={{ flex: 2 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    style={{ width: "100%" }}
                    value={newProduct.name}
                    onChange={(e) =>
                      handleNewProductChange("name", e.target.value)
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    style={{ width: "100%" }}
                    value={newProduct.price}
                    onChange={(e) =>
                      handleNewProductChange("price", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    style={{ width: "100%" }}
                    value={newProduct.quantity}
                    onChange={(e) =>
                      handleNewProductChange("quantity", e.target.value)
                    }
                    min="1"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Total (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    style={{ width: "100%" }}
                    value={newProduct.total}
                    disabled
                  />
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                  <button
                    className="btn-primary"
                    style={{ marginTop: "-30px" }}
                    onClick={handleAddProduct}
                    disabled={!newProduct.name.trim() || !newProduct.price}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {products.length > 0 && (
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Product Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>₹ {product.price}</td>
                      <td>{product.quantity}</td>
                      <td>₹ {product.total}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            padding: "2px 6px",
                            border: "none",
                            background: "none",
                          }}
                        >
                          <Icon
                            icon="mdi:delete-outline"
                            style={{ fontSize: "18px", color: "#dc3545" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="form-group">
            <div className="type-heading-wrapper">
              <h6 className="type-heading">Additional Charges</h6>
            </div>
            <div className="additional-flex">
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="form-switch switch-success d-flex align-items-center gap-3">
                    <input
                      style={{ marginTop: "0px" }}
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switch1"
                      defaultChecked={true}
                      checked={additionalCharges.shipping.enabled}
                      onChange={() => handleChargeToggle("shipping")}
                    />
                  </div>
                  <Icon style={{ fontSize: "22px" }} icon="la:shipping-fast" />
                  Shipping
                </label>
                {additionalCharges.shipping.enabled && (
                  <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                    <input
                      type="number"
                      placeholder="Enter shipping amount"
                      style={{ width: "200px" }}
                      value={additionalCharges.shipping.amount}
                      onChange={(e) =>
                        handleChargeChange("shipping", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <div className="form-switch switch-success d-flex align-items-center gap-3">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      style={{ marginTop: "0px" }}
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switch1"
                      defaultChecked={true}
                      checked={additionalCharges.discount.enabled}
                      onChange={() => handleChargeToggle("discount")}
                    />
                    <Icon
                      style={{ fontSize: "22px" }}
                      icon="ic:outline-discount"
                    />
                    Discount
                  </label>
                </div>

                {additionalCharges.discount.enabled && (
                  <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                    <input
                      type="number"
                      placeholder="Enter discount amount"
                      style={{ width: "200px" }}
                      value={additionalCharges.discount.amount}
                      onChange={(e) =>
                        handleChargeChange("discount", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <div className="form-switch switch-success d-flex align-items-center gap-3">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      style={{ marginTop: "0px" }}
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="switch1"
                      defaultChecked={true}
                      checked={additionalCharges.tax.enabled}
                      onChange={() => handleChargeToggle("tax")}
                    />
                    <Icon
                      style={{ fontSize: "22px" }}
                      icon="tabler:receipt-tax"
                    />
                    % Tax
                  </label>
                </div>

                {additionalCharges.tax.enabled && (
                  <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                    <input
                      type="number"
                      placeholder="Enter tax percentage"
                      style={{ width: "200px" }}
                      value={additionalCharges.tax.percentage}
                      onChange={(e) =>
                        handleChargeChange("tax", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="type-heading-wrapper">
              <Icon
                style={{ fontSize: "22px", marginRight: "10px" }}
                icon="fluent-mdl2:payment-card"
              />
              <h6 className="type-heading">Payment Summary</h6>
            </div>

            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>Subtotal:</span>
                <span>₹ 0.00</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  borderTop: "1px solid #ddd",
                  paddingTop: "10px",
                }}
              >
                <span>Total:</span>
                <span>₹ 0.00</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Caption</h6>
        </div>
        <div className="textarea-container">
          <div className="new-row">
            <div className="formatting-toolbar">
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormatText("bold")}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormatText("italic")}
                title="Italic"
              >
                <em>𝑰</em>
              </button>
              <div className="emoji-wrapper" ref={emojiRef}>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => setEmojiOpen((prev) => !prev)}
                  title="Insert Emoji"
                >
                  😊
                </button>

                {/* Emoji Popup */}
                {emojiOpen && (
                  <div className="emoji-popup">
                    <div className="emoji-popup-content">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width="100%"
                        height="350px"
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        previewConfig={{
                          showPreview: false,
                        }}
                      />
                    </div>
                    <div className="emoji-popup-arrow"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Inline variable input section */}
            <div
              className="variable-input-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: "10px",
              }}
            >
              <input
                type="text"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                placeholder="Variable name"
                className="variable-input"
                style={{
                  padding: "6px 8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "150px",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && variableName.trim()) {
                    handleAddVariableClick();
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddVariableClick}
                disabled={!variableName.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                }}
              >
                <Icon style={{ fontSize: "18px" }} icon="ic:baseline-plus" />
                Add Variable
              </button>
            </div>
          </div>

          <textarea
            style={{ height: "150px" }}
            rows="4"
            value={formData.bodyText}
            onChange={(e) => {
              if (e.target.value.length <= 950) {
                handleBodyTextChange(e.target.value);
              }
            }}
            maxLength={950}
            className="form-control"
          ></textarea>

          <small>{formData.bodyText.length} / 950</small>
        </div>
      </div>
    </>
  );
};

export default WhatsAppPayType;