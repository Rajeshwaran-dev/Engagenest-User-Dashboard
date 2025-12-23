import { ShoppingCart } from "feather-icons-react";
import React from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import "../Flow.css"; // We'll create this CSS file
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const Flow = () => {
  const navigate = useNavigate();
  const flowCards = [
    {
      id: 1,
      title: "New Order",
      description:
        "Reduce your cart abandon rate by sending personalized follow-up messages to customers who leave halfway through the checkout.",
    },
    {
      id: 2,
      title: "Cancelled Order",
      description:
        "Reduce your cart abandon rate by sending personalized follow-up messages to customers who leave halfway through the checkout.",
    },
    {
      id: 3,
      title: "Abandoned Cart",
      description:
        "Reduce your cart abandon rate by sending personalized follow-up messages to customers who leave halfway through the checkout.",
    },
    {
      id: 4,
      title: "Shipping Updates (Fulfillment Create)",
      description:
        "Reduce your cart abandon rate by sending personalized follow-up messages to customers who leave halfway through the checkout.",
    },
    {
      id: 5,
      title: "Order updation",
      description:
        "Reduce your cart abandon rate by sending personalized follow-up messages to customers who leave halfway through the checkout.",
    },
  ];

  return (
    <>
      <Breadcrumb title="Shopify" />
      <div className="flow-container">
        <div className="flow-content">
          <div className="d-flex align-items-center gap-3" style={{ marginBottom: "20px" }}>
            <button
              className="btn-primary d-flex align-items-center gap-2"
              onClick={() => navigate("/integration")}
            >
              <Icon
                style={{ fontSize: "20px" }}
                icon="typcn:arrow-left-outline"
              />
              Back
            </button>
          </div>
          {/* Flow Cards Grid */}
          <div className="flow-grid" >
            {flowCards.map((card, index) => (
              <div
                key={card.id}
                className="flow-card"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Accent Bar */}
                <div className="flow-card-accent" />

                <div className="flow-card-content">
                  {/* Icon and Toggle */}
                  <div className="flow-card-header">
                    <div className="flow-card-icon">
                      <ShoppingCart className="flow-icon" strokeWidth={2} />
                    </div>

                    {/* Toggle Switch */}
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        disabled
                        className="toggle-input"
                      />
                      <div className="toggle-slider1"></div>
                    </label>
                  </div>

                  {/* Title */}
                  <h6 className="flow-card-title">{card.title}</h6>

                  {/* Description */}
                  <p className="flow-card-description">{card.description}</p>
                </div>

                {/* Hover Effect Border */}
                <div className="flow-card-hover-border" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>


  );
};

export default Flow;
