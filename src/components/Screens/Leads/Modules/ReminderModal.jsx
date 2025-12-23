import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Tabs,
  Row,
  Col,
  Tag,
  Typography,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Input,
  Space,
  Checkbox,
  Divider,
  Popconfirm,
  message,
  Upload,
  Switch,
  Radio,
  Card,
  Timeline,
  Image,
  Collapse,
  Tooltip,
  Empty,
} from "antd";
import {
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  CloseOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SendOutlined,
  MessageOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  BookOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  HistoryOutlined,
  CameraOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TableOutlined,
  SolutionOutlined,
  PushpinOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import SendTemplate from "./SendTemplate";
import { useNavigate } from "react-router-dom";
import ComposeModals from "./ComposeModals";
import { color } from "framer-motion";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

// ========================= STATIC DATA =========================
const STATIC_DATA = {
  // Quick replies
  quickReplies: [
    {
      id: "1",
      title: "Follow-up Call",
      message: "Please call the client to discuss requirements and follow up on the proposal sent yesterday."
    },
    {
      id: "2",
      title: "Meeting Reminder",
      message: "Reminder: Meeting scheduled for tomorrow at 10:00 AM. Please come prepared with the project documents."
    },
    {
      id: "3",
      title: "Payment Follow-up",
      message: "Kindly follow up on the pending payment for invoice #INV-2023-001. Payment was due last week."
    },
    {
      id: "4",
      title: "Document Submission",
      message: "Please submit the required documents by end of day today for further processing."
    }
  ],

  // Agents
  agents: [
    {
      email: "admin@example.com",
      username: "Admin User",
      role: "superadmin",
      mobilenumber: "+1234567890",
      agentType: { leads: true }
    },
    {
      email: "agent1@example.com",
      username: "John Doe",
      role: "agent",
      mobilenumber: "+1234567891",
      agentType: { leads: true }
    },
    {
      email: "agent2@example.com",
      username: "Jane Smith",
      role: "agent",
      mobilenumber: "+1234567892",
      agentType: { leads: true }
    }
  ],

  // Reminders status
  remindersStatus: {
    recentActivity: [
      {
        reminderId: "1",
        status: "sent",
        updatedAt: "2023-12-10T10:30:00Z"
      },
      {
        reminderId: "2",
        status: "pending",
        updatedAt: "2023-12-11T14:00:00Z"
      }
    ],
    upcomingReminders: [
      {
        reminderId: "3",
        status: "pending",
        updatedAt: "2023-12-12T09:00:00Z"
      }
    ],
    overdueReminders: [
      {
        reminderId: "4",
        status: "failed",
        error: { title: "Delivery Failed", message: "Network error" },
        updatedAt: "2023-12-09T16:45:00Z"
      }
    ]
  },

  // Templates
  approvedTemplates: [
    {
      id: "1",
      name: "Welcome Template",
      message: "Welcome to our service! We're excited to have you on board.",
      header: "Welcome Header",
      footer: "Thank you for choosing us",
      status: "approved"
    },
    {
      id: "2",
      name: "Meeting Confirmation",
      message: "Your meeting has been confirmed for {{date}} at {{time}}.",
      header: "Meeting Confirmation",
      footer: "See you soon!",
      status: "approved",
      examples: { date: "2023-12-15", time: "10:00 AM" }
    },
    {
      id: "3",
      name: "Payment Reminder",
      message: "Reminder: Payment for invoice {{invoiceNumber}} is due on {{dueDate}}.",
      header: "Payment Reminder",
      footer: "Please make payment on time",
      status: "approved",
      examples: { invoiceNumber: "INV-2023-001", dueDate: "2023-12-20" }
    }
  ],

  // Alert config
  alertConfig: {
    businessAlert: {
      active: true
    }
  },

  // Sample lead notes (initial data)
  leadNotes: [
    {
      _id: "note1",
      type: "text",
      content: "Initial contact made. Client seems interested in our premium package.",
      createdAt: "2023-12-01T10:30:00Z",
      timestamp: 1701426600000
    },
    {
      _id: "note2",
      type: "audio",
      audioData: "https://example.com/audio/note1.wav",
      audioSource: "record",
      createdAt: "2023-12-02T14:45:00Z",
      timestamp: 1701513900000
    },
    {
      _id: "note3",
      type: "image",
      mediaData: [
        {
          name: "image-photo.jpg",
          type: "image/jpg",
          size: 1024000,
          url: "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg"
        }
      ],
      createdAt: "2023-12-03T11:20:00Z",
      timestamp: 1701595200000
    }
  ],

  // Sample reminders (initial data)
  leadReminders: [
    {
      _id: "rem1",
      reminderId: "1",
      description: "Follow up on initial proposal",
      date: "2023-12-15 14:30:00",
      assigned: "agent1@example.com",
      sendTo: "+1234567891",
      isNotified: true,
      status: "sent"
    },
    {
      _id: "rem2",
      reminderId: "2",
      description: "Schedule demo meeting",
      date: "2023-12-18 11:00:00",
      assigned: "admin@example.com",
      sendTo: "+1234567890",
      isNotified: false,
      status: "pending"
    },
    {
      _id: "rem3",
      reminderId: "3",
      description: "Send payment reminder",
      date: "2023-12-20 09:00:00",
      assigned: "agent2@example.com",
      sendTo: "+1234567892",
      isNotified: false,
      status: "pending"
    }
  ],

  // Sample audit logs
  auditLogs: [
    {
      _id: "log1",
      action: "lead_created",
      description: "Lead was created",
      metadata: {
        leadId: "lead123",
        leadName: "John Doe",
        field: "status",
        oldValue: "New",
        newValue: "In Progress"
      },
      user: "System",
      createdAt: "2023-12-01T09:00:00Z"
    },
    {
      _id: "log2",
      action: "note_added",
      description: "Added a text note",
      metadata: {
        noteType: "text",
        contentPreview: "Initial contact made..."
      },
      user: "Admin User",
      createdAt: "2023-12-01T10:30:00Z"
    },
    {
      _id: "log3",
      action: "reminder_added",
      description: "Added reminder: Follow up on initial proposal",
      metadata: {
        reminderId: "rem1",
        reminderDate: "2023-12-15",
        assignedTo: "agent1@example.com"
      },
      user: "Admin User",
      createdAt: "2023-12-01T11:15:00Z"
    },
    {
      _id: "log4",
      action: "field_updated",
      description: "Updated lead status",
      metadata: {
        field: "description",
        oldValue: "Initial contact",
        newValue: "Client requested more information about pricing"
      },
      user: "Agent 1",
      createdAt: "2023-12-02T14:20:00Z"
    }
  ]
};
// ========================= END STATIC DATA =========================

const ReminderStatus = ({ reminder }) => {
  const status = reminder.status || (reminder.isNotified ? "sent" : "pending");
  const error = reminder.error;

  const statusConfig = {
    pending: {
      color: "orange",
      text: "Pending",
      icon: <ClockCircleOutlined />,
    },
    sent: { color: "green", text: "Sent", icon: <CheckCircleOutlined /> },
    failed: { color: "red", text: "Failed", icon: <CloseCircleOutlined /> },
    cancelled: { color: "gray", text: "Cancelled", icon: <StopOutlined /> },
  };

  const config = statusConfig[status] || statusConfig.pending;

  const tooltipContent = error ? (
    <div>
      <div>
        <strong>Error:</strong> {error.title || "Delivery Failed"}
      </div>
      {error.message && (
        <div>
          <strong>Details:</strong> {error.message}
        </div>
      )}
      {error.code && (
        <div>
          <strong>Code:</strong> {error.code}
        </div>
      )}
    </div>
  ) : (
    config.text
  );

  return (
    <Tooltip title={tooltipContent} placement='top'>
      <Tag
        color={config.color}
        icon={config.icon}
        style={{ cursor: error ? "help" : "default" }}
      >
        {config.text}
      </Tag>
    </Tooltip>
  );
};

const ReminderModal = ({
  selectedLead,
  onClose,
  onSaveNotes,
  notes,
  setNotes,
  customFieldsData = [],
  leads, // Add this prop
  setLeads, // Add this prop
}) => {

  // Use static data for quick replies
  const [quickReplies, setQuickReplies] = useState(STATIC_DATA.quickReplies);
  const [agents, setAgents] = useState(STATIC_DATA.agents);
  const [remindersStatus, setRemindersStatus] = useState(STATIC_DATA.remindersStatus);
  const [alertConfig, setAlertConfig] = useState(STATIC_DATA.alertConfig);

  const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");
  const hasToken = !!loginData.plan;
  const loggedInEmail = loginData?.email || "admin@example.com";
  const hasPlan = !!loginData?.plan;

  const filteredAgents = agents.filter(agent => {
    if (agent.role === "superadmin") return true;
    if (agent.role === "agent" && agent.agentType?.leads) return true;
    return false;
  });

  // Use static notes data
  const [notesData, setNotesData] = useState(STATIC_DATA.leadNotes);
  const [notesLoading, setNotesLoading] = useState(false);

  // Use static reminders data
  const [remindersData, setRemindersData] = useState(STATIC_DATA.leadReminders);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // Check if business alert is enabled
  const isBusinessAlertEnabled = alertConfig?.businessAlert?.active || false;

  const [audioInputType, setAudioInputType] = useState("record");
  const [audioFiles, setAudioFiles] = useState([]);

  const [internalNotes, setInternalNotes] = useState(notes || "");
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [isSendTemplateModalVisible, setIsSendTemplateModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [notesForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedNoteType, setSelectedNoteType] = useState("text");
  const [allNotes, setAllNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [allDescriptions, setAllDescriptions] = useState([]);
  const [currentDescription, setCurrentDescription] = useState("");

  // Use static audit logs
  const [auditLogs, setAuditLogs] = useState(STATIC_DATA.auditLogs);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: null,
    appointmentDate: null,
    timing: null,
    user: "",
    selectedTemplate: null,
    imageOption: "productImage",
    notifyOptions: ["productImage"],
    selectedContact: "",
    mobileNumber: selectedLead?.mobile || "",
    selectedVariableValuesObj: {},
    triggerType: "newBooking",
    fileUrl: "",
    followUps: [{ enabled: true, delay: "0 minutes" }],
  });

  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Use static templates data
  const [allTemplates, setAllTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    // Filter templates to exclude those with variables (mimicking the original logic)
    const variablePattern = /\{\{.*?\}\}/;
    const filteredTemplates = STATIC_DATA.approvedTemplates.filter(template => {
      if (
        variablePattern.test(template?.message || "") ||
        variablePattern.test(template?.header || "") ||
        variablePattern.test(template?.footer || "")
      ) {
        return false;
      }
      return true;
    });
    setAllTemplates(filteredTemplates);
  }, []);

  const getReminderStatus = reminderId => {
    if (!remindersStatus) return "pending";

    // Check in recent activity
    const recentActivity = remindersStatus.recentActivity || [];
    const activityReminder = recentActivity.find(
      activity => activity.reminderId === reminderId
    );

    if (activityReminder) {
      return activityReminder.status || "pending";
    }

    // Check in upcoming reminders
    const upcomingReminders = remindersStatus.upcomingReminders || [];
    const upcomingReminder = upcomingReminders.find(
      reminder => reminder.reminderId === reminderId
    );

    if (upcomingReminder) {
      return upcomingReminder.status || "pending";
    }

    // Check in overdue reminders
    const overdueReminders = remindersStatus.overdueReminders || [];
    const overdueReminder = overdueReminders.find(
      reminder => reminder.reminderId === reminderId
    );

    if (overdueReminder) {
      return overdueReminder.status || "pending";
    }

    return "pending";
  };

  const handleNoteTypeChange = newType => {
    const hasTextContent = currentNote.trim().length > 0;
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
          setCurrentNote("");
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

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      message.error("Error accessing microphone");
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (audioUrl, noteId) => {
    if (playingAudio === noteId) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setPlayingAudio(noteId);

      audioRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const formatValue = val => {
    if (Array.isArray(val)) return val.join(", ");
    if (val && typeof val === "object") return JSON.stringify(val);
    return val ?? "-";
  };

  const addNote = async (type = "text") => {
    if (type === "text" && !currentNote.trim()) {
      message.error("Please enter a note");
      return;
    }

    if (type === "audio") {
      if (audioInputType === "record" && !audioBlob) {
        message.error("Please record an audio note");
        return;
      }

      if (audioInputType === "upload" && audioFiles.length === 0) {
        message.error("Please upload an audio file");
        return;
      }

      if (audioInputType === "upload") {
        const pendingFiles = audioFiles.filter(
          file => file.status === "uploading"
        );
        if (pendingFiles.length > 0) {
          message.warning("Please wait for audio file to finish uploading");
          return;
        }
        const failedFiles = audioFiles.filter(file => file.status === "error");
        if (failedFiles.length > 0) {
          message.error("Audio file upload failed. Please try again.");
          return;
        }
      }
    }

    if (
      (type === "image" || type === "video" || type === "document") &&
      mediaFiles.length === 0
    ) {
      message.error(
        `Please upload ${type === "image" ? "an image" : type === "video" ? "a video" : "a document"}`
      );
      return;
    }

    const pendingFiles = mediaFiles.filter(file => file.status === "uploading");
    if (pendingFiles.length > 0) {
      message.warning("Please wait for all files to finish uploading");
      return;
    }

    const failedFiles = mediaFiles.filter(file => file.status === "error");
    if (failedFiles.length > 0) {
      message.error(
        "Some files failed to upload. Please remove them and try again."
      );
      return;
    }

    try {
      let mediaData = null;
      let audioData = null;

      // Handle image and video uploads
      if (type === "image" || type === "video" || type === "document") {
        mediaData = mediaFiles
          .filter(file => file.status === "done" && file.url)
          .map(file => ({
            name: file.name,
            type: file.type || `${type}/${file.name?.split(".").pop()}`,
            size: file.size,
            url: file.url,
          }));

        if (mediaData.length === 0) {
          message.error(
            "No files were uploaded successfully. Please try uploading again."
          );
          return;
        }
      }

      // Handle audio
      if (type === "audio") {
        if (audioInputType === "record" && audioBlob) {
          // For static version, create a fake URL
          audioData = URL.createObjectURL(audioBlob);
        } else if (audioInputType === "upload" && audioFiles.length > 0) {
          const audioFile = audioFiles[0];
          if (audioFile.url) {
            audioData = audioFile.url;
            mediaData = [
              {
                name: audioFile.name,
                type:
                  audioFile.type || `audio/${audioFile.name?.split(".").pop()}`,
                size: audioFile.size,
                url: audioFile.url,
              },
            ];
          } else {
            message.error("Audio file URL not available");
            return;
          }
        }
      }

      const newNote = {
        _id: `note-${Date.now()}`,
        type,
        content: type === "text" ? currentNote : null,
        audioData: type === "audio" ? audioData : null,
        audioSource: type === "audio" ? audioInputType : null,
        mediaData: mediaData,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      // Add to local state
      setNotesData(prev => [...prev, newNote]);

      // Reset states
      setCurrentNote("");
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
    }
  };

  const disabledTime = current => {
    if (
      current &&
      current.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    ) {
      const currentHour = dayjs().hour();
      const currentMinute = dayjs().minute();

      return {
        disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
        disabledMinutes: selectedHour => {
          if (selectedHour === currentHour) {
            return Array.from({ length: currentMinute }, (_, i) => i);
          }
          return [];
        },
      };
    }
    return {};
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

  const handleAudioUpload = ({ file, fileList }) => {
    console.log("Audio upload status:", file.status);

    if (file.status === "uploading" && !validateAudioFileType(file)) {
      file.status = "error";
      file.error = new Error("Invalid audio file type");
      message.error(`${file.name} is not a supported audio format`);
      return;
    }

    const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
    if (file.status === "uploading" && file.size > MAX_AUDIO_SIZE) {
      message.error(`${file.name} exceeds 10MB limit for audio files`);
      file.status = "error";
      file.error = new Error("File too large");
      return;
    }

    if (file.status === "done") {
      // For static version, create a fake URL
      file.url = URL.createObjectURL(file);
      console.log("Successfully set audio file URL:", file.url);
    } else if (file.status === "error") {
      console.error("Audio upload failed:", file.error);
      message.error(`Audio upload failed: ${file.name}`);
    }

    setAudioFiles(fileList);
  };

  const getDescriptionHistory = () => {
    if (!auditLogs || !Array.isArray(auditLogs)) return [];
    if (!selectedLead) return [];

    const descriptionUpdates = auditLogs
      .filter(
        log =>
          log.action === "field_updated" &&
          log.metadata?.field === "description"
      )
      .map(log => ({
        id: log._id,
        dateTime: moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        description: log.metadata.newValue,
        user: "User",
        createdAt: log.createdAt,
        type: "update",
      }));

    const allDescriptionHistory = [];

    const earliestUpdate = [...descriptionUpdates].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )[0];

    if (earliestUpdate) {
      const firstAuditLog = auditLogs.find(
        log => log._id === earliestUpdate.id
      );

      if (firstAuditLog?.metadata?.oldValue?.trim()) {
        allDescriptionHistory.push({
          id: `initial-${selectedLead.id}`,
          dateTime: moment(selectedLead.createdAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          description: firstAuditLog.metadata.oldValue,
          user: "System",
          createdAt: selectedLead.createdAt,
          type: "initial",
        });
      }
    }

    if (
      allDescriptionHistory.length === 0 &&
      selectedLead.description?.trim()
    ) {
      allDescriptionHistory.push({
        id: `initial-${selectedLead.id}`,
        dateTime: moment(selectedLead.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        description: selectedLead.description,
        user: "System",
        createdAt: selectedLead.createdAt,
        type: "initial",
      });
    }

    allDescriptionHistory.push(...descriptionUpdates);

    return allDescriptionHistory.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  };

  const descriptionHistory = getDescriptionHistory();

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

  const handleMediaUpload = ({ file, fileList }) => {
    console.log("Upload status:", file.status);

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
      // For static version, create a fake URL
      file.url = URL.createObjectURL(file);
      console.log("Successfully set file URL:", file.url);
    } else if (file.status === "error") {
      console.error("Upload failed:", file.error);
      message.error(`Upload failed: ${file.name}`);
    }

    setMediaFiles(fileList);
  };

  const handlePreview = async file => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url?.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const addDescription = () => {
    if (!currentDescription.trim()) {
      message.error("Please enter a description");
      return;
    }

    const newDescription = {
      id: Date.now().toString(),
      description: currentDescription,
      dateTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      timestamp: Date.now(),
    };

    const updatedDescriptions = [...allDescriptions, newDescription];
    setAllDescriptions(updatedDescriptions);

    if (selectedLead && setLeads) {
      const updatedLeads = leads.map(lead =>
        lead.id === selectedLead.id
          ? {
            ...lead,
            description: currentDescription,
            descriptionHistory: updatedDescriptions,
          }
          : lead
      );
      setLeads(updatedLeads);
    }

    setCurrentDescription("");
    message.success("Description added successfully!");
  };

  const clearNotes = async () => {
    try {
      if (notesData && notesData.length > 0) {
        setNotesData([]);
      }

      setCurrentNote("");
      setAudioBlob(null);
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }

      message.success("All notes cleared!");
    } catch (error) {
      console.error("Error clearing notes:", error);
      message.error("Failed to clear notes");
    }
  };

  const deleteNote = async noteId => {
    try {
      setNotesData(prev => prev.filter(note => note._id !== noteId));

      if (playingAudio === noteId) {
        setPlayingAudio(null);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }

      message.success("Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error("Failed to delete note");
    }
  };

  const deleteDescription = descriptionId => {
    const updatedDescriptions = allDescriptions.filter(
      desc => desc.id !== descriptionId
    );
    setAllDescriptions(updatedDescriptions);

    if (selectedLead && setLeads) {
      const updatedLeads = leads.map(lead =>
        lead.id === selectedLead.id
          ? { ...lead, descriptionHistory: updatedDescriptions }
          : lead
      );
      setLeads(updatedLeads);
    }

    message.success("Description deleted successfully!");
  };

  const handleConvertToCustomer = async leadId => {
    try {
      if (selectedLead?.isConverted || selectedLead?.status === "Converted") {
        message.warning("Lead is already converted to customer");
        return;
      }

      // For static version, just show success message
      message.success("Lead converted to customer successfully! Assignment removed.");

      if (setLeads && leads) {
        const updatedLeads = leads.map(lead =>
          lead.id === selectedLead.id
            ? {
              ...lead,
              isConverted: true,
              status: "Converted",
              conversionDate: new Date().toISOString().split("T")[0],
              assigned: null,
              assignedAgent: null,
            }
            : lead
        );
        setLeads(updatedLeads);
      }

      onClose();
      navigate("/customers");
    } catch (error) {
      console.error("Conversion error:", error);
      message.error("Error converting lead to customer");
    }
  };

  useEffect(() => {
    if (selectedTemplate?.examples) {
      try {
        let parsedVariables = [];
        if (
          typeof selectedTemplate.examples === "object" &&
          !Array.isArray(selectedTemplate.examples)
        ) {
          parsedVariables = Object.keys(selectedTemplate.examples);
        } else if (Array.isArray(selectedTemplate.examples)) {
          parsedVariables = selectedTemplate.examples;
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

    if (selectedTemplate?.actions && selectedTemplate.actions.length > 0) {
      selectedTemplate.actions.forEach((action, index) => {
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
  }, [selectedTemplate]);

  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    setComposeModalOpen(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: "",
    }));
    setFileList([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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

  const handleTriggerChange = e => {
    setFormData(prev => ({
      ...prev,
      triggerType: e.target.value,
    }));
  };

  const handleFormSubmit = () => {
    if (!selectedTemplate) {
      enqueueSnackbar("Please select a template!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (
      (selectedTemplate?.headerType === "image" ||
        selectedTemplate?.headerType === "video" ||
        selectedTemplate?.headerType === "file") &&
      !formData.fileUrl
    ) {
      enqueueSnackbar(`Please upload a ${selectedTemplate.headerType} file!`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (selectedTemplate?.examples) {
      let hasErrors = false;
      Object.keys(selectedTemplate.examples)?.forEach(ele => {
        const value = formData.selectedVariableValuesObj?.[ele];
        if (!value || value.length === 0) {
          hasErrors = true;
          enqueueSnackbar(`${ele} is required!`, {
            variant: "error",
            autoHideDuration: 3000,
          });
        }

        if (ele.toLowerCase() === "otp" && value && value.length > 15) {
          hasErrors = true;
          enqueueSnackbar("OTP cannot be more than 15 characters", {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
      });

      if (hasErrors) return;
    }

    // Submit logic
    enqueueSnackbar("Template sent successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const mergedReminders = React.useMemo(() => {
    const leadReminders = remindersData || [];

    if (!remindersStatus || !leadReminders.length) {
      return leadReminders.map(reminder => ({
        ...reminder,
        status: reminder.isNotified ? "completed" : "pending",
      }));
    }

    const statusMap = {};

    const allStatusReminders = [
      ...(remindersStatus.upcomingReminders || []),
      ...(remindersStatus.overdueReminders || []),
      ...(remindersStatus.recentActivity || []),
    ];

    allStatusReminders.forEach(reminder => {
      if (reminder.reminderId) {
        statusMap[reminder.reminderId] = {
          status: reminder.status,
          error: reminder.error,
          updatedAt: reminder.updatedAt,
        };
      }
    });

    return leadReminders.map(reminder => {
      const reminderId = reminder.reminderId;
      const statusInfo = statusMap[reminderId];

      let status = "pending";
      if (statusInfo?.status) {
        status = statusInfo.status;
      } else if (reminder.isNotified) {
        status = "completed";
      }

      return {
        ...reminder,
        status: status,
        error: statusInfo?.error || reminder.error,
      };
    });
  }, [remindersData, remindersStatus]);

  const statusColumn = {
    title: "Status",
    key: "status",
    render: (_, record) => {
      const status = record.status || "pending";
      const error = record.error;

      const statusConfig = {
        pending: { color: "orange", text: "Pending" },
        completed: { color: "green", text: "Completed" },
        failed: { color: "red", text: "Failed" },
        cancelled: { color: "gray", text: "Cancelled" },
      };

      const config = statusConfig[status] || statusConfig.pending;

      return (
        <Tooltip
          title={
            error
              ? `Error: ${error.title || error.message || "Delivery failed"}`
              : config.text
          }
          placement='top'
        >
          <Tag color={config.color} style={{ border: "none" }}>
            {config.text}
          </Tag>
        </Tooltip>
      );
    },
    width: 120,
  };

  const handleReset = () => {
    setFormData({
      name: "",
      age: "",
      dob: null,
      appointmentDate: null,
      timing: null,
      user: "",
      selectedTemplate: null,
      imageOption: "productImage",
      notifyOptions: ["productImage"],
      selectedContact: "",
      mobileNumber: selectedLead?.mobile || "",
      selectedVariableValuesObj: {},
      triggerType: "newBooking",
      fileUrl: "",
      followUps: [{ enabled: true, delay: "0 minutes" }],
    });
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setFileList([]);
  };

  useEffect(() => {
    if (selectedLead?.notes) {
      setInternalNotes(selectedLead.notes);
      notesForm.setFieldsValue({ notes: selectedLead.notes });
    }
  }, [selectedLead, notesForm]);

  // Load notes from static data
  useEffect(() => {
    if (notesData && Array.isArray(notesData)) {
      const formattedNotes = notesData.map(note => ({
        id: note._id ? note._id.toString() : Date.now().toString(),
        type: note.type || "text",
        content: note.content || null,
        audioBlob: null,
        audioData: note.audioData || null,
        audioUrl: note.audioData || null,
        audioSource: note.audioSource || "record",
        mediaData: note.mediaData
          ? note.mediaData.map(media => ({
            uid: media.name || `media-${Date.now()}`,
            name: media.name || "media",
            status: "done",
            url: media.url,
            thumbUrl:
              media.type && media.type.startsWith("image/")
                ? media.url
                : null,
          }))
          : null,
        mediaFiles: note.mediaData
          ? note.mediaData.map(media => ({
            uid: media.name || `media-${Date.now()}`,
            name: media.name || "media",
            status: "done",
            url: media.url,
            thumbUrl:
              media.type && media.type.startsWith("image/")
                ? media.url
                : null,
          }))
          : null,
        dateTime: note.createdAt
          ? new Date(note.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        timestamp: note.timestamp || Date.now(),
      }));

      setAllNotes(formattedNotes);
    } else {
      setAllNotes([]);
    }
  }, [notesData]);

  const handleSaveNotes = () => {
    onSaveNotes(internalNotes);
    setNotes(internalNotes);
    message.success("Notes saved successfully!");
  };

  const handleSaveReminder = async values => {
    if (!isBusinessAlertEnabled) {
      message.error(
        <div>
          <div>
            Business Alert configuration is required to create reminders
          </div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            Please go to{" "}
            <strong>Lead Configuration → Reminders → Business Alert</strong> and
            turn on the alert first
          </div>
        </div>
      );
      return;
    }
    try {
      const selectedAgent = filteredAgents.find(
        agent => agent.email === values.assigned
      );

      const newReminder = {
        _id: `rem-${Date.now()}`,
        reminderId: `rem${Date.now()}`,
        description: values.description,
        date: values.date.format("YYYY-MM-DD HH:mm:ss"),
        assigned: values.assigned || selectedLead?.assigned || "",
        sendTo: selectedAgent?.mobilenumber || "",
        isNotified: false,
        status: "pending"
      };

      // Add to local state
      setRemindersData(prev => [...prev, newReminder]);

      // Also update reminders status
      const newStatusReminder = {
        reminderId: newReminder.reminderId,
        status: "pending",
        updatedAt: new Date().toISOString()
      };

      setRemindersStatus(prev => ({
        ...prev,
        upcomingReminders: [...(prev.upcomingReminders || []), newStatusReminder]
      }));

      form.resetFields();
      message.success("Reminder set successfully!");
    } catch (error) {
      console.error("Error saving reminder:", error);
      message.error("Failed to save reminder");
    }
  };

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
    const audioTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/aac",
      "audio/ogg",
      "audio/m4a",
      "audio/flac",
      "audio/wma",
    ];
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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
      case "audio":
        allowedTypes = audioTypes;
        typeName = "audio";
        break;
      case "document":
        allowedTypes = documentTypes;
        typeName = "document";
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
      case "audio":
        allowedExtensions = ["mp3", "wav", "aac", "ogg", "m4a", "flac", "wma"];
        break;
      case "document":
        allowedExtensions = [
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "txt",
          "ppt",
          "pptx",
        ];
        break;
    }

    if (!allowedExtensions.includes(fileExtension)) {
      message.error(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleDeleteReminder = async id => {
    try {
      setRemindersData(prev => prev.filter(reminder => reminder._id !== id));

      // Also remove from status
      const reminderToDelete = remindersData.find(r => r._id === id);
      if (reminderToDelete) {
        setRemindersStatus(prev => ({
          ...prev,
          upcomingReminders: (prev.upcomingReminders || []).filter(
            r => r.reminderId !== reminderToDelete.reminderId
          ),
          recentActivity: (prev.recentActivity || []).filter(
            r => r.reminderId !== reminderToDelete.reminderId
          )
        }));
      }

      message.success("Reminder deleted successfully!");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      message.error("Failed to delete reminder");
    }
  };

  const filteredReminders = remindersData.filter(reminder => {
    return reminder.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const customFields = customFieldsData
    .filter(field => selectedLead?.[field.key])
    .map(field => ({
      key: field.key,
      name: field.name,
      value: selectedLead[field.key],
    }));

  // Notes table columns
  const notesColumns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
      align: "center",
    },
    {
      title: "Date & Time",
      dataIndex: "dateTime",
      key: "dateTime",
      width: 150,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: type => {
        const colors = {
          text: "blue",
          audio: "green",
          image: "orange",
          video: "purple",
          document: "geekblue",
        };
        return (
          <Tag color={colors[type] || "default"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Content",
      key: "content",
      render: (_, record) => {
        if (record.type === "text") {
          return (
            <Text ellipsis={{ tooltip: record.content }}>{record.content}</Text>
          );
        } else if (record.type === "audio") {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                type='link'
                icon={
                  playingAudio === record.id ? (
                    <PauseCircleOutlined />
                  ) : (
                    <PlayCircleOutlined />
                  )
                }
                onClick={() => playAudio(record.audioData, record.id)}
                style={{ padding: 0 }}
              >
                {playingAudio === record.id ? "Pause" : "Play"} Audio
              </Button>
              <Text type='secondary' style={{ fontSize: "12px" }}>
                {record.audioSource === "record" ? "Recorded" : "Uploaded"}
              </Text>
            </div>
          );
        } else if (record.type === "image") {
          return (
            <div>
              <Image.PreviewGroup>
                {record.mediaFiles?.map((file, index) => (
                  <Image
                    key={index}
                    width={50}
                    height={50}
                    src={file.url || file.thumbUrl}
                    style={{ marginRight: 8, objectFit: "cover" }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          );
        } else if (record.type === "video") {
          return (
            <div>
              {record.mediaFiles?.map((file, index) => (
                <video
                  key={index}
                  width={100}
                  height={60}
                  controls
                  style={{ marginRight: 8 }}
                >
                  <source src={file.url || file.thumbUrl} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          );
        } else if (record.type === "document") {
          return (
            <div>
              {record.mediaData?.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "4px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {getDocumentIcon(file.name)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      ellipsis={{ tooltip: file.name }}
                      style={{ display: "block", fontSize: "12px" }}
                    >
                      {file.name}
                    </Text>
                    <Text type='secondary' style={{ fontSize: "11px" }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </div>
                  <Button
                    type='link'
                    size='small'
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(file.url, "_blank")}
                  />
                </div>
              ))}
            </div>
          );
        }
        return null;
      },
      width: 300,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title='Are you sure to delete this note?'
          onConfirm={() => deleteNote(record.id)}
          okText='Yes'
          cancelText='No'
        >
          <Tooltip title='Delete a Note'>
            <Button type='text' danger icon={<DeleteOutlined />} size='small' />
          </Tooltip>
        </Popconfirm>
      ),
      width: 80,
      fixed: "right",
    },
  ];

  // Audit logs table columns
  const auditColumns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Date & Time",
      key: "dateTime",
      width: 140,
      render: (_, record) =>
        record.dateTime ||
        moment(record.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: action => {
        const actionColors = {
          note_added: "blue",
          reminder_added: "green",
          reminder_deleted: "red",
          status_changed: "orange",
          converted: "purple",
          template_sent: "cyan",
          description_added: "geekblue",
          lead_created: "green",
        };
        return (
          <Tag
            color={actionColors[action] || "default"}
            style={{
              border: "none",
              textTransform: "capitalize",
              fontWeight: 600,
              backgroundColor: "transparent",
            }}
          >
            {action.replace(/_/g, " ")}
          </Tag>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: text => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 100,
    },
    {
      title: "Details",
      key: "metadata",
      width: 80,
      render: (_, record) =>
        record.metadata && Object.keys(record.metadata).length > 0 ? (
          <Button
            type='link'
            icon={<EyeOutlined />}
            size='small'
            onClick={() => {
              Modal.info({
                title: "Activity Details",
                content: (
                  <div>
                    <p>
                      <strong>Action:</strong> {record.action}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {record.metadata.contentPreview || record.description}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {record.dateTime ||
                        moment(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                    </p>
                  </div>
                ),
              });
            }}
          >
            View
          </Button>
        ) : null,
    },
  ];

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

  // Description history table columns
  const descriptionColumns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Date & Time",
      dataIndex: "dateTime",
      key: "dateTime",
      width: 150,
      render: dateTime => (
        <Text>{moment(dateTime).format("YYYY-MM-DD hh:mm")}</Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: text => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
      width: 250,
    },
  ];

  if (templatesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              height: "52px",
            }}
          >
            <h5 level={5} style={{ margin: 0, fontSize: "18px" }}>
              Lead Details -{" "}
              <span>
                {selectedLead?.name || ""}
              </span>
            </h5>
            {selectedLead?.company && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                <Text strong style={{ fontSize: "16px", marginRight: "8px" }}>
                  Company:
                </Text>
                <Text style={{ fontSize: "16px" }}>
                  <span>
                    {selectedLead.company}
                  </span>
                </Text>
              </div>
            )}
          </div>
        }
        open={!!selectedLead}  // This line is crucial
        onCancel={onClose}
        width={1200}
        footer={[
          <Button
            key='convert'
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
            onClick={() =>
              selectedLead?.isConverted || selectedLead?.status === "Converted"
                ? message.info("Lead is already converted to customer")
                : handleConvertToCustomer(selectedLead.id)
            }
            disabled={
              selectedLead?.isConverted || selectedLead?.status === "Converted"
            }
          >
            {selectedLead?.isConverted || selectedLead?.status === "Converted"
              ? "Converted as Customer"
              : "Convert to Customer"}
          </Button>,
        ]}
        destroyOnClose
        className='lead-details-modal'
        bodyStyle={{
          padding: 0,
          height: "70vh",
          overflow: "auto",
        }}
      >
        <Tabs
          defaultActiveKey='reminders'
          tabPlacement='left'
          style={{ height: "100%" }}
          className='fixed-tabs'
          tabBarStyle={{ height: "100%" }}
        >
          <TabPane
            tab={
              <span className="lead-details-modal">
                <BellOutlined />
                <span className='tab-label'>Reminders</span>
              </span>
            }
            key='reminders'
          >
            <div style={{ height: "100%", padding: "8px" }}>
              <Row gutter={24} style={{ height: "100%" }}>

                <Col span={11}>
                  <div style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #eef0f7'
                  }}>
                    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 20 }}>
                      Set New Reminder
                    </Typography.Title>

                    <Form
                      form={form}
                      layout='vertical'
                      onFinish={handleSaveReminder}
                      requiredMark={false}
                    >
                      <Form.Item
                        name='description'
                        label={<Text strong>Description</Text>}
                        rules={[{ required: true, message: "Please enter description" }]}
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder='e.g. Follow up on the payment'
                          style={{ borderRadius: '10px', border: '1px solid #d9d9d9' }}
                        />
                      </Form.Item>

                      <Form.Item label={<Text type="secondary" size="small">Quick Replies</Text>}>
                        <Select
                          placeholder='Select template...'
                          variant="borderless"
                          style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                          onChange={value => {
                            if (value) {
                              const reply = quickReplies.find(r => r.id === value);
                              const current = form.getFieldValue("description") || "";
                              form.setFieldsValue({
                                description: current ? `${current}\n${reply.message}` : reply.message
                              });
                            }
                          }}
                        >
                          {quickReplies.map(reply => (
                            <Select.Option key={reply.id} value={reply.id}>
                              <Text strong>{reply.title}</Text>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            name='date'
                            label={<Text strong>Date & Time</Text>}
                            rules={[{ required: true, message: "Select time" }]}
                          >
                            <DatePicker
                              showTime={{ use12Hours: true, format: "h:mm A" }}
                              format='YYYY-MM-DD h:mm A'
                              placeholder="Date & Time"
                              style={{ width: "100%", borderRadius: '8px' }}
                              disabledDate={current => current && current < moment().startOf("day")}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name='assigned'
                            label={<Text strong>Set reminder to</Text>}
                            initialValue={selectedLead?.assigned || (!hasPlan ? loggedInEmail : undefined)}
                          >
                            <Select
                              placeholder="Select Agent"
                              style={{ borderRadius: '8px' }}
                              disabled={!hasPlan}
                            >
                              {(!hasPlan ? [loggedInEmail] : filteredAgents.map(agent => agent.email)).map(email => (
                                <Select.Option key={email} value={email}>
                                  {filteredAgents.find(a => a.email === email)?.username || email}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Button
                        type="primary"
                        htmlType='submit'
                        block
                        size="large"
                        icon={<PlusCircleOutlined />}
                        style={{
                          marginTop: '12px',
                          height: '45px',
                          borderRadius: '10px',
                          background: 'var(--primary)',
                          boxShadow: '0 4px 10px rgba(24, 144, 255, 0.2)'
                        }}
                      >
                        Add Reminder
                      </Button>
                    </Form>
                  </div>
                </Col>
                {/* LEFT COLUMN: SCROLLABLE ACTIVITY FEED */}
                <Col span={13} style={{ borderRight: '1px solid #f0f0f0', paddingRight: '24px' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      <HistoryOutlined style={{ marginRight: 8 }} />
                      Upcoming Tasks
                    </Typography.Title>
                    <Input
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Search reminders..."
                      variant="filled"
                      style={{ width: 180, borderRadius: 20 }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div style={{ height: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                    {mergedReminders.filter(r => r.description?.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                      mergedReminders
                        .filter(r => r.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((reminder, index) => (
                          <div
                            key={reminder._id || index}
                            style={{
                              border: '1px solid #f0f0f0',
                              borderRadius: '12px',
                              padding: '16px',
                              marginBottom: '12px',
                              transition: 'all 0.3s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            className="reminder-card-hover"
                          >
                            <Row justify="space-between" align="top">
                              <Col span={18}>
                                <Space direction="vertical" size={0}>
                                  <Text strong style={{ fontSize: '14px', color: '#1f1f1f' }}>
                                    {reminder.description}
                                  </Text>
                                  <Space split={<Divider type="vertical" />} style={{ marginTop: 4 }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      <ClockCircleOutlined /> {moment(reminder.date).format("MMM DD, hh:mm A")}
                                    </Text>
                                    <Tag color="blue" bordered={false} style={{ fontSize: '11px', margin: 0 }}>
                                      {reminder.assigned || selectedLead?.assigned}
                                    </Tag>
                                  </Space>
                                </Space>
                              </Col>
                              <Col span={4} style={{ textAlign: 'right' }}>
                                <div style={{ marginBottom: 8 }}>{statusColumn.render(reminder.status, reminder)}</div>
                                <Popconfirm
                                  title='Delete this reminder?'
                                  onConfirm={() => handleDeleteReminder(reminder._id)}
                                  okText='Delete'
                                  cancelText='Cancel'
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                              </Col>
                            </Row>
                          </div>
                        ))
                    ) : (
                      <div style={{ textAlign: 'center', marginTop: 100 }}>
                        <Text type="secondary">No reminders found for this search.</Text>
                      </div>
                    )}
                  </div>
                </Col>

                {/* RIGHT COLUMN: STICKY CREATION FORM */}

              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="lead-details-modal">
                <UserOutlined />
                <span className='tab-label'>Profile</span>
              </span>
            }
            key='profile'
          >
            {/* The fix for scrolling: Added a defined height/max-height and relative positioning */}
            <div style={{
              height: "calc(100vh - 250px)", // Adjust this value based on your Modal height
              overflowY: "auto",
              padding: "20px",
            }}>
              <Row gutter={[16, 16]}>

                {/* 1. BASIC INFORMATION - MODERN CARD */}
                <Col xs={24} sm={12}>
                  <div style={{
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    height: "100%",
                    border: "1px solid #bababe",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                      <UserOutlined style={{ fontSize: "18px", color: "var(--primary)", marginRight: "10px" }} />
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>Basic Information</span>
                    </div>
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      <DetailItem label='Name' value={selectedLead?.name} compact />
                      <DetailItem label='Company' value={selectedLead?.company} compact />
                      <DetailItem label='Email' value={selectedLead?.email} compact />
                      <DetailItem
                        label='Mobile'
                        value={selectedLead?.countryCode ? `+${selectedLead.countryCode} ${selectedLead.mobile || ""}` : selectedLead?.mobile}
                        compact
                      />
                      <DetailItem label='Website' value={selectedLead?.website} isLink compact />

                    </Space>
                  </div>
                </Col>

                {/* 2. LEAD DETAILS - MODERN CARD */}
                <Col xs={24} sm={12}>
                  <div style={{
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    height: "100%",
                    border: "1px solid #bababe",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                      <SolutionOutlined style={{ fontSize: "18px", color: "var(--primary)", marginRight: "10px" }} />
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>Lead Details</span>
                    </div>
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      <DetailItem
                        label='Created At'
                        value={selectedLead?.createdAt ? moment(selectedLead.createdAt).format("YYYY-MM-DD HH:mm") : null}
                        compact
                      />
                      <DetailItem label='Source' value={selectedLead?.source || "User Initiated - Whatsapp"} compact />
                      <DetailItem label='Status' value={selectedLead?.status} compact />
                      <DetailItem label='Assigned' value={selectedLead?.assigned} compact />
                    </Space>
                  </div>
                </Col>

                {/* 3. ADDITIONAL INFORMATION - FULL WIDTH CARD */}
                <Col span={24}>
                  <div style={{
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #bababe",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                      <PushpinOutlined style={{ fontSize: "18px", color: "var(--primary)", marginRight: "10px" }} />
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>Additional Information</span>
                    </div>
                    <Row gutter={[24, 12]}>
                      <Col xs={24} sm={12}>
                        <DetailItem label='Description' value={selectedLead?.description} isParagraph compact />
                      </Col>
                    </Row>
                  </div>
                </Col>

                {/* 4. CUSTOM FIELDS - FULL WIDTH CARD */}
                {customFields.length > 0 && (
                  <Col span={24}>
                    <div style={{
                      padding: "20px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}>
                      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "16px", color: "#434343" }}>Custom Fields</div>
                      <Row gutter={[16, 12]}>
                        {customFields.map(field => (
                          <Col xs={24} sm={12} key={field.key}>
                            <DetailItem label={field.name} value={field.value} compact />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Col>
                )}

                {/* 5. DESCRIPTION HISTORY - FULL WIDTH CARD */}
                <Col span={24}>
                  <div style={{
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #bababe",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <BookOutlined style={{ fontSize: "18px", color: "var(--primary)", marginRight: "10px" }} />
                        <span style={{ fontWeight: 600, fontSize: "15px" }}>Description History</span>
                      </div>
                      <Tooltip title='Download History'>
                        <Button
                          type="text"
                          shape="circle"
                          icon={<DownloadOutlined style={{ color: "var(--primary)" }} />}
                          onClick={() => {
                            if (!descriptionHistory || descriptionHistory.length === 0) {
                              message.warning("No records available to download");
                              return;
                            }
                            // ... Your existing CSV logic ...
                          }}
                        />
                      </Tooltip>
                    </div>

                    <Table
                      className="reminders-table leads-performance-table"
                      columns={descriptionColumns}
                      dataSource={descriptionHistory}
                      rowKey='id'
                      pagination={false}
                      scroll={{ y: 150 }}
                      size='small'
                      bordered={false}
                    />
                  </div>
                </Col>

              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="lead-details-modal">
                <SendOutlined />
                <span className='tab-label'>Send Template</span>
              </span>
            }
            key='sendTemplate'
          >
            <SendTemplate
              selectedLead={selectedLead}
              allTemplates={allTemplates}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              formData={formData}
              setFormData={setFormData}
              templateVariables={templateVariables}
              setTemplateVariables={setTemplateVariables}
              fileList={fileList}
              setFileList={setFileList}
              handleFormSubmit={handleFormSubmit}
              handleReset={handleReset}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="lead-details-modal">
                <FileTextOutlined />
                <span className='tab-label'>Notes</span>
              </span>
            }
            key='notes'
          >
            <div
              style={{
                padding: "24px",
                minWidth: 600,
                height: "calc(100vh - 250px)", // Adjusted to fit modal viewport
                overflowY: "auto",
              }}
            >
              {/* Enhanced Add Note Section */}
              <div
                style={{
                  marginTop: "0px", // Removed negative margin for better alignment
                  padding: 16,
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  border: "1px solid #bababe",
                  marginBottom: 24, // Added bottom margin to separate from list
                }}
              >
                <Title level={5} style={{ marginBottom: 6 }}>
                  Add New Note
                </Title>

                {/* Note Type Selection */}
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Select Note Type:
                  </Text>
                  <Radio.Group
                    value={selectedNoteType}
                    onChange={(e) => handleNoteTypeChange(e.target.value)}
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

                {/* Conditional Note Input based on type */}
                {selectedNoteType === "text" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <TextArea
                        rows={3}
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder='Enter your note here...'
                        style={{ flex: 1, borderRadius: 8 }}
                      />
                      <Button
                        className='btn-primary'
                        onClick={() => addNote("text")}
                        disabled={!currentNote.trim()}
                        style={{ alignSelf: "flex-end", borderRadius: 8 }}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}

                {selectedNoteType === "audio" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ display: "block", marginBottom: 8 }}>
                        Choose Audio Option:
                      </Text>
                      <Radio.Group
                        value={audioInputType}
                        onChange={(e) => setAudioInputType(e.target.value)}
                        style={{ marginBottom: 16 }}
                      >
                        <Radio value='record'>Record Audio</Radio>
                        <Radio value='upload'>Upload Audio File</Radio>
                      </Radio.Group>
                    </div>

                    {audioInputType === "record" && (
                      <Space>
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
                                const audio = new Audio(URL.createObjectURL(audioBlob));
                                audio.play();
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              className='btn-primary'
                              style={{ borderRadius: 8, color: "white" }}
                              onClick={() => addNote("audio")}
                            >
                              Add Audio Note
                            </Button>
                          </>
                        )}
                      </Space>
                    )}

                    {audioInputType === "upload" && (
                      <div>
                        <Upload
                          accept='audio/mp3,audio/wav,audio/aac,audio/ogg,audio/m4a,audio/flac,audio/wma'
                          listType='picture'
                          fileList={audioFiles}
                          maxCount={1}
                          onChange={handleAudioUpload}
                          multiple={false}
                          beforeUpload={(file) => {
                            setAudioFiles([]);
                            if (!validateAudioFileType(file)) {
                              message.error(`${file.name} is not a supported audio format`);
                              return Upload.LIST_IGNORE;
                            }
                            const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
                            if (file.size > MAX_AUDIO_SIZE) {
                              message.error(`${file.name} exceeds 10MB limit`);
                              return Upload.LIST_IGNORE;
                            }
                            return true;
                          }}
                          customRequest={async (options) => {
                            const { file, onSuccess } = options;
                            setTimeout(() => {
                              const url = URL.createObjectURL(file);
                              onSuccess({ url }, file);
                            }, 1000);
                          }}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            style={{
                              width: "190px",
                              borderRadius: "10px",
                              backgroundColor: "var(--primary)",
                              color: "#fff",
                            }}
                          >
                            Upload Audio File
                          </Button>
                        </Upload>

                        {audioFiles.length > 0 && (
                          <Button
                            className='btn-primary'
                            style={{ borderRadius: 8, color: "white", marginTop: 8 }}
                            onClick={() => addNote("audio")}
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
                      beforeUpload={(file) => {
                        setMediaFiles([]);
                        if (!validateFileType(file, selectedNoteType)) return Upload.LIST_IGNORE;
                        if (selectedNoteType === "image" && file.size > MAX_IMAGE_SIZE) {
                          message.error(`${file.name} exceeds 2MB limit`);
                          return Upload.LIST_IGNORE;
                        }
                        if (selectedNoteType === "video" && file.size > MAX_VIDEO_SIZE) {
                          message.error(`${file.name} exceeds 5MB limit`);
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      }}
                      customRequest={async (options) => {
                        const { file, onSuccess } = options;
                        setTimeout(() => {
                          const url = URL.createObjectURL(file);
                          onSuccess({ url }, file);
                        }, 1000);
                      }}
                    >
                      {mediaFiles.length >= 1 ? null : (
                        <div>
                          {selectedNoteType === "image" ? <CameraOutlined /> : <VideoCameraOutlined />}
                          <div style={{ marginTop: 8 }}>Upload {selectedNoteType}</div>
                        </div>
                      )}
                    </Upload>

                    {mediaFiles.length > 0 && (
                      <Button
                        className='btn-primary'
                        style={{ borderRadius: 8, color: "white" }}
                        onClick={() => addNote(selectedNoteType)}
                      >
                        Add {selectedNoteType.charAt(0).toUpperCase() + selectedNoteType.slice(1)} Note
                      </Button>
                    )}
                  </div>
                )}

                {selectedNoteType === "document" && (
                  <div style={{ marginBottom: 16 }}>
                    <Upload
                      accept='.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx'
                      listType='picture'
                      fileList={mediaFiles}
                      onChange={handleMediaUpload}
                      multiple={false}
                      maxCount={1}
                      beforeUpload={(file) => {
                        setMediaFiles([]);
                        if (!validateDocumentType(file)) return Upload.LIST_IGNORE;
                        if (file.size > MAX_DOCUMENT_SIZE) {
                          message.error(`${file.name} exceeds 10MB limit`);
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      }}
                      customRequest={async (options) => {
                        const { file, onSuccess } = options;
                        setTimeout(() => {
                          const url = URL.createObjectURL(file);
                          onSuccess({ url }, file);
                        }, 1000);
                      }}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          width: "250px",
                          borderRadius: "10px",
                          backgroundColor: "var(--primary)",
                          color: "#fff",
                        }}
                      >
                        Upload Document
                      </Button>
                    </Upload>

                    {mediaFiles.length > 0 && (
                      <Button
                        className='btn-primary'
                        onClick={() => addNote(selectedNoteType)}
                        style={{ borderRadius: 8, color: "white", marginTop: 8 }}
                      >
                        Add Document Note
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Notes List Section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    <PushpinOutlined style={{ color: "var(--primary)", marginRight: "8px" }} />
                    All Notes ({allNotes.length})
                  </Title>
                  {allNotes.length > 0 && (
                    <Popconfirm
                      title='Are you sure to clear all notes?'
                      onConfirm={clearNotes}
                      okText='Yes'
                      cancelText='No'
                    >
                      <Tooltip title='Click to clear all notes'>
                        <Button className="btn-secondary" style={{ borderRadius: "10px" }}>
                          Clear All Notes
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  )}
                </div>

                <Table
                  className='reminders-table leads-performance-table'
                  columns={notesColumns}
                  dataSource={allNotes.sort((a, b) => b.timestamp - a.timestamp)}
                  rowKey='id'
                  locale={{ emptyText: "No notes found" }}
                  pagination={false} // Since we have inner scroll, pagination might be redundant
                  size='middle'
                />
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="lead-details-modal">
                <HistoryOutlined />
                <span className='tab-label'>Activity Logs</span>
              </span>
            }
            key='auditLogs'
          >
            <div
              style={{
                padding: "24px",
                minWidth: 600,
                height: "100%",
                overflowY: "auto",
              }}
            >
              <Title level={4} style={{ marginBottom: 24 }}>
                Lead Activity History ({auditLogs.length})
              </Title>

              <Tabs defaultActiveKey='timeline' style={{ height: "100%" }}>
                {/* Timeline Tab */}
                <TabPane
                  tab={
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      <ClockCircleOutlined style={{ marginRight: "5px", fontSize: "16px", fontWeight: "600" }} />
                      Timeline View
                    </span>
                  }
                  key='timeline'
                >
                  <Card
                    size='small'
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      border: "none",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Timeline>
                      {[...auditLogs].reverse().map(log => {
                        const isFieldChange =
                          log.metadata &&
                          log.metadata.oldValue !== undefined &&
                          log.metadata.newValue !== undefined;

                        const isNote =
                          log.action?.includes("note") &&
                          log.metadata &&
                          (log.metadata.contentPreview ||
                            log.metadata.noteType);

                        const isReminder =
                          log.action?.includes("reminder") &&
                          log.metadata &&
                          (log.metadata.dueDate || log.metadata.notes);

                        const isMediaUpload =
                          log.action?.includes("note_added") &&
                          log.metadata &&
                          log.metadata.noteType &&
                          ["image", "video", "audio"].includes(
                            log.metadata.noteType
                          );

                        return (
                          <Timeline.Item
                            key={log._id || log.id}
                            color={
                              log.action === "lead_created"
                                ? "green"
                                : log.action.includes("delete")
                                  ? "red"
                                  : log.action.includes("add")
                                    ? "blue"
                                    : "gray"
                            }
                            style={{ paddingBottom: "16px" }}
                          >
                            <div style={{ marginLeft: "12px" }}>
                              {/* Summary */}
                              <span
                                style={{
                                  fontWeight: 500,
                                  marginBottom: "4px",
                                  fontSize: "14px",
                                }}
                              >
                                {log.description}
                              </span>

                              {/* User + Date */}
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "rgba(0, 0, 0, 0.45)",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom:
                                    isFieldChange ||
                                      isNote ||
                                      isReminder ||
                                      isMediaUpload
                                      ? "6px"
                                      : "0",
                                }}
                              >
                                <span>{log.user}</span>
                                <span>
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>

                              {/* Field change details */}
                              {isFieldChange && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "field",
                                      label: "View Details",
                                      children: (
                                        <Table
                                          className="reminders-table leads-performance-table"
                                          size='small'
                                          pagination={false}
                                          columns={[
                                            {
                                              title: "Field",
                                              dataIndex: "field",
                                              key: "field",
                                            },
                                            {
                                              title: "Old Value",
                                              dataIndex: "oldValue",
                                              key: "oldValue",
                                            },
                                            {
                                              title: "Updated Value",
                                              dataIndex: "newValue",
                                              key: "newValue",
                                            },
                                          ]}
                                          dataSource={[
                                            {
                                              key: log._id,
                                              field: log.metadata.field,
                                              oldValue: formatValue(
                                                log.metadata.oldValue
                                              ),
                                              newValue: formatValue(
                                                log.metadata.newValue
                                              ),
                                            },
                                          ]}
                                        />
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* Note details */}
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
                                            <strong>Type:</strong>{" "}
                                            {log.metadata.noteType}
                                          </p>

                                          {log.metadata.contentPreview &&
                                            log.metadata.noteType ===
                                            "text" && (
                                              <p>
                                                <strong>Content:</strong>{" "}
                                                {log.metadata.contentPreview}
                                              </p>
                                            )}

                                          {log.metadata.noteType === "image" &&
                                            log.metadata.mediaData && (
                                              <div>
                                                <strong>Image:</strong>
                                                <div style={{ marginTop: 8 }}>
                                                  <Image.PreviewGroup>
                                                    {log.metadata.mediaData.map(
                                                      (media, index) => (
                                                        <Image
                                                          key={index}
                                                          width={80}
                                                          height={60}
                                                          src={media.url}
                                                          style={{
                                                            marginRight: 8,
                                                            objectFit: "cover",
                                                            borderRadius: 4,
                                                          }}
                                                          alt={media.name}
                                                        />
                                                      )
                                                    )}
                                                  </Image.PreviewGroup>
                                                </div>
                                              </div>
                                            )}

                                          {log.metadata.noteType === "video" &&
                                            log.metadata.mediaData && (
                                              <div>
                                                <strong>Video:</strong>
                                                <div style={{ marginTop: 8 }}>
                                                  {log.metadata.mediaData.map(
                                                    (media, index) => (
                                                      <div
                                                        key={index}
                                                        style={{
                                                          marginBottom: 8,
                                                        }}
                                                      >
                                                        <video
                                                          width={120}
                                                          height={80}
                                                          controls
                                                          style={{
                                                            borderRadius: 4,
                                                            backgroundColor:
                                                              "#f0f0f0",
                                                          }}
                                                        >
                                                          <source
                                                            src={media.url}
                                                            type={media.type}
                                                          />
                                                          Your browser does not
                                                          support the video tag.
                                                        </video>
                                                        <div
                                                          style={{
                                                            fontSize: "11px",
                                                            color: "#666",
                                                          }}
                                                        >
                                                          {media.name}
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {log.metadata.noteType ===
                                            "document" &&
                                            log.metadata.mediaData && (
                                              <div>
                                                <strong>Document:</strong>
                                                <div style={{ marginTop: 8 }}>
                                                  {log.metadata.mediaData.map(
                                                    (media, index) => (
                                                      <div
                                                        key={index}
                                                        style={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: "8px",
                                                          padding: "8px",
                                                          border:
                                                            "1px solid #d9d9d9",
                                                          borderRadius: "6px",
                                                          marginBottom: "4px",
                                                          backgroundColor:
                                                            "#fafafa",
                                                        }}
                                                      >
                                                        {getDocumentIcon(
                                                          media.name
                                                        )}
                                                        <div
                                                          style={{ flex: 1 }}
                                                        >
                                                          <Text
                                                            strong
                                                            style={{
                                                              fontSize: "12px",
                                                              display: "block",
                                                            }}
                                                          >
                                                            {media.name}
                                                          </Text>
                                                        </div>
                                                        <Tooltip title='Click to Download'>
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
                                                            size='small'
                                                            icon={
                                                              <DownloadOutlined />
                                                            }
                                                            onClick={() =>
                                                              window.open(
                                                                media.url,
                                                                "_blank"
                                                              )
                                                            }
                                                          >
                                                            Download
                                                          </Button>
                                                        </Tooltip>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {log.metadata.noteType ===
                                            "audio" && (
                                              <div>
                                                <strong>Audio:</strong>
                                                <div style={{ marginTop: 8 }}>
                                                  {log.metadata.audioSource ===
                                                    "record" &&
                                                    log.metadata.audioData
                                                      ?.fileUrl && (
                                                      <div>
                                                        <audio
                                                          controls
                                                          style={{
                                                            width: "50%",
                                                            marginBottom: 8,
                                                          }}
                                                        >
                                                          <source
                                                            src={
                                                              log.metadata
                                                                .audioData.fileUrl
                                                            }
                                                            type='audio/wav'
                                                          />
                                                          Your browser does not
                                                          support the audio
                                                          element.
                                                        </audio>
                                                        <div
                                                          style={{
                                                            fontSize: "11px",
                                                            color: "#666",
                                                          }}
                                                        >
                                                          Recorded audio
                                                        </div>
                                                      </div>
                                                    )}

                                                  {log.metadata.audioSource ===
                                                    "upload" &&
                                                    Array.isArray(
                                                      log.metadata.mediaData
                                                    ) &&
                                                    log.metadata.mediaData.map(
                                                      (media, index) => (
                                                        <div key={index}>
                                                          <audio
                                                            controls
                                                            style={{
                                                              width: "50%",
                                                              marginBottom: 8,
                                                            }}
                                                          >
                                                            <source
                                                              src={media.url}
                                                              type={
                                                                media.type ||
                                                                "audio/mpeg"
                                                              }
                                                            />
                                                            Your browser does not
                                                            support the audio
                                                            element.
                                                          </audio>
                                                          <div
                                                            style={{
                                                              fontSize: "11px",
                                                              color: "#666",
                                                            }}
                                                          >
                                                            {media.name}
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* Reminder details */}
                              {isReminder && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "reminder",
                                      label: "View Details",
                                      children: (
                                        <div style={{ fontSize: "13px" }}>
                                          <p>
                                            <strong>Reminder To:</strong>{" "}
                                            {log.metadata.to}
                                          </p>
                                          <p>
                                            <strong>Reminder Date:</strong>{" "}
                                            {log.metadata.dueDate}
                                          </p>
                                          {log.metadata.notes && (
                                            <p>
                                              <strong>Notes:</strong>{" "}
                                              {log.metadata.notes}
                                            </p>
                                          )}
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
                </TabPane>
              </Tabs>
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt='preview' style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Compose Modal */}
      <ComposeModals
        modelopen={composeModalOpen}
        data={allTemplates || []}
        setModelOpen={setComposeModalOpen}
        handleTemplateSelect={handleSelectTemplate}
      />
    </>
  );
};

// Helper component for displaying detail items
const DetailItem = ({ label, value, isLink = false, isParagraph = false }) => {
  if (!value) return null;

  return (
    <div className='detail-item' style={{ marginBottom: 12, display: "flex" }}>
      <Text
        strong
        className='detail-label'
        style={{ minWidth: "100px", marginRight: "8px" }}
      >
        {label}:
      </Text>
      <div className='detail-value' style={{ flex: 1 }}>
        {isParagraph ? (
          <Text>{value}</Text>
        ) : isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {value}
          </a>
        ) : (
          <Text>{value}</Text>
        )}
      </div>
      <style>{`
  .custom-select .ant-select-selector {
    border-radius: 8px !important;
  }
    .custom-date .ant-picker {
  border-radius: 8px !important;
}
`}</style>
    </div>
  );
};

export default ReminderModal;