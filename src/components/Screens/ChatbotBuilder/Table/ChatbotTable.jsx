import React, { useState, useEffect } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import KeywordModal from "./../Modules/KeywordModals";
import CreateChatbot from "./../Modules/CreateChatbotModal";
import UnsubscribeModal from "./../Modules/UnsubscribeModal";
import EmptyState from "../../EmptyTables/EmptyTables";
import DeleteModal from "../Modules/DeleteModal";

const ChatbotBuilder = () => {
  const navigate = useNavigate();
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add this state
  const [selectedChatbotForKeywords, setSelectedChatbotForKeywords] = useState(null);
  const [chatbotToDelete, setChatbotToDelete] = useState(null); // Add this state

  // State for chatbots data with localStorage
  const [chatbots, setChatbots] = useState([]);

  const predefinedKeywords = ["unsubscribe", "stop", "remove", "cancel", "end"];

  // Load chatbots from localStorage on component mount
  useEffect(() => {
    const loadChatbots = () => {
      try {
        const savedChatbots = localStorage.getItem("chatbots");

        if (savedChatbots) {
          const parsedChatbots = JSON.parse(savedChatbots);
          if (Array.isArray(parsedChatbots) && parsedChatbots.length > 0) {
            setChatbots(parsedChatbots);
            return;
          }
        }

        // Start with empty array - no initial chatbot
        setChatbots([]);
        localStorage.setItem("chatbots", JSON.stringify([]));
      } catch (error) {
        console.error("Error loading chatbots from localStorage:", error);

        // Reset with empty data if there's an error
        setChatbots([]);
        localStorage.setItem("chatbots", JSON.stringify([]));
      }
    };

    loadChatbots();
  }, []);

  // Save to localStorage whenever chatbots change
  useEffect(() => {
    try {
      localStorage.setItem("chatbots", JSON.stringify(chatbots));
    } catch (error) {
      console.error("Error saving chatbots to localStorage:", error);
    }
  }, [chatbots]);

  const handleEditClick = (chatbotId) => {
    navigate("/chatbotflowbuilder", { state: { chatbotId } });
  };

  // Function to add new chatbot - No default values
  const handleCreateChatbot = (chatbotName) => {
    const newChatbot = {
      id: Date.now(), // Use timestamp as unique ID
      name: chatbotName,
      status: false, // Default to inactive
      isDefault: false, // Default to false
      keywords: [], // Empty keywords initially
      serialNo: chatbots.length + 1,
      createdAt: new Date().toISOString(),
      // You can add default flow structure here if needed
      flowData: {
        nodes: [],
        edges: [],
      },
    };

    const updatedChatbots = [...chatbots, newChatbot];
    setChatbots(updatedChatbots);
    setShowModal(false);

    console.log("New chatbot created:", newChatbot);
  };

  // Function to initiate delete process
  const handleInitiateDelete = (chatbot) => {
    setChatbotToDelete(chatbot);
    setShowDeleteModal(true);
  };

  // Function to confirm and execute deletion
  const handleConfirmDelete = () => {
    if (chatbotToDelete) {
      const updatedChatbots = chatbots.filter(
        (chatbot) => chatbot.id !== chatbotToDelete.id
      );

      // Reassign serial numbers after deletion
      const renumberedChatbots = updatedChatbots.map((chatbot, index) => ({
        ...chatbot,
        serialNo: index + 1,
      }));

      setChatbots(renumberedChatbots);
      setShowDeleteModal(false);
      setChatbotToDelete(null);
    }
  };

  // Function to toggle status
  const handleToggleStatus = (chatbotId) => {
    const updatedChatbots = chatbots.map((chatbot) =>
      chatbot.id === chatbotId
        ? { ...chatbot, status: !chatbot.status }
        : chatbot
    );
    setChatbots(updatedChatbots);
  };

  // Function to toggle default
  const handleToggleDefault = (chatbotId) => {
    const updatedChatbots = chatbots.map((chatbot) =>
      chatbot.id === chatbotId
        ? { ...chatbot, isDefault: !chatbot.isDefault }
        : chatbot
    );
    setChatbots(updatedChatbots);
  };

  // Function to open keyword modal for a specific chatbot
  const handleOpenKeywordModal = (chatbot) => {
    setSelectedChatbotForKeywords(chatbot);
    setShowKeywordModal(true);
  };

  // Function to update keywords for a specific chatbot
  const handleUpdateKeywords = (updatedKeywords) => {
    if (selectedChatbotForKeywords) {
      const updatedChatbots = chatbots.map((chatbot) =>
        chatbot.id === selectedChatbotForKeywords.id
          ? { ...chatbot, keywords: updatedKeywords }
          : chatbot
      );
      setChatbots(updatedChatbots);
    }
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Automation" />

      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 p-12">
        {/* Left Side - Search and Filters */}
        <div className="d-flex align-items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <div className="position-relative">
              <input
                style={{ width: "200px" }}
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder="Search by Name"
              />
              <Icon
                icon="eva:search-fill"
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: "18px" }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => document.getElementById("fileUpload").click()}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="mingcute:add-line"
            />
            Import Chatbot
          </button>

          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            accept=".json,.csv,.txt"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                console.log("Selected file:", file.name);
                // handle file upload logic here
              }
            }}
          />

          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="mingcute:add-line"
            />
            Create Chatbot
          </button>
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowKeyModal(true)}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="bitcoin-icons:two-keys-outline"
            />
            Unsubscribe Keys
          </button>
        </div>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">
                    <div className="form-check style-check d-flex align-items-center">
                      <label className="form-check-label">S.No.</label>
                    </div>
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Default</th>
                  <th scope="col">Key Words</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatbots.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <div style={{ textAlign: "center" }}>
                        <EmptyState />
                        <p className="empty-text">
                          No chatbots created yet. Click "Create Chatbot" to get
                          started.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  chatbots.map((chatbot) => (
                    <tr key={chatbot.id}>
                      <td>
                        <div className="form-check style-check d-flex align-items-center">
                          <label className="form-check-label">
                            {chatbot.serialNo}
                          </label>
                        </div>
                      </td>
                      <td>
                        {chatbot.name}
                      </td>
                      <td>
                        <div className="form-switch switch-success d-flex align-items-center gap-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={chatbot.status}
                            onChange={() => handleToggleStatus(chatbot.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-switch switch-success d-flex align-items-center gap-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={chatbot.isDefault}
                            onChange={() => handleToggleDefault(chatbot.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <div
                          onClick={() => handleOpenKeywordModal(chatbot)}
                          className="editable-input"
                          style={{
                            cursor: "pointer",
                            minHeight: "38px",
                            border: "1px solid #ced4da",
                            borderRadius: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          {chatbot.keywords.length > 0 ? (
                            chatbot.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="contact-badge key-badge d-flex align-items-center"
                                style={{ fontSize: "14px" }}
                              >
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">
                              Click to select keywords
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            onClick={() => handleEditClick(chatbot.id)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            style={{ cursor: "pointer" }}
                          >
                            <Icon icon="lucide:edit" />
                          </button>
                          <button
                            onClick={() => handleInitiateDelete(chatbot)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{ cursor: "pointer" }}
                          >
                            <Icon icon="mingcute:delete-2-line" />
                          </button>
                          <button className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center">
                            <Icon icon="ci:share-ios-export" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateChatbot
        showModal={showModal}
        setShowModal={setShowModal}
        onCreateChatbot={handleCreateChatbot}
      />

      {selectedChatbotForKeywords && (
        <KeywordModal
          showKeywordModal={showKeywordModal}
          setShowKeywordModal={setShowKeywordModal}
          initialKeywords={selectedChatbotForKeywords.keywords}
          onSave={(updatedKeywords) => {
            handleUpdateKeywords(updatedKeywords);
          }}
          predefinedKeywords={predefinedKeywords}
        />
      )}

      <UnsubscribeModal
        showKeyModal={showKeyModal}
        setShowKeyModal={setShowKeyModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={chatbotToDelete?.name || ""}
        itemType="chatbot"
      />
    </MasterLayout>
  );
};

export default ChatbotBuilder;