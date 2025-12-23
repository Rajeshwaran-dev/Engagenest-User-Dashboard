import React, { useState, useMemo } from "react";
import { Table, Tag, Dropdown, Button, Modal, Pagination, Tooltip, message } from "antd";
import {
  MoreOutlined,
  StarFilled,
  EyeOutlined,
  LinkOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import moment from "moment";

// DND Kit imports
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Static ticketing configuration
const STATIC_TICKETING_CONFIG = {
  data: {
    ticketingFields: [
      { fieldKey: "department_field", fieldName: "Department" },
      { fieldKey: "category_field", fieldName: "Category" },
      { fieldKey: "source_field", fieldName: "Source" },
    ]
  }
};

// Static helper functions
const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low": return "green";
    case "Medium": return "blue";
    case "High": return "orange";
    case "Critical": return "red";
    default: return "default";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Complete": return "green";
    case "Pending": return "orange";
    case "In Progress": return "blue";
    case "Assigned": return "purple";
    case "Awaiting Customer Response": return "gold";
    case "Reopened": return "cyan";
    case "Closed": return "red";
    default: return "default";
  }
};

// Static action menu
const actionMenuItems = (record, actions) => [
  {
    key: "edit",
    label: "Edit",
    onClick: () => actions.onEdit?.(record),
  },
  {
    key: "star",
    label: record.isStarred ? "Unstar" : "Star",
    onClick: () => actions.onStar?.(record),
  },
  {
    key: "print",
    label: "Print",
    onClick: () => actions.onPrint?.(record),
  },
  {
    key: "status",
    label: "Update Status",
    onClick: () => actions.onUpdateStatus?.(record),
  },
  !record.isSpam
    ? {
      key: "spam",
      label: <span style={{ color: "#ff4d4f" }}>Mark as Spam</span>,
      onClick: () => actions.onMarkAsSpam?.(record),
    }
    : {
      key: "unspam",
      label: <span style={{ color: "#e59e35ff" }}>Unspam</span>,
      onClick: () => actions.onMarkAsUnSpam?.(record),
    },
];


// Draggable table header cell component
const DraggableHeaderCell = ({ id, children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    position: "relative",
    ...props.style,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <MenuOutlined
          style={{
            color: "#999",
            fontSize: "12px",
            flexShrink: 0,
          }}
        />
        {children}
      </div>
    </th>
  );
};

const TicketsTable = ({
  tickets,
  selectedTickets,
  onSelectTickets,
  onRowClick,
  onEdit,
  onStar,
  onMarkAsSpam,
  onPrint,
  onUpdateStatus,
  showSpamActions = false,
  onMarkAsUnSpam,
  onUpdatePriority,
}) => {
  // Use static configuration
  const ticketingFields = STATIC_TICKETING_CONFIG.data.ticketingFields || [];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column order state
  const [columnsOrder, setColumnsOrder] = useState([]);

  // Initialize sensors for DND Kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Check if value is a valid HTTPS URL
  const isHttpsLink = value => {
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Check if URL is an image
  const isImageUrl = url => {
    if (typeof url !== "string") return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Handle link click - open in new tab
  const handleLinkClick = (link, e) => {
    e.stopPropagation();
    window.open(link, "_blank", "noopener,noreferrer");
  };

  // Calculate paginated data
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tickets.slice(startIndex, endIndex);
  }, [tickets, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePageSizeChange = (current, size) => {
    setCurrentPage(1);
    setPageSize(size);
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setColumnsOrder(items => {
        const oldIndex = items.findIndex(item => item.key === active.id);
        const newIndex = items.findIndex(item => item.key === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Automatically save to localStorage when dropped
        localStorage.setItem(
          "ticketsTableColumns",
          JSON.stringify(newOrder.map(col => col.key))
        );

        return newOrder;
      });
    }
  };

  const renderCellContent = (value, record, dataIndex) => {
    if (Array.isArray(value)) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {value.map((item, index) => {
            const itemValue =
              typeof item === "object"
                ? item.url || item.link || JSON.stringify(item)
                : item;
            return (
              <div key={index}>
                {renderCellContent(itemValue, record, `${dataIndex}[${index}]`)}
              </div>
            );
          })}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      const url = value.url || value.link;
      if (url && isHttpsLink(url)) {
        const isImage = isImageUrl(url);
        return (
          <Tooltip
            title={
              isImage ? (
                <img
                  src={url}
                  alt='Preview'
                  style={{
                    maxWidth: "300px",
                    maxHeight: "200px",
                    borderRadius: "4px",
                  }}
                />
              ) : (
                <div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    URL:
                  </div>
                  <div style={{ wordBreak: "break-all", maxWidth: "300px" }}>
                    {url}
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    Click to open in new tab
                  </div>
                </div>
              )
            }
            placement='top'
            color={isImage ? "white" : undefined}
            overlayStyle={{ maxWidth: "none" }}
          >
            <Button
              type='link'
              size='small'
              icon={isImage ? <EyeOutlined /> : <LinkOutlined />}
              onClick={e => handleLinkClick(url, e)}
              style={{ padding: "4px 8px" }}
            >
              {isImage ? "Preview" : "Open"}
            </Button>
          </Tooltip>
        );
      }
      return JSON.stringify(value);
    }

    if (isHttpsLink(value)) {
      const isImage = isImageUrl(value);
      return (
        <Tooltip
          title={
            isImage ? (
              <img
                src={value}
                alt='Preview'
                style={{
                  maxWidth: "300px",
                  maxHeight: "200px",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  URL:
                </div>
                <div style={{ wordBreak: "break-all", maxWidth: "300px" }}>
                  {value}
                </div>
                <div
                  style={{ marginTop: "4px", fontSize: "12px", color: "#999" }}
                >
                  Click to open in new tab
                </div>
              </div>
            )
          }
          placement='top'
          color={isImage ? "white" : undefined}
          overlayStyle={{ maxWidth: "none" }}
        >
          <Button
            type='link'
            size='small'
            icon={isImage ? <EyeOutlined /> : <LinkOutlined />}
            onClick={e => handleLinkClick(value, e)}
            style={{ padding: "4px 8px" }}
          >
            {isImage ? "Preview" : "Open"}
          </Button>
        </Tooltip>
      );
    }

    return String(value || "");
  };

  const baseColumns = [
    {
      title: "S.No",
      key: "sno",
      dataIndex: "sno",
      render: (_, __, index) => {
        const globalIndex = (currentPage - 1) * pageSize + index + 1;
        return globalIndex;
      },
      width: "70px",
      fixed: "left",
      onCell: () => ({ onClick: e => e.stopPropagation() }),
    },
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
      width: 140,
      fixed: "left",
      render: (text, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Row 1 → Star + Ticket ID */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {record.isStarred && (
              <StarFilled
                style={{
                  color: "#fadb14",
                  marginRight: "4px",
                  fontSize: "14px",
                }}
              />
            )}
            <span>{text}</span>
          </div>

          {/* Row 2 → Priority Tag */}
          <Tag
            color={getPriorityColor(record.priority)}
            style={{
              marginTop: 4,
              width: "fit-content",
              borderRadius: "6px",
            }}
          >
            {record.priority}
          </Tag>
        </div>
      ),
      onCell: () => ({ onClick: e => e.stopPropagation() }),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 160,
      render: value => renderCellContent(value),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      width: 200,
      render: value => renderCellContent(value),
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      width: 160,
      render: value => renderCellContent(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      ellipsis: true,
      render: status => {
        const displayText =
          status === "Awaiting Customer Response" ? "Awaiting" : status;

        return (
          <Tooltip title={status}>
            <Tag
              color={getStatusColor(status)}
              style={{
                borderRadius: "6px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                display: "inline-block",
                maxWidth: "100px",
                lineHeight: "1.2",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              {displayText}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 220,
      render: date => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 180,
    },
    ...ticketingFields
      .filter(field => field.fieldKey !== "description")
      .map(field => ({
        title: field?.fieldName,
        dataIndex: field?.fieldKey,
        key: field?.fieldKey,
        width: 60,
        render: (value, record) =>
          renderCellContent(value, record, field.fieldKey),
      })),

    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 160,
      render: date => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: actionMenuItems(record, {
              onEdit,
              onStar,
              onPrint,
              onMarkAsSpam,
              onUpdateStatus,
              onMarkAsUnSpam,
            }),
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={e => e.preventDefault()}
          />
        </Dropdown>
      ),
      onCell: () => ({ onClick: e => e.stopPropagation() }),
    },
  ];

  React.useEffect(() => {
    if (columnsOrder.length === 0) {
      const savedColumns = localStorage.getItem("ticketsTableColumns");
      if (savedColumns) {
        try {
          const parsedColumns = JSON.parse(savedColumns);
          const orderedColumns = parsedColumns
            .map(key => baseColumns.find(col => col.key === key))
            .filter(Boolean);

          if (orderedColumns.length > 0) {
            setColumnsOrder(orderedColumns);
            return;
          }
        } catch (error) {
          console.error("Failed to load saved column order:", error);
        }
      }

      setColumnsOrder(baseColumns);
    }
  }, [baseColumns]);

  const orderedColumns = useMemo(() => {
    if (columnsOrder.length === 0) return baseColumns;

    return columnsOrder.map(column => ({
      ...column,
      onHeaderCell: () => ({
        id: column.key,
      }),
    }));
  }, [columnsOrder, baseColumns]);

  const components = {
    header: {
      cell: props => {
        const { id, ...restProps } = props;

        // Make selection column, S.No column, and Actions column non-draggable
        if (id === "actions" || id === "sno" || !id) {
          return <th {...restProps} />;
        }

        return <DraggableHeaderCell id={id} {...restProps} />;
      },
    },
  };

  const rowSelection = {
    selectedRowKeys: selectedTickets,
    onChange: onSelectTickets,
  };

  const getRowClassName = record => {
    let className = "cursor-pointer hover:bg-gray-50";
    if (record.isStarred) {
      className += " border-l-4 border-l-blue-500 bg-blue-50";
    }
    if (record.isSpam) {
      className += " bg-red-50 text-gray-500";
    }
    return className;
  };

  const handleRowClick = record => {
    if (record.isSpam) {
      Modal.warning({
        title: "This ticket is marked as spam",
        content: (
          <>
            <p>You can't open or modify a spammed ticket directly.</p>
            <p>
              Click <b>"Unspam"</b> in the Actions menu to make changes.
            </p>
          </>
        ),
        okText: "Got it",
      });
      return;
    }

    onRowClick(record);
  };

  const sortableItems = useMemo(
    () =>
      orderedColumns
        .filter(col => col.key && col.key !== "actions" && col.key !== "sno")
        .map(col => col.key),
    [orderedColumns]
  );

  return (
    <div style={{ width: "100%" }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItems}
          strategy={horizontalListSortingStrategy}
        >
          <Table
            className="leads-performance-table"
            rowSelection={rowSelection}
            columns={orderedColumns}
            dataSource={paginatedTickets}
            pagination={false}
            components={components}
            scroll={{
              x: 1600,
              y: "calc(100vh - 360px)",
            }}
            size='middle'
            onRow={record => ({
              onClick: event => {
                const isActionCell =
                  event.target.closest(".ant-dropdown-trigger") ||
                  event.target.closest(".ant-btn-icon-only") ||
                  event.target.closest(".ant-btn-link") ||
                  event.target.closest(".ant-tooltip") ||
                  event.target.closest(".anticon-menu");
                if (!isActionCell) {
                  handleRowClick(record);
                }
              },
            })}
            rowClassName={getRowClassName}
          />
        </SortableContext>
      </DndContext>

      {/* Custom pagination */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Filtered count display */}
        <div style={{ color: "#666", fontSize: "14px" }}>
          Showing {paginatedTickets.length} of {tickets.length} tickets
        </div>

        {/* Pagination */}
        <Pagination
          className='ticket-pagination'
          total={tickets.length}
          current={currentPage}
          pageSize={pageSize}
          showSizeChanger
          pageSizeOptions={["10", "20", "50", "100"]}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default TicketsTable;