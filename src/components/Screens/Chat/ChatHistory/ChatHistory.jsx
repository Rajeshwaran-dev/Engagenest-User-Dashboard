import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Filter, Search } from "feather-icons-react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import "./../Chat.css";
import SendTemplateModal from "../Modules/SendTemplateModal";
import ChatSidebar from "../Modules/ChatSidebar";
import { useSnackbar } from "notistack";

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


const ChatHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeChat, setActiveChat] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState({
    statusDetails: false,
    activeSessions: false,
    payments: false,
    catalogs: false,
    customerJourney: false,
    tags: false,
    notes: false,
  });
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);

  // ⭐️ STATES FOR MESSAGE SEARCH FUNCTIONALITY
  const [messageSearch, setMessageSearch] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  const filterRef = useRef(null);
  const messageListRef = useRef(null); // Ref for message list container
  const { enqueueSnackbar } = useSnackbar();

  // --- Static Data ---
  const chatData = [
    {
      id: 0,
      phone: "919894772827",
      lastMessage: "Thank you for your help!",
      time: "12:30 PM",
      unread: 0,
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
          type: "right",
          content: "Your order will arrive tomorrow by 5 PM.",
          time: "12:31 PM",
        },
        {
          type: "left",
          content: "Thank you for your help!",
          time: "12:32 PM",
        },
      ],
    },
    {
      id: 1,
      phone: "919876543210",
      lastMessage: "I'll place the order soon",
      time: "11:45 AM",
      unread: 0,
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
          content: "Thank you! I'll place the order soon",
          time: "11:45 AM",
        },
      ],
    },
    {
      id: 2,
      phone: "919632587410",
      lastMessage: "Looking forward to it",
      time: "10:15 AM",
      unread: 0,
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
          type: "right",
          content: "Yes, we can offer 15% discount for orders above 100 units.",
          time: "10:16 AM",
        },
        {
          type: "left",
          content: "Perfect! Looking forward to it",
          time: "10:17 AM",
        },
      ],
    },
    {
      id: 3,
      phone: "919854126731",
      lastMessage: "Will check and get back",
      time: "09:20 AM",
      unread: 0,
      messages: [
        {
          type: "left",
          content: "Do you have this in stock?",
          time: "09:15 AM",
        },
        {
          type: "right",
          content: "Let me check the inventory for you.",
          time: "09:18 AM",
        },
        {
          type: "left",
          content: "Okay, will check and get back",
          time: "09:20 AM",
        },
      ],
    },
    {
      id: 4,
      phone: "919894772827",
      lastMessage: "Thank you for your help!",
      time: "12:30 PM",
      unread: 0,
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
          type: "right",
          content: "Your order will arrive tomorrow by 5 PM.",
          time: "12:31 PM",
        },
        {
          type: "left",
          content: "Thank you for your help!",
          time: "12:32 PM",
        },
      ],
    },
    {
      id: 5,
      phone: "919876543210",
      lastMessage: "I'll place the order soon",
      time: "11:45 AM",
      unread: 0,
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
          content: "Thank you! I'll place the order soon",
          time: "11:45 AM",
        },
      ],
    },
    {
      id: 6,
      phone: "919632587410",
      lastMessage: "Looking forward to it",
      time: "10:15 AM",
      unread: 0,
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
          type: "right",
          content: "Yes, we can offer 15% discount for orders above 100 units.",
          time: "10:16 AM",
        },
        {
          type: "left",
          content: "Perfect! Looking forward to it",
          time: "10:17 AM",
        },
      ],
    },
    {
      id: 7,
      phone: "919854126731",
      lastMessage: "Will check and get back",
      time: "09:20 AM",
      unread: 0,
      messages: [
        {
          type: "left",
          content: "Do you have this in stock?",
          time: "09:15 AM",
        },
        {
          type: "right",
          content: "Let me check the inventory for you.",
          time: "09:18 AM",
        },
        {
          type: "left",
          content: "Okay, will check and get back",
          time: "09:20 AM",
        },
      ],
    },
  ];
  // --- END Static Data ---


  // Get current active chat
  const currentChat = chatData[activeChat];

  // Close popups when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // useEffect(() => {
  //   return () => {
  //     // Cleanup object URLs to prevent memory leaks
  //     selectedFiles.forEach(file => {
  //       if (file.preview) URL.revokeObjectURL(file.preview);
  //       if (file.audioUrl) URL.revokeObjectURL(file.audioUrl);
  //     });
  //   };
  // }, []);

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
    setMessageSearch(""); // Clear search when switching chats
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
  };

  const handleUseTemplate = () => {
    setShowTemplateGalleryModal(true);
  };

  const handleTemplateSend = (templateData) => {
    console.log('Template data received in ChatHistory:', templateData);

    if (templateData && templateData.processedMessage) {
      enqueueSnackbar('Template message prepared successfully!', {
        variant: 'success',
        autoHideDuration: 2000
      });
      console.log('Template to send:', templateData.processedMessage);
    } else {
      enqueueSnackbar('Error loading template', {
        variant: 'error',
        autoHideDuration: 2000
      });
    }
  };

  // Filter options
  const filterOptions = ["Unread", "Read", "Intervened", "Agents", "All"];

  // Function to check if a message is the current highlighted match
  const isCurrentMatch = (messageIndex) => {
    if (currentMatchIndex === -1 || searchMatches.length === 0) return false;
    return searchMatches[currentMatchIndex].index === messageIndex;
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Past Chats" />

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
              placeholder="Search past chats"
            />
            <div style={{ position: "relative" }} ref={filterRef}>
              <Filter
                style={{ cursor: "pointer" }}
                onClick={() => setFilterOpen((prev) => !prev)}
              />

              {/* Filter Dropdown (unchanged) */}
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
            {/* Chat list (unchanged) */}
            {chatData.map((chat) => (
              <div
                className={`chat-sidebar-single ${activeChat === chat.id ? "active" : ""
                  }`}
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="img">
                  <img src="assets/images/chat/1.png" alt="chat_user" />
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
                  <img src="assets/images/chat/1.png" alt="chat_user" />
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
                          src="assets/images/chat/1.png"
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

              {/* Template Initiator for Closed Conversations */}
              <div className="template-initiator-container">
                <div className="template-header">
                  <h6>Chat Conversation Closed</h6>
                  <p>Please Send a Template to Initiate a Chat Conversation</p>
                  <button onClick={handleUseTemplate} className="btn-primary gap-2">
                    Send Template
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Sidebar content (unchanged) */}
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

      {/* Template Modal (unchanged) */}
      {showTemplateGalleryModal && (
        <SendTemplateModal
          onClose={() => setShowTemplateGalleryModal(false)}
          onTemplateSend={handleTemplateSend}
        />
      )}
    </MasterLayout>
  );
};

export default ChatHistory;