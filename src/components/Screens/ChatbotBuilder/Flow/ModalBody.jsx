import React from "react";
import WizardSteps from "../Steps/WizardSteps";

// Import message type components
import TextType from "../MessageTypes/TextType";
import CatalogType from "../MessageTypes/CatalogType";
import InteractiveType from "../MessageTypes/InteractiveType";
import MediaType from "../MessageTypes/MediaType";
import QuestionnaireType from "../MessageTypes/QuestionnaireType";
import WhatsAppPayType from "../MessageTypes/WhatsAppPayType";
import ValidatorType from "../MessageTypes/ValidatorType";
import FlowType from "../MessageTypes/FlowType";

// Import the Steps component
import NotifyStep from "../Steps/NotifyStep";
import ApiConfigurationStep from "../Steps/ApiConfigurationStep";
import FollowUpTriggerStep from "../Steps/FollowUpTriggerStep";
import ActionStep from "../Steps/ActionStep";
import { Icon } from "@iconify/react/dist/iconify.js";

const ModalBody = ({
  currentStep,
  formData,
  handleInputChange,
  handleBodyTextChange,
  handleTypeChange,
  handleNotifyToggle,
  handleButtonChange,
  handleAddButton,
  handleDeleteButton,
  handleListSectionChange,
  handleAddListSection,
  handleAddListRow,
  handleListRowChange,
  handleDeleteListSection,
  handleDeleteListRow,
  handleAddQuestion,
  handleQuestionChange,
  handleAddProduct,
  handleProductChange,
  handleDeleteProduct,
  handleAddCondition,
  handleConditionChange,
  handleApiUrlChange,
  handleHttpMethodChange,
  handleEndpointTypeChange,
  handleAddHeader,
  handleHeaderChange,
  handleDeleteHeader,
  handleTestApi,
  handleResponseMappingChange,
  handleAddVariable,
  chatbotKeywords = [],
  disabledSteps = [],
  isApiConfigEnabled = false,
}) => {
  const getActualStepContent = (step) => {
    const disabledStepsList = disabledSteps || [];
    const enableNotify = formData.enableNotify || false;
    const hasApiConfigDisabled = disabledStepsList.includes(2);

    const isSimpleType = ["Text", "Media", "WhatsApp Pay"].includes(
      formData.type
    );

    if (isSimpleType) {
      if (hasApiConfigDisabled) {
        switch (step) {
          case 1:
            return "message";
          case 2:
            return enableNotify ? "notify" : null;
          default:
            return null;
        }
      } else {
        switch (step) {
          case 1:
            return "message";
          case 2:
            return "api";
          case 3:
            return enableNotify ? "notify" : null;
          default:
            return null;
        }
      }
    }

    if (["Catalog", "Interactive", "Flow"].includes(formData.type)) {
      if (hasApiConfigDisabled) {
        switch (step) {
          case 1:
            return "message";
          case 2:
            return "actions";
          case 3:
            return "followup";
          case 4:
            return enableNotify ? "notify" : null;
          default:
            return null;
        }
      } else {
        switch (step) {
          case 1:
            return "message";
          case 2:
            return "api";
          case 3:
            return "actions";
          case 4:
            return "followup";
          case 5:
            return enableNotify ? "notify" : null;
          default:
            return null;
        }
      }
    }

    if (["Questionnaire", "Validator"].includes(formData.type)) {
      switch (step) {
        case 1:
          return "message";
        case 2:
          return "followup";
        case 3:
          return enableNotify ? "notify" : null;
        default:
          return null;
      }
    }

    return null;
  };

  const handleTriggerKeywordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = String(formData.newTriggerKeyword || "").trim();
      if (!trimmed) return;

      // Check if keyword already exists
      const exists = formData.triggerKeywords?.some(
        (k) => k.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) {
        handleInputChange("newTriggerKeyword", "");
        return;
      }

      // Add new keyword
      const updatedKeywords = [...(formData.triggerKeywords || []), trimmed];
      handleInputChange("triggerKeywords", updatedKeywords);
      handleInputChange("newTriggerKeyword", "");
    }
  };

  const handleRemoveTriggerKeyword = (keywordToRemove) => {
    const updatedKeywords = formData.triggerKeywords?.filter(
      (keyword) => keyword !== keywordToRemove
    ) || [];
    handleInputChange("triggerKeywords", updatedKeywords);
  };

  const renderStep1Content = () => {
    const commonProps = {
      formData,
      handleInputChange,
    };

    const variableProps = {
      ...commonProps,
      handleBodyTextChange: handleBodyTextChange || handleInputChange,
      handleAddVariable: handleAddVariable,
    };

    const interactiveProps = {
      ...variableProps,
      handleButtonChange,
      handleAddButton,
      handleDeleteButton,
      handleListSectionChange,
      handleAddListSection,
      handleAddListRow,
      handleListRowChange,
      handleDeleteListSection,
      handleDeleteListRow,
    };

    const questionnaireProps = {
      ...commonProps,
      handleAddQuestion,
      handleQuestionChange,
    };

    const whatsappPayProps = {
      ...variableProps,
      handleAddProduct,
      handleProductChange,
      handleDeleteProduct,
    };

    const validatorProps = {
      ...commonProps,
      handleAddCondition,
      handleConditionChange,
    };

    switch (formData.type) {
      case "Text":
        return <TextType {...variableProps} />;
      case "Catalog":
        return <CatalogType {...variableProps} />;
      case "Interactive":
        return <InteractiveType {...interactiveProps} />;
      case "Media":
        return <MediaType {...variableProps} />;
      case "Questionnaire":
        return <QuestionnaireType {...questionnaireProps} />;
      case "WhatsApp Pay":
        return <WhatsAppPayType {...whatsappPayProps} />;
      case "Validator":
        return <ValidatorType {...validatorProps} />;
      case "Flow":
        return <FlowType {...variableProps} />;
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    const stepContentType = getActualStepContent(currentStep);

    switch (stepContentType) {
      case "message":
        return renderStep1Content();
      case "api":
        return (
          <ApiConfigurationStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleApiUrlChange={handleApiUrlChange}
            handleHttpMethodChange={handleHttpMethodChange}
            handleEndpointTypeChange={handleEndpointTypeChange}
            handleAddHeader={handleAddHeader}
            handleHeaderChange={handleHeaderChange}
            handleDeleteHeader={handleDeleteHeader}
            handleTestApi={handleTestApi}
            handleResponseMappingChange={handleResponseMappingChange}
          />
        );
      case "actions":
        return (
          <ActionStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case "followup":
        return (
          <FollowUpTriggerStep
            nodeType="node"
            formData={formData}
            chatbotKeywords={chatbotKeywords}
          />
        );
      case "notify":
        return (
          <NotifyStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  const renderBasicConfigFields = () => (
    <div className="wizard-step-content">
      <div className="row">
        <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-12">
          <div className="form-group">
            <label>Node Name*</label>
            <input
              type="text"
              value={formData.nodeName || ""}
              onChange={(e) => handleInputChange("nodeName", e.target.value)}
              placeholder="Node-32B3"
            />
          </div>
        </div>
        <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-12">
          <div className="form-group">
            <label>Type*</label>
            <select
              className="form-select"
              value={formData.type || "Text"}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="Text">Text</option>
              <option value="Catalog">Catalog</option>
              <option value="Flow">Flow</option>
              <option value="Interactive">Interactive</option>
              <option value="Media">Media</option>
              <option value="Questionnaire">Questionnaire</option>
              <option value="WhatsApp Pay">WhatsApp Pay</option>
              <option value="Validator">Validator</option>
            </select>
          </div>
        </div>
        <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-12">
          <div className="form-group">
            <label>Trigger Keyword*</label>
            <div
              className="d-flex flex-wrap p-2 border rounded position-relative"
              style={{
                minHeight: "40px",
                gap: "3px",
                alignItems: "center",
                cursor: "text",
                background: "#fff"
              }}
              onClick={() => {
                document.getElementById("triggerKeywordInput").focus();
              }}
            >
              {formData.triggerKeywords?.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "#1f1750",
                    color: "#fff",
                  }}
                >
                  {keyword}
                  <Icon
                    icon="material-symbols:close-rounded"
                    style={{
                      fontSize: "14px",
                      marginLeft: "6px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTriggerKeyword(keyword);
                    }}
                  />
                </span>
              ))}
              <input
                id="triggerKeywordInput"
                type="text"
                className="form-control"
                value={formData.newTriggerKeyword || ""}
                onChange={(e) => handleInputChange("newTriggerKeyword", e.target.value)}
                onKeyDown={handleTriggerKeywordKeyDown}
                placeholder="Type and press Enter"
                style={{
                  border: "none",
                  outline: "none",
                  minWidth: "120px",
                  flex: "1 1 120px",
                  background: "transparent",
                  padding: "4px",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-lg-3 col-md-6 col-sm-12">
          <div className="form-group">
            <label>Assign To Agent</label>
            <select
              className="form-select"
              value={formData.assignAgent || ""}
              onChange={(e) => handleInputChange("assignAgent", e.target.value)}
            >
              <option value="">Assign Agent</option>
              <option value="Agent1">Agent 1</option>
              <option value="Agent2">Agent 2</option>
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-start gap-3 mb-10">
        <h6 className="mb-0">Enable Notify</h6>
        <div
          style={{ marginTop: "15px" }}
          className="form-switch switch-success"
        >
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="horizontal3"
            checked={formData.enableNotify || false}
            onChange={handleNotifyToggle}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-body">
      {renderBasicConfigFields()}

      <div className="border border-style p-36">
        <WizardSteps
          currentStep={currentStep}
          messageType={formData.type}
          enableNotify={formData.enableNotify}
          disabledSteps={disabledSteps}
        />
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ModalBody;
