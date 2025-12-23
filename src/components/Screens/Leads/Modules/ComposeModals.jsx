import React, { useEffect, useState, useCallback } from "react";
import { Button, Modal, Card, Row, Col, Menu, Input } from "antd";
import FeatherIcon from "feather-icons-react";

const { Meta } = Card;

const ComposeModals = ({
  modelopen,
  data,
  setModelOpen,
  handleTemplateSelect,
  allowedTabs,
  userPlan,
}) => {
  const [modalData, setModalData] = useState({
    data: data || [],
    searchData: data || [],
  });

  const [baseFilteredData, setBaseFilteredData] = useState([]);
  const [current, setCurrent] = useState("1");
  const [searchTemplate, setSearchTemplate] = useState("");
  const [templateCategory, setTemplateCategory] = useState("marketing");

  // Vertical menu items (type filter)
  const items = [
    { label: "All", key: "1", icon: <FeatherIcon icon='grid' /> },
    { label: "Text", key: "2", icon: <FeatherIcon icon='type' /> },
    { label: "Image", key: "3", icon: <FeatherIcon icon='image' /> },
    { label: "File", key: "4", icon: <FeatherIcon icon='file-text' /> },
    { label: "Video", key: "5", icon: <FeatherIcon icon='video' /> },
  ];

  // Filter visible tabs if allowedTabs is provided
  const visibleItems = allowedTabs
    ? items.filter(item => allowedTabs.includes(item.label.toLowerCase()))
    : items;

  // Horizontal menu items (category filter)
  const topMenuItems = [
    {
      label: "Marketing",
      key: "marketing",
    },
    {
      label: "Utility",
      key: "utility",
    },
    {
      label: "Authentication",
      key: "authentication",
    },
  ];

  // Initialize base filtered data
  useEffect(() => {
    if (data?.length) {
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBaseFilteredData(sortedData);
    }
  }, [data]);

  // Combined filter function
  const applyFilters = useCallback(() => {
    if (!baseFilteredData.length) return;

    let filteredData = baseFilteredData;

    // Apply horizontal menu filter (category)
    if (templateCategory && templateCategory !== "all") {
      filteredData = filteredData.filter(
        item => item?.type?.toLowerCase() === templateCategory.toLowerCase()
      );
    }

    // Apply vertical menu filter (type)
    if (current !== "1") {
      let keyToFilter = "";
      switch (current) {
        case "2":
          keyToFilter = "text";
          break;
        case "3":
          keyToFilter = "image";
          break;
        case "4":
          keyToFilter = "file";
          break;
        case "5":
          keyToFilter = "video";
          break;
        default:
          break;
      }

      if (keyToFilter) {
        filteredData = filteredData.filter(
          item => item?.headerType === keyToFilter
        );
      }
    }

    // Apply free plan filter if userPlan is provided
    if (userPlan?.plan?.name?.toLowerCase() === "free") {
      filteredData = filteredData.filter(item => item?.subType !== "carousel");
    }

    const sortedData = [...filteredData].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setModalData({
      data: sortedData,
      searchData: sortedData,
    });
  }, [baseFilteredData, templateCategory, current, userPlan]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset when modal opens
  useEffect(() => {
    if (modelopen) {
      setCurrent("1");
      setSearchTemplate("");
    }
  }, [modelopen]);

  // Handle vertical menu click
  const onClick = e => {
    setCurrent(e.key);
  };

  // Handle horizontal menu click
  const handleTopMenuClick = e => {
    setTemplateCategory(e.key);
  };

  // Handle search
  const handleTemplateSearch = searchTerm => {
    setSearchTemplate(searchTerm);
    const filteredData = modalData?.data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setModalData(prev => ({ ...prev, searchData: filteredData }));
  };

  return (
    <Modal
      open={modelopen}
      maskClosable={false}
      onCancel={() => {
        setModelOpen(false);
        setSearchTemplate("");
        setCurrent("1");
      }}
      centered={true}
      width={1300}
      footer={null}
      style={{
        maxHeight: "90vh",
        overflowY: "auto",
        paddingTop: "10px",
      }}
    >
      <div className='modal-scroll-container'>
        <div className='compose-modal'>
          {/* Horizontal Top Menu */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "16px",
            }}
          >
            {/* Left Corner - Horizontal Menu Items */}
            <div className='horizontal-top-menu'>
              <Menu
                onClick={handleTopMenuClick}
                selectedKeys={[templateCategory]}
                mode='horizontal'
                items={topMenuItems}
                style={{
                  border: "none",
                  lineHeight: "40px",
                  minWidth: "400px",
                }}
              />
            </div>

            {/* Right Corner - Search Bar */}
            <div
              style={{
                width: "250px",
              }}
            >
              <Input
                onChange={e => {
                  handleTemplateSearch(e.target.value);
                }}
                allowClear
                value={searchTemplate}
                placeholder='Search Template'
                className='search border-1'
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  height: "35px",
                  fontSize: "16px",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>

          {/* Main Content Area with Vertical Menu */}
          <div className='row' style={{ marginLeft: 0, marginRight: 0 }}>
            {/* Vertical Menu */}
            <div
              className='col-xl-2 col-md-2 col-12'
              style={{ paddingRight: "4px", paddingLeft: "4px" }}
            >
              <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode='vertical'
                items={visibleItems}
                style={{
                  height: "100%",
                  minHeight: "400px",
                  width: "100%",
                }}
              />
            </div>

            {/* Template Cards */}
            <div
              className='col-xl-10 col-md-10 col-12'
              style={{ paddingLeft: "4px", paddingRight: "4px" }}
            >
              <div className='row' style={{ marginLeft: 0, marginRight: 0 }}>
                {modalData?.searchData?.length > 0 ? (
                  modalData.searchData.map(card => (
                    <div
                      key={card._id}
                      className='col-xl-4 col-md-6 col-12 mb-2'
                      style={{ paddingLeft: "4px", paddingRight: "4px" }}
                    >
                      <Card
                        onClick={() => handleTemplateSelect(card)}
                        bordered={true}
                        hoverable
                        cover={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "20px",
                              minHeight: "80px",
                            }}
                          >
                            <FeatherIcon
                              icon={
                                card?.headerType === "file"
                                  ? "file-text"
                                  : card?.headerType === "image"
                                    ? "image"
                                    : card?.headerType === "video"
                                      ? "video"
                                      : card?.headerType === "text"
                                        ? "type"
                                        : "file"
                              }
                              size='35'
                              color='#1ea433'
                            />
                          </div>
                        }
                      >
                        <h4>{card?.name || ""}</h4>
                        <Meta description={card?.message || ""} />
                      </Card>
                    </div>
                  ))
                ) : (
                  <div className='col-12 text-center mt-4'>
                    <h4 style={{ color: "#999" }}>No Template Available!</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ComposeModals;
