import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  Button,
  Input,
  Select,
  Collapse,
  Form,
  message,
  Tooltip,
} from "antd";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

// Static data for departments and SLA policies
const staticDepartments = [
  { id: 1, name: "Technical Support" },
  { id: 2, name: "Billing Department" },
  { id: 3, name: "Sales" },
  { id: 4, name: "Customer Service" },
];

const staticSLAPolicies = [
  { id: 1, department: "Technical Support", active: true },
  { id: 2, department: "Billing Department", active: true },
  { id: 3, department: "Sales", active: false },
  { id: 4, department: "Customer Service", active: true },
];

// Static ticket data
const staticTickets = [
  {
    key: "1",
    ticketId: "TKT-001",
    customerName: "John Doe",
    mobileNumber: "9876543210",
    department_field: "Technical Support",
    assignedTo: "Agent Smith",
    status: "In Progress",
    priority: "Medium",
  },
  {
    key: "2",
    ticketId: "TKT-002",
    customerName: "Jane Smith",
    mobileNumber: "9876543211",
    department_field: "Billing Department",
    assignedTo: "Agent Johnson",
    status: "Complete",
    priority: "Low",
  },
  {
    key: "3",
    ticketId: "TKT-003",
    customerName: "Bob Wilson",
    mobileNumber: "9876543212",
    department_field: "Customer Service",
    assignedTo: "Agent Brown",
    status: "Awaiting Customer Response",
    priority: "High",
  },
];

const BulkUpdateDrawer = ({
  visible,
  onClose,
  selectedTickets,
  tickets = staticTickets,
  onBulkUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Use static departments and SLA policies
  const departmentsData = { data: staticDepartments };
  const slaPoliciesData = { data: staticSLAPolicies };

  // Filter departments to show only those with active SLA policies
  const departmentsWithSLA = useMemo(() => {
    const activeSLAPolicies = slaPoliciesData.data.filter(
      policy => policy.active
    );
    const departmentsWithActiveSLA = departmentsData.data.filter(dept =>
      activeSLAPolicies.some(policy => policy.department === dept.name)
    );

    return departmentsWithActiveSLA;
  }, []);

  // Get unique agents from existing tickets
  const allAgents = useMemo(() => {
    const agentMap = new Map();

    tickets.forEach(ticket => {
      if (ticket.assignedTo && ticket.assignedTo !== "Unassigned") {
        const key = ticket.assignedTo.toLowerCase();
        if (!agentMap.has(key)) {
          agentMap.set(key, {
            name: ticket.assignedTo,
            department: ticket.department_field,
          });
        }
      }
    });

    return Array.from(agentMap.values());
  }, [tickets]);

  // Filter agents by selected department
  const filteredAgents = useMemo(() => {
    if (!selectedDepartment) return [];

    return allAgents.filter(agent => agent.department === selectedDepartment);
  }, [allAgents, selectedDepartment]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Prepare the updates object
      const updates = {};

      if (values.status) updates.status = values.status;
      if (values.priority) updates.priority = values.priority;
      if (values.department_field)
        updates.department_field = values.department_field;
      if (values.assignedTo) updates.assignedTo = values.assignedTo;

      if (values.description) {
        updates.description = values.description;
      } else {
        message.warning("Description is required");
        setLoading(false);
        return;
      }

      // Validation: If department is selected, agent must be selected too
      if (values.department_field && !values.assignedTo) {
        message.error("Please select an agent for the selected department");
        setLoading(false);
        return;
      }

      // Check if at least one field besides description is selected
      const hasFieldsToUpdate = Object.keys(updates).some(
        key => key !== "description"
      );
      if (!hasFieldsToUpdate) {
        message.warning(
          "Please select at least one field to update besides description"
        );
        setLoading(false);
        return;
      }

      // **ENHANCED LOGIC: Skip complete tickets for status changes**
      const selectedTicketsDetails = tickets.filter(ticket =>
        selectedTickets.includes(ticket.key)
      );

      const completeTickets = selectedTicketsDetails.filter(
        ticket =>
          ticket.status?.toLowerCase() === "complete" ||
          ticket.status?.toLowerCase() === "completed"
      );

      // Skip complete tickets when:
      // 1. Changing to any status EXCEPT "Reopened"
      // 2. Or when changing to "Complete" (already handled previously)
      if (
        values.status &&
        values.status !== "Reopened" &&
        completeTickets.length > 0
      ) {
        updates.skipCompleteTickets = true;
        updates.completeTicketsCount = completeTickets.length;
      }

      console.log("Submitting bulk update with values:", updates);

      await onBulkUpdate(updates);
      form.resetFields();
      setSelectedDepartment(null);
      onClose();
      message.success("Tickets updated successfully");
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Failed to update tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedDepartment(null);
    onClose();
  };

  const handleDepartmentChange = value => {
    setSelectedDepartment(value);
    form.setFieldValue("assignedTo", undefined);
  };

  // Get selected tickets details for display
  const selectedTicketsDetails = tickets.filter(ticket =>
    selectedTickets.includes(ticket.key)
  );

  const mobileNumbers = [
    ...new Set(selectedTicketsDetails.map(t => t.mobileNumber).filter(Boolean)),
  ].join(", ");

  const getAvailableStatuses = () => {
    const selectedTicketsDetails = tickets.filter(ticket =>
      selectedTickets.includes(ticket.key)
    );

    // Check status distribution
    const completeTickets = selectedTicketsDetails.filter(
      ticket =>
        ticket.status?.toLowerCase() === "complete" ||
        ticket.status?.toLowerCase() === "completed"
    );

    const incompleteTickets = selectedTicketsDetails.filter(
      ticket =>
        !(
          ticket.status?.toLowerCase() === "complete" ||
          ticket.status?.toLowerCase() === "completed"
        )
    );

    // If ALL tickets are complete, only show Reopened
    if (completeTickets.length === selectedTicketsDetails.length) {
      return ["Reopened"];
    }

    // If there are mixed statuses, show all options except Reopened
    // (Reopened only makes sense when all are complete)
    const statusOptions = [
      "In Progress",
      "Awaiting Customer Response",
      "Complete",
    ];

    return statusOptions;
  };

  return (
    <Drawer
      title='Bulk Update Tickets'
      placement='right'
      onClose={handleClose}
      open={visible}
      width={500}
      footer={null}
    >
      <Form form={form} layout='vertical'>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#e6f7ff",
              borderRadius: "6px",
            }}
          >
            <strong>Updating {selectedTickets.length} tickets</strong>
            {mobileNumbers && (
              <div style={{ marginTop: "8px" }}>
                <strong>Mobile Numbers:</strong>
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  {mobileNumbers}
                </div>
              </div>
            )}
          </div>

          <Form.Item
            name='description'
            label='Bulk description'
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              placeholder='Type your response to all selected tickets...'
              rows={4}
              style={{ marginTop: "8px" }}
            />
          </Form.Item>

          <Collapse
            ghost
            size='small'
            defaultActiveKey={["status", "priority", "agent"]}
          >
            <Panel header='Status' key='status'>
              <Form.Item name='status'>
                <Select placeholder='Select status' style={{ width: "100%" }}>
                  {getAvailableStatuses().map(status => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Panel>

            <Panel header='Priority' key='priority'>
              <Form.Item name='priority'>
                <Select placeholder='Select priority' style={{ width: "100%" }}>
                  <Option value='Low'>Low</Option>
                  <Option value='Medium'>Medium</Option>
                  <Option value='High'>High</Option>
                  <Option value='Critical'>Critical</Option>
                </Select>
              </Form.Item>
            </Panel>

            <Panel header='Agent Change' key='agent'>
              <Form.Item
                name='department_field'
                label={
                  <span>
                    Department{" "}
                    <Tooltip title='Only departments with active SLA policies are shown. Changing department will reset the SLA timer.'>
                      <InfoCircleOutlined
                        style={{ color: "#1890ff", cursor: "help" }}
                      />
                    </Tooltip>
                  </span>
                }
                style={{ marginBottom: "12px" }}
              >
                <Select
                  placeholder='Select department'
                  style={{ width: "100%" }}
                  onChange={handleDepartmentChange}
                  allowClear
                  notFoundContent={
                    departmentsWithSLA.length === 0 ? (
                      <div
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          color: "#999",
                        }}
                      >
                        No departments with active SLA policies found
                      </div>
                    ) : null
                  }
                >
                  {departmentsWithSLA.map(dept => (
                    <Option key={dept.id} value={dept.name}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name='assignedTo' label='Agent'>
                <Select
                  placeholder={
                    selectedDepartment
                      ? "Select agent"
                      : "Select department first"
                  }
                  style={{ width: "100%" }}
                  disabled={!selectedDepartment}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredAgents.map(agent => (
                    <Option key={agent.name} value={agent.name}>
                      {agent.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedDepartment && filteredAgents.length === 0 && (
                <div
                  style={{
                    color: "#faad14",
                    fontSize: "12px",
                    marginTop: "-8px",
                    marginBottom: "8px",
                  }}
                >
                  No agents found for this department
                </div>
              )}
            </Panel>
          </Collapse>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type='primary'
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              Apply Updates
            </Button>
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default BulkUpdateDrawer;