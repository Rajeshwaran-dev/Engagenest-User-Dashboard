import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import GroupActionModal from "../Modules/GroupActionModal";
import { useSnackbar } from "notistack";
import {
  useGetAllContactGroupsQuery,
  useCreateContactGroupMutation,
  useEditGroupMutation,
  useDeleteGroupMutation,
  useMoveOneContactMutation,
  useCopyGroupMutation,
  useGetAllContactsQuery,
  useGetContactsByGroupsMutation
} from "../../../../store/ApiFilesV2/ContactApis";

const ManageGroups = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // State management
  const [modalType, setModalType] = useState(null);
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const [formData, setFormData] = useState({
    groupName: "",
  });

  const [moveData, setMoveData] = useState({
    currentGroup: "",
    availableGroups: "",
    groupId: null
  });

  const [copyData, setCopyData] = useState({
    sourceGroup: "",
    groupId: null
  });

  // API hooks
  const {
    data: contactGroups,
    isLoading,
    refetch: groupRefetch
  } = useGetAllContactGroupsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createContactGroup] = useCreateContactGroupMutation();
  const [editGroup] = useEditGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const [moveOneContact] = useMoveOneContactMutation();
  const [copyGroup] = useCopyGroupMutation();
  const [getContactsByGroups] = useGetContactsByGroupsMutation();

  const { data: allContactsData } = useGetAllContactsQuery({
    offset: 0,
    limit: 10000,
  });

  // Transform groups data with contact counts
  useEffect(() => {
    if (contactGroups?.data && allContactsData) {
      let contactsArray = [];

      if (Array.isArray(allContactsData)) {
        contactsArray = allContactsData;
      } else if (allContactsData?.data && Array.isArray(allContactsData.data)) {
        contactsArray = allContactsData.data;
      } else if (allContactsData?.contacts && Array.isArray(allContactsData.contacts)) {
        contactsArray = allContactsData.contacts;
      }

      const groupContactCounts = {};

      contactsArray.forEach(contact => {
        let contactGroups = [];
        const possibleGroupFields = ['groups', 'group', 'groupName', 'contactGroup', 'category'];

        for (const field of possibleGroupFields) {
          if (contact[field]) {
            if (Array.isArray(contact[field])) {
              contactGroups = contact[field];
              break;
            } else if (typeof contact[field] === 'string') {
              contactGroups = contact[field].split(',').map(g => g.trim());
              break;
            }
          }
        }

        contactGroups.forEach(groupName => {
          if (groupName) {
            groupContactCounts[groupName] = (groupContactCounts[groupName] || 0) + 1;
          }
        });
      });

      const transformedGroups = contactGroups.data.map(group => {
        const groupName = group.name;
        return {
          id: group._id || group.id,
          name: groupName,
          totalContacts: groupContactCounts[groupName] || 0
        };
      });

      setGroups(transformedGroups);
    } else if (contactGroups?.data) {
      const transformedGroups = contactGroups.data.map(group => ({
        id: group._id || group.id,
        name: group.name,
        totalContacts: group.contactCount || 0
      }));

      setGroups(transformedGroups);
    }
  }, [contactGroups, allContactsData]);

  // Filter groups based on search
  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Modal handlers
  const openModal = (type, group = null) => {
    if (type === "edit" && group) {
      setEditingGroup(group);
      setFormData({
        groupName: group.name || ""
      });
    }

    if (type === "move" && group) {
      setMoveData({
        currentGroup: group.name || "",
        availableGroups: "",
        groupId: group.id
      });
    }

    if (type === "copy" && group) {
      setMoveData({
        currentGroup: group.name || "",
        availableGroups: "",
        groupId: group.id
      });
      setCopyData({
        sourceGroup: "",
        groupId: group.id
      });
    }

    if (type === "delete" && group) {
      setMoveData({
        currentGroup: group.name || "",
        availableGroups: "",
        groupId: group.id
      });
    }

    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingGroup(null);
    resetForms();
  };

  const resetForms = () => {
    setFormData({
      groupName: "",
    });
    setMoveData({
      currentGroup: "",
      availableGroups: "",
      groupId: null
    });
    setCopyData({
      sourceGroup: "",
      groupId: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMoveChange = (e) => {
    const { name, value } = e.target;
    setMoveData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyChange = (e) => {
    const { name, value } = e.target;
    setCopyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      switch (modalType) {
        case "edit":
          if (editingGroup && formData.groupName.trim()) {
            const sanitizedGroupName = formData.groupName.trim();

            // Validate no spaces in group name (if required by your backend)
            // if (/\s/.test(sanitizedGroupName)) {
            //   enqueueSnackbar("Group name cannot contain spaces!", { variant: "error" });
            //   return;
            // }

            const result = await editGroup({
              oldName: editingGroup.name,   // send OLD group name
              newName: sanitizedGroupName    // send NEW group name
            }).unwrap();

            enqueueSnackbar("Group updated successfully!", { variant: "success" });
            closeModal();

            // Force refetch
            setTimeout(() => {
              groupRefetch();
            }, 300);
          } else {
            enqueueSnackbar("Group name cannot be empty!", { variant: "error" });
          }
          break;

        case "move":
          if (moveData.currentGroup && moveData.availableGroups) {
            const result = await moveOneContact({
              currentGroup: moveData.currentGroup,
              newGroup: moveData.availableGroups
            }).unwrap();

            enqueueSnackbar("Contacts moved successfully!", { variant: "success" });
            closeModal();

            setTimeout(() => {
              groupRefetch();
            }, 300);
          } else {
            enqueueSnackbar("Please select a target group!", { variant: "error" });
          }
          break;

        case "copy":
          if (moveData.currentGroup && copyData.sourceGroup) {
            const result = await copyGroup({
              currentGroup: moveData.currentGroup,
              sourceGroup: copyData.sourceGroup
            }).unwrap();

            enqueueSnackbar("Contacts copied successfully!", { variant: "success" });
            closeModal();

            setTimeout(() => {
              groupRefetch();
            }, 300);
          } else {
            enqueueSnackbar("Please select a source group!", { variant: "error" });
          }
          break;

        case "delete":
          if (moveData.currentGroup) {
            const result = await deleteGroup({
              name: moveData.currentGroup
            }).unwrap();

            enqueueSnackbar("Group deleted successfully!", { variant: "success" });
            closeModal();

            setTimeout(() => {
              groupRefetch();
            }, 300);
          } else {
            enqueueSnackbar("Invalid group ID!", { variant: "error" });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Operation failed:", error);

      const errorMessage =
        error?.data?.message ||
        error?.data?.msg ||
        error?.data?.error ||
        error?.message ||
        "Operation failed. Please try again.";

      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  // Export handler
  const handleExportGroup = async (group) => {
    try {
      const result = await getContactsByGroups({
        group: group.name,
      });

      if (result?.data?.data?.length > 0) {
        const data = result.data.data.map(item => ({
          Name: item?.contactName || item?.name,
          "Country Code": item?.countryCode || "91",
          "Contact Number": item?.contactNumber || item?.phoneNumber,
          Group: Array.isArray(item?.groups) ? item.groups.join(", ") : item?.groups || group.name,
          UserName: item?.UserName || "-",
          "Blocked Status": item?.isBlocked ? "Yes" : "No",
          "Created At": item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : "",
        }));

        handleExport(data, `${group.name}_contacts.csv`);
        enqueueSnackbar(`${group.name} contacts exported successfully!`, { variant: "success" });
      } else {
        enqueueSnackbar("No contacts found in this group!", { variant: "warning" });
      }
    } catch (error) {
      console.error("Export error:", error);
      enqueueSnackbar("Failed to export group contacts", { variant: "error" });
    }
  };

  const handleExport = (data, filename = "export.csv") => {
    if (data.length === 0) {
      return;
    }

    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    data.forEach(row => {
      const values = headers.map(header => {
        const escapeVal = String(row[header]).replace(/"/g, '""');
        return `"${escapeVal}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Available groups for move/copy operations
  const availableGroups = groups
    .map(group => group.name)
    .filter(name => name !== moveData.currentGroup);

  if (isLoading) {
    return (
      <MasterLayout>
        <Breadcrumb title="Manage Groups" />
        <div className="text-center p-4">
          <Icon icon="mdi:loading" className="spin" style={{ fontSize: '48px' }} />
          <p className="mt-3">Loading groups...</p>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <Breadcrumb title="Manage Groups" />

      <div className="d-flex justify-content-between align-items-center mb-4 p-12">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-sm ps-5"
              placeholder="Search Group"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Icon
              icon="eva:search-fill"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/contact")}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="mingcute:group-fill"
            />
            Manage Contacts
          </button>
        </div>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">Group Name</th>
                  <th scope="col">Total Contacts</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group, index) => (
                    <tr key={group.id}>
                      <td>
                        <div className="form-check style-check d-flex align-items-center">
                          <label className="form-check-label">{index + 1}</label>
                        </div>
                      </td>
                      <td>{group.name}</td>
                      <td>{group.totalContacts}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            onClick={() => openModal("edit", group)}
                            title="Edit"
                          >
                            <Icon icon="lucide:edit" />
                          </button>
                          <button
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            onClick={() => openModal("move", group)}
                            title="Move"
                          >
                            <Icon icon="lets-icons:move-alt" />
                          </button>
                          <button
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            onClick={() => openModal("copy", group)}
                            title="Copy"
                          >
                            <Icon icon="nimbus:copy" />
                          </button>
                          <button
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            onClick={() => handleExportGroup(group)}
                            title="Export"
                          >
                            <Icon icon="gg:export" />
                          </button>
                          <button
                            className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            onClick={() => openModal("delete", group)}
                            title="Delete"
                          >
                            <Icon icon="mingcute:delete-2-line" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <Icon icon="mdi:account-group-outline" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                        <p className="text-muted mb-0">
                          {searchValue ? "No groups found matching your search" : "No groups found"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GroupActionModal
        modalType={modalType}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        moveData={moveData}
        copyData={copyData}
        onInputChange={handleInputChange}
        onMoveChange={handleMoveChange}
        onCopyChange={handleCopyChange}
        availableGroups={availableGroups}
      />
    </MasterLayout>
  );
};

export default ManageGroups;