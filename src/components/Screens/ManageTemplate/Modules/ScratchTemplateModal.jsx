// ScratchTemplateModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "./../ManageTemplate.css";
import InteractiveActions from "./InteractiveActions";
import CarouselConfig from "./CarouselConfig";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";
import { TextBolder, TextItalic, X } from "@phosphor-icons/react";
import EmojiPicker from "emoji-picker-react";

export default function ScratchTemplateModal({
  onClose,
  onSave,
  copyMode = false,
  initialData = null,
  templateData = null,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    templateName: initialData?.templateName || "",
    category: initialData?.category || "",
    language: initialData?.language || "",
    templateType: initialData?.templateType || "text",
    erpCategory: initialData?.erpCategory || "",
    body: initialData?.body || "",
    interactiveActions: initialData?.interactiveActions || "",
    templateFooter: initialData?.templateFooter || "",
    expirationTime: initialData?.expirationTime || "",
    carouselType: initialData?.carouselType || "",
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const [showCarouselButtonConfig, setShowCarouselButtonConfig] =
    useState(false);

  // Carousel specific states
  const [carouselItems, setCarouselItems] = useState([]);
  const [carouselButtons, setCarouselButtons] = useState([
    { type: "quickReply", enabled: false, label: "Add Quick Reply" },
    { type: "callToAction", enabled: false, label: "Add Call To Action" },
    { type: "url", enabled: false, label: "Add URL" },
  ]);

  // Carousel interactive actions state
  const [carouselInteractiveData, setCarouselInteractiveData] = useState({
    quickReply: { title: "" },
    callToAction: { title: "", phoneNumber: "" },
    url: { title: "", url: "" },
  });

  const deleteCustomAttribute = (attributeName) => {
    setCustomAttributes((prev) =>
      prev.filter((attr) => attr.name !== attributeName)
    );
    setVariables((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.filter((variable) => variable !== attributeName);
    });
    enqueueSnackbar(`Attribute ${attributeName} deleted successfully`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const [variables, setVariables] = useState(
    templateData?.variables || initialData?.variables || []
  );
  const [selectedFlow, setSelectedFlow] = useState(
    initialData?.selectedFlow || ""
  );
  const [showPreview, setShowPreview] = useState(true);
  const [showAddVariable, setShowAddVariable] = useState(false);
  const [showVariablePopup, setShowVariablePopup] = useState(false);
  const [varName, setVarName] = useState("");
  const [varValue, setVarValue] = useState("");
  const [selectedActions, setSelectedActions] = useState(
    initialData?.selectedActions || []
  );
  const [ctaList, setCtaList] = useState([]);
  const [quickReplies, setQuickReplies] = useState(
    initialData?.quickReplies || []
  );
  const [errors, setErrors] = useState({});
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [searchAttribute, setSearchAttribute] = useState("");
  const [customAttributes, setCustomAttributes] = useState([]);

  const emojiRef = useRef(null);
  const variablePopupRef = useRef(null);
  const fileInputRef = useRef(null);

  const defaultAttributes = [];

  // File upload configuration
  const fileConfig = {
    image: {
      accept: "image/*",
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ["png", "jpg", "jpeg", "gif", "webp"],
    },
    video: {
      accept: "video/*",
      maxSize: 16 * 1024 * 1024,
      allowedTypes: ["mp4", "avi", "mov", "wmv"],
    },
    file: {
      accept: "*/*",
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ["pdf", "doc", "docx", "txt", "xlsx"],
    },
  };

  // Expiration time options
  const expirationOptions = [
    { value: "1", label: "1 minute" },
    { value: "3", label: "3 minutes" },
    { value: "5", label: "5 minutes" },
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
  ];

  // Combine default and custom attributes
  const allAttributes = [...defaultAttributes, ...customAttributes];

  const handleUpdateCta = (updatedCtaList) => {
    setCtaList(updatedCtaList);
  };

  // Filter attributes based on search
  const filteredAttributes = allAttributes.filter(
    (attr) =>
      attr.name.toLowerCase().includes(searchAttribute.toLowerCase()) ||
      (attr.displayName &&
        attr.displayName
          .toLowerCase()
          .includes(searchAttribute.toLowerCase())) ||
      (attr.value &&
        String(attr.value)
          .toLowerCase()
          .includes(searchAttribute.toLowerCase()))
  );

  // Show carousel button config when carousel type is selected
  useEffect(() => {
    if (formData.templateType === "Carousel") {
      setShowCarouselButtonConfig(true);
      setFormData((prev) => ({
        ...prev,
        category: "Marketing",
        carouselType: prev.carouselType || "Image",
      }));
    } else {
      setShowCarouselButtonConfig(false);
      setFormData((prev) => ({
        ...prev,
        carouselType: "",
      }));
    }

    // Clear file when template type changes
    if (
      !["image", "video", "file"].includes(formData.templateType.toLowerCase())
    ) {
      handleRemoveFile();
    }
  }, [formData.templateType]);

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
      if (
        variablePopupRef.current &&
        !variablePopupRef.current.contains(e.target) &&
        !e.target.closest(".add-variable-btn")
      ) {
        setShowVariablePopup(false);
        setSearchAttribute("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeCarouselItem = (id) => {
    setCarouselItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove && itemToRemove.preview) {
        URL.revokeObjectURL(itemToRemove.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Initialize form data when copying
  useEffect(() => {
    if (copyMode && initialData) {
      setFormData({
        templateName: initialData.templateName || "",
        category: initialData.category || "",
        language: initialData.language || "",
        templateType: initialData.templateType || "text",
        erpCategory: initialData.erpCategory || "",
        body: initialData.body || "",
        interactiveActions: initialData.interactiveActions || "",
        templateFooter: initialData.templateFooter || "",
        expirationTime: initialData.expirationTime || "",
        carouselType: initialData.carouselType || "",
      });

      if (initialData.selectedFile) {
        setSelectedFile(initialData.selectedFile);
        setFileType(
          initialData.fileType || getFileType(initialData.selectedFile)
        );
        if (
          (initialData.fileType === "image" ||
            initialData.fileType === "video") &&
          initialData.selectedFile
        ) {
          try {
            const newPreviewUrl = URL.createObjectURL(initialData.selectedFile);
            setFilePreview(newPreviewUrl);
          } catch (e) { }
        }
      }

      setVariables(initialData.variables || []);
      setSelectedActions(initialData.selectedActions || []);
      setCtaList(initialData.ctaList || []);
      setQuickReplies(initialData.quickReplies || []);
      setSelectedFlow(initialData.selectedFlow || "");

      if (initialData.templateType === "Carousel") {
        setCarouselButtons(
          initialData.carouselButtons || [
            { type: "quickReply", enabled: false, label: "Add Quick Reply" },
            {
              type: "callToAction",
              enabled: false,
              label: "Add Call To Action",
            },
            { type: "url", enabled: false, label: "Add URL" },
          ]
        );
        setCarouselItems(initialData.carouselItems || []);
        setCarouselInteractiveData(
          initialData.carouselInteractiveData || {
            quickReply: { title: "" },
            callToAction: { title: "", phoneNumber: "" },
            url: { title: "", url: "" },
          }
        );
      }
    }
  }, [copyMode, initialData]);

  // Handle file selection for non-carousel templates
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const currentFileType =
      formData.templateType.toLowerCase() === "text"
        ? getFileType(file)
        : formData.templateType.toLowerCase();

    const config = fileConfig[currentFileType];
    if (!config) {
      enqueueSnackbar("Invalid file type for selected template", {
        variant: "error",
      });
      return;
    }

    if (file.size > config.maxSize) {
      enqueueSnackbar(
        `File size too large. Maximum ${config.maxSize / 1024 / 1024
        }MB allowed`,
        { variant: "error" }
      );
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!config.allowedTypes.includes(fileExtension)) {
      enqueueSnackbar(`Allowed types: ${config.allowedTypes.join(", ")}`, {
        variant: "error",
      });
      return;
    }

    setSelectedFile(file);
    setFileType(currentFileType);

    if (currentFileType === "image" || currentFileType === "video") {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }

    enqueueSnackbar(`File "${file.name}" selected successfully`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  // Remove selected file
  const handleRemoveFile = () => {
    if (filePreview) {
      try {
        URL.revokeObjectURL(filePreview);
      } catch (e) { }
    }
    setSelectedFile(null);
    setFilePreview(null);
    setFileType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to determine file type
  const getFileType = (file) => {
    if (!file || !file.type) return "file";
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "file";
  };

  // Get accepted file types based on template type
  const getAcceptedFileTypes = () => {
    const templateType = formData.templateType.toLowerCase();
    if (templateType === "text") return "*/*";
    return fileConfig[templateType]?.accept || "*/*";
  };

  // Category change effects
  useEffect(() => {
    if (formData.category === "Marketing") {
      setFormData((prev) => ({
        ...prev,
        templateFooter: "Type stop to Unsubscribe",
      }));
    } else if (formData.category === "Authentication") {
      setFormData((prev) => ({
        ...prev,
        templateFooter: "",
        templateType: "Text",
        body:
          prev.body === "" ||
            !prev.body.includes("[{OTP}] is your verification code")
            ? "[{OTP}] is your verification code. For your security, do not share this code."
            : prev.body,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        templateFooter:
          prev.templateFooter === "Thank You for Choosing Engagenest"
            ? ""
            : prev.templateFooter,
      }));
    }

    if (formData.category === "Utility") {
      if (!copyMode) {
        setFormData((prev) => ({
          ...prev,
          templateType: "Text",
          carouselType: "",
        }));
      }
    }
  }, [formData.category, copyMode]);

  useEffect(() => {
    if (templateData) {
      setFormData({
        templateName: templateData.templateName || "",
        category: templateData.category || "",
        language: templateData.language || "",
        templateType: templateData.templateType || "text",
        erpCategory: templateData.erpCategory || "",
        body: templateData.body || "",
        interactiveActions: templateData.interactiveActions || "",
        templateFooter: templateData.templateFooter || "",
        expirationTime: templateData.expirationTime || "",
        carouselType: templateData.carouselType || "",
      });
      setVariables(templateData.variables || []);
    }
  }, [templateData]);

  // Add emoji to text
  const onEmojiClick = (emojiObject) => {
    const textarea = document.querySelector('textarea[name="body"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText =
        formData.body.substring(0, start) +
        emojiObject.emoji +
        formData.body.substring(end);

      setFormData((prev) => ({
        ...prev,
        body: newText,
      }));

      if (errors.body) {
        setErrors((prev) => ({ ...prev, body: undefined }));
      }
    }
    setEmojiOpen(false);
  };

  const bodyLength = formData.body?.trim().length || 0;

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    const maxChars = 1024;

    if (!formData.templateName.trim()) {
      newErrors.templateName = "Template name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // File validation for non-text templates
    if (
      formData.templateType.toLowerCase() !== "text" &&
      !selectedFile &&
      !filePreview &&
      formData.templateType !== "Carousel"
    ) {
      newErrors.file = `${formData.templateType} file is required`;
    }

    // Carousel validation
    if (formData.templateType === "Carousel") {
      if (!formData.carouselType) {
        newErrors.carouselType = "Carousel type is required";
      }

      const enabledButtons = carouselButtons.filter(
        (btn) => btn.enabled
      ).length;
      if (enabledButtons !== 2) {
        newErrors.carouselButtons =
          "For carousel type, exactly 2 buttons must be selected";
      }

      if (carouselItems.length === 0) {
        newErrors.carouselItems = "Please add at least one item to carousel";
      }

      // Validate carousel interactive data
      const enabledButtonTypes = carouselButtons
        .filter((btn) => btn.enabled)
        .map((btn) => btn.type);

      enabledButtonTypes.forEach((buttonType) => {
        const data = carouselInteractiveData[buttonType];
        if (
          buttonType === "quickReply" &&
          (!data.title || !data.title.trim())
        ) {
          newErrors.carouselQuickReply = "Quick Reply button title is required";
        }
        if (buttonType === "callToAction") {
          if (!data.title || !data.title.trim()) {
            newErrors.carouselCallToActionTitle =
              "Call to Action button title is required";
          }
          if (!data.phoneNumber || !data.phoneNumber.trim()) {
            newErrors.carouselCallToActionPhone =
              "Phone number is required for Call to Action";
          } else if (!validatePhoneNumber(data.phoneNumber)) {
            newErrors.carouselCallToActionPhone =
              "Please enter a valid phone number with country code (e.g., +123456789012)";
          }
        }
        if (buttonType === "url") {
          if (!data.title || !data.title.trim()) {
            newErrors.carouselUrlTitle = "URL button title is required";
          }
          if (!data.url || !data.url.trim()) {
            newErrors.carouselUrl = "URL is required";
          } else if (!isValidUrl(data.url)) {
            newErrors.carouselUrl = "Please enter a valid URL";
          }
        }
      });

      // Body validation for carousel
      if (!formData.body || formData.body.trim().length === 0) {
        newErrors.body = "Message body is required for carousel";
      }
    }

    if (!formData.body || formData.body.trim().length === 0) {
      newErrors.body = "Message body is required";
    } else if (formData.body.length > maxChars) {
      newErrors.body = `Message body cannot exceed ${maxChars} characters`;
    }

    if (formData.templateFooter && formData.templateFooter.length > 60) {
      newErrors.templateFooter = "Footer cannot exceed 60 characters";
    }

    // Variable name validation
    if (showAddVariable && varName.trim()) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        newErrors.varName =
          "Variable name can only contain letters, numbers, and underscores, and must start with a letter or underscore";
      }
      if (variables.includes(varName)) {
        newErrors.varName = "Variable name already exists";
      }
    }

    // Interactive actions validation (only if not Authentication and not Carousel)
    if (
      formData.category !== "Authentication" &&
      formData.templateType !== "Carousel"
    ) {
      if (selectedActions.includes("callToAction") && ctaList.length === 0) {
        newErrors.ctaList =
          "At least one call-to-action is required when Call to Action is selected";
      }

      if (selectedActions.includes("quickReply") && quickReplies.length === 0) {
        newErrors.quickReplies =
          "At least one quick reply is required when Quick Reply is selected";
      }

      if (selectedActions.includes("flows") && !selectedFlow) {
        newErrors.flows = "Please select a flow when Flows is selected";
      }

      // CTA and quick reply item validations
      ctaList.forEach((cta, index) => {
        if (!cta.title?.trim()) {
          newErrors[`ctaTitle_${index}`] = "CTA title is required";
        }
        if (!cta.url?.trim()) {
          newErrors[`ctaUrl_${index}`] = "CTA URL is required";
        } else if (!isValidUrl(cta.url)) {
          newErrors[`ctaUrl_${index}`] = "Please enter a valid URL";
        }
      });

      quickReplies.forEach((reply, index) => {
        if (!reply.trim()) {
          newErrors[`quickReply_${index}`] = "Quick reply text is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Validate phone number with country code
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (action = "submit") => {
    // if (!validateForm()) {
    //   enqueueSnackbar("Please fix the validation errors before submitting", {
    //     variant: "error",
    //     autoHideDuration: 3000,
    //   });
    //   return;
    // }

    const templateData = {
      ...formData,
      variables,
      selectedFile: selectedFile || initialData?.selectedFile,
      filePreview: filePreview || initialData?.filePreview,
      fileType: fileType || initialData?.fileType,
      carouselButtons:
        formData.templateType === "Carousel" ? carouselButtons : [],
      carouselItems: formData.templateType === "Carousel" ? carouselItems : [],
      carouselInteractiveData:
        formData.templateType === "Carousel" ? carouselInteractiveData : {},
      selectedActions:
        formData.category === "Authentication" ||
          formData.templateType === "Carousel"
          ? []
          : selectedActions,
      ctaList:
        formData.category === "Authentication" ||
          formData.templateType === "Carousel"
          ? []
          : ctaList,
      quickReplies:
        formData.category === "Authentication" ||
          formData.templateType === "Carousel"
          ? []
          : quickReplies,
      selectedFlow:
        formData.category === "Authentication" ||
          formData.templateType === "Carousel"
          ? ""
          : selectedFlow,
      status: action === "draft" ? "DRAFT" : "APPROVED",
      quality: "UNKNOWN",
      type: formData.templateType || "text",
    };

    enqueueSnackbar(
      copyMode
        ? "Template copied successfully!"
        : "Template created successfully!",
      {
        variant: "success",
        autoHideDuration: 2000,
      }
    );

    onSave(templateData);
  };

  const handleActionSelection = (actionType) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionType)) {
        return prev.filter((action) => action !== actionType);
      }
      if (actionType === "flows") {
        return ["flows"];
      }
      if (actionType === "callToAction" || actionType === "quickReply") {
        return prev.filter((action) => action !== "flows").concat(actionType);
      }
      return [...prev, actionType];
    });

    // Clear related errors when action is deselected
    if (errors.ctaList && actionType === "callToAction") {
      setErrors((prev) => ({ ...prev, ctaList: undefined }));
    }
    if (errors.quickReplies && actionType === "quickReply") {
      setErrors((prev) => ({ ...prev, quickReplies: undefined }));
    }
    if (errors.flows && actionType === "flows") {
      setErrors((prev) => ({ ...prev, flows: undefined }));
    }
  };

  const handleFlowChange = (flow) => {
    setSelectedFlow(flow);
    if (errors.flows) {
      setErrors((prev) => ({ ...prev, flows: undefined }));
    }
  };

  const addCallToAction = (cta) => {
    if (!cta.title?.trim() || !cta.url?.trim()) {
      enqueueSnackbar("CTA title and URL are required", { variant: "error" });
      return;
    }

    // if (!isValidUrl(cta.url)) {
    //   enqueueSnackbar("Please enter a valid URL for CTA", { variant: "error" });
    //   return;
    // }

    setCtaList((prev) => [...prev, cta]);
    if (errors.ctaList) {
      setErrors((prev) => ({ ...prev, ctaList: undefined }));
    }
  };

  const removeCallToAction = (id) => {
    setCtaList((prev) => prev.filter((cta) => cta.id !== id));
  };

  const addQuickReply = (reply) => {
    if (!reply.trim()) {
      enqueueSnackbar("Quick reply text is required", { variant: "error" });
      return;
    }

    setQuickReplies((prev) => [...prev, reply]);
    if (errors.quickReplies) {
      setErrors((prev) => ({ ...prev, quickReplies: undefined }));
    }
  };

  const removeQuickReply = (index) => {
    setQuickReplies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBodyChange = (e) => {
    let { value } = e.target;
    const maxChars = 1024;

    if (value.length > maxChars) {
      value = value.slice(0, maxChars);
    }

    setFormData((prev) => ({
      ...prev,
      body: value,
    }));

    // Clear body error when user starts typing valid non-empty text
    if (errors.body) {
      if (value.trim().length > 0 && value.length <= maxChars) {
        setErrors((prev) => ({ ...prev, body: undefined }));
      } else {
        if (value.trim().length === 0) {
          setErrors((prev) => ({ ...prev, body: "Message body is required" }));
        } else if (value.length > maxChars) {
          setErrors((prev) => ({
            ...prev,
            body: `Message body cannot exceed ${maxChars} characters`,
          }));
        }
      }
    }
  };

  // Add custom attribute in popup
  const addCustomAttribute = () => {
    if (!varName.trim()) {
      enqueueSnackbar("Attribute name cannot be empty", { variant: "error" });
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
      enqueueSnackbar(
        "Attribute name can only contain letters, numbers, and underscores, and must start with a letter or underscore",
        {
          variant: "error",
          autoHideDuration: 4000,
        }
      );
      return;
    }

    if (allAttributes.some((attr) => attr.name === varName)) {
      enqueueSnackbar("Attribute name already exists", { variant: "error" });
      return;
    }

    const newAttribute = {
      name: varName,
      displayName: varName.charAt(0).toUpperCase() + varName.slice(1),
      value: varValue !== "" ? varValue : undefined,
    };

    setCustomAttributes((prev) => [...prev, newAttribute]);
    setVarName("");
    setVarValue("");

    enqueueSnackbar(`Attribute ${varName} added successfully`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  // Add variable from popup (select existing attribute)
  const addVariableFromPopup = (attribute) => {
    const variableName = attribute.name;
    const variableToInsert = `{{${variableName}}}`;

    const newBodyLength = (formData.body + variableToInsert).length;
    const maxChars = 1024;

    if (newBodyLength > maxChars) {
      const remainingChars = maxChars - formData.body.length;
      enqueueSnackbar(
        `Cannot add variable. Only ${remainingChars} characters remaining.`,
        { variant: "error", autoHideDuration: 3000 }
      );
      return;
    }

    if (variables.includes(variableName)) {
      enqueueSnackbar("Variable already exists", { variant: "error" });
      return;
    }

    setVariables((prev) => [...prev, variableName]);
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variableToInsert,
    }));

    setShowVariablePopup(false);
    setSearchAttribute("");

    enqueueSnackbar(`Variable ${attribute.displayName} added successfully`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  // Manual variable addition
  const addVariable = () => {
    if (!varName.trim()) {
      enqueueSnackbar("Variable name cannot be empty", { variant: "error" });
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
      enqueueSnackbar(
        "Variable name can only contain letters, numbers, and underscores, and must start with a letter or underscore",
        {
          variant: "error",
          autoHideDuration: 4000,
        }
      );
      return;
    }

    if (variables.includes(varName)) {
      enqueueSnackbar("Variable name already exists", { variant: "error" });
      return;
    }

    const variableToInsert = `{{${varName}}}`;
    const newBodyLength = (formData.body + variableToInsert).length;
    const maxChars = 1024;

    if (newBodyLength > maxChars) {
      const remainingChars = maxChars - formData.body.length;
      enqueueSnackbar(
        `Cannot add variable. Only ${remainingChars} characters remaining.`,
        { variant: "error", autoHideDuration: 3000 }
      );
      return;
    }

    setVariables((prev) => [...prev, varName]);
    setVarName("");
    setShowAddVariable(false);
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variableToInsert,
    }));

    if (errors.varName) {
      setErrors((prev) => ({ ...prev, varName: undefined }));
    }
  };

  const removeVariable = (index) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (type) => {
    const textarea = document.querySelector('textarea[name="body"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = formData.body.substring(start, end);
      const before = formData.body.substring(0, start);
      const after = formData.body.substring(end);

      let formatted;
      if (type === "bold") {
        formatted = `${before}**${selected}**${after}`;
      } else if (type === "italic") {
        formatted = `${before}_${selected}_${after}`;
      }

      setFormData((prev) => ({
        ...prev,
        body: formatted,
      }));
    }
  };

  const charCount = formData.body.trim().length;
  const maxChars = 1024;

  // Template type options based on category
  const getTemplateTypeOptions = () => {
    const baseOptions = [
      { value: "Text", label: "Text" },
      { value: "Image", label: "Image" },
      { value: "Video", label: "Video" },
      { value: "File", label: "File" },
      { value: "Carousel", label: "Carousel" }, // Added as 5th default option
    ];

    return baseOptions;
  };

  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "1200px" }}>
        <div className="modal-header">
          <h3 className="d-flex align-items-center">
            <div>
              <Icon className="modal-icon-adjustments" icon="tabler:template" />
            </div>
            {copyMode ? "Copy Template" : "Create New Template"}
          </h3>
          <button type="button" className="btn-close" onClick={onClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body">
          <div className={showPreview ? "modal-grid" : "modal-grid-single"}>
            {/* Form Section */}
            <div className="form-section">
              <div className="form-card">
                <div className="form-card-content">
                  {/* Basic Info */}
                  <div className="form-grid">
                    <div>
                      <label className="form-label">
                        Template Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter template name"
                        value={formData.templateName}
                        name="templateName"
                        onChange={handleInputChange}
                        className={`form-control ${errors.templateName ? "error" : ""
                          }`}
                      />
                      {errors.templateName && (
                        <div className="error-message">
                          {errors.templateName}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">
                        Category <span className="required-star">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={formData.templateType === "Carousel"} // Remove this line
                        className={`form-select ${errors.category ? "error" : ""
                          } ${formData.templateType === "Carousel"
                            ? "disabled-field"
                            : ""
                          }`}
                        style={{
                          cursor:
                            formData.templateType === "Carousel"
                              ? "not-allowed"
                              : "pointer",
                        }} // Remove this style
                      >
                        <option value="">Select category</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Utility">Utility</option>
                        <option value="Authentication">Authentication</option>
                      </select>
                      {errors.category && (
                        <div className="error-message">{errors.category}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="form-label">Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select language</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Template Type</label>
                      <select
                        name="templateType"
                        value={formData.templateType}
                        onChange={handleInputChange}
                        disabled={formData.category === "Authentication"}
                        className={`form-select ${formData.category === "Authentication"
                          ? "disabled-field"
                          : ""
                          }`}
                        style={{
                          cursor:
                            formData.category === "Authentication"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <option value="">Select type</option>
                        {getTemplateTypeOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Carousel Type */}
                  {formData.templateType === "Carousel" && (
                    <div style={{ marginBottom: "24px" }}>
                      <label className="form-label">
                        Carousel Type <span className="required-star">*</span>
                      </label>
                      <select
                        name="carouselType"
                        value={formData.carouselType}
                        onChange={handleInputChange}
                        className={`form-select ${errors.carouselType ? "error" : ""
                          }`}
                      >
                        <option value="">Select carousel type</option>
                        <option value="Image">Image</option>
                        <option value="Video">Video</option>
                      </select>
                      {errors.carouselType && (
                        <div className="error-message">
                          {errors.carouselType}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: "24px" }}>
                    <label className="form-label">ERP Category</label>
                    <select
                      name="erpCategory"
                      value={formData.erpCategory}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select ERP category</option>
                      <option value="None">None</option>
                      <option value="Woo Commerce">Woo Commerce</option>
                      <option value="Flow">Flow</option>
                      <option value="Spopify">Spopify</option>
                    </select>
                  </div>

                  <div className="form-divider" />

                  {/* Message Body */}
                  <div style={{ marginBottom: "24px" }}>
                    <label className="section-title">Message Body</label>
                    <p className="section-description">
                      Make your messages personal using variables and get more
                      replies!
                    </p>

                    <div className="variables-container">
                      <button
                        onClick={() => setShowVariablePopup(true)}
                        className="btn-primary d-flex align-items-center gap-2"
                      >
                        <Icon
                          style={{ fontSize: "20px" }}
                          icon="mingcute:add-line"
                        />
                        Add Variable
                      </button>
                    </div>

                    {showVariablePopup && (
                      <div className="modal-overlay variable-popup-overlay">
                        <div
                          className="variable-popup-content"
                          ref={variablePopupRef}
                        >
                          <div className="variable-popup-header">
                            <h3 className="modal-title">Select Attribute</h3>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowVariablePopup(false);
                                setSearchAttribute("");
                              }}
                            >
                              <Icon icon="mingcute:close-line" />
                            </button>
                          </div>

                          <div className="variable-popup-body">
                            <div className="search-container">
                              <input
                                type="text"
                                placeholder="Search attributes..."
                                value={searchAttribute}
                                onChange={(e) =>
                                  setSearchAttribute(e.target.value)
                                }
                                className="search-input"
                              />
                            </div>

                            <div className="add-attribute-section">
                              <div className="add-attribute-form">
                                <input
                                  type="text"
                                  placeholder="Enter new attribute name"
                                  value={varName}
                                  onChange={(e) => setVarName(e.target.value)}
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && addCustomAttribute()
                                  }
                                  className="attribute-input"
                                />
                                <input
                                  type="number"
                                  placeholder="Enter Value"
                                  value={varValue}
                                  onChange={(e) => setVarValue(e.target.value)}
                                  className="attribute-input"
                                />
                                <button
                                  onClick={addCustomAttribute}
                                  className="btn-primary add-attribute-btn"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>

                            <div className="attributes-grid-large">
                              {filteredAttributes.map((attribute) => {
                                const variableToInsert = `{{${attribute.name}}}`;
                                const wouldExceedLimit = (formData.body + variableToInsert).length > 1024;
                                const isDisabled = wouldExceedLimit || variables.includes(attribute.name);

                                return (
                                  <div
                                    key={attribute.name}
                                    className={`attribute-pill ${isDisabled ? 'disabled' : ''}`}
                                    onClick={() => !isDisabled && addVariableFromPopup(attribute)}
                                    title={wouldExceedLimit ? "Adding this variable would exceed character limit" : ""}
                                  >
                                    <span className="attribute-text">
                                      {attribute.name}
                                    </span>
                                    {!defaultAttributes.some(
                                      (da) => da.name === attribute.name
                                    ) && (
                                        <button
                                          className="attribute-pill-delete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCustomAttribute(attribute.name);
                                          }}
                                        >
                                          ×
                                        </button>
                                      )}
                                  </div>
                                );
                              })}
                            </div>

                            {filteredAttributes.length === 0 && (
                              <div className="no-attributes-found">
                                No attributes found matching "{searchAttribute}"
                              </div>
                            )}

                            <div className="pagination-container">
                              <div className="pagination">
                                <button className="pagination-btn">‹</button>
                                <span className="pagination-page">1</span>
                                <button className="pagination-btn">›</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="formatting-toolbar">
                      <button
                        type="button"
                        onClick={() => insertFormatting("bold")}
                        title="Bold"
                        className="format-btn"
                      >
                        <TextBolder size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("italic")}
                        title="Italic"
                        className="format-btn"
                      >
                        <TextItalic size={18} />
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
                        {emojiOpen && (
                          <div className="emoji-popup">
                            <div className="emoji-popup-content">
                              <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                width="100%"
                                height="350px"
                                searchDisabled={false}
                                skinTonesDisabled={true}
                                previewConfig={{ showPreview: false }}
                              />
                            </div>
                            <div className="emoji-popup-arrow"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <textarea
                      style={{
                        height: "120px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                      name="body"
                      rows="6"
                      placeholder={
                        formData.category === "Authentication"
                          ? "Authentication template body"
                          : "Template body"
                      }
                      value={formData.body}
                      onChange={handleBodyChange}
                      className={`form-control ${errors.body ? "error" : ""}`}
                    />

                    <div className="char-count">
                      {charCount} / {maxChars} characters{" "}
                      {errors.body && (
                        <div className="error-message">{errors.body}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-divider" />

                  {/* Carousel Config Component */}
                  {showCarouselButtonConfig && (
                    <CarouselConfig
                      formData={formData}
                      carouselItems={carouselItems}
                      setCarouselItems={setCarouselItems}
                      carouselButtons={carouselButtons}
                      setCarouselButtons={setCarouselButtons}
                      carouselInteractiveData={carouselInteractiveData}
                      setCarouselInteractiveData={setCarouselInteractiveData}
                      errors={errors}
                      setErrors={setErrors}
                      fileConfig={fileConfig}
                      enqueueSnackbar={enqueueSnackbar}
                    />
                  )}

                  {/* Interactive Actions (Hidden for Authentication and Carousel) */}
                  {formData.category !== "Authentication" &&
                    formData.templateType !== "Carousel" && (
                      <InteractiveActions
                        selectedActions={selectedActions}
                        onActionSelection={handleActionSelection}
                        ctaList={ctaList}
                        onUpdateCta={handleUpdateCta}
                        onAddCta={addCallToAction}
                        onRemoveCta={removeCallToAction}
                        quickReplies={quickReplies}
                        onAddQuickReply={addQuickReply}
                        onRemoveQuickReply={removeQuickReply}
                        selectedFlow={selectedFlow}
                        onFlowChange={handleFlowChange}
                        errors={errors}
                        isActionDropdownOpen={isActionDropdownOpen}
                        setIsActionDropdownOpen={setIsActionDropdownOpen}
                      />
                    )}

                  {/* Footer */}
                  {formData.category !== "Authentication" && (
                    <div style={{ marginBottom: "24px" }}>
                      <label className="form-label">
                        Template Footer (Optional)
                      </label>
                      <small className="small-text">
                        Footers are great to add any disclaimers or a thoughtful
                        P.S and only upto 60 characters are allowed.
                      </small>
                      <textarea
                        style={{
                          height: "50px",
                          cursor:
                            formData.category === "Marketing"
                              ? "not-allowed"
                              : "text",
                        }}
                        name="templateFooter"
                        rows="2"
                        placeholder="Template footer"
                        value={formData.templateFooter}
                        onChange={handleInputChange}
                        maxLength="60"
                        disabled={formData.category === "Marketing"}
                        className={`form-control ${errors.templateFooter ? "error" : ""
                          } ${formData.category === "Marketing"
                            ? "disabled-field"
                            : ""
                          }`}
                      />
                      {errors.templateFooter && (
                        <div className="error-message">
                          {errors.templateFooter}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expiration Time - Only for Authentication */}
                  {formData.category === "Authentication" && (
                    <div style={{ marginBottom: "24px" }}>
                      <label className="form-label">
                        Expiration Time (Optional)
                      </label>
                      <select
                        name="expirationTime"
                        value={formData.expirationTime}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select expiration time</option>
                        {expirationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* File Upload Section - Hidden for Carousel */}
                  {["image", "video", "file"].includes(
                    formData.templateType.toLowerCase()
                  ) &&
                    formData.templateType !== "Carousel" && (
                      <div style={{ marginBottom: "24px" }}>
                        <label className="form-label">
                          Attach {formData.templateType}{" "}
                          <span className="required-star">*</span>
                        </label>

                        {!selectedFile && !filePreview ? (
                          <div className="file-upload-area" style={{ border: "2px dashed grey", padding: "10px" }}> 
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept={getAcceptedFileTypes()}
                              className="file-input"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className="file-upload-label"
                            >
                              <div className="file-upload-content">
                                <Icon
                                  icon="bi:cloud-upload"
                                  style={{
                                    fontSize: "24px",
                                    color: "#6c757d",
                                    marginBottom: "12px",
                                  }}
                                />
                                <div className="file-upload-text">
                                  <strong>
                                    Choose {formData.templateType}
                                  </strong>
                                  <small>
                                    {formData.templateType === "image" &&
                                      "Allowed types: png, jpg, jpeg, gif, webp • Max size: 5MB"}
                                    {formData.templateType === "video" &&
                                      "Allowed types: mp4, avi, mov, wmv • Max size: 16MB"}
                                    {formData.templateType === "file" &&
                                      "Allowed types: pdf, doc, docx, txt, xlsx • Max size: 10MB"}
                                  </small>
                                </div>
                              </div>
                            </label>
                          </div>
                        ) : (
                          <div className="file-preview-container">
                            <div className="selected-file-info">
                              <div className="file-preview-content">
                                {(fileType === "image" ||
                                  formData.templateType.toLowerCase() ===
                                  "image") &&
                                  filePreview && (
                                    <img
                                      src={filePreview}
                                      alt="Preview"
                                      className="file-preview-image"
                                    />
                                  )}
                                {(fileType === "video" ||
                                  formData.templateType.toLowerCase() ===
                                  "video") &&
                                  filePreview && (
                                    <video
                                      controls
                                      className="file-preview-video"
                                    >
                                      <source
                                        src={filePreview}
                                        type={selectedFile?.type}
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                  )}
                                {(fileType === "file" ||
                                  formData.templateType.toLowerCase() ===
                                  "file") && (
                                    <div className="document-preview">
                                      <Icon
                                        icon="eva:file-text-fill"
                                        style={{
                                          fontSize: "48px",
                                          color: "#6c757d",
                                        }}
                                      />
                                    </div>
                                  )}

                                <div className="file-details">
                                  <div className="file-name">
                                    {selectedFile?.name ||
                                      (filePreview
                                        ? "File from copied template"
                                        : "No file")}
                                  </div>
                                  {selectedFile && (
                                    <div className="file-size">
                                      {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="remove-file-btn"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {errors.file && (
                          <div className="error-message">{errors.file}</div>
                        )}
                      </div>
                    )}

                  {/* Buttons */}
                  <div className="form-actions">
                    <button
                      onClick={() => handleSubmit("draft")}
                      className="btn-secondary"
                      type="button"
                    >
                      Save as draft
                    </button>
                    <button
                      onClick={() => handleSubmit("submit")}
                      className="btn-primary"
                      type="button"
                    >
                      {copyMode ? "Create Copy" : "Submit Template"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="preview-section">
                <div className="preview-header">
                  <h6 className="preview-title">Preview</h6>
                </div>

                <div className="preview-container">
                  <div className="phone-frame">
                    <div className="phone-notch" />
                    <div className="phone-screen">
                      <div className="phone-status-bar" />
                      <div className="phone-content">
                        <div className="chat-back">
                          {/* Carousel Preview */}
                          {formData.templateType === "Carousel" && carouselItems.length > 0 ? (
                            <div className="mobile-carousel-preview">

                              {/* Carousel container with navigation */}
                              <div className="carousel-container">
                                {/* Left Arrow - Show only if there are multiple items */}
                                {carouselItems.length > 1 && (
                                  <button
                                    className="carousel-arrow carousel-arrow-left"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const container = e.target
                                        .closest(".carousel-container")
                                        .querySelector(".carousel-items-wrapper");
                                      container.scrollBy({
                                        left: -188,
                                        behavior: "smooth",
                                      });
                                    }}
                                    title="Previous"
                                  >
                                    ‹
                                  </button>
                                )}

                                {/* Carousel Items Wrapper */}
                                <div
                                  className="carousel-items-wrapper"
                                  ref={(el) => {
                                    if (el) {
                                      el.onscroll = () => {
                                        const scrollLeft = el.scrollLeft;
                                        const itemWidth = 188;
                                        const activeIndex = Math.round(scrollLeft / itemWidth);
                                      };
                                    }
                                  }}
                                >
                                  {carouselItems.map((item, index) => (
                                    <div key={item.id} className="mobile-carousel-item">
                                      {formData.carouselType === "Image" ? (
                                        <img
                                          src={item.preview}
                                          alt={`Carousel item ${index + 1}`}
                                          className="mobile-preview-image"
                                        />
                                      ) : (
                                        <video controls className="mobile-preview-video">
                                          <source src={item.preview} type={item.file?.type} />
                                          Your browser does not support the video tag.
                                        </video>
                                      )}

                                      {/* Item details */}
                                      <div>
                                        {/* {item.headerText && (
                                          <div className="carousel-item-header">
                                            {item.headerText}
                                          </div>
                                        )} */}
                                        {item.body && (
                                          <div className="carousel-item-description">
                                            {item.body}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Right Arrow - Show only if there are multiple items */}
                                {carouselItems.length > 1 && (
                                  <button
                                    className="carousel-arrow carousel-arrow-right"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const container = e.target
                                        .closest(".carousel-container")
                                        .querySelector(".carousel-items-wrapper");
                                      container.scrollBy({
                                        left: 188,
                                        behavior: "smooth",
                                      });
                                    }}
                                    title="Next"
                                  >
                                    ›
                                  </button>
                                )}
                              </div>

                              {/* Carousel navigation dots */}
                              {/* {carouselItems.length > 1 && (
                                <div className="carousel-dots">
                                  {carouselItems.map((_, index) => (
                                    <div
                                      key={index}
                                      className={`carousel-dot ${index === 0 ? "active" : ""}`}
                                    />
                                  ))}
                                </div>
                              )} */}
                            </div>
                          ) : (
                            /* File Preview for non-carousel templates */
                            (selectedFile || filePreview) && (
                              <div className="mobile-file-preview">
                                {(fileType === "image" || formData.templateType.toLowerCase() === "image") &&
                                  filePreview && (
                                    <img
                                      src={filePreview}
                                      alt="Attachment"
                                      className="mobile-preview-image"
                                    />
                                  )}
                                {(fileType === "video" || formData.templateType.toLowerCase() === "video") &&
                                  filePreview && (
                                    <video controls className="mobile-preview-video">
                                      <source src={filePreview} type={selectedFile?.type} />
                                    </video>
                                  )}
                                {(fileType === "file" || formData.templateType.toLowerCase() === "file") && (
                                  <div className="mobile-document-preview">
                                    <Icon
                                      icon="eva:file-text-fill"
                                      style={{
                                        fontSize: "32px",
                                        color: "#6c757d",
                                      }}
                                    />
                                    <div className="mobile-file-name">
                                      {selectedFile?.name || "Document"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          )}

                          {/* Message Body */}
                          {formData.body ? (
                            formData.body
                              .split("\n")
                              .map((line, i) => (
                                <div key={i}>{line || "\u00A0"}</div>
                              ))
                          ) : (
                            <div className="placeholder-text">
                              
                            </div>
                          )}

                          {/* Expiration time inside message bubble for Authentication */}
                          {formData.category === "Authentication" && formData.expirationTime && (
                            <div className="expiration-inside-message">
                              <div className="expiration-separator"></div>
                              <div className="expiration-text">
                                Expires in: {
                                  expirationOptions.find(
                                    (opt) => opt.value === formData.expirationTime
                                  )?.label
                                }
                              </div>
                            </div>
                          )}

                          {/* Footer outside message bubble */}
                          {formData.templateFooter && formData.category !== "Authentication" && (
                            <div className="phone-footer">
                              {formData.templateFooter}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}