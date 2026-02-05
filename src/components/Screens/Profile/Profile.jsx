import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import mainLogo from "../../../assets/images/auth-logo.jpg";
import Breadcrumb from "../../Breadcrumb";
import ProfileEditModal from "./Modules/ProfileEditModal";
import RenewModal from "../Subscriptions/Modules/RenewModal";
import { useGetProfileQuery } from "../../../store/ApiFiles/ProfileApis";
import {
  useGetUserDetailsQuery,
  useChangeUserPasswordMutation,
  useGetLoginHistoryQuery
} from "../../../store/ApiFilesV2/UserApis";
import { toast } from "react-toastify";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // API calls
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();
  const { data: userDetails, isLoading: userDetailsLoading, refetch: refetchUserDetails } = useGetUserDetailsQuery();
  const { data: loginHistoryData, isLoading: loginHistoryLoading, refetch: refetchLoginHistory } = useGetLoginHistoryQuery();
  const [changePassword, { isLoading: isChangingPassword }] = useChangeUserPasswordMutation();

  // Debug logging
  useEffect(() => {
    console.log("Profile Data:", profileData);
    console.log("User Details:", userDetails);
    console.log("Login History Data:", loginHistoryData);
  }, [profileData, userDetails, loginHistoryData]);

  const handleRenewClick = () => {
    setShowRenewModal(true);
  };

  const handleCloseModal = () => {
    setShowRenewModal(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const result = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      }).unwrap();

      toast.success(result.msg || "Password changed successfully");

      // Reset form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error(error?.data?.msg || "Failed to change password");
    }
  };

  // Transform display data with proper null checks
  const displayData = {
    company: {
      name: userDetails?.data?.companyName || "Not specified",
      email: userDetails?.data?.email || "Not specified",
      website: userDetails?.data?.companywebsite || "Not specified",
      phone: userDetails?.data?.mobileNumber || "Not specified",
      vertical: userDetails?.data?.businessVertical || "Not specified",
      about: profileData?.whatsappAbout || "Not specified",
      description: profileData?.description || "Not specified",
      address: userDetails?.data?.Address || "Not specified",
      logo: profileData?.whatsAppDisplayImage || mainLogo,
    },
    account: {
      status: userDetails?.data?.suspend ? "Suspended" : "Active",
      statusDescription: userDetails?.data?.suspend ? "Account is currently suspended" : "Account is active",
      creationDate: userDetails?.data?.createdAt
        ? new Date(userDetails.data.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : "Not available",
      activationDate: userDetails?.data?.plan?.startDate
        ? new Date(userDetails.data.plan.startDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : "Not available",
      resellerId: userDetails?.data?.resellerId || "N/A",
      username: userDetails?.data?.username || "Not specified",
      whatsappApi: userDetails?.data?.businessWhatsappNumber || "Not configured",
      primaryMobile: userDetails?.data?.mobileNumber || "Not specified",
      primaryEmail: userDetails?.data?.email || "Not specified",
      country: userDetails?.data?.Country || "Not specified",
      state: userDetails?.data?.State || "Not specified",
      city: userDetails?.data?.City || "Not specified",
      gstNo: userDetails?.data?.gstno || "Not specified",
    },
    loginActivity: loginHistoryData?.loginHistory?.slice(0)?.map((activity, index) => {
      const deviceType = activity.deviceInfo?.type || 'Unknown';
      const os = activity.deviceInfo?.os || 'Unknown';
      const browser = activity.deviceInfo?.browser || 'Unknown';
      const city = activity.location?.city || 'Unknown';
      const country = activity.location?.country || 'Unknown';

      return {
        id: index + 1,
        device: `${deviceType} • ${os} • ${browser}`,
        ip: activity.ipAddress || "Unknown",
        time: activity.timestamp
          ? new Date(activity.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
          : "Unknown",
        location: `${city}, ${country}`,
        icon: "assets/images/logo.png",
      };
    }) || [],
    plan: {
      name: userDetails?.data?.plan?.name || "No Plan",
      expiryDate: userDetails?.data?.plan?.endDate || userDetails?.data?.plan?.expiry
        ? new Date(userDetails.data.plan.endDate || userDetails.data.plan.expiry).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : "N/A"
    }
  };

  if (profileLoading || userDetailsLoading || loginHistoryLoading) {
    return (
      <>
        <Breadcrumb title="Profile" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>


    );
  }

  return (
    <>
      <Breadcrumb title="Profile" />

      {/* Enhanced Header Section */}
      <div className="row align-items-center p-10 mb-24">
        <div className="col-md-3 col-lg-3 mb-8 new-start" style={{ width: "240px" }}>
          <div className="position-relative d-inline-block">
            <div className="avatar-wrapper position-relative">
              <img
                src={displayData.company.logo}
                alt="Company Logo"
                className="border border-4 w-140-px h-140-px rounded-circle object-fit-cover"
                style={{
                  borderColor: "var(--text-secondary) !important",
                  boxShadow: "0 8px 25px rgba(33, 31, 96, 0.15)",
                }}
              />
            </div>
          </div>
          <div className="mt-24">
            <h5 className="mb-8 text-muted" style={{ fontSize: "24px" }}>
              {displayData.company.name}
            </h5>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="col-md-9 col-lg-9">
          <div className="row g-16">
            <div className="col-md-4 mb-8">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-28 text-center">
                  <div
                    className="bg-gradient-start rounded-circle d-inline-flex align-items-center justify-content-center mb-12"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <Icon icon="mdi:email-outline" style={{ fontSize: "24px" }} />
                  </div>
                  <h6 className="text-md fw-semibold text-muted mb-8">Email</h6>
                  <p className="fw-medium text-dark mb-0">{displayData.company.email}</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-8">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-28 text-center">
                  <div
                    className="bg-gradient-start rounded-circle d-inline-flex align-items-center justify-content-center mb-12"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <Icon icon="mdi:web" style={{ fontSize: "24px" }} />
                  </div>
                  <h6 className="text-md fw-semibold text-muted mb-8">Website</h6>
                  <p className="fw-medium text-dark mb-0">{displayData.company.website}</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-8">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-28 text-center">
                  <div
                    className="bg-gradient-start rounded-circle d-inline-flex align-items-center justify-content-center mb-12"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <Icon icon="mdi:phone-outline" style={{ fontSize: "24px" }} />
                  </div>
                  <h6 className="text-md fw-semibold text-muted mb-8">Phone</h6>
                  <p className="fw-medium text-dark mb-0">{displayData.company.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-24">
        {/* Main Profile Card - col-8 */}
        <div className="col-lg-8 p-0 h-100">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 p-24 pb-0">
              <ul className="nav nav-pills nav-pills-custom gap-8" role="tablist">
                {[
                  { id: "account", label: "Account", icon: "mdi:account-outline" },
                  { id: "change-password", label: "Security", icon: "mdi:lock-outline" },
                  { id: "pricing", label: "Pricing", icon: "ion:pricetags-outline" },
                  { id: "transaction", label: "Transactions", icon: "icon-park-outline:transaction-order" },
                ].map((tab) => (
                  <li key={tab.id} className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center px-20 py-12 ${activeTab === tab.id ? "active" : ""
                        }`}
                      onClick={() => handleTabClick(tab.id)}
                      type="button"
                    >
                      <Icon icon={tab.icon} className="me-8" style={{ fontSize: "18px" }} />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-24">
              <div className="tab-content">
                {/* Account Tab */}
                <div className={`tab-pane fade ${activeTab === "account" ? "show active" : ""}`}>
                  <div className="d-flex justify-content-end align-items-center mb-24">
                    <button className="d-flex align-items-center" onClick={handleEditClick}>
                      <Icon style={{ fontSize: "24px" }} icon="la:user-edit" className="me-8" />
                    </button>
                  </div>

                  <div className="row g-20">
                    {[
                      {
                        icon: "mdi:business-card-outline",
                        label: "Business Vertical",
                        value: displayData.company.vertical,
                      },
                      {
                        icon: "icon-park-solid:address-book",
                        label: "About",
                        value: displayData.company.about,
                      },
                      {
                        icon: "streamline-plump:description",
                        label: "Description",
                        value: displayData.company.description,
                      },
                      {
                        icon: "tdesign:location",
                        label: "Address",
                        value: displayData.company.address,
                      },
                    ].map((item, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card card-hover border-0 bg-light-soft h-100">
                          <div className="card-body p-24">
                            <div className="d-flex align-items-start">
                              <Icon
                                icon={item.icon}
                                className="me-12 flex-shrink-0 mt-4"
                                style={{ fontSize: "20px" }}
                              />
                              <div>
                                <h6 className="text-md fw-semibold text-muted mb-4">
                                  {item.label}
                                </h6>
                                <p className="text-dark mb-0" style={{ lineHeight: "1.5" }}>
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Tab */}
                <div className={`tab-pane fade ${activeTab === "change-password" ? "show active" : ""}`}>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-20">
                      <label
                        htmlFor="oldPassword"
                        className="form-label fw-semibold text-primary-light text-md mb-8 color-change"
                      >
                        Old Password <span className="text-danger-600">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          className="form-control radius-8"
                          id="oldPassword"
                          name="oldPassword"
                          value={passwordForm.oldPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter Old Password*"
                          required
                        />
                        <span
                          className={`toggle-password ${passwordVisible ? "ri-eye-off-line" : "ri-eye-line"
                            } cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                          onClick={togglePasswordVisibility}
                        ></span>
                      </div>
                    </div>

                    <div className="mb-20">
                      <label
                        htmlFor="newPassword"
                        className="form-label fw-semibold text-primary-light text-md mb-8 color-change"
                      >
                        New Password <span className="text-danger-600">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={newPasswordVisible ? "text" : "password"}
                          className="form-control radius-8"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter New Password*"
                          required
                        />
                        <span
                          className={`toggle-password ${newPasswordVisible ? "ri-eye-off-line" : "ri-eye-line"
                            } cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                          onClick={toggleNewPasswordVisibility}
                        ></span>
                      </div>
                    </div>

                    <div className="mb-20">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label fw-semibold text-primary-light text-md mb-8 color-change"
                      >
                        Confirm Password <span className="text-danger-600">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          className="form-control radius-8"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm Password*"
                          required
                        />
                        <span
                          className={`toggle-password ${confirmPasswordVisible ? "ri-eye-off-line" : "ri-eye-line"
                            } cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                          onClick={toggleConfirmPasswordVisibility}
                        ></span>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isChangingPassword}>
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>

                <div
                  className={`tab-pane fade ${activeTab === "pricing" ? "show active" : ""
                    }`}
                >
                  <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                    <form action="#">
                      <div className="row">
                        <div className="col-sm-6 p-0">
                          <div className="mb-20">
                            <label
                              htmlFor="depart"
                              className="form-label fw-semibold text-primary-light text-md mb-8 color-change"
                            >
                              Pricing
                              <span className="text-danger-600"></span>{" "}
                            </label>
                            <select
                              className="form-control radius-8 form-select"
                              id="depart"
                              defaultValue=""
                            >
                              <option value="India" disabled>
                                India
                              </option>
                              <option value="Hong Kong">Hong Kong</option>
                              <option value="China">China</option>
                              <option value="Singapore">Singapore</option>
                              <option value="Srilanka">Srilanka</option>
                              <option value="Bangaladesh">Bangaladesh</option>
                              <option value="London">London</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </form>
                    <div className="mt-24">
                      <ul>
                        <li className="d-flex align-items-center gap-1 mb-12">
                          <span className="w-30 text-sm text-primary-light">
                            Service Area
                          </span>
                          <span className="w-70 text-secondary-light fw-medium">
                            :
                          </span>
                        </li>
                        <li className="d-flex align-items-center gap-1 mb-12">
                          <span className="w-30 text-sm text-primary-light">
                            Authentication cost
                          </span>
                          <span className="w-70 text-secondary-light fw-medium">
                            :
                          </span>
                        </li>
                        <li className="d-flex align-items-center gap-1 mb-12">
                          <span className="w-30 text-sm text-primary-light">
                            Marketing cost
                          </span>
                          <span className="w-70 text-secondary-light fw-medium">
                            :
                          </span>
                        </li>
                        <li className="d-flex align-items-center gap-1 mb-12">
                          <span className="w-30 text-sm text-primary-light">
                            Utility cost
                          </span>
                          <span className="w-70 text-secondary-light fw-medium">
                            :
                          </span>
                        </li>
                        <li className="d-flex align-items-center gap-1 mb-12">
                          <span className="w-30 text-sm text-primary-light">
                            Session cost
                          </span>
                          <span className="w-70 text-secondary-light fw-medium">
                            :
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Transaction Tab */}
                <div
                  className={`tab-pane fade ${activeTab === "transaction" ? "show active" : ""
                    }`}
                >
                  <div className="table-responsive scroll-sm">
                    <table className="table bordered-table mb-0">
                      <thead>
                        <tr>
                          <th scope="col">S.No</th>
                          <th scope="col">Balance</th>
                          <th scope="col">Amount Paid</th>
                          <th scope="col">GST</th>
                          <th scope="col">Gateway</th>
                          <th scope="col">Date & Time</th>
                          <th scope="col">Method</th>
                          <th scope="col">Recharge Amount</th>
                          <th scope="col">Amount Deducted</th>
                          <th scope="col">Reason</th>
                          <th scope="col">Status</th>
                          <th scope="col">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span>01</span>
                          </td>
                          <td>
                            ₹500.00
                          </td>
                          <td>
                            Paid
                          </td>
                          <td>
                            ABCD12345
                          </td>
                          <td>
                            India
                          </td>
                          <td>
                            10/13/2025, 10:23:57 AM
                          </td>
                          <td>
                            Easy
                          </td>
                          <td>
                            ₹300.00
                          </td>
                          <td>
                            ₹200.00
                          </td>
                          <td>
                            Invalid
                          </td>
                          <td>
                            <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-white bg-success">Complete</span>
                          </td>
                          <td>
                            <button className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center">
                              <Icon icon="mdi:download" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="card border-0 shadow-sm mt-24 h-100">
            <div className="card-header bg-transparent border-0">
              <h6 className="mb-0 custom-size">Account Details</h6>
            </div>
            <div className="card-body p-24">
              <div className="row">
                {[
                  {
                    title: "Basic Information",
                    items: [
                      {
                        icon: "hugeicons:user-status",
                        label: "Account Status",
                        value: displayData.account.status,
                      },

                      {
                        icon: "fontisto:date",
                        label: "Creation Date",
                        value: displayData.account.creationDate,
                      },
                      {
                        icon: "hugeicons:date-time",
                        label: "Activation Date",
                        value: displayData.account.activationDate,
                      },
                    ],
                  },
                  {
                    title: "Contact Details",
                    items: [
                      {
                        icon: "material-symbols:account-box-outline",
                        label: "Status Description",
                        value: displayData.account.statusDescription,
                      },
                      {
                        icon: "icon-park-outline:user-business",
                        label: "Reseller ID",
                        value: displayData.account.resellerId,
                      },
                      {
                        icon: "mdi:user-outline",
                        label: "Username",
                        value: displayData.account.username,
                      },


                      // {
                      //   icon: "mdi:user-outline",
                      //   label: "Primary Mobile",
                      //   value: displayData.account.primaryMobile,
                      // },
                    ],
                  },
                  {
                    title: "Business Information",
                    items: [
                      // {
                      //   icon: "ic:outline-email",
                      //   label: "Primary Email",
                      //   value: displayData.account.primaryEmail,
                      // },
                      // {
                      //   icon: "solar:global-outline",
                      //   label: "Company Website",
                      //   value: displayData.company.website,
                      // },
                      {
                        icon: "gis:search-country",
                        label: "Country",
                        value: displayData.account.country,
                      },
                      {
                        icon: "tabler:receipt-tax",
                        label: "GST No",
                        value: displayData.account.gstNo,
                      },
                      {
                        icon: "lucide:phone",
                        label: "WhatsApp API",
                        value: displayData.account.whatsappApi,
                      },
                    ],
                  },
                ].map((section, sectionIndex) => (
                  <div key={sectionIndex} className="col-md-4">
                    <h6 className="text-md fw-semibold text-muted mb-16 text-uppercase">
                      {section.title}
                    </h6>
                    <div className="space-y-16">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="d-flex align-items-start">
                          <Icon
                            icon={item.icon}
                            className="me-12 flex-shrink-0 mt-4"
                            style={{ fontSize: "18px" }}
                          />
                          <div className="flex-grow-1">
                            <p className="text-md fw-semibold text-muted mb-2">{item.label}</p>
                            <p className="text-sm text-dark mb-0">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - col-4 */}
        <div className="col-lg-4 h-100">
          {/* Subscription Plan Card */}
          <div className="card border-0 shadow-sm h-100 mt-8">
            <div className="card-header bg-transparent border-0 p-24 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 custom-size">Subscription Plan</h5>
                <span className="badge text-sm fw-semibold px-20 py-9 radius-4 text-primary fw-semibold px-12 py-4">
                  Active
                </span>
              </div>
            </div>
            <div className="card-body p-24">
              <div className="mb-24">
                <p className="text-md fw-semibold text-muted mb-12">Current Plan</p>
                <div className="card bg-light-soft border-0 p-16">
                  <div className="d-flex justify-content-between align-items-center mb-12">
                    <div>
                      <h6 className="text-dark mb-4">{displayData.plan.name.toUpperCase()}</h6>
                      <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                        {displayData.plan.expiryDate}
                      </p>
                    </div>
                    <div className="bg-primary-soft rounded-8 p-8">
                      <Icon
                        icon="mdi:cart-outline"
                        className="text-primary-2"
                        style={{ fontSize: "24px" }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleRenewClick}
                    className="btn btn-primary w-100 py-8"
                    style={{ fontSize: "14px" }}
                  >
                    Renew
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Login Activity */}
          <div className="card border-0 shadow-sm mt-24 h-100">
            <div className="card-header bg-transparent border-0 p-24 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 custom-size">Login Activity</h5>
                <button
                  className="text-primary text-md fw-semibold"
                  onClick={() => refetchLoginHistory()}
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="card-body p-24 login-activity-scroll">
              {displayData.loginActivity && displayData.loginActivity.length > 0 ? (
                <div className="space-y-16">
                  {displayData.loginActivity.map((activity) => (
                    <div key={activity.id} className="d-flex align-items-start mb-20">
                      <div className="flex-shrink-0">
                        <div className="bg-primary-soft rounded-8 p-8">
                          <Icon icon="mdi:monitor-cellphone" style={{ fontSize: "20px" }} />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-16">
                        <h6 className="text-md fw-semibold mb-4">{activity.device}</h6>
                        <p className="text-md text-muted mb-4">
                          IP Address: {activity.location}
                        </p>
                        <p className="text-md text-muted mb-0">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Icon icon="mdi:history" style={{ fontSize: "48px" }} className="text-muted mb-3" />
                  <p className="text-muted">No login activity found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showModal && (
        <ProfileEditModal
          showModal={showModal}
          setShowModal={setShowModal}
          profileData={displayData}
          refetchProfile={() => {
            refetchProfile();
            refetchUserDetails();
          }}
        />
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: "1100px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <div>
                    <Icon className="modal-icon-adjustments" icon="material-symbols:autorenew" />
                  </div>
                  <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>Renew Your Plan</h3>
                </div>
                <button type="button" className="btn-close" onClick={handleCloseModal}>
                  <Icon style={{ fontSize: "20px" }} icon="material-symbols:close-rounded" />
                </button>
              </div>
              <div className="modal-body">
                <RenewModal />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
                <button type="button" className="btn-primary" onClick={handleCloseModal}>
                  Confirm Renewal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;