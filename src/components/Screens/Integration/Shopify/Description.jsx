import React from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";


const Description = () => {
  const navigate = useNavigate();
  return (
    <>
      <Breadcrumb title="ERP Integration" />
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
      <h4>Shopify</h4>

      <p>
        Shopify is a powerful e-commerce platform that enables businesses of all
        sizes to create and manage their online stores with ease. Launched in
        2006, it provides a user-friendly interface that simplifies the process
        of setting up an online shop, even for those without technical
        expertise. With a wide range of customizable themes, payment processing
        options, and robust inventory management tools, Shopify helps merchants
        streamline their operations and enhance the customer experience.
        Additionally, its extensive app ecosystem allows for further
        customization and functionality, catering to diverse business needs.
        With built-in SEO features and marketing tools, Shopify empowers users
        to effectively reach and engage their target audience, making it a go-to
        solution for entrepreneurs looking to succeed in the digital
        marketplace.
      </p>
    </>
  );
};

export default Description;
