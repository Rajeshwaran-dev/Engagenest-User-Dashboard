import React from "react";
const Breadcrumb = ({ title }) => {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <h5 className="custom-size mb-16">{title}</h5>
    </div>
  );
};

export default Breadcrumb;
