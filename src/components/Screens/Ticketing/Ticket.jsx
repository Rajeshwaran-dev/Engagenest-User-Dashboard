import React, { useState, useEffect } from "react";
import { Card, Modal, Tabs, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import TicketsTable from "./Components/TicketsTable";
import TabActions from "./Components/TabActions";
import SpamActions from "./Components/SpamActions";
import FilterDrawer from "./Components/FilterDrawer";
import BulkUpdateDrawer from "./Components/BulkUpdateDrawer";
import QuickUpdateModal from "./Components/QuickUpdateModal";
import SpamConfirmModal from "./Components/SpamConfirmModal";
import DragUpdateModal from "./Components/DragUpdateModal";
import AddEditTicketModal from "./Components/AddEditTicketModal";
import FeedbackConfig from "./Components/FeedbackConfig";
import TicketsView from "./Components/TicketsView";
import dayjs from "dayjs";
import PriorityUpdateModal from "./Components/PriorityUpdateModal";
import Breadcrumb from "../../Breadcrumb";

const { TabPane } = Tabs;

// Static tickets data
const STATIC_TICKETS = [
  {
    _id: "1",
    ticketId: "TKT-001",
    customerName: "John Doe",
    department_field: "Technical Support",
    subject: "Cannot login to account",
    description: "Getting error when trying to login",
    mobileNumber: "+1234567890",
    priority: "High",
    status: "Assigned",
    assignedTo: "Agent Smith",
    createdDate: "2024-01-15T10:30:00Z",
    isSpam: false,
    isStarred: true,
    dueDate: "2024-01-20T10:30:00Z",
  },
  {
    _id: "2",
    ticketId: "TKT-002",
    customerName: "Jane Smith",
    department_field: "Billing",
    subject: "Invoice discrepancy",
    description: "Invoice amount doesn't match services",
    mobileNumber: "+1987654321",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Agent Johnson",
    createdDate: "2024-01-16T14:45:00Z",
    isSpam: false,
    isStarred: false,
    dueDate: "2024-01-25T14:45:00Z",
  },
  {
    _id: "3",
    ticketId: "TKT-003",
    customerName: "Bob Wilson",
    department_field: "Sales",
    subject: "Product inquiry",
    description: "Need information about premium features",
    mobileNumber: "+1122334455",
    priority: "Low",
    status: "Complete",
    assignedTo: "Agent Williams",
    createdDate: "2024-01-10T09:15:00Z",
    isSpam: false,
    isStarred: true,
    completedDate: "2024-01-12T16:20:00Z",
  },
  {
    _id: "4",
    ticketId: "TKT-004",
    customerName: "Spam User",
    department_field: "Other",
    subject: "Buy cheap products",
    description: "SPAM MESSAGE",
    mobileNumber: "+9999999999",
    priority: "Critical",
    status: "Created",
    assignedTo: "Unassigned",
    createdDate: "2024-01-17T11:20:00Z",
    isSpam: true,
    isStarred: false,
  },
  {
    _id: "5",
    ticketId: "TKT-005",
    customerName: "Alice Brown",
    department_field: "Technical Support",
    subject: "Software installation issue",
    description: "Error during software installation",
    mobileNumber: "+1444555666",
    priority: "High",
    status: "Awaiting Customer Response",
    assignedTo: "Agent Davis",
    createdDate: "2024-01-18T13:10:00Z",
    isSpam: false,
    isStarred: false,
    dueDate: "2024-01-23T13:10:00Z",
  },
  {
    _id: "6",
    ticketId: "TKT-006",
    customerName: "Charlie Green",
    department_field: "Customer Service",
    subject: "Account deletion request",
    description: "Want to delete my account permanently",
    mobileNumber: "+1777888999",
    priority: "Medium",
    status: "Pending",
    assignedTo: "Agent Miller",
    createdDate: "2024-01-19T16:05:00Z",
    isSpam: false,
    isStarred: false,
    dueDate: "2024-01-26T16:05:00Z",
  },
];

const STATIC_SPAM_TICKETS = STATIC_TICKETS.filter(ticket => ticket.isSpam);
const STATIC_STARRED_TICKETS = STATIC_TICKETS.filter(ticket => ticket.isStarred);

const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Tickets component rendering for path:", location.pathname);

  // ✅ FIXED: Navigate to ticket detail page using route
  const [tickets, setTickets] = useState(STATIC_TICKETS);
  const [spamTickets, setSpamTickets] = useState(STATIC_SPAM_TICKETS);
  const [starredTickets, setStarredTickets] = useState(STATIC_STARRED_TICKETS);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedSpamTickets, setSelectedSpamTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [quickUpdateTicket, setQuickUpdateTicket] = useState(null);
  const [dragTicket, setDragTicket] = useState(null);
  const [ticketToSpam, setTicketToSpam] = useState(null);

  // ✅ FIXED: Navigate to ticket detail page using route
  const handleRowClick = (ticket) => {
    // Use navigate with proper path
    navigate(`/tickets/${ticket._id}`);
  };

  // Static handlers
  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
  };

  const handleStarTicket = (ticketId) => {
    setTickets(prev => prev.map(ticket =>
      ticket._id === ticketId
        ? { ...ticket, isStarred: !ticket.isStarred }
        : ticket
    ));
    setStarredTickets(prev => {
      const isStarred = prev.some(t => t._id === ticketId);
      if (isStarred) {
        return prev.filter(t => t._id !== ticketId);
      } else {
        const ticket = tickets.find(t => t._id === ticketId);
        return ticket ? [...prev, { ...ticket, isStarred: true }] : prev;
      }
    });
    message.success("Ticket starred status updated");
  };

  const handleMarkAsSpam = (ticketId) => {
    const ticket = tickets.find(t => t._id === ticketId);
    if (ticket) {
      const updatedTicket = { ...ticket, isSpam: true };
      setTickets(prev => prev.map(t =>
        t._id === ticketId ? updatedTicket : t
      ));
      setSpamTickets(prev => [...prev, updatedTicket]);
      message.success("Ticket marked as spam");
    }
  };

  const handleBulkMarkAsSpam = (ticketIds) => {
    setTickets(prev => prev.map(ticket =>
      ticketIds.includes(ticket._id)
        ? { ...ticket, isSpam: true }
        : ticket
    ));
    const updatedSpamTickets = tickets.filter(t =>
      ticketIds.includes(t._id)
    ).map(t => ({ ...t, isSpam: true }));
    setSpamTickets(prev => [...prev, ...updatedSpamTickets]);
    setSelectedTickets([]);
    message.success(`${ticketIds.length} tickets marked as spam`);
  };

  const handleBulkClose = (ticketIds) => {
    setTickets(prev => prev.map(ticket =>
      ticketIds.includes(ticket._id)
        ? { ...ticket, status: "Complete" }
        : ticket
    ));
    setSelectedTickets([]);
    message.success(`${ticketIds.length} tickets closed`);
  };

  const handlePrintTicket = (ticket) => {
    console.log("Printing ticket:", ticket);
    message.info("Print function called (static mode)");
  };

  const handleUnspamTickets = (ticketIds) => {
    if (!Array.isArray(ticketIds)) {
      ticketIds = [ticketIds];
    }

    setTickets(prev => prev.map(ticket =>
      ticketIds.includes(ticket._id)
        ? { ...ticket, isSpam: false }
        : ticket
    ));
    setSpamTickets(prev => prev.filter(t => !ticketIds.includes(t._id)));
    setSelectedSpamTickets([]);
    message.success(`${ticketIds.length} tickets removed from spam`);
  };

  const handleQuickStatusChange = (ticketId, newStatus) => {
    setTickets(prev => prev.map(ticket =>
      ticket._id === ticketId
        ? { ...ticket, status: newStatus }
        : ticket
    ));
    message.success(`Status updated to ${newStatus}`);
  };

  const handleUpdateStatusClick = (ticket) => {
    setQuickUpdateTicket(ticket);
  };

  const handleSubmit = (values) => {
    if (editingTicket) {
      setTickets(prev => prev.map(ticket =>
        ticket._id === editingTicket._id
          ? { ...ticket, ...values }
          : ticket
      ));
      message.success("Ticket updated successfully");
    } else {
      const newTicket = {
        _id: Date.now().toString(),
        ticketId: `TKT-${Date.now().toString().slice(-4)}`,
        ...values,
        createdDate: new Date().toISOString(),
        isSpam: false,
        isStarred: false,
      };
      setTickets(prev => [...prev, newTicket]);
      message.success("Ticket created successfully");
    }
    setEditingTicket(null);
  };

  const handleQuickUpdate = async (ticket, values) => {
    setTickets(prev => prev.map(t =>
      t._id === ticket._id
        ? { ...t, ...values }
        : t
    ));
    message.success("Ticket updated successfully");
    return Promise.resolve();
  };

  const handleDragUpdate = async (ticket, newStatus, description) => {
    setTickets(prev => prev.map(t =>
      t._id === ticket._id
        ? {
          ...t,
          status: newStatus,
          ...(description && { description: description })
        }
        : t
    ));
    message.success("Ticket status updated");
    return Promise.resolve();
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedTickets.length === 0) {
      message.warning("Please select tickets to update");
      return;
    }

    setTickets(prev => prev.map(ticket =>
      selectedTickets.includes(ticket._id)
        ? { ...ticket, ...updates }
        : ticket
    ));

    message.success(`${selectedTickets.length} tickets updated`);
    setSelectedTickets([]);
    return Promise.resolve();
  };

  const confirmMarkAsSpam = (shouldBlock) => {
    if (ticketToSpam) {
      const ticket = tickets.find(t => t._id === ticketToSpam._id);
      if (ticket) {
        const updatedTicket = { ...ticket, isSpam: true };
        setTickets(prev => prev.map(t =>
          t._id === ticketToSpam._id ? updatedTicket : t
        ));
        setSpamTickets(prev => [...prev, updatedTicket]);
        message.success(`Ticket marked as spam${shouldBlock ? " and customer blocked" : ""}`);
      }
      setTicketToSpam(null);
    }
  };

  const refetchTickets = () => {
    setTickets(STATIC_TICKETS);
    setSpamTickets(STATIC_SPAM_TICKETS);
    setStarredTickets(STATIC_STARRED_TICKETS);
  };


  const handleUpdatePriority = async (ticket, priority, reason) => {
    setTickets(prev => prev.map(t =>
      t._id === ticket._id
        ? { ...t, priority }
        : t
    ));
    message.success(`Priority updated to ${priority}${reason ? ` - Reason: ${reason}` : ''}`);
    return Promise.resolve();
  };

  // View and filter states
  const [activeTabKey, setActiveTabKey] = useState("open");
  const [viewMode, setViewMode] = useState("table");
  const [kanbanGroupBy, setKanbanGroupBy] = useState("status");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [tempFilters, setTempFilters] = useState({});
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  const applyFilters = () => {
    if (tempFilters.status) setStatusFilter(tempFilters.status);
    if (tempFilters.assignedTo) setAssignedFilter(tempFilters.assignedTo);
    if (tempFilters.priority) setPriorityFilter(tempFilters.priority);
    if (tempFilters.department) setDepartmentFilter(tempFilters.department);
    if (tempFilters.dateRange) setDateRange(tempFilters.dateRange);
    setFilterDrawerVisible(false);
    message.success("Filters applied");
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setAssignedFilter("all");
    setPriorityFilter("all");
    setDepartmentFilter("all");
    setDateRange(null);
    setTempFilters({});
    message.info("Filters reset");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (assignedFilter !== "all") count++;
    if (priorityFilter !== "all") count++;
    if (departmentFilter !== "all") count++;
    if (dateRange) count++;
    return count;
  };

  const getFilteredData = () => {
    let filtered = tickets.filter(ticket => !ticket.isSpam);

    if (searchText) {
      filtered = filtered.filter(ticket =>
        Object.values(ticket).some(value =>
          value?.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (assignedFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.assignedTo === assignedFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.department_field === departmentFilter);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(ticket => {
        const ticketDate = dayjs(ticket.createdDate);
        return ticketDate.isAfter(dateRange[0]) && ticketDate.isBefore(dateRange[1]);
      });
    }

    return filtered;
  };

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bulkUpdateDrawerVisible, setBulkUpdateDrawerVisible] = useState(false);
  const [quickUpdateModalVisible, setQuickUpdateModalVisible] = useState(false);
  const [spamConfirmVisible, setSpamConfirmVisible] = useState(false);
  const [dragModalVisible, setDragModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [dragDescription, setDragDescription] = useState("");
  const [filterCount, setFilterCount] = useState(0);
  const [priorityUpdateModalVisible, setPriorityUpdateModalVisible] = useState(false);
  const [ticketForPriorityUpdate, setTicketForPriorityUpdate] = useState(null);

  useEffect(() => {
    if (editingTicket) setIsModalVisible(true);
  }, [editingTicket]);

  useEffect(() => {
    setFilterCount(getActiveFiltersCount());
  }, [statusFilter, assignedFilter, priorityFilter, departmentFilter, dateRange]);

  const handleStatusFilterChange = value => {
    setStatusFilter(value || "all");
  };

  const handleUpdatePriorityClick = record => {
    setTicketForPriorityUpdate(record);
    setPriorityUpdateModalVisible(true);
  };

  const handlePriorityUpdate = async (ticket, priority, reason) => {
    if (ticketForPriorityUpdate) {
      await handleUpdatePriority(ticket, priority, reason);
      setPriorityUpdateModalVisible(false);
      setTicketForPriorityUpdate(null);
    }
  };

  const exportToExcel = () => {
    try {
      const filteredData = getFilteredData();
      const headers = [
        "Ticket ID",
        "Customer Name",
        "Department",
        "Subject",
        "Description",
        "Mobile Number",
        "Priority",
        "Status",
        "Assigned To",
        "Created Date",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredData.map(ticket =>
          [
            ticket.ticketId,
            `"${ticket.customerName}"`,
            ticket.department_field,
            ticket?.subject || "",
            `"${ticket.description}"`,
            ticket.mobileNumber,
            ticket.priority,
            ticket.status,
            ticket.assignedTo,
            ticket.createdDate
              ? dayjs(ticket.createdDate).format("DD/MM/YYYY hh.mm.A")
              : "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tickets.csv";
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("Tickets exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export tickets");
    }
  };

  const handleDragUpdateConfirm = () => {
    if (dragTicket && newStatus) {
      handleDragUpdate(dragTicket, newStatus, dragDescription);
      setDragModalVisible(false);
      setDragDescription("");
    }
  };

  const handleSpamConfirm = ticketToSpam => {
    if (ticketToSpam) {
      setTicketToSpam(ticketToSpam);
      setSpamConfirmVisible(true);
    }
  };

  const handleUnSpamConfirm = ticketToUnSpam => {
    if (ticketToUnSpam) {
      handleUnspamTickets(ticketToUnSpam?._id);
    }
  };

  const handleQuickUpdateModal = ticket => {
    setQuickUpdateTicket(ticket);
    setQuickUpdateModalVisible(true);
  };

  const handleQuickUpdateSubmit = async values => {
    if (quickUpdateTicket) {
      try {
        await handleQuickUpdate(quickUpdateTicket, values);
        setQuickUpdateModalVisible(false);
      } catch (error) {
        message.error("Failed to update ticket");
      }
    }
  };

  const handleBulkUpdateSubmit = async updates => {
    if (selectedTickets.length === 0) {
      message.warning("Please select tickets to update");
      return;
    }

    try {
      await handleBulkUpdate(updates);
      setBulkUpdateDrawerVisible(false);
    } catch (error) {
      console.error("Error in bulk update submit:", error);
      message.error("Failed to update tickets");
    }
  };

  const globalFiltered = getFilteredData();

  const openTicketsCount = globalFiltered.filter(
    t => !t.isSpam && !["complete", "completed"].includes(t.status?.toLowerCase())
  ).length;

  const allNonSpamTicketsCount = globalFiltered.filter(
    t => !t.isSpam
  ).length;

  const starredTicketsCount = globalFiltered.filter(
    t => t.isStarred
  ).length;

  const spamTicketsCount = globalFiltered.filter(
    t => t.isSpam
  ).length;

  const renderTabContent = () => {
    const globalFiltered = getFilteredData();
    let tabData = [];

    switch (activeTabKey) {
      case "open":
        tabData = globalFiltered.filter(
          t =>
            !t.isSpam &&
            !["complete", "completed"].includes(t.status?.toLowerCase())
        );
        return (
          <TicketsView
            viewMode={viewMode}
            tickets={tabData}
            selectedTickets={selectedTickets}
            onSelectTickets={setSelectedTickets}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onStar={handleStarTicket}
            onMarkAsSpam={handleSpamConfirm}
            onPrint={handlePrintTicket}
            onUpdateStatus={handleQuickUpdateModal}
            onQuickStatusChange={handleQuickStatusChange}
            kanbanGroupBy={kanbanGroupBy}
            onKanbanGroupByChange={setKanbanGroupBy}
            onUpdatePriority={handleUpdatePriorityClick}
            onDragUpdate={(ticket, status) => {
              setDragTicket(ticket);
              setNewStatus(status);
              setDragModalVisible(true);
            }}
          />
        );

      case "all":
        tabData = globalFiltered.filter(t => !t.isSpam);
        return (
          <TicketsView
            viewMode={viewMode}
            tickets={tabData}
            selectedTickets={selectedTickets}
            onSelectTickets={setSelectedTickets}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onStar={handleStarTicket}
            onMarkAsSpam={handleSpamConfirm}
            onPrint={handlePrintTicket}
            onUpdateStatus={handleQuickUpdateModal}
            onQuickStatusChange={handleQuickStatusChange}
            kanbanGroupBy={kanbanGroupBy}
            onKanbanGroupByChange={setKanbanGroupBy}
            onUpdatePriority={handleUpdatePriorityClick}
            onDragUpdate={(ticket, status) => {
              setDragTicket(ticket);
              setNewStatus(status);
              setDragModalVisible(true);
            }}
          />
        );

      case "starred":
        tabData = globalFiltered.filter(t => t.isStarred);
        return (
          <TicketsTable
            tickets={tabData}
            selectedTickets={selectedTickets}
            onSelectTickets={setSelectedTickets}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onStar={handleStarTicket}
            onMarkAsSpam={handleSpamConfirm}
            onPrint={handlePrintTicket}
            onUpdateStatus={handleQuickUpdateModal}
            onUpdatePriority={handleUpdatePriorityClick}
          />
        );

      case "spam":
        tabData = globalFiltered.filter(t => t.isSpam);
        return (
          <TicketsTable
            tickets={tabData}
            selectedTickets={selectedSpamTickets}
            onSelectTickets={setSelectedSpamTickets}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onStar={handleStarTicket}
            onMarkAsSpam={handleSpamConfirm}
            onPrint={handlePrintTicket}
            showSpamActions={true}
            onMarkAsUnSpam={handleUnSpamConfirm}
            onUpdatePriority={handleUpdatePriorityClick}
          />
        );

      case "feedback-config":
        return <FeedbackConfig ticket={null} />;

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 '>

      <Breadcrumb title='Tickets Management' />
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        style={{ padding: "16px", borderRadius: "8px" }}
        tabBarExtraContent={
          <TabActions
            activeTabKey={activeTabKey}
            viewMode={viewMode}
            statusFilter={statusFilter}
            onViewModeChange={setViewMode}
            searchText={searchText}
            onStatusFilterChange={handleStatusFilterChange}
            onSearchChange={setSearchText}
            onFilterClick={() => setFilterDrawerVisible(true)}
            onExport={exportToExcel}
            onNewTicket={() => {
              setEditingTicket(null);
              setIsModalVisible(true);
            }}
            selectedTicketsCount={selectedTickets.length}
            onBulkUpdate={() => setBulkUpdateDrawerVisible(true)}
            onClearSelection={() => setSelectedTickets([])}
            activeFiltersCount={filterCount}
          />
        }
      >
        <TabPane tab={<span style={{ fontSize: "16px", fontWeight: 600 }}>Open Tickets ({openTicketsCount})</span>}
          key="open">
          <Card>{renderTabContent()}</Card>
        </TabPane>

        <TabPane tab={<span style={{ fontSize: "16px", fontWeight: 600 }}>All Tickets ({allNonSpamTicketsCount})</span>}
          key="all">
          <Card>{renderTabContent()}</Card>
        </TabPane>

        <TabPane tab={<span style={{ fontSize: "16px", fontWeight: 600 }}>Starred ({starredTicketsCount})</span>}
          key="starred">
          <Card>{renderTabContent()}</Card>
        </TabPane>

        <TabPane tab={<span style={{ fontSize: "16px", fontWeight: 600 }}>Spam ({spamTicketsCount})</span>}
          key="spam">
          <SpamActions
            selectedCount={selectedSpamTickets.length}
            onUnspam={handleUnspamTickets}
          />

          <Card bodyStyle={{ padding: 0 }}>
            {renderTabContent()}
          </Card>
        </TabPane>

        <TabPane tab={<span style={{ fontSize: "16px", fontWeight: 600 }}>Feedbacks</span>}
          key="feedback-config">
          <Card>{renderTabContent()}</Card>
        </TabPane>
      </Tabs>

      {/* Modals and Drawers */}
      <PriorityUpdateModal
        visible={priorityUpdateModalVisible}
        ticket={ticketForPriorityUpdate}
        onCancel={() => {
          setPriorityUpdateModalVisible(false);
          setTicketForPriorityUpdate(null);
        }}
        onUpdate={handlePriorityUpdate}
      />

      <FilterDrawer
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        tickets={tickets}
      />

      <BulkUpdateDrawer
        visible={bulkUpdateDrawerVisible}
        onClose={() => setBulkUpdateDrawerVisible(false)}
        selectedTickets={selectedTickets}
        tickets={tickets}
        onBulkUpdate={handleBulkUpdateSubmit}
      />

      <QuickUpdateModal
        visible={quickUpdateModalVisible}
        ticket={quickUpdateTicket}
        onCancel={() => setQuickUpdateModalVisible(false)}
        onUpdate={handleQuickUpdateSubmit}
      />

      <SpamConfirmModal
        visible={spamConfirmVisible}
        ticket={ticketToSpam}
        onConfirm={shouldBlock => {
          confirmMarkAsSpam(shouldBlock);
          setSpamConfirmVisible(false);
        }}
        onCancel={() => {
          setSpamConfirmVisible(false);
          setTicketToSpam(null);
        }}
      />

      <DragUpdateModal
        visible={dragModalVisible}
        ticket={dragTicket}
        newStatus={newStatus}
        description={dragDescription}
        onDescriptionChange={setDragDescription}
        onCancel={() => setDragModalVisible(false)}
        onConfirm={handleDragUpdateConfirm}
      />

      <AddEditTicketModal
        visible={isModalVisible}
        editingTicket={editingTicket}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTicket(null);
        }}
        onSubmit={vals => {
          handleSubmit(vals);
          setIsModalVisible(false);
        }}
        customFields={[]}
      />

    </div>
  );
};

export default Tickets;