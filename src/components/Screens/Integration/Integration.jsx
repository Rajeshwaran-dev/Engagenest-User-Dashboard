import React from "react";
import { Link } from "react-router-dom";
import shopifyImg from "../../../assets/images/shopify.png";
import webengageImg from "../../../assets/images/webengage.png";
import wooCommerceImg from "../../../assets/images/woo-commerce.png";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";

const Integration = () => {
  return (
    <>
      <Breadcrumb title="Integrations Hub" />
      <div className="row">
        {/* Shopify Card */}
        <div className="col-xxl-3 col-md-4 col-sm-6 mb-8">
          <div className="card radius-12 overflow-hidden">
            <div className="card-body p-0 text-center bg-white">
              {/* Logo Section - Clickable */}
              <Link to="/shopifyflow">
                <div
                  className="bg-white p-40 d-flex align-items-center justify-content-center"
                  style={{ minHeight: "200px", cursor: "pointer" }}
                >
                  <img
                    src={shopifyImg}
                    alt="Shopify"
                    className="img-fluid"
                    style={{ maxWidth: "200px", maxHeight: "120px" }}
                  />
                </div>
              </Link>

              {/* Tab Section */}
              <div className="d-flex border-top">
                <Link
                  to="/shopifydescription"
                  className="flex-fill py-12 px-16 border-0 text-center fw-medium text-white text-decoration-none"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "var(--primary)",
                  }}
                >
                  Description
                </Link>
                <Link
                  to="/shopifyconfiguration"
                  className="flex-fill py-12 px-16 border-0 text-center fw-medium d-flex align-items-center justify-content-center gap-2 text-primary-2 text-decoration-none"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparant",
                  }}
                >
                  <i className="ri-settings-4-line"></i>
                  Config
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* WooCommerce Card */}
        <div className="col-xxl-3 col-md-4 col-sm-6 mb-8">
          <div className="card radius-12 overflow-hidden">
            <div className="card-body p-0 text-center bg-white">
              {/* Logo Section - Clickable */}
              <Link to="/woocommerceflow">
                <div
                  className="bg-white p-40 d-flex align-items-center justify-content-center"
                  style={{ minHeight: "200px", cursor: "pointer" }}
                >
                  <img
                    src={wooCommerceImg}
                    alt="WooCommerce"
                    className="img-fluid"
                    style={{ maxWidth: "200px", maxHeight: "120px" }}
                  />
                </div>
              </Link>

              {/* Tab Section */}
              <div className="d-flex border-top">
                <Link
                  to="/woocommercedescription"
                  className="flex-fill py-12 px-16 border-0 text-center fw-medium text-white text-decoration-none"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "var(--primary)",
                  }}
                >
                  Description
                </Link>
                <Link
                  to="/woocommerceconfiguration"
                  className="flex-fill py-12 px-16 border-0 text-center fw-medium d-flex align-items-center justify-content-center gap-2 text-primary-2 text-decoration-none"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparant",
                  }}
                >
                  <i className="ri-settings-4-line"></i>
                  Config
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* WooCommerce Card */}
        <div className="col-xxl-3 col-md-4 col-sm-6 mb-8">
          <div className="card radius-12 overflow-hidden">
            <div className="card-body p-0 text-center bg-white">
              {/* Logo Section - Clickable */}
              <div>
                <div
                  className="bg-white p-40 d-flex align-items-center justify-content-center"
                  style={{ minHeight: "200px", cursor: "pointer" }}
                >
                  <img
                    src={webengageImg}
                    alt="webengage"
                    className="img-fluid"
                    style={{ maxWidth: "200px", maxHeight: "120px" }}
                  />
                </div>
              </div>

              {/* Tab Section */}
              <div className="d-flex border-top">
                <Link
                  to="/webengageconfiguration"
                  className="flex-fill py-12 px-16 border-0 text-center fw-medium d-flex align-items-center justify-content-center gap-2 text-primary-2 text-decoration-none"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparent",
                  }}
                >
                  <i className="ri-settings-4-line"></i>
                  Config
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Integration;
