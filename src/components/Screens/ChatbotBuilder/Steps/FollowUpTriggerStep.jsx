import React from "react";

const FollowUpTriggerStep = ({ nodeType = "node", formData = {} }) => {
  // Get items (buttons or questions) from formData based on the type
  const getItems = () => {
    if (formData.type === "Interactive") {
      return { type: "buttons", items: formData.buttons || [] };
    } else if (formData.type === "Catalog") {
      return { type: "buttons", items: formData.buttons || [] };
    } else if (formData.type === "Flow") {
      // For Flow type, create a single button from buttonTitle
      if (formData.buttonTitle && formData.buttonTitle.trim() !== "") {
        return {
          type: "buttons",
          items: [
            {
              title: formData.buttonTitle,
              flow: formData.selectedFlow || "",
            },
          ],
        };
      }
    } else if (formData.type === "Questionnaire") {
      // For Questionnaire type, use questions
      return { type: "questions", items: formData.questions || [] };
    }
    return { type: "buttons", items: [] };
  };

  const { type, items } = getItems();

  const generateNodeId = (item, index) => {
    if (type === "questions") {
      return `Question-${item.key || index + 1}`;
    } else if (formData.type === "Flow" && item.flow) {
      return `Flow: ${item.flow}`;
    }
    return `Node-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const getItemName = (item, index) => {
    if (type === "questions") {
      return item.key || `Question ${index + 1}`;
    }
    return item.title || `Button ${index + 1}`;
  };

  const getItemKeyword = (item, index) => {
    if (type === "questions") {
      return item.value || item.key || `Question ${index + 1}`;
    }
    return item.title || `Button ${index + 1}`;
  };

  return (
    <div className="wizard-step-content">
      <div className="type-heading-wrapper">
        <h6 className="type-heading">
          {type === "questions" ? "Questions Flow" : "Intents"}
        </h6>
      </div>

      <div className="table-responsive scroll-sm">
        <table className="table bordered-table mb-0">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">{type === "questions" ? "Question" : "Keywords"}</th>
              <th scope="col">Actions</th>
              <th scope="col">Node</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {getItemName(item, index)}
                    </div>
                  </td>
                  <td>{getItemKeyword(item, index)}</td>
                  <td>
                    <div className="form-switch switch-success d-flex align-items-center gap-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-${index}`}
                        defaultChecked={true}
                      />
                    </div>
                  </td>
                  <td>{generateNodeId(item, index)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  {type === "questions"
                    ? "No questions added yet. Please add questions in the Message step."
                    : "No buttons added yet. Please add buttons in the Actions step."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="mt-3">
          <small className="text-muted">
            {items.length} {type === "questions" ? "question" : "intent"}
            {items.length !== 1 ? "s" : ""} configured
            {formData.type && ` (Type: ${formData.type})`}
          </small>
        </div>
      )}
    </div>
  );
};

export default FollowUpTriggerStep;