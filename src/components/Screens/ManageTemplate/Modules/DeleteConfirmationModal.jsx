import React from "react";
import "./../ManageTemplate.css";
import { Icon } from "@iconify/react/dist/iconify.js";

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "500px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Confirmation</h3>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          >
            <Icon icon="mingcute:close-line" />
          </button>
        </div>
        <div className="modal-body">
          <div className="">
            <h6 className="mb-3 text-primary-2">
              Are you sure you want to delete this agent?
            </h6>
          </div>
        </div>
        <div className="modal-footer justify-content-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
