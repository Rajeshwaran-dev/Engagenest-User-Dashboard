import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  DatePicker,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Dropdown,
  Menu,
  Table,
  Tabs,
  message,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Grid,
  Drawer,
  Tag,
  Checkbox,
  Radio,
  Spin,
  Alert,
  Tooltip,
  Badge,
  Avatar,
} from "antd";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../Breadcrumb";
import MasterLayout from "../../../masterLayout/MasterLayout";
import FeedbackConfig from "./FeedbackConfig";
import {
  DownOutlined,
  CheckOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CloseOutlined,
  SearchOutlined,
  EditOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PlusCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const { TextArea } = Input;

const APPOINTMENTS_STORAGE_KEY = 'appointments_data';

// Static data
const STATIC_COUNTRIES = [
  { dial_code: "91", name: "India" },
  { dial_code: "1", name: "United States" },
  { dial_code: "44", name: "United Kingdom" },
  { dial_code: "61", name: "Australia" },
  { dial_code: "65", name: "Singapore" },
];

const STATIC_AGENTS = [
  {
    _id: "1",
    username: "Dr. Smith",
    email: "smith@example.com",
    mobilenumber: "919876543210",
    agentType: { appointment: true },
    config: {
      appointment: {
        department: "Cardiology",
        availableDateRanges: [["2025-01-01", "2025-12-31"]],
        selectedDays: ["mon", "tue", "wed", "thu", "fri"],
        unavailableDates: [],
        calculatedSlots: [
          { slot: "09:00 - 09:30" },
          { slot: "10:00 - 10:30" },
          { slot: "11:00 - 11:30" },
          { slot: "14:00 - 14:30" },
          { slot: "15:00 - 15:30" },
        ],
        occupancyPerSlot: 2,
      },
    },
  },
  {
    _id: "2",
    username: "Dr. Johnson",
    email: "johnson@example.com",
    mobilenumber: "919876543211",
    agentType: { appointment: true },
    config: {
      appointment: {
        department: "Dermatology",
        availableDateRanges: [["2025-01-01", "2025-12-31"]],
        selectedDays: ["mon", "wed", "fri"],
        unavailableDates: ["2024-01-15", "2024-02-14"],
        calculatedSlots: [
          { slot: "09:30 - 10:00" },
          { slot: "10:30 - 11:00" },
          { slot: "11:30 - 12:00" },
          { slot: "14:30 - 15:00" },
        ],
        occupancyPerSlot: 1,
      },
    },
  },
  {
    _id: "3",
    username: "Dr. Williams",
    email: "williams@example.com",
    mobilenumber: "919876543212",
    agentType: { appointment: true },
    config: {
      appointment: {
        department: "Orthopedics",
        availableDateRanges: [["2025-01-01", "2025-12-31"]],
        selectedDays: ["tue", "thu", "sat"],
        unavailableDates: [],
        calculatedSlots: [
          { slot: "10:00 - 10:45" },
          { slot: "11:30 - 12:15" },
          { slot: "15:00 - 15:45" },
          { slot: "16:30 - 17:15" },
        ],
        occupancyPerSlot: 3,
      },
    },
  },
];

const STATIC_APPOINTMENTS = [
  {
    id: "1",
    appointmentNo: "APT001",
    name: "John Doe",
    age: 35,
    dob: "1989-05-15",
    appointmentDate: "2025-12-21",
    timing: "10:00 - 10:15",
    manager: "Dr. Smith",
    managerId: "1",
    department: "Cardiology",
    payment: "prepaid",
    status: "current",
    mobile: "919876543210",
    description: "Regular checkup",
    createdAt: "2024-01-05",
  },
  {
    id: "2",
    appointmentNo: "APT002",
    name: "Jane Smith",
    age: 28,
    dob: "1996-08-22",
    appointmentDate: "2025-12-22",
    timing: "10:15 - 10:30",
    manager: "Dr. Smith",
    managerId: "1",
    department: "Cardiology",
    payment: "postpaid",
    status: "current",
    mobile: "919876543211",
    description: "Follow-up appointment",
    createdAt: "2024-01-06",
  },
  {
    id: "3",
    appointmentNo: "APT003",
    name: "Robert Johnson",
    age: 45,
    dob: "1979-03-10",
    appointmentDate: "2025-12-23",
    timing: "10:30 - 10:45",
    manager: "Dr. Johnson",
    managerId: "2",
    department: "Dermatology",
    payment: "prepaid",
    status: "upcoming",
    mobile: "919876543212",
    description: "Skin consultation",
    createdAt: "2024-01-07",
  },
  {
    id: "4",
    appointmentNo: "APT004",
    name: "Sarah Williams",
    age: 32,
    dob: "1992-11-30",
    appointmentDate: "2025-12-24",
    timing: "10:45 - 11:00",
    manager: "Dr. Williams",
    managerId: "3",
    department: "Orthopedics",
    payment: "postpaid",
    status: "completed",
    mobile: "919876543213",
    description: "Knee pain evaluation",
    createdAt: "2024-01-08",
  },
  {
    id: "5",
    appointmentNo: "APT005",
    name: "Michael Brown",
    age: 50,
    dob: "1974-07-14",
    appointmentDate: "2025-12-25",
    timing: "09:30 - 10:00",
    manager: "Dr. Johnson",
    managerId: "2",
    department: "Dermatology",
    payment: "prepaid",
    status: "rescheduled",
    mobile: "919876543214",
    description: "Rescheduled from Jan 10",
    createdAt: "2024-01-09",
  },
];

const STATIC_BOOKING_CONFIG = {
  bookingFields: [
    {
      fieldName: "Age",
      fieldKey: "age",
      fieldType: "number",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 0,
      isDefault: true,
    },
    {
      fieldName: "Name",
      fieldKey: "name",
      fieldType: "input",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 1,
      isDefault: true,
    },
    {
      fieldName: "Mobile Number",
      fieldKey: "mobile",
      fieldType: "input",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 2,
      isDefault: true,
    },
    {
      fieldName: "Date of Birth",
      fieldKey: "dob",
      fieldType: "date",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 3,
      isDefault: true,
    },
    {
      fieldKey: "department",
      fieldName: "Department",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select Department",
      options: ["Cardiology", "Dermatology", "Orthopedics", "General"],
      displayInForm: true,
      isDefault: true,
      order: 4,
    },
    {
      fieldKey: "manager",
      fieldName: "Select User",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select User",
      options: ["Dr. Smith", "Dr. Johnson", "Dr. Williams"],
      displayInForm: true,
      isDefault: true,
      order: 5,
    },
    {
      fieldKey: "appointmentDate",
      fieldName: "Appointment Date",
      fieldType: "date",
      mandatory: true,
      placeholder: "Select Date",
      displayInForm: true,
      isDefault: true,
      order: 6,
    },
    {
      fieldKey: "timing",
      fieldName: "Appointment Timing",
      fieldType: "time",
      mandatory: true,
      placeholder: "Select Time",
      displayInForm: true,
      isDefault: true,
      order: 7,
    },
    {
      fieldName: "Description",
      fieldKey: "description",
      fieldType: "textarea",
      mandatory: true,
      displayInForm: true,
      displayInTable: true,
      options: [],
      order: 8,
      isDefault: true,
      maxLength: 300,
    },
    {
      fieldKey: "payment",
      fieldName: "Payment Type",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select payment type",
      options: ["prepaid", "postpaid"],
      activate: true,
      displayInForm: true,
      displayInTable: true,
      paymentType: "Both",
      isDefault: true,
      order: 9,
    },
  ],
  statusOptions: ["Pending", "Confirmed", "Cancelled", "Completed"],
  departmentOptions: ["General", "Cardiology", "Dermatology", "Orthopedics"],
  paymentOptions: ["prepaid", "postpaid"],
};

const SPECIAL_EMAILS = ["admin@example.com", "superadmin@example.com"];

const Bookings = () => {
  const [form] = Form.useForm();
  const [rescheduleForm] = Form.useForm();
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const loadAppointmentsFromStorage = () => {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : STATIC_APPOINTMENTS;
      }
      return STATIC_APPOINTMENTS;
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
      return STATIC_APPOINTMENTS;
    }
  };

  // Add this helper function near your other helper functions
  const getTabColor = (tab) => {
    switch (tab) {
      case "current":
        return "var(--primary)";
      case "rescheduled":
        return "#faad14";
      case "completed":
        return "#52c41a";
      case "upcoming":
        return "#722ed1";
      default:
        return "var(--primary)";
    }
  };

  // Static data state
  const [allCountries] = useState(STATIC_COUNTRIES);
  const [isLoadingCountries] = useState(false);
  const [appointments, setAppointments] = useState(STATIC_APPOINTMENTS);
  const [agentsData] = useState({ data: STATIC_AGENTS });
  const [bookingConfig] = useState({ data: STATIC_BOOKING_CONFIG });

  // Loading states (simulated)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [selectedCountryCode, setSelectedCountryCode] = useState(91);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [shouldRenderDashboard, setShouldRenderDashboard] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [formFields, setFormFields] = useState([]);

  // Main tab state - Calendar View or Appointments
  const [mainTab, setMainTab] = useState("calendar");

  // Calendar view states
  const [selectedGoogleCalendarDate, setSelectedGoogleCalendarDate] =
    useState(moment());
  const [googleCalendarView, setGoogleCalendarView] = useState("week");

  // New state for dynamic booking
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState({});

  // Filter states
  const [filterUser, setFilterUser] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDateRange, setFilterDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Calendar states
  const [showCalendarView, setShowCalendarView] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [calendarViewDate, setCalendarViewDate] = useState(moment());
  const [activeTab, setActiveTab] = useState("current");

  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
      message.error('Failed to save appointments locally');
    }
  }, [appointments]);

  const optionsCountry = useMemo(() => {
    let newOptions = allCountries?.map((item, index) => {
      return {
        key: `+${item?.dial_code} ${item?.name}`,
        label: `+${item?.dial_code} ${item?.name}`,
        value: item?.dial_code,
      };
    });

    newOptions.splice(0, 0, {
      key: `+91 India`,
      label: `+91 India`,
      value: "91",
    });

    return newOptions;
  }, [allCountries]);

  // Process agents data
  useEffect(() => {
    if (agentsData?.data) {
      const appointmentAgents = agentsData.data.filter(
        agent =>
          agent.agentType?.appointment === true && agent.config?.appointment
      );

      const uniqueDepartments = [
        ...new Set(
          appointmentAgents
            .map(agent => agent.config.appointment.department)
            .filter(Boolean)
        ),
      ];
      const uniqueUsers = [
        ...new Set(
          appointmentAgents.map(agent => agent.username).filter(Boolean)
        ),
      ];
      setUsers(uniqueUsers);
      setDepartments(uniqueDepartments);
    }
  }, [agentsData]);

  // Check if agent has any available slots across all dates
  const checkAgentAvailability = (user, availableDates) => {
    if (
      !user ||
      !availableDates.length ||
      !user.config?.appointment?.calculatedSlots
    ) {
      return false;
    }

    const { calculatedSlots, occupancyPerSlot } = user.config.appointment;

    // Check if there's at least one date with at least one available slot
    for (const dateStr of availableDates) {
      const date = moment(dateStr);
      const occupiedSlotsForDate = getOccupiedSlotsForDate(user._id, dateStr);

      // Check each slot for availability
      for (const slot of calculatedSlots) {
        const occupancy = occupiedSlotsForDate[slot.slot] || 0;
        const maxOccupancy = occupancyPerSlot || 1;

        // Check if slot is available (not fully booked and not in past)
        if (occupancy < maxOccupancy) {
          const today = moment().startOf("day");
          const selectedDay = date.startOf("day");

          // If it's today, check if the slot time has passed
          if (selectedDay.isSame(today, "day")) {
            const [startTime] = slot.slot.split(" - ");
            const slotStart = moment(startTime, "HH:mm");
            if (slotStart.isAfter(moment())) {
              return true; // Found an available slot
            }
          } else {
            return true; // Found an available slot for future date
          }
        }
      }
    }

    return false; // No available slots found
  };

  // Get occupied slots for a specific date
  const getOccupiedSlotsForDate = (userId, dateStr) => {
    if (!appointments) return {};

    const existingAppointments = appointments.filter(
      apt =>
        apt.managerId === userId &&
        moment(apt.appointmentDate).format("YYYY-MM-DD") === dateStr
    );

    const slotOccupancy = {};
    existingAppointments.forEach(apt => {
      if (apt.timing) {
        slotOccupancy[apt.timing] = (slotOccupancy[apt.timing] || 0) + 1;
      }
    });

    return slotOccupancy;
  };

  // Handle department selection
  const handleDepartmentChange = department => {
    setSelectedDepartment(department);
    setSelectedUser(null);
    setSelectedDate(null);
    setAvailableDates([]);
    setAvailableSlots([]);
    form.setFieldsValue({
      [`field_${getFieldKeyByName("manager")}`]: undefined,
      [`field_${getFieldKeyByName("appointmentDate")}`]: undefined,
      [`field_${getFieldKeyByName("timing")}`]: undefined,
    });

    if (department && agentsData?.data) {
      const usersInDepartment = agentsData.data.filter(
        agent =>
          agent.config?.appointment?.department === department &&
          agent.agentType?.appointment === true &&
          agent.config?.appointment
      );
      setDepartmentUsers(usersInDepartment);
    } else {
      setDepartmentUsers([]);
    }
  };

  // Handle user selection
  const handleUserChange = userId => {
    const user = departmentUsers.find(u => u._id === userId);

    if (user?.config?.appointment) {
      const {
        availableDateRanges,
        selectedDays,
        unavailableDates,
        calculatedSlots,
        occupancyPerSlot,
      } = user.config.appointment;

      // Calculate available dates
      const dates = calculateAvailableDates(
        availableDateRanges,
        selectedDays,
        unavailableDates
      );

      // Check if there are any available slots across all dates
      const hasAvailableSlots = checkAgentAvailability(user, dates);

      // Count existing appointments for this user
      const userAppointmentCount = appointments.filter(
        apt => apt.managerId === userId
      ).length;

      // Count total possible slots across all available dates
      const totalPossibleSlots = dates.length * (calculatedSlots?.length || 0) * (occupancyPerSlot || 1);

      // Count occupied slots for this user
      let occupiedSlotsCount = 0;
      dates.forEach(dateStr => {
        const occupiedSlotsForDate = getOccupiedSlotsForDate(user._id, dateStr);
        occupiedSlotsCount += Object.values(occupiedSlotsForDate).reduce((sum, count) => sum + count, 0);
      });

      if (!hasAvailableSlots) {
        message.warning({
          content: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Selected agent's slots are full!
              </div>
              <div style={{ fontSize: 13 }}>
                <div>Total Appointments: <strong>{userAppointmentCount}</strong></div>
                <div>Slots Occupied: <strong>{occupiedSlotsCount}</strong> / <strong>{totalPossibleSlots}</strong></div>
                <div style={{ marginTop: 4, color: '#ff4d4f' }}>
                  Kindly check with other agents.
                </div>
              </div>
            </div>
          ),
          duration: 5,
          style: { marginTop: '10vh' }
        });

        // Reset user selection
        setSelectedUser(null);
        setSelectedDate(null);
        setAvailableDates([]);
        setAvailableSlots([]);

        form.setFieldsValue({
          [`field_${getFieldKeyByName("manager")}`]: undefined,
          [`field_${getFieldKeyByName("appointmentDate")}`]: undefined,
          [`field_${getFieldKeyByName("timing")}`]: undefined,
        });
        return;
      } else {
        // Show success message with appointment count
        message.success({
          content: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Agent selected successfully!
              </div>
              <div style={{ fontSize: 12 }}>
                Current Appointments: <strong>{userAppointmentCount}</strong> |
                Available Slots: <strong>{totalPossibleSlots - occupiedSlotsCount}</strong> / <strong>{totalPossibleSlots}</strong>
              </div>
            </div>
          ),
          duration: 3,
        });
      }

      setSelectedUser(user);
      setSelectedDate(null);
      setAvailableSlots([]);
      form.setFieldsValue({
        [`field_${getFieldKeyByName("appointmentDate")}`]: undefined,
        [`field_${getFieldKeyByName("timing")}`]: undefined,
      });

      setAvailableDates(dates);
    } else {
      setSelectedUser(null);
      setSelectedDate(null);
      setAvailableDates([]);
      setAvailableSlots([]);
    }
  };

  const clearAllAppointments = () => {
    Modal.confirm({
      title: 'Clear All Appointments',
      content: 'Are you sure you want to clear all appointments? This action cannot be undone.',
      okText: 'Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setAppointments([]);
        localStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
        message.success('All appointments cleared successfully!');
      },
    });
  };

  const resetToDefaultAppointments = () => {
    Modal.confirm({
      title: 'Reset to Default Appointments',
      content: 'This will restore the default sample appointments. Continue?',
      okText: 'Reset',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: () => {
        setAppointments(STATIC_APPOINTMENTS);
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(STATIC_APPOINTMENTS));
        message.success('Appointments reset to default!');
      },
    });
  };

  // Calculate available dates
  const calculateAvailableDates = (
    dateRanges,
    selectedDays,
    unavailableDates
  ) => {
    const availableDates = [];
    const today = moment();

    if (!dateRanges || !selectedDays) return availableDates;

    const dayMap = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    dateRanges.forEach(([startDate, endDate]) => {
      const start = moment(startDate);
      const end = moment(endDate);
      const current = start.clone();

      while (current.isSameOrBefore(end)) {
        if (current.isSameOrAfter(today, "day")) {
          const dayName = Object.keys(dayMap).find(
            key => dayMap[key] === current.day()
          );
          if (selectedDays.includes(dayName)) {
            const dateStr = current.format("YYYY-MM-DD");
            if (!unavailableDates || !unavailableDates.includes(dateStr)) {
              availableDates.push(dateStr);
            }
          }
        }
        current.add(1, "day");
      }
    });

    return availableDates;
  };

  // Handle date selection
  const handleDateChange = async date => {
    setSelectedDate(date);
    form.setFieldsValue({
      [`field_${getFieldKeyByName("timing")}`]: undefined,
    });

    if (date && selectedUser?.config?.appointment) {
      const { calculatedSlots, occupancyPerSlot } =
        selectedUser.config.appointment;
      setAvailableSlots(calculatedSlots || []);

      await fetchOccupiedSlots(selectedUser._id, date.format("YYYY-MM-DD"));
    } else {
      setAvailableSlots([]);
    }
  };

  // Fetch occupied slots
  const fetchOccupiedSlots = async (userId, date) => {
    try {
      if (appointments) {
        const existingAppointments = appointments.filter(
          apt =>
            apt.managerId === userId &&
            moment(apt.appointmentDate).format("YYYY-MM-DD") === date
        );

        const slotOccupancy = {};
        existingAppointments.forEach(apt => {
          if (apt.timing) {
            slotOccupancy[apt.timing] = (slotOccupancy[apt.timing] || 0) + 1;
          }
        });

        setOccupiedSlots(slotOccupancy);
      }
    } catch (error) {
      console.error("Error fetching occupied slots:", error);
    }
  };

  // Helper function
  const getFieldKeyByName = fieldKey => {
    const field = formFields.find(f => f.fieldKey === fieldKey);
    return field ? field.fieldKey : null;
  };

  // Check if slot available
  const isSlotAvailable = slot => {
    if (!selectedUser?.config?.appointment?.occupancyPerSlot) return true;

    const occupancy = occupiedSlots[slot.slot] || 0;
    const maxOccupancy = selectedUser.config.appointment.occupancyPerSlot;

    return occupancy < maxOccupancy;
  };

  // Disabled date function
  const disabledDate = current => {
    if (!current) return true;
    if (current.isBefore(moment(), "day")) return true;
    if (!availableDates.length) return true;

    const dateStr = current.format("YYYY-MM-DD");
    return !availableDates.includes(dateStr);
  };

  // Load form fields
  useEffect(() => {
    if (bookingConfig?.data?.bookingFields) {
      const visibleFields = bookingConfig.data.bookingFields.filter(
        field => field.displayInForm !== false
      );
      setFormFields(visibleFields);
    }
  }, [bookingConfig]);

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
      setShowCrmModal(false);
    } else {
      setShouldRenderDashboard(false);
      setShowCrmModal(true);
    }
  }, []);

  useEffect(() => {
    if (showCalendarView) {
      // Keep selected date
    }
  }, [activeTab]);

  const showModal = () => {
    setIsModalVisible(true);
    setSelectedDepartment(null);
    setSelectedUser(null);
    setSelectedDate(null);
    setAvailableDates([]);
    setAvailableSlots([]);
    setOccupiedSlots({});
    setSelectedCountryCode(91);

    // Simulate refetching config
    setIsLoadingConfig(true);
    setTimeout(() => {
      setIsLoadingConfig(false);
    }, 300);

    setTimeout(() => {
      form.setFieldsValue({
        field_mobile_countryCode: "91",
      });
    }, 0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedDepartment(null);
    setSelectedUser(null);
    setSelectedDate(null);
    setAvailableDates([]);
    setAvailableSlots([]);
    setOccupiedSlots({});
    setSelectedCountryCode(91);
  };

  const allDatesDisabled =
    typeof disabledDate === "function" &&
    [...Array(365)].every((_, i) => {
      const date = dayjs().add(i, "day");
      return disabledDate(date);
    });

  const getFieldNameMapping = fieldName => {
    const mapping = {
      Name: "name",
      Age: "age",
      "Mobile Number": "mobile",
      "Date of Birth": "dob",
      "Select User": "manager",
      Department: "department",
      "Appointment Date": "appointmentDate",
      "Appointment Timing": "timing",
      Description: "description",
      "Payment Type": "payment",
    };
    return mapping[fieldName] || fieldName.toLowerCase().replace(/\s+/g, "_");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const selectedSlot = values[`field_${getFieldKeyByName("timing")}`];
      if (selectedSlot && !isSlotAvailable({ slot: selectedSlot })) {
        message.error(
          "Selected time slot is no longer available. Please choose another slot."
        );
        return;
      }

      const appointmentData = {};

      formFields.forEach(field => {
        if (field.displayInForm === false) {
          return;
        }

        const fieldValue = values[`field_${field.fieldKey}`];
        const mappedFieldName = field.fieldKey;

        if (field.fieldKey === "mobile") {
          const countryCode = values[`field_mobile_countryCode`];
          const mobileNumber = fieldValue;

          if (countryCode && mobileNumber) {
            appointmentData[mappedFieldName] = `${countryCode}${mobileNumber}`;
          }
          return;
        }

        if (fieldValue !== undefined && fieldValue !== null) {
          if (field.fieldType === "date" && fieldValue) {
            appointmentData[mappedFieldName] = fieldValue.format("YYYY-MM-DD");
          } else if (
            field.fieldType === "checkbox" ||
            field.fieldType === "MultipleChoice"
          ) {
            const valueToStore = Array.isArray(fieldValue)
              ? fieldValue
              : [fieldValue];
            appointmentData[mappedFieldName] = valueToStore;
          } else {
            appointmentData[mappedFieldName] = fieldValue;
          }
        }
      });

      if (selectedUser) {
        appointmentData.manager = selectedUser.username;
        appointmentData.managerId = selectedUser._id;
      }

      if (selectedUser && agentsData?.data) {
        const agentInfo = agentsData.data.find(
          agent => agent._id === selectedUser._id
        );
        if (agentInfo && agentInfo.mobilenumber) {
          appointmentData.agentNumber = agentInfo.mobilenumber;
        }
      }

      if (!appointmentData.status) {
        appointmentData.status = "current";
      }
      if (!appointmentData.payment) {
        appointmentData.payment = "prepaid";
      }

      // Simulate API call
      setIsCreating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate new appointment ID
      const newId = `APT${String(appointments.length + 1).padStart(3, '0')}`;
      const newAppointment = {
        id: String(appointments.length + 1),
        appointmentNo: newId,
        ...appointmentData,
        createdAt: moment().format("YYYY-MM-DD"),
      };

      // Add to local state (which will trigger localStorage update via useEffect)
      setAppointments(prev => [...prev, newAppointment]);

      setIsModalVisible(false);
      form.resetFields();
      setSelectedDepartment(null);
      setSelectedUser(null);
      setSelectedDate(null);
      setAvailableDates([]);
      setAvailableSlots([]);
      setOccupiedSlots({});
      setSelectedCountryCode(91);

      message.success(`Appointment created successfully! Total appointments: ${appointments.length + 1}`);
    } catch (error) {
      setIsCreating(false);
      if (error.errorFields) {
        message.error("Please enter all fields");
      } else {
        console.error("Error creating appointment:", error);
        message.error(error.message || "Failed to create appointment");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Dynamic field renderer
  const renderFormField = field => {
    if (field.displayInForm === false) {
      return null;
    }

    const fieldName = `field_${field.fieldKey}`;
    const rules = [];

    if (field.mandatory) {
      rules.push({
        required: true,
        message: `Please input the ${field.fieldName.toLowerCase()}!`,
      });
    }
    if (field.fieldKey === "mobile") {
      rules.push({
        pattern: /^\d{12,13}$/,
        message:
          "Please enter a valid mobile number with country code and 10 digits (e.g. 919876543210)",
      });
    }

    if (field.fieldKey === "mobile") {
      const expectedLength = selectedCountryCode ? 10 : 10; // Simplified for static data

      return (
        <Form.Item
          key={field.fieldKey}
          label={field.fieldName}
          required={field.mandatory}
        >
          <Input.Group compact style={{ display: "flex" }}>
            <Form.Item
              name={`${fieldName}_countryCode`}
              noStyle
              rules={[
                {
                  required: field.mandatory,
                  message: "Please select country code",
                },
              ]}
              initialValue='91'
            >
              <Select
                showSearch
                placeholder='Code'
                style={{ width: "140px" }}
                loading={isLoadingCountries}
                options={optionsCountry}
                onChange={value => {
                  setSelectedCountryCode(value);
                  form.setFieldsValue({
                    [fieldName]: undefined,
                  });
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name={fieldName}
              noStyle
              rules={[
                {
                  required: field.mandatory,
                  message: `Please enter mobile number`,
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const valueStr = String(value);

                    if (!/^\d+$/.test(valueStr)) {
                      return Promise.reject(
                        new Error("Mobile number must contain only digits")
                      );
                    }

                    if (valueStr.length !== expectedLength) {
                      return Promise.reject(
                        new Error(
                          `Mobile number must be exactly ${expectedLength} digits`
                        )
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={`Enter ${expectedLength} digit number`}
                style={{
                  width: "calc(100% - 140px)",
                  borderRadius: "0 8px 8px 0",
                }}
                maxLength={expectedLength}
                onKeyPress={e => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={e => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  form.setFieldsValue({
                    [fieldName]: value,
                  });
                }}
                onPaste={e => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text");
                  const numericOnly = pastedData.replace(/[^\d]/g, "");
                  const trimmedValue = numericOnly.slice(0, expectedLength);

                  if (pastedData !== numericOnly) {
                    message.warning(
                      "Non-numeric characters removed from mobile number"
                    );
                  }

                  if (numericOnly.length > expectedLength) {
                    message.warning(
                      `Mobile number trimmed to ${expectedLength} digits`
                    );
                  }

                  form.setFieldsValue({
                    [fieldName]: trimmedValue,
                  });
                }}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      );
    }

    if (field.fieldKey === "department") {
      return (
        <Form.Item
          key={field.fieldKey}
          label={field.fieldName}
          name={fieldName}
          rules={rules}
        >
          <Select
            showSearch
            placeholder='Select Department'
            onChange={handleDepartmentChange}
            loading={isLoadingAgents}
            disabled={false}
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    if (field.fieldKey === "manager") {
      return (
        <Form.Item
          key={field.fieldKey}
          label={field.fieldName}
          name={fieldName}
          rules={rules}
        >
          <Select
            placeholder='Select User'
            onChange={handleUserChange}
            disabled={!selectedDepartment}
            value={selectedUser?._id}
            showSearch
            optionFilterProp='label'
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {departmentUsers.map(user => (
              <Option
                key={user._id}
                value={user._id}
                label={`${user.username} (${user.email})`}
              >
                {user.username} ({user.email})
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    if (field.fieldKey === "appointmentDate") {
      return (
        <Form.Item
          key={field.fieldKey}
          label={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{field.fieldName}</span>

              {selectedUser && allDatesDisabled && (
                <span
                  style={{
                    color: "#ff4d4f",
                    fontSize: 13,
                    fontWeight: 500,
                    marginLeft: "10px",
                  }}
                >
                  No available Solts!
                </span>
              )}
            </div>
          }
          name={fieldName}
          rules={rules}
        >
          <DatePicker
            style={{ width: "100%" }}
            format='DD/MM/YYYY'
            placeholder='Select Date'
            disabledDate={disabledDate}
            disabled={!selectedUser}
            onChange={handleDateChange}
          />
        </Form.Item>
      );
    }

    if (field.fieldKey === "timing") {
      return (
        <Form.Item
          key={field.fieldKey}
          label={field.fieldName}
          name={fieldName}
          rules={rules}
        >
          <Select placeholder='Select Time Slot' disabled={!selectedDate}>
            {availableSlots.map(slot => {
              const occupancy = occupiedSlots[slot.slot] || 0;
              const maxOccupancy =
                selectedUser?.config?.appointment?.occupancyPerSlot || 1;
              const available = occupancy < maxOccupancy;

              const today = moment().startOf("day");
              const selectedDay = selectedDate
                ? selectedDate.startOf("day")
                : null;

              let isPastSlot = false;
              if (selectedDay && selectedDay.isSame(today, "day")) {
                const [startTime] = slot.slot.split(" - ");
                const slotStart = moment(startTime, "HH:mm");
                isPastSlot = slotStart.isBefore(moment());
              }

              const isDisabled = !available || isPastSlot;

              let displayColor = "#52c41a";
              let displayText = `${occupancy}/${maxOccupancy}`;

              if (!available) {
                displayColor = "#ff4d4f";
                displayText = `${occupancy}/${maxOccupancy} (Full)`;
              } else if (isPastSlot) {
                displayColor = "#bfbfbf";
                displayText = "Past";
              }

              return (
                <Option key={slot.slot} value={slot.slot} disabled={isDisabled}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      opacity: isDisabled ? 0.6 : 1,
                    }}
                  >
                    <span>{slot.slot}</span>
                    <span style={{ color: displayColor, fontSize: "12px" }}>
                      {displayText}
                    </span>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      );
    }

    switch (field.fieldType) {
      case "input":
      case "text":
      case "email":
      case "password":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={[
              ...rules,
              field.fieldKey === "name"
                ? {
                  pattern: /^[A-Za-z\s]+$/,
                  message:
                    "Only alphabets and spaces are allowed in the Name field",
                }
                : {},
            ]}
          >
            <Input
              placeholder={
                field.fieldName === "Mobile Number"
                  ? "Enter mobile number with country code (e.g. +91XXXXXXXXXX)"
                  : field.placeholder ||
                  `Enter ${field.fieldName.toLowerCase()}`
              }
              style={{ borderRadius: "8px" }}
              type='text'
              maxLength={field.maxLength}
              value={form.getFieldValue(fieldName)}
              onChange={e => {
                if (field.fieldKey === "name") {
                  const clean = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  if (clean !== e.target.value) {
                    message.destroy();
                    message.warning("Only alphabets and spaces are allowed");
                  }
                  form.setFieldsValue({ [fieldName]: clean });
                } else {
                  form.setFieldsValue({ [fieldName]: e.target.value });
                }
              }}
            />
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <TextArea
              placeholder={
                field.placeholder || `Enter ${field.fieldName.toLowerCase()}`
              }
              rows={field.rows || 3}
              style={{ borderRadius: "8px" }}
              maxLength={field.maxLength}
              showCount={field.maxLength ? true : false}
            />
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <InputNumber
              min={field.min}
              max={field.max}
              placeholder={
                field.placeholder || `Enter ${field.fieldName.toLowerCase()}`
              }
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Form.Item>
        );

      case "date":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <DatePicker
              style={{ width: "100%", borderRadius: "8px" }}
              format='DD/MM/YYYY'
              placeholder={
                field.placeholder || `Select ${field.fieldName.toLowerCase()}`
              }
            />
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <Select
              placeholder={field.placeholder || `Select ${field.fieldName}`}
              style={{ borderRadius: "8px" }}
            >
              {field.options?.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case "checkbox":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <Checkbox.Group>
              <Row>
                {field.options?.map(option => (
                  <Col span={24} key={option}>
                    <Checkbox value={option} style={{ marginBottom: 8 }}>
                      {option}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        );

      case "radio":
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <Radio.Group>
              <Row>
                {field.options?.map(option => (
                  <Col span={24} key={option}>
                    <Radio value={option} style={{ marginBottom: 8 }}>
                      {option}
                    </Radio>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={field.fieldKey}
            label={field.fieldName}
            name={fieldName}
            rules={rules}
          >
            <Input
              placeholder={
                field.fieldName === "Mobile Number"
                  ? "Enter with country code (e.g.91XXXXXXXXXX)"
                  : field.placeholder ||
                  `Enter ${field.fieldName.toLowerCase()}`
              }
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>
        );
    }
  };

  const handleComplete = async (record, description = "") => {
    try {
      // Simulate API call
      setIsCompleting(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === record.id
            ? { ...apt, status: "completed", description: description || apt.description }
            : apt
        )
      );

      message.success("Appointment marked as completed!");
    } catch (error) {
      console.error("Error completing appointment:", error);
      message.error(error.message || "Failed to complete appointment");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReschedule = record => {
    setSelectedAppointment(record);
    rescheduleForm.setFieldsValue({
      appointmentDate: record.appointmentDate
        ? moment(record.appointmentDate)
        : null,
      timing: record.timing,
    });
    setIsRescheduleModalVisible(true);
  };

  const handleRescheduleSubmit = async values => {
    try {
      if (selectedAppointment?.status === "completed") {
        message.error("Cannot reschedule a completed appointment");
        return;
      }

      const selectedSlot = values.timing;
      const occupancy = occupiedSlots[selectedSlot] || 0;
      const maxOccupancy =
        selectedUser?.config?.appointment?.occupancyPerSlot || 1;

      if (occupancy >= maxOccupancy) {
        message.error(
          `Selected time slot is fully booked. Please choose another slot. (${occupancy}/${maxOccupancy})`
        );
        return;
      }

      // Simulate API call
      setIsRescheduling(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      const updatedAppointment = {
        ...selectedAppointment,
        appointmentDate: values.appointmentDate.format("YYYY-MM-DD"),
        timing: values.timing,
        status: "rescheduled",
      };

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id ? updatedAppointment : apt
        )
      );

      message.success("Appointment rescheduled successfully!");
      setSelectedAppointment(updatedAppointment);
      setIsRescheduleModalVisible(false);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      message.error(error.message || "Failed to reschedule appointment");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleRowClick = (record, event) => {
    if (
      event.target.closest(".ant-dropdown-trigger") ||
      event.target.closest(".ant-table-cell:last-child") ||
      event.target.closest(".delete-menu-item")
    ) {
      return;
    }

    navigate("/booking-configuration", {
      state: {
        appointment: record,
      },
    });
  };

  const handleDelete = async record => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this appointment?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Simulate API call
          setIsDeleting(true);
          await new Promise(resolve => setTimeout(resolve, 500));

          // Update local state
          setAppointments(prev => prev.filter(apt => apt.id !== record.id));

          message.success("Appointment deleted successfully!");
        } catch (error) {
          console.error("Error deleting appointment:", error);
          message.error(error.message || "Failed to delete appointment");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const clearAllFilters = () => {
    setFilterUser("");
    setFilterDepartment("");
    setFilterStatus("");
    setFilterPayment("");
    setFilterDateRange([]);
    setSearchText("");
  };

  const formatDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const handleCalendarDateClick = date => {
    const dateStr = date.format("YYYY-MM-DD");
    setSelectedCalendarDate(dateStr);
  };

  const clearCalendarFilter = () => {
    setSelectedCalendarDate(null);
  };

  const getFilteredAppointments = status => {
    let filtered = appointments;
    const today = moment().startOf("day");

    let calendarFilteredAppointments = filtered;

    if (showCalendarView && selectedCalendarDate) {
      const selectedDate = moment(selectedCalendarDate).startOf("day");

      calendarFilteredAppointments = filtered.filter(apt => {
        const aptDate = apt.appointmentDate
          ? moment(apt.appointmentDate).startOf("day")
          : null;
        const aptCreatedDate = apt.createdAt
          ? moment(apt.createdAt).startOf("day")
          : null;

        const isScheduledForDate =
          aptDate && aptDate.isSame(selectedDate, "day");

        const isCreatedOnDate =
          aptCreatedDate && aptCreatedDate.isSame(selectedDate, "day");

        if (apt.status === "rescheduled") {
          return isScheduledForDate || isCreatedOnDate;
        }

        return isScheduledForDate;
      });

      filtered = calendarFilteredAppointments;
    }

    if (status === "upcoming") {
      if (showCalendarView && selectedCalendarDate) {
        filtered = [];
      } else {
        filtered = filtered.filter(apt => {
          if (apt.status === "completed") return false;
          if (!apt.appointmentDate) return false;
          const aptDate = moment(apt.appointmentDate).startOf("day");
          return aptDate.isAfter(today);
        });
      }
    } else if (status === "current") {
      filtered = filtered.filter(apt => {
        if (apt.status === "completed") return false;

        if (showCalendarView && selectedCalendarDate) {
          const selectedDate = moment(selectedCalendarDate).startOf("day");
          const aptDate = apt.appointmentDate
            ? moment(apt.appointmentDate).startOf("day")
            : null;

          if (apt.status === "rescheduled") {
            return aptDate && aptDate.isSame(selectedDate, "day");
          }

          if (apt.status === "rescheduled") return false;

          return aptDate && aptDate.isSame(selectedDate, "day");
        } else {
          if (!apt.appointmentDate) return false;

          const aptDate = moment(apt.appointmentDate).startOf("day");

          // SHOW rescheduled appointments if their new date is today
          if (apt.status === "rescheduled") {
            return aptDate.isSame(today, "day");
          }

          // Existing logic for normal current appointments
          return aptDate.isSame(today, "day");
        }
      });
    } else if (status === "rescheduled") {
      filtered = filtered.filter(apt => {
        if (apt.status !== "rescheduled") return false;

        if (showCalendarView && selectedCalendarDate) {
          const selectedDate = moment(selectedCalendarDate).startOf("day");
          const aptDate = apt.appointmentDate
            ? moment(apt.appointmentDate).startOf("day")
            : null;
          const createdDate = apt.createdAt
            ? moment(apt.createdAt).startOf("day")
            : null;

          const isScheduledForDate =
            aptDate && aptDate.isSame(selectedDate, "day");
          const isCreatedOnDate =
            createdDate && createdDate.isSame(selectedDate, "day");

          if (isScheduledForDate && isCreatedOnDate) {
            return true;
          }

          if (isScheduledForDate && !isCreatedOnDate) {
            return false;
          }

          if (isCreatedOnDate && !isScheduledForDate) {
            return true;
          }

          return false;
        }

        return true;
      });
    } else if (status === "completed") {
      filtered = filtered.filter(apt => apt.status === "completed");
    } else if (status !== "feedbacks") {
      filtered = filtered.filter(apt => apt.status === status);
    }

    if (filterUser) {
      filtered = filtered.filter(apt => apt.manager === filterUser);
    }

    if (filterDepartment) {
      filtered = filtered.filter(apt => apt.department === filterDepartment);
    }

    if (filterPayment) {
      filtered = filtered.filter(apt => apt.payment === filterPayment);
    }

    if (
      filterDateRange &&
      filterDateRange.length === 2 &&
      filterDateRange[0] &&
      filterDateRange[1]
    ) {
      const [start, end] = filterDateRange;
      const startDate = dayjs(start).startOf("day");
      const endDate = dayjs(end).endOf("day");

      filtered = filtered.filter(apt => {
        if (!apt.appointmentDate) return false;
        const aptDate = dayjs(apt.appointmentDate);
        return (
          (aptDate.isAfter(startDate) && aptDate.isBefore(endDate)) ||
          aptDate.isSame(startDate, "day") ||
          aptDate.isSame(endDate, "day")
        );
      });
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();

      filtered = filtered.filter(apt =>
        Object.values(apt).some(value => {
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    return filtered;
  };

  const handleCrmModalClose = () => {
    setShowCrmModal(false);
  };

  const columns = [
    {
      title: "S.No.",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "ID",
      dataIndex: "appointmentNo",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: text => (
        <Space>
          <UserOutlined size={16} />
          {text}
        </Space>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
      render: text => formatDate(text),
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: text => (
        <Space>
          <CalendarOutlined size={16} />
          {formatDate(text)}
        </Space>
      ),
    },
    {
      title: "Appointment Timing",
      dataIndex: "timing",
      key: "timing",
      render: text => (
        <Space>
          <ClockCircleOutlined size={16} />
          {text}
        </Space>
      ),
    },
    {
      title: "User",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: text => (
        <span style={{ textTransform: "capitalize" }}>{text}</span>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      render: text => (
        <span
          style={{
            color: text === "prepaid" ? "#52c41a" : "var(--primary)",
            textTransform: "capitalize",
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "payment",
      render: text => (
        <Tag
          style={{
            color: text === "prepaid" ? "#52c41a" : "var(--primary)",
            textTransform: "capitalize",
            fontWeight: 800,
            borderRadius: "50px",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.status === "completed") {
          return (
            <span style={{ color: "#52c41a", fontWeight: "bold" }}>
              Completed
            </span>
          );
        }

        const menu = (
          <Menu
            onClick={({ key }) => {
              if (key === "complete") handleComplete(record);
              if (key === "reschedule") handleReschedule(record);
            }}
            items={[
              {
                key: "reschedule",
                icon: <ReloadOutlined />,
                label: "View Appointment",
                onClick: () => handleReschedule(record),
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
                className: "delete-menu-item",
                onClick: () => handleDelete(record),
              },
            ]}
          />
        );

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "reschedule",
                  icon: <ReloadOutlined />,
                  label: "View Appointment",
                  onClick: () => handleReschedule(record),
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="large" style={{ borderRadius: "8px" }}>
              <EditOutlined />
            </Button>
          </Dropdown>

        );
      },
    },
  ];

  const tabItems = [
    "current",
    "rescheduled",
    ...(showCalendarView ? [] : ["upcoming"]),
    "completed",
    "feedbacks",
  ].map(key => ({
    key,
    label: (
      <span style={{ fontSize: 16, fontWeight: 600 }}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </span>
    ),
    children:
      key === "feedbacks" ? (
        <FeedbackConfig />
      ) : (
        <Table
          className="leads-performance-table"
          columns={columns}
          dataSource={getFilteredAppointments(key)}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
          onRow={record => ({
            onClick: event => handleRowClick(record, event),
            style: { cursor: "pointer" },
          })}
          loading={isLoadingAppointments}
        />
      ),
  }));


  // Calendar View Component
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForHour = (date, hour) => {
    const dateStr = date.format("YYYY-MM-DD");
    return appointments.filter(apt => {
      if (!apt.appointmentDate || !apt.timing) return false;
      const aptDate = moment(apt.appointmentDate).format("YYYY-MM-DD");
      if (aptDate !== dateStr) return false;

      const timingMatch = apt.timing.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
      if (!timingMatch) return false;

      let aptHour = parseInt(timingMatch[1]);
      const ampm = timingMatch[3];

      if (ampm) {
        if (ampm.toUpperCase() === "PM" && aptHour !== 12) aptHour += 12;
        if (ampm.toUpperCase() === "AM" && aptHour === 12) aptHour = 0;
      }

      return aptHour === hour;
    });
  };

  const getWeekDays = date => {
    const startOfWeek = date.clone().startOf("week");
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.clone().add(i, "days")
    );
  };

  const getAppointmentCountForDate = date => {
    const dateStr = date.format("YYYY-MM-DD");
    return appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      return moment(apt.appointmentDate).format("YYYY-MM-DD") === dateStr;
    }).length;
  };

  const getDateHeader = () => {
    if (googleCalendarView === "day") {
      return selectedGoogleCalendarDate.format("MMMM D, YYYY");
    } else if (googleCalendarView === "week") {
      const start = selectedGoogleCalendarDate.clone().startOf("week");
      const end = selectedGoogleCalendarDate.clone().endOf("week");
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    }
    return "";
  };

  const getAppointmentColor = apt => {
    if (apt.status === "completed") return "#10b981";
    if (apt.status === "rescheduled") return "#f59e0b";
    if (apt.payment === "postpaid") return "#3b82f6";
    return "#8b5cf6";
  };

  // Helper function to detect overlapping appointments and calculate their positions
  const calculateAppointmentLayout = appointments => {
    const sorted = [...appointments].sort((a, b) => {
      const aTime = moment(a.timing.split(" - ")[0].trim(), [
        "HH:mm",
        "h:mm A",
      ]);
      const bTime = moment(b.timing.split(" - ")[0].trim(), [
        "HH:mm",
        "h:mm A",
      ]);
      return aTime.diff(bTime);
    });

    const columns = [];

    sorted.forEach(apt => {
      // Parse start and end times
      const timeParts = apt.timing.split(" - ");
      let startTime = moment(timeParts[0].trim(), ["HH:mm", "h:mm A"], true);
      let endTime = timeParts[1]
        ? moment(timeParts[1].trim(), ["HH:mm", "h:mm A"], true)
        : moment(startTime).add(1, "hour");

      if (!startTime.isValid()) startTime = moment("09:00", "HH:mm");
      if (!endTime.isValid()) endTime = moment(startTime).add(1, "hour");

      const startHour = startTime.hours() + startTime.minutes() / 60;
      const endHour = endTime.hours() + endTime.minutes() / 60;

      // Find a column where this appointment doesn't overlap
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const hasOverlap = column.some(existingApt => {
          const existingStart = existingApt.startHour;
          const existingEnd = existingApt.endHour;
          return !(endHour <= existingStart || startHour >= existingEnd);
        });

        if (!hasOverlap) {
          column.push({ ...apt, startHour, endHour, column: i });
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([{ ...apt, startHour, endHour, column: columns.length }]);
      }
    });

    const totalColumns = columns.length;
    const layoutData = [];

    columns.forEach((column, colIndex) => {
      column.forEach(apt => {
        layoutData.push({
          ...apt,
          column: colIndex,
          totalColumns: totalColumns,
        });
      });
    });

    return layoutData;
  };

  const handleAppointmentClick = record => {
    navigate("/booking-configuration", {
      state: {
        appointment: record,
      },
    });
  };

  const getAllAppointmentsForDate = date => {
    const dateStr = date.format("YYYY-MM-DD");
    return appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDate = moment(apt.appointmentDate).format("YYYY-MM-DD");
      return aptDate === dateStr;
    });
  };

  // Get days in current month for calendar
  const getDaysInMonth = date => {
    const startOfMonth = date.clone().startOf("month");
    const endOfMonth = date.clone().endOf("month");
    const startDay = startOfMonth.day(); // 0 = Sunday
    const daysInMonth = endOfMonth.date();

    const days = [];

    // Add previous month's days
    for (let i = 0; i < startDay; i++) {
      days.push({
        date: startOfMonth.clone().subtract(startDay - i, "days"),
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: startOfMonth.clone().date(i),
        isCurrentMonth: true,
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows x 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: endOfMonth.clone().add(i, "days"),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleMonthChange = direction => {
    setSelectedGoogleCalendarDate(prev => prev.clone().add(direction, "month"));
  };

  const CalendarViewContent = () => {
    const weekDays = getWeekDays(selectedGoogleCalendarDate);
    const monthDays = getDaysInMonth(selectedGoogleCalendarDate);
    const selectedDateForView = selectedGoogleCalendarDate;
    const selectedDates = selectedDateForView.format("YYYY-MM-DD");

    const totalForDate = appointments.filter(
      a => moment(a.appointmentDate).format("YYYY-MM-DD") === selectedDates
    ).length;

    const closedForDate = appointments.filter(
      a =>
        a.status === "completed" &&
        moment(a.appointmentDate).format("YYYY-MM-DD") === selectedDates
    ).length;

    const currentForDate = appointments.filter(
      a =>
        a.status !== "completed" &&
        moment(a.appointmentDate).format("YYYY-MM-DD") === selectedDates
    ).length;

    return (
      <div style={{ minHeight: "calc(100vh - 200px)", padding: "24px" }}>
        <Row gutter={[24, 16]}>
          {/* Right Side - Monthly Calendar */}
          <Col span={9}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #e8e8e8",
                position: "sticky",
                backgroundColor: "#ffffff",
                top: 24,
                marginLeft: "-20px",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Month Navigation Header */}
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Row justify='space-between' align='middle'>
                  <Button
                    type='text'
                    icon={<LeftOutlined style={{ fontSize: 14, color: "#595959" }} />}
                    onClick={() => handleMonthChange(-1)}
                    style={{
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.04)",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    }}
                  />
                  <Title level={4} style={{ margin: 0, color: "#262626", fontWeight: 600 }}>
                    {selectedGoogleCalendarDate.format("MMMM YYYY")}
                  </Title>
                  <Button
                    type='text'
                    icon={<RightOutlined style={{ fontSize: 14, color: "#595959" }} />}
                    onClick={() => handleMonthChange(1)}
                    style={{
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.04)",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    }}
                  />
                </Row>
              </div>

              {/* Calendar Content */}
              <div style={{ padding: "24px" }}>
                {/* Day Headers */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: "2px solid #f0f0f0",
                  }}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        color: idx === 0 ? "#ff4d4f" : "#595959",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 6,
                  }}
                >
                  {monthDays.map((dayObj, idx) => {
                    const isToday = dayObj.date.isSame(moment(), "day");
                    const isSelected = dayObj.date.isSame(selectedDateForView, "day");
                    const appointmentCount = getAppointmentCountForDate(dayObj.date);
                    const isWeekend = dayObj.date.day() === 0; // Only Sunday

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (dayObj.isCurrentMonth) {
                            setSelectedGoogleCalendarDate(dayObj.date);
                          }
                        }}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: dayObj.isCurrentMonth ? "pointer" : "default",
                          background: isSelected
                            ? "rgba(30, 164, 67, 0.15)"
                            : isToday
                              ? "rgba(24, 144, 255, 0.08)"
                              : "transparent",
                          borderRadius: 12,
                          transition: "all 0.2s ease",
                          border: isSelected
                            ? "2px solid var(--primary)"
                            : isToday
                              ? "2px solid var(--primary)"
                              : "1px solid transparent",
                          position: "relative",
                          opacity: dayObj.isCurrentMonth ? 1 : 0.3,
                          backdropFilter: isSelected || isToday ? "blur(10px)" : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                            e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && !isToday) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                          }
                          if (isToday && !isSelected) {
                            e.currentTarget.style.background = "rgba(24, 144, 255, 0.08)";
                            e.currentTarget.style.borderColor = "var(--primary)";
                          }
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {/* Date Number */}
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected || isToday ? 600 : 400,
                            color: isSelected
                              ? "var(--primary)"
                              : dayObj.isCurrentMonth
                                ? isToday
                                  ? "var(--primary)"
                                  : isWeekend
                                    ? "#ff4d4f"
                                    : "#262626"
                                : "#bfbfbf",
                            marginBottom: 4,
                          }}
                        >
                          {dayObj.date.format("D")}
                        </div>

                        {/* Appointment Indicator */}
                        {appointmentCount > 0 && dayObj.isCurrentMonth && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 4,
                              display: "flex",
                              gap: 3,
                            }}
                          >
                            {Array.from({
                              length: Math.min(appointmentCount, 3),
                            }).map((_, dotIndex) => (
                              <div
                                key={dotIndex}
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: isSelected ? "var(--primary)" : "var(--primary)",
                                  boxShadow: "0 0 0 1px rgba(24,144,255,0.2)",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 24,
                    borderTop: "2px solid #f0f0f0",
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 16,
                      color: "#000000ff",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Calendar Legend
                  </Text>
                  <Space direction='vertical' size={12} style={{ width: "100%" }}>
                    {[
                      {
                        color: "rgba(30, 164, 67, 0.15)",
                        borderColor: "var(--primary)",
                        label: "Selected date",
                        isCircle: true,
                        hasBorder: true,
                      },
                      {
                        color: "rgba(24, 144, 255, 0.08)",
                        borderColor: "var(--primary)",
                        label: "Today",
                        isCircle: true,
                        hasBorder: true,
                      },
                      {
                        color: "var(--primary)",
                        label: "Has appointments",
                        isDot: true,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.02)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: item.isCircle ? "50%" : 4,
                            background: item.isDot ? "transparent" : item.color,
                            border: item.hasBorder
                              ? `2px solid ${item.borderColor}`
                              : item.isDot
                                ? "none"
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.isDot && (
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: item.color,
                              }}
                            />
                          )}
                        </div>
                        <Text style={{ fontSize: 13, color: "#595959", fontWeight: 500 }}>
                          {item.label}
                        </Text>
                      </div>
                    ))}
                  </Space>
                </div>
              </div>

              {/* Statistics Cards */}
              <div
                style={{
                  padding: "0 24px 24px 24px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  {[
                    {
                      title: "Total",
                      value: totalForDate,
                      color: "var(--primary)",
                    },
                    {
                      title: "Closed",
                      value: closedForDate,
                      color: "#52c41a",
                    },
                    {
                      title: "Current",
                      value: currentForDate,
                      color: "#faad14",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${stat.color}20`,
                        borderRadius: 12,
                        padding: "18px 12px",
                        textAlign: "center",
                        boxShadow: `0 4px 12px ${stat.color}15`,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px ${stat.color}25`;
                        e.currentTarget.style.borderColor = `${stat.color}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${stat.color}15`;
                        e.currentTarget.style.borderColor = `${stat.color}20`;
                      }}
                    >
                      {/* Decorative circle */}
                      <div
                        style={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: `${stat.color}10`,
                          filter: "blur(20px)",
                        }}
                      />

                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 600,
                          color: stat.color,
                          marginBottom: 6,
                          position: "relative",
                        }}
                      >
                        {stat.value}
                      </div>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#595959",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          position: "relative",
                        }}
                      >
                        {stat.title}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
          {/* Left Side - Week View with Appointments */}
          <Col span={15}>
            {/* Week Navigation Header - ENHANCED */}
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                marginBottom: 20,

                border: "1px solid rgba(173, 170, 170, 0.47)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Row justify='space-between' align='middle'>
                <Col>
                  <Space size={16}>
                    <Button
                      onClick={() => setSelectedGoogleCalendarDate(moment())}
                      type='primary'
                      style={{
                        borderRadius: 12,
                        height: 42,
                        fontSize: 15,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, var(--primary) 0%, #211f60 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px #403f5f73",
                        padding: "0 24px",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px #403f5f73";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px #403f5f73";
                      }}
                    >
                      Today
                    </Button>
                    <Space.Compact>
                      <Button
                        icon={<LeftOutlined style={{ fontSize: 14 }} />}
                        onClick={() =>
                          setSelectedGoogleCalendarDate(prev =>
                            prev.clone().subtract(1, "week")
                          )
                        }
                        style={{
                          borderRadius: 12,
                          height: 42,
                          width: 42,
                          border: "1px solid #e2e8f0",
                          marginRight: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.transform = "translateX(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      />

                      <Button
                        icon={<RightOutlined style={{ fontSize: 14 }} />}
                        onClick={() =>
                          setSelectedGoogleCalendarDate(prev =>
                            prev.clone().add(1, "week")
                          )
                        }
                        style={{
                          borderRadius: 12,
                          height: 42,
                          width: 42,
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.transform = "translateX(2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      />
                    </Space.Compact>
                  </Space>
                </Col>

                <Col>
                  <div style={{
                    padding: "8px 20px",
                    background: "rgba(30,164,67,0.08)",
                    borderRadius: 10,
                    border: "1px solid rgba(30,164,67,0.15)",
                  }}>
                    <span className="header-days" style={{

                    }}>
                      {selectedDateForView.format("dddd, MMMM D")}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Week Days Header - ENHANCED */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {weekDays.map((day, idx) => {
                const isToday = day.isSame(moment(), "day");
                const isSelected = day.isSame(selectedDateForView, "day");
                const appointmentCount = getAppointmentCountForDate(day);
                const isWeekend = day.day() === 0;

                return (
                  <div
                    key={day.format("YYYY-MM-DD")}
                    onClick={() => setSelectedGoogleCalendarDate(day)}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, #09203f 0%, #537895 100%)"
                        : isToday
                          ? "linear-gradient(135deg, #e8f0fe 0%, #d3e7fd 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: isToday && !isSelected
                        ? "1px solid #09203f"
                        : isSelected
                          ? "1px solid #09203f"
                          : "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: "18px 12px",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      height: "10p0x",
                      textAlign: "center",
                      position: "relative",
                      transform: isSelected ? "scale(1.03)" : "scale(1)",
                      boxShadow: isSelected
                        ? "0 8px 24px rgba(30,164,67,0.25)"
                        : isToday
                          ? "0 4px 12px rgba(24,144,255,0.15)"
                          : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                        e.currentTarget.style.borderColor = "var(--primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = isToday ? "var(--primary)" : "#e5e7eb";
                      }
                    }}
                  >
                    {/* TOP RIGHT BADGE */}
                    {appointmentCount > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          background: isSelected
                            ? "rgba(255,255,255,0.95)"
                            : "linear-gradient(135deg, var(--primary) 0%, #211f60 100%)",
                          color: isSelected ? "var(--primary)" : "#fff",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: 600,
                          borderRadius: "12px",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          border: isSelected ? "2px solid #fff" : "none",
                          minWidth: "32px",
                          animation: "pulse 2s infinite",
                        }}
                      >
                        {appointmentCount}
                      </div>
                    )}

                    {/* Day Name */}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: isSelected ? "rgba(255,255,255,0.95)" : isWeekend ? "#ff4d4f" : "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {day.format("ddd")}
                    </Text>

                    {/* Day Number */}
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: isSelected
                          ? "#ffffff"
                          : isToday
                            ? "var(--primary)"
                            : "#1f2937",
                        marginBottom: 4,
                        lineHeight: 1,
                      }}
                    >
                      {day.format("D")}
                    </div>

                    {/* Month indicator for first day of month */}
                    {day.date() === 1 && (
                      <div style={{
                        fontSize: 10,
                        color: isSelected ? "rgba(255,255,255,0.8)" : "#9ca3af",
                        fontWeight: 600,
                        marginTop: 4,
                      }}>
                        {day.format("MMM")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Day Appointments - ENHANCED */}
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Header - ENHANCED */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "24px 28px",
                  border: "1px solid #f3f4f6",
                  borderBottom: "2px solid #f3f4f6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 6,
                    height: 32,
                    background: "linear-gradient(180deg, var(--primary) 0%, var(--primary) 100%)",
                    borderRadius: 3,
                  }} />
                  <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                    Appointments for {selectedDateForView.format("dddd, MMMM D")}
                  </Title>
                </div>
                <Badge
                  count={getAppointmentCountForDate(selectedDateForView)}
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "0 12px",
                    height: 28,
                    lineHeight: "28px",
                    borderRadius: 14,
                    boxShadow: "0 4px 12px rgba(30,164,67,0.25)",
                  }}
                />
              </div>

              {/* Google Calendar Style Timeline - ENHANCED */}
              <div
                style={{
                  display: "flex",
                  height: "calc(100vh - 450px)",
                  minHeight: "500px",
                  overflow: "hidden",
                  overflowY: "scroll",
                }}
              >
                {/* Time Labels Column - ENHANCED */}
                <div
                  style={{
                    width: "70px",
                    borderRight: "2px solid #f0f0f0",
                    flexShrink: 0,
                  }}
                >
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      style={{
                        height: "80px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                        padding: "6px 16px 0 0",
                        borderBottom: "1px solid #f3f4f6",
                        position: "relative",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: 600,
                          fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                      >
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                              ? "12 PM"
                              : `${hour - 12} PM`}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid with Appointments - ENHANCED */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    minHeight: "1920px",
                    height: "1920px",
                  }}
                >
                  {/* Current Time Indicator - ENHANCED */}
                  {selectedDateForView.isSame(moment(), "day") &&
                    (() => {
                      const now = moment();
                      const currentHourDecimal = now.hours() + now.minutes() / 60;
                      const topPosition = currentHourDecimal * 80;

                      return (
                        <>
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top: `${topPosition}px`,
                              height: "3px",
                              background: "linear-gradient(90deg, var(--primary) 0%, var(--primary) 100%)",
                              zIndex: 10,
                              pointerEvents: "none",
                              boxShadow: "0 0 10px #6562b48f",
                            }}
                          >
                            <div
                              style={{
                                width: "14px",
                                height: "14px",
                                background: "var(--primary)",
                                borderRadius: "50%",
                                position: "absolute",
                                left: "-7px",
                                top: "-5.5px",
                                boxShadow: "0 0 0 4px rgba(104, 234, 53, 0.2), 0 0 20px rgba(104, 234, 53, 0.3)",
                                animation: "pulse 2s infinite",
                              }}
                            />
                          </div>
                          <style>
                            {`
                    @keyframes pulse {
                      0%, 100% {
                        box-shadow: 0 0 0 4px rgba(95, 234, 53, 0.2), 0 0 20px rgba(83, 234, 53, 0.3);
                      }
                      50% {
                        box-shadow: 0 0 0 8px rgba(140, 234, 53, 0.1), 0 0 25px rgba(104, 234, 53, 0.4);
                      }
                    }
                  `}
                          </style>
                        </>
                      );
                    })()}

                  {/* Appointment Blocks - ENHANCED */}
                  {(() => {
                    const appointmentsForDay = getAllAppointmentsForDate(selectedDateForView);
                    const layoutData = calculateAppointmentLayout(appointmentsForDay);

                    return layoutData.map((apt, index) => {
                      let startTime, endTime;

                      if (apt.timing) {
                        const timeParts = apt.timing.split(" - ");
                        if (timeParts.length === 2) {
                          startTime = moment(timeParts[0].trim(), ["HH:mm", "h:mm A"], true);
                          endTime = moment(timeParts[1].trim(), ["HH:mm", "h:mm A"], true);

                          if (!startTime.isValid()) startTime = moment(timeParts[0].trim(), "h:mm A");
                          if (!endTime.isValid()) endTime = moment(timeParts[1].trim(), "h:mm A");
                        }
                      }

                      if (!startTime || !startTime.isValid()) startTime = moment("09:00", "HH:mm");
                      if (!endTime || !endTime.isValid()) endTime = moment(startTime).add(1, "hour");

                      const startHour = startTime.hours() + startTime.minutes() / 60;
                      const endHour = endTime.hours() + endTime.minutes() / 60;
                      const duration = endHour - startHour;

                      const top = startHour * 80;
                      const height = Math.max(duration * 80, 40);

                      const columnWidth = 100 / apt.totalColumns;
                      const leftOffset = apt.column * columnWidth;

                      const isShortAppointment = duration < 0.5;

                      // Enhanced color palette
                      const getEnhancedColor = (apt) => {
                        if (apt.status === "completed") return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                        if (apt.status === "rescheduled") return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                        if (apt.payment === "postpaid") return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                        return "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
                      };

                      const getBorderColor = (apt) => {
                        if (apt.status === "completed") return "#10b981";
                        if (apt.status === "rescheduled") return "#f59e0b";
                        if (apt.payment === "postpaid") return "#3b82f6";
                        return "#8b5cf6";
                      };

                      return (
                        <div
                          key={apt.id || index}
                          style={{
                            position: "absolute",
                            top: `${top}px`,
                            left: `calc(12px + ${leftOffset}%)`,
                            width: `calc(${columnWidth}% - 20px)`,
                            height: `${height}px`,
                            background: "#ffffff",
                            borderRadius: "12px",
                            borderLeft: `5px solid ${getBorderColor(apt)}`,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            zIndex: 5,
                            overflow: "hidden",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = "scale(1.03) translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.2)";
                            e.currentTarget.style.zIndex = 15;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = "scale(1) translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                            e.currentTarget.style.zIndex = 5;
                          }}
                          onClick={() => handleAppointmentClick(apt)}
                        >
                          {/* Gradient accent overlay */}
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "100%",
                            background: getEnhancedColor(apt),
                            opacity: 0.05,
                            pointerEvents: "none",
                          }} />

                          {/* Appointment Content - ENHANCED */}
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background:
                                apt.payment === "prepaid"
                                  ? "linear-gradient(90deg, rgba(16,185,129,0.05) 0%, rgba(240,253,244,1) 100%)"
                                  : "linear-gradient(90deg, rgba(59,130,246,0.05) 0%, rgba(239,246,255,1) 100%)",
                              borderRadius: "12px",
                              padding: "6px 12px",
                              minHeight: "40px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                              transition: "all 0.25s ease-in-out",
                              cursor: "pointer",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
                          >
                            {/* Gradient Left Stripe */}
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: "4px",
                                // background:
                                //   apt.payment === "prepaid"
                                //     ? "linear-gradient(180deg, #10b981 0%, #34d399 100%)"
                                //     : "linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)",
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: "12px",
                              }}
                            ></div>

                            {/* Left Section: Name + Time */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                minWidth: 0,
                                overflow: "hidden",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#111827",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  paddingLeft: "6px", // space after border
                                }}
                              >
                                {apt.name}
                              </span>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  flexShrink: 0,
                                }}
                              >
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>🕒</span>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {apt.timing}
                                </span>
                              </div>
                            </div>

                            {/* Right Section: Payment Status */}
                            <span
                              style={{
                                background:
                                  apt.payment === "prepaid"
                                    ? "rgba(187,247,208,0.7)"
                                    : "rgba(191,219,254,0.7)",
                                color: apt.payment === "prepaid" ? "#15803d" : "#0369a1",
                                borderRadius: "8px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "capitalize",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {apt.payment}
                            </span>
                          </div>



                        </div>
                      );
                    });
                  })()}

                  {/* Hour Lines - ENHANCED */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      style={{
                        position: "absolute",
                        top: `${hour * 80}px`,
                        left: 0,
                        right: 0,
                        height: "80px",
                        borderBottom: hour % 2 === 0 ? "1px solid #e5e7eb" : "1px dashed #f3f4f6",
                        zIndex: 1,
                        background: hour % 2 === 0 ? "rgba(248,250,252,0.3)" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* No Appointments State - ENHANCED */}
              {getAllAppointmentsForDate(selectedDateForView).length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "linear-gradient(135deg, #fafbfc 0%, #ffffff 100%)",
                  }}
                >
                  <div style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 20px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e8f0fe 0%, #d3e7fd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <CalendarOutlined style={{ fontSize: 40, color: "var(--primary)" }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                    No appointments scheduled
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                    Appointments for this day will appear here
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const AppointmentsContent = () => (
    <div>
      {showCalendarView && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e8e8e8",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          {/* Header with navigation and clear button */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Space>
                <Button
                  type="primary"
                  onClick={() => setCalendarViewDate(moment())}
                  style={{
                    borderRadius: 8,
                    background: "linear-gradient(135deg, var(--primary) 0%, #211f60 100%)",
                    border: "none",
                    fontWeight: 500,
                  }}
                >
                  Today
                </Button>
                <Space.Compact>
                  <Button
                    icon={<LeftOutlined style={{ fontSize: 14 }} />}
                    onClick={() =>
                      setCalendarViewDate(prev => prev.clone().subtract(1, "week"))
                    }
                    style={{
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                      marginRight: 8,
                    }}
                  />
                  <Button
                    icon={<RightOutlined style={{ fontSize: 14 }} />}
                    onClick={() =>
                      setCalendarViewDate(prev => prev.clone().add(1, "week"))
                    }
                    style={{
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                    }}
                  />
                </Space.Compact>
              </Space>
            </Col>
            <Col>
              <Button
                size="small"
                onClick={clearCalendarFilter}
                icon={<CloseOutlined />}
                type="text"
                style={{
                  fontSize: 13,
                  color: selectedCalendarDate ? "#ff4d4f" : "#8c8c8c",
                  fontWeight: selectedCalendarDate ? 500 : 400,
                }}
              >
                {selectedCalendarDate ? `Clear (${moment(selectedCalendarDate).format("MMM D")})` : "Clear"}
              </Button>
            </Col>
          </Row>

          {/* Week View Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {Array.from({ length: 7 }, (_, i) => {
              const startOfWeek = calendarViewDate.clone().startOf("week");
              const date = startOfWeek.clone().add(i, "days");
              const dateStr = date.format("YYYY-MM-DD");
              const isSelected = selectedCalendarDate === dateStr;
              const isToday = date.isSame(moment(), "day");
              const isSunday = date.day() === 0; // Only Sunday is weekend
              const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

              // Calculate appointments for this date based on active tab
              const appointmentCount = appointments.filter(apt => {
                const aptDate = apt.appointmentDate
                  ? moment(apt.appointmentDate).startOf("day")
                  : null;
                const aptCreatedDate = apt.createdAt
                  ? moment(apt.createdAt).startOf("day")
                  : null;
                const dateObj = moment(dateStr).startOf("day");

                const isScheduledForDate =
                  aptDate && aptDate.isSame(dateObj, "day");
                const isCreatedOnDate =
                  aptCreatedDate && aptCreatedDate.isSame(dateObj, "day");

                if (activeTab === "upcoming") {
                  return false;
                } else if (activeTab === "current") {
                  if (apt.status === "rescheduled") {
                    return isScheduledForDate;
                  }
                  return (
                    apt.status !== "completed" &&
                    apt.status !== "rescheduled" &&
                    isScheduledForDate
                  );
                } else if (activeTab === "rescheduled") {
                  if (apt.status !== "rescheduled") return false;
                  const isViewingOriginalDateOnly =
                    isCreatedOnDate && !isScheduledForDate;
                  return isViewingOriginalDateOnly;
                } else if (activeTab === "completed") {
                  return apt.status === "completed" && isScheduledForDate;
                }
                return false;
              }).length;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleCalendarDateClick(date)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, var(--primary) 0%, #211f60 100%)"
                      : isToday
                        ? "linear-gradient(135deg, #e8f0fe 0%, #d3e7fd 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: isToday && !isSelected
                      ? "2px solid var(--primary)"
                      : isSelected
                        ? "2px solid var(--primary)"
                        : "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "16px 8px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100%",
                    textAlign: "center",
                    position: "relative",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(30,164,67,0.25)"
                      : isToday
                        ? "0 4px 12px rgba(24,144,255,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                      e.currentTarget.style.borderColor = "var(--primary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = isToday
                        ? "0 4px 12px rgba(24,144,255,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = isToday ? "var(--primary)" : "#e5e7eb";
                    }
                  }}
                >
                  {/* Appointment Count Badge */}
                  {appointmentCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        background: isSelected
                          ? "rgba(255,255,255,0.95)"
                          : getTabColor(activeTab),
                        color: isSelected ? "var(--primary)" : "#fff",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "12px",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        border: isSelected ? "2px solid #fff" : "none",
                        minWidth: "28px",
                        animation: "pulse 2s infinite",
                        zIndex: 2,
                      }}
                    >
                      {appointmentCount}
                    </div>
                  )}

                  {/* Day Name with Sunday in red */}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected
                        ? "rgba(255,255,255,0.95)"
                        : isSunday
                          ? "#ff4d4f"
                          : "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {date.format("ddd")}
                  </Text>

                  {/* Day Number */}
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: isSelected
                        ? "#ffffff"
                        : isToday
                          ? "var(--primary)"
                          : "#1f2937",
                      marginBottom: 4,
                      lineHeight: 1,
                    }}
                  >
                    {date.format("D")}
                  </div>

                  {/* Month indicator for first day of month */}
                  {date.date() === 1 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: isSelected ? "rgba(255,255,255,0.8)" : "#9ca3af",
                        fontWeight: 500,
                        marginTop: 4,
                      }}
                    >
                      {date.format("MMM")}
                    </div>
                  )}

                  {/* Today indicator dot */}
                  {isToday && !isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--primary)",
                        boxShadow: "0 0 0 2px rgba(24,144,255,0.2)",
                      }}
                    />
                  )}

                  {/* Optional: Add subtle Sunday indicator */}
                  {isSunday && !isSelected && !isToday && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#ff4d4f",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend - Updated for Sunday only weekend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: "12px 0",
              borderTop: "1px solid #f0f0f0",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--primary)",
                }}
              />
              <Text style={{ fontSize: 12, color: "#595959" }}>Today</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: getTabColor(activeTab),
                }}
              />
              <Text style={{ fontSize: 12, color: "#595959" }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Appointments
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ff4d4f",
                }}
              />
              <Text style={{ fontSize: 12, color: "#595959" }}>Sunday</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, #211f60 100%)",
                }}
              />
              <Text style={{ fontSize: 12, color: "#595959" }}>Selected</Text>
            </div>
          </div>

          {/* Add pulse animation for badge */}
          <style>
            {`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }
        }
      `}
          </style>
        </Card>
      )}
      <Tabs
        style={{ fontWeight: 600, fontSize: 16 }}
        activeKey={activeTab}
        onChange={key => setActiveTab(key)}
        items={tabItems}
      />
    </div>
  );

  // if (!shouldRenderDashboard) {
  //   return (
  //     <>
  //       {showCrmModal && (
  //         <AppointmentWorkers
  //           visible={showCrmModal}
  //           onClose={handleCrmModalClose}
  //         />
  //       )}
  //       <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
  //         <div className='text-center'>
  //           <Title level={3} className='text-gray-600'>
  //             Access Restricted
  //           </Title>
  //           <Text type='secondary'>
  //             You don't have permission to view this dashboard.
  //           </Text>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  if (isLoadingConfig) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      {/*  */}
        <style>
          {`
          .disabled-input .ant-input {
            background-color: #f5f5f5;
            color: rgba(0, 0, 0, 0.85);
            border: 1px solid #d9d9d9;
            cursor: not-allowed;
          }
          .ant-btn {
            border-radius: 8px !important;
          }
          .disabled-input .ant-input:hover {
            border-color: #d9d9d9;
          }
          .disabled-input .ant-input-number-input {
            background-color: #f5f5f5;
            color: rgba(0, 0, 0, 0.85);
            cursor: not-allowed;
          }
          .disabled-picker .ant-picker-input > input {
            background-color: #f5f5f5;
            color: rgba(0, 0, 0, 0.85);
            cursor: not-allowed;
          }
          .status-button {
            border-radius: 8px;
            font-weight: 500;
          }
          .ant-drawer-content-wrapper {
            transition: transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1) !important;
          }
          .appointment-modal .ant-modal-body {
            max-height: 60vh;
            overflow-y: auto;
          }
          .main-tabs .ant-tabs-nav {
            margin-bottom: 0;
            padding: 0 24px;
            background: white;
            border-radius: 10px 10px 0 0;
          }
          .main-tabs .ant-tabs-tab {
            padding: 16px 24px;
            font-size: 16px;
            font-weight: 600;
          }
          .main-tabs .ant-tabs-tab-active {
            color: var(--primary);
          }
          .main-tabs .ant-tabs-ink-bar {
            background: var(--primary);
            height: 3px;
          }
          .main-tabs .ant-tabs-content {
            padding: 24px;
            background: white;
            border-radius: 0 0 10px 10px;
          }
        `}
        </style>

        <Breadcrumb title='Appointment Bookings' />

        <Card style={{ borderRadius: 10 }}>
          <Tabs
            activeKey={mainTab}
            onChange={setMainTab}
            style={{ marginTop: "-10px" }}
            tabBarExtraContent={{
              right:
                mainTab === "appointments" ? (
                  <>
                    {/* Search Input */}
                    <Input
                      placeholder='Search...'
                      allowClear
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      style={{ width: 200, borderRadius: 8, marginRight: 10 }}
                      prefix={<SearchOutlined />}
                      onClick={e => e.stopPropagation()}
                    />

                    {/* Filter Button */}
                    <Button
                      icon={<FilterOutlined size={16} />}
                      onClick={() => setFilterDrawerVisible(true)}
                      style={{ marginRight: 10 }}
                    >
                      Filter
                    </Button>

                    {/* Calendar Toggle */}
                    <Tooltip title='Calendar View'>
                      <Button
                        icon={<CalendarOutlined size={16} />}
                        onClick={() => {
                          const newShowState = !showCalendarView;
                          setShowCalendarView(newShowState);

                          if (newShowState) {
                            setSelectedCalendarDate(
                              moment().format("YYYY-MM-DD")
                            );
                            setCalendarViewDate(moment());
                          } else {
                            setSelectedCalendarDate(null);
                          }
                        }}
                        type={showCalendarView ? "primary" : "default"}
                        style={{ borderRadius: 8, marginRight: 10 }}
                      />
                    </Tooltip>

                    {/* New Appointment */}
                    <Button
                      type='primary'
                      icon={<PlusCircleOutlined size={16} />}
                      onClick={showModal}
                      style={{ borderRadius: 8 }}
                    // loading={isCreating}
                    >
                      New Appointment
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type='primary'
                      icon={<PlusCircleOutlined size={16} />}
                      onClick={showModal}
                      style={{ borderRadius: 8 }}
                    // loading={isCreating}
                    >
                      New Appointment
                    </Button>
                  </>
                ),
            }}
            items={[
              {
                key: "calendar",
                label: (
                  <span style={{ fontWeight: 600, fontSize: 16, }}>
                    <CalendarOutlined style={{ marginRight: 8, }} />
                    Calendar View
                  </span>
                ),
                children: <CalendarViewContent />,
              },
              {
                key: "appointments",
                label: (
                  <span style={{ fontWeight: 600, fontSize: 16, }}
                  >
                    <UnorderedListOutlined />
                    <span>Appointments</span>
                  </span>
                ),
                children: <AppointmentsContent />,
              },
            ]}
          />
        </Card>

        <Drawer
          title={
            <h6 style={{ display: "flex", alignItems: "center" }}>
              Filter Appointments
            </h6>
          }
          placement='right'
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={400}
        >
          <Space direction='vertical' style={{ width: "100%" }}>
            <div>
              <Text strong>User</Text>
              <Select
                showSearch
                placeholder='Select User'
                value={filterUser}
                onChange={setFilterUser}
                style={{ width: "100%", marginTop: 8 }}
                allowClear
              >
                {users.map(manager => (
                  <Option key={manager} value={manager}>
                    {manager}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Department</Text>
              <Select
                showSearch
                placeholder='Select Department'
                value={filterDepartment}
                onChange={setFilterDepartment}
                style={{ width: "100%", marginTop: 8 }}
                allowClear
              >
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Date Range</Text>
              <DatePicker.RangePicker
                value={filterDateRange}
                onChange={setFilterDateRange}
                style={{ width: "100%", marginTop: 8 }}
                format='DD/MM/YYYY'
              />
            </div>

            <div>
              <Text strong>Payment Type</Text>
              <Select
                placeholder='Select Payment Type'
                value={filterPayment}
                onChange={setFilterPayment}
                style={{ width: "100%", marginTop: 8 }}
                allowClear
              >
                <Option value='prepaid'>Prepaid</Option>
                <Option value='postpaid'>Postpaid</Option>
              </Select>
            </div>

            <Button
              onClick={clearAllFilters}
              style={{ width: "100%", marginTop: 16 }}
            >
              Clear All Filters
            </Button>
          </Space>
        </Drawer>

        <Modal
          title='New Appointment'
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={900}
          bodyStyle={{
            overflowY: "auto",
            overflowX: "hidden", // 🔥 KEY FIX
          }}
          className='appointment-modal'
          confirmLoading={isCreating}
          footer={[
            <Button key='cancel' onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key='submit'
              type='primary'
              onClick={handleOk}
              loading={isCreating}
            >
              Create Appointment
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout='vertical'
            requiredMark={true}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              {formFields.map((field, index) => {
                if (field.displayInForm === false) {
                  return null;
                }

                return (
                  <Col
                    xs={24}
                    sm={12}
                    key={field.fieldKey}
                    style={{
                      order: field.fieldKey === "payment" ? 999 : index,
                      display: field.fieldKey === "payment" ? "none" : "block",
                    }}
                  >
                    {renderFormField(field)}
                  </Col>
                );
              })}
            </Row>

            {formFields.find(field => field.fieldKey === "payment") && (
              <Row>
                <Col span={24}>
                  {renderFormField(
                    formFields.find(field => field.fieldKey === "payment")
                  )}
                </Col>
              </Row>
            )}
          </Form>
        </Modal>

        <Modal
          title='Reschedule Appointment'
          open={isRescheduleModalVisible}
          onOk={() => {
            rescheduleForm
              .validateFields()
              .then(handleRescheduleSubmit)
              .catch(() => { });
          }}
          onCancel={() => setIsRescheduleModalVisible(false)}
          confirmLoading={isRescheduling}
          footer={[
            <Button key='cancel' onClick={() => setIsRescheduleModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key='submit'
              type='primary'
              onClick={() => {
                rescheduleForm
                  .validateFields()
                  .then(handleRescheduleSubmit)
                  .catch(() => { });
              }}
              loading={isRescheduling}
            >
              Reschedule
            </Button>,
          ]}
        >
          <Form form={rescheduleForm} layout='vertical'>
            <Form.Item
              label='Appointment Date'
              name='appointmentDate'
              rules={[
                {
                  required: true,
                  message: "Please select appointment date!",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format='DD/MM/YYYY'
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              label='Appointment Timing'
              name='timing'
              rules={[
                {
                  required: true,
                  message: "Please enter appointment timing!",
                },
              ]}
            >
              <Select placeholder='Select Time Slot'>
                {availableSlots.map(slot => (
                  <Option key={slot.slot} value={slot.slot}>
                    {slot.slot}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      {/*  */}
    </div>
  );
};

export default Bookings;