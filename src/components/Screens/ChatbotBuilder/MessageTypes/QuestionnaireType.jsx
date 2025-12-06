import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const QuestionnaireType = ({ formData, handleInputChange }) => {
  const [newQuestion, setNewQuestion] = useState({
    key: "",
    value: "",
  });

  // update new question inputs
  const handleNewQuestionChange = (field, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ FIXED: add new question logic
  const handleAddNewQuestion = () => {
    if (newQuestion.key.trim() && newQuestion.value.trim()) {
      const updatedQuestions = [
        ...(formData.questions || []),
        { key: newQuestion.key.trim(), value: newQuestion.value.trim() },
      ];
      handleInputChange("questions", updatedQuestions);
      setNewQuestion({ key: "", value: "" });
    }
  };

  // remove a question
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    handleInputChange("questions", updatedQuestions);
  };

  return (
    <>
      <div className="form-group">
        <div
          className="initial-input-group"
        >
          <div className="input-field" style={{ flex: 1 }}>
            <label>Key (e.g., name)</label>
            <input
              type="text"
              value={newQuestion.key}
              onChange={(e) => handleNewQuestionChange("key", e.target.value)}
              placeholder="Enter key"
              style={{ width: "100%" }}
            />
          </div>
          <div className="input-field" style={{ flex: 2 }}>
            <label>Value (e.g., What is your name?)</label>
            <input
              type="text"
              value={newQuestion.value}
              onChange={(e) => handleNewQuestionChange("value", e.target.value)}
              placeholder="Enter question"
              style={{ width: "100%" }}
            />
          </div>
          <button
            className="text-center btn-primary"
            onClick={handleAddNewQuestion}
            type="button"
            disabled={!newQuestion.key.trim() || !newQuestion.value.trim()}
            style={{
              whiteSpace: "nowrap",
              marginBottom: "6px",
              height: "fit-content",
            }}
          > 
            Add Question
          </button>
        </div>

        <div
          className="questions-header"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h6
            style={{ marginRight: "10px", marginBottom: "0" }}
            className="section-heading"
          >
            Questions
          </h6>
        </div>

        {formData.questions && formData.questions.length > 0 ? (
          <div className="questions-table">
            <div
              className="table-header"
              style={{
                display: "flex",
                padding: "10px",
                background: "#f8f9fa",
                borderBottom: "1px solid #dee2e6",
              }}
            >
              <div
                className="table-col key-col"
                style={{ flex: 1, fontWeight: "bold" }}
              >
                Key
              </div>
              <div
                className="table-col value-col"
                style={{ flex: 1, fontWeight: "bold" }}
              >
                Value
              </div>
              <div
                className="table-col action-col"
                style={{ width: "100px", fontWeight: "bold" }}
              >
                Action
              </div>
            </div>
            {formData.questions.map((question, index) => (
              <div
                key={index}
                className="table-row"
                style={{
                  display: "flex",
                  padding: "10px",
                  borderBottom: "1px solid #dee2e6",
                }}
                draggable="true"
              >
                <div className="table-col key-col" style={{ flex: 1 }}>
                  {question.key}
                </div>
                <div className="table-col value-col" style={{ flex: 1 }}>
                  {question.value}
                </div>
                <div
                  className="table-col action-col"
                  style={{ width: "100px" }}
                >
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveQuestion(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc3545",
                      cursor: "pointer",
                      padding: "0",
                    }}
                  >
                    <Icon
                      icon="mi:delete"
                      style={{ fontSize: "20px", color: "#dc3545" }}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="no-questions-message"
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#6c757d",
              fontStyle: "italic",
              border: "1px dashed #dee2e6",
              borderRadius: "4px",
            }}
          >
            No questions added yet. Add questions using the form above.
          </div>
        )}
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            className="form-check-input my-checkbox"
            type="checkbox"
            checked={formData.allowCouponUsage || false}
            onChange={(e) =>
              handleInputChange("allowCouponUsage", e.target.checked)
            }
          />
          Allow Coupon Usage?
        </label>
      </div>
    </>
  );
};

export default QuestionnaireType;
