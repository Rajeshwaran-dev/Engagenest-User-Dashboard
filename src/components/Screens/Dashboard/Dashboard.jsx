import React from "react";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import BroadcastMessage from "./BroadcastMessage";
import Conversation from "./Conversation";

const HomePageTwo = () => {
  return (
    <>
      {/* MasterLayout */}
      
        {/* Breadcrumb */}
        <section className="row gy-4">
          <Conversation />
          <BroadcastMessage />
        </section>
      
    </>
  );
};

export default HomePageTwo;
