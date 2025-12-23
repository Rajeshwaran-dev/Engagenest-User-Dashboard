import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  // Breadcrumb,
  Table,
  List,
  Timeline,
  Tag,
  Statistic,
  Avatar,
  Divider,
  Modal,
  Spin,
  Collapse,
  Radio,
  Upload,
  Image,
  Tooltip,
  Popconfirm,
} from "antd";
import moment from "moment";
import { Phone } from "react-feather";
import {
  CheckOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
  HistoryOutlined,
  StarOutlined,
  TrophyOutlined,
  EyeOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Breadcrumb from "../../Breadcrumb";
import FeedbackConfig from "./FeedbackConfig";
import MasterLayout from "../../../masterLayout/MasterLayout";
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Static data
const staticAppointments = [
  {
    id: "APT001",
    _id: "APT001",
    appointmentNo: "APT001",
    name: "John Doe",
    age: 35,
    mobile: "9876543210",
    dob: "1990-05-15",
    manager: "Jane Smith",
    managerId: "AG001",
    department: "Doctor",
    appointmentDate: "2024-01-20",
    timing: "10:00 AM - 10:30 AM",
    payment: "prepaid",
    description: "Regular checkup appointment",
    status: "current",
    createdAt: "2024-01-15T10:30:00Z",
    notes: [
      {
        _id: "NOTE001",
        type: "text",
        content: "Patient has history of allergies",
        createdBy: "Dr. Smith",
        createdAt: "2024-01-15T11:00:00Z"
      },
      {
        _id: "NOTE002",
        type: "audio",
        audioData: "https://example.com/audio1.mp3",
        audioSource: "record",
        createdBy: "Nurse Jane",
        createdAt: "2024-01-15T14:30:00Z"
      }
    ],
    rescheduleHistory: [],
    completionHistory: [],
    custom_field1: "Blood Pressure: 120/80",
    custom_field2: "Allergies: Penicillin"
  },
  {
    id: "APT002",
    _id: "APT002",
    appointmentNo: "APT002",
    name: "Alice Johnson",
    age: 42,
    mobile: "9876543211",
    dob: "1982-08-22",
    manager: "Bob Wilson",
    managerId: "AG002",
    department: "Engineer",
    appointmentDate: "2024-01-25",
    timing: "02:00 PM - 03:00 PM",
    payment: "postpaid",
    description: "Consultation meeting",
    status: "completed",
    createdAt: "2024-01-18T09:15:00Z",
    completedAt: "2024-01-25T15:30:00Z",
    notes: [
      {
        _id: "NOTE003",
        type: "text",
        content: "Client satisfied with the consultation",
        createdBy: "Bob Wilson",
        createdAt: "2024-01-25T16:00:00Z"
      }
    ],
    completionHistory: [
      {
        completedBy: "Bob Wilson",
        description: "Consultation completed successfully",
        completionDate: "2024-01-25T15:30:00Z"
      }
    ],
    rescheduleHistory: [
      {
        previousDate: "2024-01-20",
        previousTiming: "10:00 AM - 11:00 AM",
        newDate: "2024-01-25",
        newTiming: "02:00 PM - 03:00 PM",
        reason: "Client requested reschedule",
        timestamp: "2024-01-19T14:30:00Z"
      }
    ]
  },
  {
    id: "APT003",
    _id: "APT003",
    appointmentNo: "APT003",
    name: "Robert Brown",
    age: 28,
    mobile: "9876543212",
    dob: "1996-03-10",
    manager: "Alice Johnson",
    managerId: "AG003",
    department: "Teacher",
    appointmentDate: "2024-01-22",
    timing: "11:00 AM - 12:00 PM",
    payment: "prepaid",
    description: "Parent-teacher meeting",
    status: "rescheduled",
    createdAt: "2024-01-16T13:45:00Z",
    notes: [],
    rescheduleHistory: [
      {
        previousDate: "2024-01-18",
        previousTiming: "09:00 AM - 10:00 AM",
        newDate: "2024-01-22",
        newTiming: "11:00 AM - 12:00 PM",
        reason: "Teacher unavailable",
        timestamp: "2024-01-17T10:15:00Z"
      }
    ],
    completionHistory: []
  }
];

const staticAgents = [
  {
    _id: "AG001",
    name: "Jane Smith",
    config: {
      appointment: {
        availableDateRanges: [["2024-01-20", "2024-01-31"]],
        selectedDays: ["mon", "tue", "wed", "thu", "fri"],
        unavailableDates: ["2024-01-26"],
        calculatedSlots: [
          { slot: "09:00 AM - 10:00 AM" },
          { slot: "10:00 AM - 11:00 AM" },
          { slot: "11:00 AM - 12:00 PM" },
          { slot: "02:00 PM - 03:00 PM" },
          { slot: "03:00 PM - 04:00 PM" }
        ],
        occupancyPerSlot: 2
      }
    }
  },
  {
    _id: "AG002",
    name: "Bob Wilson",
    config: {
      appointment: {
        availableDateRanges: [["2024-01-22", "2024-01-30"]],
        selectedDays: ["tue", "wed", "thu", "fri"],
        unavailableDates: ["2024-01-24"],
        calculatedSlots: [
          { slot: "10:00 AM - 11:00 AM" },
          { slot: "02:00 PM - 03:00 PM" },
          { slot: "03:00 PM - 04:00 PM" }
        ],
        occupancyPerSlot: 1
      }
    }
  }
];

const staticAuditLogs = {
  data: [
    {
      _id: "LOG001",
      action: "appointment_created",
      description: "Appointment created for John Doe",
      createdAt: "2024-01-15T10:30:00Z",
      userId: "USER001",
      metadata: {
        appointmentDate: "2024-01-20",
        timing: "10:00 AM - 10:30 AM",
        department: "Doctor"
      }
    },
    {
      _id: "LOG002",
      action: "note_added",
      description: "Text note added",
      createdAt: "2024-01-15T11:00:00Z",
      userId: "USER002",
      metadata: {
        noteType: "text",
        contentPreview: "Patient has history of allergies",
        addedBy: "Dr. Smith"
      }
    },
    {
      _id: "LOG003",
      action: "appointment_rescheduled",
      description: "Appointment rescheduled from Jan 18 to Jan 22",
      createdAt: "2024-01-17T10:15:00Z",
      userId: "USER003",
      metadata: {
        previousDate: "2024-01-18",
        previousTiming: "09:00 AM - 10:00 AM",
        newDate: "2024-01-22",
        newTiming: "11:00 AM - 12:00 PM",
        reason: "Teacher unavailable"
      }
    }
  ]
};

const staticAppointmentStats = {
  totalVisits: 5,
  completed: 3,
  rescheduled: 2,
  cancelled: 0,
  lastVisitDate: "2024-01-25"
};

const staticAppointmentsByAgentDate = {
  data: [
    {
      id: "APT004",
      timing: "10:00 AM - 11:00 AM",
      name: "Other Patient 1"
    },
    {
      id: "APT005",
      timing: "02:00 PM - 03:00 PM",
      name: "Other Patient 2"
    }
  ]
};

const BookingConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment } = location.state || {};

  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState([]);
  const [rescheduleOccupiedSlots, setRescheduleOccupiedSlots] = useState({});

  const [selectedNoteType, setSelectedNoteType] = useState("text");
  const [audioInputType, setAudioInputType] = useState("record");
  const [audioFiles, setAudioFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const [detailForm] = Form.useForm();
  const [rescheduleForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("complete");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [auditDetailModal, setAuditDetailModal] = useState({
    visible: false,
    data: null,
  });

  // Static data hooks - replace API calls
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState(staticAuditLogs);
  const [appointmentStats, setAppointmentStats] = useState(staticAppointmentStats);
  const [agentsData, setAgentsData] = useState({ data: staticAgents });
  const [appointmentsByAgentDate, setAppointmentsByAgentDate] = useState(staticAppointmentsByAgentDate);

  const managers = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Wilson"];
  const departments = [
    "Doctor",
    "Engineer",
    "Teacher",
    "Manager",
    "Designer",
    "Developer",
    "Consultant",
  ];

  const disabledDate = current => {
    return current && current < moment().startOf("day");
  };

  // Simulate API loading
  useEffect(() => {
    if (!appointment) {
      message.error("No appointment data found");
      navigate("/bookings");
      return;
    }

    // Simulate loading
    setIsLoadingAppointment(true);
    setTimeout(() => {
      // Find appointment in static data or use passed data
      const foundAppointment = staticAppointments.find(
        apt => apt.id === appointment?.id || apt._id === appointment?._id
      ) || appointment;

      setSelectedAppointment(foundAppointment);

      // Set form values
      detailForm.setFieldsValue({
        ...foundAppointment,
        dob: foundAppointment.dob ? moment(foundAppointment.dob) : null,
        appointmentDate: foundAppointment.appointmentDate
          ? moment(foundAppointment.appointmentDate)
          : null,
      });

      rescheduleForm.setFieldsValue({
        appointmentDate: foundAppointment.appointmentDate
          ? moment(foundAppointment.appointmentDate)
          : null,
        timing: foundAppointment.timing,
      });

      // Set active tab based on appointment status
      if (foundAppointment.status === "completed") {
        setActiveTab("details");
      }

      // Find and set the user for reschedule
      if (foundAppointment.managerId) {
        const user = staticAgents.find(
          agent => agent._id === foundAppointment.managerId
        );
        if (user) {
          setSelectedUser(user);
          calculateAvailableDates(user);
        }
      }

      setIsLoadingAppointment(false);
    }, 500);
  }, [
    appointment,
    navigate,
    detailForm,
    rescheduleForm,
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const calculateAvailableDates = user => {
    if (!user?.config?.appointment) return;

    const { availableDateRanges, selectedDays, unavailableDates } =
      user.config.appointment;
    const dates = [];
    const today = moment();

    if (!availableDateRanges || !selectedDays) return;

    const dayMap = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    availableDateRanges?.forEach(([startDate, endDate]) => {
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
              dates.push(dateStr);
            }
          }
        }
        current.add(1, "day");
      }
    });

    setAvailableDates(dates);
  };

  const handleDateChange = async date => {
    console.log("Date selected for reschedule:", date?.format("YYYY-MM-DD"));
    setSelectedDate(date);
    rescheduleForm.setFieldsValue({ timing: undefined });

    if (date && selectedUser?.config?.appointment) {
      const { calculatedSlots } = selectedUser.config.appointment;
      console.log("Available time slots:", calculatedSlots);
      setRescheduleAvailableSlots(calculatedSlots || []);

      // Simulate API call delay
      setTimeout(() => {
        fetchOccupiedSlotsForReschedule(
          selectedUser._id,
          date.format("YYYY-MM-DD")
        );
      }, 300);
    } else {
      setRescheduleAvailableSlots([]);
      setRescheduleOccupiedSlots({});
    }
  };

  useEffect(() => {
    if (selectedAppointment && selectedAppointment.managerId) {
      const user = staticAgents.find(
        agent => agent._id === selectedAppointment.managerId
      );
      if (user) {
        setSelectedUser(user);
        calculateAvailableDates(user);

        if (selectedAppointment.appointmentDate) {
          const initialDate = moment(selectedAppointment.appointmentDate);
          setSelectedDate(initialDate);

          setTimeout(() => {
            fetchOccupiedSlotsForReschedule(
              user._id,
              initialDate.format("YYYY-MM-DD")
            );
          }, 200);
        }
      }
    }
  }, [selectedAppointment]);

  const fetchOccupiedSlotsForReschedule = async (userId, date) => {
    try {
      if (!userId || !date) {
        console.log("Missing userId or date:", { userId, date });
        return;
      }

      console.log("Fetching occupied slots for:", { userId, date });

      // Use static data
      const existingAppointments = staticAppointmentsByAgentDate.data;
      console.log("Existing appointments from static data:", existingAppointments);

      const slotOccupancy = {};
      existingAppointments.forEach(apt => {
        if (apt.timing) {
          slotOccupancy[apt.timing] = (slotOccupancy[apt.timing] || 0) + 1;
        }
      });

      console.log("Calculated slot occupancy:", slotOccupancy);
      setRescheduleOccupiedSlots(slotOccupancy);
    } catch (error) {
      console.error("Error fetching occupied slots for reschedule:", error);
      setRescheduleOccupiedSlots({});
    }
  };

  useEffect(() => {
    if (selectedDate && selectedUser?._id) {
      fetchOccupiedSlotsForReschedule(
        selectedUser._id,
        selectedDate.format("YYYY-MM-DD")
      );
    }
  }, [selectedDate, selectedUser?._id]);

  useEffect(() => {
    // Clear reschedule form when switching to reschedule tab
    if (activeTab === "reschedule") {
      rescheduleForm.setFieldsValue({
        appointmentDate: null,
        timing: undefined,
        rescheduleDescription: undefined,
      });

      setSelectedDate(null);
      setRescheduleAvailableSlots([]);
      setRescheduleOccupiedSlots({});
    }
  }, [activeTab, rescheduleForm]);

  const customDisabledDate = current => {
    if (!current) return true;
    if (current.isBefore(moment(), "day")) return true;
    if (!availableDates.length) return true;
    const dateStr = current.format("YYYY-MM-DD");
    return !availableDates.includes(dateStr);
  };

  const handleBack = () => {
    navigate("/bookings");
  };

  const formatDate = dateStr => {
    if (!dateStr) return "N/A";

    try {
      const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;

      if (dateStr.$date) {
        return new Date(dateStr.$date).toLocaleDateString("en-GB");
      }

      return date.toLocaleDateString("en-GB");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const formatDateTime = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB");
  };

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
  const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

  const validateDocumentType = file => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".txt",
      ".ppt",
      ".pptx",
    ];
    const fileName = file.name.toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.some(ext => fileName.endsWith(ext))
    ) {
      message.error(
        "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, PPTX"
      );
      return false;
    }

    return true;
  };

  const handleDocumentUpload = ({ file, fileList }) => {
    if (file.status === "uploading" && !validateDocumentType(file)) {
      file.status = "error";
      file.error = new Error("Invalid document file type");
      return;
    }

    if (file.status === "uploading" && file.size > MAX_DOCUMENT_SIZE) {
      message.error(`${file.name} exceeds 10MB limit for documents`);
      file.status = "error";
      file.error = new Error("File too large");
      return;
    }

    if (file.status === "done") {
      // Simulate uploaded URL
      file.url = `https://example.com/uploads/${file.name}`;
    } else if (file.status === "error") {
      message.error(`Document upload failed: ${file.name}`);
    }

    setMediaFiles(fileList);
  };

  const validateFileType = (file, expectedType) => {
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    const videoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
    ];

    let allowedTypes = [];
    let typeName = "";

    switch (expectedType) {
      case "image":
        allowedTypes = imageTypes;
        typeName = "image";
        break;
      case "video":
        allowedTypes = videoTypes;
        typeName = "video";
        break;
      default:
        return false;
    }

    if (!allowedTypes.includes(file.type)) {
      message.error(`Invalid file type. Please upload only ${typeName} files.`);
      return false;
    }

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);

    let allowedExtensions = [];
    switch (expectedType) {
      case "image":
        allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        break;
      case "video":
        allowedExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"];
        break;
    }

    if (!allowedExtensions.includes(fileExtension)) {
      message.error(
        `Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`
      );
      return false;
    }

    return true;
  };

  const validateAudioFileType = file => {
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/aac",
      "audio/ogg",
      "audio/mp4",
      "audio/flac",
      "audio/x-ms-wma",
    ];
    const allowedExtensions = [
      ".mp3",
      ".wav",
      ".aac",
      ".ogg",
      ".m4a",
      ".flac",
      ".wma",
    ];
    const fileName = file.name.toLowerCase();

    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.some(ext => fileName.endsWith(ext))
    );
  };

  const startRecording = async () => {
    try {
      message.info("Audio recording started (simulated)");
      setIsRecording(true);

      // Simulate recording for 3 seconds
      setTimeout(() => {
        if (isRecording) {
          const mockBlob = new Blob(["mock audio data"], { type: "audio/wav" });
          setAudioBlob(mockBlob);
          setIsRecording(false);
          message.success("Audio recorded successfully");
        }
      }, 3000);
    } catch (error) {
      message.error("Error accessing microphone");
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      const mockBlob = new Blob(["mock audio data"], { type: "audio/wav" });
      setAudioBlob(mockBlob);
      setIsRecording(false);
      message.success("Audio recorded successfully");
    }
  };

  const playAudio = (audioUrl, noteId) => {
    if (playingAudio === noteId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Create a mock audio element
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      audioRef.current.play();
      setPlayingAudio(noteId);

      audioRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const handleMediaUpload = ({ file, fileList }) => {
    if (
      file.status === "uploading" &&
      !validateFileType(file, selectedNoteType)
    ) {
      file.status = "error";
      file.error = new Error(`Invalid ${selectedNoteType} file type`);
      return;
    }

    if (file.status === "uploading") {
      if (selectedNoteType === "image" && file.size > MAX_IMAGE_SIZE) {
        message.error(`${file.name} exceeds 2MB limit for images`);
        file.status = "error";
        file.error = new Error("File too large");
        return;
      }

      if (selectedNoteType === "video" && file.size > MAX_VIDEO_SIZE) {
        message.error(`${file.name} exceeds 5MB limit for videos`);
        file.status = "error";
        file.error = new Error("File too large");
        return;
      }
    }

    if (file.status === "done") {
      // Simulate uploaded URL
      file.url = `https://example.com/uploads/${file.name}`;
    } else if (file.status === "error") {
      message.error(`Upload failed: ${file.name}`);
    }

    setMediaFiles(fileList);
  };

  const handleAudioUpload = ({ file, fileList }) => {
    if (file.status === "uploading" && !validateAudioFileType(file)) {
      file.status = "error";
      file.error = new Error("Invalid audio file type");
      message.error(`${file.name} is not a supported audio format`);
      return;
    }

    if (file.status === "uploading" && file.size > MAX_AUDIO_SIZE) {
      message.error(`${file.name} exceeds 10MB limit for audio files`);
      file.status = "error";
      file.error = new Error("File too large");
      return;
    }

    if (file.status === "done") {
      // Simulate uploaded URL
      file.url = `https://example.com/uploads/${file.name}`;
    } else if (file.status === "error") {
      message.error(`Audio upload failed: ${file.name}`);
    }

    setAudioFiles(fileList);
  };

  const handlePreview = async file => {
    if (!file.url && !file.thumbUrl && file.originFileObj) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }

    setPreviewImage(file.url || file.thumbUrl || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || "Preview");
  };

  const handleNoteTypeChange = newType => {
    const hasTextContent = noteForm.getFieldValue("note")?.trim().length > 0;
    const hasMediaFiles = mediaFiles.length > 0;
    const hasAudioFiles = audioFiles.length > 0;
    const hasRecordedAudio = audioBlob !== null;

    if (hasTextContent || hasMediaFiles || hasAudioFiles || hasRecordedAudio) {
      Modal.confirm({
        title: "Clear Current Data?",
        content:
          "You have unsaved content. Switching tabs will clear all current data. Do you want to continue?",
        okText: "Yes, Clear Data",
        cancelText: "Cancel",
        okType: "danger",
        onOk: () => {
          noteForm.resetFields();
          setAudioBlob(null);
          setAudioFiles([]);
          setMediaFiles([]);
          setSelectedNoteType(newType);
        },
      });
    } else {
      setSelectedNoteType(newType);
    }
  };

  const handleAddNote = async values => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const type = selectedNoteType;

    if (type === "text" && !values.note?.trim()) {
      message.error("Please enter a note");
      setIsSubmitting(false);
      return;
    }

    if (type === "audio") {
      if (audioInputType === "record" && !audioBlob) {
        message.error("Please record an audio note");
        setIsSubmitting(false);
        return;
      }

      if (audioInputType === "upload" && audioFiles.length === 0) {
        message.error("Please upload an audio file");
        setIsSubmitting(false);
        return;
      }
    }

    if (
      (type === "image" || type === "video" || type === "document") &&
      mediaFiles.length === 0
    ) {
      message.error(
        `Please upload ${type === "image" ? "an image" : type === "video" ? "a video" : "a document"}`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add note to static data
      const newNote = {
        _id: `NOTE${Date.now()}`,
        type,
        content: type === "text" ? values.note : null,
        audioData: type === "audio" ? "https://example.com/audio-note.mp3" : null,
        audioSource: type === "audio" ? audioInputType : null,
        mediaData: type === "image" || type === "video" || type === "document" ?
          [{ name: "uploaded-file", url: "https://example.com/upload.jpg" }] : null,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      // Update local state
      setSelectedAppointment(prev => ({
        ...prev,
        notes: [...(prev.notes || []), newNote]
      }));

      // Add to audit logs
      setAuditLogs(prev => ({
        data: [
          ...prev.data,
          {
            _id: `LOG${Date.now()}`,
            action: "note_added",
            description: `${type} note added`,
            createdAt: new Date().toISOString(),
            userId: "CURRENT_USER",
            metadata: {
              noteType: type,
              contentPreview: type === "text" ? values.note.substring(0, 50) + "..." : `${type} note`,
              addedBy: "Current User"
            }
          }
        ]
      }));

      // Reset states
      noteForm.resetFields();
      setAudioBlob(null);
      setAudioFiles([]);
      setAudioInputType("record");
      setMediaFiles([]);
      setSelectedNoteType("text");

      message.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} note added successfully!`
      );
    } catch (error) {
      console.error("Error adding note:", error);
      message.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      const values = await detailForm.validateFields();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updateData = {
        ...values,
        dob: values.dob
          ? values.dob.format("YYYY-MM-DD")
          : selectedAppointment.dob,
        appointmentDate: values.appointmentDate
          ? values.appointmentDate.format("YYYY-MM-DD")
          : selectedAppointment.appointmentDate,
      };

      // Update local state
      setSelectedAppointment(prev => ({
        ...prev,
        ...updateData
      }));

      // Add to audit logs
      setAuditLogs(prev => ({
        data: [
          ...prev.data,
          {
            _id: `LOG${Date.now()}`,
            action: "appointment_updated",
            description: "Appointment details updated",
            createdAt: new Date().toISOString(),
            userId: "CURRENT_USER",
            metadata: {
              updatedFields: Object.keys(values)
            }
          }
        ]
      }));

      setIsEditing(false);
      message.success("Appointment details saved successfully!");
    } catch (error) {
      console.error("Error updating appointment:", error);
      message.error(error.message || "Please fill all required fields");
    }
  };

  const handleRescheduleSubmit = async values => {
    try {
      // Check slot availability
      const selectedSlot = values.timing;
      const occupancy = rescheduleOccupiedSlots[selectedSlot] || 0;
      const maxOccupancy = selectedUser?.config?.appointment?.occupancyPerSlot || 1;

      if (occupancy >= maxOccupancy) {
        message.error(
          `Selected time slot is fully booked. Please choose another slot. (${occupancy}/${maxOccupancy})`
        );
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const rescheduleRecord = {
        previousDate: selectedAppointment.appointmentDate,
        previousTiming: selectedAppointment.timing,
        newDate: values.appointmentDate.format("YYYY-MM-DD"),
        newTiming: values.timing,
        reason: values.rescheduleDescription || "Appointment rescheduled",
        timestamp: new Date().toISOString()
      };

      // Update local state
      setSelectedAppointment(prev => ({
        ...prev,
        appointmentDate: values.appointmentDate.format("YYYY-MM-DD"),
        timing: values.timing,
        status: "rescheduled",
        rescheduleHistory: [...(prev.rescheduleHistory || []), rescheduleRecord]
      }));

      // Add to audit logs
      setAuditLogs(prev => ({
        data: [
          ...prev.data,
          {
            _id: `LOG${Date.now()}`,
            action: "appointment_rescheduled",
            description: `Appointment rescheduled to ${values.appointmentDate.format("DD/MM/YYYY")} ${values.timing}`,
            createdAt: new Date().toISOString(),
            userId: "CURRENT_USER",
            metadata: {
              previousDate: selectedAppointment.appointmentDate,
              previousTiming: selectedAppointment.timing,
              newDate: values.appointmentDate.format("YYYY-MM-DD"),
              newTiming: values.timing,
              reason: values.rescheduleDescription
            }
          }
        ]
      }));

      message.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      message.error("Failed to reschedule appointment");
    }
  };

  const getTimelineDotColor = action => {
    const colorMap = {
      appointment_created: "var(--primary)",
      appointment_completed: "var(--primary)",
      appointment_rescheduled: "var(--primary)",
      note_added: "var(--primary)",
      default: "var(--primary)",
    };
    return colorMap[action] || colorMap.default;
  };

  const getTimelineTagColor = action => {
    const colorMap = {
      appointment_created: "var(--primary)",
      appointment_completed: "var(--primary)",
      appointment_rescheduled: "var(--primary)",
      note_added: "var(--primary)",
      default: "var(--primary)",
    };
    return colorMap[action] || colorMap.default;
  };

  const renderMetadataDetails = log => {
    if (!log.metadata) return null;

    switch (log.action) {
      case "appointment_rescheduled":
        return (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Text type='secondary' style={{ fontSize: "12px" }}>
              <strong className='form-label'>Reschedule Details:</strong>
              <br />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "40px",
                  marginTop: "5px",
                  marginBottom: "1px",
                }}
              >
                <strong className='form-label'>
                  From: {formatDate(log.metadata.previousDate)}{" "}
                  {log.metadata.previousTiming}
                </strong>
                <strong className='form-label'>
                  To: {log.metadata.newDate} {log.metadata.newTiming}
                </strong>
              </div>
              <strong className='form-label'>
                Reason: {log.metadata.reason || "Not specified"}
              </strong>
            </Text>
          </div>
        );

      case "appointment_completed":
        return (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Text type='secondary' style={{ fontSize: "12px" }}>
              <strong className='form-label'>Completion Details:</strong>
              <br />
              <strong className='form-label'>
                Completed by: {log.metadata.completedBy}
              </strong>
              <br />
              <strong className='form-label'>
                Previous Status: {log.metadata.previousStatus}
              </strong>
              <br />
              <strong className='form-label'>
                {" "}
                Description: {log.metadata.description || "Not specified"}{" "}
              </strong>
            </Text>
          </div>
        );

      case "note_added":
        return (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Text type='secondary' style={{ fontSize: "12px" }}>
              <strong className='form-label'>Note Details:</strong>
              <br />
              <strong className='form-label'>
                Note Content: {log.metadata.contentPreview}
              </strong>
              <br />
              <strong className='form-label'>
                Added by: {log.metadata.addedBy}
              </strong>
            </Text>
          </div>
        );

      case "appointment_created":
        return (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Text type='secondary' style={{ fontSize: "12px" }}>
              <strong className='form-label'>Appointment Details:</strong>
              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                <strong className='form-label'>
                  Date: {log.metadata.appointmentDate}
                </strong>
                <strong className='form-label'>
                  Timing: {log.metadata.timing}
                </strong>
                <strong className='form-label'>
                  Department: {log.metadata.department}
                </strong>
              </div>
            </Text>
          </div>
        );

      default:
        return null;
    }
  };

  const handleCompletionSubmit = async values => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const completionRecord = {
        completedBy: "Current User",
        description: values.completionDescription,
        completionDate: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Update local state
      setSelectedAppointment(prev => ({
        ...prev,
        status: "completed",
        completedAt: new Date().toISOString(),
        completionHistory: [...(prev.completionHistory || []), completionRecord]
      }));

      // Add to audit logs
      setAuditLogs(prev => ({
        data: [
          ...prev.data,
          {
            _id: `LOG${Date.now()}`,
            action: "appointment_completed",
            description: "Appointment marked as completed",
            createdAt: new Date().toISOString(),
            userId: "CURRENT_USER",
            metadata: {
              completedBy: "Current User",
              previousStatus: "current",
              description: values.completionDescription
            }
          }
        ]
      }));

      message.success("Appointment marked as completed!");

      // Update appointment stats
      setAppointmentStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        totalVisits: prev.totalVisits + 1,
        lastVisitDate: new Date().toISOString().split('T')[0]
      }));

      // Navigate back to bookings after completion
      setTimeout(() => {
        navigate("/bookings");
      }, 1500);
    } catch (error) {
      console.error("Error completing appointment:", error);
      message.error("Failed to complete appointment");
    }
  };

  const showAuditDetail = auditLog => {
    setAuditDetailModal({
      visible: true,
      data: auditLog,
    });
  };

  const isRescheduleSlotAvailable = slot => {
    if (!selectedUser?.config?.appointment?.occupancyPerSlot) return true;

    const occupancy = rescheduleOccupiedSlots[slot.slot] || 0;
    const maxOccupancy = selectedUser.config.appointment.occupancyPerSlot;

    const isCurrentAppointmentSlot = selectedAppointment?.timing === slot.slot;

    if (isCurrentAppointmentSlot) {
      return occupancy <= maxOccupancy;
    }

    return occupancy < maxOccupancy;
  };

  const isPastSlot = slotTime => {
    if (!selectedDate) return false;

    const today = dayjs();
    const dateMoment = selectedDate;

    if (!dateMoment.isSame(today, "day")) return false;

    const startTime = slotTime.split("-")[0].trim();

    const slotMoment = dayjs(
      `${dateMoment.format("YYYY-MM-DD")} ${startTime}`,
      "YYYY-MM-DD HH:mm"
    );

    return slotMoment.isBefore(dayjs());
  };

  const renderAuditDetailModal = () => (
    <Modal
      title='Audit Log Details'
      open={auditDetailModal.visible}
      onCancel={() => setAuditDetailModal({ visible: false, data: null })}
      footer={[
        <Button
          key='close'
          onClick={() => setAuditDetailModal({ visible: false, data: null })}
        >
          Close
        </Button>,
      ]}
      width={600}
    >
      {auditDetailModal.data && (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <strong>Action:</strong>{" "}
              {auditDetailModal.data.action.replace(/_/g, " ").toUpperCase()}
            </Col>
            <Col span={24}>
              <strong>Description:</strong> {auditDetailModal.data.description}
            </Col>
            <Col span={24}>
              <strong>Date & Time:</strong>{" "}
              {formatDateTime(auditDetailModal.data.createdAt)}
            </Col>
            <Col span={24}>
              <strong>User ID:</strong> {auditDetailModal.data.userId}
            </Col>
          </Row>

          {auditDetailModal.data.metadata && (
            <div style={{ marginTop: 16 }}>
              <strong>Additional Details:</strong>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 4,
                  marginTop: 8,
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(auditDetailModal.data.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  const rescheduleHistoryColumns = [
    {
      title: "S.No.",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "Description",
      dataIndex: "reason",
      key: "description",
    },
    {
      title: "Update Date",
      dataIndex: "timestamp",
      key: "updateDate",
      render: text => formatDate(text),
    },
    {
      title: "Update Time",
      dataIndex: "timestamp",
      key: "updateTime",
      render: text => {
        const date = new Date(text);
        return date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
  ];

  const completionHistoryColumns = [
    {
      title: "S.No.",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Update Date",
      dataIndex: "completionDate",
      key: "updateDate",
      render: text => formatDate(text),
    },
    {
      title: "Update Time",
      dataIndex: "completionDate",
      key: "updateTime",
      render: text => {
        const date = new Date(text);
        return date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
    {
      title: "Completed By",
      dataIndex: "completedBy",
      key: "completedBy",
    },
  ];

  if (isLoadingAppointment) {
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

  if (!selectedAppointment) {
    return null;
  }

  const renderAppointmentInfo = () => (
    <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
      <div style={{ padding: "16px", borderRadius: "8px" }}>
        <h5 level={5} style={{ marginBottom: "16px" }}>
          <UserOutlined style={{ marginRight: "8px" }} />
          {selectedAppointment?.name}'s Appointment Details
        </h5>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Text strong>CreatedAt:</Text>
              <Text>
                {selectedAppointment?.createdAt
                  ? dayjs(selectedAppointment.createdAt).format(
                    "D/M/YYYY hh:mm A"
                  )
                  : "N/A"}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Text strong>ID:</Text>
              <Text>{selectedAppointment?.appointmentNo || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Text strong>User:</Text>
              <Text>{selectedAppointment?.manager || "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Text strong>Department:</Text>
              <Text style={{ textTransform: "capitalize" }}>
                {selectedAppointment?.department || "N/A"}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Text strong>Status:</Text>
              <Tag
                color={
                  selectedAppointment?.status === "completed"
                    ? "green"
                    : selectedAppointment?.status === "rescheduled"
                      ? "blue"
                      : "orange"
                }
                style={{ textTransform: "capitalize" }}
              >
                {selectedAppointment?.status || "N/A"}
              </Tag>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Text strong>Description:</Text>
              <Text style={{ textTransform: "capitalize" }}>
                {selectedAppointment?.description || "N/A"}
              </Text>
            </div>
          </Col>
          {/* For Rescheduled Appointments */}
          {selectedAppointment?.status === "rescheduled" && (
            <>
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>
                    Previous Date:
                  </Text>
                  <Text>
                    {dayjs(
                      selectedAppointment?.rescheduleHistory?.[
                        selectedAppointment.rescheduleHistory.length - 1
                      ]?.previousDate
                    ).format("DD MMM YYYY") || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>Previous Time:</Text>
                  <Text>
                    {selectedAppointment?.rescheduleHistory?.[
                      selectedAppointment.rescheduleHistory.length - 1
                    ]?.previousTiming || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>New Date:</Text>
                  <Text>
                    {dayjs(
                      selectedAppointment?.rescheduleHistory?.[
                        selectedAppointment.rescheduleHistory.length - 1
                      ]?.newDate
                    ).format("DD MMM YYYY") || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>New Time:</Text>
                  <Text>
                    {selectedAppointment?.rescheduleHistory?.[
                      selectedAppointment.rescheduleHistory.length - 1
                    ]?.newTiming || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>Rescheduled Reason:</Text>
                  <Text>
                    {selectedAppointment?.rescheduleHistory?.[
                      selectedAppointment.rescheduleHistory.length - 1
                    ]?.reason || "-"}
                  </Text>
                </div>
              </Col>
            </>
          )}

          {/* For Completed Appointments */}
          {selectedAppointment?.status === "completed" && (
            <>
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>
                    Completed On:
                  </Text>
                  <Text>
                    {dayjs(
                      selectedAppointment?.completedAt ||
                      selectedAppointment?.completionHistory?.[
                        selectedAppointment.completionHistory.length - 1
                      ]?.completionDate
                    ).format("DD MMM YYYY, hh:mm A") || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>Completed By:</Text>
                  <Text>
                    {selectedAppointment?.completionHistory?.[
                      selectedAppointment.completionHistory.length - 1
                    ]?.completedBy || "N/A"}
                  </Text>
                </div>
              </Col>

              <Col xs={24}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Text strong>Remarks:</Text>
                  <Text>
                    {selectedAppointment?.completionHistory?.[
                      selectedAppointment.completionHistory.length - 1
                    ]?.description || "-"}
                  </Text>
                </div>
              </Col>
            </>
          )}
        </Row>
      </div>
    </Card>
  );

  const renderCustomFields = () => {
    if (!selectedAppointment) return null;

    const customFieldKeys = Object.keys(selectedAppointment).filter(key =>
      key.startsWith("custom_")
    );

    if (customFieldKeys.length === 0) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Divider orientation='left'>Additional Information</Divider>
        </Col>
        {customFieldKeys.map(fieldKey => {
          const fieldValue = selectedAppointment[fieldKey];
          const fieldName = fieldKey.replace("custom_", "");
          const label = fieldName
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <Col xs={24} md={8} key={fieldKey}>
              <Form.Item label={label} name={fieldKey}>
                <Input
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={fieldValue}
                  onChange={e => {
                    detailForm.setFieldsValue({
                      [fieldKey]: e.target.value,
                    });
                  }}
                />
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderDetailsTab = () => (
    <div>
      {renderAppointmentInfo()}
      <Card
        title={
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
            Appointment Details
          </span>
        }
      >
        <Form form={detailForm} layout='vertical' disabled={!isEditing}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label='Name'
                name='name'
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input placeholder='Enter name' />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Age'
                name='age'
                rules={[{ required: true, message: "Please input the age!" }]}
              >
                <Input
                  type='number'
                  min={1}
                  max={120}
                  placeholder='Enter age'
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Mobile Number'
                name='mobile'
                rules={[
                  { required: true, message: "Please input mobile number!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit mobile number!",
                  },
                ]}
              >
                <Input placeholder='Enter mobile number' maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label='Date of Birth'
                name='dob'
                rules={[
                  { required: true, message: "Please select date of birth!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format='DD/MM/YYYY' />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Select User'
                name='manager'
                rules={[{ required: true, message: "Please select a user!" }]}
              >
                <Select placeholder='Select User'>
                  {managers.map(manager => (
                    <Option key={manager} value={manager}>
                      {manager}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Department'
                name='department'
                rules={[
                  { required: true, message: "Please select department!" },
                ]}
              >
                <Select placeholder='Select Department'>
                  {departments.map(department => (
                    <Option key={department} value={department}>
                      {department}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
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
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Appointment Timing'
                name='timing'
                rules={[{ required: true, message: "Please input timing!" }]}
              >
                <Input placeholder='e.g., 10:00 AM - 10:30 AM' />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Payment Type'
                name='payment'
                rules={[
                  { required: true, message: "Please select payment type!" },
                ]}
              >
                <Select>
                  <Option value='prepaid'>Prepaid</Option>
                  <Option value='postpaid'>Postpaid</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Custom Fields Section */}
          {renderCustomFields()}

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label='Description' name='description'>
                <TextArea
                  placeholder='Enter appointment description'
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>

          {isEditing && (
            <Row justify='end' style={{ marginTop: 16 }}>
              <span>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    detailForm.setFieldsValue({
                      ...selectedAppointment,
                      dob: selectedAppointment.dob
                        ? moment(selectedAppointment.dob)
                        : null,
                      appointmentDate: selectedAppointment.appointmentDate
                        ? moment(selectedAppointment.appointmentDate)
                        : null,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='primary'
                  icon={<SaveOutlined />}
                  onClick={handleSaveDetails}
                >
                  Save Changes
                </Button>
              </span>
            </Row>
          )}
        </Form>

        {/* Action Buttons for current appointments */}
        {!isEditing && selectedAppointment?.status === "current" && (
          <Row
            justify='end'
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <span size='middle'>
              <Button
                type='default'
                icon={<ReloadOutlined />}
                onClick={() => setActiveTab("reschedule")}
                style={{
                  background: "#faad14",
                  borderColor: "#faad14",
                  color: "white",
                  borderRadius: 8,
                }}
              >
                Reschedule Appointment
              </Button>
              <Button
                type='primary'
                icon={<CheckOutlined />}
                onClick={() => setActiveTab("complete")}
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  borderRadius: 8,
                }}
              >
                Mark as Complete
              </Button>
            </span>
          </Row>
        )}
      </Card>
    </div>
  );

  const renderRescheduleTab = () => (
    <div>
      {renderAppointmentInfo()}
      <Card
        title={
          <span>
            <ReloadOutlined style={{ marginRight: 8 }} />
            Reschedule Appointment
          </span>
        }
      >
        <Form
          form={rescheduleForm}
          layout='vertical'
          onFinish={handleRescheduleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
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
                  disabledDate={customDisabledDate}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label='Appointment Timing'
                name='timing'
                rules={[{ required: true, message: "Please select timing!" }]}
              >
                <Select
                  placeholder='Select Time Slot'
                  disabled={!selectedDate}
                >
                  {rescheduleAvailableSlots.map(slot => {
                    const occupancy = rescheduleOccupiedSlots[slot.slot] || 0;
                    const maxOccupancy =
                      selectedUser?.config?.appointment?.occupancyPerSlot || 1;

                    const available = isRescheduleSlotAvailable(slot);
                    const isFull = occupancy >= maxOccupancy;

                    return (
                      <Option
                        key={slot.slot}
                        value={slot.slot}
                        disabled={!available || isFull || isPastSlot(slot.slot)}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <span
                            style={{
                              color: isFull ? "#ff4d4f" : "#000",
                              textDecoration: isFull ? "line-through" : "none",
                            }}
                          >
                            {slot.slot}
                          </span>

                          <span
                            style={{
                              color: isFull ? "#ff4d4f" : "#52c41a",
                              fontSize: "12px",
                              fontWeight: 500,
                              marginLeft: "8px",
                            }}
                          >
                            {isFull
                              ? `Full (${occupancy}/${maxOccupancy})`
                              : `${occupancy}/${maxOccupancy}`}
                          </span>
                        </div>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label='Reschedule Reason/Description'
            name='rescheduleDescription'
            rules={[
              {
                required: true,
                message: "Please input reschedule description!",
              },
            ]}
          >
            <TextArea
              placeholder='Enter reason for rescheduling'
              rows={4}
              maxLength={500}
              showCount={{
                formatter: ({ count, maxLength }) => (
                  <span
                    style={{
                      float: "right",
                      color: count > maxLength ? "red" : "#999",
                    }}
                  >
                    {count}/{maxLength}
                  </span>
                ),
              }}
            />
          </Form.Item>

          <Row justify='end' style={{ marginBottom: 24 }}>
            <span>
              <Button
                onClick={() => setActiveTab("reschedule")}
                style={{ borderRadius: 8 }}
              >
                Cancel
              </Button>
              <Button
                type='primary'
                htmlType='submit'
                icon={<ReloadOutlined />}
                style={{ borderRadius: 8 }}
              >
                Save Reschedule
              </Button>
            </span>
          </Row>
        </Form>

        {/* Reschedule History */}
        <div style={{ marginTop: 32 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            Reschedule History
          </Title>
          <Table
            className="leads-performance-table"
            columns={rescheduleHistoryColumns}
            dataSource={selectedAppointment?.rescheduleHistory || []}
            rowKey='timestamp'
            pagination={false}
            size='small'
            locale={{
              emptyText: "No reschedule history available",
            }}
          />
        </div>
      </Card>
    </div>
  );

  const renderCompleteTab = () => (
    <div>
      {renderAppointmentInfo()}
      <Card
        title={
          <span>
            <CheckOutlined style={{ marginRight: 8 }} />
            Complete Appointment
          </span>
        }
      >
        <Form
          form={completeForm}
          onFinish={handleCompletionSubmit}
          layout='vertical'
        >
          <Form.Item
            label='Completion Notes/Description'
            name='completionDescription'
            rules={[
              { required: true, message: "Please add completion notes!" },
            ]}
          >
            <TextArea
              placeholder='Enter completion notes and details about the appointment outcome'
              rows={6}
              maxLength={500}
              showCount={{
                formatter: ({ count, maxLength }) => (
                  <span
                    style={{
                      float: "right",
                      color: count > maxLength ? "red" : "#999",
                    }}
                  >
                    {count}/{maxLength}
                  </span>
                ),
              }}
            />
          </Form.Item>

          <Row justify='end' style={{ marginBottom: 24 }}>
            <span>
              <Button
                onClick={() => setActiveTab("reschedule")}
                style={{ borderRadius: 8 }}
              >
                Cancel
              </Button>
              <Button
                type='primary'
                htmlType='submit'
                icon={<CheckOutlined />}
                style={{ borderRadius: 8 }}
              >
                Mark as Complete
              </Button>
            </span>
          </Row>
        </Form>

        {/* Completion History */}
        <div style={{ marginTop: 32 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <CheckOutlined style={{ marginRight: 8 }} />
            Completion History
          </Title>
          <Table
            className="leads-performance-table"
            columns={completionHistoryColumns}
            dataSource={selectedAppointment?.completionHistory || []}
            rowKey='timestamp'
            pagination={false}
            size='small'
            locale={{
              emptyText: "No completion history available",
            }}
          />
        </div>
      </Card>
    </div>
  );

  const getDocumentIcon = fileName => {
    const ext = fileName.toLowerCase().split(".").pop();
    switch (ext) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
        );
      case "doc":
      case "docx":
        return (
          <FileWordOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      case "xls":
      case "xlsx":
        return (
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "txt":
        return (
          <FileTextOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />
        );
      case "ppt":
      case "pptx":
        return <FileOutlined style={{ color: "#fa8c16", fontSize: "24px" }} />;
      default:
        return <FileOutlined style={{ color: "#8c8c8c", fontSize: "24px" }} />;
    }
  };

  const renderNotesTab = () => (
    <div>
      <Card
        title={
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
            Appointment Notes
          </span>
        }
      >
        {/* Enhanced Add Note Section */}
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={5} style={{ marginBottom: 16 }}>
            Add New Note
          </Title>

          {/* Note Type Selection */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Select Note Type:
            </Text>
            <Radio.Group
              value={selectedNoteType}
              onChange={e => handleNoteTypeChange(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value='text'>
                <MessageOutlined /> Text
              </Radio.Button>
              <Radio.Button value='audio'>
                <AudioOutlined /> Audio
              </Radio.Button>
              <Radio.Button value='image'>
                <FileImageOutlined /> Image
              </Radio.Button>
              <Radio.Button value='video'>
                <VideoCameraOutlined /> Video
              </Radio.Button>
              <Radio.Button value='document'>
                <FileOutlined /> Document
              </Radio.Button>
            </Radio.Group>
          </div>

          <Form form={noteForm} layout='vertical' onFinish={handleAddNote}>
            {/* Text Note Input */}
            {selectedNoteType === "text" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Form.Item
                    name='note'
                    rules={[
                      { required: true, message: "Please enter a note!" },
                      {
                        max: 200,
                        message: "Note cannot exceed 200 characters!",
                      },
                    ]}
                    style={{ flex: 1, margin: 0 }}
                  >
                    <TextArea
                      placeholder='Add a note about this appointment'
                      rows={4}
                      maxLength={200}
                      showCount={{
                        formatter: ({ count, maxLength }) => (
                          <span
                            style={{
                              color:
                                count > maxLength * 0.9 ? "#ff4d4f" : "#999",
                            }}
                          >
                            {count}/{maxLength}
                          </span>
                        ),
                      }}
                    />
                  </Form.Item>
                  <Form.Item style={{ margin: 0, marginTop: "65px" }}>
                    <Button
                      type='primary'
                      htmlType='submit'
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      style={{ borderRadius: 8, height: "100%" }}
                    >
                      Add Note
                    </Button>
                  </Form.Item>
                </div>
              </div>
            )}

            {/* Audio Note Input */}
            {selectedNoteType === "audio" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Choose Audio Option:
                  </Text>
                  <Radio.Group
                    value={audioInputType}
                    onChange={e => setAudioInputType(e.target.value)}
                    style={{ marginBottom: 16 }}
                  >
                    <Radio value='record'>Record Audio</Radio>
                    <Radio value='upload'>Upload Audio File</Radio>
                  </Radio.Group>
                </div>

                {/* Record Audio Section */}
                {audioInputType === "record" && (
                  <span>
                    <Button
                      style={{ borderRadius: 8 }}
                      type={isRecording ? "danger" : "primary"}
                      icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>

                    {audioBlob && (
                      <>
                        <Button
                          type='default'
                          icon={<PlayCircleOutlined />}
                          onClick={() => {
                            const audio = new Audio(
                              URL.createObjectURL(audioBlob)
                            );
                            audio.play();
                          }}
                        >
                          Preview
                        </Button>
                        <Button type='primary' htmlType='submit'>
                          Add Audio Note
                        </Button>
                      </>
                    )}
                  </span>
                )}

                {/* Upload Audio Section */}
                {audioInputType === "upload" && (
                  <div>
                    <Upload
                      accept='audio/mp3,audio/wav,audio/aac,audio/ogg,audio/m4a,audio/flac,audio/wma'
                      listType='picture'
                      fileList={audioFiles}
                      maxCount={1}
                      onChange={handleAudioUpload}
                      multiple={false}
                      beforeUpload={file => {
                        setAudioFiles([]);
                        if (!validateAudioFileType(file)) {
                          message.error(
                            `${file.name} is not a supported audio format`
                          );
                          return Upload.LIST_IGNORE;
                        }

                        if (file.size > MAX_AUDIO_SIZE) {
                          message.error(`${file.name} exceeds 10MB limit`);
                          return Upload.LIST_IGNORE;
                        }

                        // Simulate upload
                        file.status = "uploading";
                        setTimeout(() => {
                          file.status = "done";
                          file.url = `https://example.com/uploads/${file.name}`;
                          handleAudioUpload({ file, fileList: [file] });
                        }, 1000);

                        return false; // Prevent automatic upload
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload Audio File
                      </Button>
                    </Upload>

                    {audioFiles.length > 0 && (
                      <Button
                        type='primary'
                        htmlType='submit'
                        style={{ marginTop: 8 }}
                      >
                        Add Audio Note
                      </Button>
                    )}
                  </div>
                )}

                {isRecording && (
                  <div style={{ marginTop: 8 }}>
                    <Text type='danger'>Recording in progress...</Text>
                  </div>
                )}
              </div>
            )}

            {/* Image/Video Note Input */}
            {(selectedNoteType === "image" || selectedNoteType === "video") && (
              <div style={{ marginBottom: 16 }}>
                <Upload
                  accept={
                    selectedNoteType === "image"
                      ? "image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
                      : "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv"
                  }
                  listType='picture-card'
                  fileList={mediaFiles}
                  onChange={handleMediaUpload}
                  onPreview={handlePreview}
                  multiple={false}
                  maxCount={1}
                  beforeUpload={file => {
                    setMediaFiles([]);
                    if (!validateFileType(file, selectedNoteType)) {
                      return Upload.LIST_IGNORE;
                    }

                    if (
                      selectedNoteType === "image" &&
                      file.size > MAX_IMAGE_SIZE
                    ) {
                      message.error(`${file.name} exceeds 2MB limit`);
                      return Upload.LIST_IGNORE;
                    }

                    if (
                      selectedNoteType === "video" &&
                      file.size > MAX_VIDEO_SIZE
                    ) {
                      message.error(`${file.name} exceeds 5MB limit`);
                      return Upload.LIST_IGNORE;
                    }

                    // Simulate upload
                    file.status = "uploading";
                    setTimeout(() => {
                      file.status = "done";
                      file.url = `https://example.com/uploads/${file.name}`;
                      handleMediaUpload({ file, fileList: [file] });
                    }, 1000);

                    return false; // Prevent automatic upload
                  }}
                >
                  {mediaFiles.length >= 1 ? null : (
                    <div>
                      {selectedNoteType === "image" ? (
                        <CameraOutlined />
                      ) : (
                        <VideoCameraOutlined />
                      )}
                      <div style={{ marginTop: 8 }}>
                        Upload {selectedNoteType}
                      </div>
                    </div>
                  )}
                </Upload>

                {mediaFiles.length > 0 && (
                  <Button
                    type='primary'
                    htmlType='submit'
                    style={{ marginTop: 8 }}
                  >
                    Add{" "}
                    {selectedNoteType.charAt(0).toUpperCase() +
                      selectedNoteType.slice(1)}{" "}
                    Note
                  </Button>
                )}
              </div>
            )}

            {/* Document Note Input */}
            {selectedNoteType === "document" && (
              <div style={{ marginBottom: 16 }}>
                <Upload
                  accept='.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain'
                  listType='picture'
                  fileList={mediaFiles}
                  onChange={handleDocumentUpload}
                  multiple={false}
                  maxCount={1}
                  beforeUpload={file => {
                    setMediaFiles([]);
                    if (!validateDocumentType(file)) {
                      return Upload.LIST_IGNORE;
                    }

                    if (file.size > MAX_DOCUMENT_SIZE) {
                      message.error(`${file.name} exceeds 10MB limit`);
                      return Upload.LIST_IGNORE;
                    }

                    // Simulate upload
                    file.status = "uploading";
                    setTimeout(() => {
                      file.status = "done";
                      file.url = `https://example.com/uploads/${file.name}`;
                      handleDocumentUpload({ file, fileList: [file] });
                    }, 1000);

                    return false; // Prevent automatic upload
                  }}
                >
                  <Tooltip title='PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, PPTX'>
                    <Button icon={<UploadOutlined />}>Upload Document</Button>
                  </Tooltip>
                </Upload>

                {mediaFiles.length > 0 && (
                  <Button
                    type='primary'
                    htmlType='submit'
                    style={{ marginTop: 8 }}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Add Document Note
                  </Button>
                )}
              </div>
            )}
          </Form>
        </div>

        {/* Notes History */}
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Notes History</Title>
          {selectedAppointment?.notes &&
            selectedAppointment.notes.length > 0 ? (
            <List
              dataSource={[...selectedAppointment.notes].sort(
                (a, b) =>
                  new Date(b.createdAt || b.timestamp) -
                  new Date(a.createdAt || a.timestamp)
              )}
              renderItem={note => (
                <List.Item
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    padding: "12px",
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <span>{note.createdBy || note.user || "System"}</span>
                          <Tag
                            color={
                              note.type === "text"
                                ? "blue"
                                : note.type === "audio"
                                  ? "green"
                                  : note.type === "image"
                                    ? "orange"
                                    : note.type === "video"
                                      ? "purple"
                                      : "geekblue"
                            }
                          >
                            {note.type?.charAt(0).toUpperCase() +
                              note.type?.slice(1) || "Text"}
                          </Tag>
                        </span>
                        <span style={{ fontSize: "12px", color: "#999" }}>
                          {formatDateTime(note.createdAt || note.timestamp)}
                        </span>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        {/* TEXT NOTE */}
                        {note.type === "text" && (
                          <Text>{note.content || note.text}</Text>
                        )}

                        {/* AUDIO NOTE */}
                        {note.type === "audio" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Button
                              type='link'
                              icon={
                                playingAudio === note._id ? (
                                  <PauseCircleOutlined />
                                ) : (
                                  <PlayCircleOutlined />
                                )
                              }
                              onClick={() => {
                                const audioUrl =
                                  typeof note.audioData === "string"
                                    ? note.audioData
                                    : note.audioData?.fileUrl ||
                                    note.audioData?.url;
                                playAudio(audioUrl, note._id);
                              }}
                              style={{ padding: 0 }}
                            >
                              {playingAudio === note._id ? "Pause" : "Play"}{" "}
                              Audio
                            </Button>
                            <Text type='secondary' style={{ fontSize: "12px" }}>
                              {note.audioSource === "record"
                                ? "Recorded"
                                : "Uploaded"}
                            </Text>
                          </div>
                        )}

                        {/* IMAGE NOTE */}
                        {note.type === "image" && note.mediaData && (
                          <Image.PreviewGroup>
                            {note.mediaData.map((file, index) => (
                              <Image
                                key={index}
                                width={100}
                                height={75}
                                src={file.url || file.thumbUrl || "https://via.placeholder.com/100x75"}
                                style={{
                                  marginRight: 8,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                            ))}
                          </Image.PreviewGroup>
                        )}

                        {/* VIDEO NOTE */}
                        {note.type === "video" && note.mediaData && (
                          <div>
                            {note.mediaData.map((file, index) => (
                              <video
                                key={index}
                                width={200}
                                height={150}
                                controls
                                style={{ marginRight: 8, borderRadius: 4 }}
                              >
                                <source
                                  src={file.url || file.thumbUrl || "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"}
                                  type='video/mp4'
                                />
                                Your browser does not support the video tag.
                              </video>
                            ))}
                          </div>
                        )}

                        {/* DOCUMENT NOTE */}
                        {note.type === "document" && note.mediaData && (
                          <div>
                            {note.mediaData.map((file, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "12px",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: "8px",
                                  marginBottom: "8px",
                                  backgroundColor: "#fafafa",
                                }}
                              >
                                {getDocumentIcon(file.name)}
                                <div style={{ flex: 1 }}>
                                  <Text
                                    strong
                                    style={{
                                      display: "block",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {file.name}
                                  </Text>
                                  <Text
                                    type='secondary'
                                    style={{ fontSize: "12px" }}
                                  >
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                  </Text>
                                </div>
                                <Button
                                  type='primary'
                                  size='small'
                                  icon={<DownloadOutlined />}
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              No notes added yet
            </div>
          )}
        </div>
      </Card>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage.endsWith(".mp4") ||
          previewImage.endsWith(".webm") ||
          previewImage.includes("video") ? (
          <video
            width='100%'
            controls
            src={previewImage}
            style={{ borderRadius: 6 }}
          />
        ) : (
          <img alt='preview' style={{ width: "100%" }} src={previewImage} />
        )}
      </Modal>
    </div>
  );

  const renderLogsTab = () => {
    return (
      <div>
        <Card
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              Appointment Activity Timeline
            </span>
          }
        >
          {isLoadingAuditLogs ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size='large' />
            </div>
          ) : auditLogs?.data?.length > 0 ? (
            <Card
              size='small'
              style={{
                maxHeight: "600px",
                overflowY: "auto",
                overflowX: "hidden",
                border: "none",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Timeline>
                {[...(auditLogs?.data || [])].reverse().map(log => {
                  const isReschedule =
                    log.action?.includes("reschedule") && log.metadata;
                  const isCompletion =
                    log.action?.includes("complete") && log.metadata;
                  const isNote = log.action?.includes("note") && log.metadata;
                  const isCreation =
                    log.action?.includes("created") && log.metadata;
                  const isTextNote = log?.metadata?.noteType === "text";

                  const getNoteDisplayContent = log => {
                    const noteType = log?.metadata?.noteType;
                    const noteId = log?.metadata?.noteId;

                    if (!noteType || !noteId) return log.description;

                    if (noteType === "text") {
                      const note = selectedAppointment?.notes?.find(
                        n => n._id === noteId
                      );
                      return (
                        note?.content ||
                        log.metadata?.contentPreview ||
                        log.description
                      );
                    }

                    return noteType;
                  };

                  return (
                    <Timeline.Item
                      key={log._id || log.id}
                      color={getTimelineDotColor(log.action)}
                      style={{ paddingBottom: "16px" }}
                    >
                      <div style={{ marginLeft: "12px" }}>
                        {/* Summary */}
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: "4px",
                            fontSize: "14px",
                          }}
                        >
                          <span>
                            {log.description}
                          </span>

                        </div>

                        {/* User + Date */}
                        <div
                          style={{
                            fontSize: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom:
                              isReschedule ||
                                isCompletion ||
                                isNote ||
                                isCreation
                                ? "6px"
                                : "0",
                          }}
                        >
                          <span>{log.activity || ""}</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Reschedule Details */}
                        {isReschedule && (
                          <Collapse
                            ghost
                            size='small'
                            items={[
                              {
                                key: "reschedule",
                                label: "View Details",
                                children: (
                                  <div style={{ fontSize: "13px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "20px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      <div>
                                        <span>
                                          <strong>From:</strong>
                                          <br />
                                          {formatDate(
                                            log.metadata.previousDate
                                          )}{" "}
                                          {log.metadata.previousTiming}
                                        </span>
                                      </div>
                                      <div>
                                        <span>
                                          <strong>To:</strong>
                                          <br />
                                          {log.metadata.newDate}{" "}
                                          {log.metadata.newTiming}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <span>
                                        <strong>Reason:</strong>{" "}
                                        {log.metadata.reason || "Not specified"}
                                      </span>

                                    </div>
                                  </div>
                                ),
                              },
                            ]}
                          />
                        )}

                        {/* Completion Details */}
                        {isCompletion && (
                          <Collapse
                            ghost
                            size='small'
                            items={[
                              {
                                key: "completion",
                                label: "View Details",
                                children: (
                                  <div style={{ fontSize: "13px" }}>
                                    <p>
                                      <strong>Completed by:</strong>{" "}
                                      {log.metadata.completedBy}
                                    </p>
                                    <p>
                                      <strong>Previous Status:</strong>{" "}
                                      {log.metadata.previousStatus}
                                    </p>
                                    <p>
                                      <strong>Description:</strong>{" "}
                                      {log.metadata.description ||
                                        "Not specified"}
                                    </p>
                                  </div>
                                ),
                              },
                            ]}
                          />
                        )}

                        {/* Note Details */}
                        {isNote && (
                          <Collapse
                            ghost
                            size='small'
                            items={[
                              {
                                key: "note",
                                label: "View Details",
                                children: (
                                  <div style={{ fontSize: "13px" }}>
                                    <p>
                                      <strong>Note:</strong>{" "}
                                      {getNoteDisplayContent(log)}
                                      {!isTextNote ? " note added" : ""}
                                    </p>

                                    <p>
                                      <strong>Added by:</strong>{" "}
                                      {log.metadata?.addedBy || "Unknown"}
                                    </p>
                                  </div>
                                ),
                              },
                            ]}
                          />
                        )}

                        {/* Creation Details */}
                        {isCreation && (
                          <Collapse
                            ghost
                            size='small'
                            items={[
                              {
                                key: "creation",
                                label: "View Details",
                                children: (
                                  <div style={{ fontSize: "13px" }}>
                                    <div
                                      style={{ display: "flex", gap: "20px" }}
                                    >
                                      <div>
                                        <strong>Date:</strong>{" "}
                                        {log.metadata.appointmentDate}
                                      </div>
                                      <div>
                                        <strong>Timing:</strong>{" "}
                                        {log.metadata.timing}
                                      </div>
                                      <div>
                                        <strong>Department:</strong>{" "}
                                        {log.metadata.department}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              },
                            ]}
                          />
                        )}
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Card>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#999" }}
            >
              No audit logs available
            </div>
          )}
        </Card>
      </div>
    );
  };

  const calculateProfileStats = currentAppointment => {
    return {
      totalVisits: appointmentStats?.totalVisits || 0,
      completedVisits: appointmentStats?.completed || 0,
      rescheduledVisits: appointmentStats?.rescheduled || 0,
      cancelledVisits: 0,
      currentVisits: currentAppointment.status === "current" ? 1 : 0,
      totalReschedules: currentAppointment.rescheduleHistory?.length || 0,
      totalNotes: currentAppointment.notes?.length || 0,
      departmentsVisited: [currentAppointment.department].filter(Boolean),
      managersInteracted: [currentAppointment.manager].filter(Boolean),
      avgDaysBetween: 0,
      firstVisit: new Date(
        currentAppointment.createdAt || currentAppointment.appointmentDate
      ),
      lastVisit: appointmentStats?.lastVisitDate
        ? new Date(appointmentStats.lastVisitDate).toLocaleDateString()
        : "N/A",
      loyaltyScore: 75,
    };
  };

  const profileStats = calculateProfileStats(selectedAppointment);

  const appointmentHistoryColumns = [
    {
      title: "S.No.",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "Appointment ID",
      dataIndex: "appointmentNo",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: text => formatDate(text),
    },
    {
      title: "Appointment Timing",
      dataIndex: "timing",
      key: "timing",
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
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "rescheduled"
                ? "blue"
                : status === "cancelled"
                  ? "red"
                  : "orange"
          }
          style={{ textTransform: "capitalize" }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  const renderProfileTab = () => (
    <div>
      <Card
        title={
          <span>
            <IdcardOutlined style={{ marginRight: 8 }} />
            Profile Overview
          </span>
        }
      >
        {/* Profile Header */}
        <div
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderLeft: "4px solid var(--primary)",
          }}
        >
          <Row align='middle' gutter={20}>
            <Col>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "var(--primary)",
                  fontSize: "32px",
                  boxShadow: "0 4px 12px rgba(30, 164, 67, 0.2)",
                }}
              />
            </Col>
            <Col flex={1}>
              <h3
                level={3}
                style={{
                  margin: 0,
                  fontWeight: 600,
                  letterSpacing: "-0.5px",
                }}
              >
                {selectedAppointment?.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  marginTop: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(30, 164, 67, 0.08)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <PhoneOutlined
                    style={{
                      color: "var(--primary)",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}
                  />
                  <span>
                    {selectedAppointment?.mobile}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(30, 164, 67, 0.08)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <CalendarOutlined
                    style={{
                      color: "var(--primary)",
                      marginRight: "8px",
                      fontSize: "16px",
                    }}
                  />
                  <span >
                    Age: {selectedAppointment?.age}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Key Statistics */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <TeamOutlined style={{ marginRight: 8, color: "var(--primary)" }} />
            Visit Statistics
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                size='small'
                style={{ textAlign: "center", borderRadius: "8px" }}
              >
                <Statistic
                  title='Total Visits'
                  value={profileStats.totalVisits || 0}
                  valueStyle={{
                    color: "var(--primary)",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  prefix={<HistoryOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                size='small'
                style={{ textAlign: "center", borderRadius: "8px" }}
              >
                <Statistic
                  title='Completed'
                  value={profileStats.completedVisits || 0}
                  valueStyle={{
                    color: "var(--primary)",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  prefix={<CheckOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                size='small'
                style={{ textAlign: "center", borderRadius: "8px" }}
              >
                <Statistic
                  title='Rescheduled'
                  value={profileStats.rescheduledVisits || 0}
                  valueStyle={{
                    color: "var(--primary)",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  prefix={<ReloadOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                size='small'
                style={{ textAlign: "center", borderRadius: "8px" }}
              >
                <Statistic
                  title='Total Notes'
                  value={profileStats.totalNotes || 0}
                  valueStyle={{
                    color: "var(--primary)",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Profile Details */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              size='small'
              title={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Visit Timeline
                </span>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong>First Visit: </Text>
                <Text>
                  {profileStats.firstVisit
                    ? formatDate(profileStats.firstVisit)
                    : "N/A"}
                </Text>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Last Visit: </Text>
                <Text>
                  {profileStats.lastVisit ? profileStats.lastVisit : "N/A"}
                </Text>
              </div>
              <div>
                <Text strong>Current Visit: </Text>
                <Text>{formatDate(selectedAppointment?.appointmentDate)}</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              size='small'
              title={
                <span>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Service Details
                </span>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong>Departments Visited: </Text>
                <div style={{ marginTop: 4 }}>
                  {profileStats.departmentsVisited?.length > 0 ? (
                    profileStats.departmentsVisited.map(dept => (
                      <Tag key={dept} color='blue' style={{ marginBottom: 4 }}>
                        {dept}
                      </Tag>
                    ))
                  ) : (
                    <Text type='secondary'>No departments</Text>
                  )}
                </div>
              </div>
              <div>
                <Text strong>Managers Interacted: </Text>
                <div style={{ marginTop: 4 }}>
                  {profileStats.managersInteracted?.length > 0 ? (
                    profileStats.managersInteracted.map(manager => (
                      <Tag
                        key={manager}
                        color='green'
                        style={{ marginBottom: 4 }}
                      >
                        {manager}
                      </Tag>
                    ))
                  ) : (
                    <Text type='secondary'>No managers</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Current Appointment Details Table */}
        <div style={{ marginTop: 32 }}>
          <h5 level={5} style={{ marginBottom: 16 }}>
            <HistoryOutlined style={{ marginRight: 8, color: "var(--primary)" }} />
            Current Appointment Details
          </h5>
          <Table
            className="leads-performance-table"
            columns={appointmentHistoryColumns}
            dataSource={[selectedAppointment]}
            rowKey='id'
            pagination={false}
            size='small'
            locale={{
              emptyText: "No appointment data available",
            }}
            scroll={{ x: 800 }}
          />
        </div>
      </Card>
    </div>
  );

  const renderFeedbackTab = () => (
    <div>
      <Card
        title={
          <span>
            <MessageOutlined style={{ marginRight: 8 }} />
            Feedback
          </span>
        }
      >
        <FeedbackConfig appointment={selectedAppointment} />
      </Card>
    </div>
  );

  return (
    <div>
      
        <Breadcrumb
          title='Appointment Bookings'
          title={`Appointment Details - ${selectedAppointment.appointmentNo || selectedAppointment.id}`}
        />
        <div className='content-body'>
          {/* <div style={{ marginBottom: "16px" }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Button type='link' onClick={handleBack} style={{ padding: 0 }}>
                <ArrowLeftOutlined style={{ marginRight: "4px" }} />
                Bookings
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div> */}

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "details",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600, }}>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Appointment Details
                    </span>
                  ),
                  children: renderDetailsTab(),
                },
                {
                  key: "complete",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      <CheckOutlined style={{ marginRight: 8 }} />
                      Complete
                    </span>
                  ),
                  children: renderCompleteTab(),
                  disabled: selectedAppointment?.status === "completed",
                },
                ...(selectedAppointment?.status !== "completed"
                  ? [
                    {
                      key: "reschedule",
                      label: (
                        <span style={{ fontSize: 16, fontWeight: 600 }}>
                          <ReloadOutlined style={{ marginRight: 8 }} />
                          Reschedule
                        </span>
                      ),
                      children: renderRescheduleTab(),
                    },
                  ]
                  : []),
                {
                  key: "logs",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      Activity Logs
                    </span>
                  ),
                  children: renderLogsTab(),
                },
                {
                  key: "profile",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      <IdcardOutlined style={{ marginRight: 8 }} />
                      Profile
                    </span>
                  ),
                  children: renderProfileTab(),
                },
                {
                  key: "notes",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      <EditOutlined style={{ marginRight: 8 }} />
                      Notes
                    </span>
                  ),
                  children: renderNotesTab(),
                },
                {
                  key: "feedback",
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      <MessageOutlined style={{ marginRight: 8 }} />
                      Feedback
                    </span>
                  ),
                  children: renderFeedbackTab(),
                },
              ]}
            />
          </Card>
          {renderAuditDetailModal()}
        </div>
      
    </div>
  );
};

export default BookingConfiguration;