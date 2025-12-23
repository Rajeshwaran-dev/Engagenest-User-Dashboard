import React, { useState } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import DateRangePicker from "../../Calendar/DateRangePicker";
import { useSnackbar } from "notistack";

const UiContacts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [newTag, setNewTag] = useState("");

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Rajesh K T",
      lastMessageTime: "30/10/2025, 06:15:52 pm",
      lastMessage: "Hi Rajesh",
      mobileNumber: "919894772827",
      tags: ["New", "Follow Up"],
    },
    {
      id: 2,
      name: "Priya S",
      lastMessageTime: "29/10/2025, 05:00:00 pm",
      lastMessage: "I need support.",
      mobileNumber: "919000012345",
      tags: ["Query"],
    },
    {
      id: 3,
      name: "Senthil A",
      lastMessageTime: "28/10/2025, 10:30:00 am",
      lastMessage: "Thank you!",
      mobileNumber: "919555567890",
      tags: [],
    },
  ]);

  const [selectedContacts, setSelectedContacts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "",
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all contact IDs
      const allContactIds = contacts.map(c => c.id);
      setSelectedContacts(allContactIds);
    } else {
      // Deselect all
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (e, id) => {
    if (e.target.checked) {
      // Add ID to selected list
      setSelectedContacts(prev => [...prev, id]);
    } else {
      // Remove ID from selected list
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
    }
  };

  const handleExportSelected = () => {
    if (selectedContacts.length === 0) {
      enqueueSnackbar("Please select at least one contact to export.", { variant: "warning" });
      return;
    }

    const contactsToExport = contacts.filter(c => selectedContacts.includes(c.id));
    console.log("Contacts Selected for Export:", contactsToExport);

    enqueueSnackbar(
      `${contactsToExport.length} contact prepared for download!`,
      { variant: "success" }
    );
  }

  // Tag management functions
  const openAddTagModal = (index) => {
    setCurrentContactIndex(index);
    setShowTagModal(true);
    setNewTag("");
  };

  const handleAddTag = () => {
    if (newTag.trim() === "") return;

    const updatedContacts = [...contacts];
    updatedContacts[currentContactIndex].tags.push(newTag.trim());
    setContacts(updatedContacts);
    setShowTagModal(false);
    setNewTag("");
  };

  const handleDeleteTag = (contactIndex, tagIndex) => {
    const updatedContacts = [...contacts];
    updatedContacts[contactIndex].tags.splice(tagIndex, 1);
    setContacts(updatedContacts);
  };

  const handleTagModalClose = () => {
    setShowTagModal(false);
    setNewTag("");
  };

  const isAllSelected = selectedContacts.length === contacts.length && contacts.length > 0;

  return (
    <>
      <Breadcrumb title="User Initiated Contacts" />

      <div className="d-flex justify-content-between align-items-center mb-4 p-12">
        {/* Left Side - Search and Filters */}
        <div className="d-flex align-items-center gap-3 d-md-none">
          {/* Search Input */}
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-sm ps-5"
              placeholder="Search tag / name / number"
            />
            <Icon
              icon="eva:search-fill"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="d-flex align-items-center gap-3">
          {/* Date Range Picker */}
          <div className="d-md-none">
            <DateRangePicker />
          </div>
          <button className="btn-primary d-flex align-items-center gap-2" onClick={handleExportSelected}
            style={{ opacity: selectedContacts.length > 0 ? 1 : 0.7 }}>
            <Icon
              style={{ fontSize: "20px" }}
              icon="typcn:download"
            />
            Export
          </button>
        </div>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "40px" }}>
                    <div className="form-check style-check d-flex align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col">
                    <div className="form-check style-check d-flex align-items-center">
                      <label className="form-check-label">S.No.</label>
                    </div>
                  </th>
                  <th scope="col">Last Message Time</th>
                  <th scope="col">Name</th>
                  <th scope="col">Last Message</th>
                  <th scope="col">Tags</th>
                  <th scope="col">Mobile Number</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(e, contact.id)}
                        />
                      </div>
                    </td>
                    {/* ------------------------------------ */}
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <label className="form-check-label">{contact.id}</label>
                      </div>
                    </td>
                    <td>
                      {contact.lastMessageTime}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {contact.name}
                      </div>
                    </td>
                    <td>
                      {contact.lastMessage}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        {contact.tags.map((tag, tagIndex) => (
                          <span style={{ cursor: "pointer" }}
                            key={tagIndex}
                            className="contact-badge tag-badge"

                            onClick={() => handleDeleteTag(index, tagIndex)}
                          >
                            {tag} ×
                          </span>
                        ))}
                        <button
                          className="contact-badge add-badge"
                          onClick={() => openAddTagModal(index)}
                        >
                          + Add Tag
                        </button>
                      </div>
                    </td>
                    <td>
                      {contact.mobileNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      {showTagModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Add New Tag</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleTagModalClose}
                >
                  <Icon icon="material-symbols:close-rounded" />
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="newTag" className="form-label">
                    Enter new tag
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTagModalClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>


  );
};

export default UiContacts;
