import React, { useState, useEffect } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import EmptyState from "../../EmptyTables/EmptyTables";
import { useSnackbar } from "notistack";
import AddEditAgentModal from "../Modules/AddEditAgentModal";
import ChangePasswordModal from "../Modules/ChangePasswordModal";
// UPDATED IMPORT - Changed from ChatApis to AgentApi
import {
  useGetALlAgentsQuery,
  useCreateAgentMutation,
  useEditAgentMutation,
  useDeleteAgentMutation,
  useChangePasswordMutation,
} from "../../../../store/ApiFilesV2/AgentApi";

const ChatAgent = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [deleteAgentId, setDeleteAgentId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobilenumber: "",
    role: "",
    intervene: false,
    mode: "",
    id: "",
  });

  const { enqueueSnackbar } = useSnackbar();

  // RTK Query hooks - now using agentApi
  const { data: agentsData, isLoading, refetch } = useGetALlAgentsQuery();
  const [createAgent, { isLoading: isCreating }] = useCreateAgentMutation();
  const [editAgent, { isLoading: isEditing }] = useEditAgentMutation();
  const [deleteAgent, { isLoading: isDeleting }] = useDeleteAgentMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Load agents from API
  useEffect(() => {
    if (agentsData) {
      setAgents(Array.isArray(agentsData) ? agentsData : agentsData?.data || []);
    }
  }, [agentsData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (submitData) => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!submitData?.email || !emailRegex.test(submitData?.email)) {
      return enqueueSnackbar("Invalid email", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    // Mobile number validation
    if (
      submitData?.mobilenumber?.length > 15 ||
      submitData?.mobilenumber?.length < 8
    ) {
      return enqueueSnackbar("Invalid mobile number", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    // Name validation
    if (!submitData?.name?.trim()) {
      return enqueueSnackbar("Name is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    // Role validation
    if (!submitData?.role) {
      return enqueueSnackbar("Role is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    // Password validation for new agent
    if (submitData?.mode !== "edit") {
      if (!submitData?.password?.trim()) {
        return enqueueSnackbar("Password is required for new agent", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }

      if (submitData?.password?.trim().length < 8) {
        return enqueueSnackbar("Password should be at least 8 characters", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    }

    let reqBody = {
      name: submitData?.name,
      email: submitData?.email,
      mobilenumber: submitData?.mobilenumber,
      role: submitData?.role,
      intervene: submitData?.intervene || false,
    };

    // Only add password if it's provided (for create mode)
    if (submitData?.mode !== "edit" && submitData?.password?.trim()) {
      reqBody.password = submitData.password;
    }

    try {
      let response;
      if (submitData?.mode === "edit") {
        response = await editAgent({
          ...reqBody,
          agentId: submitData?.id,
        });
      } else {
        response = await createAgent(reqBody);
      }

      if (response?.error) {
        enqueueSnackbar(
          response?.error?.data?.msg ||
          "You have reached your agent limit (2). Please update your plan to add more.",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        return;
      }

      enqueueSnackbar(
        submitData?.mode === "edit"
          ? "Agent edited successfully"
          : "Agent created successfully!",
        {
          variant: "success",
          autoHideDuration: 3000,
        }
      );

      refetch();
      setShowModal(false);
      resetForm();
    } catch (error) {
      enqueueSnackbar(error?.message || "Something went wrong!", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      mobilenumber: "",
      role: "",
      intervene: false,
      mode: "",
      id: "",
    });
  };

  const handleEdit = (agent) => {
    setFormData({
      id: agent._id,
      name: agent.username || "",
      email: agent.email || "",
      password: agent.password || "", // Make sure this contains the actual password
      mobilenumber: agent.mobilenumber || "",
      role: agent.role || "",
      intervene: agent.intervene || false,
      mode: "edit",
    });
    setShowModal(true);
  };

  const handleChangePasswordClick = (agent) => {
    setSelectedAgent(agent);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePasswordModal(true);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePasswordChangeSubmit = async () => {
    // Validation
    if (!passwordFormData.currentPassword.trim()) {
      return enqueueSnackbar("Current password is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    if (!passwordFormData.newPassword.trim()) {
      return enqueueSnackbar("New password is required", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    if (passwordFormData.newPassword.trim().length < 8) {
      return enqueueSnackbar("New password should be at least 8 characters", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return enqueueSnackbar("New password and confirm password do not match", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }

    try {
      // Backend expects email, currentPassword, newPassword
      const response = await changePassword({
        email: selectedAgent.email,
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      if (response?.error) {
        enqueueSnackbar(
          response?.error?.data?.msg || "Failed to change password",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        return;
      }

      enqueueSnackbar("Password changed successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      setShowChangePasswordModal(false);
      setSelectedAgent(null);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      enqueueSnackbar(error?.message || "Something went wrong!", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handlePasswordChangeCancel = () => {
    setShowChangePasswordModal(false);
    setSelectedAgent(null);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteClick = (agentId) => {
    setDeleteAgentId(agentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAgentId) {
      enqueueSnackbar("Invalid agent ID!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      const response = await deleteAgent({ id: deleteAgentId });

      if (response?.error) {
        enqueueSnackbar(
          response?.error?.data?.msg || "Failed to delete agent!",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        return;
      }

      const agentName =
        agents.find((agent) => agent._id === deleteAgentId)?.username ||
        "Agent";
      enqueueSnackbar(`Agent "${agentName}" deleted successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      setShowDeleteModal(false);
      setDeleteAgentId(null);

      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error) {
      enqueueSnackbar(error?.message || "Something went wrong!", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteAgentId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <>
        <Breadcrumb title="Manage Agent" />
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>


    );
  }

  return (
    <>
      <Breadcrumb title="Manage Agent" />

      {/* Add Chat Agent Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <button
          className="btn-primary d-flex align-items-center gap-2"
          onClick={openAddModal}
        >
          <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
          Add Chat Agent
        </button>
      </div>

      <div className="card basic-data-table">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">S.No.</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email Id</th>
                  <th scope="col">Phone Number</th>
                  <th scope="col">Role</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {agents?.length > 0 ? (
                  agents.map((agent, index) => (
                    <tr key={agent._id || index}>
                      <td>{index + 1}</td>
                      <td>{agent.username}</td>
                      <td>{agent.email}</td>
                      <td>{agent.mobilenumber}</td>
                      <td>{agent.role}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            onClick={() => handleEdit(agent)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          >
                            <Icon icon="lucide:edit" />
                          </button>
                          <button
                            onClick={() => handleChangePasswordClick(agent)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          >
                            <Icon icon="ic:outline-lock" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(agent._id)}
                            className="w-32-px h-32-px me-8 bg-gradient-start text-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          >
                            <Icon icon="mingcute:delete-2-line" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <EmptyState />
                        <p className="mt-3 text-muted">No Agents Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Agent Modal */}
      {
        showModal && (
          <AddEditAgentModal
            showModal={showModal}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
            formData={formData}
            handleInputChange={handleInputChange}
            editingAgent={formData.mode === "edit"}
            isLoading={isCreating || isEditing}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ width: "500px" }}>
                <div className="modal-header">
                  <h3 className="modal-title">Delete Confirmation</h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                  >
                    <Icon icon="mingcute:close-line" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="">
                    <h6 className="mb-3 text-primary-2">
                      Are you sure you want to delete this agent?
                    </h6>
                  </div>
                </div>
                <div className="modal-footer justify-content-end">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Change Password Modal */}
      <ChangePasswordModal
        showModal={showChangePasswordModal}
        handleCancel={handlePasswordChangeCancel}
        selectedAgent={selectedAgent}
        passwordFormData={passwordFormData}
        handlePasswordInputChange={handlePasswordInputChange}
        handleSubmit={handlePasswordChangeSubmit}
        isLoading={isChangingPassword}
      />
    </>
  );
};

export default ChatAgent;