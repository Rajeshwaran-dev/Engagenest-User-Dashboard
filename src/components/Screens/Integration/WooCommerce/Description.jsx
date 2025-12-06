import React from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";

const Description = () => {
  const navigate = useNavigate();
  return (
    <MasterLayout>
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
      <h4>Woocommerce</h4>
      <p>
        WooCommerce is a flexible and open-source e-commerce plugin built for
        WordPress. Launched in 2011, it allows businesses to turn their
        WordPress websites into fully functional online stores. With
        WooCommerce, users can customize their stores extensively, choose from a
        variety of themes, and utilize a rich ecosystem of plugins to add
        advanced functionality. It supports multiple payment gateways, shipping
        options, and tax configurations, making it ideal for businesses of all
        sizes. WooCommerce is especially appealing for those seeking a
        self-hosted solution with full control over their e-commerce operations.
      </p>
    </MasterLayout>
  );
};

export default Description;
