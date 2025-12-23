import { useEffect, useState, useMemo, useCallback } from "react";
import { Building } from "lucide-react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Checkbox,
  AutoComplete,
  Spin,
  Upload,
  Button,
  message,
} from "antd";
import moment from "moment-timezone";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

// Static data
const staticAgents = [
  {
    username: "Agent Smith",
    mobilenumber: "9876543210",
    config: {
      ticketing: {
        department: "Technical Support",
      },
    },
    agentType: { ticketing: true },
  },
  {
    username: "Agent Johnson",
    mobilenumber: "9876543211",
    config: {
      ticketing: {
        department: "Billing Department",
      },
    },
    agentType: { ticketing: true },
  },
  {
    username: "Agent Brown",
    mobilenumber: "9876543212",
    config: {
      ticketing: {
        department: "Customer Service",
      },
    },
    agentType: { ticketing: true },
  },
];

const staticSLAPolicies = [
  { id: 1, department: "Technical Support", active: true },
  { id: 2, department: "Billing Department", active: true },
  { id: 3, department: "Customer Service", active: true },
];

const staticTicketingConfig = {
  data: {
    ticketingFields: [
      {
        fieldKey: "department_field",
        fieldName: "Department",
        fieldType: "select",
        mandatory: true,
        placeholder: "Select department",
        displayInForm: true,
        displayInTable: true,
      },
      {
        fieldKey: "assignedTo",
        fieldName: "Assign To",
        fieldType: "select",
        mandatory: false,
        placeholder: "Select assignee",
        displayInForm: true,
        displayInTable: true,
      },
      {
        fieldKey: "priority",
        fieldName: "Priority",
        fieldType: "select",
        mandatory: true,
        placeholder: "Select priority",
        displayInForm: true,
        displayInTable: true,
      },
      {
        fieldKey: "issue_type",
        fieldName: "Issue Type",
        fieldType: "select",
        mandatory: false,
        placeholder: "Select issue type",
        displayInForm: true,
        displayInTable: true,
        options: ["Technical", "Billing", "General", "Feature Request"],
      },
      {
        fieldKey: "description",
        fieldName: "Description",
        fieldType: "textarea",
        mandatory: true,
        placeholder: "Enter description",
        displayInForm: true,
        displayInTable: true,
        rows: 4,
      },
      {
        fieldKey: "attachments",
        fieldName: "Attachments",
        fieldType: "document",
        mandatory: false,
        placeholder: "Upload files",
        displayInForm: true,
        displayInTable: true,
      },
    ],
  },
};

// Static customer data
const staticCustomers = [
  {
    name: "John Doe",
    mobileNumber: "919876543210",
    fullMobile: "919876543210",
    company: "Tech Corp Inc.",
  },
  {
    name: "Jane Smith",
    mobileNumber: "919876543211",
    fullMobile: "919876543211",
    company: "Business Solutions Ltd.",
  },
  {
    name: "Bob Wilson",
    mobileNumber: "919876543212",
    fullMobile: "919876543212",
    company: "Wilson Enterprises",
  },
  {
    name: "Alice Johnson",
    mobileNumber: "919876543213",
    fullMobile: "919876543213",
    company: "",
  },
];

// Country code data
const countryCodeLengthMap = {
  "91": 10, // India
  "1": 10, // USA/Canada
  "44": 10, // UK
  "61": 9, // Australia
  "971": 9, // UAE
};

const optionsCountry = [
  {
    key: "+91 India",
    label: "+91 India",
    value: "91",
  },
  {
    key: "+1 USA/Canada",
    label: "+1 USA/Canada",
    value: "1",
  },
  {
    key: "+44 UK",
    label: "+44 UK",
    value: "44",
  },
  {
    key: "+61 Australia",
    label: "+61 Australia",
    value: "61",
  },
  {
    key: "+971 UAE",
    label: "+971 UAE",
    value: "971",
  },
];

const AddEditTicketModal = ({
  visible,
  editingTicket,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const ticketingFields = useMemo(
    () => staticTicketingConfig.data.ticketingFields || [],
    []
  );

  const [form] = Form.useForm();
  const [assignees, setAssignees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [ticketingAgents, setTicketingAgents] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [hasFetchedInitial, setHasFetchedInitial] = useState({
    name: false,
    number: false,
  });

  const [fileLists, setFileLists] = useState({});

  // Add state for selected country code
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");

  // Add state for company name handling
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [isCompanyFromCustomer, setIsCompanyFromCustomer] = useState(false);

  // Get expected length for current country
  const expectedMobileLength = useMemo(() => {
    return countryCodeLengthMap[selectedCountryCode] || 10;
  }, [selectedCountryCode]);

  // Memoize form fields
  const formFields = useMemo(
    () => ticketingFields.filter(field => field.displayInForm),
    [ticketingFields]
  );

  // Memoize static field configurations
  const departmentField = useMemo(
    () => formFields.find(field => field.fieldKey === "department_field"),
    [formFields]
  );

  // Memoize priority options
  const priorityOptions = useMemo(
    () => [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" },
    ],
    []
  );

  // Mobile number validation function
  const validateMobileNumber = useCallback(
    (_, value) => {
      if (!value) return Promise.resolve();

      const valueStr = String(value);

      // Check if it contains only digits
      if (!/^\d+$/.test(valueStr)) {
        return Promise.reject(
          new Error("Mobile number should contain only digits!")
        );
      }

      // Check expected length based on country code
      const countryCode = form.getFieldValue("mobileCountryCode") || "91";
      const expectedLength = countryCodeLengthMap[countryCode];

      if (expectedLength && valueStr.length !== expectedLength) {
        return Promise.reject(
          new Error(
            `Mobile number should be ${expectedLength} digits for country code +${countryCode}`
          )
        );
      }

      return Promise.resolve();
    },
    [form]
  );

  // Handle country code change
  const handleCountryCodeChange = useCallback(
    value => {
      setSelectedCountryCode(value);
      // Clear the mobile number when country changes to enforce new validation
      form.setFieldsValue({
        mobileNumber: undefined,
      });
    },
    [form]
  );

  // Handle mobile number input change
  const handleMobileNumberChange = useCallback(
    value => {
      let numericValue = value.replace(/[^\d]/g, "");

      const countryCode = form.getFieldValue("mobileCountryCode") || "91";
      const expectedLength = countryCodeLengthMap[countryCode];

      // prevent typing more than allowed digits
      if (expectedLength && numericValue.length > expectedLength) {
        numericValue = numericValue.slice(0, expectedLength);
      }

      form.setFieldsValue({ mobileNumber: numericValue });

      // Trigger search for customer suggestions
      if (numericValue.length >= 2) {
        const fullNumber = countryCode + numericValue;
        handleNumberSearch(numericValue);
      } else if (!numericValue) {
        handleNumberSearch("");
      }
    },
    [form]
  );

  // Handle customer name input change
  const handleCustomerNameChange = useCallback(
    value => {
      // Clean the input - allow only letters and spaces, then trim
      const cleanedValue = value.replace(/[^A-Za-z\s]/g, "").trim();

      form.setFieldsValue({ customerName: cleanedValue });

      // Trigger search for customer suggestions
      if (cleanedValue.length >= 2) {
        handleNameSearch(cleanedValue);
      } else if (!cleanedValue) {
        handleNameSearch("");
      }
    },
    [form]
  );

  // Initialize agents and departments
  useEffect(() => {
    // 1️⃣ ACTIVE SLA DEPARTMENTS ONLY
    const activeSLADepartments = staticSLAPolicies
      .filter(sla => sla.active === true && sla.department)
      .map(sla => sla.department);

    // 2️⃣ FILTER AGENTS WHO MATCH SLA DEPARTMENTS
    const filteredAgents = staticAgents.filter(agent => {
      if (!agent.agentType?.ticketing || !agent.config?.ticketing)
        return false;

      const ticketingConfig = agent.config.ticketing;

      // Single department match
      if (
        ticketingConfig.department &&
        activeSLADepartments.includes(ticketingConfig.department)
      ) {
        return true;
      }

      // Multiple departments match
      if (Array.isArray(ticketingConfig.departments)) {
        return ticketingConfig.departments.some(dept =>
          activeSLADepartments.includes(dept)
        );
      }

      return false;
    });

    // 3️⃣ UNIQUE DEPARTMENTS (FROM AGENTS) BUT ONLY IF THEY EXIST IN ACTIVE SLA
    const uniqueAgentDepartments = [
      ...new Set(
        filteredAgents.flatMap(agent => {
          const ticketingConfig = agent.config.ticketing;
          const deps = [];

          if (
            ticketingConfig.department &&
            activeSLADepartments.includes(ticketingConfig.department)
          ) {
            deps.push(ticketingConfig.department);
          }

          if (Array.isArray(ticketingConfig.departments)) {
            deps.push(
              ...ticketingConfig.departments.filter(dept =>
                activeSLADepartments.includes(dept)
              )
            );
          }

          return deps;
        })
      ),
    ];

    // 4️⃣ SET AGENTS
    setTicketingAgents(filteredAgents);

    // 5️⃣ SET DEPARTMENTS
    setDepartments(uniqueAgentDepartments);
  }, []);

  // Watch department field value
  const selectedDepartment = Form.useWatch("department_field", form);

  // Update assignees when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const departmentAssignees = ticketingAgents
        .filter(
          agent =>
            agent.config.ticketing.department === selectedDepartment ||
            agent.config.ticketing?.departments?.includes(selectedDepartment)
        )
        .map(agent => agent.username)
        .filter(Boolean);

      setAssignees(departmentAssignees);

      const currentAssignedTo = form.getFieldValue("assignedTo");
      if (
        currentAssignedTo &&
        !departmentAssignees.includes(currentAssignedTo)
      ) {
        form.setFieldValue("assignedTo", undefined);
      }
    } else {
      setAssignees([]);
      form.setFieldValue("assignedTo", undefined);
    }
  }, [selectedDepartment, ticketingAgents, form]);

  // Handle file upload change for document fields
  const handleUploadChange = useCallback(
    (info, fieldKey) => {
      let fileList = [...info.fileList];

      // Only show the latest uploaded file
      fileList = fileList.slice(-1);

      // Update fileList state for this specific field
      setFileLists(prev => ({
        ...prev,
        [fieldKey]: fileList,
      }));

      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        // For static version, simulate a file URL
        const fileUrl = `https://example.com/uploads/${info.file.name}`;

        if (fileUrl) {
          form.setFieldsValue({
            [fieldKey]: fileUrl,
          });
        }
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    [form]
  );

  // Handle file remove for document fields
  const handleRemoveFile = useCallback(
    fieldKey => {
      setFileLists(prev => ({
        ...prev,
        [fieldKey]: [],
      }));
      form.setFieldsValue({
        [fieldKey]: undefined,
      });
    },
    [form]
  );

  // Set initial form values when modal opens or editingTicket changes
  useEffect(() => {
    if (!visible) return;

    if (editingTicket) {
      const initialValues = {
        ...editingTicket,
        dueDate: editingTicket.dueDate ? moment(editingTicket.dueDate) : null,
      };

      // Initialize fileLists for document fields
      const initialFileLists = {};

      // Set form values for all fields including custom ones
      formFields.forEach(field => {
        if (editingTicket[field.fieldKey] !== undefined) {
          initialValues[field.fieldKey] = editingTicket[field.fieldKey];

          // For document fields, set initial fileList if value exists
          if (field.fieldType === "document" && editingTicket[field.fieldKey]) {
            initialFileLists[field.fieldKey] = [
              {
                uid: "-1",
                name: "Current File",
                status: "done",
                url: editingTicket[field.fieldKey],
              },
            ];
          }
        }
      });

      // Set fileLists state
      setFileLists(initialFileLists);

      // Extract country code and mobile number if mobile number exists
      if (editingTicket.mobileNumber) {
        const mobileValue = editingTicket.mobileNumber.toString();
        // Try to extract country code
        let foundCountryCode = "91";
        let mobileWithoutCode = mobileValue;

        // Simple extraction
        for (const code of Object.keys(countryCodeLengthMap)) {
          if (mobileValue.startsWith(code)) {
            foundCountryCode = code;
            mobileWithoutCode = mobileValue.substring(code.length);
            break;
          }
        }

        initialValues.mobileCountryCode = foundCountryCode;
        initialValues.mobileNumber = mobileWithoutCode;
        setSelectedCountryCode(foundCountryCode);
      }

      form.setFieldsValue(initialValues);

      // Set assignees based on editing ticket's department
      if (editingTicket.department_field) {
        const departmentAssignees = ticketingAgents
          .filter(
            agent =>
              agent.config.ticketing.department ===
              editingTicket.department_field
          )
          .map(agent => agent.username)
          .filter(Boolean);
        setAssignees(departmentAssignees);
      }
    } else {
      // For new ticket, reset form and set default values
      form.resetFields();
      setAssignees([]);
      setSelectedCountryCode("91");
      setFileLists({});
      setSelectedCompanyName("");
      setIsCompanyFromCustomer(false);
      // Set default priority and country code
      form.setFieldsValue({
        mobileCountryCode: "91",
        companyName: "",
      });
    }
  }, [visible, editingTicket, form, formFields, ticketingAgents]);

  // Handle customer name search
  const handleNameSearch = useCallback(
    async value => {
      if (!hasFetchedInitial.name) {
        // First time - fetch last 10 customers
        setCustomerSuggestions(staticCustomers.slice(0, 10));
        setHasFetchedInitial(prev => ({
          ...prev,
          name: true,
        }));
      } else if (value && value.length >= 2) {
        // Search when user types 2 or more characters
        const filtered = staticCustomers.filter(customer =>
          customer.name.toLowerCase().includes(value.toLowerCase())
        );
        setCustomerSuggestions(filtered);
      } else if (!value) {
        // If user clears input, show last 10 again
        setCustomerSuggestions(staticCustomers.slice(0, 10));
      }
    },
    [hasFetchedInitial]
  );

  // Handle mobile number search
  const handleNumberSearch = useCallback(
    async value => {
      if (!hasFetchedInitial.name) {
        // First time - fetch last 10 customers
        setCustomerSuggestions(staticCustomers.slice(0, 10));
        setHasFetchedInitial(prev => ({
          ...prev,
          name: true,
        }));
      } else if (value && value.length >= 2) {
        // Combine country code with the search value
        const fullNumber = selectedCountryCode + value;
        const filtered = staticCustomers.filter(customer =>
          customer.fullMobile.includes(fullNumber)
        );
        setCustomerSuggestions(filtered);
      } else if (!value) {
        // If user clears input, show last 10 again
        setCustomerSuggestions(staticCustomers.slice(0, 10));
      }
    },
    [hasFetchedInitial, selectedCountryCode]
  );

  // Handle customer selection - fill both fields and company name
  const handleCustomerSelect = useCallback(
    (value, option) => {
      const customer = option.customer;
      if (customer) {
        const mobileValue = customer.fullMobile || customer.mobileNumber;
        let foundCountryCode = "91";
        let mobileWithoutCode = mobileValue;

        // Extract country code from the customer's mobile number
        if (mobileValue) {
          for (const code of Object.keys(countryCodeLengthMap)) {
            if (mobileValue.startsWith(code)) {
              foundCountryCode = code;
              mobileWithoutCode = mobileValue.substring(code.length);
              break;
            }
          }
        }

        // Set company name if available from customer
        if (customer.company) {
          setSelectedCompanyName(customer.company);
          setIsCompanyFromCustomer(true);
          form.setFieldsValue({
            companyName: customer.company,
          });
        } else {
          setSelectedCompanyName("");
          setIsCompanyFromCustomer(false);
          form.setFieldsValue({
            companyName: "",
          });
        }

        form.setFieldsValue({
          customerName: customer.name,
          mobileCountryCode: foundCountryCode,
          mobileNumber: mobileWithoutCode,
        });
        setSelectedCountryCode(foundCountryCode);
      }
      setCustomerSuggestions([]);
    },
    [form]
  );

  // Handle name selection
  const handleNameSelect = useCallback(
    (value, option) => {
      handleCustomerSelect(value, option);
    },
    [handleCustomerSelect]
  );

  // Handle number selection
  const handleNumberSelect = useCallback(
    (value, option) => {
      handleCustomerSelect(value, option);
    },
    [handleCustomerSelect]
  );

  // Handle company name input change
  const handleCompanyNameChange = useCallback(
    e => {
      const value = e.target.value;
      setSelectedCompanyName(value);
      setIsCompanyFromCustomer(false);
      form.setFieldsValue({
        companyName: value,
      });
    },
    [form]
  );

  // Format customer suggestions for AutoComplete
  const customerNameOptions = useMemo(() => {
    return customerSuggestions.map(customer => ({
      value: customer.name,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div>
            <div>
              <strong>{customer.name}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {customer.fullMobile || customer.mobileNumber}
            </div>
          </div>

          {/* Right-aligned company name */}
          {customer.company && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                color: "var(--primary)",
                whiteSpace: "nowrap",
              }}
            >
              <Building size={14} />
              <span>{customer.company}</span>
            </div>
          )}
        </div>
      ),
      customer: customer,
    }));
  }, [customerSuggestions]);

  const customerNumberOptions = useMemo(() => {
    return customerSuggestions.map(customer => ({
      value: customer.fullMobile || customer.mobileNumber,
      label: (
        <div>
          <div>
            <strong>{customer.fullMobile || customer.mobileNumber}</strong>
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>{customer.name}</div>
          {customer.company && (
            <div style={{ fontSize: "12px", color: "var(--primary)" }}>
              <Building size={12} style={{ marginRight: "4px" }} />
              {customer.company}
            </div>
          )}
        </div>
      ),
      customer: customer,
    }));
  }, [customerSuggestions]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const selectedAgent = ticketingAgents.find(
        agent => agent.username === values.assignedTo
      );

      // Combine country code and mobile number
      const fullMobileNumber = values.mobileCountryCode + values.mobileNumber;

      // Prepare ticket data - handle dueDate properly
      const ticketData = {
        ...values,
        mobileNumber: fullMobileNumber,
        agentNumber: selectedAgent?.mobilenumber || null,
      };

      // Remove the separate country code field from the final data
      delete ticketData.mobileCountryCode;

      // Convert dueDate to string format if it exists
      if (values.dueDate && moment.isMoment(values.dueDate)) {
        ticketData.dueDate = values.dueDate.toISOString();
      } else if (values.dueDate) {
        // If it's already a string, keep it as is
        ticketData.dueDate = values.dueDate;
      } else {
        ticketData.dueDate = "";
      }

      // Prepare lead update if company name was manually entered
      let leadUpdate = null;
      if (values.companyName && !isCompanyFromCustomer) {
        leadUpdate = {
          companyName: values.companyName,
        };
      }

      console.log(
        "Submitting ticket data:",
        ticketData,
        "Lead update:",
        leadUpdate
      );
      onSubmit({ values: ticketData, leadUpdate });
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  }, [form, editingTicket, onSubmit, ticketingAgents, isCompanyFromCustomer]);

  const renderFieldComponent = useCallback(
    field => {
      const commonProps = {
        placeholder: field.placeholder || `Enter ${field.fieldName}`,
      };

      switch (field.fieldType) {
        case "text":
          return <Input {...commonProps} maxLength={field.maxLength} />;

        case "textarea":
          return (
            <TextArea
              {...commonProps}
              rows={field.rows || 4}
              maxLength={field.maxLength}
              showCount
            />
          );

        case "textinput":
          return (
            <Input {...commonProps} maxLength={field.maxLength} showCount />
          );

        case "select":
        case "dropdown":
          if (field.fieldKey === "department_field") {
            return (
              <Select {...commonProps}>
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            );
          }
          return (
            <Select {...commonProps}>
              {field.options?.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          );

        case "date":
          return (
            <DatePicker
              {...commonProps}
              style={{ width: "100%" }}
              format='DD/MM/YYYY'
            />
          );

        case "checkbox":
          return (
            <Checkbox.Group>
              <Row gutter={[8, 8]}>
                {field.options?.map((option, index) => (
                  <Col span={24} key={index}>
                    <Checkbox value={option}>{option}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          );

        case "radio":
          return (
            <Select {...commonProps}>
              {field.options?.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          );

        case "document":
          return (
            <Upload
              name='file'
              maxCount={1}
              accept='.jpg,.jpeg,.png,.pdf,.doc,.docx,.txt'
              fileList={fileLists[field.fieldKey] || []}
              beforeUpload={file => {
                const isAllowedType =
                  file.type.startsWith("image/") ||
                  file.type === "application/pdf" ||
                  file.type === "application/msword" ||
                  file.type ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                  file.type === "text/plain";

                if (!isAllowedType) {
                  message.error(
                    "Only image, PDF, Word, and text files are allowed!"
                  );
                  return Upload.LIST_IGNORE;
                }

                // For static version, simulate upload success
                setTimeout(() => {
                  handleUploadChange(
                    {
                      file: {
                        ...file,
                        status: "done",
                        response: { fileUrl: `https://example.com/uploads/${file.name}` },
                      },
                      fileList: [...(fileLists[field.fieldKey] || []), file],
                    },
                    field.fieldKey
                  );
                }, 1000);

                return false; // Prevent actual upload
              }}
              onRemove={() => handleRemoveFile(field.fieldKey)}
            >
              <Button
                icon={<UploadOutlined />}
                style={{ width: "100%", borderRadius: "10px" }}
              >
                Upload File
              </Button>
            </Upload>
          );

        default:
          return <Input {...commonProps} />;
      }
    },
    [
      departments,
      selectedDepartment,
      assignees,
      fileLists,
      handleUploadChange,
      handleRemoveFile,
    ]
  );

  useEffect(() => {
    if (!visible) {
      setHasFetchedInitial({ name: false, number: false });
      setFileLists({});
      setSelectedCompanyName("");
      setIsCompanyFromCustomer(false);
    }
  }, [visible]);

  return (
    <Modal
      title={editingTicket ? "Edit Ticket" : "Create New Ticket"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      style={{ top: 20 }}
      okText={editingTicket ? "Update Ticket" : "Create Ticket"}
      cancelText='Cancel'
      confirmLoading={loading}
      destroyOnClose
      maskClosable={false}
      afterClose={() => {
        form.resetFields();
        setAssignees([]);
        setCustomerSuggestions([]);
        setSelectedCountryCode("91");
        setHasFetchedInitial({ name: false, number: false });
        setFileLists({});
        setSelectedCompanyName("");
        setIsCompanyFromCustomer(false);
      }}
    >
      <Form form={form} layout='vertical' className='mt-4'>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name='department_field'
              label={departmentField?.fieldName || "Department"}
              rules={[
                {
                  required: departmentField?.mandatory || true,
                  message: `Please select ${departmentField?.fieldName?.toLowerCase() || "department"
                    }`,
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp='children'
                allowClear
                placeholder={
                  departmentField?.placeholder || "Select department"
                }
              >
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No departments found</Option>
                )}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='assignedTo' label='Assign To'>
              <Select
                showSearch
                optionFilterProp='children'
                allowClear
                placeholder={
                  selectedDepartment
                    ? "Select assignee"
                    : "Select department first"
                }
                disabled={!selectedDepartment}
              >
                {assignees.map(assignee => (
                  <Option key={assignee} value={assignee}>
                    {assignee}
                  </Option>
                ))}
                {assignees.length === 0 && selectedDepartment && (
                  <Option disabled value='no-users'>
                    No assignees found for this department
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name='priority'
              label='Priority'
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select placeholder='Select priority' allowClear>
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='customerName'
              label='Customer Name'
              rules={[
                { required: true, message: "Please enter customer name" },
              ]}
            >
              <AutoComplete
                options={customerNameOptions}
                onSearch={value => {
                  if (value && value.length >= 2) {
                    const filtered = staticCustomers.filter(customer =>
                      customer.name.toLowerCase().includes(value.toLowerCase())
                    );
                    setCustomerSuggestions(filtered);
                  } else if (!value) {
                    setCustomerSuggestions(staticCustomers.slice(0, 10));
                  }
                }}
                onSelect={handleNameSelect}
                onFocus={() => {
                  if (!hasFetchedInitial.name) {
                    setCustomerSuggestions(staticCustomers.slice(0, 10));
                    setHasFetchedInitial(prev => ({
                      ...prev,
                      name: true,
                    }));
                  }
                }}
                placeholder='Enter customer name'
                onChange={value => {
                  const cleaned = value.replace(/[^A-Za-z ]/g, "");
                  form.setFieldsValue({ customerName: cleaned });
                  if (cleaned && cleaned.length >= 2) {
                    const filtered = staticCustomers.filter(customer =>
                      customer.name.toLowerCase().includes(cleaned.toLowerCase())
                    );
                    setCustomerSuggestions(filtered);
                  }
                }}
                onKeyDown={e => {
                  const key = e.key;

                  // allow letters & space
                  if (/^[A-Za-z ]$/.test(key)) return;

                  // block numbers & symbols
                  if (key.length === 1) e.preventDefault();
                }}
                onPaste={e => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text");
                  const cleaned = pasted.replace(/[^A-Za-z ]/g, "");
                  form.setFieldsValue({ customerName: cleaned });
                  // Trigger search with the cleaned value
                  if (cleaned && cleaned.length >= 2) {
                    const filtered = staticCustomers.filter(customer =>
                      customer.name.toLowerCase().includes(cleaned.toLowerCase())
                    );
                    setCustomerSuggestions(filtered);
                  }
                }}
                notFoundContent={
                  "No customers found"
                }
                filterOption={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='mobileNumber'
              label='Mobile Number'
              rules={[
                { required: true, message: "Please enter mobile number" },
                { validator: validateMobileNumber },
              ]}
            >
              <Input.Group compact style={{ display: "flex" }}>
                <Form.Item
                  name='mobileCountryCode'
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: "Please select country code",
                    },
                  ]}
                  initialValue='91'
                >
                  <Select
                    showSearch
                    placeholder='Code'
                    style={{ width: "140px" }}
                    options={optionsCountry}
                    onChange={handleCountryCodeChange}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item name='mobileNumber' noStyle>
                  <AutoComplete
                    options={customerNumberOptions}
                    onSearch={value => {
                      if (value && value.length >= 2) {
                        const fullNumber = selectedCountryCode + value;
                        const filtered = staticCustomers.filter(customer =>
                          customer.fullMobile.includes(fullNumber)
                        );
                        setCustomerSuggestions(filtered);
                      } else if (!value) {
                        setCustomerSuggestions(staticCustomers.slice(0, 10));
                      }
                    }}
                    onSelect={handleNumberSelect}
                    onFocus={() => {
                      if (!hasFetchedInitial.number) {
                        setCustomerSuggestions(staticCustomers.slice(0, 10));
                        setHasFetchedInitial(prev => ({
                          ...prev,
                          number: true,
                        }));
                      }
                    }}
                    placeholder={`Enter ${expectedMobileLength} digit number`}
                    maxLength={expectedMobileLength}
                    notFoundContent={"No customers found"}
                    filterOption={false}
                    style={{
                      width: "calc(100% - 140px)",
                      borderRadius: "0 8px 8px 0",
                    }}
                    onChange={handleMobileNumberChange}
                    onKeyPress={e => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();

                      const pastedData = e.clipboardData.getData("text");
                      const numericOnly = pastedData.replace(/[^\d]/g, "");

                      const trimmedValue = numericOnly.slice(
                        0,
                        expectedMobileLength
                      );

                      form.setFieldsValue({
                        mobileNumber: trimmedValue,
                      });

                      if (trimmedValue && trimmedValue.length >= 2) {
                        const fullNumber = selectedCountryCode + trimmedValue;
                        const filtered = staticCustomers.filter(customer =>
                          customer.fullMobile.includes(fullNumber)
                        );
                        setCustomerSuggestions(filtered);
                      }
                    }}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        {/* Company Name Field */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='companyName' label='Company Name'>
              <Input
                placeholder='Enter company name'
                disabled={isCompanyFromCustomer}
                value={selectedCompanyName}
                onChange={handleCompanyNameChange}
                addonBefore={
                  isCompanyFromCustomer ? (
                    <Building size={14} style={{ color: "var(--primary)" }} />
                  ) : null
                }
              />
            </Form.Item>
            {isCompanyFromCustomer && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "-8px",
                  marginBottom: "16px",
                }}
              >
                Company name from customer profile
              </div>
            )}
          </Col>
        </Row>

        {formFields
          .filter(
            field =>
              ![
                "department_field",
                "assignedTo",
                "priority",
                "customerName",
                "mobileNumber",
                "mobileCountryCode",
                "companyName",
              ].includes(field.fieldKey)
          )
          .map(field => (
            <Form.Item
              key={field.fieldKey}
              name={field.fieldKey}
              label={field.fieldName}
              rules={[
                {
                  required: field.mandatory,
                  message: `Please ${field.fieldType === "select" || field.fieldType === "dropdown" || field.fieldType === "radio" ? "select" : field.fieldType === "document" ? "upload" : "enter"} ${field.fieldName.toLowerCase()}`,
                },
              ]}
            >
              {renderFieldComponent(field)}
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
};

export default AddEditTicketModal;