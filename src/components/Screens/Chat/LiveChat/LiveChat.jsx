import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Filter, Search } from "feather-icons-react";
import chatUser from "../../../../assets/images/chat/1.png";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import EmojiPicker from "emoji-picker-react";
import "./../Chat.css";
import ChatSidebar from "../Modules/ChatSidebar";
import SendTemplateModal from "../Modules/SendTemplateModal";
import { useSnackbar } from "notistack";
import FileUploadModal from "../Modules/FileUploadModal";
import QuickReplyModal from "../Modules/QuickReplyModal";

// ⭐️ NEW COMPONENT: Highlight the search term within the message content
const HighlightSearchTerm = ({ content, searchTerm, isCurrentMatch }) => {
  if (!searchTerm) {
    return <p className="mb-3">{content}</p>;
  }

  // Escape special characters for regex
  const escapedSearchTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Create a global, case-insensitive regex to split the string
  const parts = content.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));

  return (
    <p className="mb-3">
      {parts.map((part, index) => {
        // Check if the part matches the search term (case-insensitive)
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();

        return isMatch ? (
          <span
            key={index}
            className={`message-highlight-text ${isCurrentMatch ? 'current-highlight' : ''}`}
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </p>
  );
};

const LiveChat = () => {
  const [text, setText] = useState("");
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeChat, setActiveChat] = useState(0);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [currentFileType, setCurrentFileType] = useState("");
  const [quickReplyModalOpen, setQuickReplyModalOpen] = useState(false);
  const [isIntervened, setIsIntervened] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({
    statusDetails: false,
    activeSessions: false,
    payments: false,
    catalogs: false,
    customerJourney: false,
    tags: false,
    notes: false,
  });

  // ⭐️ STATES FOR MESSAGE SEARCH FUNCTIONALITY
  const [messageSearch, setMessageSearch] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  const attachmentRef = useRef(null);
  const emojiRef = useRef(null);
  const filterRef = useRef(null);
  const messageListRef = useRef(null); // Ref for message list container
  const { enqueueSnackbar } = useSnackbar();

  const chatData = [
    {
      id: 0,
      phone: "919894772827",
      lastMessage: "hey! there I'm...",
      time: "12:30 PM",
      unread: 8,
      needsIntervention: true,
      messages: [
        {
          type: "left",
          content: "Hi! I need help with my order",
          time: "12:20 PM",
        },
        {
          type: "right",
          content: "Hello! I'd be happy to help you with that.",
          time: "12:21 PM",
        },
        {
          type: "left",
          content: "Great! When will my order arrive?",
          time: "12:30 PM",
        },
        {
          type: "left",
          content: "Hi! I need help with my order",
          time: "12:20 PM",
        },
        {
          type: "right",
          content: "Hello! I'd be happy to help you with that.",
          time: "12:21 PM",
        },
        {
          type: "left",
          content: "Great! When will my order arrive?",
          time: "12:30 PM",
        },
        {
          type: "left",
          content: "Hi! I need help with my order",
          time: "12:20 PM",
        },
        {
          type: "right",
          content: "Hello! I'd be happy to help you with that.",
          time: "12:21 PM",
        },
        {
          type: "left",
          content: "Great! When will my order arrive?",
          time: "12:30 PM",
        },
      ],
    },
    {
      id: 1,
      phone: "919876543210",
      lastMessage: "Thank you so much!",
      time: "11:45 AM",
      unread: 0,
      needsIntervention: false,
      messages: [
        {
          type: "left",
          content: "Is this product available in blue?",
          time: "11:30 AM",
        },
        {
          type: "right",
          content: "Yes, we have it in blue color. Would you like to order?",
          time: "11:35 AM",
        },
        {
          type: "left",
          content: "Thank you so much!",
          time: "11:45 AM",
        },
        {
          type: "left",
          content: "Is this product available in blue?",
          time: "11:30 AM",
        },
        {
          type: "right",
          content: "Yes, we have it in blue color. Would you like to order?",
          time: "11:35 AM",
        },
        {
          type: "left",
          content: "Thank you so much!",
          time: "11:45 AM",
        },
        {
          type: "left",
          content: "Is this product available in blue?",
          time: "11:30 AM",
        },
        {
          type: "right",
          content: "Yes, we have it in blue color. Would you like to order?",
          time: "11:35 AM",
        },
        {
          type: "left",
          content: "Thank you so much!",
          time: "11:45 AM",
        },
      ],
    },
    {
      id: 2,
      phone: "919632587410",
      lastMessage: "Can I get a discount?",
      time: "10:15 AM",
      unread: 3,
      needsIntervention: true,
      messages: [
        {
          type: "left",
          content: "I'm interested in buying bulk quantity",
          time: "10:10 AM",
        },
        {
          type: "right",
          content: "That's great! We offer special prices for bulk orders.",
          time: "10:12 AM",
        },
        {
          type: "left",
          content: "Can I get a discount?",
          time: "10:15 AM",
        },
        {
          type: "left",
          content: "I'm interested in buying bulk quantity",
          time: "10:10 AM",
        },
        {
          type: "right",
          content: "That's great! We offer special prices for bulk orders.",
          time: "10:12 AM",
        },
        {
          type: "left",
          content: "Can I get a discount?",
          time: "10:15 AM",
        },
        {
          type: "left",
          content: "I'm interested in buying bulk quantity",
          time: "10:10 AM",
        },
        {
          type: "right",
          content: "That's great! We offer special prices for bulk orders.",
          time: "10:12 AM",
        },
        {
          type: "left",
          content: "Can I get a discount?",
          time: "10:15 AM",
        },
      ],
    },
  ];

  // File size validation constants
  const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024,
    audio: 5 * 1024 * 1024,
    video: 16 * 1024 * 1024,
    document: 16 * 1024 * 1024,
  };

  // File type validation
  const ALLOWED_FILE_TYPES = {
    image: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    },
    audio: {
      extensions: ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'],
      mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/aac', 'audio/mp4', 'audio/flac']
    },
    video: {
      extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'],
      mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/webm']
    },
    document: {
      extensions: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'],
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
    }
  };

  // Map UI label to internal file type key
  const mapFileTypeToKey = (label) => {
    const mapping = {
      'Picture': 'image',
      'Document': 'document',
      'Video': 'video',
      'Audio': 'audio'
    };
    return mapping[label] || label.toLowerCase();
  };

  // Get current active chat
  const currentChat = chatData[activeChat];

  // Close popups when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachmentRef.current && !attachmentRef.current.contains(e.target)) {
        setAttachmentOpen(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [attachmentRef, emojiRef, filterRef]);

  // Reset intervention state when chat changes
  useEffect(() => {
    setIsIntervened(false);
    setMessageSearch(""); // Clear search when switching chats
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
  }, [activeChat]);

  // ⭐️ Logic to find matches and update states when messageSearch changes
  useEffect(() => {
    if (!messageSearch || messageSearch.length < 2) {
      if (searchMatches.length > 0) {
        setSearchMatches([]);
        setCurrentMatchIndex(-1);
      }
      return;
    }

    const searchStr = messageSearch.toLowerCase();
    const newMatches = currentChat.messages
      .map((message, index) => ({
        index: index,
        content: message.content,
      }))
      .filter((match) => match.content.toLowerCase().includes(searchStr));

    // Only update if matches actually changed
    if (JSON.stringify(newMatches) !== JSON.stringify(searchMatches)) {
      setSearchMatches(newMatches);
      setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
    }
  }, [messageSearch, activeChat, currentChat.messages, searchMatches]);

  // ⭐️ Function to scroll to the current highlighted message
  const scrollToMatch = useCallback((indexToScroll) => {
    if (messageListRef.current && indexToScroll !== -1 && searchMatches.length > 0) {
      const targetIndex = searchMatches[indexToScroll].index;
      const messages = messageListRef.current.querySelectorAll('.chat-single-message');
      const targetMessage = messages[targetIndex];

      if (targetMessage) {
        // Only scroll if not already in view
        const container = messageListRef.current;
        const messageTop = targetMessage.offsetTop;
        const messageBottom = messageTop + targetMessage.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        if (messageTop < containerTop || messageBottom > containerBottom) {
          container.scrollTop = targetMessage.offsetTop - 50;
        }
      }
    }
  }, [searchMatches]);

  // ⭐️ Scroll when currentMatchIndex changes
  useEffect(() => {
    if (currentMatchIndex !== -1) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex]);

  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      selectedFiles.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
        if (file.audioUrl) URL.revokeObjectURL(file.audioUrl);
      });
    };
  }, []);

  // ⭐️ Handler for next/up arrow (moves UP the list, i.e., to LATER messages)
  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    setCurrentMatchIndex((prevIndex) => {
      // Moves forward in the array (later message)
      const nextIndex = (prevIndex + 1) % searchMatches.length;
      return nextIndex;
    });
  };

  // ⭐️ Handler for previous/down arrow (moves DOWN the list, i.e., to EARLIER messages)
  const handlePreviousMatch = () => {
    if (searchMatches.length === 0) return;
    setCurrentMatchIndex((prevIndex) => {
      // Logic for circular array navigation: (prev - 1 + length) % length
      const prevIndexCalculated = (prevIndex - 1 + searchMatches.length) % searchMatches.length;
      return prevIndexCalculated;
    });
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setFilterOpen(false);
  };

  // Handle chat selection
  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
  };

  // Handle Intervene button click
  const handleIntervene = () => {
    setIsIntervened(true);
    enqueueSnackbar('You can now send messages to this chat', {
      variant: 'success',
      autoHideDuration: 2000
    });
  };

  // Handle Close button click
  const handleClose = () => {
    setIsIntervened(false);
    setText("");
    setSelectedFiles([]);
    setAttachmentOpen(false);
    setEmojiOpen(false);
    enqueueSnackbar('Intervention ended', {
      variant: 'info',
      autoHideDuration: 2000
    });
  };

  // Validate file
  const validateFile = useCallback((file, fileType) => {
    if (!file || !fileType) {
      console.error('File or fileType is undefined:', { file, fileType });
      return false;
    }

    const fileTypeKey = fileType.toLowerCase();
    const maxSize = FILE_SIZE_LIMITS[fileTypeKey];
    const allowedTypes = ALLOWED_FILE_TYPES[fileTypeKey];

    if (!allowedTypes) {
      console.error('No allowed types found for file type:', fileType);
      enqueueSnackbar(`Invalid file type: ${fileType}`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return false;
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      enqueueSnackbar(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} size should be less than ${maxSizeMB}MB`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return false;
    }

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidMimeType = allowedTypes.mimeTypes.includes(file.type.toLowerCase());
    const isValidExtension = allowedTypes.extensions.includes(fileExtension.toLowerCase());

    if (!isValidMimeType && !isValidExtension) {
      enqueueSnackbar(`Invalid ${fileType} file type. Allowed: ${allowedTypes.extensions.join(', ')}`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return false;
    }

    return true;
  }, [enqueueSnackbar]);

  // Updated attachment options with audio
  const attachmentOptions = [
    { icon: "mdi:file-document-outline", color: "var(--primary)", label: "Document" },
    { icon: "mdi:image-outline", color: "var(--primary)", label: "Picture" },
    { icon: "mdi:play-circle-outline", color: "var(--primary)", label: "Video" },
    { icon: "mdi:microphone-outline", color: "var(--primary)", label: "Audio" },
    { icon: "tabler:template", color: "var(--primary)", label: "Template" },
    { icon: "mdi:clock-outline", color: "var(--primary)", label: "Quick Reply" },
  ];

  // Filter options
  const filterOptions = ["Unread", "Read", "Intervened", "Agents", "All"];

  // ✅ FIXED: Handle template send from modal
  const handleTemplateSend = (templateData) => {
    console.log('Template data received:', templateData);

    if (templateData && templateData.processedMessage) {
      setText(templateData.processedMessage);
      enqueueSnackbar('Template added to message', {
        variant: 'success',
        autoHideDuration: 2000
      });
    } else {
      enqueueSnackbar('Error loading template', {
        variant: 'error',
        autoHideDuration: 2000
      });
    }
  };

  // Handle file upload from modal
  const handleFileUpload = (files, caption = "") => {
    if (files && files.length > 0) {
      const fileTypeKey = mapFileTypeToKey(currentFileType);

      const validFiles = files.filter(file => {
        if (!file) {
          console.error('Undefined file found in files array');
          return false;
        }
        return validateFile(file, fileTypeKey);
      });

      if (validFiles.length > 0) {
        console.log(`Selected ${currentFileType}:`, validFiles);

        const newFiles = validFiles.map((file) => ({
          file,
          type: currentFileType,
          name: file.name,
          size: file.size,
          caption: caption,
          preview: currentFileType === "Picture" ? URL.createObjectURL(file) : null,
          audioUrl: currentFileType === "Audio" ? URL.createObjectURL(file) : null,
        }));

        setSelectedFiles((prev) => [...prev, ...newFiles]);

        const fileNames = validFiles.map((f) => f.name).join(", ");
        enqueueSnackbar(`Added ${validFiles.length} ${currentFileType}(s) to message`, {
          variant: 'success',
          autoHideDuration: 2000
        });
      }
    }
    setFileUploadModalOpen(false);
  };

  // Handle quick reply selection
  const handleQuickReplySelect = (templateContent) => {
    setText(templateContent);
    enqueueSnackbar('Quick reply added to message', {
      variant: 'success',
      autoHideDuration: 2000
    });
  };

  // Open file upload modal
  const openFileUploadModal = (fileType) => {
    setCurrentFileType(fileType);
    setFileUploadModalOpen(true);
    setAttachmentOpen(false);
  };

  // Attachment option component
  const AttachmentItem = ({ icon, label, color }) => {
    const handleAttachmentClick = () => {
      switch (label.toLowerCase()) {
        case "template":
          setTemplateModalOpen(true);
          setAttachmentOpen(false);
          break;
        case "quick reply":
          setQuickReplyModalOpen(true);
          setAttachmentOpen(false);
          break;
        default:
          openFileUploadModal(label);
      }
    };

    return (
      <div className="attachment-item" onClick={handleAttachmentClick}>
        <div
          className="attachment-icon"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon icon={icon} color={color} width="20" height="20" />
        </div>
        <span className="attachment-label">{label}</span>
      </div>
    );
  };

  // Add emoji to text
  const onEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  // Submit message with files
  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && selectedFiles.length === 0) return;

    console.log("Send message:", text);
    console.log("Files to upload:", selectedFiles);

    if (selectedFiles.length > 0) {
      enqueueSnackbar(`Message sent with ${selectedFiles.length} file(s)!`, {
        variant: 'success',
        autoHideDuration: 3000
      });
    } else {
      enqueueSnackbar("Message sent!", {
        variant: 'success',
        autoHideDuration: 2000
      });
    }

    setText("");
    setSelectedFiles([]);
  };

  // Remove selected file
  const removeFile = (index) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    if (fileToRemove.audioUrl) {
      URL.revokeObjectURL(fileToRemove.audioUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const AccordionItem = ({ title, isOpen, onToggle, children }) => (
    <div className="accordion-item">
      <div className="accordion-header" onClick={onToggle}>
        <h6 className="accordion-title">{title}</h6>
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="accordion-icon"
        />
      </div>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );

  // Function to check if a message is the current highlighted match
  const isCurrentMatch = (messageIndex) => {
    if (currentMatchIndex === -1 || searchMatches.length === 0) return false;
    return searchMatches[currentMatchIndex].index === messageIndex;
  };

  const showInterveneButton = currentChat.needsIntervention && !isIntervened;

  return (
    <>
      <Breadcrumb title="Live Chats" />

      <div className="chat-wrapper">
        {/* Sidebar */}
        <div className="chat-sidebar card">
          <div className="chat-search">
            <span className="icon">
              <Search />
            </span>
            <input
              type="text"
              name="search"
              autoComplete="off"
              placeholder="Search or start a new chat"
            />
            <div style={{ position: "relative" }} ref={filterRef}>
              <Filter
                style={{ cursor: "pointer" }}
                onClick={() => setFilterOpen((prev) => !prev)}
              />

              {/* Filter Dropdown */}
              {filterOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "30px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    minWidth: "150px",
                    zIndex: 1000,
                    padding: "8px 0",
                  }}
                >
                  {filterOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleFilterSelect(option)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: activeFilter === option ? "var(--text-secondary)" : "#374151",
                        backgroundColor:
                          activeFilter === option ? "#eff6ff" : "transparent",
                        fontWeight: activeFilter === option ? "500" : "400",
                      }}
                      onMouseEnter={(e) => {
                        if (activeFilter !== option) {
                          e.target.style.backgroundColor = "#f9fafb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeFilter !== option) {
                          e.target.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chat-all-list">
            {chatData.map((chat) => (
              <div
                className={`chat-sidebar-single ${activeChat === chat.id ? "active" : ""
                  }`}
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="img">
                  <img src={chatUser} alt="chat_user" />
                </div>
                <div className="info">
                  <h6 className="text-sm mb-1">{chat.phone}</h6>
                  <p className="mb-0 text-xs">{chat.lastMessage}</p>
                </div>
                <div className="action text-end">
                  <p className="mb-0 text-neutral-400 text-xs lh-1">
                    {chat.time}
                  </p>
                  {chat.unread > 0 && (
                    <span className="w-16-px h-16-px text-xs rounded-circle bg-success-main text-white d-inline-flex align-items-center justify-content-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat main area */}
        <div className="chat-main card">
          <div className="chat-main-container">
            {/* Left side - Messages */}
            <div className={`chat-messages-section ${isSidebarOpen ? 'sidebar-open' : ''}`}>
              {/* Chat header (MODIFIED) */}
              <div className="chat-sidebar-single active border-bottom pb-3">
                <div className="img">
                  <img src={chatUser} alt="chat_user" />
                </div>

                {/* Chat Header Content with Search */}
                <div className="chat-header-content">
                  <div className="info">
                    <h6 className="text-md mb-0">+{currentChat.phone}</h6>
                  </div>

                  <div className="chat-header-search-container position-relative">
                    {/* Search Input */}
                    <Icon icon="ic:round-search" className="chat-header-search-icon" />
                    <input
                      type="text"
                      className="chat-header-search"
                      placeholder="Search messages"
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                      // Adjust padding based on whether search controls are visible
                      style={{ paddingRight: messageSearch ? '135px' : '10px' }}
                    />

                    {/* ⭐️ Search Controls (Count and Arrows) */}
                    {messageSearch && (
                      <div className="search-controls-wrapper">
                        {searchMatches.length > 0 && (
                          <span className="search-match-count">
                            {/* Current index is 0-based, so add 1 for display */}
                            {currentMatchIndex + 1} of {searchMatches.length}
                          </span>
                        )}
                        <button
                          className="search-control-btn"
                          onClick={handlePreviousMatch}
                          disabled={searchMatches.length < 2}
                        >
                          <Icon icon="ic:round-keyboard-arrow-up" /> {/* Up Arrow (Previous Match) */}
                        </button>
                        <button
                          className="search-control-btn"
                          onClick={handleNextMatch}
                          disabled={searchMatches.length < 2}
                        >
                          <Icon icon="ic:round-keyboard-arrow-down" /> {/* Down Arrow (Next Match) */}
                        </button>
                        <button
                          className="search-control-btn"
                          onClick={() => setMessageSearch("")}
                        >
                          <Icon icon="ic:round-close" /> {/* Close Search */}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* END Chat Header Content with Search */}

                <div className="action d-inline-flex align-items-center gap-3">
                  <div className="btn-group">
                    <button
                      style={{ marginTop: "-15px" }}
                      type="button"
                      className="text-primary-light text-xl"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <Icon icon="tabler:dots-vertical" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-lg-end border">
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          type="button"
                        >
                          <Icon icon="material-symbols:download" />
                          Download Chat
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          type="button"
                        >
                          <Icon icon="entypo:block" />
                          Block & Spam
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Sidebar Toggle Icon */}
                  <button
                    type="button"
                    className="text-xl text-primary-light sidebar-toggle-btn"
                    onClick={toggleSidebar}
                  >
                    <Icon
                      style={{ fontSize: "24px" }}
                      icon="octicon:sidebar-expand-24"
                    />
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="chat-message-list" ref={messageListRef}>
                {currentChat.messages.map((message, index) => {
                  const isHighlight = isCurrentMatch(index);

                  return (
                    <div
                      key={index}
                      className={`chat-single-message ${message.type}`}
                    >
                      {message.type === "left" && (
                        <img
                          src={chatUser}
                          alt="image_icon"
                          className="avatar-lg object-fit-cover rounded-circle"
                        />
                      )}
                      <div className="chat-message-content">

                        {/* ⭐️ Using the new HighlightSearchTerm component */}
                        <HighlightSearchTerm
                          content={message.content}
                          searchTerm={messageSearch}
                          isCurrentMatch={isHighlight}
                        />

                        {message.type === "right" ? (
                          <div className="text-white chat-time d-flex align-items-center justify-content-end position-relative">
                            <span>{message.time}</span>
                            <Icon
                              className="ms-2 text-md"
                              icon="charm:tick-double"
                            />
                          </div>
                        ) : (
                          <p className="chat-time mb-0">
                            <span>{message.time}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* No Results Message */}
                {messageSearch && messageSearch.length >= 2 && searchMatches.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    <p>No messages found for "**{messageSearch}**"</p>
                  </div>
                )}
              </div>

              {/* Intervene Button Section */}
              {showInterveneButton && (
                <div className="template-initiator-container">
                  <div className="template-header">
                    <button onClick={handleIntervene} className="btn-primary gap-2">
                      Intervene <Icon style={{ fontSize: "20px" }} icon="fluent:arrow-right-12-filled" />
                    </button>
                  </div>
                </div>
              )}

              {/* Selected files preview */}
              {isIntervened && selectedFiles.length > 0 && (
                <div className="selected-files-preview">
                  <div className="files-preview-header">
                    <span className="text-sm">Selected Files:</span>
                    <button
                      type="button"
                      className="clear-all-btn"
                      onClick={() => {
                        selectedFiles.forEach(file => {
                          if (file.preview) URL.revokeObjectURL(file.preview);
                          if (file.audioUrl) URL.revokeObjectURL(file.audioUrl);
                        });
                        setSelectedFiles([]);
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="files-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="file-preview"
                          />
                        ) : file.audioUrl ? (
                          <div className="audio-preview">
                            <Icon
                              icon="mdi:music-note"
                              width="24"
                              height="24"
                              color="#8B5CF6"
                            />
                            <audio controls className="audio-player">
                              <source src={file.audioUrl} type={file.file?.type} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : (
                          <div className="file-icon">
                            <Icon
                              icon={
                                file.type === "Document"
                                  ? "mdi:file-document-outline"
                                  : file.type === "Video"
                                    ? "mdi:play-circle-outline"
                                    : file.type === "Audio"
                                      ? "mdi:microphone-outline"
                                      : "mdi:file-outline"
                              }
                              width="20"
                              height="20"
                            />
                          </div>
                        )}
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          {file.caption && (
                            <span className="file-caption">
                              Caption: {file.caption}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => removeFile(index)}
                        >
                          <Icon icon="mdi:close" width="16" height="16" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat input bar */}
              {isIntervened && (
                <form className="chat-box" onSubmit={onSubmit}>
                  <div className="left-icons">
                    {/* Emoji Button */}
                    <div className="emoji-wrapper" ref={emojiRef}>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setEmojiOpen((prev) => !prev)}
                      >
                        <Icon icon="mdi:emoji-outline" />
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
                          <div className="emoji-popup-arrow">                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attachment Button */}
                    <div className="attachment-wrapper" ref={attachmentRef}>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setAttachmentOpen((prev) => !prev)}
                      >
                        <Icon icon="ph:paperclip" />
                      </button>

                      {/* Attachment Popup Menu */}
                      {attachmentOpen && (
                        <div className="attachment-popup">
                          <div className="attachment-popup-content">
                            {attachmentOptions.map((option, index) => (
                              <AttachmentItem
                                key={index}
                                icon={option.icon}
                                color={option.color}
                                label={option.label}
                              />
                            ))}
                          </div>
                          <div className="attachment-popup-arrow"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    className="chat-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message"
                  />

                  <button className="send-btn" type="submit">
                    <Icon icon="qlementine-icons:send-16" />
                  </button>
                </form>
              )}

              {/* Close Button Section - Shows when intervened */}
              {isIntervened && (
                <div className="template-initiator-container">
                  <div className="template-header">
                    <button onClick={handleClose} className="btn-primary gap-2">
                      Close <Icon style={{ fontSize: "20px" }} icon="mdi:close" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Sidebar content */}
            <ChatSidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              accordionOpen={accordionOpen}
              toggleAccordion={toggleAccordion}
              currentChat={currentChat}
            />
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {templateModalOpen && (
        <SendTemplateModal
          onClose={() => setTemplateModalOpen(false)}
          onTemplateSend={handleTemplateSend} // ✅ FIXED: Changed from onTemplateSelect to onTemplateSend
        />
      )}

      {/* File Upload Modal */}
      {fileUploadModalOpen && (
        <FileUploadModal
          fileType={currentFileType}
          onClose={() => setFileUploadModalOpen(false)}
          onUpload={handleFileUpload}
          fileSizeLimits={FILE_SIZE_LIMITS}
          allowedFileTypes={ALLOWED_FILE_TYPES}
        />
      )}

      {/* Quick Reply Modal */}
      {quickReplyModalOpen && (
        <QuickReplyModal
          onClose={() => setQuickReplyModalOpen(false)}
          onTemplateSelect={handleQuickReplySelect}
        />
      )}
    </>
  );
};

export default LiveChat;