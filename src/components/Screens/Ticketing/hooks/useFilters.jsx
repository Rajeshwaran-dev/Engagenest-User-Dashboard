import { useState, useCallback, useEffect } from "react";
import moment from "moment";
import dayjs from "dayjs";

export const useFilters = (tickets, spamTickets, starredTickets) => {
  const [activeTabKey, setActiveTabKey] = useState("open");
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("ticketTableView");
    return savedViewMode || "table";
  });
  const [kanbanGroupBy, setKanbanGroupBy] = useState("status");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    localStorage.setItem("ticketTableView", viewMode);
  }, [viewMode]);

  const [tempFilters, setTempFilters] = useState({
    status: [],
    priority: [],
    source: [],
    assignedTo: [],
    department: [],
    type: [],
    datePreset: "",
    dateRange: [],
    dueDatePreset: "",
    dueDateRange: [],
    tags: [],
    slaStatus: [],
    responseDue: "",
    rating: [],
    company: [],
    contact: [],
    group: [],
    product: [],
  });

  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Build API query parameters based on current filters
  const buildApiQueryParams = useCallback(
    (page = currentPage, limit = pageSize) => {
      const params = {
        page,
        limit,
      };

      // Status filter
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      // Priority filter
      if (priorityFilter && priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      // Assigned to filter
      if (assignedFilter && assignedFilter !== "all") {
        params.agentId = assignedFilter;
      }

      // Department filter
      if (departmentFilter && departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      // Search text
      if (searchText) {
        params.search = searchText;
      }

      // Active tab filters
      if (activeTabKey === "spam") {
        params.isSpam = true;
      } else if (activeTabKey === "starred") {
        params.isStarred = true;
      } else if (activeTabKey === "all") {
        params.isSpam = false; // Explicitly exclude spam from all tab
      }

      // Date range filter
      if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      // Additional filters from filter drawer
      if (tempFilters.status && tempFilters.status.length > 0) {
        params.status = tempFilters.status.join(",");
      }

      if (tempFilters.priority && tempFilters.priority.length > 0) {
        params.priority = tempFilters.priority.join(",");
      }

      if (tempFilters.assignedTo && tempFilters.assignedTo.length > 0) {
        params.agentId = tempFilters.assignedTo.join(",");
      }

      if (tempFilters.department && tempFilters.department.length > 0) {
        params.department_field = tempFilters.department.join(",");
      }

      if (tempFilters.source && tempFilters.source.length > 0) {
        params.source = tempFilters.source.join(",");
      }

      if (tempFilters.type && tempFilters.type.length > 0) {
        params.type = tempFilters.type.join(",");
      }

      if (tempFilters.tags && tempFilters.tags.length > 0) {
        params.tags = tempFilters.tags.join(",");
      }

      if (tempFilters.slaStatus && tempFilters.slaStatus.length > 0) {
        params.slaStatus = tempFilters.slaStatus.join(",");
      }

      if (tempFilters.rating && tempFilters.rating.length > 0) {
        params.rating = tempFilters.rating.join(",");
      }

      if (tempFilters.company && tempFilters.company.length > 0) {
        params.company = tempFilters.company.join(",");
      }

      if (tempFilters.contact && tempFilters.contact.length > 0) {
        params.contact = tempFilters.contact.join(",");
      }

      if (tempFilters.group && tempFilters.group.length > 0) {
        params.group = tempFilters.group.join(",");
      }

      if (tempFilters.product && tempFilters.product.length > 0) {
        params.product = tempFilters.product.join(",");
      }

      // Date presets
      if (tempFilters.datePreset) {
        params.datePreset = tempFilters.datePreset;
      }

      if (tempFilters.dateRange && tempFilters.dateRange.length === 2) {
        params.startDate = tempFilters.dateRange[0]?.format("YYYY-MM-DD");
        params.endDate = tempFilters.dateRange[1]?.format("YYYY-MM-DD");
      }

      if (tempFilters.dueDatePreset) {
        params.dueDatePreset = tempFilters.dueDatePreset;
      }

      if (tempFilters.dueDateRange && tempFilters.dueDateRange.length === 2) {
        params.dueStartDate = tempFilters.dueDateRange[0]?.format("YYYY-MM-DD");
        params.dueEndDate = tempFilters.dueDateRange[1]?.format("YYYY-MM-DD");
      }

      if (tempFilters.responseDue) {
        params.responseDue = tempFilters.responseDue;
      }

      // Remove undefined or null parameters
      Object.keys(params).forEach(key => {
        if (
          params[key] === undefined ||
          params[key] === null ||
          params[key] === ""
        ) {
          delete params[key];
        }
      });

      return params;
    },
    [
      activeTabKey,
      statusFilter,
      priorityFilter,
      assignedFilter,
      departmentFilter,
      searchText,
      dateRange,
      tempFilters,
      currentPage,
      pageSize,
    ]
  );

  // Get filtered data for client-side fallback (when API is not available)
  // Get filtered data for client-side fallback (when API is not available)
  const getFilteredData = useCallback(() => {
    let baseData = tickets; // ALWAYS start with ALL tickets

    return baseData.filter(item => {
      if (!item) return false;

      // Search filter
      const searchMatch =
        !searchText ||
        item.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ticketId?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.assignedTo?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mobileNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.priority?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase());

      if (!searchMatch) return false;

      // Status filter
      const statusMatch =
        statusFilter === "all" ||
        !statusFilter ||
        item.status?.toLowerCase() === statusFilter?.toLowerCase();

      if (!statusMatch) return false;

      // Priority filter
      const priorityMatch =
        priorityFilter === "all" ||
        !priorityFilter ||
        item.priority?.toLowerCase() === priorityFilter?.toLowerCase();

      if (!priorityMatch) return false;

      // Assigned filter
      const assignedMatch =
        assignedFilter === "all" ||
        !assignedFilter ||
        item.assignedTo?.toLowerCase() === assignedFilter?.toLowerCase();

      if (!assignedMatch) return false;

      // Department filter
      const departmentMatch =
        departmentFilter === "all" ||
        !departmentFilter ||
        item.department_field?.toLowerCase() ===
        departmentFilter?.toLowerCase();

      if (!departmentMatch) return false;

      // Date filter
      let dateMatch = true;
      const activeDateRange =
        tempFilters.dateRange?.length === 2
          ? tempFilters.dateRange
          : dateRange;

      if (
        activeDateRange?.length === 2 &&
        activeDateRange[0] &&
        activeDateRange[1]
      ) {
        const startDate = dayjs(activeDateRange[0]);
        const endDate = dayjs(activeDateRange[1]);
        const ticketDate = item.createdDate ? dayjs(item.createdDate) : null;

        dateMatch = ticketDate
          ? ticketDate.isAfter(startDate) && ticketDate.isBefore(endDate)
          : false;
      }

      if (!dateMatch) return false;

      // tempFilter arrays
      if (tempFilters.status?.length > 0 &&
        !tempFilters.status.some(s => s.toLowerCase() === item.status?.toLowerCase()))
        return false;

      if (tempFilters.priority?.length > 0 &&
        !tempFilters.priority.some(p => p.toLowerCase() === item.priority?.toLowerCase()))
        return false;

      if (tempFilters.assignedTo?.length > 0 &&
        !tempFilters.assignedTo.some(a => a.toLowerCase() === item.assignedTo?.toLowerCase()))
        return false;

      if (tempFilters.department?.length > 0 &&
        !tempFilters.department.some(d => d.toLowerCase() === item.department_field?.toLowerCase()))
        return false;

      return true;
    });
  }, [
    tickets,
    searchText,
    statusFilter,
    priorityFilter,
    assignedFilter,
    departmentFilter,
    dateRange,
    tempFilters
  ]);


  const applyFilters = () => {
    // Apply temporary filters to main filters
    console.log(tempFilters);

    // Reset individual filters first
    setStatusFilter("all");
    setAssignedFilter("all");
    setPriorityFilter("all");
    setDepartmentFilter("all");

    // Apply temp filters if they exist
    if (tempFilters.status && tempFilters.status.length > 0) {
      setStatusFilter(tempFilters.status[0]); // Take first status or handle multiple
    }

    if (tempFilters.assignedTo && tempFilters.assignedTo.length > 0) {
      setAssignedFilter(tempFilters.assignedTo[0]);
    }

    if (tempFilters.priority && tempFilters.priority.length > 0) {
      setPriorityFilter(tempFilters.priority[0]);
    }

    if (tempFilters.department && tempFilters.department.length > 0) {
      setDepartmentFilter(tempFilters.department[0]);
    }

    if (tempFilters.dateRange) {
      setDateRange(tempFilters.dateRange);
    }

    // Reset to first page when filters change
    setCurrentPage(1);

    setFilterDrawerVisible(false);
  };

  const resetFilters = () => {
    const defaultTempFilters = {
      status: [],
      priority: [],
      source: [],
      assignedTo: [],
      department: [],
      type: [],
      datePreset: "",
      dateRange: [],
      dueDatePreset: "",
      dueDateRange: [],
      tags: [],
      slaStatus: [],
      responseDue: "",
      rating: [],
      company: [],
      contact: [],
      group: [],
      product: [],
    };

    setTempFilters(defaultTempFilters);
    setStatusFilter("all");
    setAssignedFilter("all");
    setPriorityFilter("all");
    setDepartmentFilter("all");
    setDateRange([]);
    setSearchText("");
    setCurrentPage(1);
  };

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;

    // Count individual selections in arrays
    if (tempFilters.status && tempFilters.status.length > 0) {
      count += tempFilters.status.length; // Add the number of items, not just 1
    }
    if (tempFilters.priority && tempFilters.priority.length > 0) {
      count += tempFilters.priority.length;
    }
    if (tempFilters.assignedTo && tempFilters.assignedTo.length > 0) {
      count += tempFilters.assignedTo.length;
    }
    if (tempFilters.department && tempFilters.department.length > 0) {
      count += tempFilters.department.length;
    }
    if (tempFilters.source && tempFilters.source.length > 0) {
      count += tempFilters.source.length;
    }
    if (tempFilters.type && tempFilters.type.length > 0) {
      count += tempFilters.type.length;
    }
    if (tempFilters.tags && tempFilters.tags.length > 0) {
      count += tempFilters.tags.length;
    }
    if (tempFilters.slaStatus && tempFilters.slaStatus.length > 0) {
      count += tempFilters.slaStatus.length;
    }
    if (tempFilters.rating && tempFilters.rating.length > 0) {
      count += tempFilters.rating.length;
    }
    if (tempFilters.company && tempFilters.company.length > 0) {
      count += tempFilters.company.length;
    }
    if (tempFilters.contact && tempFilters.contact.length > 0) {
      count += tempFilters.contact.length;
    }
    if (tempFilters.group && tempFilters.group.length > 0) {
      count += tempFilters.group.length;
    }
    if (tempFilters.product && tempFilters.product.length > 0) {
      count += tempFilters.product.length;
    }

    // Date range counts as 1 filter (not 2, since it's a single range)
    if (
      tempFilters.dateRange &&
      tempFilters.dateRange.length === 2 &&
      tempFilters.dateRange[0] &&
      tempFilters.dateRange[1]
    ) {
      count += 1;
    }

    // Due date range counts as 1 filter
    if (
      tempFilters.dueDateRange &&
      tempFilters.dueDateRange.length === 2 &&
      tempFilters.dueDateRange[0] &&
      tempFilters.dueDateRange[1]
    ) {
      count += 1;
    }

    // Single value filters count as 1 each
    if (tempFilters.datePreset && tempFilters.datePreset !== "") {
      count += 1;
    }
    if (tempFilters.dueDatePreset && tempFilters.dueDatePreset !== "") {
      count += 1;
    }
    if (tempFilters.responseDue && tempFilters.responseDue !== "") {
      count += 1;
    }

    return count;
  }, [tempFilters]);

  // Handle pagination changes
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Handle search with debouncing
  const handleSearch = value => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle tab change
  const handleTabChange = key => {
    setActiveTabKey(key);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  return {
    // Filter state
    activeTabKey,
    setActiveTabKey: handleTabChange,
    viewMode,
    setViewMode,
    kanbanGroupBy,
    setKanbanGroupBy,
    searchText,
    setSearchText: handleSearch,
    statusFilter,
    setStatusFilter,
    assignedFilter,
    setAssignedFilter,
    priorityFilter,
    setPriorityFilter,
    departmentFilter,
    setDepartmentFilter,
    dateRange,
    setDateRange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,

    // Temporary filters for drawer
    tempFilters,
    setTempFilters,
    filterDrawerVisible,
    setFilterDrawerVisible,

    // API parameters
    apiQueryParams: buildApiQueryParams(),

    // Functions
    buildApiQueryParams,
    getFilteredData,
    applyFilters,
    resetFilters,
    handlePageChange,
    getActiveFiltersCount,
  };
};
