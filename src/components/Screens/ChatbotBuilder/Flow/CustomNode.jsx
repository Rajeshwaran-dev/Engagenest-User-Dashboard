import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";

const CustomNode = ({ data, id }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleDelete = (e) => {
    e.stopPropagation();
    const snackbarId = enqueueSnackbar(
      <div>
        <p>Are you sure you want to delete this node?</p>
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => {
              if (data.onDelete) {
                data.onDelete(id);
              }
              closeSnackbar(snackbarId);
            }}
            style={{
              padding: "5px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => closeSnackbar(snackbarId)}
            style={{
              padding: "5px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>
      </div>,
      {
        variant: "warning",
        persist: true, // This keeps the snackbar open until manually closed
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        style: {
          backgroundColor: "#fff3cd",
          color: "#856404",
          minWidth: "300px",
        },
      }
    );
  };

  return (
    <div
      className="custom-node"
      style={{
        color: "white",
        padding: "10px 15px",
        borderRadius: "8px",
        minWidth: "120px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div style={{ flex: 1 }}>{data.label}</div>

      {data.showDelete && (
        <button
          onClick={handleDelete}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            fontSize: "20px",
          }}
          title="Delete node"
        >
          <Icon icon="weui:delete-on-outlined" />
        </button>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
