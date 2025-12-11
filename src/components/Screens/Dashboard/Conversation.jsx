import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import {
  useGetTotalConvoQuery,
  useGetUserBalanceQuery
} from "../../../store/ApiFilesV2/UserApis";
import AddFundModal from "./Modules/AddFundModal";
import UpgradeModal from "./Modules/UpgradeModal";

const Conversation = () => {
  const [selectedFilter, setSelectedFilter] = useState("2");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [conversationStats, setConversationStats] = useState({
    marketing: 0,
    authentication: 0,
    utility: 0,
    service: 0,
    business: 0,
    user: 0,
    total: 0
  });

  const conversationCards = [
    { key: "marketing", label: "Marketing", icon: "nimbus:marketing" },
    { key: "user", label: "User initiated", icon: "solar:user-outline" },
    { key: "authentication", label: "Authentication", icon: "carbon:two-factor-authentication" },
    { key: "business", label: "Business initiated", icon: "icon-park-outline:user-business" },
    { key: "utility", label: "Utility", icon: "material-symbols:business-center-outline-sharp" },
    { key: "total", label: "Total", icon: "icon-park-outline:data-all" }
  ];

  const filterOptions = [
    { value: "0", label: "Today" },
    { value: "1", label: "Last 7 Days" },
    { value: "2", label: "Last 28 Days" }
  ];

  const { data: conversationData } = useGetTotalConvoQuery(
    { filter: selectedFilter },
    { skip: !selectedFilter }
  );

  const { data: balanceData, isLoading: balanceLoading } = useGetUserBalanceQuery();

  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!conversationData) return;
    const data = conversationData.data || conversationData;
    setConversationStats({
      marketing: data.marketing || 0,
      authentication: data.authentication || 0,
      utility: data.utility || 0,
      service: data.service || 0,
      business: data.business || 0,
      user: data.user || 0,
      total: data.total || 0
    });
  }, [conversationData]);

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setShowFilterDropdown(false);
  };

  const getSelectedFilterLabel = () => {
    const selected = filterOptions.find(opt => opt.value === selectedFilter);
    return selected ? selected.label : "Last 28 Days";
  };

  const getBalance = () => {
    if (!balanceData || balanceLoading) {
      return { balance: 0, lockedBalance: 0 };
    }
    const data = balanceData.data || balanceData;
    return {
      balance: data.balance || 0,
      lockedBalance: data.lockedBalance || 0
    };
  };

  const balanceInfo = getBalance();

  return (
    <>
      <div className="row gy-4">
        <div className="col-xxl-8 m-0 p-0">
          <div
            className="rounded-4 "
          >
            {/* Cards Grid */}
            <div className="row gy-3">
              <div className="d-flex justify-content-between align-items-center m-0">
                <h6 className="mb-2 text-lg">Conversation Insights</h6>

                <div className="position-relative">
                  <button
                    className="btn btn-light border-0 d-flex align-items-center justify-content-center gap-2 px-3 py-2"
                    style={{
                      width: "140px"
                    }}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <span className="fw-medium" style={{ color: "#646464" }}>{getSelectedFilterLabel()}</span>
                    <Icon
                      icon="mingcute:down-line"
                      width="16"
                      className={`transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showFilterDropdown && (
                    <div
                      className="position-absolute end-0 mt-2 rounded-4 shadow-lg border bg-white overflow-hidden z-3"
                      style={{
                        minWidth: "160px",
                        animation: "fadeIn 0.2s ease-in-out",
                      }}
                    >
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange(option.value)}
                          className={`dropdown-item px-3 py-2 text-start fw-medium ${selectedFilter === option.value
                            ? "bg-primary text-white"
                            : "text-dark"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {conversationCards.map((card) => (
                <div key={card.key} className="col-xxl-4 col-md-6">
                  <div className="card px-24 py-16 shadow-sm radius-8 border h-100 bg-gradient-start">
                    <div className="card-body p-0">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                        <div className="d-flex align-items-center">
                          <div className="w-64-px h-64-px radius-16 bg-base-50 d-flex justify-content-center align-items-center me-20">
                            <span className="mb-0 w-40-px h-40-px bg-primary flex-shrink-0 text-white d-flex justify-content-center align-items-center radius-8 h6 mb-0">
                              <Icon icon={card.icon} className="icon" />
                            </span>
                          </div>
                          <div>
                            <span className="mb-2 fw-medium text-secondary-light text-md">
                              {card.label}
                            </span>
                            <h6 className="fw-semibold my-1 fs-5">
                              {conversationStats[card.key]}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Upgrade + Balance Cards */}
        <div className="col-xxl-2 col-md-6 col-sm-6 mt-8">
          <div className="radius-8 h-100 p-16 bg-gradient-start d-flex flex-column text-center justify-content-between">
            <h6 className="text-xl">Upgrade Your Plan</h6>
            <div>
              <p className="mb-3">Upgrade to access premium features</p>
              <button
              style={{ cursor: "not-allowed" }}
                // onClick={() => setIsUpgradeModalOpen(true)}  
                className="btn-primary"
                disabled={balanceLoading}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 col-md-6 col-sm-6 mt-8">
          <div className="radius-8 h-100 p-16 bg-gradient-start d-flex flex-column">
            <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1">
              <div className="d-flex flex-column align-items-center">
                <span className="w-44-px h-44-px radius-8 d-flex justify-content-center align-items-center text-xl mb-3 border border-primary text-primary">
                  <i className="ri-money-rupee-circle-fill"></i>
                </span>
                <span className="text-neutral-700 d-block">Available Balance</span>
                <h6 className="mb-3 mt-2">
                  ₹{parseFloat(balanceInfo.balance).toFixed(2)}
                  {balanceInfo.lockedBalance > 0 && (
                    <small className="text-warning d-block mt-1">
                      (Locked: ₹{parseFloat(balanceInfo.lockedBalance).toFixed(2)})
                    </small>
                  )}
                </h6>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <button
                onClick={() => setIsAddFundModalOpen(true)}
                className="btn-primary"
                style={{ minWidth: "120px" }}
              >
                Add Balance
              </button>
            </div>
          </div>
        </div>

        <AddFundModal
          isOpen={isAddFundModalOpen}
          onClose={() => setIsAddFundModalOpen(false)}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rotate-180 { transform: rotate(180deg); transition: transform 0.2s ease-in-out; }
        .transition-all { transition: all 0.25s ease-in-out; }
        .active-glass { box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3); }
      `}</style>
    </>
  );
};

export default Conversation;
