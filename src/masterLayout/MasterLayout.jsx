import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import mainLogo from "../assets/images/main-logo.png";
import darkLogo from "../assets/images/dark-logo.png";
import logoIcon from "../assets/images/logo.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { Outlet, useNavigate } from "react-router-dom";
import { useGetUserDetailsQuery } from "../store/ApiFilesV2/UserApis";

const MasterLayout = ({ children }) => {
  const navigate = useNavigate();
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const sidebarMenuRef = useRef(null);

  const { data: userDetails, isLoading: userDetailsLoading } = useGetUserDetailsQuery();

  const wabaNumber = userDetails?.data?.businessWhatsappNumber || "Not configured";
  const wabaStatus = userDetails?.data?.whatsappStatus || "inactive";
  const isActive = wabaStatus?.toLowerCase() === "active";

  useEffect(() => {
    setIsTransitioning(true);
    requestAnimationFrame(() => {
      setIsTransitioning(false);
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");
      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns first
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = "0px";
      });

      // Open clicked dropdown if it was closed
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;

        // Smooth scroll into view
        setTimeout(() => {
          if (sidebarMenuRef.current) {
            clickedDropdown.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);
      }
    };

    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a"
    );
    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    /** ✅ FIXED openActiveDropdown */
    const openActiveDropdown = () => {
      const currentPath = location.pathname;

      // Close all open dropdowns first
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = "0px";
      });

      // Open the parent dropdown whose submenu matches the route
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          const href = link.getAttribute("href");
          const to = link.getAttribute("to");

          // Match route exactly or nested (e.g. /tickets/123)
          if (
            currentPath === href ||
            currentPath === to ||
            currentPath.startsWith(`${href}/`) ||
            currentPath.startsWith(`${to}/`)
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;

            // Auto scroll open dropdown into view
            setTimeout(() => {
              dropdown.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 150);
          }
        });
      });
    };

    openActiveDropdown();

    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);


  const handleLogout = () => {
    localStorage.removeItem("loginData");
    sessionStorage.clear();
    navigate("/", { replace: true });
    window.location.reload();
  };

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay"}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn"
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/dashboard" className="sidebar-logo">
            <img
              src={mainLogo}
              alt="site logo"
              className="light-logo"
            />
            <img
              src={darkLogo}
              alt="site logo"
              className="dark-logo"
            />
            <img
              src={logoIcon}
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        <div className="sidebar-menu-area" ref={sidebarMenuRef}>
          <ul className="sidebar-menu" id="sidebar-menu">
            {/* ✅ FIXED: Keep ALL sidebar menu items exactly as they were */}
            <li className="menu-item">
              <NavLink
                to="/dashboard"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon="material-symbols:dashboard-outline"
                  className="menu-icon"
                />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/composemessage"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon="ri:broadcast-line" className="menu-icon" />
                <span>Broadcast</span>
              </NavLink>
            </li>

            {/* Chat Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="token:chat" className="menu-icon" />
                <span>Chat</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/livechat"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Live Chats
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/chathistory"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Past Chats
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/chatagent"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Manage Agents
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Contact Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="hugeicons:contact-01" className="menu-icon" />
                <span>Contacts</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/contact"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Contact Groups
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/uicontact"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    User-Initiated Contacts
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/unsubscribe"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Unsubscribed Users
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="menu-item">
              <NavLink
                to="/managetemplate"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon="gg:template" className="menu-icon" />
                <span>Template Manager</span>
              </NavLink>
            </li>

            {/* Report Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="oui:nav-reports" className="menu-icon" />
                <span>Reports</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/broadcastlogs"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Broadcast Reports
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/apilogs"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    API Reports
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/schedulelogs"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Scheduled Reports
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="menu-item">
              <NavLink
                to="/billing"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon="streamline-ultimate:cash-payment-bills"
                  className="menu-icon"
                />
                <span>Billing & Transactions</span>
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/automation"
                className={(navData) => {
                  const path = location.pathname || "";
                  const automationPrefixes = [
                    "/automation",
                    "/chatbotbuilder",
                    "/chatbotflowbuilder",
                    "/chatbot",
                    "/chatbotflow",
                  ];
                  const isAutomationRoute = automationPrefixes.some(prefix => path.startsWith(prefix));
                  return (navData.isActive || isAutomationRoute) ? "active-page" : "";
                }}
              >
                <Icon icon="uil:robot" className="menu-icon" />
                <span>Automation</span>
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/whatsappflows"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon="material-symbols:flowsheet-outline-rounded"
                  className="menu-icon"
                />
                <span>WhatsApp Forms</span>
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/integration"
                className={(navData) => {
                  const path = location.pathname || "";
                  const integrationPrefixes = ["/integration", "/shopify", "/woocommerce", "/webengage"];
                  const isIntegrationRoute = integrationPrefixes.some(prefix => path.startsWith(prefix));
                  return (navData.isActive || isIntegrationRoute) ? "active-page" : "";
                }}
              >
                <Icon
                  icon="carbon:ibm-webmethods-integration-server"
                  className="menu-icon"
                />
                <span>Integrations Hub</span>
              </NavLink>
            </li>

            {/* Leads Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="mdi:leads-outline" className="menu-icon" />
                <span>Leads</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/leads-dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Dashboard
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/leads"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Leads
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/leads-configuration"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Configuration
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Appointments Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="hugeicons:appointment-02" className="menu-icon" />
                <span>Appointments</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/appointments-dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Dashboard
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/bookings"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Bookings
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/appointment-payments"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Payments
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/appointments-configuration"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Configuration
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Ticketing Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon icon="streamline-ultimate:ticket-1" className="menu-icon" />
                <span>Ticketing</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/ticketing-dashboard"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Dashboard
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/tickets"
                    className={(navData) => {
                      const path = location.pathname || "";
                      const isTicketsRoute = path === "/tickets" || path.startsWith("/tickets/");
                      return (navData.isActive || isTicketsRoute) ? "active-page" : "";
                    }}
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Tickets
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/ticketing-configuration"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Ticket Settings
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="menu-item">
              <NavLink
                to="/payments"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon="fluent:payment-32-regular" className="menu-icon" />
                <span>Payment Gateway</span>
              </NavLink>
            </li>

            {/* Catalog Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon
                  icon="carbon:ibm-watson-knowledge-catalog"
                  className="menu-icon"
                />
                <span>Catalog</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/catalog"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Product Catalog
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/orders"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Customer Orders
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/coupons"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Coupon Management
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="menu-item">
              <NavLink
                to="/failovertrigger"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon="pajamas:trigger-source" className="menu-icon" />
                <span>Failover Trigger</span>
              </NavLink>
            </li>

            {/* Settings Dropdown */}
            <li className="dropdown menu-item">
              <Link to="#">
                <Icon
                  icon="material-symbols:settings-outline"
                  className="menu-icon"
                />
                <span>Settings</span>
              </Link>
              <ul className="sidebar-submenu">
                <li className="submenu-item">
                  <NavLink
                    to="/qrcode"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    QR Code
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/apisettings"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    API Configuration
                  </NavLink>
                </li>
                <li className="submenu-item">
                  <NavLink
                    to="/userattributes"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    User Data Fields
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          {/* Keep your existing navbar header code exactly as it was */}
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active"
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>

                <div className="d-flex align-items-center flex-wrap gap-3 ms-2 responsive-info-bar">
                  {/* WABA Number */}
                  <div className="d-flex align-items-center gap-1">
                    <Icon
                      style={{ fontSize: "24px", marginRight: "6px" }}
                      icon="logos:whatsapp-icon"
                    />
                    <span className="d-none d-sm-inline" style={{ fontWeight: "700", fontSize: "16px" }}>WABA :</span>
                    <span className="text-sm" style={{ fontWeight: "700", fontSize: "14px" }}>{wabaNumber}</span>
                  </div>

                  <div className="vr d-none d-md-inline"></div>

                  {/* Status */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="d-none d-sm-inline" style={{ fontWeight: "700", fontSize: "16px" }}>Status :</span>
                    <span style={{ fontWeight: "700", fontSize: "16px" }} className={`${isActive ? "text-success" : "text-danger"}`} >
                      {isActive ? "Active" : "Not Working"}
                    </span>
                  </div>

                  <div className="vr d-none d-md-inline"></div>

                  {/* Quality */}
                  {(() => {
                    const qualityLevel = userDetails?.data?.qualityLevel || "Green";
                    const qualityColorClass =
                      qualityLevel.toLowerCase() === "green"
                        ? "bg-success"
                        : qualityLevel.toLowerCase() === "yellow"
                          ? "bg-warning"
                          : "bg-danger";
                    return (
                      <div className="d-flex align-items-center gap-1">
                        <span className="d-none d-sm-inline" style={{ fontWeight: "700", fontSize: "16px" }}>Quality :</span>
                        <div className="d-flex align-items-center gap-1">
                          <div
                            className={`rounded-circle ${qualityColorClass}`}
                            style={{ width: "8px", height: "8px" }}
                          ></div>
                          <span className="text-capitalize" style={{ fontWeight: "700", fontSize: "16px" }}>{qualityLevel}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="vr d-none d-lg-inline"></div>

                  {/* Tier with Progress */}
                  {(() => {
                    const tierUsed = userDetails?.data?.tierUsed || 0;
                    const tierTotal = userDetails?.data?.tierTotal || 1000;
                    const tierProgress = Math.min((tierUsed / tierTotal) * 100, 100).toFixed(1);

                    return (
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small d-none d-lg-inline" style={{ fontWeight: "700", fontSize: "16px" }}>Tier:</span>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ minWidth: 80 }}>
                            <div className="progress rounded-pill bg-light" style={{ height: 6 }}>
                              <div
                                className="progress-bar bg-primary rounded-pill"
                                style={{ width: `${tierProgress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-secondary font-xs fw-semibold text-nowrap" style={{ fontWeight: "700", fontSize: "16px" }}>
                            {tierUsed} of {tierTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <ThemeToggleButton />
                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <h6
                      style={{ marginRight: "10px" }}
                      className="text-lg fw-semibold mb-2"
                    >
                      Engagenest
                    </h6>
                    <img
                      src={logoIcon}
                      alt="image_user"
                      className="w-40-px h-40-px object-fit-cover rounded-circle"
                    />
                  </button>

                  <div
                    className="dropdown-menu to-top dropdown-menu-sm"
                    style={{ padding: "18px" }}
                  >
                    <ul className="to-top-list">
                      <li>
                        <Link
                          style={{ fontWeight: "600", fontSize: "16px" }}
                          className="dropdown-item text-primary px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/profile"
                        >
                          <Icon
                            style={{ fontWeight: "600", fontSize: "16px" }}
                            icon="solar:user-linear"
                            className="icon text-xl"
                          />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          style={{ fontWeight: "600", fontSize: "16px" }}
                          className="dropdown-item text-primary px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/subscriptions"
                        >
                          <Icon
                            style={{ fontWeight: "600", fontSize: "16px" }}
                            icon="icon-park-outline:plan"
                            className="icon text-xl"
                          />
                          Subscriptions
                        </Link>
                      </li>
                      <li >
                        <button onClick={handleLogout}
                          style={{ fontWeight: "600", fontSize: "16px" }}
                          to="/"
                          className="dropdown-item text-primary px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                        >
                          <Icon
                            style={{ fontWeight: "600", fontSize: "16px" }}
                            icon="lucide:power"
                            className="icon text-xl"
                          />
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main-body">
          {console.log("MasterLayout rendering for path:", location.pathname)}
          {isTransitioning && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(to right, var(--primary), transparent)',
              zIndex: 9999,
              animation: 'slideIn 0.3s ease-out'
            }} />
          )}

          {/* ✅ FIXED: Render children if provided (for wrappers) or Outlet (for routes) */}
          {children || <Outlet />}
        </div>
        <footer className="d-footer"></footer>
      </main>
    </section>
  );
};

export default MasterLayout;