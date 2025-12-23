import React, { useState, useEffect, useMemo } from "react";
// import Configuration from "./Configuration";
import ReminderModal from "./Modules/ReminderModal";
import SendTemplate from "./Modules/SendTemplate";
import { useSnackbar } from "notistack";
import moment from "moment";
import Breadcrumb from "../../Breadcrumb";
import ComposeModals from "./Modules/ComposeModals";
import countryCodeLengthMap from "./countryCode";
import ImportLeadsModal from "./Modules/ImportLeadsModal";
import LeadsToCustomer from "./LeadsToCustomer";
import {
    Tabs,
    Button,
    Card,
    Form,
    Input,
    Select,
    Table,
    Tag,
    Space,
    Modal,
    Divider,
    Row,
    Col,
    InputNumber,
    Dropdown,
    Menu,
    Checkbox,
    Upload,
    message,
    Tooltip,
    Typography,
    DatePicker,
    TimePicker,
    AutoComplete,
    Drawer,
    Badge,
    Popconfirm,
    Spin,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    DownloadOutlined,
    UploadOutlined,
    BellOutlined,
    UserOutlined,
    FileTextOutlined,
    MessageOutlined,
    SendOutlined,
    AppstoreOutlined,
    TableOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import AppointmentWorkers from "../../components/Global/CrmPopup";
import { color } from "framer-motion";
import { AUTHORIZED_EMAILS } from "./index";
import MasterLayout from "../../../masterLayout/MasterLayout";


const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Static data for leads
const STATIC_LEADS = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        mobile: "9876543210",
        fullMobile: "919876543210",
        company: "TechCorp Inc",
        status: "New Lead",
        source: "Website",
        assigned: "admin@example.com",
        assignedAgent: "admin@example.com",
        product: "Enterprise Suite",
        address: "123 Main St, San Francisco",
        city: "San Francisco",
        country: "USA",
        website: "https://techcorp.com",
        leadValue: 50000,
        tags: ["Enterprise", "Tech"],
        description: "Interested in enterprise solutions",
        notes: "Follow up next week",
        isConverted: false,
        countryCode: "91",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        mobile: "8765432109",
        fullMobile: "918765432109",
        company: "MarketingPro",
        status: "Warm",
        source: "Referral",
        assigned: "agent1@example.com",
        assignedAgent: "agent1@example.com",
        product: "Marketing Platform",
        address: "456 Oak Ave, New York",
        city: "New York",
        country: "USA",
        website: "https://marketingpro.com",
        leadValue: 30000,
        tags: ["Marketing", "SMB"],
        description: "Looking for marketing automation",
        notes: "Sent proposal",
        isConverted: false,
        countryCode: "91",
        createdAt: "2024-01-10T14:20:00Z",
        updatedAt: "2024-01-12T11:15:00Z",
    },
    {
        id: "3",
        name: "Robert Johnson",
        email: "robert.j@example.com",
        mobile: "7654321098",
        fullMobile: "917654321098",
        company: "FinanceGlobal",
        status: "Hot",
        source: "Social Media",
        assigned: "admin@example.com",
        assignedAgent: "admin@example.com",
        product: "Finance Suite",
        address: "789 Finance Blvd, London",
        city: "London",
        country: "UK",
        website: "https://financeglobal.com",
        leadValue: 75000,
        tags: ["Finance", "Enterprise"],
        description: "Urgent need for finance software",
        notes: "High priority",
        isConverted: false,
        countryCode: "44",
        createdAt: "2024-01-05T09:15:00Z",
        updatedAt: "2024-01-08T16:45:00Z",
    },
    {
        id: "4",
        name: "Sarah Williams",
        email: "sarah.w@example.com",
        mobile: "6543210987",
        fullMobile: "916543210987",
        company: "RetailPlus",
        status: "Converted",
        source: "Website",
        assigned: "agent2@example.com",
        assignedAgent: "agent2@example.com",
        product: "Retail System",
        address: "321 Retail St, Chicago",
        city: "Chicago",
        country: "USA",
        website: "https://retailplus.com",
        leadValue: 45000,
        tags: ["Retail", "commerce"],
        description: "Converted to customer",
        notes: "Successfully onboarded",
        isConverted: true,
        conversionDate: "2024-01-20",
        countryCode: "1",
        createdAt: "2023-12-20T13:45:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
    },
];

// Static configuration data
const STATIC_CONFIG = {
    data: {
        leadFields: [
            { fieldKey: "name", fieldName: "Name", displayInTable: true, mandatory: true, fieldType: "text" },
            { fieldKey: "email", fieldName: "Email", displayInTable: true, mandatory: false, fieldType: "email" },
            { fieldKey: "mobile", fieldName: "Mobile", displayInTable: true, mandatory: false, fieldType: "text" },
            { fieldKey: "company", fieldName: "Company", displayInTable: true, mandatory: true, fieldType: "text", options: ["TechCorp Inc", "MarketingPro", "FinanceGlobal", "RetailPlus", "HealthcarePro", "StartUpXYZ"] },
            { fieldKey: "position", fieldName: "Position", displayInTable: true, mandatory: false, fieldType: "text" },
            { fieldKey: "status", fieldName: "Status", displayInTable: true, mandatory: true, fieldType: "select", options: ["New Lead", "Warm", "Hot", "Cold", "Invalid"] },
            { fieldKey: "source", fieldName: "Source", displayInTable: true, mandatory: true, fieldType: "select", options: ["Website", "Referral", "Social Media", "Email Campaign", "Event", "Other"] },
            { fieldKey: "assigned", fieldName: "Assigned", displayInTable: true, mandatory: true, fieldType: "select" },
            { fieldKey: "product", fieldName: "Product", displayInTable: true, mandatory: false, fieldType: "select", options: ["Enterprise Suite", "Marketing Platform", "Finance Suite", "Retail System", "Healthcare Platform", "Basic Plan"] },
            { fieldKey: "address", fieldName: "Address", displayInTable: true, mandatory: false, fieldType: "textarea" },
            { fieldKey: "city", fieldName: "City", displayInTable: true, mandatory: false, fieldType: "text" },
            { fieldKey: "country", fieldName: "Country", displayInTable: true, mandatory: false, fieldType: "text" },
            { fieldKey: "website", fieldName: "Website", displayInTable: true, mandatory: false, fieldType: "text" },
            { fieldKey: "leadValue", fieldName: "Lead Value", displayInTable: true, mandatory: false, fieldType: "number" },
            { fieldKey: "tags", fieldName: "Tags", displayInTable: true, mandatory: false, fieldType: "tags" },
            { fieldKey: "description", fieldName: "Description", displayInTable: true, mandatory: false, fieldType: "textarea" },
            { fieldKey: "countryCode", fieldName: "Country Code", displayInTable: false, mandatory: true, fieldType: "select" },
            { fieldKey: "custom_field1", fieldName: "Custom Field 1", displayInTable: true, mandatory: false, fieldType: "text", options: [] },
            { fieldKey: "custom_field2", fieldName: "Custom Field 2", displayInTable: true, mandatory: false, fieldType: "select", options: ["Option 1", "Option 2", "Option 3"] },
        ]
    }
};

// Static agent data
const STATIC_AGENTS = [
    { _id: "1", email: "admin@example.com", role: "superadmin", agentType: { leads: true } },
    { _id: "2", email: "agent1@example.com", role: "agent", agentType: { leads: true } },
    { _id: "3", email: "agent2@example.com", role: "agent", agentType: { leads: true } },
    { _id: "4", email: "agent3@example.com", role: "agent", agentType: { leads: false } },
];

// Static countries data
const STATIC_COUNTRIES = {
    data: [
        { name: "United States", dial_code: "1" },
        { name: "United Kingdom", dial_code: "44" },
        { name: "India", dial_code: "91" },
        { name: "Australia", dial_code: "61" },
        { name: "Canada", dial_code: "1" },
        { name: "Germany", dial_code: "49" },
        { name: "France", dial_code: "33" },
        { name: "Japan", dial_code: "81" },
    ]
};

// Static templates data
const STATIC_TEMPLATES = [
    {
        id: "1",
        name: "Welcome Template",
        message: "Welcome to our platform! We're excited to have you.",
        header: "Welcome Header",
        footer: "Best regards",
        examples: { name: "Customer Name", company: "Company Name" },
        headerType: "text",
        actions: []
    },
    {
        id: "2",
        name: "Follow Up Template",
        message: "Hi {{1}}, just following up on our conversation about {{2}}.",
        header: "Follow Up",
        footer: "Looking forward to your response",
        examples: ["Customer Name", "Product Name"],
        headerType: "text",
        actions: []
    },
    {
        id: "3",
        name: "Offer Template",
        message: "Special offer just for you! Get 20% off on our premium plan.",
        header: "Special Offer",
        footer: "Limited time offer",
        examples: {},
        headerType: "image",
        actions: [{ type: "url", url: "https://example.com/offer" }]
    }
];

const Leads = () => {
    // Replace API hooks with static data
    const configData = STATIC_CONFIG;
    const configLoading = false;
    const refetchConfig = () => console.log("Refetch config called");

    const leadsData = { data: STATIC_LEADS };
    const leadsLoading = false;
    const refetchLeads = () => console.log("Refetch leads called");

    const agentDatas = { data: STATIC_AGENTS };
    const agentLoading = false;
    const refetchAgent = () => console.log("Refetch agent called");

    const allCountries = STATIC_COUNTRIES;

    // Mock assignAgent function
    const assignAgent = async () => {
        console.log("Assign agent called");
        return { success: true };
    };

    const agentData = STATIC_AGENTS.filter(agent => {
        if (agent.role === "superadmin") return true;
        if (agent.role === "agent" && agent.agentType?.leads) return true;
        return false;
    });

    // Mock Facebook data
    const authData = { authUrl: "https://facebook.com/auth" };
    const authLoading = false;
    const authError = null;

    const [selectedPage, setSelectedPage] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [importProgress, setImportProgress] = useState(null);

    const formsData = { data: [{ id: "1", name: "Contact Form" }, { id: "2", name: "Quote Request" }] };
    const formsLoading = false;

    const connectedPages = { data: [{ id: "1", name: "Business Page" }] };
    const pagesLoading = false;
    const refetchPages = () => console.log("Refetch pages called");

    // Mock import function
    const importLeads = async () => {
        console.log("Import leads called");
        return {
            data: {
                imported: 5,
                skipped: 2,
                errors: 0
            }
        };
    };
    const isImporting = false;

    const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Mock mutation functions
    const createLead = async () => {
        console.log("Create lead called");
        return { success: true };
    };
    const creating = false;

    const updateLead = async () => {
        console.log("Update lead called");
        return { success: true };
    };
    const updating = false;

    const deleteLead = async () => {
        console.log("Delete lead called");
        return { success: true };
    };
    const deleting = false;

    const bulkDeleteLeads = async () => {
        console.log("Bulk delete leads called");
        return { success: true };
    };
    const bulkDeleting = false;

    const updateField = async () => {
        console.log("Update field called");
        return { success: true };
    };

    const [isBulkUpdateModalVisible, setIsBulkUpdateModalVisible] = useState(false);
    const [bulkStatusValue, setBulkStatusValue] = useState("");
    const [bulkAssignedValue, setBulkAssignedValue] = useState("");
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("leads");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [newSource, setNewSource] = useState("");
    const [newProduct, setNewProduct] = useState("");
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState([]);
    const [showStatusAdd, setShowStatusAdd] = useState(false);
    const [showSourceAdd, setShowSourceAdd] = useState(false);
    const [showProductAdd, setShowProductAdd] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedAssigned, setSelectedAssigned] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [newCompany, setNewCompany] = useState("");
    const [editingLead, setEditingLead] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [composeModalOpen, setComposeModalOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [viewType, setViewType] = useState("table");
    const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
    const [syncStats, setSyncStats] = useState(null);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [selectedSource, setSelectedSource] = useState("");
    const [sendNewLeadAlert, setSendNewLeadAlert] = useState(false);
    const [sendingAlert, setSendingAlert] = useState(false);
    const [globalDateRange, setGlobalDateRange] = useState([]);

    // Mock bulk create function
    const bulkCreateLeadsMutation = async () => {
        console.log("Bulk create leads called");
        return { success: true };
    };
    const bulkCreating = false;

    // Mock sync function
    const syncWhatsAppContacts = async () => {
        console.log("Sync WhatsApp contacts called");
        return {
            message: "Sync completed successfully",
            data: {
                created: 3,
                skipped: 1,
                errors: 0
            }
        };
    };
    const syncingContacts = false;

    const handleSyncContacts = () => {
        setIsSyncModalVisible(true);
    };

    // Main const for agent login data splitting
    const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");
    const hasToken = !!loginData.plan;
    const loggedInEmail = loginData?.email || "admin@example.com";
    const hasPlan = !!loginData?.plan;

    // Facebook handlers
    const handleConnect = () => {
        if (authData?.authUrl) {
            window.open(authData.authUrl, "_blank", "width=600,height=700");
            setTimeout(() => {
                refetchPages();
            }, 3000);
        } else if (authError) {
            message.error("Failed to load Facebook authorization URL");
        }
    };

    const handleImport = async () => {
        if (!selectedPage || !selectedForm) {
            message.warning("Please select both page and form");
            return;
        }

        setImportProgress({ status: "importing", count: 0 });

        try {
            const res = await importLeads({
                pageId: selectedPage,
                formId: selectedForm,
            });

            setImportProgress({
                status: "complete",
                ...res.data,
            });

            message.success(
                `✅ ${res.data.imported} leads imported, ${res.data.skipped} duplicates skipped`
            );

            refetchLeads();

            setTimeout(() => {
                setImportProgress(null);
                setSelectedForm(null);
            }, 3000);
        } catch (error) {
            setImportProgress({ status: "error" });
            console.error("Import error:", error);
            message.error(error?.data?.message || "Failed to import leads");
        }
    };

    const handleSyncConfirm = async () => {
        try {
            const result = await syncWhatsAppContacts();

            enqueueSnackbar(result.message, {
                variant: "success",
                autoHideDuration: 3000,
            });

            setSyncStats(result.data);
            refetchLeads();
        } catch (error) {
            console.error("Error syncing contacts:", error);
            enqueueSnackbar("Failed to sync WhatsApp contacts", {
                variant: "error",
                autoHideDuration: 3000,
            });
            setIsSyncModalVisible(false);
        }
    };

    // Assign agent helper
    const assignLeadAgent = async (assignedEmail, fullMobile) => {
        if (!assignedEmail || !fullMobile) {
            console.log("Missing assignedEmail or fullMobile, skipping assignment");
            return;
        }

        const agentObj = agentData?.find(a => a.email === assignedEmail);

        if (!agentObj) {
            console.log("Agent not found for email:", assignedEmail);
            return;
        }

        if (agentObj.role === "superadmin") {
            console.log("Skipping assignment for superadmin");
            return;
        }

        if (agentObj.role !== "agent" || !agentObj.agentType?.leads) {
            console.log("Agent doesn't have leads permission");
            return;
        }

        try {
            console.log("Assigning agent:", {
                agentId: agentObj._id,
                email: assignedEmail,
                fullMobile: fullMobile,
            });

            const response = await assignAgent({
                agentIds: [agentObj._id],
                userNumber: fullMobile,
            });

            console.log("Assignment successful:", response);

            enqueueSnackbar("Agent assigned successfully", {
                variant: "success",
                autoHideDuration: 2000,
            });
        } catch (error) {
            console.error("Error assigning agent:", error);
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
            newOptions.splice(0, 0, {
                key: `+${91} ${"India"}`,
                label: `+${91} ${"India"}`,
                value: "91",
            });

            return newOptions;
        } else {
            return [];
        }
    }, [allCountries]);

    const handleSyncCancel = () => {
        setIsSyncModalVisible(false);
        setSyncStats(null);
    };

    // Mock duplicate check data
    const duplicateCheckData = { data: STATIC_LEADS };
    const duplicateCheckLoading = false;

    // Use static leads data
    const rawLeads = leadsData?.data || [];

    // Filter leads based on agent login
    const leads = React.useMemo(() => {
        if (!hasPlan && loggedInEmail) {
            return rawLeads.filter(
                lead =>
                    lead.assigned === loggedInEmail ||
                    lead.assignedAgent === loggedInEmail
            );
        }
        return rawLeads;
    }, [rawLeads, hasPlan, loggedInEmail]);

    const [companyOption, setCompanyOption] = useState(
        configData?.data?.leadFields?.find(field => field.fieldKey === "company")
            ?.options || []
    );

    useEffect(() => {
        if (configData?.data?.leadFields) {
            const backendOptions =
                configData.data.leadFields.find(field => field.fieldKey === "company")
                    ?.options || [];
            setCompanyOption(backendOptions);
        }
    }, [configData]);

    useEffect(() => {
        let count = 0;

        if (selectedAssigned) count++;
        if (selectedCompany) count++;
        if (selectedStatus) count++;
        if (selectedSource) count++;

        if (globalDateRange && globalDateRange.length === 2) count++;

        setActiveFiltersCount(count);
    }, [
        selectedAssigned,
        selectedCompany,
        selectedStatus,
        selectedSource,
        globalDateRange,
    ]);

    // New states for description modal in Kanban
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [currentEditingLead, setCurrentEditingLead] = useState(null);

    const SPECIAL_EMAILS = AUTHORIZED_EMAILS;
    const [showModal, setShowModal] = useState(false);
    const [shouldRenderDashboard, setShouldRenderDashboard] = useState(false);

    const [customFieldsData, setCustomFieldsData] = useState(() => {
        const savedFields = localStorage.getItem("customFieldsData");
        return savedFields ? JSON.parse(savedFields) : [];
    });

    const [isSendTemplateModalVisible, setIsSendTemplateModalVisible] = useState(false);
    const [selectedLeadForTemplate, setSelectedLeadForTemplate] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        selectedVariableValuesObj: {},
        fileUrl: "",
    });
    const [templateVariables, setTemplateVariables] = useState([]);
    const [fileList, setFileList] = useState([]);

    // Use static templates data
    const approvedTemplatesRaw = STATIC_TEMPLATES;
    const templatesLoading = false;
    const templatesError = null;

    const variablePattern = /\{\{.*?\}\}/;

    const allTemplates = approvedTemplatesRaw.filter(template => {
        if (
            variablePattern.test(template?.message || "") ||
            variablePattern.test(template?.header || "") ||
            variablePattern.test(template?.footer || "")
        ) {
            return false;
        }

        if (
            template?.actions?.some(
                action =>
                    action &&
                    action.type === "url" &&
                    variablePattern.test(action.url || "")
            )
        ) {
            return false;
        }

        return true;
    });

    useEffect(() => {
        if (configData?.data?.leadFields) {
            const customFields = configData.data.leadFields
                .filter(field => field.fieldKey.startsWith("custom_"))
                .map(field => ({
                    key: field.fieldKey,
                    name: field.fieldName,
                    type: field.fieldType,
                    options: field.options || [],
                }));

            setCustomFieldsData(customFields);
            localStorage.setItem("customFieldsData", JSON.stringify(customFields));
        }
    }, [configData]);

    const fieldConfig = React.useMemo(() => {
        if (!configData?.data?.leadFields) return {};

        const config = {};
        configData.data.leadFields.forEach(field => {
            config[field.fieldKey] = field.displayInTable;
        });

        return config;
    }, [configData]);

    const mandatoryConfig = React.useMemo(() => {
        if (!configData?.data?.leadFields) return {};

        const config = {};
        configData.data.leadFields.forEach(field => {
            config[field.fieldKey] = field.mandatory;
        });

        return config;
    }, [configData]);

    const statusOptions = configData?.data?.leadFields?.find(
        field => field.fieldKey === "status"
    )?.options || ["New Lead", "Hot", "Warm", "Cold", "Invalid"];

    const sourceOptions = configData?.data?.leadFields?.find(
        field => field.fieldKey === "source"
    )?.options || ["Website", "Referral", "Social Media"];

    const productOptions = configData?.data?.leadFields?.find(
        field => field.fieldKey === "product"
    )?.options || [];

    // Bulk status update handler
    const handleBulkUpdate = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one lead to update");
            return;
        }

        if (!bulkStatusValue && !bulkAssignedValue) {
            message.warning(
                "Please select at least one field to update (Status or Assigned)"
            );
            return;
        }

        setBulkUpdating(true);

        try {
            const selectedLeads = leads.filter(lead =>
                selectedRowKeys.includes(lead.id)
            );

            let leadsToUpdate = selectedLeads;
            let convertedLeadsCount = 0;

            if (bulkStatusValue) {
                const convertedLeads = selectedLeads.filter(
                    lead => lead.isConverted || lead.status === "Converted"
                );
                convertedLeadsCount = convertedLeads.length;

                if (convertedLeadsCount > 0) {
                    return new Promise((resolve, reject) => {
                        Modal.confirm({
                            title: "Warning: Converted Leads Detected",
                            content: `${convertedLeadsCount} of the selected leads are already converted and cannot have their status changed. Do you want to proceed with updating the remaining leads?`,
                            okText: "Yes, Continue",
                            cancelText: "Cancel",
                            icon: <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />,
                            async onOk() {
                                leadsToUpdate = selectedLeads.filter(
                                    lead => !lead.isConverted && lead.status !== "Converted"
                                );

                                if (leadsToUpdate.length === 0 && !bulkAssignedValue) {
                                    enqueueSnackbar(
                                        "No leads available to update (all selected leads are converted)",
                                        {
                                            variant: "warning",
                                            autoHideDuration: 3000,
                                        }
                                    );
                                    setBulkUpdating(false);
                                    setIsBulkUpdateModalVisible(false);
                                    setBulkStatusValue("");
                                    setBulkAssignedValue("");
                                    return;
                                }

                                await performBulkUpdate(
                                    leadsToUpdate,
                                    selectedLeads,
                                    convertedLeadsCount
                                );
                                resolve();
                            },
                            onCancel() {
                                setBulkUpdating(false);
                                reject();
                            },
                        });
                    });
                }
            }

            await performBulkUpdate(
                leadsToUpdate,
                selectedLeads,
                convertedLeadsCount
            );
        } catch (error) {
            console.error("Error in bulk update:", error);
            if (error !== undefined) {
                enqueueSnackbar("Failed to update leads", {
                    variant: "error",
                    autoHideDuration: 3000,
                });
            }
            setBulkUpdating(false);
        }
    };

    const performBulkUpdate = async (
        leadsToUpdate,
        allSelectedLeads,
        convertedLeadsSkipped
    ) => {
        try {
            let statusSuccessCount = 0;
            let statusFailCount = 0;
            let assignedSuccessCount = 0;
            let assignedFailCount = 0;
            const errors = [];

            const leadsForStatusUpdate = bulkStatusValue ? leadsToUpdate : [];
            const leadsForAssignedUpdate = bulkAssignedValue ? allSelectedLeads : [];

            if (bulkStatusValue && bulkAssignedValue) {
                for (const lead of leadsToUpdate) {
                    try {
                        await updateLead({
                            leadId: lead.id,
                            status: bulkStatusValue,
                            assigned: bulkAssignedValue,
                            assignedAgent: bulkAssignedValue,
                        });

                        statusSuccessCount++;
                        assignedSuccessCount++;

                        if (lead.fullMobile) {
                            await assignLeadAgent(bulkAssignedValue, lead.fullMobile);
                        }
                    } catch (error) {
                        statusFailCount++;
                        assignedFailCount++;
                        errors.push({
                            leadName: lead.name,
                            error: error.message,
                        });
                    }
                }

                if (convertedLeadsSkipped > 0) {
                    const convertedLeads = allSelectedLeads.filter(
                        lead => lead.isConverted || lead.status === "Converted"
                    );

                    for (const lead of convertedLeads) {
                        try {
                            await updateLead({
                                leadId: lead.id,
                                assigned: bulkAssignedValue,
                                assignedAgent: bulkAssignedValue,
                            });

                            assignedSuccessCount++;

                            if (lead.fullMobile) {
                                await assignLeadAgent(bulkAssignedValue, lead.fullMobile);
                            }
                        } catch (error) {
                            assignedFailCount++;
                            errors.push({
                                leadName: lead.name,
                                error: error.message,
                            });
                        }
                    }
                }
            } else if (bulkStatusValue) {
                for (const lead of leadsForStatusUpdate) {
                    try {
                        await updateLead({
                            leadId: lead.id,
                            status: bulkStatusValue,
                        });
                        statusSuccessCount++;
                    } catch (error) {
                        statusFailCount++;
                        errors.push({
                            leadName: lead.name,
                            error: error.message,
                        });
                    }
                }
            } else if (bulkAssignedValue) {
                for (const lead of leadsForAssignedUpdate) {
                    try {
                        await updateLead({
                            leadId: lead.id,
                            assigned: bulkAssignedValue,
                            assignedAgent: bulkAssignedValue,
                        });

                        assignedSuccessCount++;

                        if (lead.fullMobile) {
                            await assignLeadAgent(bulkAssignedValue, lead.fullMobile);
                        }
                    } catch (error) {
                        assignedFailCount++;
                        errors.push({
                            leadName: lead.name,
                            error: error.message,
                        });
                    }
                }
            }

            let successMessage = "";
            if (statusSuccessCount > 0) {
                successMessage += `Updated status for ${statusSuccessCount} lead${statusSuccessCount > 1 ? "s" : ""} to "${bulkStatusValue}"`;
            }
            if (assignedSuccessCount > 0) {
                if (successMessage) successMessage += " and ";
                successMessage += `assigned ${assignedSuccessCount} lead${assignedSuccessCount > 1 ? "s" : ""} to "${bulkAssignedValue}"`;
            }
            if (convertedLeadsSkipped > 0 && bulkStatusValue) {
                successMessage += ` (${convertedLeadsSkipped} converted lead${convertedLeadsSkipped > 1 ? "s" : ""} skipped from status update)`;
            }

            if (statusSuccessCount > 0 || assignedSuccessCount > 0) {
                enqueueSnackbar(successMessage, {
                    variant: "success",
                    autoHideDuration: 4000,
                });
            }

            if (statusFailCount > 0 || assignedFailCount > 0) {
                const totalFailed = Math.max(statusFailCount, assignedFailCount);
                enqueueSnackbar(
                    `Failed to update ${totalFailed} lead${totalFailed > 1 ? "s" : ""}`,
                    {
                        variant: "error",
                        autoHideDuration: 3000,
                    }
                );
            }

            refetchLeads();
            setSelectedRowKeys([]);
            setIsBulkUpdateModalVisible(false);
            setBulkStatusValue("");
            setBulkAssignedValue("");
        } catch (error) {
            console.error("Error in performBulkUpdate:", error);
            enqueueSnackbar("An unexpected error occurred", {
                variant: "error",
                autoHideDuration: 3000,
            });
        } finally {
            setBulkUpdating(false);
        }
    };

    const handleAddCompany = async () => {
        const trimmedCompany = newCompany?.trim();
        if (!trimmedCompany) {
            enqueueSnackbar("Please enter company name", {
                variant: "warning",
                autoHideDuration: 3000,
            });
            return;
        }

        const companyExists = companyOption.some(
            opt => opt.toLowerCase() === trimmedCompany.toLowerCase()
        );
        if (companyExists) {
            enqueueSnackbar("Company already exists", {
                variant: "info",
                autoHideDuration: 3000,
            });
            return;
        }

        const prevOptions = [...companyOption];
        const newOptions = [...prevOptions, trimmedCompany];

        setCompanyOption(newOptions);
        form.setFieldsValue({ company: trimmedCompany });
        setNewCompany("");
        setCompanyDropdownOpen(false);

        try {
            updateField({
                fieldKey: "company",
                updates: { options: newOptions },
            });

            enqueueSnackbar("Company added successfully!", {
                variant: "success",
                autoHideDuration: 3000,
            });
        } catch (error) {
            setCompanyOption(prevOptions);
            form.setFieldsValue({ company: "" });
            enqueueSnackbar("Failed to add company", {
                variant: "error",
                autoHideDuration: 3000,
            });
        }
    };

    const SyncConfirmationModal = ({
        visible,
        onCancel,
        onConfirm,
        loading,
        stats,
    }) => {
        return (
            <Modal
                title={
                    <span>
                        <ExclamationCircleOutlined
                            style={{ color: "#faad14", marginRight: 8 }}
                        />
                        Sync WhatsApp Contacts
                    </span>
                }
                open={visible}
                onCancel={onCancel}
                onOk={onConfirm}
                confirmLoading={loading}
                okText='Start Sync'
                cancelText='Cancel'
                width={500}
            >
                <div style={{ padding: "16px 0" }}>
                    <p>
                        This will sync all WhatsApp contacts with{" "}
                        <strong>User Initiated Message</strong> as new leads.
                    </p>

                    {stats && (
                        <div
                            style={{
                                background: "#f6ffed",
                                border: "1px solid #b7eb8f",
                                borderRadius: 6,
                                padding: 12,
                                marginTop: 16,
                            }}
                        >
                            <h4 style={{ margin: "0 0 8px 0", color: "#389e0d" }}>
                                Last Sync Results:
                            </h4>
                            <p style={{ margin: 4 }}>✓ Created: {stats.created} leads</p>
                            <p style={{ margin: 4 }}>
                                ⏭️ Skipped: {stats.skipped} duplicates
                            </p>
                            {stats.errors > 0 && (
                                <p style={{ margin: 4, color: "#cf1322" }}>
                                    ❌ Errors: {stats.errors}
                                </p>
                            )}
                        </div>
                    )}

                    <p style={{ marginTop: 16, color: "#8c8c8c", fontSize: 12 }}>
                        <strong>Note:</strong> Only unique contacts will be created as
                        leads. Existing contacts will be skipped.
                    </p>
                </div>
            </Modal>
        );
    };

    const KanbanView = ({ leads, onEditLead, onDeleteLead, onSendTemplate }) => {
        const groupedLeads = {
            "New Lead": leads.filter(
                lead => lead.status === "New Lead" && !lead.isConverted
            ),
            Warm: leads.filter(lead => lead.status === "Warm" && !lead.isConverted),
            Hot: leads.filter(lead => lead.status === "Hot" && !lead.isConverted),
            Cold: leads.filter(lead => lead.status === "Cold" && !lead.isConverted),
            Converted: leads.filter(
                lead => lead.isConverted || lead.status === "Converted"
            ),
            Invalid: leads.filter(
                lead => lead.status === "Invalid" && !lead.isConverted
            ),
        };

        const statusColors = {
            "New Lead": "blue",
            Warm: "orange",
            Hot: "red",
            Cold: "green",
            Invalid: "gray",
            Converted: "purple",
        };

        const onDragEnd = async result => {
            if (!result.destination) return;

            const { source, destination } = result;
            if (source.droppableId === destination.droppableId) return;

            const leadId = result.draggableId;
            const newStatus = destination.droppableId;
            const draggedLead = leads.find(lead => lead.id === leadId);

            if (!draggedLead) return;
            const restrictedStatuses = [
                "Hot",
                "Warm",
                "Cold",
                "Converted",
                "Invalid",
            ];

            if (
                restrictedStatuses.includes(draggedLead.status) &&
                newStatus === "New Lead"
            ) {
                message.warning("You cannot change the status back to New Lead.");
                return;
            }

            setCurrentEditingLead({ ...draggedLead, newStatus });
            setShowDescriptionModal(true);
        };

        const handleKanbanStatusUpdate = async description => {
            if (currentEditingLead) {
                try {
                    await updateLead({
                        leadId: currentEditingLead.id,
                        status: currentEditingLead.newStatus,
                        description: description,
                    });

                    enqueueSnackbar("Lead status updated successfully!", {
                        variant: "success",
                        autoHideDuration: 3000,
                    });

                    setShowDescriptionModal(false);
                    setCurrentEditingLead(null);
                    refetchLeads();
                } catch (error) {
                    enqueueSnackbar("Failed to update lead status", {
                        variant: "error",
                        autoHideDuration: 3000,
                    });
                }
            }
        };

        const DescriptionUpdateModal = ({
            visible,
            currentLead,
            onCancel,
            onUpdate,
            updating,
        }) => {
            const [localDescription, setLocalDescription] = useState("");

            useEffect(() => {
                if (visible && currentLead) {
                    setLocalDescription(currentLead.description || "");
                }
            }, [visible, currentLead]);

            const handleUpdate = () => {
                onUpdate(localDescription);
            };

            const handleCancel = () => {
                setLocalDescription("");
                onCancel();
            };

            return (
                <Modal
                    title='Update Description'
                    open={visible}
                    onOk={handleUpdate}
                    onCancel={handleCancel}
                    width={600}
                    confirmLoading={updating}
                    destroyOnClose={false}
                    maskClosable={false}
                >
                    {currentLead && (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>Lead: </Text>
                                <Text>{currentLead.name}</Text>
                                <br />
                                <Text strong>Status Change: </Text>
                                <Text>
                                    {currentLead.status} → {currentLead.newStatus}
                                </Text>
                            </div>
                            <TextArea
                                rows={4}
                                value={localDescription}
                                onChange={e => setLocalDescription(e.target.value)}
                                placeholder='Enter description for this status change...'
                                autoFocus={false}
                            />
                        </>
                    )}
                </Modal>
            );
        };

        return (
            <>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            padding: "16px",
                            overflowX: "auto",
                            height: "calc(100vh - 200px)",
                        }}
                    >
                        {Object.entries(groupedLeads).map(([status, statusLeads]) => (
                            <Droppable key={status} droppableId={status}>
                                {provided => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            minWidth: "300px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--text-secondary)",
                                            padding: "12px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "8px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <Tag color={statusColors[status] || "default"}>
                                                {status}
                                            </Tag>
                                            <span
                                                style={{
                                                    backgroundColor: statusColors[status],
                                                    borderRadius: "50%",
                                                    width: "18px",
                                                    height: "18px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "10px",
                                                    color: "#fff",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {statusLeads.length}
                                            </span>
                                        </div>
                                        {statusLeads.map((lead, index) => (
                                            <Draggable
                                                key={lead.id}
                                                draggableId={lead.id}
                                                index={index}
                                                isDragDisabled={
                                                    lead.isConverted || status === "Converted"
                                                }
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            borderRadius: "4px",
                                                            padding: "12px",
                                                            border: "1px solid var(--text-secondary)",
                                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                            cursor:
                                                                lead.isConverted || status === "Converted"
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                            opacity:
                                                                lead.isConverted || status === "Converted"
                                                                    ? 0.6
                                                                    : 1,
                                                            ...provided.draggableProps.style,
                                                        }}
                                                        onClick={e => {
                                                            const isActionClick = e.target.closest("button");
                                                            if (!isActionClick) {
                                                                setSelectedLead(lead);
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "8px",
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: "500", color: "var(--text-secondary)" }}>
                                                                {lead.name}
                                                            </div>
                                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                                {lead.company}
                                                            </div>
                                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                                {lead.email}
                                                            </div>
                                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                                {lead.mobile}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    gap: "8px",
                                                                    justifyContent: "flex-end",
                                                                }}
                                                            >
                                                                <Button
                                                                    icon={<EditOutlined />}
                                                                    size='small'
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        onEditLead(lead);
                                                                    }}
                                                                />
                                                                <Button
                                                                    icon={<SendOutlined />}
                                                                    size='small'
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        onSendTemplate(lead);
                                                                    }}
                                                                />
                                                                <Button
                                                                    icon={<DeleteOutlined />}
                                                                    size='small'
                                                                    danger
                                                                    disabled={!hasToken}
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        onDeleteLead(lead.id);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                <DescriptionUpdateModal
                    visible={showDescriptionModal}
                    currentLead={currentEditingLead}
                    onCancel={() => {
                        setShowDescriptionModal(false);
                        setCurrentEditingLead(null);
                    }}
                    onUpdate={handleKanbanStatusUpdate}
                    updating={updating}
                />
            </>
        );
    };

    const handleSendTemplateClick = lead => {
        setSelectedLeadForTemplate(lead);
        setIsSendTemplateModalVisible(true);
        setSelectedTemplate(null);
        setTemplateVariables([]);
        setFileList([]);
        setFormData({
            selectedVariableValuesObj: {},
            fileUrl: "",
        });
    };

    const handleTemplateFormSubmit = async () => {
        try {
            if (!selectedTemplate) {
                throw new Error("Please select a template");
            }

            const emptyVariables = templateVariables.filter(
                variable => !formData.selectedVariableValuesObj[variable]
            );
            if (emptyVariables.length > 0) {
                throw new Error(`Please fill: ${emptyVariables.join(", ")}`);
            }

            if (
                (selectedTemplate?.headerType === "image" ||
                    selectedTemplate?.headerType === "video" ||
                    selectedTemplate?.headerType === "file") &&
                !formData.fileUrl
            ) {
                throw new Error(`Please upload ${selectedTemplate.headerType} file`);
            }

            console.log("Submitting template:", {
                lead: selectedLeadForTemplate,
                template: selectedTemplate,
                formData,
                fileUrl: formData.fileUrl,
            });

            enqueueSnackbar("Template sent successfully!", {
                variant: "success",
                autoHideDuration: 3000,
            });
            setIsSendTemplateModalVisible(false);
            handleTemplateReset();
        } catch (error) {
            enqueueSnackbar(error.message, {
                variant: "error",
                autoHideDuration: 3000,
            });
        }
    };

    const handleTemplateReset = () => {
        setFormData({
            selectedVariableValuesObj: {},
            fileUrl: "",
        });
        setSelectedTemplate(null);
        setTemplateVariables([]);
        setFileList([]);
    };

    const handleSelectTemplate = template => {
        setSelectedTemplate(template);
        setComposeModalOpen(false);
        setFormData(prev => ({
            ...prev,
            fileUrl: "",
        }));
        setFileList([]);

        if (template?.examples) {
            try {
                let parsedVariables = [];
                if (
                    typeof template.examples === "object" &&
                    !Array.isArray(template.examples)
                ) {
                    parsedVariables = Object.keys(template.examples);
                } else if (Array.isArray(template.examples)) {
                    parsedVariables = template.examples;
                }
                setTemplateVariables(parsedVariables || []);

                const varDataObj = {};
                parsedVariables.forEach(variable => {
                    varDataObj[variable] = "";
                });

                setFormData(prev => ({
                    ...prev,
                    selectedVariableValuesObj: varDataObj,
                }));
            } catch (e) {
                console.error("Error parsing template variables:", e);
                setTemplateVariables([]);
            }
        } else {
            setTemplateVariables([]);
        }

        if (template?.actions && template.actions.length > 0) {
            template.actions.forEach((action, index) => {
                if (action.type === "url" && action.url?.includes("{{1}}")) {
                    const variableKey = `{{1}}_action_${index}`;
                    setFormData(prev => ({
                        ...prev,
                        selectedVariableValuesObj: {
                            ...prev.selectedVariableValuesObj,
                            [variableKey]: "",
                        },
                    }));
                }
            });
        }
    };

    useEffect(() => {
        let userEmail = null;
        const userData =
            localStorage.getItem("loginData") ||
            localStorage.getItem("user") ||
            localStorage.getItem("userInfo");

        try {
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                userEmail = parsedUserData.email;
            }

            if (!userEmail) {
                userEmail =
                    localStorage.getItem("userEmail") || localStorage.getItem("email");
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            userEmail =
                localStorage.getItem("userEmail") || localStorage.getItem("email");
        }

        if (
            SPECIAL_EMAILS.includes(userEmail) ||
            JSON.parse(userData)?.role === "agent"
        ) {
            setShouldRenderDashboard(true);
            setShowModal(false);
        } else {
            setShouldRenderDashboard(false);
            setShowModal(true);
        }
    }, []);

    const assignedOptions = React.useMemo(() => {
        if (!agentData) return [];

        if (Array.isArray(agentData)) {
            return agentData.map(agent => agent.email).filter(Boolean);
        }

        if (agentData.data && Array.isArray(agentData.data)) {
            return agentData.data.map(agent => agent.email).filter(Boolean);
        }

        if (agentData.users && Array.isArray(agentData.users)) {
            return agentData.users.map(agent => agent.email).filter(Boolean);
        }

        if (agentData.results && Array.isArray(agentData.results)) {
            return agentData.results.map(agent => agent.email).filter(Boolean);
        }

        return [];
    }, [agentData]);

    const countryCodeOptions = [
        { value: "91", label: "India (+91)" },
        { value: "1", label: "USA (+1)" },
        { value: "44", label: "UK (+44)" },
        { value: "81", label: "Japan (+81)" },
    ];

    const filteredLeads = leads.filter(lead => {
        const searchTermLower = searchTerm.toLowerCase();

        const leadDate = lead.createdAt ? new Date(lead.createdAt) : null;

        const matchesDateRange =
            !globalDateRange || globalDateRange.length === 0
                ? true
                : leadDate &&
                leadDate >= new Date(globalDateRange[0].startOf("day")) &&
                leadDate <= new Date(globalDateRange[1].endOf("day"));

        const matchesAssigned =
            selectedAssigned === "" || lead.assigned === selectedAssigned;

        const matchesCompany =
            selectedCompany === "" || lead.company === selectedCompany;

        const matchesStatus =
            selectedStatus === "" ||
            (selectedStatus === "Converted"
                ? lead.isConverted || lead.status === "Converted"
                : lead.status === selectedStatus);

        const matchesSource =
            selectedSource === "" || lead.source === selectedSource;

        if (!searchTermLower) {
            return (
                matchesAssigned &&
                matchesCompany &&
                matchesStatus &&
                matchesSource &&
                matchesDateRange
            );
        }

        const matchesSearch =
            lead.name?.toLowerCase().includes(searchTermLower) ||
            lead.email?.toLowerCase().includes(searchTermLower) ||
            lead.company?.toLowerCase().includes(searchTermLower) ||
            lead.mobile?.toLowerCase().includes(searchTermLower) ||
            lead.position?.toLowerCase().includes(searchTermLower) ||
            lead.city?.toLowerCase().includes(searchTermLower) ||
            lead.country?.toLowerCase().includes(searchTermLower) ||
            lead.source?.toLowerCase().includes(searchTermLower) ||
            lead.status?.toLowerCase().includes(searchTermLower) ||
            lead.assigned?.toLowerCase().includes(searchTermLower) ||
            (lead.tags &&
                lead.tags.some(tag => tag.toLowerCase().includes(searchTermLower))) ||
            (lead.description &&
                lead.description.toLowerCase().includes(searchTermLower));

        return (
            matchesSearch &&
            matchesAssigned &&
            matchesCompany &&
            matchesStatus &&
            matchesSource &&
            matchesDateRange
        );
    });

    const handleAddLead = async () => {
        try {
            const values = await form.validateFields();

            if (fieldConfig.status && !values.status && !editingLead?.isConverted) {
                throw new Error("Please select a status!");
            }

            if (fieldConfig.source && !values.source) {
                throw new Error("Please select a source!");
            }

            if (fieldConfig.assigned && !values.assigned) {
                throw new Error("Please select an assigned person!");
            }

            if (values.mobile && !/^\d+$/.test(values.mobile)) {
                throw new Error("Mobile number should contain only digits");
            }

            if (!values.email && !values.mobile) {
                throw new Error("Please provide either email or mobile number!");
            }

            const customFieldsValues = {};
            customFieldsData.forEach(field => {
                customFieldsValues[field.key] = values[field.key] || "";
            });

            const formattedValues = {
                ...values,
                leadDate: values.leadDate ? values.leadDate.format("YYYY-MM-DD") : null,
                countryCode: values.countryCode || "91",
                mobile: values.mobile || "",
                email: values.email ? values.email.toLowerCase().trim() : "",
            };

            const leadData = {
                ...formattedValues,
                ...customFieldsValues,
                tags: tags,
                description: values.description || "",
                notes: notes,
                status: values.status || "New Lead",
                source: values.source || "Website",
                assignedAgent: values.assigned || assignedOptions[0] || "",
                product: values.product || "",
                isConverted: false,
                sendAlert: sendNewLeadAlert,
            };

            const fullMobile = values.mobile
                ? `${values.countryCode || "91"}${values.mobile}`
                : null;

            if (editingLead) {
                try {
                    const updateData = {
                        ...leadData,
                        isConverted: editingLead.isConverted,
                        status:
                            editingLead.isConverted || editingLead.status === "Converted"
                                ? "Converted"
                                : leadData.status,
                        sendAlert: false,
                    };

                    if (editingLead.isConverted || editingLead.status === "Converted") {
                        if (editingLead.conversionDate) {
                            updateData.conversionDate = editingLead.conversionDate;
                        }
                        console.log(
                            "Updating converted lead - status locked to 'Converted'"
                        );
                    }

                    await updateLead({
                        leadId: editingLead.id,
                        ...updateData,
                    });

                    if (fullMobile && values.assigned !== editingLead.assigned) {
                        console.log("Assigned value changed, updating agent assignment");
                        await assignLeadAgent(values.assigned, fullMobile);
                    }

                    enqueueSnackbar("Lead updated successfully!", {
                        variant: "success",
                        autoHideDuration: 3000,
                    });

                    setEditingLead(null);
                    refetchLeads();
                    setIsModalVisible(false);
                    form.resetFields();
                    setTags([]);
                    setDescription("");
                    setNotes("");
                    setSendNewLeadAlert(false);
                } catch (error) {
                    console.error("Error updating lead:", error);

                    let errorMessage =
                        error?.data?.message ||
                        error?.response?.data?.message ||
                        error.message ||
                        "Failed to update lead";

                    if (
                        error?.data?.message?.includes("already exists") ||
                        error?.response?.data?.message?.includes("already exists")
                    ) {
                        errorMessage = error.data?.message || error.response?.data?.message;

                        if (errorMessage.includes("email") && values.email) {
                            form.setFields([
                                {
                                    name: "email",
                                    errors: [
                                        "This email is already associated with another lead",
                                    ],
                                },
                            ]);
                        }
                        if (errorMessage.includes("mobile") && values.mobile) {
                            form.setFields([
                                {
                                    name: "mobile",
                                    errors: [
                                        "This mobile number is already associated with another lead",
                                    ],
                                },
                            ]);
                        }
                    }

                    enqueueSnackbar(errorMessage, {
                        variant: "error",
                        autoHideDuration: 5000,
                    });

                    throw error;
                }
            } else {
                setSendingAlert(sendNewLeadAlert && values.mobile);

                try {
                    const newLeadData = {
                        ...leadData,
                        isConverted: false,
                        status: leadData.status || "New Lead",
                    };

                    await createLead(newLeadData);

                    if (fullMobile && values.assigned) {
                        console.log("New lead created, assigning agent");
                        await assignLeadAgent(values.assigned, fullMobile);
                    }

                    enqueueSnackbar("Lead created successfully!", {
                        variant: "success",
                        autoHideDuration: 3000,
                    });

                    if (sendNewLeadAlert && values.mobile) {
                        enqueueSnackbar("New lead alert sent!", {
                            variant: "success",
                            autoHideDuration: 3000,
                        });
                    }

                    refetchLeads();
                    setIsModalVisible(false);
                    form.resetFields();
                    setTags([]);
                    setDescription("");
                    setNotes("");
                    setSendNewLeadAlert(false);
                    setSendingAlert(false);
                } catch (error) {
                    console.error("Error creating lead:", error);
                    setSendingAlert(false);

                    let errorMessage =
                        error?.data?.message ||
                        error?.response?.data?.message ||
                        error.message ||
                        "Failed to create lead";

                    if (
                        error?.data?.message?.includes("already exists") ||
                        error?.response?.data?.message?.includes("already exists")
                    ) {
                        errorMessage = error.data?.message || error.response?.data?.message;

                        if (errorMessage.includes("email") && values.email) {
                            form.setFields([
                                {
                                    name: "email",
                                    errors: [
                                        "This email is already associated with an existing lead",
                                    ],
                                },
                            ]);
                        }
                        if (errorMessage.includes("mobile") && values.mobile) {
                            form.setFields([
                                {
                                    name: "mobile",
                                    errors: [
                                        "This mobile number is already associated with an existing lead",
                                    ],
                                },
                            ]);
                        }
                    }

                    enqueueSnackbar(errorMessage, {
                        variant: "error",
                        autoHideDuration: 5000,
                    });

                    throw error;
                }
            }
        } catch (error) {
            console.error("Error in handleAddLead:", error);

            if (error.errorFields && Array.isArray(error.errorFields)) {
                const errorMessages = error.errorFields
                    .map(field => field.errors[0])
                    .filter(Boolean);

                if (errorMessages.length > 0) {
                    const message =
                        errorMessages.length === 1
                            ? errorMessages[0]
                            : "Please fill all required fields";

                    enqueueSnackbar(message, {
                        variant: "error",
                        autoHideDuration: 5000,
                    });
                    return;
                }
            }

            if (
                !error?.message?.includes("already exists") &&
                !error?.data?.message?.includes("already exists") &&
                !error?.response?.data?.message?.includes("already exists")
            ) {
                const errorMessage = error.message || "An unexpected error occurred";

                enqueueSnackbar(errorMessage, {
                    variant: "error",
                    autoHideDuration: 3000,
                });
            }
        }
    };

    const handleEditLead = lead => {
        setEditingLead(lead);

        const originalAssigned = lead.assigned || lead.assignedAgent;

        form.setFieldsValue({
            ...lead,
            countryCode: lead.countryCode || "91",
            leadDate: lead.leadDate ? moment(lead.leadDate) : null,
            description: lead.description || "",
            assigned: originalAssigned,
        });

        setTags(lead.tags || []);
        setDescription(lead.description || "");
        setNotes(lead.notes || "");
        setIsModalVisible(true);
    };

    const handleDeleteLead = async id => {
        Modal.confirm({
            title: "Are you sure you want to delete this lead?",
            content: "This action cannot be undone.",
            okText: "Yes, delete it",
            okType: "danger",
            cancelText: "No, cancel",
            confirmLoading: deleting,
            async onOk() {
                try {
                    await deleteLead(id);

                    enqueueSnackbar("Lead deleted successfully!", {
                        variant: "success",
                        autoHideDuration: 3000,
                    });

                    refetchLeads();
                } catch (error) {
                    console.error("Error deleting lead:", error);
                    enqueueSnackbar("Failed to delete lead", {
                        variant: "error",
                        autoHideDuration: 3000,
                    });
                }
            },
        });
    };

    const handleClearAllFilters = () => {
        setSelectedAssigned("");
        setSelectedCompany("");
        setSelectedStatus("");
        setSelectedSource("");
        setGlobalDateRange([]);
    };

    const sourceOptionsFromLeads = React.useMemo(() => {
        const sources = new Set();
        leads.forEach(lead => {
            if (lead.source) {
                sources.add(lead.source);
            }
        });
        return Array.from(sources).sort();
    }, [leads]);

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Please select at least one lead to delete");
            return;
        }

        Modal.confirm({
            title: "Are you sure you want to delete the selected leads?",
            content: `This will delete ${selectedRowKeys.length} leads. This action cannot be undone.`,
            okText: "Yes, delete them",
            okType: "danger",
            cancelText: "No, cancel",
            confirmLoading: bulkDeleting,
            async onOk() {
                try {
                    await bulkDeleteLeads(selectedRowKeys);

                    enqueueSnackbar(
                        `${selectedRowKeys.length} leads deleted successfully!`,
                        {
                            variant: "success",
                            autoHideDuration: 3000,
                        }
                    );

                    setSelectedRowKeys([]);
                    refetchLeads();
                } catch (error) {
                    console.error("Error bulk deleting leads:", error);
                    enqueueSnackbar("Failed to delete leads", {
                        variant: "error",
                        autoHideDuration: 3000,
                    });
                }
            },
        });
    };

    const handleBulkExport = () => {
        const leadsToExport =
            selectedRowKeys.length === 0
                ? leads
                : leads.filter(lead => selectedRowKeys.includes(lead.id));

        if (!leadsToExport.length) {
            message.warning("No leads available to export");
            return;
        }

        const csvContent =
            "data:text/csv;charset=utf-8," +
            "Name,Company,Email,Status,Source,Assigned,CreatedAt\n" +
            leadsToExport
                .map(
                    lead =>
                        `"${lead.name || ""}","${lead.company || ""}","${lead.email || ""}",` +
                        `"${lead.status || ""}","${lead.source || ""}","${lead.assigned || ""}","${lead.createdAt || ""}"`
                )
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getValidationRules = (fieldKey, fieldName) => {
        const rules = [];

        if (mandatoryConfig[fieldKey]) {
            rules.push({
                required: true,
                message: `Please input the ${fieldName.toLowerCase()}!`,
            });
        }

        if (fieldKey === "email") {
            rules.push({
                type: "email",
                message: "Please enter a valid email!",
            });
        }
        if (fieldKey === "mobile") {
            rules.push({
                pattern: /^\d+$/,
                message: "Mobile number should contain only digits!",
            });

            rules.push({
                validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const countryCode = form.getFieldValue("countryCode") || "91";
                    const expectedLength = countryCodeLengthMap[countryCode];

                    if (expectedLength && value.length !== expectedLength) {
                        return Promise.reject(
                            new Error(
                                `Mobile number should be ${expectedLength} digits for country code +${countryCode}`
                            )
                        );
                    }

                    return Promise.resolve();
                },
            });
        }

        return rules;
    };

    useEffect(() => {
        if (isModalVisible) {
            refetchConfig();
        }
    }, [isModalVisible]);

    useEffect(() => {
        if (isModalVisible && !editingLead && !hasPlan && loggedInEmail) {
            form.setFieldsValue({ assigned: loggedInEmail });
        }
    }, [isModalVisible, editingLead, hasPlan, loggedInEmail, form]);

    const handleAddStatus = () => {
        if (newStatus && !statusOptions.includes(newStatus)) {
            const updatedOptions = [...statusOptions, newStatus];
            form.setFieldsValue({ status: newStatus });
        }
        setNewStatus("");
        setShowStatusAdd(false);
    };

    const handleAddSource = () => {
        if (newSource && !sourceOptions.includes(newSource)) {
            const updatedOptions = [...sourceOptions, newSource];
            form.setFieldsValue({ source: newSource });
        }
        setNewSource("");
        setShowSourceAdd(false);
    };

    const handleAddProduct = () => {
        if (newProduct && !productOptions.includes(newProduct)) {
            const updatedOptions = [...productOptions, newProduct];
            form.setFieldsValue({ product: newProduct });
        }
        setNewProduct("");
        setShowProductAdd(false);
    };

    const handleAddTag = () => {
        if (newTag) {
            if (tags.includes(newTag)) {
                message.error("Tag already exists!");
            } else {
                setTags([...tags, newTag]);
            }
            setNewTag("");
        }
    };

    const handleRemoveTag = tagToRemove => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const onSelectChange = selectedKeys => {
        setSelectedRowKeys(selectedKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const getMenuItems = record => [
        {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEditLead(record),
        },
        {
            key: "sendTemplate",
            icon: <SendOutlined />,
            label: "Send Template",
            onClick: () => handleSendTemplateClick(record),
        },
        {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            disabled: !hasToken,
            onClick: () => handleDeleteLead(record.id),
        },
    ];

    const columns = [
        {
            title: "S.No",
            key: "serial",
            render: (text, record, index) => index + 1,
            width: 80,
            align: "center",
        },
        fieldConfig.name && {
            title: "Name",
            dataIndex: "name",
            key: "name",

            render: (text, record) => (
                <div
                    style={{
                        cursor: "pointer",
                    }}
                    onClick={e => {
                        e.stopPropagation(); // 🔥 prevents row click conflict
                        handleRowClick(record);
                    }}
                >
                    <div
                        style={{
                            fontWeight: 500,
                            width: 120,
                        }}
                    >
                        {text}
                    </div>

                    {fieldConfig.position && record.position && (
                        <div style={{ fontSize: 12, color: "#888" }}>
                            {record.position}
                        </div>
                    )}
                </div>
            ),
        },

        fieldConfig.mobile && {
            title: "Mobile",
            dataIndex: "fullMobile",
            key: "mobile",
            render: (Mobile, record) => <div>{Mobile || "-"}</div>,
        },
        fieldConfig.company && {
            title: "Company",
            dataIndex: "company",
            key: "company",
            render: text => (
                <span style={{ color: "", fontWeight: "500", width: 120, }}>
                    {text || "-"}
                </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <span
                    className={`lead-status-pill ${status === "Converted" ? "converted" : ""
                        }`}
                >
                    {status}
                </span>
            ),
        },
        {
            title: "Lead Value",
            dataIndex: "leadValue",
            key: "leadValue",
            render: (value) => (
                <span className="lead-value-text">₹{value.toLocaleString()}</span>
            ),
        },
        fieldConfig.source && {
            title: "Source",
            dataIndex: "source",
            key: "source",
            render: value => value || "-",
        },
        fieldConfig.assigned && {
            title: "Assigned",
            dataIndex: "assigned",
            key: "assigned",
            render: value => value || "-",
        },
        fieldConfig.email && {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: value => value || "-",
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: createdAt =>
                createdAt ? moment(createdAt).format("DD-MM-YYYY HH:mm") : "-",
            sorter: (a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            },
            width: 150,
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: updatedAt =>
                updatedAt ? moment(updatedAt).format("DD-MM-YYYY HH:mm") : "-",
            sorter: (a, b) => {
                if (!a.updatedAt && !b.updatedAt) return 0;
                if (!a.updatedAt) return 1;
                if (!b.updatedAt) return -1;
                return moment(a.updatedAt).unix() - moment(b.updatedAt).unix();
            },
            width: 150,
        },
        fieldConfig.product && {
            title: "Product",
            dataIndex: "product",
            key: "product",
            render: value => value || "-",
        },
        fieldConfig.address && {
            title: "Address",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            render: value => value || "-",
        },
        fieldConfig.city && {
            title: "City",
            dataIndex: "city",
            key: "city",
            render: value => value || "-",
        },
        fieldConfig.country && {
            title: "Country",
            dataIndex: "country",
            key: "country",
            render: value => value || "-",
        },
        fieldConfig.website && {
            title: "Website",
            dataIndex: "website",
            key: "website",
            render: website => (
                <a
                    href={website?.startsWith("http") ? website : `https://${website}`}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {website || "-"}
                </a>
            ),
        },
        fieldConfig.leadValue && {
            title: "Lead Value",
            dataIndex: "leadValue",
            key: "leadValue",
            render: value => (value ? `${value}` : "-"),
        },
        fieldConfig.tags && {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: tags => {
                if (!tags || tags.length === 0) {
                    return "-";
                }
                return (
                    <div style={{ width: '120px' }} className="lead-tags-container">
                        {tags.map(tag => (
                            <span key={tag} className="lead-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                );
            },
        },

        fieldConfig.description && {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: text => text || "-",
        },
        ...customFieldsData
            .filter(field => fieldConfig[field.key])
            .map(field => ({
                title: field.name,
                dataIndex: field.key,
                key: field.key,
                render: text => text || "-",
            })),
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 80,
            render: (_, record) => (
                <Dropdown
                    trigger={["click"]}
                    menu={{ items: getMenuItems(record) }}
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={e => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ].filter(Boolean);

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleRowClick = record => {
        console.log("Row clicked:", record); // Add this for debugging
        setSelectedLead(record);
    };

    const handleImportComplete = results => {
        console.log("Import completed with results:", results);

        refetchLeads();

        if (results.success > 0) {
            enqueueSnackbar(`Successfully imported ${results.success} leads`, {
                variant: "success",
                autoHideDuration: 3000,
            });
        }

        setTimeout(() => {
            setIsImportModalVisible(false);
        }, 9000);
    };

    return (
        <div style={{ minHeight: "100vh" }}>
            
                <Breadcrumb title="Leads" />
                <Card bodyStyle={{ overflowX: "auto" }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        tabBarExtraContent={
                            activeTab === "leads" ? (
                                <Select
                                    className='rounded-select'
                                    value={viewType}
                                    onChange={value => setViewType(value)}
                                    style={{
                                        width: 160,
                                        borderRadius: 5,
                                    }}
                                    options={[
                                        {
                                            value: "table",
                                            label: (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <TableOutlined /> Table View
                                                </span>
                                            ),
                                        },
                                        {
                                            value: "kanban",
                                            label: (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <AppstoreOutlined /> Kanban View
                                                </span>
                                            ),
                                        },
                                    ]}
                                />
                            ) : null
                        }
                    >
                        <TabPane tab={
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                <UserOutlined /> Leads
                            </span>
                        } key='leads'>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "16px",
                                    marginBottom: "16px",
                                }}
                            >
                                {/* Left Section: Filters */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "12px",
                                        flex: 1,
                                        minWidth: "280px",
                                    }}
                                >
                                    <Input
                                        placeholder='Search leads'
                                        prefix={<SearchOutlined />}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{
                                            borderRadius: "8px",
                                            width: "190px",
                                            flex: "0 0 190px",
                                        }}
                                        allowClear
                                    />
                                </div>

                                {/* Right Section: Action Buttons */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "flex-end",
                                        gap: "12px",
                                    }}
                                >
                                    <Space size={8} wrap>
                                        <Tooltip title='Import Leads'>
                                            <Button
                                                type='text'
                                                icon={<DownloadOutlined style={{ fontSize: "20px" }} />}
                                                onClick={() => setIsImportModalVisible(true)}
                                                style={{ padding: 0 }}
                                            />
                                        </Tooltip>

                                        <Tooltip title='Bulk Update'>
                                            <Button
                                                type='text'
                                                icon={<EditOutlined style={{ fontSize: "20px" }} />}
                                                onClick={() => {
                                                    if (selectedRowKeys.length === 0) {
                                                        message.warning(
                                                            "Please select at least one lead to update status"
                                                        );
                                                    } else {
                                                        setIsBulkUpdateModalVisible(true);
                                                    }
                                                }}
                                                disabled={selectedRowKeys.length === 0}
                                                style={{ padding: 0 }}
                                            />
                                        </Tooltip>

                                        <Tooltip title='Export Leads'>
                                            <Popconfirm
                                                title='Export selected leads?'
                                                description='Do you want to export the selected leads as CSV?'
                                                okText='Yes'
                                                cancelText='No'
                                                onConfirm={handleBulkExport}
                                            >
                                                <Button
                                                    type='text'
                                                    icon={<UploadOutlined style={{ fontSize: "20px" }} />}
                                                    style={{ padding: 0 }}
                                                />
                                            </Popconfirm>
                                        </Tooltip>

                                        <Tooltip title='Delete Selected Leads'>
                                            <Button
                                                type='text'
                                                danger
                                                icon={<DeleteOutlined style={{ fontSize: "20px" }} />}
                                                onClick={handleBulkDelete}
                                                disabled={selectedRowKeys.length === 0 || !hasToken}
                                                style={{ padding: 0 }}
                                            />
                                        </Tooltip>

                                        <Badge count={activeFiltersCount} offset={[-5, 5]}>
                                            <Button
                                                icon={<FilterOutlined />}
                                                onClick={() => setIsFilterDrawerVisible(true)}
                                                style={{
                                                    borderRadius: 8,
                                                    backgroundColor: "var(--primary)",
                                                    color: "#fff",
                                                }}
                                            >
                                                Filters
                                            </Button>
                                        </Badge>

                                        <Tooltip title='Download Sample CSV'>
                                            <Button
                                                icon={<DownloadOutlined />}
                                                style={{
                                                    borderRadius: "8px",
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                }}
                                                onClick={() => {
                                                    const sampleCsvUrl =
                                                        "https://askeva.blr1.cdn.digitaloceanspaces.com/Samplecontact.csv";
                                                    const link = document.createElement("a");
                                                    link.href = sampleCsvUrl;
                                                    link.setAttribute(
                                                        "download",
                                                        "Sample_Leads_Import.csv"
                                                    );
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                Sample CSV
                                            </Button>
                                        </Tooltip>

                                        <Tooltip title='Sync WhatsApp Contacts'>
                                            <Button
                                                icon={<SyncOutlined />}
                                                style={{
                                                    borderRadius: "8px",
                                                    backgroundColor: "var(--primary)",
                                                    color: "white",
                                                }}
                                                onClick={handleSyncContacts}
                                                loading={syncingContacts}
                                                disabled={syncingContacts}
                                            >
                                                {syncingContacts ? "Syncing..." : "Sync"}
                                            </Button>
                                        </Tooltip>

                                        <Button
                                            style={{
                                                borderRadius: "8px",
                                                backgroundColor: "var(--primary)",
                                                color: "white",
                                            }}
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                setEditingLead(null);
                                                setIsModalVisible(true);
                                            }}
                                            loading={creating}
                                        >
                                            New Lead
                                        </Button>
                                    </Space>
                                </div>
                            </div>

                            {viewType === "table" ? (
                                <Table
                                    columns={columns}
                                    dataSource={filteredLeads}
                                    rowKey="id"
                                    bordered={false}
                                    className="leads-performance-table"
                                    rowSelection={{
                                        type: "checkbox",
                                        ...rowSelection,
                                    }}
                                    scroll={{ x: true }}
                                    loading={leadsLoading}
                                    pagination={{
                                        pageSizeOptions: ["10", "20", "50", "100"],
                                        showSizeChanger: true,
                                    }}
                                    onRow={record => ({
                                        onClick: e => {
                                            // Check if click originated from action buttons or checkboxes
                                            const isActionClick =
                                                e.target.closest(".ant-dropdown-trigger") ||
                                                e.target.closest(".ant-dropdown-menu") ||
                                                e.target.closest(".ant-checkbox-wrapper") ||
                                                e.target.closest("button"); // Add this to prevent button clicks

                                            if (!isActionClick) {
                                                console.log("Opening modal for:", record); // Debug log
                                                handleRowClick(record);
                                            }
                                        },
                                    })}
                                    rowClassName="cursor-pointer"
                                />
                            ) : (
                                <KanbanView
                                    leads={filteredLeads}
                                    onEditLead={handleEditLead}
                                    onDeleteLead={handleDeleteLead}
                                    onSendTemplate={handleSendTemplateClick}
                                />
                            )}
                        </TabPane>
                        <TabPane tab={
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                <AppstoreOutlined /> Companies
                            </span>
                        } key='companies' disabled={!hasPlan}>
                            <LeadsToCustomer />
                        </TabPane>
                    </Tabs>
                </Card>

                {/* New Lead Modal */}
                <Modal
                    title={editingLead ? "Edit Lead" : "Add New Lead"}
                    open={isModalVisible}
                    maskClosable={false}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                        setTags([]);
                        setDescription("");
                        setNotes("");
                        setEditingLead(null);
                    }}
                    width={1000}
                    footer={null}
                    bodyStyle={{
                        maxHeight: "70vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                        paddingRight: "16px",
                    }}
                >
                    <Form form={form} layout='vertical'>
                        {/* Status, Source, Assigned, Tags */}
                        <Row gutter={16}>
                            {fieldConfig.status && (
                                <Col span={8}>
                                    <Form.Item
                                        label={<span>Status</span>}
                                        name='status'
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select a status!",
                                            },
                                        ]}
                                    >
                                        {editingLead?.isConverted ||
                                            editingLead?.status === "Converted" ? (
                                            <Input
                                                value='Converted'
                                                disabled
                                                style={{
                                                    backgroundColor: "#f5f5f5",
                                                    color: "#666",
                                                    cursor: "not-allowed",
                                                }}
                                                addonAfter={<Tag color='purple'>Read-only</Tag>}
                                            />
                                        ) : (
                                            <Select placeholder='Select status'>
                                                {statusOptions
                                                    .filter(option => {
                                                        if (
                                                            editingLead &&
                                                            editingLead.status !== "New Lead"
                                                        ) {
                                                            return option !== "New Lead";
                                                        }
                                                        return true;
                                                    })
                                                    .map(option => (
                                                        <Option key={option} value={option}>
                                                            {option}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.source && (
                                <Col span={8}>
                                    <Form.Item
                                        label={<span>Source</span>}
                                        name='source'
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select a source!",
                                            },
                                        ]}
                                    >
                                        <Select placeholder='Select source'>
                                            {sourceOptions.map(option => (
                                                <Option key={option} value={option}>
                                                    {option}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.assigned && (
                                <Col span={8}>
                                    <Form.Item
                                        label={
                                            <span>
                                                <span></span>
                                                Assigned
                                            </span>
                                        }
                                        name='assigned'
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select an assigned person!",
                                            },
                                        ]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder='Select assigned person'
                                            optionFilterProp='children'
                                            value={!hasPlan ? loggedInEmail : undefined}
                                            filterOption={(input, option) =>
                                                option?.children
                                                    ?.toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                        >
                                            {(!hasPlan
                                                ? [loggedInEmail]
                                                : assignedOptions
                                            ).map(option => (
                                                <Option key={option} value={option}>
                                                    {option}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {fieldConfig.tags && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item label='Tags'>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <Input
                                                placeholder='Add tag'
                                                value={newTag}
                                                onChange={e => setNewTag(e.target.value)}
                                                onPressEnter={handleAddTag}
                                                style={{ width: "200px" }}
                                                suffix={
                                                    <Button
                                                        type='text'
                                                        size='small'
                                                        icon={<PlusOutlined />}
                                                        onClick={handleAddTag}
                                                    />
                                                }
                                            />
                                            <div
                                                style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                                            >
                                                {tags.map(tag => (
                                                    <Tag
                                                        key={tag}
                                                        closable
                                                        onClose={() => handleRemoveTag(tag)}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {/* Name and Company */}
                        <Row gutter={16}>
                            {fieldConfig.name && (
                                <Col span={12}>
                                    <Form.Item
                                        label='Name'
                                        name='name'
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a name",
                                            },
                                            {
                                                pattern: /^[A-Za-z\s]+$/,
                                                message: "Only alphabets and spaces are allowed",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder='Enter name'
                                            style={{ borderRadius: "8px" }}
                                            maxLength={75}
                                            onKeyPress={e => {
                                                if (!/[A-Za-z\s]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={e => {
                                                e.preventDefault();
                                                const pasted = e.clipboardData.getData("text");
                                                const clean = pasted.replace(/[^A-Za-z\s]/g, "");
                                                if (clean !== pasted) {
                                                    message.destroy();
                                                    message.warning(
                                                        "Only alphabets and spaces are allowed"
                                                    );
                                                }
                                                form.setFieldsValue({ name: clean });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.company && (
                                <Col span={12}>
                                    <Form.Item
                                        name='company'
                                        label='Company'
                                        rules={getValidationRules("company", "Company")}
                                    >
                                        <Select
                                            showSearch
                                            placeholder='Select or search company'
                                            open={companyDropdownOpen}
                                            onDropdownVisibleChange={setCompanyDropdownOpen}
                                            filterOption={(input, option) =>
                                                option?.children
                                                    ?.toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            style={{ width: "100%" }}
                                            dropdownRender={menu => (
                                                <>
                                                    {menu}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            padding: "8px",
                                                            gap: "8px",
                                                        }}
                                                    >
                                                        <Input
                                                            placeholder='Enter Company Name'
                                                            value={newCompany}
                                                            onChange={e => setNewCompany(e.target.value)}
                                                            onPressEnter={handleAddCompany}
                                                        />
                                                        <Button
                                                            className="btn-primary"
                                                            style={{
                                                                background:
                                                                    selectedLead?.isConverted ||
                                                                        selectedLead?.status === "Converted"
                                                                        ? "var(--primary)"
                                                                        : "var(--primary)",
                                                                borderColor:
                                                                    selectedLead?.isConverted ||
                                                                        selectedLead?.status === "Converted"
                                                                        ? "var(--primary)"
                                                                        : "var(--primary)",
                                                                borderRadius: 8,
                                                                color: "white",
                                                            }}
                                                            icon={<PlusOutlined />}
                                                            onClick={handleAddCompany}
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        >
                                            {companyOption.map(company => (
                                                <Select.Option key={company} value={company}>
                                                    {company}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {/* Position, Country Code, and Mobile Number in same line */}
                        <Row gutter={16}>
                            {fieldConfig.position && (
                                <Col span={12}>
                                    <Form.Item
                                        label='Position'
                                        name='position'
                                        rules={getValidationRules("position", "Position")}
                                    >
                                        <Input placeholder='Enter position' />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.countryCode && (
                                <Col span={4}>
                                    <Form.Item
                                        label='Country Code'
                                        name='countryCode'
                                        rules={getValidationRules("countryCode", "Country Code")}
                                    >
                                        <Select
                                            placeholder='Select country code'
                                            showSearch
                                            options={optionsCountry.map(option => ({
                                                ...option,
                                                title: "",
                                            }))}
                                            onChange={value => {
                                                form.setFieldsValue({ countryCode: value });
                                            }}
                                        ></Select>
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.mobile && (
                                <Col span={8}>
                                    <Form.Item
                                        label='Mobile Number'
                                        name='mobile'
                                        rules={[
                                            ...getValidationRules("mobile", "Mobile Number"),
                                            {
                                                validator: (_, value) => {
                                                    if (!value) return Promise.resolve();
                                                    if (!/^\d+$/.test(value)) {
                                                        return Promise.reject(
                                                            new Error("Please enter only numbers")
                                                        );
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder='Enter mobile number (digits only)'
                                            maxLength={
                                                countryCodeLengthMap[form.getFieldValue("countryCode")] ||
                                                15
                                            }
                                            onChange={e => {
                                                let value = e.target.value.replace(/[^\d]/g, "");

                                                const countryCode =
                                                    form.getFieldValue("countryCode") || "91";
                                                const expectedLength = countryCodeLengthMap[countryCode];

                                                if (expectedLength && value.length > expectedLength) {
                                                    value = value.slice(0, expectedLength);
                                                }

                                                form.setFieldsValue({ mobile: value });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.email && (
                                <Col span={12}>
                                    <Form.Item
                                        label='Email Address'
                                        name='email'
                                        rules={getValidationRules("email", "Email Address")}
                                    >
                                        <Input placeholder='Enter email address' />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.product && (
                                <Col span={12}>
                                    <Form.Item label='Product' name='product'>
                                        <Select placeholder='Select product'>
                                            {productOptions.map(option => (
                                                <Option key={option} value={option}>
                                                    {option}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {/* Address */}
                        {fieldConfig.address && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item label='Address' name='address'>
                                        <TextArea rows={2} placeholder='Enter address' />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {/* Website, City */}
                        <Row gutter={16}>
                            {fieldConfig.website && (
                                <Col span={12}>
                                    <Form.Item
                                        label='Website'
                                        name='website'
                                        rules={getValidationRules("website", "Website")}
                                    >
                                        <Input placeholder='Enter website URL' />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.city && (
                                <Col span={12}>
                                    <Form.Item
                                        label='City'
                                        name='city'
                                        rules={getValidationRules("city", "City")}
                                    >
                                        <Input placeholder='Enter city' />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {/* Lead Value, Country */}
                        <Row gutter={16}>
                            {fieldConfig.leadValue && (
                                <Col span={12}>
                                    <Form.Item
                                        label='Lead Value'
                                        name='leadValue'
                                        rules={getValidationRules("leadValue", "Lead Value")}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder='Enter lead value'
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                            {fieldConfig.country && (
                                <Col span={12}>
                                    <Form.Item label='Country' name='country'>
                                        <Input placeholder='Enter country' />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {/* Description */}
                        {fieldConfig.description && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label='Description'
                                        name='description'
                                        rules={getValidationRules("description", "Email Description")}
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder='Enter description'
                                            maxLength={200}
                                            showCount={{
                                                formatter: ({ count, maxLength }) =>
                                                    `${count}/${maxLength}`,
                                            }}
                                            style={{ borderRadius: "8px" }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {/* Custom Fields */}
                        {customFieldsData.map(
                            field =>
                                fieldConfig[field.key] && (
                                    <Row gutter={16} key={field.key}>
                                        <Col span={24}>
                                            <Form.Item
                                                label={field.name}
                                                name={field.key}
                                                rules={getValidationRules(field.key, field.name)}
                                            >
                                                {field.type === "textarea" ? (
                                                    <TextArea
                                                        rows={4}
                                                        placeholder={`Enter ${field.name.toLowerCase()}`}
                                                    />
                                                ) : field.type === "select" ? (
                                                    <Select
                                                        placeholder={`Select ${field.name.toLowerCase()}`}
                                                        options={field.options?.map(option => ({
                                                            value: option,
                                                            label: option,
                                                        }))}
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={`Enter ${field.name.toLowerCase()}`}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                        )}

                        {/* New Lead Alert Checkbox */}
                        {!editingLead && (
                            <Card style={{ marginTop: "16px", backgroundColor: "#f6ffed" }}>
                                <Checkbox
                                    checked={sendNewLeadAlert}
                                    onChange={e => setSendNewLeadAlert(e.target.checked)}
                                    disabled={sendingAlert}
                                >
                                    Send new lead alert message to this lead
                                </Checkbox>
                                <div style={{ marginTop: "8px" }}>
                                    <Text type='secondary' style={{ fontSize: "12px" }}>
                                        This will send a welcome message to the new lead using your
                                        configured template
                                    </Text>
                                </div>
                                {sendingAlert && (
                                    <div
                                        style={{
                                            marginTop: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <SyncOutlined spin />
                                        <Text type='secondary' style={{ fontSize: "12px" }}>
                                            Sending alert message...
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        )}

                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setIsModalVisible(false);
                                        form.resetFields();
                                        setTags([]);
                                        setDescription("");
                                        setNotes("");
                                        setEditingLead(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="btn-primary"
                                    style={{
                                        background:
                                            selectedLead?.isConverted ||
                                                selectedLead?.status === "Converted"
                                                ? "var(--primary)"
                                                : "var(--primary)",
                                        borderColor:
                                            selectedLead?.isConverted ||
                                                selectedLead?.status === "Converted"
                                                ? "var(--primary)"
                                                : "var(--primary)",
                                        borderRadius: 8,
                                        color: "white",
                                    }}
                                    onClick={handleAddLead}
                                    loading={creating || updating}
                                >
                                    {editingLead ? "Update Lead" : "Add Lead"}
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Modal>

                {/* Send Template Modal */}
                <Modal
                    title={
                        <Title level={4} style={{ margin: 0 }}>
                            Send Template - {selectedLeadForTemplate?.name || ""}
                        </Title>
                    }
                    open={isSendTemplateModalVisible}
                    onCancel={() => {
                        setIsSendTemplateModalVisible(false);
                        handleTemplateReset();
                    }}
                    width={800}
                    footer={null}
                    destroyOnClose
                    className='send-template-modal'
                    bodyStyle={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "16px",
                    }}
                >
                    <SendTemplate
                        selectedLead={selectedLeadForTemplate}
                        allTemplates={allTemplates}
                        selectedTemplate={selectedTemplate}
                        setSelectedTemplate={setSelectedTemplate}
                        formData={formData}
                        setFormData={setFormData}
                        templateVariables={templateVariables}
                        setTemplateVariables={setTemplateVariables}
                        fileList={fileList}
                        setFileList={setFileList}
                        handleFormSubmit={handleTemplateFormSubmit}
                        handleReset={handleTemplateReset}
                    />
                </Modal>

                <SyncConfirmationModal
                    visible={isSyncModalVisible}
                    onCancel={handleSyncCancel}
                    onConfirm={handleSyncConfirm}
                    loading={syncingContacts}
                    stats={syncStats}
                />

                {/* ComposeModal for Template Selection */}
                <ComposeModals
                    modelopen={composeModalOpen}
                    data={allTemplates || []}
                    setModelOpen={setComposeModalOpen}
                    handleTemplateSelect={handleSelectTemplate}
                />

                {/* ReminderModal for Lead Details */}
                <ReminderModal
                    selectedLead={selectedLead}
                    onClose={() => {
                        setSelectedLead(null);
                        setShowReminderModal(false);
                    }}
                    customFieldsData={customFieldsData.filter(field => fieldConfig[field.key])}
                    onSaveNotes={async newNotes => {
                        try {
                            await updateLead({
                                leadId: selectedLead.id,
                                notes: newNotes,
                            });

                            setNotes(newNotes);
                            refetchLeads();

                            enqueueSnackbar("Notes saved successfully!", {
                                variant: "success",
                                autoHideDuration: 3000,
                            });
                        } catch (error) {
                            enqueueSnackbar("Failed to save notes", {
                                variant: "error",
                                autoHideDuration: 3000,
                            });
                        }
                    }}
                    onSaveReminder={async updatedLead => {
                        try {
                            await updateLead({
                                leadId: updatedLead.id,
                                ...updatedLead,
                            });

                            refetchLeads();

                            enqueueSnackbar("Reminder saved successfully!", {
                                variant: "success",
                                autoHideDuration: 3000,
                            });
                        } catch (error) {
                            enqueueSnackbar("Failed to save reminder", {
                                variant: "error",
                                autoHideDuration: 3000,
                            });
                        }
                    }}
                    notes={selectedLead?.notes || notes || ""}
                    setNotes={setNotes}
                    leads={leads}
                    setLeads={async updatedLeads => {
                        refetchLeads();
                    }}
                />

                <ImportLeadsModal
                    visible={isImportModalVisible}
                    onCancel={() => setIsImportModalVisible(false)}
                    onImportComplete={handleImportComplete}
                    createLead={createLead}
                    bulkCreateLeads={bulkCreateLeadsMutation}
                    fieldConfig={fieldConfig}
                    configData={configData}
                    existingLeads={duplicateCheckData?.data || leads}
                />

                {/* Bulk Update Modal */}
                <Modal
                    title={
                        <span>
                            <EditOutlined style={{ marginRight: 8, color: "var(--primary)" }} />
                            Bulk Update - {selectedRowKeys.length} Lead
                            {selectedRowKeys.length > 1 ? "s" : ""} Selected
                        </span>
                    }
                    open={isBulkUpdateModalVisible}
                    onCancel={() => {
                        setIsBulkUpdateModalVisible(false);
                        setBulkStatusValue("");
                        setBulkAssignedValue("");
                    }}
                    onOk={() => {
                        if (!bulkStatusValue && !bulkAssignedValue) {
                            message.warning(
                                "Please select at least one field to update (Status or Assigned)"
                            );
                            return;
                        }
                        handleBulkUpdate();
                    }}
                    confirmLoading={bulkUpdating}
                    okText='Apply Changes'
                    cancelText='Cancel'
                    width={550}
                    okButtonProps={{
                        disabled: !bulkStatusValue && !bulkAssignedValue,
                    }}
                >
                    <div style={{ padding: "16px 0" }}>
                        {/* Update Status Section */}
                        <div style={{ marginBottom: "24px" }}>
                            <Text
                                strong
                                style={{ display: "block", marginBottom: 12, fontSize: "15px" }}
                            >
                                Update Status:
                            </Text>
                            <Select
                                placeholder='Select new status (optional)'
                                value={bulkStatusValue || undefined}
                                onChange={value => setBulkStatusValue(value)}
                                style={{ width: "100%" }}
                                size='large'
                                allowClear
                            >
                                {statusOptions
                                    .filter(option => option !== "New Lead")
                                    .map(option => (
                                        <Option key={option} value={option}>
                                            <Text
                                                color={
                                                    option === "Warm"
                                                        ? "orange"
                                                        : option === "Hot"
                                                            ? "red"
                                                            : option === "Cold"
                                                                ? "green"
                                                                : option === "Invalid"
                                                                    ? "gray"
                                                                    : "default"
                                                }
                                            >
                                                {option}
                                            </Text>
                                        </Option>
                                    ))}
                            </Select>

                            {/* Warning for converted leads */}
                            {bulkStatusValue &&
                                leads.filter(
                                    lead =>
                                        selectedRowKeys.includes(lead.id) &&
                                        (lead.isConverted || lead.status === "Converted")
                                ).length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "12px",
                                            padding: "12px",
                                            backgroundColor: "#fff7e6",
                                            borderRadius: "6px",
                                            border: "1px solid #ffd591",
                                        }}
                                    >
                                        <Text type='warning' style={{ fontSize: "12px" }}>
                                            <ExclamationCircleOutlined
                                                style={{ marginRight: 6, color: "#fa8c16" }}
                                            />
                                            <strong>Warning:</strong>{" "}
                                            {
                                                leads.filter(
                                                    lead =>
                                                        selectedRowKeys.includes(lead.id) &&
                                                        (lead.isConverted || lead.status === "Converted")
                                                ).length
                                            }{" "}
                                            converted lead(s) will be skipped from status update
                                        </Text>
                                    </div>
                                )}
                        </div>

                        <Divider style={{ margin: "16px 0" }} />

                        {/* Change Assigned Section */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text
                                strong
                                style={{ display: "block", marginBottom: 12, fontSize: "15px" }}
                            >
                                Change Assigned To
                            </Text>
                            <Select
                                placeholder='Select assigned person (optional)'
                                value={bulkAssignedValue || undefined}
                                onChange={value => setBulkAssignedValue(value)}
                                style={{ width: "100%" }}
                                size='large'
                                showSearch
                                allowClear
                                disabled={!hasToken}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {assignedOptions.map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <Divider style={{ margin: "16px 0" }} />

                        {/* Summary Information */}
                        <div
                            style={{
                                padding: "12px",
                                backgroundColor: "#f0f5ff",
                                borderRadius: "6px",
                                border: "1px solid #d6e4ff",
                            }}
                        >
                            <Text
                                strong
                                style={{ fontSize: "13px", display: "block", marginBottom: 8 }}
                            >
                                Update Summary:
                            </Text>

                            {!bulkStatusValue && !bulkAssignedValue && (
                                <Text type='secondary' style={{ fontSize: "12px" }}>
                                    • No updates selected. Please select at least one option above.
                                </Text>
                            )}

                            {bulkStatusValue && (
                                <Text
                                    style={{ fontSize: "12px", display: "block", marginBottom: 4 }}
                                >
                                    • <strong>Status</strong> will be updated to "
                                    <strong>{bulkStatusValue}</strong>" for{" "}
                                    {selectedRowKeys.length -
                                        leads.filter(
                                            lead =>
                                                selectedRowKeys.includes(lead.id) &&
                                                (lead.isConverted || lead.status === "Converted")
                                        ).length}{" "}
                                    lead(s)
                                </Text>
                            )}

                            {bulkAssignedValue && (
                                <Text
                                    style={{ fontSize: "12px", display: "block", marginBottom: 4 }}
                                >
                                    • <strong>Assigned status</strong> will be changed to "
                                    <strong>{bulkAssignedValue}</strong>" for{" "}
                                    {selectedRowKeys.length} lead(s)
                                </Text>
                            )}
                        </div>
                    </div>
                </Modal>

                <Drawer
                    title={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span>Global Filter</span>
                        </div>
                    }
                    placement='right'
                    onClose={() => setIsFilterDrawerVisible(false)}
                    open={isFilterDrawerVisible}
                    width={400}
                    footer={
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button className="btn-secondary" onClick={() => setIsFilterDrawerVisible(false)}>
                                Cancel
                            </Button>
                            <Button className="btn-primary" style={{
                                background:
                                    selectedLead?.isConverted ||
                                        selectedLead?.status === "Converted"
                                        ? "var(--primary)"
                                        : "var(--primary)",
                                borderColor:
                                    selectedLead?.isConverted ||
                                        selectedLead?.status === "Converted"
                                        ? "var(--primary)"
                                        : "var(--primary)",
                                borderRadius: 8,
                                color: "white",
                            }} onClick={handleClearAllFilters}>
                                Clear All
                            </Button>
                        </div>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                Date Range
                            </Text>
                            <DatePicker.RangePicker
                                style={{ width: "100%" }}
                                value={globalDateRange}
                                onChange={dates => setGlobalDateRange(dates)}
                                allowClear
                            />
                        </div>

                        {/* Filter by Assigned */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                Assigned To
                            </Text>
                            <Select
                                showSearch
                                className='custom-select'
                                style={{ width: "100%" }}
                                placeholder='Select assigned person'
                                allowClear
                                value={selectedAssigned || undefined}
                                onChange={value => setSelectedAssigned(value || "")}
                                loading={agentLoading}
                            >
                                {assignedOptions.map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Filter by Company */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                Company
                            </Text>
                            <Select
                                showSearch
                                className='custom-select'
                                style={{ width: "100%" }}
                                placeholder='Select company'
                                allowClear
                                value={selectedCompany || undefined}
                                onChange={value => setSelectedCompany(value || "")}
                            >
                                {companyOption.map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Filter by Status */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                Status
                            </Text>
                            <Select
                                showSearch
                                className='custom-select'
                                style={{ width: "100%" }}
                                placeholder='Select status'
                                allowClear
                                value={selectedStatus || undefined}
                                onChange={value => setSelectedStatus(value || "")}
                            >
                                {[...statusOptions, "Converted"].map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Filter by Source */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                Source
                            </Text>
                            <Select
                                showSearch
                                className='custom-select'
                                style={{ width: "100%" }}
                                placeholder='Select source'
                                allowClear
                                value={selectedSource || undefined}
                                onChange={value => setSelectedSource(value || "")}
                            >
                                {sourceOptionsFromLeads.map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Active Filters Summary */}
                        {activeFiltersCount > 0 && (
                            <div
                                style={{
                                    padding: "12px",
                                    backgroundColor: "#f0f5ff",
                                    borderRadius: "6px",
                                    marginTop: "8px",
                                }}
                            >
                                <Text type='secondary' style={{ fontSize: "12px" }}>
                                    <strong>{activeFiltersCount}</strong> filter
                                    {activeFiltersCount > 1 ? "s" : ""} active
                                </Text>
                                <div
                                    style={{
                                        marginTop: "8px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                    }}
                                >
                                    {selectedAssigned && (
                                        <Tag closable onClose={() => setSelectedAssigned("")}>
                                            Assigned: {selectedAssigned}
                                        </Tag>
                                    )}
                                    {selectedCompany && (
                                        <Tag closable onClose={() => setSelectedCompany("")}>
                                            Company: {selectedCompany}
                                        </Tag>
                                    )}
                                    {selectedStatus && (
                                        <Tag closable onClose={() => setSelectedStatus("")}>
                                            Status: {selectedStatus}
                                        </Tag>
                                    )}
                                    {selectedSource && (
                                        <Tag closable onClose={() => setSelectedSource("")}>
                                            Source: {selectedSource}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Drawer>

                {/* Facebook import progress */}
                {importProgress && (
                    <div
                        style={{
                            padding: "12px",
                            background:
                                importProgress.status === "complete" ? "#f6ffed" : "#fff7e6",
                            borderRadius: "8px",
                            marginTop: "12px",
                        }}
                    >
                        {importProgress.status === "importing" && (
                            <>
                                <Spin /> Importing leads...
                            </>
                        )}
                        {importProgress.status === "complete" && (
                            <>
                                ✅ Imported: {importProgress.imported} | ⏭️ Skipped:{" "}
                                {importProgress.skipped}
                            </>
                        )}
                    </div>
                )}

                <style>{`
                .custom-select .ant-select-selector {
                    border-radius: 8px !important;
                }
                `}</style>
            
        </div>
    );
};

export default Leads;