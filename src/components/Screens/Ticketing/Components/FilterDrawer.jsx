import React, { useEffect } from "react";
import { Drawer, Form, Select, DatePicker, Button, TimePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FILTER_STORAGE_KEY = "ticketFilters";

// Static tickets data
const STATIC_TICKETS = [
  {
    id: "1",
    ticketId: "TKT001",
    department_field: "Technical Support",
    assignedTo: "John Smith",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-01-15T10:30:00Z",
    customerName: "Alice Johnson",
  },
  {
    id: "2",
    ticketId: "TKT002",
    department_field: "Sales",
    assignedTo: "Sarah Wilson",
    status: "Assigned",
    priority: "Medium",
    createdAt: "2024-01-16T14:45:00Z",
    customerName: "Bob Brown",
  },
  {
    id: "3",
    ticketId: "TKT003",
    department_field: "Customer Service",
    assignedTo: "Mike Davis",
    status: "Complete",
    priority: "Low",
    createdAt: "2024-01-17T09:15:00Z",
    customerName: "Carol White",
  },
  {
    id: "4",
    ticketId: "TKT004",
    department_field: "Technical Support",
    assignedTo: "John Smith",
    status: "Awaiting Customer Response",
    priority: "Critical",
    createdAt: "2024-01-18T16:20:00Z",
    customerName: "David Lee",
  },
  {
    id: "5",
    ticketId: "TKT005",
    department_field: "Billing",
    assignedTo: "Emma Taylor",
    status: "Pending",
    priority: "Medium",
    createdAt: "2024-01-19T11:10:00Z",
    customerName: "Frank Miller",
  },
];

const FilterDrawer = ({
  visible = false,
  onClose = () => {},
  filters = {},
  onFiltersChange = () => {},
  onApply = () => {},
  onReset = () => {},
  tickets = STATIC_TICKETS,
}) => {
  // Extract unique departments from tickets
  const getDepartments = () => {
    if (!tickets || tickets.length === 0) return [];

    const departments = [
      ...new Set(
        tickets
          .map(ticket => ticket.department_field)
          .filter(dept => dept && dept.trim() !== "")
      ),
    ].sort();

    return departments;
  };

  const getAgents = () => {
    if (!tickets || tickets.length === 0) return [];

    const agents = [
      ...new Set(
        tickets
          .map(ticket => ticket.assignedTo)
          .filter(agent => agent && agent.trim() !== "")
      ),
    ].sort();

    return agents;
  };

  const departments = getDepartments();
  const agents = getAgents();

  // Handle date range with time change
  const handleDateRangeChange = (dates, dateStrings) => {
    if (dates && dates.length === 2) {
      onFiltersChange({
        ...filters,
        dateRange: [
          dates[0].startOf("day"),   
          dates[1].endOf("day"),     
        ],
      });
    } else {
      onFiltersChange({
        ...filters,
        dateRange: [],
      });
    }
  };

  // Handle start time change
  const handleStartTimeChange = (time, timeString) => {
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      const newStartDate = time
        ? startDate.hour(time.hour()).minute(time.minute())
        : startDate;

      onFiltersChange({
        ...filters,
        dateRange: [newStartDate, endDate],
      });
    }
  };

  // Handle end time change
  const handleEndTimeChange = (time, timeString) => {
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      const newEndDate = time
        ? endDate.hour(time.hour()).minute(time.minute())
        : endDate;

      onFiltersChange({
        ...filters,
        dateRange: [startDate, newEndDate],
      });
    }
  };

  // Get current start and end times from dateRange
  const getStartTime = () => {
    if (filters.dateRange && filters.dateRange.length === 2) {
      return filters.dateRange[0];
    }
    return null;
  };

  const getEndTime = () => {
    if (filters.dateRange && filters.dateRange.length === 2) {
      return filters.dateRange[1];
    }
    return null;
  };

  // 🔹 Load saved filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);

        // Convert stored date strings back to dayjs objects
        if (parsed.dateRange?.length === 2) {
          parsed.dateRange = parsed.dateRange.map(date => dayjs(date));
        }

        onFiltersChange(parsed);
      } catch (err) {
        console.error("Failed to parse saved filters:", err);
      }
    }
  }, []);

  // 🔹 Save filters to localStorage whenever they change
  useEffect(() => {
    const saveableFilters = {
      ...filters,
      dateRange:
        filters.dateRange?.length === 2
          ? filters.dateRange.map(d => d.format())
          : [],
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(saveableFilters));
  }, [filters]);

  // 🔹 Handle reset: clear both filters and localStorage
  const handleReset = () => {
    localStorage.removeItem(FILTER_STORAGE_KEY);
    onReset();
  };

  // Default filters
  const defaultFilters = {
    department: [],
    assignedTo: [],
    status: [],
    priority: [],
    dateRange: [],
  };

  const currentFilters = { ...defaultFilters, ...filters };

  return (
    <Drawer
      title='Filter Tickets'
      placement='right'
      onClose={onClose}
      open={visible}
      width={400}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleReset} style={{ marginRight: 8 }}>
            Reset
          </Button>
          <Button onClick={onApply} type='primary'>
            Apply Filters
          </Button>
        </div>
      }
    >
      <Form layout='vertical'>
        {/* Department Filter */}
        <Form.Item label='Department'>
          <Select
            value={currentFilters.department}
            onChange={value =>
              onFiltersChange({ ...currentFilters, department: value || [] })
            }
            mode='multiple'
            allowClear
            placeholder='Select department'
            notFoundContent={
              departments.length === 0 ? "No departments found" : null
            }
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
          {departments.length === 0 && (
            <div
              style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}
            >
              No department data available in tickets
            </div>
          )}
        </Form.Item>

        <Form.Item label='Agent'>
          <Select
            value={currentFilters.assignedTo}
            onChange={value => {
              onFiltersChange({ ...currentFilters, assignedTo: value || [] });
            }}
            mode='multiple'
            allowClear
            placeholder='Select agent'
            notFoundContent={agents.length === 0 ? "No agents found" : null}
          >
            {agents.map(agent => (
              <Option key={agent} value={agent}>
                {agent}
              </Option>
            ))}
          </Select>
          {agents.length === 0 && (
            <div
              style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}
            >
              No agent data available in tickets
            </div>
          )}
        </Form.Item>

        <Form.Item label='Status'>
          <Select
            value={currentFilters.status}
            onChange={value =>
              onFiltersChange({ ...currentFilters, status: value || [] })
            }
            mode='multiple'
            allowClear
            placeholder='Select status'
          >
            <Option value='Assigned'>Assigned</Option>
            <Option value='Awaiting Customer Response'>
              Awaiting Customer Response
            </Option>
            <Option value='In Progress'>In Progress</Option>
            <Option value='Pending'>Pending</Option>
            <Option value='Complete'>Complete</Option>
            <Option value='Reopened'>Reopened</Option>
          </Select>
        </Form.Item>

        <Form.Item label='Priority'>
          <Select
            value={currentFilters.priority}
            onChange={value =>
              onFiltersChange({ ...currentFilters, priority: value || [] })
            }
            mode='multiple'
            allowClear
            placeholder='Select priority'
          >
            <Option value='Critical'>Critical</Option>
            <Option value='High'>High</Option>
            <Option value='Medium'>Medium</Option>
            <Option value='Low'>Low</Option>
          </Select>
        </Form.Item>

        {/* Date Range with Time Selection */}
        <Form.Item label='Date Range'>
          <RangePicker
            value={
              currentFilters.dateRange && currentFilters.dateRange.length === 2
                ? currentFilters.dateRange
                : null
            }
            onChange={handleDateRangeChange}
            style={{ width: "100%" }}
            placeholder={["Start Date", "End Date"]}
            format='DD-MM-YYYY'
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FilterDrawer;