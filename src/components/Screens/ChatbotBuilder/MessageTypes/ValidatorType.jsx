import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const ValidatorType = ({ formData, handleInputChange }) => {
  // Add this to your component's functions
  const handleAddCondition = () => {
    if (formData.conditions.length < 10) {
      const newConditions = [
        ...formData.conditions,
        { field: "", operator: "", value: "" },
      ];
      handleInputChange("conditions", newConditions);
    }
  };

  const handleDeleteCondition = (index) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index);
    handleInputChange("conditions", newConditions);
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value,
    };
    handleInputChange("conditions", newConditions);
  };

  return (
    <>
      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Condition Source</h6>
        </div>
        <div className="new-flex">
          {/* Form response - Disabled */}
          <label
            style={{ position: "relative", cursor: "not-allowed" }}
            onMouseEnter={(e) => {
              const dangerIcon = e.currentTarget.querySelector(".danger-icon");
              if (dangerIcon) dangerIcon.style.display = "inline";
            }}
            onMouseLeave={(e) => {
              const dangerIcon = e.currentTarget.querySelector(".danger-icon");
              if (dangerIcon) dangerIcon.style.display = "none";
            }}
          >
            <input
              className="form-check-input form-round"
              type="radio"
              name="conditionSource"
              value="Form response"
              checked={formData.conditionSource === "Form response"}
              onChange={(e) => handleInputChange("conditionSource", e.target.value)}
              disabled
              style={{ cursor: "not-allowed" }}
            />

            <span style={{ color: "#6c757d" }}>Form response</span>
          </label>

          {/* Questionnaire response - Disabled */}
          <label
            style={{ position: "relative", cursor: "not-allowed" }}
            onMouseEnter={(e) => {
              const dangerIcon = e.currentTarget.querySelector(".danger-icon");
              if (dangerIcon) dangerIcon.style.display = "inline";
            }}
            onMouseLeave={(e) => {
              const dangerIcon = e.currentTarget.querySelector(".danger-icon");
              if (dangerIcon) dangerIcon.style.display = "none";
            }}
          >
            <input
              className="form-check-input form-round"
              type="radio"
              name="conditionSource"
              value="Questionnaire response"
              checked={formData.conditionSource === "Questionnaire response"}
              onChange={(e) => handleInputChange("conditionSource", e.target.value)}
              disabled
              style={{ cursor: "not-allowed" }}
            />
            <span style={{ color: "#6c757d" }}>Questionnaire response</span>
          </label>

          {/* Meta webhook payload - Enabled */}
          <label style={{ cursor: "pointer" }}>
            <input
              className="form-check-input form-round"
              type="radio"
              name="conditionSource"
              value="Meta webhook payload"
              checked={formData.conditionSource === "Meta webhook payload"}
              onChange={(e) => handleInputChange("conditionSource", e.target.value)}
            />
            <span style={{ marginLeft: "5px" }}>Meta webhook payload</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Mapping Configuration</h6>
        </div>
        <label className="text-center">API Url</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={formData.apiUrl}
            onChange={(e) => handleInputChange("apiUrl", e.target.value)}
            placeholder="API URL"
            style={{ flex: 1 }}
          />
          <button className="btn-primary" style={{ whiteSpace: "nowrap" }}>
            Gather response
          </button>
        </div>
      </div>

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">
            Condition Comparison {formData.conditions.length}/10
          </h6>
        </div>
        <button
          className="btn-primary text-center"
          onClick={handleAddCondition}
          disabled={formData.conditions.length >= 10}
        >
          <Icon style={{ fontSize: "22px" }} icon="ic:round-plus" />
          Add Condition
        </button>
        {formData.conditions.map((condition, index) => (
          <div
            className="new-flex"
            style={{ marginTop: "20px", alignItems: "center", gap: "10px" }}
            key={index}
          >
            <select
              className="form-select"
              value={condition.operator || ""}
              onChange={(e) =>
                handleConditionChange(index, "operator", e.target.value)
              }
              style={{ flex: 1 }}
            >
              {/* Add more operators as needed */}
            </select>
            :
            <select
              className="form-select"
              value={condition.field || ""}
              onChange={(e) =>
                handleConditionChange(index, "field", e.target.value)
              }
              style={{ flex: 1 }}
            >
              <option value="User Phone Number">User Phone Number</option>
              {/* Add more options as needed */}
            </select>

            {/* Delete icon button */}
            <button
              type="button"
              className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
              onClick={() => handleDeleteCondition(index)}
              
              title="Delete condition"
            >
              <Icon
                icon="mi:delete"
              />
            </button>
          </div>
        ))}
      </div>

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Code Structure</h6>
        </div>
        <pre
          style={{
            background: "#ccccccff",
            padding: "10px",
            borderRadius: "4px",
            color: "var(--text-secondary)",
          }}
        >
          {`if (response_value === source_value) {
  // Your related next node executes!
}`}
        </pre>
      </div>
    </>
  );
};

export default ValidatorType;