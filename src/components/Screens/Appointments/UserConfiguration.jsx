import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Checkbox,
  Tag,
} from "antd";
import moment from "moment";
import FeatherIcon from "feather-icons-react";

const { Title, Text } = Typography;
const { Option } = Select;

const UserConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [availableDates, setAvailableDates] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [agent, setAgent] = useState(null);

  // Static flows data
  const staticFlows = [
    { flowToken: "flow_001", name: "Appointment Confirmation Flow" },
    { flowToken: "flow_002", name: "Reschedule Notification Flow" },
    { flowToken: "flow_003", name: "Feedback Collection Flow" },
    { flowToken: "flow_004", name: "Reminder Flow" },
  ];

  useEffect(() => {
    // Get agent from location state or use static data
    const locationAgent = location.state?.agent;
    
    if (locationAgent) {
      setAgent(locationAgent);
    } else {
      // Use static agent data if none provided
      const staticAgent = {
        key: "agent_001",
        name: "John Doe",
        email: "john.doe@example.com",
        mobileNumber: "+1234567890",
        role: "Doctor",
        config: {
          age: 35,
          department: "Cardiology",
          numberOfSlots: 5,
          slotDuration: 30,
          timeUnit: "minutes",
          amountPerSlot: 150,
          selectedDays: ["mon", "wed", "fri"],
          availableDates: ["20/01/2024", "25/01/2024"],
          unavailableDates: ["22/01/2024"],
          whatsAppFlow: "flow_001"
        }
      };
      
      setAgent(staticAgent);
    }

    // Load agents data from localStorage or use static data
    const savedAgents = localStorage.getItem("agentsData");
    if (!savedAgents) {
      // Set static agents data
      const staticAgents = [
        {
          key: "agent_001",
          name: "John Doe",
          email: "john.doe@example.com",
          mobileNumber: "+1234567890",
          role: "Doctor",
          config: null
        },
        {
          key: "agent_002",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          mobileNumber: "+9876543210",
          role: "Manager",
          config: null
        }
      ];
      localStorage.setItem("agentsData", JSON.stringify(staticAgents));
    }
  }, [location]);

  useEffect(() => {
    if (!agent) return;

    // Set existing configuration data if available
    if (agent.config) {
      const configValues = { ...agent.config };
      form.setFieldsValue(configValues);

      if (configValues.selectedDays) {
        setSelectedDays(configValues.selectedDays);
      }
      if (
        configValues.availableDates &&
        Array.isArray(configValues.availableDates)
      ) {
        const validAvailableDates = configValues.availableDates
          .map(date => {
            const momentDate = moment(date, "DD/MM/YYYY");
            return momentDate.isValid() ? momentDate : null;
          })
          .filter(date => date !== null);
        setAvailableDates(validAvailableDates);
      }
      if (
        configValues.unavailableDates &&
        Array.isArray(configValues.unavailableDates)
      ) {
        const validUnavailableDates = configValues.unavailableDates
          .map(date => {
            const momentDate = moment(date, "DD/MM/YYYY");
            return momentDate.isValid() ? momentDate : null;
          })
          .filter(date => date !== null);
        setUnavailableDates(validUnavailableDates);
      }
    }
  }, [agent, form]);

  const daysOfWeek = [
    { label: "Monday", value: "mon" },
    { label: "Tuesday", value: "tue" },
    { label: "Wednesday", value: "wed" },
    { label: "Thursday", value: "thu" },
    { label: "Friday", value: "fri" },
    { label: "Saturday", value: "sat" },
    { label: "Sunday", value: "sun" },
  ];

  const timeUnits = [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
  ];

  const DATE_FORMAT = "DD/MM/YYYY";

  const handleAvailableDatesChange = dates => {
    if (dates && Array.isArray(dates) && dates.length === 2) {
      setAvailableDates(dates);
    } else {
      setAvailableDates([]);
    }
  };

  const addUnavailableDate = date => {
    if (date && moment.isMoment(date) && date.isValid()) {
      const isDuplicate = unavailableDates.some(
        existingDate =>
          moment.isMoment(existingDate) &&
          existingDate.isValid() &&
          existingDate.isSame(date, "day")
      );
      if (!isDuplicate) {
        setUnavailableDates([...unavailableDates, date]);
      }
    }
  };

  const removeUnavailableDate = dateToRemove => {
    setUnavailableDates(prevDates =>
      prevDates.filter(
        date =>
          !moment.isMoment(date) ||
          !date.isValid() ||
          !moment.isMoment(dateToRemove) ||
          !dateToRemove.isValid() ||
          !date.isSame(dateToRemove, "day")
      )
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Validate required fields manually since some are outside Form.Item
      if (!selectedDays || selectedDays.length === 0) {
        message.error("Please select available days");
        return;
      }

      const configData = {
        ...values,
        selectedDays,
        availableDates:
          availableDates && availableDates.length === 2
            ? availableDates
                .filter(date => moment.isMoment(date) && date.isValid())
                .map(date => date.format(DATE_FORMAT))
            : [],
        unavailableDates:
          unavailableDates && unavailableDates.length > 0
            ? unavailableDates
                .filter(date => moment.isMoment(date) && date.isValid())
                .map(date => date.format(DATE_FORMAT))
            : [],
      };

      // Update agent configuration in localStorage
      const savedAgents = JSON.parse(localStorage.getItem("agentsData") || "[]");
      const updatedAgents = savedAgents.map(agentItem =>
        agentItem.key === agent.key
          ? { ...agentItem, config: configData }
          : agentItem
      );

      localStorage.setItem("agentsData", JSON.stringify(updatedAgents));

      message.success("Configuration saved successfully!");
      
      // Navigate back after saving
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      message.error("Please fill all required fields");
    }
  };

  if (!agent) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Spin />
        <Text>Loading agent information...</Text>
      </div>
    );
  }

  const renderAgentInfo = () => (
    <div
      style={{
        marginBottom: "24px",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
      }}
    >
      <Title level={4} style={{ marginBottom: "16px" }}>
        Agent Information
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Name:</Text>
          <div style={{ marginTop: "4px" }}>{agent.name}</div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Email:</Text>
          <div style={{ marginTop: "4px" }}>{agent.email}</div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Mobile:</Text>
          <div style={{ marginTop: "4px" }}>{agent.mobileNumber}</div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Role:</Text>
          <div style={{ marginTop: "4px" }}>{agent.role}</div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      {renderAgentInfo()}
      <Card
        title='Appointment Configuration'
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button type='primary' onClick={handleSave}>
              <FeatherIcon icon='save' size={14} style={{ marginRight: "8px" }} />
              Save Configuration
            </Button>
          </Space>
        }
      >
        <Form form={form} layout='vertical'>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label='Age'
                name='age'
                rules={[
                  { required: true, message: "Please enter age" },
                  {
                    type: "number",
                    min: 18,
                    max: 100,
                    message: "Age must be between 18-100",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder='Enter age'
                  min={18}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Department'
                name='department'
                rules={[{ required: true, message: "Please enter department" }]}
              >
                <Input placeholder='Enter department' />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Number of Slots'
                name='numberOfSlots'
                rules={[
                  { required: true, message: "Please enter number of slots" },
                  {
                    type: "number",
                    min: 1,
                    max: 10,
                    message: "Slots must be between 1-10",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder='Enter number of slots'
                  min={1}
                  max={10}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label='Slot Duration'
                name='slotDuration'
                rules={[
                  { required: true, message: "Please enter slot duration" },
                  {
                    type: "number",
                    min: 5,
                    max: 120,
                    message: "Duration must be between 5-120",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder='Enter slot duration'
                  min={5}
                  max={120}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Time Unit'
                name='timeUnit'
                rules={[{ required: true, message: "Please select time unit" }]}
              >
                <Select placeholder='Select time unit'>
                  {timeUnits.map(unit => (
                    <Option key={unit.value} value={unit.value}>
                      {unit.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label='Amount Per Slot'
                name='amountPerSlot'
                rules={[
                  { required: true, message: "Please enter amount per slot" },
                  {
                    type: "number",
                    min: 0,
                    message: "Amount must be positive",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder='Enter amount per slot'
                  min={0}
                  prefix='₹'
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                label='Available Days'
                rules={[
                  { required: true, message: "Please select available days" },
                ]}
              >
                <Checkbox.Group
                  options={daysOfWeek}
                  value={selectedDays}
                  onChange={setSelectedDays}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label='Available Date Range'>
                <DatePicker.RangePicker
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                  onChange={handleAvailableDatesChange}
                  format={DATE_FORMAT}
                  value={
                    availableDates.length === 2 &&
                    availableDates.every(
                      date => moment.isMoment(date) && date.isValid()
                    )
                      ? availableDates
                      : undefined
                  }
                  placeholder={["Start Date", "End Date"]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label='Unavailable Dates'>
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disabledDateForUnavailable}
                  onChange={addUnavailableDate}
                  format={DATE_FORMAT}
                  placeholder='Select unavailable date'
                  value={undefined}
                />
                <div style={{ marginTop: 8 }}>
                  {unavailableDates
                    .filter(date => moment.isMoment(date) && date.isValid())
                    .map((date, index) => (
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

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                label='Select Flow'
                name='whatsAppFlow'
                rules={[{ required: true, message: "Please select a flow" }]}
              >
                <Select
                  placeholder='Select a WhatsApp flow'
                  options={staticFlows.map(flow => ({
                    value: flow.flowToken,
                    label: flow.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default UserConfiguration;