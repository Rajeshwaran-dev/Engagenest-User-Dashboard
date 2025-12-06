import React from "react";
import "../ChatbotFlowBuilder.css";

const WizardSteps = ({
  currentStep,
  messageType,
  enableNotify,
  disabledSteps = [],
}) => {
  const getStepsForType = (type, notifyEnabled) => {
    const baseStepConfigs = {
      Text: [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
      ],
      Catalog: [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
        { num: 3, label: "Actions" },
        { num: 4, label: "Follow-up triggers" },
      ],
      Flow: [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
        { num: 3, label: "Actions" },
        { num: 4, label: "Follow-up triggers" },
      ],
      Interactive: [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
        { num: 3, label: "Actions" },
        { num: 4, label: "Follow-up triggers" },
      ],
      Media: [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
      ],
      Questionnaire: [
        { num: 1, label: "Message" },
        { num: 2, label: "Follow-up triggers" },
      ],
      "WhatsApp Pay": [
        { num: 1, label: "Message" },
        { num: 2, label: "API Configuration" },
      ],
      Validator: [
        { num: 1, label: "Configuration" },
        { num: 2, label: "Follow-up triggers" },
      ],
    };

    let steps = baseStepConfigs[type] || baseStepConfigs["Text"];

    // Add Notify step if enabled (as the last step)
    if (notifyEnabled) {
      steps = [...steps]; // Create a new array
      steps.push({ num: steps.length + 1, label: "Notify" });
    }

    return steps;
  };

  const steps = getStepsForType(messageType, enableNotify);

  // Calculate progress percentage for animation
  const getLineProgress = (stepIndex, currentStep) => {
    if (currentStep > stepIndex + 1) return 100;
    if (currentStep === stepIndex + 1) return 100;
    return 0; // Not filled
  };

  // Check if step is disabled
  const isStepDisabled = (stepNum) => {
    return disabledSteps.includes(stepNum);
  };

  return (
    <div className="wizard-steps">
      {steps.map((step, index) => (
        <div
          className={`wizard-step ${
            isStepDisabled(step.num) ? "disabled" : ""
          }`}
          key={step.num}
        >
          <div className="wizard-step-content">
            <div
              className={`wizard-number ${
                currentStep >= step.num ? "active" : ""
              } ${isStepDisabled(step.num) ? "disabled" : ""}`}
            >
              {step.num}
            </div>
            <span
              className={`wizard-label ${
                currentStep >= step.num ? "active" : ""
              } ${isStepDisabled(step.num) ? "disabled" : ""}`}
            >
              {step.label}
              {isStepDisabled(step.num) && (
                <span className="disabled-badge"></span>
              )}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="wizard-line-container">
              <div className="wizard-line-background"></div>
              <div
                className="wizard-line-progress"
                style={{
                  width: `${getLineProgress(index, currentStep)}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WizardSteps;
