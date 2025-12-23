import React, { useState, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Tag,
  Upload,
  message,
  Spin,
  Tooltip,
  Popconfirm,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Static video notes data
const STATIC_VIDEO_NOTES = [
  {
    id: 1,
    title: "Welcome Tutorial",
    description: "Introduction to our ticketing system",
    videoUrl: "https://example.com/videos/welcome.mp4",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Advanced Features",
    description: "Learn about advanced ticket management",
    videoUrl: "https://example.com/videos/advanced.mp4",
    createdAt: "2024-01-20T14:45:00Z",
  },
  {
    id: 3,
    title: "Quick Start Guide",
    description: "Get started in 5 minutes",
    videoUrl: "https://example.com/videos/quickstart.mp4",
    createdAt: "2024-01-25T09:15:00Z",
  },
];

const VideoNoteSettings = ({ onBack }) => {
  const [videoNotes, setVideoNotes] = useState(STATIC_VIDEO_NOTES);
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const videoRef = useRef(null);
  const [form] = Form.useForm();

  const getAcceptString = () => {
    return "video/*,.mp4,.mov,.avi,.wmv,.flv,.webm,.mkv";
  };

  const handleBeforeUpload = file => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("You can only upload video files!");
      return Upload.LIST_IGNORE;
    }

    const isLt100M = file.size / 1024 / 1024 < 50;
    if (!isLt100M) {
      message.error("Video must be smaller than 50MB!");
      return Upload.LIST_IGNORE;
    }

    if (file.size > 5 * 1024 * 1024) {
      setIsUploadModalVisible(true);
    }

    setUploadProgress(0);
    return true;
  };

  const customRequest = async options => {
    const { file, onProgress, onSuccess, onError } = options;

    setUploading(true);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      onProgress({ percent: progress });

      if (progress >= 100) {
        clearInterval(interval);

        // Simulate successful upload
        setTimeout(() => {
          const fakeResponse = {
            fileUrl: `https://example.com/uploads/${file.name}`,
            url: `https://example.com/uploads/${file.name}`,
          };

          setUploading(false);
          setUploadProgress(100);
          onSuccess(fakeResponse);
          setIsUploadModalVisible(false);
          message.success(`${file.name} uploaded successfully`);
        }, 500);
      }
    }, 200);
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);

    newFileList = newFileList.map(file => {
      if (file.response) {
        return {
          ...file,
          url: file.response.fileUrl || file.response.url,
          status: "done",
        };
      }
      return file;
    });

    setFileList(newFileList);

    if (info.file.status === "uploading") {
      setUploading(true);
      return;
    }

    if (info.file.status === "done") {
      setUploading(false);
      const fileUrl = info.file.response?.fileUrl || info.file.response?.url || "";
      setUploadedFileUrl(fileUrl);
      form.setFieldsValue({ videoUrl: fileUrl });
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === "error") {
      setUploading(false);
      setUploadProgress(0);
      message.error(`${info.file.name} upload failed`);
    }

    if (newFileList.length === 0) {
      setUploadedFileUrl("");
      form.setFieldsValue({ videoUrl: "" });
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setUploadedFileUrl("");
    setFileList([]);
    setUploadProgress(0);
    setUploading(false);
    form.setFieldsValue({ videoUrl: "" });
    setIsUploadModalVisible(false);
  };

  const handleEdit = record => {
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      videoUrl: record.videoUrl,
    });

    setUploadedFileUrl(record.videoUrl);
    setFileList([
      {
        uid: "-1",
        name: "Current Video",
        status: "done",
        url: record.videoUrl,
      },
    ]);

    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async id => {
    try {
      setIsDeleting(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setVideoNotes(prev => prev.filter(note => note.id !== id));
      message.success("Video note deleted successfully");
    } catch (error) {
      console.error("Failed to delete video note:", error);
      message.error("Failed to delete video note");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayPause = record => {
    if (currentPlayingId === record.id) {
      setCurrentPlayingId(null);
    } else {
      setCurrentPlayingId(record.id);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!values.videoUrl) {
        message.error("Please provide a video URL or upload a video file");
        return;
      }

      if (editingId) {
        setIsUpdating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setVideoNotes(prev =>
          prev.map(note =>
            note.id === editingId ? { ...note, ...values } : note
          )
        );
        message.success("Video note updated successfully");
      } else {
        setIsAdding(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newNote = {
          id: Date.now(),
          ...values,
          createdAt: new Date().toISOString(),
        };

        setVideoNotes(prev => [...prev, newNote]);
        message.success("Video note added successfully");
      }

      setModalVisible(false);
      setEditingId(null);
      setUploadedFileUrl("");
      setFileList([]);
      setUploadProgress(0);
      setIsUploadModalVisible(false);
    } catch (error) {
      console.error("Failed to save video note:", error);
      message.error("Failed to save video note");
    } finally {
      setIsAdding(false);
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setVideoNotes([]);
      message.success("All video notes reset successfully");
    } catch (error) {
      console.error("Failed to reset video notes:", error);
      message.error("Failed to reset video notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    form.resetFields();
    setEditingId(null);
    setUploadedFileUrl("");
    setFileList([]);
    setUploadProgress(0);
    setModalVisible(true);
  };

  const uploadProps = {
    fileList: fileList,
    accept: getAcceptString(),
    maxCount: 1,
    beforeUpload: handleBeforeUpload,
    onChange: handleFileChange,
    onRemove: handleFileRemove,
    customRequest: customRequest,
    showUploadList: {
      showRemoveIcon: true,
      showDownloadIcon: false,
      showPreviewIcon: false,
    },
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: "15%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: "20%",
    },
    {
      title: "Video File",
      dataIndex: "videoUrl",
      key: "videoUrl",
      ellipsis: true,
      width: "35%",
      render: text => (
        <Text
          ellipsis={{ tooltip: text }}
          copyable
          style={{
            maxWidth: "100%",
            wordBreak: "break-all",
            cursor: "pointer",
          }}
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
            message.success("URL copied to clipboard");
          }}
        >
          {text ? "Uploaded Video" : "No video"}
        </Text>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: date => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
          <Tooltip title='Play Video'>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => handlePlayPause(record)}
              type={currentPlayingId === record.id ? "primary" : "default"}
              size='small'
            />
          </Tooltip>
          <Tooltip title='Edit'>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              loading={isUpdating}
              size='small'
            />
          </Tooltip>
          <Popconfirm
            title='Delete Video'
            description='Are you sure you want to delete this video?'
            onConfirm={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
            okType='danger'
          >
            <Tooltip title='Delete a Video'>
              <Button
                icon={<DeleteOutlined />}
                danger
                loading={isDeleting}
                size='small'
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ paddingLeft: 10, marginBottom: 15, borderRadius: "8px" }}
          >
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Video Note Configuration
          </Title>
        </div>
      </div>

      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Title level={4} style={{ margin: 0 }}>
                Video Note Configuration
              </Title>
              {videoNotes.length > 0 && (
                <Tag color='blue'>{videoNotes.length} video notes</Tag>
              )}
            </div>
            <Tooltip title='Create a Video Note'>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={handleAddNew}
                loading={isAdding}
                style={{
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: "8px",
                }}
              >
                Add Video Note
              </Button>
            </Tooltip>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Table
              className="leads-performance-table"
              columns={columns}
              dataSource={videoNotes}
              rowKey='id'
              pagination={false}
              bordered
              loading={isLoading || isDeleting}
              locale={{
                emptyText:
                  "No video notes yet. Click 'Add Video Note' to create one.",
              }}
            />
          </div>
        </div>

        {/* Add/Edit Video Note Modal */}
        <Modal
          title={editingId ? "Edit Video Note" : "Add New Video Note"}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => {
            setModalVisible(false);
            setUploadedFileUrl("");
            setFileList([]);
            setUploadProgress(0);
            setIsUploadModalVisible(false);
          }}
          confirmLoading={isAdding || isUpdating || uploading}
          destroyOnClose
          width={700}
          okButtonProps={{
            disabled: uploading || !uploadedFileUrl,
          }}
        >
          <Form form={form} layout='vertical'>
            <Form.Item
              name='title'
              label='Title'
              rules={[
                { required: true, message: "Please enter a title" },
                { max: 100, message: "Title must be less than 100 characters" },
              ]}
            >
              <Input placeholder='Enter video note title' />
            </Form.Item>

            <Form.Item
              name='description'
              label='Description'
              rules={[
                {
                  max: 500,
                  message: "Description must be less than 500 characters",
                },
              ]}
            >
              <TextArea
                rows={2}
                placeholder='Enter description (optional)'
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item label='Upload Video' required>
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Click to Upload Video"}
                </Button>
              </Upload>

              <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                Supported formats: MP4, MOV, AVI, WMV, FLV, WebM, MKV (Max: 100MB)
              </div>

              <Form.Item
                name='videoUrl'
                hidden
                rules={[
                  { required: true, message: "Please upload a video file" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form.Item>

            {/* Preview for uploaded video */}
            {(form.getFieldValue("videoUrl") || uploadedFileUrl) &&
              !uploading && (
                <Form.Item label='Video Preview'>
                  <video
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                    src={form.getFieldValue("videoUrl") || uploadedFileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </Form.Item>
              )}
          </Form>
        </Modal>
      </Card>

      {/* Video Playback Modal */}
      <Modal
        title={`Playing: ${videoNotes.find(note => note.id === currentPlayingId)?.title || "Video"}`}
        open={!!currentPlayingId}
        onCancel={() => setCurrentPlayingId(null)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentPlayingId && (
          <video
            controls
            autoPlay
            style={{ width: "100%", maxHeight: "400px", borderRadius: "8px" }}
            src={
              videoNotes.find(note => note.id === currentPlayingId)?.videoUrl
            }
            onEnded={() => setCurrentPlayingId(null)}
          >
            Your browser does not support the video tag.
          </video>
        )}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Text type='secondary'>
            {videoNotes.find(note => note.id === currentPlayingId)?.description}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default VideoNoteSettings;