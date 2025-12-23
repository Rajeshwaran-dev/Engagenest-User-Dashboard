import { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Upload,
  message,
  Tag,
  Table,
  Space,
  Checkbox,
  Select,
  Drawer,
  Badge,
} from "antd";
import {
  CloudUploadOutlined,
  UploadOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import ComposeModals from "./ComposeModals";
// Remove API imports and replace with static data
// import { useSendTemplateMessageMutation } from "../../store/ApiFilesV2/LeadConfigurationApis";
// import { useGetAllCountriesQuery } from "../../store/ApiFilesV2/GeneralApis";
import countryCodeLengthMap from "../countryCode";
const { Text } = Typography;

// Static data for countries
const staticCountries = {
  data: [
    { dial_code: "91", name: "India" },
    { dial_code: "1", name: "United States" },
    { dial_code: "44", name: "United Kingdom" },
    { dial_code: "971", name: "United Arab Emirates" },
    { dial_code: "65", name: "Singapore" },
    { dial_code: "60", name: "Malaysia" },
    { dial_code: "66", name: "Thailand" },
    { dial_code: "81", name: "Japan" },
    { dial_code: "82", name: "South Korea" },
    { dial_code: "86", name: "China" },
    { dial_code: "61", name: "Australia" },
    { dial_code: "49", name: "Germany" },
    { dial_code: "33", name: "France" },
    { dial_code: "34", name: "Spain" },
    { dial_code: "39", name: "Italy" },
  ]
};

// Static templates data (you can modify this as needed)
const staticTemplates = [
  {
    _id: "1",
    id: "1",
    name: "Welcome Template",
    type: "Welcome Message",
    headerType: "image",
    actions: [
      { type: "url", text: "Visit Website", url: "https://example.com/{{1}}" }
    ]
  },
  {
    _id: "2",
    id: "2",
    name: "Promotion Template",
    type: "Promotional",
    headerType: "video",
    actions: [
      { type: "url", text: "Shop Now", url: "https://shop.com/{{1}}" }
    ]
  },
  {
    _id: "3",
    id: "3",
    name: "Document Template",
    type: "Transactional",
    headerType: "file",
    actions: []
  },
  {
    _id: "4",
    id: "4",
    name: "Text Only Template",
    type: "Informational",
    headerType: "",
    actions: []
  }
];

const SendTemplate = ({
  selectedLead,
  allTemplates = staticTemplates, // Use static templates by default
  selectedTemplate,
  setSelectedTemplate,
  formData,
  setFormData,
  templateVariables,
  setTemplateVariables,
  fileList,
  setFileList,
  handleFormSubmit,
  handleReset,
}) => {
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [additionalRecipients, setAdditionalRecipients] = useState([]);
  // Remove mutation hook
  // const [sendTemplateMessageMutation] = useSendTemplateMessageMutation();
  const [createAsLeads, setCreateAsLeads] = useState(false);
  // Remove query hook and use static data
  // const { data: allCountries } = useGetAllCountriesQuery();
  const allCountries = staticCountries; // Use static countries data
  const { enqueueSnackbar } = useSnackbar();

  const MAX_FILE_SIZE_DOC = 100 * 1024 * 1024;
  const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024;
  const MAX_FILE_SIZE_VIDEO = 16 * 1024 * 1024;

  // Load history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("templateHistory");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Ensure we have some default history data
        if (!parsedHistory || parsedHistory.length === 0) {
          const defaultHistory = [
            {
              id: 1,
              serialNumber: 1,
              templateName: "Welcome Template",
              recipientName: "John Doe",
              mobileNumber: "9876543210",
              countryCode: "91",
              status: "Hot",
              sentAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 2,
              serialNumber: 2,
              templateName: "Promotion Template",
              recipientName: "Jane Smith",
              mobileNumber: "8765432109",
              countryCode: "1",
              status: "Warm",
              sentAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
              id: 3,
              serialNumber: 3,
              templateName: "Document Template",
              recipientName: "Bob Wilson",
              mobileNumber: "7654321098",
              countryCode: "44",
              status: "Cold",
              sentAt: new Date(Date.now() - 259200000).toISOString(),
            },
          ];
          setHistoryData(defaultHistory);
          localStorage.setItem("templateHistory", JSON.stringify(defaultHistory));
        } else {
          setHistoryData(parsedHistory);
        }
      } catch (error) {
        console.error("Error parsing stored history:", error);
        // Set default history if parsing fails
        const defaultHistory = [
          {
            id: 1,
            serialNumber: 1,
            templateName: "Welcome Template",
            recipientName: "John Doe",
            mobileNumber: "9876543210",
            countryCode: "91",
            status: "Hot",
            sentAt: new Date().toISOString(),
          },
        ];
        setHistoryData(defaultHistory);
      }
    } else {
      // If no history in localStorage, set default history
      const defaultHistory = [
        {
          id: 1,
          serialNumber: 1,
          templateName: "Welcome Template",
          recipientName: "John Doe",
          mobileNumber: "9876543210",
          countryCode: "91",
          status: "Hot",
          sentAt: new Date().toISOString(),
        },
      ];
      setHistoryData(defaultHistory);
      localStorage.setItem("templateHistory", JSON.stringify(defaultHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("templateHistory", JSON.stringify(historyData));
  }, [historyData]);

  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    setComposeModalOpen(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: "",
    }));
    setFileList([]);

    // Generate template variables based on template content (simulated)
    const variables = [];
    if (template.name.includes("Welcome")) {
      variables.push("customer_name", "company_name");
    } else if (template.name.includes("Promotion")) {
      variables.push("offer_code", "expiry_date");
    } else if (template.name.includes("Document")) {
      variables.push("document_name", "reference_number");
    } else {
      variables.push("message_content");
    }

    setTemplateVariables(variables);

    // Initialize variable values
    const initialValues = {};
    variables.forEach(variable => {
      initialValues[variable] = "";
    });

    setFormData(prev => ({
      ...prev,
      selectedVariableValuesObj: initialValues,
    }));
  };

  const handleVariableValueChange = (variableName, value) => {
    setFormData(prev => ({
      ...prev,
      selectedVariableValuesObj: {
        ...prev.selectedVariableValuesObj,
        [variableName]: value,
      },
    }));
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    // Simulate file upload success
    if (newFileList.length > 0) {
      const fileName = newFileList[0].name;
      const simulatedFileUrl = `https://example.com/uploads/${Date.now()}_${fileName}`;

      setFormData(prev => ({
        ...prev,
        fileUrl: simulatedFileUrl,
      }));

      message.success(`${fileName} file uploaded successfully.`);

      // Simulate upload progress
      setTimeout(() => {
        if (newFileList[0]) {
          newFileList[0].status = "done";
          setFileList([...newFileList]);
        }
      }, 500);
    } else {
      setFormData(prev => ({
        ...prev,
        fileUrl: "",
      }));
    }
  };

  const handleBeforeUpload = file => {
    const headerType = selectedTemplate?.headerType?.toLowerCase() || "";
    let sizeLimit = MAX_FILE_SIZE_DOC;
    let acceptedTypes = [];

    switch (headerType) {
      case "image":
        sizeLimit = MAX_FILE_SIZE_IMAGE;
        acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];
        break;
      case "video":
        sizeLimit = MAX_FILE_SIZE_VIDEO;
        acceptedTypes = ["video/mp4", "video/quicktime", "video/mpeg"];
        break;
      case "file":
        sizeLimit = MAX_FILE_SIZE_DOC;
        acceptedTypes = [
          "application/msword",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        break;
      default:
        return Upload.LIST_IGNORE;
    }

    if (!acceptedTypes.includes(file.type)) {
      message.error(
        `Invalid file type! Accepted types are: ${acceptedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    if (file.size > sizeLimit) {
      const sizeLimitMB =
        headerType === "image" ? "5" : headerType === "video" ? "16" : "100";
      message.error(`File size must be smaller than ${sizeLimitMB}MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const getAcceptString = () => {
    const headerType = selectedTemplate?.headerType?.toLowerCase() || "";
    switch (headerType) {
      case "image":
        return ".jpg,.jpeg,.png";
      case "video":
        return ".mp4,.mov,.mpeg";
      case "file":
        return ".doc,.pdf,.docx";
      default:
        return "";
    }
  };

  const optionsCountry = useMemo(() => {
    if (allCountries && allCountries?.data?.length > 0) {
      let newOptions = allCountries?.data.map((item, index) => {
        return {
          key: `+${item?.dial_code} ${item?.name}`,
          label: `+${item?.dial_code} ${item?.name}`,
          value: item?.dial_code,
        };
      });
      // Add India as first option
      newOptions.splice(0, 0, {
        key: `+91 India`,
        label: `+91 India`,
        value: "91",
      });
      return newOptions;
    } else {
      // Fallback options if no data
      return [
        { key: "+91 India", label: "+91 India", value: "91" },
        { key: "+1 USA", label: "+1 United States", value: "1" },
        { key: "+44 UK", label: "+44 United Kingdom", value: "44" },
      ];
    }
  }, [allCountries]);

  const addRecipient = () => {
    setAdditionalRecipients(prev => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        countryCode: "91",
        mobile: "",
        createAsLead: false,
      },
    ]);
  };

  const removeRecipient = id => {
    setAdditionalRecipients(prev => prev.filter(item => item.id !== id));
  };

  const updateRecipient = (id, field, value) => {
    setAdditionalRecipients(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Clean and validate the input based on field type
          let cleanValue = value;

          if (field === "countryCode") {
            // Remove any non-numeric characters and limit length
            cleanValue = value.replace(/\D/g, "").substring(0, 4);
          } else if (field === "mobile") {
            // Remove any non-numeric characters and limit length
            cleanValue = value.replace(/\D/g, "").substring(0, 15);
          } else if (field === "name") {
            // Trim whitespace
            cleanValue = value.trim();
          } else if (field === "createAsLead") {
            cleanValue = value; // boolean value
          }

          console.log(
            `Updating recipient ${id}, field: ${field}, value: ${cleanValue}`
          );

          return { ...item, [field]: cleanValue };
        }
        return item;
      })
    );
  };

  const validatePhoneNumber = (countryCode, mobile) => {
    if (!countryCode || !mobile) {
      console.log("Validation failed: missing countryCode or mobile", {
        countryCode,
        mobile,
      });
      return false;
    }

    const cleanCountryCode = String(countryCode).trim();
    const cleanMobile = String(mobile).trim();

    if (!cleanCountryCode || !cleanMobile) {
      console.log("Validation failed: empty after cleaning", {
        cleanCountryCode,
        cleanMobile,
      });
      return false;
    }

    // Get expected length from country code map
    const expectedLength = countryCodeLengthMap[cleanCountryCode];

    // Basic validation
    const countryCodeRegex = /^\d{1,4}$/;
    const isValidCountryCode = countryCodeRegex.test(cleanCountryCode);

    // Check if mobile has only digits
    const hasOnlyDigits = /^\d+$/.test(cleanMobile);

    // Validate length if we have expected length
    const isValidLength = expectedLength
      ? cleanMobile.length === expectedLength
      : cleanMobile.length >= 7 && cleanMobile.length <= 15;

    console.log("Phone validation result:", {
      countryCode: cleanCountryCode,
      mobile: cleanMobile,
      expectedLength,
      isValidCountryCode,
      hasOnlyDigits,
      isValidLength,
      overall: isValidCountryCode && hasOnlyDigits && isValidLength,
    });

    return isValidCountryCode && hasOnlyDigits && isValidLength;
  };

  // Simulated API call for sending template
  const simulateSendTemplate = async (templateData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful response
    return {
      success: true,
      data: {
        success: templateData.additionalRecipients.length + 1, // All recipients successful
        total: templateData.additionalRecipients.length + 1,
        errors: [],
      },
      message: "Template sent successfully"
    };
  };

  const handleSendTemplate = async () => {
    try {
      if (!selectedTemplate) {
        throw new Error("Please select a template");
      }

      console.log("Starting template send process...");
      console.log("Selected template:", selectedTemplate.name);
      console.log("Primary recipient:", selectedLead);
      console.log("Additional recipients:", additionalRecipients);

      // Validate variables
      const emptyVariables = templateVariables.filter(
        variable => !formData.selectedVariableValuesObj[variable]
      );
      if (emptyVariables.length > 0) {
        throw new Error(`Please fill: ${emptyVariables.join(", ")}`);
      }

      // Validate header file if needed
      if (
        (selectedTemplate?.headerType === "image" ||
          selectedTemplate?.headerType === "video" ||
          selectedTemplate?.headerType === "file") &&
        !formData.fileUrl
      ) {
        throw new Error(`Please upload ${selectedTemplate.headerType} file`);
      }

      // Validate additional recipients
      const invalidRecipients = additionalRecipients.filter(recipient => {
        const hasCountryCode =
          recipient.countryCode && recipient.countryCode.trim() !== "";
        const hasMobile = recipient.mobile && recipient.mobile.trim() !== "";

        console.log(`Validating recipient: ${recipient.name}`, {
          countryCode: recipient.countryCode,
          mobile: recipient.mobile,
          hasCountryCode,
          hasMobile,
        });

        return !hasCountryCode || !hasMobile;
      });

      if (invalidRecipients.length > 0) {
        console.log("Invalid recipients found:", invalidRecipients);
        throw new Error(
          "Please provide valid phone numbers for all additional recipients"
        );
      }

      // Validate primary recipient
      if (!selectedLead?.countryCode || !selectedLead?.mobile) {
        throw new Error(
          "Primary recipient must have valid country code and mobile number"
        );
      }

      console.log("All validations passed");

      // Create all recipients array (main + additional)
      const validAdditionalRecipients = additionalRecipients
        .filter(recipient => recipient.countryCode && recipient.mobile)
        .map(recipient => ({
          name: recipient.name || "Additional Contact",
          countryCode: recipient.countryCode.toString(),
          mobile: recipient.mobile.toString(),
          createAsLead: recipient.createAsLead || false,
        }));

      const allRecipients = [
        {
          name: selectedLead?.name || "Primary Contact",
          countryCode: selectedLead?.countryCode?.toString() || "",
          mobile: selectedLead?.mobile?.toString() || "",
          isAdditional: false,
        },
        ...validAdditionalRecipients.map(recipient => ({
          ...recipient,
          isAdditional: true,
        })),
      ];

      console.log("Final recipients array:", allRecipients);

      if (allRecipients.length === 0) {
        throw new Error("No valid recipients to send to");
      }

      // Prepare payload for simulated API
      const templateData = {
        templateId: selectedTemplate._id || selectedTemplate.id,
        recipientData: {
          name: selectedLead?.name || "Primary Contact",
          countryCode: selectedLead?.countryCode?.toString() || "",
          mobile: selectedLead?.mobile?.toString() || "",
          leadId: selectedLead?.id,
        },
        variableValues: formData.selectedVariableValuesObj || {},
        fileUrl: formData.fileUrl || "",
        headerType: selectedTemplate?.headerType || "",
        additionalRecipients: validAdditionalRecipients,
      };

      console.log("Sending template data:", templateData);

      // Call simulated API
      const result = await simulateSendTemplate(templateData);

      console.log("Simulated API Response:", result);

      // Handle success
      if (result.success) {
        const successCount = result.data?.success || 0;
        const totalCount = result.data?.total || allRecipients.length;

        enqueueSnackbar(
          `Template sent to ${successCount} of ${totalCount} recipient(s) successfully!`,
          {
            variant: "success",
            autoHideDuration: 3000,
          }
        );

        // Update history only for successful sends
        if (successCount > 0) {
          const newHistoryItems = allRecipients
            .slice(0, successCount)
            .map((recipient, index) => ({
              id: Date.now() + index,
              serialNumber: historyData.length + index + 1,
              templateName: selectedTemplate.name,
              recipientName: recipient.name,
              mobileNumber: recipient.mobile,
              countryCode: recipient.countryCode,
              status: recipient.isAdditional
                ? "New Customer"
                : selectedLead?.status || "Unknown",
              sentAt: new Date().toISOString(),
            }));

          setHistoryData(prev => [...newHistoryItems, ...prev]);
        }

        // Show errors if any (from simulation)
        if (result.data?.errors && result.data.errors.length > 0) {
          console.log("Errors occurred:", result.data.errors);
          result.data.errors.forEach(error => {
            enqueueSnackbar(
              `Failed to send to ${error.recipient}: ${error.error}`,
              {
                variant: "warning",
                autoHideDuration: 5000,
              }
            );
          });
        }
      } else {
        throw new Error(result.message || "Failed to send template");
      }

      // Reset UI state
      handleReset();
      setFileList([]);
      setSelectedTemplate(null);
      setTemplateVariables([]);
      setAdditionalRecipients([]);
    } catch (error) {
      console.error("Error in handleSendTemplate:", error);
      enqueueSnackbar(error.message || "Failed to send template", {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const historyColumns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Recipient Name",
      dataIndex: "recipientName",
      key: "recipientName",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      render: (text, record) => (
        <span>
          {record.countryCode ? `+${record.countryCode} ${text}` : text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => (
        <Tag
          color={
            status === "Hot" || status === "New Customer"
              ? "red"
              : status === "Warm"
                ? "orange"
                : status === "Cold"
                  ? "green"
                  : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Sent At",
      dataIndex: "sentAt",
      key: "sentAt",
      render: text => new Date(text).toLocaleString(),
    },
    {
      title: "Delivery Status",
      dataIndex: "sentAt",
      key: "sentAt",
      render: () => "Sent",
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div
            style={{
              borderRadius: "8px",
              padding: "24px",
              border: "1px solid #bababe",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Button
                  className="btn-primary"
                  style={{ borderRadius: 8 }}
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    setComposeModalOpen(true);
                    setSelectedTemplate(null);
                  }}
                >
                  Select Template
                </Button>
                {selectedLead?.status && (
                  <Tag
                    color={
                      selectedLead.status === "Hot"
                        ? "red"
                        : selectedLead.status === "Warm"
                          ? "orange"
                          : selectedLead.status === "Cold"
                            ? "green"
                            : "default"
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Status: {selectedLead.status}
                  </Tag>
                )}
              </div>
              {selectedTemplate && (
                <Text strong>Selected: {selectedTemplate.name}</Text>
              )}
            </div>

            <Form layout='vertical'>
              {selectedTemplate && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <Text strong>Selected Template:</Text>
                  <Text style={{ display: "block" }}>
                    {selectedTemplate.name}
                  </Text>
                  <Text type='secondary' style={{ display: "block" }}>
                    Type: {selectedTemplate.type}
                  </Text>
                  {selectedTemplate.headerType && (
                    <Text type='secondary' style={{ display: "block" }}>
                      Header Type: {selectedTemplate.headerType}
                    </Text>
                  )}
                </div>
              )}

              <Form.Item label='Primary Mobile Number'>
                <Input
                  value={
                    selectedLead?.countryCode
                      ? `+${selectedLead.countryCode} ${selectedLead.mobile || ""}`
                      : selectedLead?.mobile || ""
                  }
                  disabled
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              {/* Additional Recipients Section */}
              <Form.Item label='Additional Recipients'>
                <Button
                  type='dashed'
                  onClick={addRecipient}
                  icon={<PlusOutlined />}
                  style={{ marginBottom: "16px", borderRadius: 8 }}
                  disabled={additionalRecipients.length >= 3}
                >
                  Add Recipient
                </Button>
                <div
                  style={{
                    maxHeight: 150,
                    overflowY: "auto",
                    overflowX: "hidden",
                    paddingRight: 4,
                  }}
                >
                  {additionalRecipients.map(recipient => (
                    <div
                      key={recipient.id}
                      style={{
                        marginBottom: 16,
                        padding: 12,
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                      }}
                    >
                      <Space
                        style={{
                          display: "flex",
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                        align='baseline'
                      >
                        <Input
                          placeholder='Name'
                          value={recipient.name}
                          onChange={e =>
                            updateRecipient(
                              recipient.id,
                              "name",
                              e.target.value
                            )
                          }
                          style={{ width: 150, borderRadius: 8 }}
                        />
                        <Select
                          placeholder='Country Code'
                          className='rounded-select'
                          value={recipient.countryCode}
                          onChange={value =>
                            updateRecipient(recipient.id, "countryCode", value)
                          }
                          style={{ width: 150, borderRadius: 8 }}
                          showSearch
                          filterOption={(input, option) =>
                            option?.label
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={optionsCountry}
                        />
                        <Input
                          placeholder='Mobile Number'
                          value={recipient.mobile}
                          maxLength={15}
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, "");
                            const expectedLength =
                              countryCodeLengthMap[recipient.countryCode];

                            // Only update if within expected length or if no expected length
                            if (
                              !expectedLength ||
                              value.length <= expectedLength
                            ) {
                              updateRecipient(recipient.id, "mobile", value);
                            }
                          }}
                          style={{ width: 180, borderRadius: 8 }}
                          status={
                            recipient.mobile &&
                              !validatePhoneNumber(
                                recipient.countryCode,
                                recipient.mobile
                              )
                              ? "error"
                              : ""
                          }
                        />
                        <Button
                          type='text'
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeRecipient(recipient.id)}
                        />
                      </Space>
                      {recipient.mobile &&
                        !validatePhoneNumber(
                          recipient.countryCode,
                          recipient.mobile
                        ) && (
                          <div
                            style={{
                              color: "#ff4d4f",
                              fontSize: "12px",
                              marginTop: 4,
                            }}
                          >
                            {countryCodeLengthMap[recipient.countryCode]
                              ? `Mobile number should be ${countryCodeLengthMap[recipient.countryCode]} digits for +${recipient.countryCode}`
                              : "Invalid mobile number"}
                          </div>
                        )}
                      <Checkbox
                        checked={recipient.createAsLead}
                        onChange={e =>
                          updateRecipient(
                            recipient.id,
                            "createAsLead",
                            e.target.checked
                          )
                        }
                      >
                        Create as Lead
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Form.Item>

              {templateVariables.map(variable => (
                <Form.Item
                  key={variable}
                  label={variable}
                  required
                  rules={[
                    { required: true, message: `${variable} is required` },
                  ]}
                >
                  <Input
                    placeholder={`Enter ${variable}`}
                    value={formData.selectedVariableValuesObj[variable] || ""}
                    onChange={e =>
                      handleVariableValueChange(variable, e.target.value)
                    }
                  />
                </Form.Item>
              ))}

              {/* Action buttons variables (CTA URLs) */}
              {selectedTemplate?.actions?.map((action, index) => {
                if (action.type === "url" && action.url?.includes("{{1}}")) {
                  const variableKey = `{{1}}_action_${index}`;
                  return (
                    <Form.Item
                      key={variableKey}
                      label={`CTA URL (${action.text})`}
                      required
                      rules={[
                        {
                          required: true,
                          message: `Please provide URL for ${action.text}`,
                        },
                      ]}
                    >
                      <Input
                        placeholder={`Enter URL for ${action.text}`}
                        value={
                          formData.selectedVariableValuesObj[variableKey] || ""
                        }
                        onChange={e =>
                          handleVariableValueChange(variableKey, e.target.value)
                        }
                      />
                    </Form.Item>
                  );
                }
                return null;
              })}

              {/* File Upload Section */}
              {(selectedTemplate?.headerType === "image" ||
                selectedTemplate?.headerType === "video" ||
                selectedTemplate?.headerType === "file") && (
                  <Form.Item
                    label={`Upload ${selectedTemplate?.headerType}`}
                    required
                    extra={
                      selectedTemplate?.headerType === "image"
                        ? "(Max 5MB)"
                        : selectedTemplate?.headerType === "video"
                          ? "(Max 16MB)"
                          : "(Max 100MB)"
                    }
                    rules={[
                      {
                        required: true,
                        message: `Please upload ${selectedTemplate.headerType} file`,
                      },
                    ]}
                  >
                    <Upload
                      action="#"
                      headers={{}}
                      fileList={fileList}
                      accept={getAcceptString()}
                      maxCount={1}
                      beforeUpload={handleBeforeUpload}
                      onChange={handleFileChange}
                      onRemove={() => {
                        setFormData(prev => ({ ...prev, fileUrl: "" }));
                        setFileList([]);
                      }}
                      customRequest={({ file, onSuccess }) => {
                        // Simulate upload
                        setTimeout(() => {
                          onSuccess("ok");
                        }, 500);
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload {selectedTemplate?.headerType}
                      </Button>
                    </Upload>
                  </Form.Item>
                )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <Button
                  onClick={() => {
                    handleReset();
                    setFileList([]);
                    setSelectedTemplate(null);
                    setTemplateVariables([]);
                    setAdditionalRecipients([]);
                  }}
                  style={{ borderRadius: 8 }}
                >
                  Reset
                </Button>
                <Button
                  className="btn-primary"
                  onClick={handleSendTemplate}
                  icon={<SendOutlined />}
                  style={{ borderRadius: 8 }}
                >
                  Send to {1 + additionalRecipients.length} Recipient(s)
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        {/* History Table */}
        <Col span={24}>
          <div
            style={{
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #bababe",
              marginTop: "16px",
            }}
          >
            <Typography.Title level={5} style={{ marginBottom: "16px" }}>
              Sent Templates History
            </Typography.Title>
            <Table
              className='reminders-table leads-performance-table'
              columns={historyColumns}
              dataSource={historyData}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
            />
          </div>
        </Col>
      </Row>

      <ComposeModals
        modelopen={composeModalOpen}
        data={allTemplates || staticTemplates}
        setModelOpen={setComposeModalOpen}
        handleTemplateSelect={handleSelectTemplate}
      />
    </div>
  );
};

export default SendTemplate;