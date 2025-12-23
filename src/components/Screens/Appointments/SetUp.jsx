import React, { useState } from "react";
import { Tabs, Card, Typography } from "antd";
import Configuration from "./Configuration";
import Reminder from "./Reminder";
import Breadcrumb from "../../Breadcrumb";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Webhook from "./Webhook";
import GoogleCalendarIntegration from "./GoogleCalendarIntegration";
import BookingForm from "./BookingForm";
import {
  BellOutlined,
  LinkOutlined,
  FormOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
// import AppointmentWorkers from "../../components/Global/CrmPopup";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

function SetUp() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [showModal, setShowModal] = useState(false);

  // Static authorized emails
  // const AUTHORIZED_EMAILS = [
  //   "admin@example.com",
  //   "manager@example.com",
  //   "superuser@example.com"
  // ];

  // React.useEffect(() => {
  //   // Simulate user check
  //   const userData = {
  //     email: "siva.k@engagenest.com",
  //     role: "admin"
  //   };

  //   localStorage.setItem("loginData", JSON.stringify(userData));

  //   if (
  //     AUTHORIZED_EMAILS.includes(userData.email) ||
  //     userData?.role === "agent"
  //   ) {
  //     setShowModal(false);
  //   } else {
  //     setShowModal(true);
  //   }
  // }, []);

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      
        <Breadcrumb title='Appointments Configuration' />

        {/* {showModal && (
          <AppointmentWorkers visible={showModal} onClose={handleModalClose} />
        )} */}

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{
              marginBottom: 0,
              paddingLeft: "16px",
            }}
          >
            <TabPane tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <BellOutlined /> Alerts
              </span>
            } key='alerts'>
              <Reminder />
            </TabPane>
            <TabPane tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <LinkOutlined /> Webhook
              </span>
            } key='webhook'>
              <Webhook />
            </TabPane>
            <TabPane tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <FormOutlined /> Booking Form
              </span>
            } key='bookingForm'>
              <BookingForm />
            </TabPane>
            {/* <TabPane icon={<CalendarOutlined />} tab="Google Calendar" key="googleCalendar">
              <GoogleCalendarIntegration />
            </TabPane> */}
          </Tabs>
        </Card>
      
    </div>
  );
}

export default SetUp;