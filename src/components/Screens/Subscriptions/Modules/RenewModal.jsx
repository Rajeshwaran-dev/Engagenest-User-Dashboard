import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const RenewModal = () => {
  const [activeTab, setActiveTab] = useState("3months");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const features = [
    { name: "Broadcast", standard: true, enterprise: true, ecommerce: true },
    {
      name: "Realtime Analytics",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Bulk Contact Import",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Target Audience Campaign",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Live Chat & Intervene",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Export reports",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Chatbot Builder",
      standard: "2 Node Chatbot",
      enterprise: "5 Node Chatbot",
      ecommerce: "7 Node Chatbot",
    },
    { name: "Notify Me", standard: true, enterprise: true, ecommerce: true },
    {
      name: "Unlimited Agents",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Unlimited Tags",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Unlimited Attributes",
      standard: true,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "APIs / Web Hooks",
      standard: false,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Schedule Campaign",
      standard: false,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Carousel Campaign",
      standard: false,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Whatsapp Forms",
      standard: false,
      enterprise: true,
      ecommerce: true,
    },
    {
      name: "Questionnaire Flow",
      standard: false,
      enterprise: false,
      ecommerce: true,
    },
    {
      name: "ChatBot APIs Integrations",
      standard: false,
      enterprise: false,
      ecommerce: true,
    },
    {
      name: "Whatsapp Catalogue",
      standard: false,
      enterprise: false,
      ecommerce: true,
    },
  ];

  const pricing = {
    "3months": {
      standard: 199,
      enterprise: 599,
      ecommerce: 399,
      period: "/Three Months",
    },
    "6months": {
      standard: 399,
      enterprise: 999,
      ecommerce: 699,
      period: "/Six Months",
    },
    yearly: {
      standard: 699,
      enterprise: 1999,
      ecommerce: 1299,
      period: "/Yearly",
    },
  };

  const FeatureIcon = ({ included, text }) => {
    if (typeof included === "string") {
      // For chatbot builder with text values
      return <span className="text-sm fw-medium">{included}</span>;
    }

    return included ? (
      <Icon
        icon="material-symbols:check-circle"
        className="text-success"
        width="20"
      />
    ) : (
      <Icon icon="material-symbols:cancel" className="text-danger" width="20" />
    );
  };

  const currentPricing = pricing[activeTab];

  const handlePlanSelect = (planType) => {
    setSelectedPlan(planType);
  };

  const handlePayWithWallet = () => {
    if (selectedPlan) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmPayment = () => {
    // Handle payment confirmation logic here
    console.log(`Payment confirmed for ${selectedPlan} plan`);
    setShowConfirmation(false);
    setSelectedPlan(null);
    // You can add API call or other logic here
  };

  const handleCancelPayment = () => {
    setShowConfirmation(false);
  };

  const getPlanDisplayName = (planType) => {
    switch (planType) {
      case "standard":
        return "Standard";
      case "ecommerce":
        return "Ecommerce";
      case "enterprise":
        return "Enterprise";
      default:
        return "";
    }
  };

  const getBillingPeriodDisplay = () => {
    switch (activeTab) {
      case "3months":
        return "3 Months";
      case "6months":
        return "6 Months";
      case "yearly":
        return "Yearly";
      default:
        return "";
    }
  };

  const getPlanAmount = () => {
    if (!selectedPlan) return 0;
    return currentPricing[selectedPlan];
  };

  return (
    <div className="h-100 p-0 radius-12 overflow-hidden">
      <div className="card-body">
        <div className="row justify-content-center">
          <div className="col-xxl-12">
            <div className="text-center">
              <p className="mb-0 text-lg text-primary-2">
                Choose your renewal options below.
              </p>
            </div>
            <ul
              className="nav nav-pills button-tab mt-32 pricing-tab justify-content-center gap-1"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link px-24 py-10 text-md rounded-pill text-secondary-light fw-medium nonactive-tabs ${activeTab === "3months" ? "active" : ""
                    } ${hoveredTab && hoveredTab !== "3months" ? "blurred-tab" : ""
                    }`}
                  onClick={() => setActiveTab("3months")}
                  onMouseEnter={() => setHoveredTab("3months")}
                  onMouseLeave={() => setHoveredTab(null)}
                  type="button"
                >
                  3 Months
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link px-24 py-10 text-md rounded-pill text-secondary-light fw-medium nonactive-tabs ${activeTab === "6months" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("6months")}
                  type="button"
                >
                  6 Months
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link px-24 py-10 text-md rounded-pill text-secondary-light fw-medium nonactive-tabs ${activeTab === "yearly" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("yearly")}
                  type="button"
                >
                  Yearly
                </button>
              </li>
            </ul>

            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-monthly"
                role="tabpanel"
                aria-labelledby="pills-monthly-tab"
                tabIndex={0}
              >
                <div className="row">
                  {/* Standard Plan */}
                  <div className="grid-container">
                    <div className="grid-item pricing-plan-wrapper">
                      <div
                        className={`pricing-plan position-relative radius-24 overflow-hidden border bg-primary-600 text-white ${selectedPlan === "standard" ? "selected-plan" : ""
                          }`}
                        style={{
                          cursor: "pointer",
                          border: selectedPlan === "standard" ? "2px solid #007bff" : "1px solid #dee2e6"
                        }}
                        onClick={() => handlePlanSelect("standard")}
                      >
                        {/* Selection Indicator */}
                        {selectedPlan === "standard" && (
                          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: "10" }}>
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "24px", height: "24px" }}>
                              <Icon
                                icon="material-symbols:check"
                                className="text-white"
                                width="16"
                              />
                            </div>
                          </div>
                        )}

                        <div className="d-flex align-items-center gap-16">
                          <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-white">
                            <Icon
                              icon="carbon:ibm-knowledge-catalog-standard"
                              className="text-lg icon-color"
                            />
                          </span>
                          <div className="">
                            <h6 className="mb-0 text-white">For Standard</h6>
                            <span className="text-md text-white">
                              Billing Period {getBillingPeriodDisplay()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-16 mb-0 mb-28 text-white">
                          Advanced Ecommerce Chatbot Solution For Standard
                          Business
                        </p>
                        <h3 className="mb-24 text-white">
                          ${currentPricing.standard}{" "}
                          <span className="fw-medium text-md text-white">
                            {currentPricing.period}
                          </span>
                        </h3>
                        <button
                          className="bg-white text-primary-2 text-center border border-white text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayWithWallet();
                          }}
                          disabled={selectedPlan !== "standard"}
                        >
                          Pay With Wallet
                        </button>
                      </div>
                    </div>

                    <div className="grid-item pricing-plan-wrapper">
                      <div
                        className={`pricing-plan position-relative radius-24 overflow-hidden border bg-primary-600 text-white ${selectedPlan === "ecommerce" ? "selected-plan" : ""
                          }`}
                        style={{
                          cursor: "pointer",
                          border: selectedPlan === "ecommerce" ? "2px solid #007bff" : "1px solid #dee2e6"
                        }}
                        onClick={() => handlePlanSelect("ecommerce")}
                      >
                        {/* Selection Indicator */}
                        {selectedPlan === "ecommerce" && (
                          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: "10" }}>
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "24px", height: "24px" }}>
                              <Icon
                                icon="material-symbols:check"
                                className="text-white"
                                width="16"
                              />
                            </div>
                          </div>
                        )}

                        <span className="bg-white bg-opacity-25 text-primary-2 radius-24 py-8 px-24 text-sm position-absolute end-0 top-0 z-1 rounded-start-top-0 rounded-end-bottom-0">
                          Recommended
                        </span>
                        <div className="d-flex align-items-center gap-16">
                          <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-white">
                            <Icon
                              icon="mdi:cart-variant"
                              className="text-lg icon-color"
                            />
                          </span>
                          <div className="">
                            <h6 className="mb-0 text-white">For Ecommerce</h6>
                            <span className="text-md text-white">
                              Billing Period {getBillingPeriodDisplay()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-16 mb-0 text-white mb-28">
                          Advanced Ecommerce Chatbot Solution For Ecom Business
                        </p>
                        <h3 className="mb-24 text-white">
                          ${currentPricing.ecommerce}{" "}
                          <span className="fw-medium text-md text-white">
                            {currentPricing.period}
                          </span>
                        </h3>
                        <button
                          className="bg-white text-primary-2 text-center border border-white text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayWithWallet();
                          }}
                          disabled={selectedPlan !== "ecommerce"}
                        >
                          Pay With Wallet
                        </button>
                      </div>
                    </div>

                    <div className="grid-item pricing-plan-wrapper">
                      <div
                        className={`pricing-plan position-relative radius-24 overflow-hidden border bg-primary-600 text-white ${selectedPlan === "enterprise" ? "selected-plan" : ""
                          }`}
                        style={{
                          cursor: "pointer",
                          border: selectedPlan === "enterprise" ? "2px solid #007bff" : "1px solid #dee2e6"
                        }}
                        onClick={() => handlePlanSelect("enterprise")}
                      >
                        {/* Selection Indicator */}
                        {selectedPlan === "enterprise" && (
                          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: "10" }}>
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "24px", height: "24px" }}>
                              <Icon
                                icon="material-symbols:check"
                                className="text-white"
                                width="16"
                              />
                            </div>
                          </div>
                        )}

                        <div className="d-flex align-items-center gap-16">
                          <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-white">
                            <Icon
                              icon="material-symbols:enterprise-outline"
                              className="text-lg icon-color"
                            />
                          </span>
                          <div className="">
                            <h6 className="mb-0 text-white">For Enterprises</h6>
                            <span className="text-md text-white">
                              Billing Period {getBillingPeriodDisplay()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-16 mb-0 mb-28 text-white">
                          Advanced Ecommerce Chatbot Solution For Enterprises
                          Business
                        </p>
                        <h3 className="mb-24 text-white">
                          ${currentPricing.enterprise}{" "}
                          <span className="fw-medium text-md text-white">
                            {currentPricing.period}
                          </span>
                        </h3>
                        <button
                          className="bg-white text-primary-2 text-center border border-white text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayWithWallet();
                          }}
                          disabled={selectedPlan !== "enterprise"}
                        >
                          Pay With Wallet
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Table */}
        <div className="row justify-content-center">
          <div className="mt-60">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="bg-light">Features</th>
                    <th className="bg-light text-center">Standard</th>
                    <th className="bg-light text-center">Enterprise</th>
                    <th className="bg-light text-center">Ecommerce</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index}>
                      <td className="fw-medium">{feature.name}</td>
                      <td className="text-center">
                        <FeatureIcon included={feature.standard} />
                      </td>
                      <td className="text-center">
                        <FeatureIcon included={feature.enterprise} />
                      </td>
                      <td className="text-center">
                        <FeatureIcon included={feature.ecommerce} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Plan Renewal</h5>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to renew the{" "}
                  <strong>{getPlanDisplayName(selectedPlan)}</strong> plan?
                </p>
                <p>
                  Selected billing period: <strong>{getBillingPeriodDisplay()}</strong>
                </p>
                <p>
                  Amount to be charged: <strong>${getPlanAmount()}</strong>
                </p>
                <p>
                  Your current plan will be extended from its current expiry date.
                </p>
                <p className="text-danger">
                  <strong>Note:</strong> Once renewed, the wallet amount cannot be reverted.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelPayment}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewModal;