import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import Transaction from "./Transaction/Transaction";
import Configuration from "./Configuration/Configuration";

const Billing = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <MasterLayout>
      <Breadcrumb title="Payment Gateway" />
      <div className="col-xxl-12">
        <div className="card h-100">
          {/* MAIN TABS */}
          <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
            <ul
              className="nav bordered-tab nav-pills mb-0"
              id="pills-tab-main"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active new-flex"
                  id="pills-billing-main-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-billing-main"
                  type="button"
                  role="tab"
                  aria-controls="pills-billing-main"
                  aria-selected="true"
                >
                  <Icon
                    className="icon-adjustments"
                    icon="grommet-icons:transaction"
                  />
                  Transaction
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link new-flex"
                  id="pills-transaction-main-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-transaction-main"
                  type="button"
                  role="tab"
                  aria-controls="pills-transaction-main"
                  aria-selected="false"
                  tabIndex={-1}
                >
                  <Icon className="icon-adjustments" icon="hugeicons:configuration-02" />
                  Configurations
                </button>
              </li>
            </ul>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="tab-content" id="pills-tabContent-main">
            {/* BILLING TAB CONTENT */}
            <div
              className="tab-pane fade show active"
              id="pills-billing-main"
              role="tabpanel"
              aria-labelledby="pills-billing-main-tab"
              tabIndex={0}
            >
              <Transaction />
            </div>

            {/* TRANSACTION TAB CONTENT */}
            <div
              className="tab-pane fade"
              id="pills-transaction-main"
              role="tabpanel"
              aria-labelledby="pills-transaction-main-tab"
              tabIndex={0}
            >
              <Configuration />
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Billing;
