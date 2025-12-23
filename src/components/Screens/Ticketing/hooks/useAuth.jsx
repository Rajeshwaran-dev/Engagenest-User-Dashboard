import { useState, useEffect } from "react";

export const useAuth = authorizedEmails => {
  const [shouldRenderTickets, setShouldRenderTickets] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let userEmail = null;
    const userData =
      localStorage.getItem("loginData") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userInfo");

    try {
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        userEmail = parsedUserData.email;
      }

      if (!userEmail) {
        userEmail =
          localStorage.getItem("userEmail") || localStorage.getItem("email");
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      userEmail =
        localStorage.getItem("userEmail") || localStorage.getItem("email");
    }

    if (
      authorizedEmails.includes(userEmail) ||
      JSON.parse(userData)?.role === "agent"
    ) {
      setShouldRenderTickets(true);
      setShowModal(false);
    } else {
      setShouldRenderTickets(false);
      setShowModal(true);
    }
  }, [authorizedEmails]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  return {
    shouldRenderTickets,
    showModal,
    handleModalClose,
  };
};
