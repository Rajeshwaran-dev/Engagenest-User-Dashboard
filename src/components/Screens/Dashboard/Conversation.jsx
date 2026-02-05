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
    {
      key: "marketing",
      label: "Marketing",
      icon: "lucide:megaphone",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    },
    {
      key: "user",
      label: "User initiated",
      icon: "lucide:users-round",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    },
    {
      key: "authentication",
      label: "Authentication",
      icon: "lucide:key",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    },
    {
      key: "business",
      label: "Business initiated",
      icon: "lucide:briefcase-business",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    },
    {
      key: "utility",
      label: "Utility",
      icon: "lucide:wrench",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    },
    {
      key: "total",
      label: "Total",
      icon: "lucide:bar-chart-4",
      gradient: "linear-gradient(135deg, #667eea 0%, #211f60 100%)",
      color: "#667eea"
    }
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
      <div className="conversation-container">
        <div className="conversation-main">
          {/* Header */}
          <div className="conversation-header">
            <div className="header-content">
              <div className="title-section">
                <Icon icon="lucide:activity" className="header-icon" />
                <h2 className="header-titles">Conversation Insights</h2>
              </div>

              <div className="filter-section" ref={dropdownRef}>
                <button
                  className="filter-button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Icon icon="lucide:calendar-days" width="18" />
                  <span>{getSelectedFilterLabel()}</span>
                  <Icon
                    icon="lucide:chevron-down"
                    width="18"
                    className={`chevron ${showFilterDropdown ? "rotated" : ""}`}
                  />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`filter-option ${selectedFilter === option.value ? "active" : ""
                          }`}
                      >
                        {option.label}
                        {selectedFilter === option.value && (
                          <Icon icon="lucide:check" width="16" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="cards-grid">
            {conversationCards.map((card, index) => (
              <div
                key={card.key}
                className="stat-cards"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="card-content">
                  <div className="card-top-section">
                    <div className="card-icon-wrapper">
                      <div
                        className="icon-gradient"
                        style={{ background: card.gradient }}
                      >
                        <Icon icon={card.icon} className="card-icon" />
                      </div>
                    </div>

                    <div className="card-info">
                      <p className="card-label">{card.label}</p>
                      <h3 className="card-value">
                        {conversationStats[card.key].toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  <div className="card-decoration" style={{ background: card.gradient }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Cards */}
        <div className="side-cards">
          {/* Upgrade Card */}
          <div className="upgrade-card">
            <div className="upgrade-content">
              <div className="upgrade-icon-bg">
                <Icon icon="lucide:zap" className="upgrade-icon" />
              </div>
              <div className="upgrade-text-section">
                <h3 className="upgrade-title">Upgrade Your Plan</h3>
                <p className="upgrade-text">Upgrade to access premium features</p>
              </div>
            </div>
            <button
              className="upgrade-button"
              style={{ cursor: "not-allowed" }}
              disabled={balanceLoading}
            >
              <Icon icon="lucide:sparkles" width="16" />
              Upgrade Now
            </button>
            <div className="upgrade-decoration"></div>
          </div>

          {/* Balance Card */}
          <div className="balance-card">
            <div className="balance-top">
              <div className="balance-icon-wrapper">
                <Icon icon="lucide:wallet" className="balance-icon" />
              </div>
              <div className="balance-info">
                <span className="balance-label">AVAILABLE BALANCE</span>
                <h2 className="balance-amount">
                  ₹{parseFloat(balanceInfo.balance).toFixed(2)}
                </h2>
                {balanceInfo.lockedBalance > 0 && (
                  <div className="locked-balance">
                    <Icon icon="lucide:lock" width="12" />
                    <span>Locked: ₹{parseFloat(balanceInfo.lockedBalance).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsAddFundModalOpen(true)}
              className="add-balance-button"
            >
              <Icon icon="lucide:plus-circle" width="16" />
              Add Balance
            </button>
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

      {/* Styles */}
      <style>{`
        .conversation-container {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          font-family: 'Outfit', sans-serif;
          padding: 0;
          animation: fadeInUp 0.6s ease-out;
        }

        .conversation-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Header Styles */
        .conversation-header {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 20px;
          padding: 12px 28px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 50;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          width: 28px;
          height: 28px;
          color: #211f60;
        }

        .header-titles {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          background: #211f60;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .filter-section {
          position: relative;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .filter-button:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-1px);
        }

        .filter-button .chevron {
          transition: transform 0.3s ease;
        }

        .filter-button .chevron.rotated {
          transform: rotate(180deg);
        }

        .filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 180px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          z-index: 1000;
          animation: dropdownSlide 0.3s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-option:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .filter-option.active {
          background: linear-gradient(135deg, #667eea 0%, #211f60 100%);
          color: white;
        }

        /* Cards Grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .stat-cards {
          position: relative;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 18px;
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardFadeIn 0.6s ease-out backwards;
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-cards:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .stat-cards:hover .card-decoration {
          height: 100%;
          opacity: 0.05;
        }

        .stat-cards:hover .icon-gradient {
          transform: scale(1.1) rotate(5deg);
        }

        .card-content {
          padding: 24px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .card-top-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .card-icon-wrapper {
          flex-shrink: 0;
        }

        .icon-gradient {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        .card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-label {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        .card-value {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .card-decoration {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 4px;
          opacity: 0.15;
          transition: all 0.4s ease;
          z-index: 0;
        }

        /* Side Cards */
        .side-cards {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 320px;
        }

        /* Upgrade Card */
        .upgrade-card {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #211f60 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          animation: cardFadeIn 0.6s ease-out 0.2s backwards;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upgrade-content {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .upgrade-icon-bg {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          backdrop-filter: blur(10px);
        }

        .upgrade-icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        .upgrade-text-section {
          flex: 1;
        }

        .upgrade-title {
          margin: 0 0 6px 0;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
        }

        .upgrade-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
        }

        .upgrade-button {
          width: 100%;
          padding: 12px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .upgrade-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .upgrade-button:disabled {
          opacity: 0.6;
        }

        .upgrade-decoration {
          position: absolute;
          top: -30%;
          right: -15%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        /* Balance Card */
        .balance-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          animation: cardFadeIn 0.6s ease-out 0.3s backwards;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .balance-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .balance-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #211f60 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
        }

        .balance-icon {
          width: 22px;
          height: 22px;
          color: white;
        }

        .balance-info {
          flex: 1;
        }

        .balance-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .balance-amount {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .locked-balance {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 6px;
          margin-top: 8px;
          width: fit-content;
        }

        .locked-balance span {
          font-size: 11px;
          font-weight: 500;
          color: #f59e0b;
        }

        .add-balance-button {
          width: 100%;
          padding: 12px 20px;
          background:linear-gradient(135deg, #667eea 0%, #211f60 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
        }

        .add-balance-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(67, 233, 123, 0.4);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .conversation-container {
            grid-template-columns: 1fr;
          }

          .side-cards {
            width: 100%;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            display: grid;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .side-cards {
            grid-template-columns: 1fr;
          }

          .header-titles {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Conversation;