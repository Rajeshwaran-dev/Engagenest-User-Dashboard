import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Switch,
  TimePicker,
  Typography,
  Space,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Divider,
  Select,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const BusinessHours = ({ onBack }) => {
  const [businessHours, setBusinessHours] = useState({
    monday: {
      enabled: true,
      start: moment("09:00", "HH:mm"),
      end: moment("18:00", "HH:mm"),
      breaks: [],
    },
    tuesday: {
      enabled: true,
      start: moment("09:00", "HH:mm"),
      end: moment("18:00", "HH:mm"),
      breaks: [],
    },
    wednesday: {
      enabled: true,
      start: moment("09:00", "HH:mm"),
      end: moment("18:00", "HH:mm"),
      breaks: [],
    },
    thursday: {
      enabled: true,
      start: moment("09:00", "HH:mm"),
      end: moment("18:00", "HH:mm"),
      breaks: [],
    },
    friday: {
      enabled: true,
      start: moment("09:00", "HH:mm"),
      end: moment("18:00", "HH:mm"),
      breaks: [],
    },
    saturday: {
      enabled: false,
      start: moment("10:00", "HH:mm"),
      end: moment("16:00", "HH:mm"),
      breaks: [],
    },
    sunday: {
      enabled: false,
      start: moment("10:00", "HH:mm"),
      end: moment("16:00", "HH:mm"),
      breaks: [],
    },
  });

  const [timezone, setTimezone] = useState("America/New_York");
  const [isBreaksModalVisible, setIsBreaksModalVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState("");
  const [breaksForm] = Form.useForm();

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  const handleDayToggle = (day, enabled) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }));
  };

  const handleTimeChange = (day, field, time) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: time },
    }));
  };

  const showBreaksModal = day => {
    console.log("Opening modal for:", day);
    setCurrentDay(day);

    // Convert breaks to moment objects for the form
    const breaksWithMoments = businessHours[day].breaks.map(breakTime => ({
      start: moment(breakTime.start, "HH:mm"),
      end: moment(breakTime.end, "HH:mm"),
    }));

    breaksForm.setFieldsValue({
      breaks:
        breaksWithMoments.length > 0
          ? breaksWithMoments
          : [
              {
                start: moment("12:00", "HH:mm"),
                end: moment("13:00", "HH:mm"),
              },
            ],
    });
    setIsBreaksModalVisible(true);
  };

  const handleBreaksOk = () => {
    breaksForm.validateFields().then(values => {
      // Convert moment objects back to strings for storage
      const breaksAsStrings = values.breaks.map(breakTime => ({
        start: breakTime.start.format("HH:mm"),
        end: breakTime.end.format("HH:mm"),
      }));

      setBusinessHours(prev => ({
        ...prev,
        [currentDay]: { ...prev[currentDay], breaks: breaksAsStrings },
      }));
      setIsBreaksModalVisible(false);
      message.success("Break times updated successfully");
    });
  };

  const handleBreaksCancel = () => {
    setIsBreaksModalVisible(false);
  };

  const handleSaveAll = () => {
    // Convert all moment objects to strings for storage
    const businessHoursForStorage = {};
    Object.keys(businessHours).forEach(day => {
      businessHoursForStorage[day] = {
        ...businessHours[day],
        start: businessHours[day].start.format("HH:mm"),
        end: businessHours[day].end.format("HH:mm"),
      };
    });

    // Save to localStorage for persistence
    localStorage.setItem("businessHours", JSON.stringify(businessHoursForStorage));
    localStorage.setItem("timezone", timezone);
    
    message.success("Business hours saved successfully");
  };

  const calculateWorkingHours = day => {
    if (!businessHours[day].enabled) return "Closed";

    const start = businessHours[day].start;
    const end = businessHours[day].end;

    // Subtract break times
    let breakMinutes = 0;
    businessHours[day].breaks.forEach(breakTime => {
      const breakStart = moment(breakTime.start, "HH:mm");
      const breakEnd = moment(breakTime.end, "HH:mm");
      breakMinutes += breakEnd.diff(breakStart, "minutes");
    });

    const totalMinutes = end.diff(start, "minutes") - breakMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  // Load saved data on component mount
  React.useEffect(() => {
    const savedBusinessHours = localStorage.getItem("businessHours");
    const savedTimezone = localStorage.getItem("timezone");
    
    if (savedBusinessHours) {
      const parsedHours = JSON.parse(savedBusinessHours);
      Object.keys(parsedHours).forEach(day => {
        if (parsedHours[day]) {
          parsedHours[day].start = moment(parsedHours[day].start, "HH:mm");
          parsedHours[day].end = moment(parsedHours[day].end, "HH:mm");
        }
      });
      setBusinessHours(parsedHours);
    }
    
    if (savedTimezone) {
      setTimezone(savedTimezone);
    }
  }, []);

  return (
    <div>
      <Button
        type='primary'
        icon={<ArrowLeftOutlined />}
        onClick={() => onBack()}
        style={{ marginBottom: 20, borderRadius: "8px" }}
      >
        Back
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3}>Business Hours</Title>
        <Button
          type='primary'
          icon={<SaveOutlined />}
          onClick={handleSaveAll}
          style={{ borderRadius: "8px" }}
        >
          Save All
        </Button>
      </div>

      <Card
        className='settings-card'
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Working Hours</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text style={{ marginRight: 8 }}>Timezone:</Text>
              <Select
                value={timezone}
                onChange={setTimezone}
                style={{ width: 200 }}
              >
                {timezones.map(tz => (
                  <Option key={tz} value={tz}>
                    {tz}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
        extra={
          <Tooltip title='Business hours affect SLA calculations and agent availability'>
            <InfoCircleOutlined />
          </Tooltip>
        }
      >
        <Row gutter={[16, 16]}>
          {Object.entries(dayNames).map(([day, displayName]) => (
            <Col xs={24} sm={12} md={8} key={day}>
              <Card
                size='small'
                title={displayName}
                extra={
                  <Text type='secondary'>{calculateWorkingHours(day)}</Text>
                }
              >
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Switch
                    checked={businessHours[day].enabled}
                    onChange={checked => handleDayToggle(day, checked)}
                    style={{ marginRight: 8 }}
                  />
                  <Text strong>
                    {businessHours[day].enabled ? "Open" : "Closed"}
                  </Text>
                </div>

                {businessHours[day].enabled && (
                  <Space direction='vertical' style={{ width: "100%" }}>
                    <div>
                      <Text type='secondary'>Start Time:</Text>
                      <TimePicker
                        value={businessHours[day].start}
                        format='HH:mm'
                        onChange={time => handleTimeChange(day, "start", time)}
                        style={{ width: "100%", marginTop: 4 }}
                        minuteStep={15}
                      />
                    </div>
                    <div>
                      <Text type='secondary'>End Time:</Text>
                      <TimePicker
                        value={businessHours[day].end}
                        format='HH:mm'
                        onChange={time => handleTimeChange(day, "end", time)}
                        style={{ width: "100%", marginTop: 4 }}
                        minuteStep={15}
                      />
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <div>
                      <Text type='secondary'>Breaks:</Text>
                      <div style={{ marginTop: 4 }}>
                        {businessHours[day].breaks.length > 0 ? (
                          <ul style={{ paddingLeft: 16, margin: 0 }}>
                            {businessHours[day].breaks.map(
                              (breakTime, index) => (
                                <li key={index}>
                                  {breakTime.start} - {breakTime.end}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <Text type='secondary'>No breaks configured</Text>
                        )}
                      </div>
                      <Button
                        type='dashed'
                        size='small'
                        onClick={() => showBreaksModal(day)}
                        style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                      >
                        <EditOutlined /> Configure Breaks
                      </Button>
                    </div>
                  </Space>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Modal
        title={`Configure Breaks for ${dayNames[currentDay]}`}
        open={isBreaksModalVisible} 
        onOk={handleBreaksOk}
        onCancel={handleBreaksCancel}
        width={600}
      >
        <Form form={breaksForm} layout='vertical'>
          <Form.List name='breaks'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align='baseline'
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "start"]}
                      label='Start Time'
                      rules={[
                        { required: true, message: "Missing start time" },
                      ]}
                    >
                      <TimePicker format='HH:mm' minuteStep={15} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "end"]}
                      label='End Time'
                      rules={[{ required: true, message: "Missing end time" }]}
                    >
                      <TimePicker format='HH:mm' minuteStep={15} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    Add Break
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default BusinessHours;