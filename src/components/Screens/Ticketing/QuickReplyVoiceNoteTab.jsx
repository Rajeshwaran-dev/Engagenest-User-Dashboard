import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
  Card,
  Upload,
} from "antd";
import {
  SendOutlined,
  MessageOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const QUICK_REPLY_STORAGE_KEY = "quickRepliesConfig";
const VOICE_NOTE_STORAGE_KEY = "voiceNotesConfig";

// Static data for quick replies
const staticQuickReplies = [
  { id: "1", title: "Welcome Message", message: "Hello! Welcome to our support service. How can I help you today?" },
  { id: "2", title: "Issue Received", message: "Thank you for reporting this issue. We're looking into it and will get back to you soon." },
  { id: "3", title: "Follow Up", message: "Just following up on your recent inquiry. Do you need any further assistance?" },
  { id: "4", title: "Resolution", message: "Your issue has been resolved. Please let us know if you need anything else." },
  { id: "5", title: "Closing", message: "Thank you for contacting us. Have a great day!" },
];

// Static data for voice notes
const staticVoiceNotes = [
  { id: "1", title: "Welcome Greeting", description: "Standard welcome message", audioUrl: "https://example.com/audio/welcome.mp3" },
  { id: "2", title: "Issue Acknowledgment", description: "Acknowledging issue receipt", audioUrl: "https://example.com/audio/acknowledge.mp3" },
  { id: "3", title: "Resolution Update", description: "Update on issue resolution", audioUrl: "https://example.com/audio/resolution.mp3" },
  { id: "4", title: "Follow Up", description: "Standard follow up message", audioUrl: "https://example.com/audio/followup.mp3" },
];

// Static ticket data
const staticSelectedTicket = {
  ticketId: "TKT-001",
  customerName: "John Doe",
  mobileNumber: "9876543210",
  status: "In Progress",
};

const QuickReplyVoiceNoteTab = ({ selectedTicket = staticSelectedTicket }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();

  // Quick Reply states
  const [quickReplies, setQuickReplies] = useState(staticQuickReplies);
  const [selectedReply, setSelectedReply] = useState(null);
  const [previewText, setPreviewText] = useState("");
  const [quickReplyHistory, setQuickReplyHistory] = useState([]);

  // Voice Note states
  const [voiceNotes, setVoiceNotes] = useState(staticVoiceNotes);
  const [selectedVoiceNote, setSelectedVoiceNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceNoteHistory, setVoiceNoteHistory] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load quick replies from configuration
    const savedQuickReplies = localStorage.getItem(QUICK_REPLY_STORAGE_KEY);
    if (savedQuickReplies) {
      try {
        setQuickReplies(JSON.parse(savedQuickReplies));
      } catch (error) {
        console.error("Failed to parse saved quick replies", error);
        setQuickReplies(staticQuickReplies);
      }
    } else {
      // Initialize with static data if nothing in localStorage
      localStorage.setItem(QUICK_REPLY_STORAGE_KEY, JSON.stringify(staticQuickReplies));
    }

    // Load voice notes from configuration
    const savedVoiceNotes = localStorage.getItem(VOICE_NOTE_STORAGE_KEY);
    if (savedVoiceNotes) {
      try {
        setVoiceNotes(JSON.parse(savedVoiceNotes));
      } catch (error) {
        console.error("Failed to parse saved voice notes", error);
        setVoiceNotes(staticVoiceNotes);
      }
    } else {
      // Initialize with static data if nothing in localStorage
      localStorage.setItem(VOICE_NOTE_STORAGE_KEY, JSON.stringify(staticVoiceNotes));
    }

    // Load histories
    const savedQuickReplyHistory = localStorage.getItem(
      "quickReplyTicketHistory"
    );
    if (savedQuickReplyHistory) {
      try {
        setQuickReplyHistory(JSON.parse(savedQuickReplyHistory));
      } catch (error) {
        console.error("Failed to parse quick reply history", error);
      }
    }

    const savedVoiceNoteHistory = localStorage.getItem(
      "voiceNoteTicketHistory"
    );
    if (savedVoiceNoteHistory) {
      try {
        setVoiceNoteHistory(JSON.parse(savedVoiceNoteHistory));
      } catch (error) {
        console.error("Failed to parse voice note history", error);
      }
    }
  }, []);

  // Save histories to localStorage
  useEffect(() => {
    localStorage.setItem(
      "quickReplyTicketHistory",
      JSON.stringify(quickReplyHistory)
    );
  }, [quickReplyHistory]);

  useEffect(() => {
    localStorage.setItem(
      "voiceNoteTicketHistory",
      JSON.stringify(voiceNoteHistory)
    );
  }, [voiceNoteHistory]);

  // Quick Reply Functions
  const handleReplySelect = value => {
    const reply = quickReplies.find(r => r.id === value);
    setSelectedReply(reply);
    setPreviewText(reply?.message || "");
  };

  const handlePreviewChange = e => {
    setPreviewText(e.target.value);
  };

  const handleSendQuickReply = () => {
    if (!previewText.trim()) {
      message.error("Please select or enter a quick reply message");
      return;
    }

    const newHistoryItem = {
      id: Date.now(),
      serialNumber: quickReplyHistory.length + 1,
      ticketId: selectedTicket?.ticketId || "",
      replyName: selectedReply?.title || "Custom",
      customerName: selectedTicket?.customerName || "",
      mobileNumber: selectedTicket?.mobileNumber || "",
      status: selectedTicket?.status || "Unknown",
      message: previewText,
      sentAt: new Date().toISOString(),
    };

    setQuickReplyHistory(prev => [newHistoryItem, ...prev]);
    message.success(`Quick reply sent to ${selectedTicket?.mobileNumber}`);

    // Reset form
    setPreviewText("");
    setSelectedReply(null);
    form.resetFields();
  };

  // Voice Note Functions
  const handleVoiceNoteSelect = value => {
    const note = voiceNotes.find(n => n.id === value);
    setSelectedVoiceNote(note);
    setAudioUrl(note?.audioUrl || "");
    setFileList([]);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const startRecording = async () => {
    try {
      // Simulate recording start
      setIsRecording(true);
      message.info("Recording started (simulated)");

      // Simulate recording process
      setTimeout(() => {
        stopRecording();
      }, 3000); // Auto-stop after 3 seconds for demo
    } catch (err) {
      console.error("Error starting recording:", err);
      message.error("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate creating audio URL
      const simulatedAudioUrl = "https://example.com/recorded-audio.mp3";
      setAudioUrl(simulatedAudioUrl);
      setSelectedVoiceNote(null);
      message.success("Recording stopped and saved");
    }
  };

  const handleUpload = info => {
    const file = info.file;

    if (file) {
      setFileList([file]);

      // Simulate upload success
      setTimeout(() => {
        const simulatedAudioUrl = URL.createObjectURL(file);
        setAudioUrl(simulatedAudioUrl);
        setSelectedVoiceNote(null);
        message.success(`${file.name} file uploaded successfully.`);
      }, 1000);
    }
  };

  const togglePlay = (noteId = null) => {
    if (audioUrl) {
      if (isPlaying && (currentPlayingId === noteId || !noteId)) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        message.info("Audio playback paused");
      } else {
        setIsPlaying(true);
        setCurrentPlayingId(noteId);
        message.info("Playing audio...");

        // Simulate audio ending after 3 seconds
        setTimeout(() => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }, 3000);
      }
    }
  };

  const handleSendVoiceNote = () => {
    if (!audioUrl && !selectedVoiceNote) {
      message.error("Please record, upload or select a voice note");
      return;
    }

    const newHistoryItem = {
      id: Date.now(),
      serialNumber: voiceNoteHistory.length + 1,
      ticketId: selectedTicket?.ticketId || "",
      type: selectedVoiceNote ? "Stored" : audioBlob ? "Recorded" : "Uploaded",
      voiceNoteName: selectedVoiceNote?.title || "Custom",
      customerName: selectedTicket?.customerName || "",
      mobileNumber: selectedTicket?.mobileNumber || "",
      status: selectedTicket?.status || "Unknown",
      sentAt: new Date().toISOString(),
    };

    setVoiceNoteHistory(prev => [newHistoryItem, ...prev]);
    message.success(`Voice note sent to ${selectedTicket?.mobileNumber}`);

    // Reset form
    setAudioUrl("");
    setFileList([]);
    setAudioBlob(null);
    setSelectedVoiceNote(null);
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const getStatusColor = status => {
    switch (status) {
      case "Complete":
        return "#52c41a";
      case "Pending":
        return "#faad14";
      case "In Progress":
        return "#1890ff";
      case "Assigned":
        return "#722ed1";
      case "Awaiting Customer Response":
        return "#fa8c16";
      default:
        return "#d9d9d9";
    }
  };

  const quickReplyHistoryColumns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 80,
    },
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
    },
    {
      title: "Reply Type",
      dataIndex: "replyName",
      key: "replyName",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Sent At",
      dataIndex: "sentAt",
      key: "sentAt",
      render: text => new Date(text).toLocaleString(),
    },
  ];

  const voiceNoteHistoryColumns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 80,
    },
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Voice Note",
      dataIndex: "voiceNoteName",
      key: "voiceNoteName",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Sent At",
      dataIndex: "sentAt",
      key: "sentAt",
      render: text => new Date(text).toLocaleString(),
    },
  ];

  const renderQuickReplyTab = () => (
    <div style={{ height: 500, overflowY: "auto", padding: "16px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <MessageOutlined style={{ color: "var(--primary)" }} />
                <span>Quick Reply</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginLeft: "auto",
                  }}
                >
                  <Text strong type='secondary'>
                    {selectedTicket?.customerName} -{" "}
                    {selectedTicket?.mobileNumber}
                  </Text>
                  <Tag color={getStatusColor(selectedTicket?.status)}>
                    {selectedTicket?.status}
                  </Tag>
                </div>
              </div>
            }
            bordered={false}
          >
            <Form form={form} layout='vertical'>
              <Form.Item label='Select Quick Reply'>
                <Select
                  placeholder='Select a predefined reply'
                  onChange={handleReplySelect}
                  allowClear
                  value={selectedReply?.id}
                >
                  {quickReplies.map(reply => (
                    <Option key={reply.id} value={reply.id}>
                      {reply.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label='Preview & Edit'>
                <Input.TextArea
                  rows={4}
                  value={previewText}
                  onChange={handlePreviewChange}
                  placeholder='Message will appear here, you can edit it before sending'
                />
              </Form.Item>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type='primary'
                  onClick={handleSendQuickReply}
                  icon={<SendOutlined />}
                  disabled={!previewText.trim()}
                  style={{
                    backgroundColor: "var(--primary)",
                    borderColor: "var(--primary)",
                    borderRadius: 8,
                  }}
                >
                  Send to {selectedTicket?.mobileNumber}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card title='Quick Reply History' bordered={false}>
            <Table
              className="leads-performance-table"
              columns={quickReplyHistoryColumns}
              dataSource={quickReplyHistory}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              size='small'
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderVoiceNoteTab = () => (
    <div style={{ height: 500, overflowY: "auto", padding: "16px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <AudioOutlined style={{ color: "var(--primary)" }} />
                <span>Voice Note</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginLeft: "auto",
                  }}
                >
                  <Text strong type='secondary'>
                    {selectedTicket?.customerName} -{" "}
                    {selectedTicket?.mobileNumber}
                  </Text>
                  <Tag color={getStatusColor(selectedTicket?.status)}>
                    {selectedTicket?.status}
                  </Tag>
                </div>
              </div>
            }
            bordered={false}
          >
            <Space direction='vertical' size='large' style={{ width: "100%" }}>
              <div>
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Select Stored Voice Note
                </Title>
                <Select
                  style={{ width: "100%" }}
                  placeholder='Select a pre-recorded voice note'
                  onChange={handleVoiceNoteSelect}
                  value={selectedVoiceNote?.id}
                  allowClear
                  onClear={() => {
                    setSelectedVoiceNote(null);
                    setAudioUrl("");
                  }}
                >
                  {voiceNotes.map(note => (
                    <Option key={note.id} value={note.id}>
                      {note.title}{" "}
                      {note.description ? `(${note.description})` : ""}
                    </Option>
                  ))}
                </Select>
              </div>

              {(audioUrl || selectedVoiceNote) && (
                <div>
                  <Title level={5} style={{ marginBottom: "16px" }}>
                    Preview
                  </Title>
                  <Card>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <Button
                        type='text'
                        icon={
                          isPlaying &&
                            currentPlayingId === selectedVoiceNote?.id ? (
                            <PauseCircleOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          )
                        }
                        onClick={() => togglePlay(selectedVoiceNote?.id)}
                        size='large'
                      />
                      <Text strong>
                        {selectedVoiceNote?.title || "Custom Voice Note"}
                      </Text>
                      <Text type='secondary'>
                        {selectedVoiceNote?.description || "Custom recording"}
                      </Text>
                    </div>
                  </Card>
                </div>
              )}

              <div>
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Record New Voice Note
                </Title>
                <Space>
                  {!isRecording ? (
                    <Button
                      type='primary'
                      icon={<AudioOutlined />}
                      onClick={startRecording}
                      disabled={!!selectedVoiceNote}
                      style={{ borderRadius: 8 }}
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      danger
                      icon={<StopOutlined />}
                      onClick={stopRecording}
                      style={{ borderRadius: 8 }}
                    >
                      Stop Recording
                    </Button>
                  )}
                  {isRecording && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      Recording... (3s demo)
                    </Tag>
                  )}
                </Space>
              </div>

              <div>
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Upload Voice Note
                </Title>
                <Upload
                  fileList={fileList}
                  accept='audio/*'
                  maxCount={1}
                  onChange={handleUpload}
                  onRemove={() => {
                    setFileList([]);
                    setAudioUrl("");
                  }}
                  disabled={!!selectedVoiceNote}
                  beforeUpload={() => false}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!!selectedVoiceNote}
                    style={{ borderRadius: 8 }}
                  >
                    Upload Voice Note
                  </Button>
                </Upload>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type='primary'
                  onClick={handleSendVoiceNote}
                  icon={<SendOutlined />}
                  disabled={!audioUrl && !selectedVoiceNote}
                  style={{
                    backgroundColor: "var(--primary)",
                    borderColor: "var(--primary)",
                    borderRadius: 8,
                  }}
                >
                  Send to {selectedTicket?.mobileNumber}
                </Button>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title='Voice Notes History' bordered={false}>
            <Table
              className="leads-performance-table"
              columns={voiceNoteHistoryColumns}
              dataSource={voiceNoteHistory}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              size='small'
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ height: 550, overflowY: "auto" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ height: "100%" }}
      >
        <TabPane
          tab={
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageOutlined />
              Quick Reply
            </span>
          }
          key='1'
        >
          {renderQuickReplyTab()}
        </TabPane>
        <TabPane
          tab={
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AudioOutlined />
              Voice Note
            </span>
          }
          key='2'
        >
          {renderVoiceNoteTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QuickReplyVoiceNoteTab;