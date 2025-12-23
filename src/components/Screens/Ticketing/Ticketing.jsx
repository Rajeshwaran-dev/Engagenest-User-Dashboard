import React from "react";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Conversation from "../Dashboard/Conversation";
import BroadcastMessage from "../Dashboard/BroadcastMessage";
import Breadcrumb from "../../Breadcrumb";

const Ticketing = () => {
  return (
    <>
      {/* MasterLayout */}
      
        <Breadcrumb title="Appointment Dashboard" />
        {/* Breadcrumb */}
        <section className="row gy-4">
          <Conversation />
          <BroadcastMessage />
        </section>
      
    </>
  );
};

export default Ticketing;
