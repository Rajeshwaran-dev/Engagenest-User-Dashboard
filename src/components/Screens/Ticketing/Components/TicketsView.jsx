import TicketsTable from "./TicketsTable";
import TicketsCardView from "./TicketsCardView";
import TicketsListView from "./TicketsListView";
import TicketsKanban from "./TicketsKanban";

const TicketsView = ({
  viewMode,
  tickets,
  selectedTickets,
  onSelectTickets,
  onRowClick,
  onEdit,
  onStar,
  onMarkAsSpam,
  onPrint,
  onUpdateStatus,
  onQuickStatusChange,
  kanbanGroupBy,
  onKanbanGroupByChange,
  onDragUpdate,
  onUpdatePriority,
}) => {
  const commonProps = {
    tickets,
    selectedTickets,
    onSelectTickets,
    onRowClick,
    onEdit,
    onStar,
    onMarkAsSpam,
    onPrint,
    onUpdateStatus,
    onQuickStatusChange,
    onUpdatePriority,
  };

  return (
    <>
      {viewMode === "table" && <TicketsTable {...commonProps} />}
      {viewMode === "card" && <TicketsCardView {...commonProps} />}
      {viewMode === "list" && <TicketsListView {...commonProps} />}
      {viewMode === "kanban" && (
        <TicketsKanban
          {...commonProps}
          groupBy={kanbanGroupBy}
          onGroupByChange={onKanbanGroupByChange}
          onDragUpdate={onDragUpdate}
        />
      )}
    </>
  );
};

export default TicketsView;