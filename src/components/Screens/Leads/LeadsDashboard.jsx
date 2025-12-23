import React from "react";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import { Icon } from "@iconify/react/dist/iconify.js";
import Overview from "./Overview";
import Performance from "./Performance";

const LeadsDashboard = () => {
  return (
    <>
      {/* MasterLayout */}
      
        <Breadcrumb title="Leads Dashboard" />
        <div className="col-xxl-12">
          <div className="card h-100">
            <div className="card-header border-bottom bg-base ps-0 py-0 pe-24 d-flex align-items-center justify-content-between">
              <ul
                className="nav bordered-tab nav-pills mb-0"
                id="pills-tab"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active new-flex"
                    id="pills-to-do-list-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-to-do-list"
                    type="button"
                    role="tab"
                    aria-controls="pills-to-do-list"
                    aria-selected="true"
                  >
                    <Icon style={{ fontSize: "22px" }}
                      className="icon-adjustments"
                      icon="mdi:graph-pie-outline"
                    />
                    Overview
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link new-flex"
                    id="pills-recent-leads-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-recent-leads"
                    type="button"
                    role="tab"
                    aria-controls="pills-recent-leads"
                    aria-selected="false"
                    tabIndex={-1}
                  >
                    <Icon className="icon-adjustments" style={{ fontSize: "20px" }} icon="streamline-ultimate:performance-increase" />
                    Performance
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-24">
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-to-do-list"
                  role="tabpanel"
                  aria-labelledby="pills-to-do-list-tab"
                  tabIndex={0}
                >
                  <Overview />
                </div>

                {/* ---------- Blocked Tab ---------- */}
                <div
                  className="tab-pane fade"
                  id="pills-recent-leads"
                  role="tabpanel"
                  aria-labelledby="pills-recent-leads-tab"
                  tabIndex={0}
                >
                  <Performance />
                </div>
              </div>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default LeadsDashboard;
