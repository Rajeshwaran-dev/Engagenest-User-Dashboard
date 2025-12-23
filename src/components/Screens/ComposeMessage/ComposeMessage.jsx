import React, { useState } from "react";
import SingleMsg from "./SingleMsg/SingleMsg";
import Group from "./Group/Group";
import CSV from "./Csv/CSV";
import { Link } from "react-router-dom";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";

const ComposeMessage = () => {
  const [activeTab, setActiveTab] = useState("single-msg");
  const [showAlert, setShowAlert] = useState(false);

  const [singleMsgData, setSingleMsgData] = useState({
    countryCode: "",
    mobileNumber: "",
    messageContent: "",
    campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
  });

  const [groupData, setGroupData] = useState({
    groupName: "",
    messageContent: "",
    campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
  });

  const [csvData, setCsvData] = useState({
    csvFile: null,
    messageContent: "",
    campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
    countryCode: "",
    mobileNumber: "",
    messageType: "immediate",
    scheduledDateTime: "",
    timezone: "",
    attachedFile: null,
    templateType: "",
    allowedFileTypes: [],
    maxFileSize: 0,
  });

  // ✅ Always define countryCodes as a valid array
  const countryCodes = [
    { code: "+1", country: "USA" },
    { code: "+91", country: "India" },
    { code: "+44", country: "UK" },
    { code: "+86", country: "China" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
  ];

  // ----------- SINGLE MESSAGE HANDLERS -------------
  const handleSingleMsgChange = (e) => {
    const { name, value } = e.target;
    setSingleMsgData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSingleMsgSubmit = (e) => {
    e.preventDefault();
    console.log("Single Message submitted:", singleMsgData);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSingleMsgClear = () => {
    setSingleMsgData({
      countryCode: "",
      mobileNumber: "",
      messageContent: "",
      campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
    });
  };

  // ----------- GROUP HANDLERS -------------
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    console.log("Group message submitted:", groupData);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleGroupClear = () => {
    setGroupData({
      groupName: "",
      messageContent: "",
      campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
    });
  };

  // ----------- CSV HANDLERS -------------
  const handleCsvChange = (e) => {
    const { name, value, files } = e.target || {};
    if (name === "csvFile") {
      setCsvData((prev) => ({
        ...prev,
        [name]: files?.[0] || null, // ✅ safe access
      }));
    } else {
      setCsvData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCsvSubmit = (e) => {
    e.preventDefault?.();
    console.log("CSV message submitted:", csvData);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCsvClear = () => {
    setCsvData({
      csvFile: null,
      messageContent: "",
      campaignName: "CAMP-" + Math.floor(10000 + Math.random() * 90000),
      countryCode: "",
      mobileNumber: "",
      messageType: "immediate",
      scheduledDateTime: "",
      timezone: "",
      attachedFile: null,
      templateType: "",
      allowedFileTypes: [],
      maxFileSize: 0,
    });
  };

  // ----------- TAB RENDERING -------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "single-msg":
        return (
          <SingleMsg
            formData={singleMsgData}
            handleChange={handleSingleMsgChange}
            handleSubmit={handleSingleMsgSubmit}
            handleClear={handleSingleMsgClear}
            countryCodes={countryCodes}
          />
        );

      case "group":
        return (
          <Group
            formData={groupData}
            handleChange={handleGroupChange}
            handleSubmit={handleGroupSubmit}
            handleClear={handleGroupClear}
          />
        );

      case "csv":
        return (
          <CSV
            formData={csvData}
            handleChange={handleCsvChange}
            handleSubmit={handleCsvSubmit}
            handleClear={handleCsvClear}
            countryCodes={countryCodes} // ✅ Added: prevents undefined[0] errors
          />
        );

      default:
        return null;
    }
  };

  // ----------- JSX -------------
  return (
    <>
      <Breadcrumb title="Broadcast" />
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body p-24">
            {/* Success Alert */}
            {showAlert && (
              <div className="alert alert-success border-0 shadow-sm mb-4">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle me-2 text-success"></i>
                  Message sent successfully!
                </div>
              </div>
            )}

            {/* Tab Selector Dropdown */}
            <div className="mb-4">
              <label className="fw-semibold mb-4 d-block">
                Select Message Type
              </label>

              <div className="dropdown">
                <button
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "white",
                    width: "170px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  className="btn-primary active dropdown-toggle toggle-icon rounded"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {activeTab === "single-msg" && "Single Message"}
                  {activeTab === "group" && "Group"}
                  {activeTab === "csv" && "CSV"}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${activeTab === "single-msg" ? "active" : ""
                        }`}
                      to="#"
                      onClick={() => setActiveTab("single-msg")}
                    >
                      Single Message
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${activeTab === "group" ? "active" : ""
                        }`}
                      to="#"
                      onClick={() => setActiveTab("group")}
                    >
                      Group
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${activeTab === "csv" ? "active" : ""
                        }`}
                      to="#"
                      onClick={() => setActiveTab("csv")}
                    >
                      CSV
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tab Content */}
            <div>{renderTabContent()}</div>
          </div>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </>
  );
};

export default ComposeMessage;
