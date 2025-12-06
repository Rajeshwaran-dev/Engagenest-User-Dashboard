import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import Spinner from "../components/Spinner";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const sidebarMenuRef = useRef(null); // Ref for the scrollable menu container

  // Only show loading for main content, not sidebar
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Small delay for smoother transition

    return () => clearTimeout(timer);
  }, [location.pathname]); // Only trigger on pathname changes

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
        
        // 🚀 SCROLL LOGIC CHANGE: Scroll to the 'start' (top) of the clicked element
        setTimeout(() => {
            if (sidebarMenuRef.current) {
                // Scroll the clicked dropdown element into the view of its container
                clickedDropdown.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // 👈 'start' ஆக மாற்றப்பட்டுள்ளது. இதனால் துணை மெனுக்கள் தெளிவாக தெரியும்.
                });
            }
        }, 300); // Small delay to ensure max-height transition starts first
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const currentPath = location.pathname;

      // treat these routes as part of the Contacts > Contact Groups parent
      const contactGroupPaths = ["/contact", "/managegroups"];

      // treat these routes as part of Catalog > Product Catalog parent
      const catalogPaths = ["/catalog", "/products"];

      let activeDropdownOpened = false; // Flag to check if we found and opened an active dropdown

      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");

        submenuLinks.forEach((link) => {
          const href = link.getAttribute("href");
          const to = link.getAttribute("to");

          // Special rule for Contacts -> Contact Groups
          if (
            contactGroupPaths.includes(currentPath) &&
            (href === "/contact" || to === "/contact")
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            activeDropdownOpened = true; // Set flag
            return;
          }

          // Special rule for Catalog -> Product Catalog
          if (
            catalogPaths.includes(currentPath) &&
            (href === "/catalog" || to === "/catalog")
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            activeDropdownOpened = true; // Set flag
            return;
          }

          // Default behavior: open dropdown when one of its links exactly matches currentPath
          if (href === currentPath || to === currentPath) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            activeDropdownOpened = true; // Set flag
            return;
          }
        });
      });
      
      // 🚀 SCROLL LOGIC CHANGE: Scroll to the 'start' (top) of the active element on page load/path change
      if (activeDropdownOpened && sidebarMenuRef.current) {
          // Find the actively open dropdown
          const openDropdown = document.querySelector(".sidebar-menu .dropdown.open");
          if (openDropdown) {
              setTimeout(() => { // Small delay to ensure max-height animation completes
                  openDropdown.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start' // 👈 'start' ஆக மாற்றப்பட்டுள்ளது.
                  });
              }, 150);
          }
      }
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar - This remains static during navigation */}
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
              src="assets/images/main-logo.png"
              alt="site logo"
              className="light-logo"
            />
            <img
              src="assets/images/dark-logo.png"
              alt="site logo"
              className="dark-logo"
            />
            <img
              src="assets/images/logo.png"
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        {/* Attach the ref to the scrollable container */}
        <div className="sidebar-menu-area" ref={sidebarMenuRef}>
          <ul className="sidebar-menu" id="sidebar-menu">
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                  // treat automation & chatbot-builder related routes as "active" for the Automation parent
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
                  // treat integration-related routes as "active" for the Integrations Hub parent
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
                    QR Code
                  </NavLink>
                </li>
                {/* <li className="submenu-item">
                  <NavLink
                    to="/dialogflow"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
                    Dialogflow Integration
                  </NavLink>
                </li> */}
                <li className="submenu-item">
                  <NavLink
                    to="/apisettings"
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{" "}
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

                {/* Compact Q WABA Number Section */}
                <div className="d-flex align-items-center flex-wrap gap-3 ms-2 responsive-info-bar">
                  {/* WABA Number */}
                  <div className="d-flex align-items-center gap-1">
                    <Icon
                      style={{ fontSize: "24px", marginRight: "6px" }}
                      icon="logos:whatsapp-icon"
                    />
                    <span className="text-muted small d-none d-sm-inline">
                      WABA :
                    </span>
                    <span className="text-sm">919606043006</span>
                  </div>

                  <div className="vr d-none d-md-inline"></div>

                  {/* Status */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-muted small d-none d-sm-inline">
                      Status :
                    </span>
                    <span className="text-success text-sm">
                      Live
                    </span>
                  </div>

                  <div className="vr d-none d-md-inline"></div>

                  {/* Quality */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-muted small d-none d-sm-inline">
                      Quality :
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      <div
                        className="bg-success rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <span className="text-success text-sm">
                        Green
                      </span>
                    </div>
                  </div>

                  <div className="vr d-none d-lg-inline"></div>

                  {/* Tier with Progress - Improved */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small d-none d-lg-inline">
                      Tier:
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ minWidth: "80px" }}>
                        <div
                          className="progress progress-sm rounded-pill bg-light"
                          role="progressbar"
                          aria-valuenow={10}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          style={{ height: "6px" }}
                        >
                          <div
                            className="progress-bar bg-primary rounded-pill"
                            style={{ width: "10%" }}
                          />
                        </div>
                      </div>
                      <span className="text-secondary-light font-xs fw-semibold line-height-1 text-nowrap">
                        0 of 1000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                {/* Notification dropdown end */}
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
                      src="assets/images/logo.png"
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
                          />{" "}
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
                          />{" "}
                          Subscriptions
                        </Link>
                      </li>
                      <li>
                        <Link
                          style={{ fontWeight: "600", fontSize: "16px" }}
                          to="/"
                          className="dropdown-item text-primary px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                        >
                          <Icon
                            style={{ fontWeight: "600", fontSize: "16px" }}
                            icon="lucide:power"
                            className="icon text-xl"
                          />{" "}
                          Log Out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body - Only this part shows loading */}
        <div className="dashboard-main-body">
          {loading ? (
            <Spinner
              size="small"
              centered={true}
            />
          ) : (
            children
          )}
        </div>
        <footer className="d-footer"></footer>
      </main>
    </section>
  );
};

export default MasterLayout;