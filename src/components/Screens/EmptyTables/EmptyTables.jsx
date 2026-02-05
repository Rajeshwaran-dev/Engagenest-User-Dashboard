import React from "react";
import empty from "../../../assets/images/empty.png";
import "./EmptyTables.css";

const EmptyState = () => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <img src={empty} />
      </div>
    </div>
  );
};

export default EmptyState;
