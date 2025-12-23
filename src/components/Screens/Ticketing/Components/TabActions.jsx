import React, { useState } from "react";
import { Input, Button, Space, Select, Badge, Popconfirm, Tooltip, message } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Option } = Select;

// Static data for demo
const STATIC_TICKET_STATUSES = [
  "Assigned",
  "Awaiting Customer Response",
  "In Progress",
  "Pending",
  "Complete",
  "Reopened"
];

const STATIC_VIEW_MODES = [
  { value: "table", label: "Table View" },
  { value: "card", label: "Card View" },
  { value: "kanban", label: "Kanban View" }
];

const TabActions = ({
  activeTabKey,
  viewMode = "table",
  onViewModeChange = (mode) => {
    console.log("View mode changed to:", mode);
    message.info(`View mode: ${mode}`);
  },
  searchText = "",
  onSearchChange = (value) => {
    console.log("Search:", value);
  },
  onFilterClick = () => {
    console.log("Filter clicked");
    message.info("Opening filter dialog");
  },
  onExport = () => {
    console.log("Export clicked");
    message.success("Exporting tickets...");
    // Simulate export delay
    setTimeout(() => {
      message.success("Export completed successfully!");
    }, 1500);
  },
  onNewTicket = () => {
    console.log("New ticket clicked");
    message.info("Opening new ticket form");
  },
  selectedTicketsCount = 0,
  onBulkUpdate = () => {
    console.log("Bulk update clicked");
    message.info("Opening bulk update dialog");
  },
  onClearSelection = () => {
    console.log("Clear selection clicked");
    message.info("Selection cleared");
  },
  activeFiltersCount = 0,
  onStatusFilterChange = (value) => {
    console.log("Status filter changed:", value);
    message.info(`Status filter: ${value || "All"}`);
  },
  statusFilter = "all",
}) => {
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);

  if (!["open", "all", "starred"].includes(activeTabKey)) {
    return null;
  }

  const handleSearchChange = (value) => {
    setLocalSearchText(value);
    onSearchChange(value);
  };

  const handleStatusFilterChange = (value) => {
    setLocalStatusFilter(value);
    onStatusFilterChange(value);
  };

  return (
    <Space wrap>
      {selectedTicketsCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{selectedTicketsCount} tickets selected</span>
          <Button onClick={onBulkUpdate}>Bulk Update</Button>
          <Button onClick={onClearSelection}>Clear</Button>
        </div>
      )}

      <Input
        placeholder='Search tickets...'
        value={localSearchText}
        onChange={e => handleSearchChange(e.target.value)}
        prefix={<SearchOutlined />}
        allowClear
        style={{ width: 200, borderRadius: 8 }}
      />

      <Select
        placeholder='Filter by status'
        className='rounded-select'
        style={{ width: 220 }}
        allowClear
        value={localStatusFilter === "all" ? undefined : localStatusFilter}
        onChange={handleStatusFilterChange}
      >
        {STATIC_TICKET_STATUSES.map(status => (
          <Option key={status} value={status}>
            {status}
          </Option>
        ))}
      </Select>

      <Select
        value={viewMode}
        className='rounded-select'
        onChange={onViewModeChange}
        style={{ width: 140 }}
      >
        {STATIC_VIEW_MODES.map(mode => (
          <Option key={mode.value} value={mode.value}>
            {mode.label}
          </Option>
        ))}
      </Select>

      <Badge
        count={activeFiltersCount}
        offset={[10, 0]}
        style={{ marginRight: 12 }}
      >
        <Tooltip title='Global Filter'>
          <Button
            type='primary'
            icon={<FilterOutlined />}
            onClick={onFilterClick}
            style={{ borderRadius: 5, width: "30px" }}
          />
        </Tooltip>
      </Badge>

      <Popconfirm
        title='Confirm Export'
        description='Are you sure you want to export these tickets?'
        okText='Yes, Export'
        cancelText='Cancel'
        onConfirm={onExport}
        placement='topRight'
      >
        <Tooltip title='Export Tickets'>
          <Button
            className='btn-primary'
            icon={<ExportOutlined />}
            style={{ borderRadius: 5, width: "80px" }}
          >
            Export
          </Button>
        </Tooltip>
      </Popconfirm>

      <Tooltip title='Create New Ticket'>
        <Button
          className='btn-primary'
          icon={<PlusOutlined />}
          onClick={onNewTicket}
          style={{ borderRadius: 5, width: "110px" }}
        >
          New Ticket
        </Button>
      </Tooltip>
    </Space>
  );
};

export default TabActions;