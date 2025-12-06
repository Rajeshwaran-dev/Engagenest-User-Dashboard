import React, { useState, useEffect } from "react";
import ModalBody from "./ModalBody";
import "../ChatbotFlowBuilder.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";

const WizardModal = ({ isOpen, onClose, onSave, nodeData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nodeName: nodeData?.label || "",
    type: "Text",
    triggerKeyword: [],
    newTriggerKeyword: "",
    assignAgent: "",

    // Text Type
    bodyText: "",
    footerText: "",
    hasVariables: false,

    // Catalog Type
    catalogHeaderType: "Text",
    catalogHeaderText: "",
    catalogBodyText: "",
    catalogFooterText: "",

    // Interactive Type
    interactiveType: "Button",
    headerType: "Text",
    headerText: "",
    interactiveBodyText: "",
    interactiveFooterText: "",
    buttons: [],
    listSections: [],

    // Media Type
    mediaType: "Image",
    imageSubType: "Static",
    videoSubType: "Static",
    documentSubType: "Static",
    caption: "",

    // Questionnaire Type
    questions: [],
    allowCouponUsage: false,

    // WhatsApp Pay Type
    whatsappPayType: "Products",
    products: [],

    // Validator Type
    validatorConditionSource: "Meta webhook payload",
    apiUrl: "",
    conditions: [],
    codeStructure: "",

    // Flow Type
    flowType: "Navigate",
    flowId: "",
    flowName: "",
    flowToken: "",
    screenId: "",

    // Notify settings
    enableNotify: false,
    intents: [], // Store intents from Follow-up Trigger step

    // Action step fields
    newCatalogName: "",
    selectedCatalog: "",
    buttonTitle: "",
    selectedFlow: "",
  });

  const [chatbotKeywords, setChatbotKeywords] = useState([]);
  const [stepValidators, setStepValidators] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const validateTextType = () => {
    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Body Text is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
    return true;
  };

  const validateCatalogType = () => {
    if (!formData.catalogHeaderText?.trim()) {
      enqueueSnackbar("Header Text is required for Catalog type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Body Content is required for Catalog type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
    return true;
  };

  const validateFlowType = () => {
    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Body Text is required for Flow type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
    return true;
  };

  const validateInteractiveType = () => {
    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Body Text is required for Interactive type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    // Check for media upload in Interactive type with headers
    if (formData.headerType === "Image") {
      if (!formData.uploadedImage && !formData.imageUrl) {
        enqueueSnackbar("Please upload an image", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.headerType === "Video") {
      if (!formData.uploadedVideo && !formData.videoUrl) {
        enqueueSnackbar("Please upload a video", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.headerType === "Document") {
      if (!formData.uploadedDocument && !formData.documentUrl) {
        enqueueSnackbar("Please upload a document", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.interactiveType === "Button") {
      for (let i = 0; i < formData.buttons.length; i++) {
        if (!formData.buttons[i].title?.trim()) {
          enqueueSnackbar(`Button ${i + 1} title is required`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }
      }
    }

    if (formData.interactiveType === "List") {
      if (!formData.listSections || formData.listSections.length === 0) {
        enqueueSnackbar("At least one list section is required", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      for (let i = 0; i < formData.listSections.length; i++) {
        const section = formData.listSections[i];
        if (!section.title?.trim()) {
          enqueueSnackbar(`Section ${i + 1} title is required`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }

        if (!section.rows || section.rows.length === 0) {
          enqueueSnackbar(`Section ${i + 1} must have at least one row`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }

        for (let j = 0; j < section.rows.length; j++) {
          if (!section.rows[j].title?.trim()) {
            enqueueSnackbar(
              `Section ${i + 1}, Row ${j + 1} title is required`,
              {
                variant: "error",
                autoHideDuration: 3000,
              }
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const validateMediaType = () => {
    if (!formData.mediaType) {
      enqueueSnackbar("Please select a media type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    // Check if subtype is selected
    if (formData.mediaType === "Image" && !formData.imageSubType) {
      enqueueSnackbar("Please select image sub-type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (formData.mediaType === "Video" && !formData.videoSubType) {
      enqueueSnackbar("Please select video sub-type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (formData.mediaType === "Document" && !formData.documentSubType) {
      enqueueSnackbar("Please select document sub-type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    // Check for file upload based on media type
    if (formData.mediaType === "Image") {
      if (!formData.uploadedImage && !formData.imageUrl) {
        enqueueSnackbar("Please upload an image file", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.mediaType === "Video") {
      if (!formData.uploadedVideo && !formData.videoUrl) {
        enqueueSnackbar("Please upload a video file", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.mediaType === "Document") {
      if (!formData.uploadedDocument && !formData.documentUrl) {
        enqueueSnackbar("Please upload a document file", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Caption is required for Media type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    return true;
  };

  const validateQuestionnaireType = () => {
    if (!formData.questions || formData.questions.length === 0) {
      enqueueSnackbar("At least one question is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.key?.trim()) {
        enqueueSnackbar(`Question ${i + 1} key is required`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
      if (!question.value?.trim()) {
        enqueueSnackbar(`Question ${i + 1} value is required`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    return true;
  };

  const validateWhatsAppPayType = () => {
    if (!formData.bodyText?.trim()) {
      enqueueSnackbar("Caption is required for WhatsApp Pay type", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (formData.whatsappPayType === "Products") {
      if (!formData.products || formData.products.length === 0) {
        enqueueSnackbar("At least one product is required", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      for (let i = 0; i < formData.products.length; i++) {
        const product = formData.products[i];
        if (!product.name?.trim()) {
          enqueueSnackbar(`Product ${i + 1} name is required`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }
        if (!product.price || product.price <= 0) {
          enqueueSnackbar(`Product ${i + 1} price must be greater than 0`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }
      }
    }

    return true;
  };

  const validateValidatorType = () => {
    if (!formData.conditionSource) {
      enqueueSnackbar("Please select a condition source", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (!formData.apiUrl?.trim()) {
      enqueueSnackbar("API URL is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    if (!formData.conditions || formData.conditions.length === 0) {
      enqueueSnackbar("At least one condition is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }

    for (let i = 0; i < formData.conditions.length; i++) {
      const condition = formData.conditions[i];
      if (!condition.field?.trim()) {
        enqueueSnackbar(`Condition ${i + 1} field is required`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
      if (!condition.operator?.trim()) {
        enqueueSnackbar(`Condition ${i + 1} operator is required`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
      if (!condition.value?.trim()) {
        enqueueSnackbar(`Condition ${i + 1} value is required`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    return true;
  };

  const validateActionStep = () => {
    if (formData.type === "Catalog") {
      if (!formData.buttons || formData.buttons.length === 0) {
        enqueueSnackbar("At least one category is required in Actions", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      for (let i = 0; i < formData.buttons.length; i++) {
        if (!formData.buttons[i].title?.trim()) {
          enqueueSnackbar(`Category ${i + 1} title is required`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }
      }
    }

    if (formData.type === "Flow") {
      if (!formData.buttonTitle?.trim()) {
        enqueueSnackbar("Button title is required", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      if (!formData.selectedFlow) {
        enqueueSnackbar("Please select a flow", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }

    if (formData.type === "Interactive") {
      if (!formData.buttons || formData.buttons.length === 0) {
        enqueueSnackbar("At least one button is required in Actions", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      for (let i = 0; i < formData.buttons.length; i++) {
        if (!formData.buttons[i].title?.trim()) {
          enqueueSnackbar(`Button ${i + 1} title is required`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }
      }
    }

    return true;
  };

  const validateCurrentStep = () => {
    const disabledSteps = getDisabledSteps();
    const enableNotify = formData.enableNotify || false;
    const hasApiConfigDisabled = disabledSteps.includes(2);

    const isSimpleType = ["Text", "Media", "WhatsApp Pay"].includes(
      formData.type
    );

    // Determine which step we're actually on
    let actualStep = currentStep;

    if (isSimpleType) {
      // For simple types: Message -> API (optional) -> Notify (optional)
      if (currentStep === 1) {
        actualStep = "message";
      } else if (hasApiConfigDisabled) {
        if (currentStep === 2) {
          actualStep = enableNotify ? "notify" : null;
        }
      } else {
        if (currentStep === 2) {
          actualStep = "api";
        } else if (currentStep === 3) {
          actualStep = enableNotify ? "notify" : null;
        }
      }
    } else if (["Catalog", "Interactive", "Flow"].includes(formData.type)) {
      // For complex types: Message -> API (optional) -> Actions -> Follow-up -> Notify (optional)
      if (currentStep === 1) {
        actualStep = "message";
      } else if (hasApiConfigDisabled) {
        if (currentStep === 2) {
          actualStep = "actions";
        } else if (currentStep === 3) {
          actualStep = "followup";
        } else if (currentStep === 4) {
          actualStep = enableNotify ? "notify" : null;
        }
      } else {
        if (currentStep === 2) {
          actualStep = "api";
        } else if (currentStep === 3) {
          actualStep = "actions";
        } else if (currentStep === 4) {
          actualStep = "followup";
        } else if (currentStep === 5) {
          actualStep = enableNotify ? "notify" : null;
        }
      }
    } else if (["Questionnaire", "Validator"].includes(formData.type)) {
      // For these types: Message -> Follow-up -> Notify (optional)
      if (currentStep === 1) {
        actualStep = "message";
      } else if (currentStep === 2) {
        actualStep = "followup";
      } else if (currentStep === 3) {
        actualStep = enableNotify ? "notify" : null;
      }
    }

    // Validate message step
    if (actualStep === "message") {
      switch (formData.type) {
        case "Text":
          return validateTextType();
        case "Catalog":
          return validateCatalogType();
        case "Flow":
          return validateFlowType();
        case "Interactive":
          return validateInteractiveType();
        case "Media":
          return validateMediaType();
        case "Questionnaire":
          return validateQuestionnaireType();
        case "WhatsApp Pay":
          return validateWhatsAppPayType();
        case "Validator":
          return validateValidatorType();
        default:
          return true;
      }
    }

    // Validate action step
    if (actualStep === "actions") {
      return validateActionStep();
    }

    // API and other steps can be validated here if needed
    return true;
  };

  const handleStepValidation = (stepNumber, validateFunction) => {
    setStepValidators((prev) => ({
      ...prev,
      [stepNumber]: validateFunction,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      loadChatbotKeywords();

      if (nodeData) {
        setFormData((prev) => ({
          ...prev,
          nodeName: nodeData.label || "",
          triggerKeyword: nodeData.triggerKeyword || "",
          type: nodeData.type || "Text",
          assignAgent: nodeData.assignAgent || "",
          enableNotify: nodeData.enableNotify || false,
          bodyText: nodeData.bodyText || "",
          buttons: nodeData.buttons || [],
          intents: nodeData.intents || [],
          catalogHeaderText: nodeData.catalogHeaderText || "",
          newCatalogName: nodeData.newCatalogName || "",
          selectedCatalog: nodeData.selectedCatalog || "",
          buttonTitle: nodeData.buttonTitle || "",
          selectedFlow: nodeData.selectedFlow || "",
        }));
      }
    }
  }, [isOpen, nodeData]);

  const loadChatbotKeywords = () => {
    try {
      const savedChatbots = localStorage.getItem("chatbots");
      if (savedChatbots) {
        const chatbots = JSON.parse(savedChatbots);

        const allKeywords = chatbots.flatMap((chatbot) =>
          Array.isArray(chatbot.keywords) ? chatbot.keywords : []
        );

        const uniqueKeywords = [...new Set(allKeywords)].filter(
          (keyword) => keyword && keyword.trim() !== ""
        );

        setChatbotKeywords(uniqueKeywords);
        console.log("Loaded chatbot keywords:", uniqueKeywords);
      }
    } catch (error) {
      console.error("Error loading chatbot keywords:", error);
      setChatbotKeywords([]);
    }
  };

  const isApiConfigEnabled = () => {
    if (formData.hasVariables) {
      return true;
    }

    if (formData.type === "Interactive") {
      return (
        (formData.headerType === "Image" &&
          formData.imageSubType === "Dynamic") ||
        (formData.headerType === "Video" &&
          formData.videoSubType === "Dynamic") ||
        (formData.headerType === "Document" &&
          formData.documentSubType === "Dynamic")
      );
    }

    if (formData.type === "Media") {
      return (
        (formData.mediaType === "Image" &&
          formData.imageSubType === "Dynamic") ||
        (formData.mediaType === "Video" &&
          formData.videoSubType === "Dynamic") ||
        (formData.mediaType === "Document" &&
          formData.documentSubType === "Dynamic")
      );
    }

    return false;
  };

  const getDisabledSteps = () => {
    const disabledSteps = [];
    const typesWithApiConfig = [
      "Text",
      "Catalog",
      "Interactive",
      "Media",
      "Flow",
      "WhatsApp Pay",
    ];

    if (typesWithApiConfig.includes(formData.type) && !isApiConfigEnabled()) {
      disabledSteps.push(2);
    }

    return disabledSteps;
  };

  const getActualTotalSteps = () => {
    const baseStepConfigs = {
      Text: 2,
      Catalog: 4,
      Flow: 4,
      Interactive: 4,
      Media: 2,
      Questionnaire: 2,
      "WhatsApp Pay": 2,
      Validator: 2,
    };

    let totalSteps = baseStepConfigs[formData.type] || 2;
    const disabledSteps = getDisabledSteps();
    const enableNotify = formData.enableNotify || false;

    if (disabledSteps.includes(2)) {
      totalSteps -= 1;
    }

    if (enableNotify) {
      totalSteps += 1;
    }

    return totalSteps;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const actualTotalSteps = getActualTotalSteps();
    if (currentStep < actualTotalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (
        field === "enableNotify" ||
        field === "hasVariables" ||
        (prev.type === "Interactive" && field.includes("SubType")) ||
        (prev.type === "Media" && field.includes("SubType")) ||
        (prev.type === "Interactive" && field === "headerType") ||
        (prev.type === "Media" && field === "mediaType")
      ) {
        setTimeout(() => setCurrentStep(1), 0);
      }

      return newData;
    });
  };

  const handleBodyTextChange = (value) => {
    const hasVariables = /\{\{.*?\}\}/.test(value);

    setFormData((prev) => ({
      ...prev,
      bodyText: value,
      hasVariables: hasVariables,
    }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      hasVariables: false,
      bodyText: "",
      footerText: "",
      catalogHeaderType: "Text",
      catalogHeaderText: "",
      catalogBodyText: "",
      catalogFooterText: "",
      interactiveType:
        value === "Interactive" ? "Button" : prev.interactiveType,
      headerType: "Text",
      headerText: "",
      interactiveBodyText: "",
      interactiveFooterText: "",
      buttons: [],
      listSections: [],
      mediaType: "Image",
      imageSubType: "Static",
      videoSubType: "Static",
      documentSubType: "Static",
      caption: "",
      questions: [],
      allowCouponUsage: false,
      whatsappPayType: "Products",
      products: [],
      validatorConditionSource: "Meta webhook payload",
      apiUrl: "",
      conditions: [],
      codeStructure: "",
      flowType: "Navigate",
      flowId: "",
      flowName: "",
      flowToken: "",
      screenId: "",
      intents: [],
      newCatalogName: "",
      selectedCatalog: "",
      buttonTitle: "",
      selectedFlow: "",
    }));

    setCurrentStep(1);
  };

  const handleButtonChange = (index, value) => {
    const updatedButtons = [...formData.buttons];
    updatedButtons[index] = {
      ...updatedButtons[index],
      text: value,
      charCount: value.length,
    };
    setFormData((prev) => ({ ...prev, buttons: updatedButtons }));
  };

  const handleAddButton = () => {
    if (formData.buttons.length < 3) {
      setFormData((prev) => ({
        ...prev,
        buttons: [...prev.buttons, { text: "", charCount: 0 }],
      }));
    }
  };

  const handleDeleteButton = (index) => {
    const updatedButtons = formData.buttons.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, buttons: updatedButtons }));
  };

  const handleListSectionChange = (index, field, value) => {
    const updatedSections = [...formData.listSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData((prev) => ({ ...prev, listSections: updatedSections }));
  };

  const handleAddListSection = () => {
    setFormData((prev) => ({
      ...prev,
      listSections: [...prev.listSections, { title: "", rows: [] }],
    }));
  };

  const handleAddListRow = (sectionIndex) => {
    const updatedSections = [...formData.listSections];
    if (!updatedSections[sectionIndex].rows) {
      updatedSections[sectionIndex].rows = [];
    }
    updatedSections[sectionIndex].rows.push({ title: "", description: "" });
    setFormData((prev) => ({ ...prev, listSections: updatedSections }));
  };

  const handleListRowChange = (sectionIndex, rowIndex, field, value) => {
    const updatedSections = [...formData.listSections];
    updatedSections[sectionIndex].rows[rowIndex][field] = value;
    setFormData((prev) => ({ ...prev, listSections: updatedSections }));
  };

  const handleDeleteListSection = (index) => {
    const updatedSections = formData.listSections.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, listSections: updatedSections }));
  };

  const handleDeleteListRow = (sectionIndex, rowIndex) => {
    const updatedSections = [...formData.listSections];
    updatedSections[sectionIndex].rows = updatedSections[
      sectionIndex
    ].rows.filter((_, i) => i !== rowIndex);
    setFormData((prev) => ({ ...prev, listSections: updatedSections }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { key: "", value: "" }],
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { name: "", price: 0, quantity: 1, total: 0 },
      ],
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    if (field === "price" || field === "quantity") {
      updatedProducts[index].total =
        updatedProducts[index].price * updatedProducts[index].quantity;
    }
    setFormData((prev) => ({ ...prev, products: updatedProducts }));
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: updatedProducts }));
  };

  const handleAddCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: "", operator: "===", value: "" },
      ],
    }));
  };

  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index][field] = value;
    setFormData((prev) => ({ ...prev, conditions: updatedConditions }));
  };

  const handleNotifyToggle = () => {
    const newEnableNotify = !formData.enableNotify;
    setFormData((prev) => ({
      ...prev,
      enableNotify: newEnableNotify,
    }));

    setTimeout(() => setCurrentStep(1), 0);
  };

  const handleApiUrlChange = (value) => {
    setFormData((prev) => ({ ...prev, apiUrl: value }));
  };

  const handleHttpMethodChange = (value) => {
    setFormData((prev) => ({ ...prev, httpMethod: value }));
  };

  const handleEndpointTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, endpointType: value }));
  };

  const handleAddHeader = () => {
    setFormData((prev) => ({
      ...prev,
      headers: [...(prev.headers || []), { key: "", value: "" }],
    }));
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...(formData.headers || [])];
    updatedHeaders[index][field] = value;
    setFormData((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const handleDeleteHeader = (index) => {
    const updatedHeaders = (formData.headers || []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const handleTestApi = () => {
    console.log("Testing API...");
  };

  const handleResponseMappingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      responseMapping: { ...prev.responseMapping, [field]: value },
    }));
  };

  const handleAddVariable = (variableName) => {
    if (variableName.trim()) {
      const newText = formData.bodyText + ` {{${variableName.trim()}}} `;
      handleBodyTextChange(newText);
    }
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      return;
    }

    onSave(formData);
    setCurrentStep(1);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <div>
                <Icon
                  className="modal-icon-adjustments"
                  icon="grommet-icons:configure"
                />
              </div>
              <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                Configure Node
              </h3>
            </div>
            <h5></h5>
            <button className="modal-close" onClick={onClose}>
              <Icon icon="material-symbols:close-rounded" />
            </button>
          </div>

          <ModalBody
            currentStep={currentStep}
            formData={formData}
            handleInputChange={handleInputChange}
            handleBodyTextChange={handleBodyTextChange}
            handleTypeChange={handleTypeChange}
            handleNotifyToggle={handleNotifyToggle}
            handleButtonChange={handleButtonChange}
            handleAddButton={handleAddButton}
            handleDeleteButton={handleDeleteButton}
            handleListSectionChange={handleListSectionChange}
            handleAddListSection={handleAddListSection}
            handleAddListRow={handleAddListRow}
            handleListRowChange={handleListRowChange}
            handleDeleteListSection={handleDeleteListSection}
            handleDeleteListRow={handleDeleteListRow}
            handleAddQuestion={handleAddQuestion}
            handleQuestionChange={handleQuestionChange}
            handleAddProduct={handleAddProduct}
            handleProductChange={handleProductChange}
            handleDeleteProduct={handleDeleteProduct}
            handleAddCondition={handleAddCondition}
            handleConditionChange={handleConditionChange}
            handleApiUrlChange={handleApiUrlChange}
            handleHttpMethodChange={handleHttpMethodChange}
            handleEndpointTypeChange={handleEndpointTypeChange}
            handleAddHeader={handleAddHeader}
            handleHeaderChange={handleHeaderChange}
            handleDeleteHeader={handleDeleteHeader}
            handleTestApi={handleTestApi}
            handleResponseMappingChange={handleResponseMappingChange}
            handleAddVariable={handleAddVariable}
            chatbotKeywords={chatbotKeywords}
            disabledSteps={getDisabledSteps()}
            isApiConfigEnabled={isApiConfigEnabled()}
            onStepValidation={handleStepValidation}
          />

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <div>
              {currentStep > 1 && (
                <button style={{marginRight: "10px"}} className="btn-secondary" onClick={handlePrevious}>
                  Previous
                </button>
              )}
              {currentStep < getActualTotalSteps() ? (
                <button className="btn-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="btn-primary" onClick={handleSubmit}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WizardModal;
