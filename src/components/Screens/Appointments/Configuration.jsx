import React, { useState, useEffect, useContext } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    TimePicker,
    Button,
    Card,
    Space,
    Typography,
    message,
    Checkbox,
    Row,
    Col,
    Table,
    Dropdown,
    Menu,
    Tag,
    Divider,
    Spin,
    Descriptions,
} from "antd";
import {
    User,
    Clock,
    Plus,
    Save,
    CalendarOff,
    CalendarCheck2,
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    Search,
    Copy,
    Phone,
    Mail,
    UserCheck,
    DollarSign,
    CreditCard,
    MessageSquare,
} from "lucide-react";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

function Configuration() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [editingWorkerId, setEditingWorkerId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [copyingWorkerIds, setCopyingWorkerIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workTimes, setWorkTimes] = useState([
        { fromTime: null, toTime: null },
    ]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workersData, setWorkersData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [workersError, setWorkersError] = useState(null);

    // Static data for workers
    const staticWorkers = [
        {
            id: "1",
            name: "John Doe",
            mobile: "9876543210",
            age: 30,
            profession: "Plumber",
            numberOfSlots: 3,
            slotDuration: "30 minutes",
            paymentStatus: "completed",
            amountPerSlot: 500,
            whatsAppFlow: "flow_token_1",
            availableDays: ["mon", "wed", "fri"],
            unavailableDates: ["25/12/2024"],
            availableDates: ["01/01/2024", "31/12/2024"],
            workTimes: [
                { fromTime: "09:00", toTime: "13:00" },
                { fromTime: "14:00", toTime: "18:00" }
            ],
            fromTime: "09:00",
            toTime: "18:00",
            createdAt: "2024-01-15T10:30:00Z"
        },
        {
            id: "2",
            name: "Jane Smith",
            mobile: "9876543211",
            age: 28,
            profession: "Electrician",
            numberOfSlots: 2,
            slotDuration: "45 minutes",
            paymentStatus: "pending",
            amountPerSlot: 750,
            whatsAppFlow: "flow_token_2",
            availableDays: ["tue", "thu", "sat"],
            unavailableDates: ["01/01/2024"],
            availableDates: ["15/01/2024", "15/06/2024"],
            workTimes: [
                { fromTime: "10:00", toTime: "15:00" }
            ],
            fromTime: "10:00",
            toTime: "15:00",
            createdAt: "2024-02-20T14:45:00Z"
        },
        {
            id: "3",
            name: "Robert Johnson",
            mobile: "9876543212",
            age: 35,
            profession: "Carpenter",
            numberOfSlots: 4,
            slotDuration: "60 minutes",
            paymentStatus: "completed",
            amountPerSlot: 1000,
            whatsAppFlow: null,
            availableDays: ["mon", "tue", "wed", "thu", "fri"],
            unavailableDates: [],
            availableDates: ["01/03/2024", "31/08/2024"],
            workTimes: [
                { fromTime: "08:00", toTime: "12:00" },
                { fromTime: "13:00", toTime: "17:00" }
            ],
            fromTime: "08:00",
            toTime: "17:00",
            createdAt: "2024-03-10T09:15:00Z"
        },
        {
            id: "4",
            name: "Alice Williams",
            mobile: "9876543213",
            age: 32,
            profession: "Painter",
            numberOfSlots: 1,
            slotDuration: "30 minutes",
            paymentStatus: "pending",
            amountPerSlot: 400,
            whatsAppFlow: "flow_token_3",
            availableDays: ["sat", "sun"],
            unavailableDates: ["15/08/2024", "02/10/2024"],
            availableDates: [],
            workTimes: [
                { fromTime: "11:00", toTime: "16:00" }
            ],
            fromTime: "11:00",
            toTime: "16:00",
            createdAt: "2024-01-25T16:20:00Z"
        },
        {
            id: "5",
            name: "Michael Brown",
            mobile: "9876543214",
            age: 40,
            profession: "AC Technician",
            numberOfSlots: 3,
            slotDuration: "90 minutes",
            paymentStatus: "completed",
            amountPerSlot: 1200,
            whatsAppFlow: "flow_token_4",
            availableDays: ["mon", "tue", "thu", "fri"],
            unavailableDates: ["26/01/2024"],
            availableDates: ["01/04/2024", "30/09/2024"],
            workTimes: [
                { fromTime: "07:00", toTime: "11:00" },
                { fromTime: "12:00", toTime: "16:00" }
            ],
            fromTime: "07:00",
            toTime: "16:00",
            createdAt: "2024-02-05T11:10:00Z"
        }
    ];

    // Static data for WhatsApp flows
    const staticFlows = [
        { flowToken: "flow_token_1", name: "Booking Confirmation Flow" },
        { flowToken: "flow_token_2", name: "Appointment Reminder Flow" },
        { flowToken: "flow_token_3", name: "Payment Notification Flow" },
        { flowToken: "flow_token_4", name: "Service Completion Flow" },
    ];

    useEffect(() => {
        // Simulate loading data
        setIsLoading(true);
        const timer = setTimeout(() => {
            setWorkersData({
                workers: staticWorkers,
                total: staticWorkers.length
            });
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const options = staticFlows.map(flow => ({
        value: flow?.flowToken,
        label: flow?.name,
    }));

    const timeUnits = [
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
    ];

    const daysOfWeek = [
        { label: "Sunday", value: "sun" },
        { label: "Monday", value: "mon" },
        { label: "Tuesday", value: "tue" },
        { label: "Wednesday", value: "wed" },
        { label: "Thursday", value: "thu" },
        { label: "Friday", value: "fri" },
        { label: "Saturday", value: "sat" },
    ];

    const paymentStatuses = [
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" },
    ];

    const DATE_FORMAT = "DD/MM/YYYY";

    // Handle search functionality
    const filteredWorkers = searchTerm
        ? staticWorkers.filter(worker =>
            worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.mobile.includes(searchTerm) ||
            worker.profession.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : staticWorkers;

    const currentData = {
        workers: filteredWorkers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        total: filteredWorkers.length
    };

    const workers = currentData?.workers?.map(worker => ({
        ...worker,
        key: worker.id,
        name: worker.name || worker.Name || "N/A",
        mobile: worker.mobile || worker.Mobile || worker.phone || worker.phoneNumber || worker.mobileNumber || worker.contactNumber || "N/A",
        paymentStatus: worker.paymentStatus || "pending",
        amountPerSlot: worker.amountPerSlot || 0,
        workTimes: Array.isArray(worker.workTimes) && worker.workTimes.length > 0
            ? worker.workTimes.map(wt => ({
                fromTime: wt.fromTime ? moment(wt.fromTime, "HH:mm") : null,
                toTime: wt.toTime ? moment(wt.toTime, "HH:mm") : null,
            }))
            : worker.fromTime && worker.toTime
                ? [
                    {
                        fromTime: moment(worker.fromTime, "HH:mm"),
                        toTime: moment(worker.toTime, "HH:mm"),
                    },
                ]
                : [{ fromTime: null, toTime: null }],
        unavailableDates: worker.unavailableDates || [],
        availableDates: worker.availableDates || [],
        availableDays: worker.availableDays || [],
        whatsAppFlow: worker.whatsAppFlow || null,
        createdAt: worker.createdAt ? moment(worker.createdAt) : null,
        slotDuration: worker.slotDuration || "30 minutes",
    })) || [];

    const handleAvailableDatesChange = dates => {
        setAvailableDates(dates || []);
    };

    const addUnavailableDate = date => {
        if (
            date &&
            !unavailableDates.some(existingDate => existingDate.isSame(date, "day"))
        ) {
            setUnavailableDates([...unavailableDates, date]);
        }
    };

    const removeUnavailableDate = dateToRemove => {
        setUnavailableDates(prevDates =>
            prevDates.filter(date => !date.isSame(dateToRemove, "day"))
        );
    };

    const disabledDate = current => {
        if (current && current < moment().startOf("day")) {
            return true;
        }

        if (selectedDays.length > 0) {
            const dayOfWeek = current.format("ddd").toLowerCase();
            if (!selectedDays.includes(dayOfWeek)) {
                return true;
            }
        }

        return false;
    };

    const disabledDateForUnavailable = current => {
        if (current && current < moment().startOf("day")) {
            return true;
        }

        if (selectedDays.length > 0) {
            const dayOfWeek = current.format("ddd").toLowerCase();
            if (!selectedDays.includes(dayOfWeek)) {
                return true;
            }
        }

        return false;
    };

    const addWorkTime = () => {
        setWorkTimes([...workTimes, { fromTime: null, toTime: null }]);
    };

    const removeWorkTime = index => {
        if (workTimes.length > 1) {
            const newWorkTimes = [...workTimes];
            newWorkTimes.splice(index, 1);
            setWorkTimes(newWorkTimes);
        }
    };

    const updateWorkTime = (index, field, value) => {
        const newWorkTimes = [...workTimes];
        newWorkTimes[index][field] = value;
        setWorkTimes(newWorkTimes);
    };

    const showCreateModal = () => {
        setEditingWorkerId(null);
        form.resetFields();
        setAvailableDates([]);
        setUnavailableDates([]);
        setSelectedDays([]);
        setWorkTimes([{ fromTime: null, toTime: null }]);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setAvailableDates([]);
        setUnavailableDates([]);
        setSelectedDays([]);
        setEditingWorkerId(null);
        setWorkTimes([{ fromTime: null, toTime: null }]);
        setSelectedWorker(null);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const values = await form.validateFields();

            const validWorkTimes = workTimes.filter(wt => wt.fromTime && wt.toTime);
            if (validWorkTimes.length === 0) {
                message.error("Please add at least one valid work time!");
                setIsSubmitting(false);
                return;
            }

            const workerData = {
                ...values,
                availableDays: selectedDays,
                availableDates:
                    availableDates && availableDates.length === 2
                        ? [
                            availableDates[0]?.format(DATE_FORMAT),
                            availableDates[1]?.format(DATE_FORMAT),
                        ].filter(Boolean)
                        : [],
                unavailableDates:
                    unavailableDates && unavailableDates.length > 0
                        ? unavailableDates.map(date => date.format(DATE_FORMAT))
                        : [],
                workTimes: validWorkTimes.map(wt => ({
                    fromTime: wt.fromTime?.format("HH:mm"),
                    toTime: wt.toTime?.format("HH:mm"),
                })),
                slotDuration: `${values.slotDuration} ${values.timeUnit}`,
            };

            delete workerData.timeUnit;

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingWorkerId) {
                // Update existing worker in static data
                const updatedWorkers = staticWorkers.map(worker =>
                    worker.id === editingWorkerId
                        ? { ...worker, ...workerData, id: editingWorkerId }
                        : worker
                );

                // In a real app, you would update state here
                console.log("Updated worker:", workerData);
                message.success("Worker updated successfully!");
            } else {
                // Create new worker
                const newWorker = {
                    id: Date.now().toString(),
                    ...workerData,
                    createdAt: new Date().toISOString()
                };

                // In a real app, you would update state here
                console.log("Created new worker:", newWorker);
                message.success("Worker created successfully!");
            }

            handleCancel();

            // Simulate refetch
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                message.info("Data refreshed");
            }, 500);

        } catch (error) {
            console.error("Error saving worker:", error);
            message.error(error?.data?.message || "Failed to save worker");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = workerId => {
        const workerToEdit = staticWorkers.find(worker => worker.id === workerId);

        if (workerToEdit) {
            try {
                // Reset form and state first
                form.resetFields();
                setAvailableDates([]);
                setUnavailableDates([]);
                setSelectedDays([]);
                setWorkTimes([{ fromTime: null, toTime: null }]);

                // Parse slot duration with better error handling
                let durationValue = 30;
                let durationUnit = "minutes";

                if (
                    workerToEdit.slotDuration &&
                    typeof workerToEdit.slotDuration === "string"
                ) {
                    const durationParts = workerToEdit.slotDuration.split(" ");
                    if (durationParts.length >= 2) {
                        durationValue = parseInt(durationParts[0]) || 30;
                        durationUnit = durationParts[1] || "minutes";
                    }
                }

                // Set form values
                form.setFieldsValue({
                    name: workerToEdit.name || "",
                    mobile: workerToEdit.mobile || "",
                    age: workerToEdit.age || null,
                    profession: workerToEdit.profession || "",
                    numberOfSlots: workerToEdit.numberOfSlots || 1,
                    slotDuration: durationValue,
                    timeUnit: durationUnit,
                    whatsAppFlow: workerToEdit.whatsAppFlow || null,
                    paymentStatus: workerToEdit.paymentStatus || "pending",
                    amountPerSlot: workerToEdit.amountPerSlot || 0,
                });

                // Set state values
                setSelectedDays(workerToEdit.availableDays || []);

                // Handle available dates
                const newAvailableDates = [];
                if (workerToEdit.availableDates?.length === 2) {
                    const date1 = moment(workerToEdit.availableDates[0], DATE_FORMAT);
                    const date2 = moment(workerToEdit.availableDates[1], DATE_FORMAT);
                    if (date1.isValid() && date2.isValid()) {
                        newAvailableDates.push(date1, date2);
                    }
                }
                setAvailableDates(newAvailableDates);

                // Handle unavailable dates
                const newUnavailableDates = (workerToEdit.unavailableDates || [])
                    .map(date => moment(date, DATE_FORMAT))
                    .filter(date => date.isValid());
                setUnavailableDates(newUnavailableDates);

                // Handle work times
                let validWorkTimes = [];

                if (Array.isArray(workerToEdit.workTimes)) {
                    validWorkTimes = workerToEdit.workTimes
                        .filter(wt => wt.fromTime && wt.toTime)
                        .map(wt => ({
                            fromTime: moment(wt.fromTime, "HH:mm").isValid()
                                ? moment(wt.fromTime, "HH:mm")
                                : null,
                            toTime: moment(wt.toTime, "HH:mm").isValid()
                                ? moment(wt.toTime, "HH:mm")
                                : null,
                        }))
                        .filter(wt => wt.fromTime && wt.toTime);
                } else if (workerToEdit.fromTime && workerToEdit.toTime) {
                    const fromTime = moment(workerToEdit.fromTime, "HH:mm");
                    const toTime = moment(workerToEdit.toTime, "HH:mm");
                    if (fromTime.isValid() && toTime.isValid()) {
                        validWorkTimes = [{ fromTime, toTime }];
                    }
                }

                setWorkTimes(
                    validWorkTimes.length > 0
                        ? validWorkTimes
                        : [{ fromTime: null, toTime: null }]
                );
                setEditingWorkerId(workerId);
                setIsModalVisible(true);
            } catch (error) {
                console.error("Error in handleEdit:", error);
                message.error("Error loading worker data");
            }
        } else {
            message.error("Worker not found");
        }
    };

    const handleCopy = async workerId => {
        try {
            setCopyingWorkerIds(prev => new Set([...prev, workerId]));

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Find worker to copy
            const workerToCopy = staticWorkers.find(w => w.id === workerId);
            if (workerToCopy) {
                const copiedWorker = {
                    ...workerToCopy,
                    id: Date.now().toString(),
                    name: `${workerToCopy.name} (Copy)`,
                    createdAt: new Date().toISOString()
                };

                console.log("Copied worker:", copiedWorker);
                message.success("Worker copied successfully!");
            }

        } catch (error) {
            console.error("Error copying worker:", error);
            message.error(error?.data?.message || "Failed to copy worker");
        } finally {
            setCopyingWorkerIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(workerId);
                return newSet;
            });
        }
    };

    const handleDelete = workerId => {
        Modal.confirm({
            title: "Confirm Delete",
            content: "Are you sure you want to delete this worker?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 800));

                    console.log("Deleted worker ID:", workerId);
                    message.success("Worker deleted successfully");

                    // In a real app, you would update state here
                    // const updatedWorkers = staticWorkers.filter(w => w.id !== workerId);

                } catch (error) {
                    console.error("Error deleting worker:", error);
                    message.error(error?.data?.message || "Failed to delete worker");
                }
            },
        });
    };

    const handleBulkDelete = selectedRowKeys => {
        Modal.confirm({
            title: "Confirm Bulk Delete",
            content: `Are you sure you want to delete ${selectedRowKeys.length} workers?`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    console.log("Bulk deleting worker IDs:", selectedRowKeys);
                    message.success(
                        `${selectedRowKeys.length} workers deleted successfully`
                    );

                    // In a real app, you would update state here
                    // const updatedWorkers = staticWorkers.filter(w => !selectedRowKeys.includes(w.id));

                    setSelectedRowKeys([]);
                } catch (error) {
                    console.error("Error deleting workers:", error);
                    message.error(error?.data?.message || "Failed to delete workers");
                }
            },
        });
    };

    const handleSearch = value => {
        setSearchTerm(value);
        setCurrent(1);
    };

    const handleTableChange = pagination => {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleRowClick = record => {
        setSelectedWorker(record);
    };

    const getFlowName = flowToken => {
        if (!flowToken) return "N/A";
        const flow = staticFlows.find(f => f.flowToken === flowToken);
        return flow ? flow.name : flowToken;
    };

    const actionMenu = record => (
        <Menu>
            <Menu.Item
                key='edit'
                icon={<Edit size={16} />}
                onClick={() => handleEdit(record.id)}
            >
                Edit
            </Menu.Item>
            <Menu.Item
                key='copy'
                icon={
                    copyingWorkerIds.has(record.id) ? (
                        <Spin size='small' />
                    ) : (
                        <Copy size={16} />
                    )
                }
                onClick={() => handleCopy(record.id)}
                disabled={copyingWorkerIds.has(record.id)}
            >
                {copyingWorkerIds.has(record.id) ? "Copying..." : "Copy"}
            </Menu.Item>
            <Menu.Item
                key='delete'
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(record.id)}
                danger
                style={{ color: "red" }}
            >
                Delete
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: "S.No.",
            key: "sno",
            render: (_, __, index) => (
                <Text style={{ display: "block", textAlign: "left" }}>
                    {(currentPage - 1) * pageSize + index + 1}
                </Text>
            ),
            width: 70,
            align: "left",
            fixed: "left",
        },
        {
            title: (
                <Space size={6}>
                    <span>Name</span>
                </Space>
            ),
            dataIndex: "name",
            key: "name",
            width: 150,
            fixed: "left",
            render: (name, record) => (
                <Text
                    strong
                    ellipsis={{ tooltip: true }}
                    style={{ display: "block", textAlign: "left" }}
                >
                    {name || record.Name || "N/A"}
                </Text>
            ),
            align: "left",
        },
        {
            title: (
                <Space size={6}>
                    <span>Mobile</span>
                </Space>
            ),
            dataIndex: "mobile",
            key: "mobile",
            width: 130,
            render: (mobile, record) => (
                <Text style={{ display: "block", textAlign: "left" }}>
                    {mobile !== "N/A" ? mobile : "N/A"}
                </Text>
            ),
            align: "left",
            responsive: ["sm", "md", "lg", "xl"],
        },
        {
            title: "Age",
            dataIndex: "age",
            key: "age",
            width: 70,
            render: (age, record) => (
                <Text style={{ display: "block", textAlign: "left" }}>
                    {age || record.Age || "N/A"}
                </Text>
            ),
            align: "left",
            responsive: ["sm", "md", "lg", "xl"],
        },
        {
            title: "Profession",
            dataIndex: "profession",
            key: "profession",
            width: 150,
            render: profession => (
                <Text
                    ellipsis={{ tooltip: true }}
                    style={{ display: "block", textAlign: "left" }}
                >
                    {profession || "N/A"}
                </Text>
            ),
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: "Available Dates",
            dataIndex: "availableDates",
            key: "availableDates",
            width: 180,
            render: dates => (
                <Text
                    ellipsis={{ tooltip: true }}
                    style={{ display: "block", textAlign: "left" }}
                >
                    {dates?.length ? dates.join(" to ") : "N/A"}
                </Text>
            ),
            align: "left",
            responsive: ["lg", "xl"],
        },
        {
            title: (
                <Space size={6}>
                    <span>Work Times</span>
                </Space>
            ),
            key: "workTime",
            width: 220,
            render: (_, record) => {
                const validWorkTimes = record.workTimes
                    ? record.workTimes.filter(wt => wt.fromTime && wt.toTime)
                    : [];

                return (
                    <div style={{ textAlign: "left" }}>
                        {validWorkTimes.length > 0 ? (
                            validWorkTimes.map((wt, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom:
                                            index < validWorkTimes.length - 1 ? "4px" : "0",
                                        padding: "2px 6px",
                                        backgroundColor: "#f0f7ff",
                                        borderRadius: "4px",
                                        border: "1px solid #d6e4ff",
                                        fontSize: "12px",
                                    }}
                                >
                                    <Text style={{ fontSize: "12px", fontWeight: "500" }}>
                                        {`${moment(wt.fromTime, "HH:mm").format("h:mm A")} - ${moment(wt.toTime, "HH:mm").format("h:mm A")}`}
                                    </Text>
                                </div>
                            ))
                        ) : (
                            <Text type='secondary' style={{ fontSize: "12px" }}>
                                No work times set
                            </Text>
                        )}
                    </div>
                );
            },
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: "Slots",
            key: "slots",
            width: 120,
            render: record => (
                <div style={{ textAlign: "left" }}>
                    <Text strong style={{ display: "block" }}>
                        {record.numberOfSlots || 1}
                    </Text>
                </div>
            ),
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: (
                <Space size={6}>
                    <span>WhatsApp Flow</span>
                </Space>
            ),
            dataIndex: "whatsAppFlow",
            key: "whatsAppFlow",
            width: 180,
            render: flowToken => (
                <Text
                    ellipsis={{ tooltip: getFlowName(flowToken) }}
                    style={{ display: "block", textAlign: "left" }}
                >
                    {getFlowName(flowToken)}
                </Text>
            ),
            align: "left",
            responsive: ["lg", "xl"],
        },
        {
            title: (
                <Space size={6}>
                    <span>Payment Status</span>
                </Space>
            ),
            dataIndex: "paymentStatus",
            key: "paymentStatus",
            width: 130,
            render: status => (
                <Tag
                    color={status === "completed" ? "green" : "orange"}
                    style={{ margin: 0 }}
                >
                    {status === "completed" ? "Completed" : "Pending"}
                </Tag>
            ),
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: (
                <Space size={6}>
                    <span>Amount/Slot</span>
                </Space>
            ),
            dataIndex: "amountPerSlot",
            key: "amountPerSlot",
            width: 120,
            render: amount => (
                <Text style={{ display: "block", textAlign: "left" }}>
                    ₹{amount || 0}
                </Text>
            ),
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: date => (
                <Text style={{ display: "block", textAlign: "left" }}>
                    {date ? date.format("DD/MM/YYYY hh:mm A") : "N/A"}
                </Text>
            ),
            align: "left",
            responsive: ["md", "lg", "xl"],
        },
        {
            title: "Action",
            key: "action",
            width: 80,
            fixed: "right",
            render: (_, record) => (
                <Dropdown
                    overlay={actionMenu(record)}
                    trigger={["click"]}
                    disabled={copyingWorkerIds.has(record.id)}
                    placement='bottomRight'
                >
                    <Button
                        type='text'
                        icon={<MoreVertical size={16} />}
                        loading={copyingWorkerIds.has(record.id)}
                        style={{ width: "32px", height: "32px" }}
                    />
                </Dropdown>
            ),
            align: "center",
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: selectedKeys => {
            setSelectedRowKeys(selectedKeys);
        },
        columnWidth: 50,
        fixed: true,
    };

    if (workersError) {
        return (
            <div style={{ padding: "24px", textAlign: "center" }}>
                <Text type='danger'>
                    Error loading workers: {workersError?.message || "Unknown error"}
                </Text>
                <br />
                <Button onClick={() => window.location.reload()} style={{ marginTop: "16px" }}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <Input.Search
                    placeholder='Search workers...'
                    onSearch={handleSearch}
                    onChange={e => !e.target.value && setSearchTerm("")}
                    style={{ width: 300 }}
                    enterButton={<Search size={16} />}
                />

                <Space>
                    {selectedRowKeys.length > 0 && (
                        <Button
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => handleBulkDelete(selectedRowKeys)}
                            style={{ borderRadius: "10px" }}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    )}

                    <Button
                        type='primary'
                        icon={<Plus size={16} />}
                        onClick={showCreateModal}
                        style={{
                            backgroundColor: "var(--primary)",
                            borderColor: "#52c41a",
                            borderRadius: "10px",
                        }}
                    >
                        Create Worker
                    </Button>
                </Space>
            </div>

            <div
                style={{
                    width: "100%",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                <Table
                    columns={columns}
                    dataSource={workers}
                    rowKey='id'
                    loading={isLoading}
                    bordered
                    size='middle'
                    scroll={{
                        x: 2000,
                        y: "calc(100vh - 350px)",
                    }}
                    rowSelection={rowSelection}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: currentData?.total || 0,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        style: {
                            padding: "16px",
                            textAlign: "center",
                        },
                    }}
                    onChange={handleTableChange}
                    style={{
                        marginTop: 0,
                    }}
                    className='custom-workers-table'
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <Space>
                        <User size={20} />
                        <span>{editingWorkerId ? "Edit Worker" : "Create Worker"}</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                width={900}
                footer={[
                    <Button key='cancel' onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        icon={<Save size={16} />}
                    >
                        {editingWorkerId ? "Update" : "Save"}
                    </Button>,
                ]}
                destroyOnClose={true}
            >
                <Form form={form} layout='vertical'>
                    {/* Basic Information */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <Space>
                                        <User size={16} />
                                        <span>Name</span>
                                    </Space>
                                }
                                name='name'
                                rules={[
                                    { required: true, message: "Please input the name!" },
                                    { min: 2, message: "Name must be at least 2 characters!" },
                                ]}
                            >
                                <Input placeholder="Enter worker's name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <Space>
                                        <Phone size={16} />
                                        <span>Mobile Number</span>
                                    </Space>
                                }
                                name='mobile'
                                rules={[
                                    { required: true, message: "Please input mobile number!" },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: "Please enter a valid 10-digit mobile number!",
                                    },
                                ]}
                            >
                                <Input placeholder="Enter worker's mobile number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label='Age'
                                name='age'
                                rules={[
                                    {
                                        type: "number",
                                        min: 18,
                                        max: 100,
                                        message: "Age must be between 18-100!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="Enter worker's age"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Profession'
                                name='profession'
                                rules={[
                                    { required: true, message: "Please input profession!" },
                                ]}
                            >
                                <Input placeholder="Enter worker's profession" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={
                                    <Space>
                                        <DollarSign size={16} />
                                        <span>Amount Per Slot</span>
                                    </Space>
                                }
                                name='amountPerSlot'
                                rules={[
                                    {
                                        type: "number",
                                        min: 0,
                                        message: "Amount must be positive!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder='Enter amount per slot'
                                    prefix='₹'
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Slot Configuration */}
                    <Divider orientation='left' style={{ marginTop: 0 }}>
                        <Space>
                            <Clock size={16} />
                            <span>Slot Configuration</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label='Number of Slots'
                                name='numberOfSlots'
                                rules={[
                                    {
                                        type: "number",
                                        min: 1,
                                        max: 10,
                                        message: "Slots must be between 1-10!",
                                    },
                                ]}
                                initialValue={1}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder='Enter number of slots'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Slot Duration'
                                name='slotDuration'
                                rules={[
                                    {
                                        type: "number",
                                        min: 5,
                                        max: 120,
                                        message: "Duration must be between 5-120!",
                                    },
                                ]}
                                initialValue={30}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder='Enter slot duration'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Time Unit'
                                name='timeUnit'
                                initialValue='minutes'
                            >
                                <Select>
                                    {timeUnits.map(unit => (
                                        <Option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Work Times */}
                    <Divider orientation='left'>
                        <Space>
                            <Clock size={16} />
                            <span>Work Times</span>
                        </Space>
                    </Divider>

                    {workTimes.map((workTime, index) => (
                        <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
                            <Col span={10}>
                                <TimePicker
                                    placeholder='Start Time'
                                    format='h:mm A'
                                    value={workTime.fromTime}
                                    onChange={value => updateWorkTime(index, "fromTime", value)}
                                    style={{ width: "100%" }}
                                />
                            </Col>
                            <Col span={10}>
                                <TimePicker
                                    placeholder='End Time'
                                    format='h:mm A'
                                    value={workTime.toTime}
                                    onChange={value => updateWorkTime(index, "toTime", value)}
                                    style={{ width: "100%" }}
                                    disabled={!workTime.fromTime}
                                />
                            </Col>
                            <Col span={4}>
                                {index === 0 ? (
                                    <Button
                                        type='dashed'
                                        onClick={addWorkTime}
                                        block
                                        icon={<Plus size={16} />}
                                    >
                                        Add
                                    </Button>
                                ) : (
                                    <Button
                                        danger
                                        onClick={() => removeWorkTime(index)}
                                        block
                                        icon={<Trash2 size={16} />}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}

                    {/* Availability */}
                    <Divider orientation='left'>
                        <Space>
                            <CalendarCheck2 size={16} />
                            <span>Availability</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label='Available Days'>
                                <Checkbox.Group
                                    options={daysOfWeek}
                                    value={selectedDays}
                                    onChange={setSelectedDays}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label='Available Date Range'>
                                <DatePicker.RangePicker
                                    style={{ width: "100%" }}
                                    disabledDate={disabledDate}
                                    onChange={handleAvailableDatesChange}
                                    format={DATE_FORMAT}
                                    value={availableDates.length === 2 ? availableDates : null}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label='Unavailable Dates'>
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={disabledDateForUnavailable}
                                    onChange={addUnavailableDate}
                                    format={DATE_FORMAT}
                                />
                                <div style={{ marginTop: 8 }}>
                                    {unavailableDates.map((date, index) => (
                                        <Tag
                                            key={index}
                                            closable
                                            onClose={() => removeUnavailableDate(date)}
                                            style={{ marginBottom: 4 }}
                                        >
                                            {date.format(DATE_FORMAT)}
                                        </Tag>
                                    ))}
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* WhatsApp Flow */}
                    <Divider orientation='left'>
                        <Space>
                            <MessageSquare size={16} />
                            <span>WhatsApp Flow</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name='whatsAppFlow' label='Select Flow'>
                                <Select
                                    placeholder='Select a WhatsApp flow'
                                    options={options}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Payment Status */}
                    <Divider orientation='left'>
                        <Space>
                            <CreditCard size={16} />
                            <span>Payment Status</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name='paymentStatus' initialValue='pending'>
                                <Select>
                                    {paymentStatuses.map(status => (
                                        <Option key={status.value} value={status.value}>
                                            {status.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Worker Details Drawer */}
            {selectedWorker && (
                <Modal
                    title={
                        <Space>
                            <UserCheck size={20} />
                            <span>Worker Details</span>
                        </Space>
                    }
                    open={!!selectedWorker}
                    onCancel={() => setSelectedWorker(null)}
                    width={700}
                    footer={[
                        <Button key='close' onClick={() => setSelectedWorker(null)}>
                            Close
                        </Button>,
                    ]}
                >
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label='Name'>
                            {selectedWorker.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Mobile'>
                            {selectedWorker.mobile || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Age'>
                            {selectedWorker.age || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Profession'>
                            {selectedWorker.profession || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Available Days'>
                            {selectedWorker.availableDays?.length > 0
                                ? selectedWorker.availableDays
                                    .map(day => daysOfWeek.find(d => d.value === day)?.label)
                                    .join(", ")
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Work Times'>
                            {selectedWorker.workTimes?.length > 0
                                ? selectedWorker.workTimes.map((wt, i) => (
                                    <div key={i}>
                                        {wt.fromTime?.format("h:mm A")} -{" "}
                                        {wt.toTime?.format("h:mm A")}
                                    </div>
                                ))
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Number of Slots'>
                            {selectedWorker.numberOfSlots || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='Slot Duration'>
                            {selectedWorker.slotDuration || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label='WhatsApp Flow'>
                            {getFlowName(selectedWorker.whatsAppFlow)}
                        </Descriptions.Item>
                        <Descriptions.Item label='Payment Status'>
                            <Tag
                                color={
                                    selectedWorker.paymentStatus === "completed"
                                        ? "green"
                                        : "orange"
                                }
                            >
                                {selectedWorker.paymentStatus === "completed"
                                    ? "Completed"
                                    : "Pending"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label='Amount Per Slot'>
                            ₹{selectedWorker.amountPerSlot || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label='Created At'>
                            {selectedWorker.createdAt?.format("DD/MM/YYYY hh:mm A") || "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                </Modal>
            )}
        </div>
    );
}

export default Configuration;