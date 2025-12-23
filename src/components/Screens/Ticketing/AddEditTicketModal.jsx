import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Button,
  Space,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

// Static data for departments and assignees
const staticDepartments = ["Support", "Sales", "Billing", "Technical", "Customer Service"];
const staticAssignees = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis"];
const staticCustomFields = [
  {
    id: "1",
    label: "Product Category",
    type: "select",
    required: true,
    enabled: true,
  },
  {
    id: "2",
    label: "Issue Severity",
    type: "select",
    required: false,
    enabled: true,
  },
  {
    id: "3",
    label: "Resolution Time Estimate",
    type: "number",
    required: false,
    enabled: true,
  },
];

const AddEditTicketModal = ({
  visible,
  onCancel,
  onFinish,
  form,
  editingTicket,
  departments = staticDepartments,
  assignees = staticAssignees,
  customFields = staticCustomFields,
  newDepartment,
  setNewDepartment,
  newAssignee,
  setNewAssignee,
}) => {
  const [customers, setCustomers] = useState([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  // Static customers data
  const staticCustomers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", mobile: "9876543210", company: "Tech Corp" },
    { id: 2, name: "Bob Williams", email: "bob@example.com", mobile: "9876543211", company: "Biz Solutions" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", mobile: "9876543212", company: "Innovate Ltd" },
    { id: 4, name: "David Miller", email: "david@example.com", mobile: "9876543213", company: "Global Systems" },
  ];

  // Load customers from localStorage or use static data
  useEffect(() => {
    const storedCustomers = JSON.parse(
      localStorage.getItem("convertedCustomers") || "[]"
    );
    // If no customers in localStorage, use static data
    if (storedCustomers.length === 0) {
      setCustomers(staticCustomers);
      localStorage.setItem("convertedCustomers", JSON.stringify(staticCustomers));
    } else {
      setCustomers(storedCustomers);
    }
  }, [visible]);

  useEffect(() => {
    if (editingTicket) {
      const initialValues = {
        ...editingTicket,
        dueDate: editingTicket.dueDate
          ? moment(editingTicket.dueDate, "YYYY-MM-DD HH:mm:ss").isValid()
            ? moment(editingTicket.dueDate, "YYYY-MM-DD HH:mm:ss")
            : null
          : null,
      };

      customFields.forEach(field => {
        if (
          editingTicket.customFieldValues &&
          editingTicket.customFieldValues[field.id]
        ) {
          initialValues[`custom_${field.id}`] =
            field.type === "date" && editingTicket.customFieldValues[field.id]
              ? moment(editingTicket.customFieldValues[field.id])
              : editingTicket.customFieldValues[field.id];
        }
      });

      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [editingTicket, form, customFields]);

  const handleAddCustomer = () => {
    if (newCustomerName.trim()) {
      // Add to local state
      const newCustomer = {
        id: Date.now(),
        name: newCustomerName.trim(),
        email: "",
        mobile: "",
        company: "",
      };

      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);

      // Update localStorage
      localStorage.setItem(
        "convertedCustomers",
        JSON.stringify(updatedCustomers)
      );

      // Set the form value to the new customer
      form.setFieldsValue({ customerName: newCustomerName.trim() });

      // Reset state
      setNewCustomerName("");
      setIsAddingCustomer(false);
    }
  };

  const renderCustomField = field => {
    const fieldName = `custom_${field.id}`;
    const rules = field.required
      ? [{ required: true, message: `Please enter ${field.label}` }]
      : [];

    switch (field.type) {
      case "textarea":
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={fieldName}
            rules={rules}
          >
            <TextArea
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={fieldName}
            rules={rules}
          >
            <Select placeholder={`Select ${field.label.toLowerCase()}`}>
              <Option value='Option 1'>Option 1</Option>
              <Option value='Option 2'>Option 2</Option>
              <Option value='Option 3'>Option 3</Option>
            </Select>
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={fieldName}
            rules={rules}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case "date":
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={fieldName}
            rules={rules}
          >
            <DatePicker
              style={{ width: "100%" }}
              format='DD/MM/YYYY'
              placeholder={`Select ${field.label.toLowerCase()}`}
              disabledDate={current =>
                current && current < moment().startOf("day")
              }
            />
          </Form.Item>
        );

      case "input":
      default:
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={fieldName}
            rules={rules}
          >
            <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
          </Form.Item>
        );
    }
  };

  const enabledCustomFields = customFields.filter(field => field.enabled);

  return (
    <Modal
      title={editingTicket ? "Edit Ticket" : "Add New Ticket"}
      open={visible}
      onCancel={() => {
        setIsAddingCustomer(false);
        setNewCustomerName("");
        onCancel();
      }}
      footer={null}
      width={800}
      centered
    >
      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label='Customer Name'
              name='customerName'
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select
                showSearch
                placeholder='Select or type customer name'
                optionFilterProp='children'
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                onChange={value => {
                  const selected = customers.find(c => c.name === value);
                  if (selected) {
                    form.setFieldsValue({
                      email: selected.email,
                      mobileNumber: selected.mobile,
                      company: selected.company,
                    });
                  }
                }}
                dropdownRender={menu => (
                  <div>
                    {menu}
                    <div
                      style={{ padding: "8px", borderTop: "1px solid #d9d9d9" }}
                    >
                      {isAddingCustomer ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Input
                            placeholder='Enter customer name'
                            value={newCustomerName}
                            onChange={e => setNewCustomerName(e.target.value)}
                            style={{ marginRight: "8px" }}
                            autoFocus
                            onPressEnter={handleAddCustomer}
                          />
                          <Button
                            type='primary'
                            size='small'
                            icon={<PlusOutlined />}
                            onClick={handleAddCustomer}
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type='text'
                          icon={<PlusOutlined />}
                          block
                          onClick={() => setIsAddingCustomer(true)}
                        >
                          Add new customer
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              >
                {customers.map(cust => (
                  <Option key={cust.id} value={cust.name}>
                    {cust.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label='Company Name' name='company'>
              <Input placeholder='Company name' />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label='Email' name='email'>
              <Input placeholder='Email address' />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label='Department'
              name='department'
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select
                placeholder='Select department'
                dropdownRender={menu => <>{menu}</>}
              >
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label='Mobile Number'
              name='mobileNumber'
              rules={[
                { required: true, message: "Please enter mobile number" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input placeholder='Enter mobile number' maxLength={10} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label='Assigned To'
              name='assignedTo'
              rules={[{ required: true, message: "Please select assignee" }]}
            >
              <Select
                placeholder='Select assignee'
                dropdownRender={menu => <>{menu}</>}
              >
                {assignees.map(assignee => (
                  <Option key={assignee} value={assignee}>
                    {assignee}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label='Priority'
              name='priority'
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select placeholder='Select priority'>
                <Option value='Low'>Low</Option>
                <Option value='Medium'>Medium</Option>
                <Option value='High'>High</Option>
                <Option value='Critical'>Critical</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label='Due Date & Time' name='dueDate'>
              <DatePicker
                showTime
                format='DD/MM/YYYY HH:mm:ss'
                style={{ width: "100%" }}
                disabledDate={current =>
                  current && current < moment().startOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {editingTicket && (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label='Status'
                name='status'
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder='Select status'>
                  <Option value='Assigned'>Assigned</Option>
                  <Option value='Awaiting Customer Response'>
                    Awaiting Customer Response
                  </Option>
                  <Option value='In Progress'>In Progress</Option>
                  <Option value='Pending'>Pending</Option>
                  <Option value='Complete'>Complete</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item
          label='Description'
          name='description'
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={3} placeholder='Enter ticket description' />
        </Form.Item>

        {enabledCustomFields.length > 0 && (
          <>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, color: "#1890ff" }}>Custom Fields</h4>
            </div>
            <Row gutter={16}>
              {enabledCustomFields.map((field, index) => (
                <Col
                  xs={24}
                  md={field.type === "textarea" ? 24 : 12}
                  key={field.id}
                >
                  {renderCustomField(field)}
                </Col>
              ))}
            </Row>
          </>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button
              onClick={() => {
                setIsAddingCustomer(false);
                setNewCustomerName("");
                onCancel();
              }}
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              className='bg-blue-500 hover:bg-blue-600'
              style={{ borderRadius: "8px" }}
            >
              {editingTicket ? "Update Ticket" : "Add Ticket"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditTicketModal;