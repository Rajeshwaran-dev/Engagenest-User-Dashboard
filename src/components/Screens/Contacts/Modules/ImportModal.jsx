import React, { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import {
  useGetUserAttrQuery,
} from "../../../../store/ApiFilesV2/UserApis";
import {
  useGetAllContactGroupsQuery,
  useImportContactsMutation,
} from "../../../../store/ApiFilesV2/ContactApis";
import {
  useGetCsvHeadersMutation,
} from "../../../../store/ApiFilesV2/FileHandlerApis";
import { Icon } from "@iconify/react/dist/iconify.js";
import _ from "lodash";

const ImportContactModel = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  // States
  const [formData, setFormData] = useState({
    group: "", // This will now store comma-separated string of selected groups
    headers: [],
    fileUrl: "",
    contactName: "",
    countryCode: "",
    phoneNumber: "",
  });

  const [previewData, setPreviewData] = useState([]);
  const [userAttributes, setUserAttributes] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInvalidContacts, setHasInvalidContacts] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [fileList, setFileList] = useState([]);

  // New state for group input (tag input style)
  const [groupInput, setGroupInput] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [availableGroupNames, setAvailableGroupNames] = useState([]);

  // Add columns state for dynamic table structure
  const [columns, setColumns] = useState({
    columns: [],
    data: [],
  });

  // Get API URL
  const getApiUrl = () => {
    if (typeof process.env !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    else if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    else {
      console.warn("No API URL found in environment variables. Using relative URL.");
      return "/api/";
    }
  };

  const API_URL = getApiUrl();

  // API hooks
  const { data: userAttributesData } = useGetUserAttrQuery();
  const { data: groupsData } = useGetAllContactGroupsQuery();
  const [getCsvHeaders] = useGetCsvHeadersMutation();
  const [importContacts] = useImportContactsMutation();

  // Extract available groups
  useEffect(() => {
    if (groupsData?.data) {
      const groupNames = groupsData.data.map(group => group.name || group.id || "");
      setAvailableGroupNames(groupNames);

      setAvailableGroups(groupsData.data.map(group => ({
        value: group.name || group.id || "",
        label: group.name || "Unnamed Group"
      })));
    }
  }, [groupsData]);

  // Structure columns with dynamic user attributes
  const structureColumnsWithDynamicUsrAttr = useCallback(() => {
    const baseColumns = [
      { title: "Contact Name", dataIndex: "contactName" },
      { title: "Country Code", dataIndex: "countryCode" },
      { title: "Phone Number", dataIndex: "phoneNumber" },
    ];

    if (userAttributes.length > 0) {
      const attrColumns = userAttributes.map(attr => ({
        title: attr.displayName || attr.key,
        dataIndex: attr.key,
      }));

      setColumns(prev => ({
        ...prev,
        columns: [...baseColumns, ...attrColumns],
      }));
    } else {
      setColumns(prev => ({
        ...prev,
        columns: baseColumns,
      }));
    }
  }, [userAttributes]);

  // Extract user attributes and initialize formData with dynamic keys
  useEffect(() => {
    if (userAttributesData) {
      const attrs = Array.isArray(userAttributesData)
        ? userAttributesData
        : userAttributesData?.data || [];

      setUserAttributes(attrs.map(attr => ({
        key: attr.key,
        displayName: attr.val || attr.key,
        mappedTo: "",
      })));

      // Initialize formData with all user attribute keys
      setFormData(prev => {
        const newFormData = { ...prev };
        attrs.forEach(attr => {
          if (!newFormData.hasOwnProperty(attr.key)) {
            newFormData[attr.key] = "";
          }
        });
        return newFormData;
      });
    }
  }, [userAttributesData]);

  // Update columns structure when userAttributes change
  useEffect(() => {
    if (userAttributes.length > 0) {
      structureColumnsWithDynamicUsrAttr();
    }
  }, [userAttributes, structureColumnsWithDynamicUsrAttr]);

  // GROUPS FUNCTIONS (new - same as ContactActionModal)
  const handleGroupKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addGroup(groupInput.trim());
    }
  };

  const addGroup = (groupName) => {
    if (!groupName) return;

    const currentGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    // Check if group already exists
    if (currentGroups.includes(groupName)) {
      setGroupInput("");
      setShowGroupDropdown(false);
      enqueueSnackbar(`Group "${groupName}" already added`, {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    // Add the new group
    const newGroups = [...currentGroups, groupName];
    setFormData(prev => ({
      ...prev,
      group: newGroups.join(", ")
    }));

    setGroupInput("");
    setShowGroupDropdown(false);

    // Add to available groups if it's new
    if (!availableGroupNames.includes(groupName)) {
      setAvailableGroupNames(prev => [...prev, groupName]);
    }
  };

  const removeGroup = (groupToRemove) => {
    const currentGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    const newGroups = currentGroups.filter(g => g !== groupToRemove);
    setFormData(prev => ({
      ...prev,
      group: newGroups.join(", ")
    }));
  };

  const selectExistingGroup = (groupName) => {
    const currentGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    if (!currentGroups.includes(groupName)) {
      const newGroups = [...currentGroups, groupName];
      setFormData(prev => ({
        ...prev,
        group: newGroups.join(", ")
      }));
    }

    setGroupInput("");
    setShowGroupDropdown(false);
  };

  const filteredGroupSuggestions = availableGroupNames.filter(
    group => group.toLowerCase().includes(groupInput.toLowerCase()) &&
      !formData.group.split(",").map(g => g.trim()).includes(group)
  );

  // Reset function
  const resetAll = () => {
    const baseFormData = {
      group: "",
      headers: [],
      fileUrl: "",
      contactName: "",
      countryCode: "",
      phoneNumber: "",
    };

    userAttributes.forEach(attr => {
      baseFormData[attr.key] = "";
    });

    setFormData(baseFormData);
    setGroupInput("");
    setShowGroupDropdown(false);
    setFileList([]);
    setPreviewData([]);
    setCsvHeaders([]);
    setFileUploaded(false);
    setHasInvalidContacts(false);

    setColumns(prev => ({
      ...prev,
      data: [],
    }));
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      enqueueSnackbar("Please upload a CSV file", {
        variant: "error",
        autoHideDuration: 3000,
      });
      event.target.value = null;
      return;
    }

    setIsLoading(true);
    setFileList([{ name: file.name, status: 'uploading' }]);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      const token = loginDetails?.token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const uploadEndpoint = "filehandler/upload/temp";
      const uploadUrl = `${API_URL}${uploadEndpoint}`.replace(/([^:]\/)\/+/g, "$1");

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult?.fileUrl || uploadResult?.data?.fileUrl || uploadResult?.url;

      if (!fileUrl) {
        throw new Error("File upload failed - no URL returned");
      }

      setFileList([{ name: file.name, status: 'done' }]);

      const headersResult = await getCsvHeaders({
        url: fileUrl,
      }).unwrap();

      let headers = headersResult?.data?.data || headersResult?.data || headersResult || [];

      if (!Array.isArray(headers)) {
        if (typeof headers === 'string') {
          headers = headers.split(',').map(h => h.trim());
        } else {
          headers = [];
        }
      }

      if (headers.length === 0) {
        throw new Error("No headers found in CSV file");
      }

      setCsvHeaders(headers);

      const newFormData = {
        group: formData.group,
        headers: headers,
        fileUrl: fileUrl,
        contactName: "",
        countryCode: "",
        phoneNumber: "",
      };

      userAttributes.forEach(attr => {
        newFormData[attr.key] = "";
      });

      setFormData(newFormData);

      setUserAttributes(prev =>
        prev.map(attr => ({
          ...attr,
          mappedTo: "",
        }))
      );

      setFileUploaded(true);
      setPreviewData([]);
      setHasInvalidContacts(false);

      setColumns(prev => ({
        ...prev,
        data: [],
      }));

      enqueueSnackbar("File uploaded successfully! Now map your CSV columns.", {
        variant: "success",
        autoHideDuration: 3000,
      });

    } catch (error) {
      console.error("File upload error details:", error);

      let errorMessage = "Failed to upload file";
      if (error.message) {
        errorMessage += ": " + error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });

      setFileList([]);
      setFileUploaded(false);
      event.target.value = null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle user attribute mapping
  const handleUserAttributeMapping = (attrKey, csvHeader) => {
    setUserAttributes(prev =>
      prev.map(attr =>
        attr.key === attrKey ? { ...attr, mappedTo: csvHeader } : attr
      )
    );

    setFormData(prev => ({
      ...prev,
      [attrKey]: csvHeader,
    }));
  };

  // Transform headers - convert spaces to underscores and lowercase
  const transformHeaders = (header) => {
    if (!header) return "";
    return header.trim().replace(/\s+/g, "_").toLowerCase();
  };

  // 🔧 FIX 1: Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    const selectedGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    return !!(
      selectedGroups.length > 0 &&
      formData.contactName &&
      formData.contactName.trim() !== "" &&
      formData.countryCode &&
      formData.countryCode.trim() !== "" &&
      formData.phoneNumber &&
      formData.phoneNumber.trim() !== "" &&
      formData.fileUrl &&
      fileUploaded
    );
  };

  // 🔧 FIX 2: Handle preview with proper header transformation
  const handlePreview = async () => {
    // Validate required fields
    const selectedGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    if (selectedGroups.length === 0) {
      enqueueSnackbar("Please add at least one group", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!formData.contactName || formData.contactName.trim() === "") {
      enqueueSnackbar("Please select Contact Name field from CSV", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!formData.countryCode || formData.countryCode.trim() === "") {
      enqueueSnackbar("Please select Country Code field from CSV", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      enqueueSnackbar("Please select Phone Number field from CSV", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!formData.fileUrl) {
      enqueueSnackbar("No file uploaded", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Transform headers before sending (matching old working code)
      const reformedFormData = {};

      // 🔧 CRITICAL FIX: Backend expects group as an ARRAY, not a string
      // Use selected groups array
      reformedFormData.group = selectedGroups;

      reformedFormData.contactName = transformHeaders(formData.contactName);
      reformedFormData.countryCode = transformHeaders(formData.countryCode);
      reformedFormData.phoneNumber = transformHeaders(formData.phoneNumber);

      // Transform user attributes if they are mapped
      userAttributes.forEach(attr => {
        if (formData[attr.key] && formData[attr.key].trim() !== "") {
          reformedFormData[attr.key] = transformHeaders(formData[attr.key]);
        }
      });

      console.log("Preview mappings:", reformedFormData);
      console.log("Preview fileUrl:", formData.fileUrl);

      const previewResult = await importContacts({
        fileUrl: formData.fileUrl,
        mapings: reformedFormData,
        mode: "preview",
      }).unwrap();

      console.log("Full Preview result:", JSON.stringify(previewResult, null, 2));

      // Try multiple possible response structures
      let data = null;
      let contacts = [];
      let invalidContacts = [];

      if (previewResult?.data?.data) {
        data = previewResult.data.data;
        console.log("Data found at: previewResult.data.data");
      } else if (previewResult?.data) {
        data = previewResult.data;
        console.log("Data found at: previewResult.data");
      } else if (previewResult) {
        data = previewResult;
        console.log("Data found at: previewResult");
      }

      if (data) {
        contacts = data?.contacts || [];
        invalidContacts = data?.invalidContacts || [];
        console.log("Contacts found:", contacts.length);
        console.log("Invalid contacts found:", invalidContacts.length);
      }

      const allContacts = [...contacts, ...invalidContacts];

      if (allContacts.length > 0) {
        console.log("=== CONTACT DATA ANALYSIS ===");
        console.log("Available keys in contact data:", Object.keys(allContacts[0]));
        console.log("Full first contact:", JSON.stringify(allContacts[0], null, 2));
      }

      if (allContacts.length === 0) {
        console.error("No contacts found in response. Full response:", previewResult);
        enqueueSnackbar("No contacts found in the preview. Check console for details.", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        return;
      }

      // 🔧 FIX 3: Properly normalize the contact data to match table structure
      const normalizedContacts = allContacts.map(contact => {
        const normalized = {};

        // Map Contact Name - try multiple possible keys
        normalized.contactName = contact.contactName || contact.name || contact.Name || "-";

        // Map Country Code - try multiple possible keys
        normalized.countryCode = contact.countryCode || contact.country_code || contact.CountryCode || "-";

        // 🔧 CRITICAL FIX: Map Phone Number correctly
        // The API returns "contactNumber" but we need "phoneNumber" for display
        normalized.phoneNumber = contact.contactNumber || contact.phoneNumber || contact.phone_number || contact.mobileNumber || contact.mobile_number || "-";

        // Map user attributes dynamically
        userAttributes.forEach(attr => {
          // Try to find the attribute in the contact data with multiple key variations
          const attrValue = contact[attr.key] ||
            contact[attr.key?.toLowerCase()] ||
            contact[attr.key?.toUpperCase()] ||
            "-";
          normalized[attr.key] = attrValue;
        });

        // Check if this contact has an error
        if (contact.error) {
          normalized._hasError = true;
          normalized._errorMessage = contact.error;
        }

        return normalized;
      });

      // Update both previewData and columns.data
      setPreviewData(normalizedContacts);
      setColumns(prev => ({
        ...prev,
        data: normalizedContacts,
      }));

      console.log("Updated columns.data with", normalizedContacts.length, "contacts");
      console.log("Normalized first contact:", JSON.stringify(normalizedContacts[0], null, 2));

      setHasInvalidContacts(invalidContacts.length > 0);

      if (invalidContacts.length > 0) {
        enqueueSnackbar(
          `Uploaded File has Invalid country code. Fix it to enable the import button.`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
      } else {
        enqueueSnackbar(
          previewResult?.data?.msg || `Preview loaded successfully! Found ${contacts.length} contacts.`,
          {
            variant: "success",
            autoHideDuration: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Preview error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to load preview";
      if (error.message) {
        errorMessage += ": " + error.message;
      } else if (error?.data?.message) {
        errorMessage += ": " + error.data.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import with header transformation
  const handleImport = async () => {
    if (hasInvalidContacts) {
      enqueueSnackbar(
        "There are invalid contacts in the uploaded file. Please fix them before importing.",
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      return;
    }

    const selectedGroups = formData.group
      .split(",")
      .map(g => g.trim())
      .filter(g => g);

    if (selectedGroups.length === 0) {
      enqueueSnackbar("Please add at least one group", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (previewData.length === 0) {
      enqueueSnackbar("Please view preview before importing", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Transform headers before sending (same as preview)
      const reformedFormData = {};

      // Use selected groups array
      reformedFormData.group = selectedGroups;

      reformedFormData.contactName = transformHeaders(formData.contactName);
      reformedFormData.countryCode = transformHeaders(formData.countryCode);
      reformedFormData.phoneNumber = transformHeaders(formData.phoneNumber);

      userAttributes.forEach(attr => {
        if (formData[attr.key] && formData[attr.key].trim() !== "") {
          reformedFormData[attr.key] = transformHeaders(formData[attr.key]);
        }
      });

      const importResult = await importContacts({
        fileUrl: formData.fileUrl,
        mapings: reformedFormData,
        mode: "save",
      }).unwrap();

      enqueueSnackbar("Contacts imported successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      if (onImportSuccess) {
        onImportSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Import error:", error);

      let errorMessage = "Failed to import contacts";
      if (error.message) {
        errorMessage += ": " + error.message;
      } else if (error?.data?.message) {
        errorMessage += ": " + error.data.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset file
  const resetFile = () => {
    const newFormData = {
      group: formData.group, // Keep current groups
      headers: [],
      fileUrl: "",
      contactName: "",
      countryCode: "",
      phoneNumber: "",
    };

    userAttributes.forEach(attr => {
      newFormData[attr.key] = "";
    });

    setFormData(newFormData);

    setUserAttributes(prev =>
      prev.map(attr => ({
        ...attr,
        mappedTo: "",
      }))
    );

    setCsvHeaders([]);
    setFileUploaded(false);
    setFileList([]);
    setPreviewData([]);
    setHasInvalidContacts(false);

    setColumns(prev => ({
      ...prev,
      data: [],
    }));

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = null;
    }
  };

  // Reset form
  const resetForm = () => {
    resetAll();
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedGroups = formData.group
    .split(",")
    .map(g => g.trim())
    .filter(g => g);

  return (
    <div
      className="modal-overlay"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-content" style={{ width: "1200px", maxHeight: "90vh" }}>
        <div className="modal-header">
          <div className="d-flex align-items-center">
            <div>
              <Icon
                className="modal-icon-adjustments"
                icon="hugeicons:contact-book"
              />
            </div>
            <h3
              className="modal-title"
              style={{ marginTop: "2px", marginLeft: "10px" }}
            >
              Import Contacts from CSV
            </h3>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body p-30" style={{ overflowY: "auto", maxHeight: "calc(90vh - 150px)" }}>
          <div className="row">
            {/* Step 1: Group Selection - UPDATED to match ContactActionModal */}
            <div className="col-md-6 mb-4">
              <label
                className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Group * 

                {/* Tooltip Icon */}
                <div className="custom-tooltip-container">
                  <Icon
                    icon="mdi:information-outline"
                    style={{
                      fontSize: "18px",
                      color: "#6c757d",
                      verticalAlign: "middle",
                      cursor: "pointer",
                    }}
                  />
                  <span className="custom-tooltip-text1">
                    Type to add a new group or select from existing ones.
                  </span>
                </div>
              </label>
              <div className="position-relative">
                <div
                  className="d-flex flex-wrap p-2 border rounded position-relative"
                  style={{
                    minHeight: "48px",
                    alignItems: "center",
                    cursor: "text",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    document.getElementById("groupInput").focus();
                    setShowGroupDropdown(!showGroupDropdown);
                  }}
                >
                  {/* Display selected groups as tags */}
                  {selectedGroups.map((group, index) => (
                    <span
                      className="contact-badge group-badge d-flex align-items-center"
                      key={index}
                    >
                      {group}
                      <Icon
                        icon="material-symbols:close-rounded"
                        style={{
                          fontSize: "18px",
                          marginLeft: "6px",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroup(group);
                        }}
                      />
                    </span>
                  ))}

                  {/* Input box */}
                  <input
                    id="groupInput"
                    type="text"
                    className="form-control"
                    value={groupInput}
                    onChange={(e) => {
                      setGroupInput(e.target.value);
                      setShowGroupDropdown(true);
                    }}
                    onKeyDown={handleGroupKeyDown}
                    onFocus={() => setShowGroupDropdown(true)}
                    onBlur={() => setTimeout(() => setShowGroupDropdown(false), 200)}
                    placeholder=""
                    disabled={isLoading}
                    style={{
                      border: "none",
                      outline: "none",
                      minWidth: "160px",
                      flex: "1 1 160px",
                      background: "transparent",
                      padding: "6px",
                    }}
                  />

                  {/* Dropdown toggle icon */}
                  <Icon
                    icon={showGroupDropdown ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width="22"
                    style={{
                      marginLeft: "auto",
                      color: "#6c757d",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGroupDropdown(!showGroupDropdown);
                    }}
                  />

                  {/* Dropdown list */}
                  {showGroupDropdown && (
                    <ul
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginTop: "4px",
                        padding: "4px 0",
                        listStyle: "none",
                        maxHeight: "180px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {/* Option to add new group */}
                      {groupInput && !availableGroupNames.includes(groupInput) && (
                        <li
                          onClick={() => addGroup(groupInput)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#1f1750",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                          onMouseLeave={(e) => (e.target.style.background = "transparent")}
                        >
                          <Icon icon="icon-park-outline:add" style={{ fontSize: "16px" }} />
                          Add “{groupInput}” as new group
                        </li>
                      )}

                      {/* Existing groups */}
                      {filteredGroupSuggestions.map((group, index) => (
                        <li
                          key={index}
                          onClick={() => selectExistingGroup(group)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                          onMouseLeave={(e) => (e.target.style.background = "transparent")}
                        >
                          {group}
                        </li>
                      ))}

                      {/* No results */}
                      {filteredGroupSuggestions.length === 0 && !groupInput && (
                        <li
                          style={{
                            padding: "8px 12px",
                            color: "#999",
                            fontSize: "14px",
                            textAlign: "center",
                          }}
                        >
                          No groups available
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: File Upload */}
            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold text-dark required">
                Choose Csv File
              </label>
              <div className="csv-upload-wrapper">
                <input
                  id="csvInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  style={{ display: "none" }}
                />

                <label
                  htmlFor="csvInput"
                  className={`csv-upload-pill ${isLoading ? "disabled" : ""}`}
                  title={fileUploaded ? fileList[0]?.name : "Choose CSV file"}
                >
                  <span className="csv-pill-left">
                    <Icon
                      icon={fileUploaded ? "mdi:check-circle" : "mdi:cloud-upload-outline"}
                      width="18"
                    />
                  </span>

                  <span className="csv-pill-text">
                    {fileUploaded ? (
                      <strong className="filename">{fileList[0]?.name}</strong>
                    ) : (
                      "Choose CSV File"
                    )}
                    <small className="ms-2 csv-pill-note"></small>
                  </span>
                </label>
              </div>
            </div>

            {/* Required Fields Mapping */}
            <div className="col-md-4 mb-4">
              <label className="form-label fw-semibold text-dark required">
                Contact Name Field
              </label>
              <select
                className="form-select"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                disabled={isLoading || !csvHeaders.length}
              >
                <option value="">Select CSV Column</option>
                {csvHeaders.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-4">
              <label className="form-label fw-semibold text-dark required">
                Country Code Field
              </label>
              <select
                className="form-select"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
                disabled={isLoading || !csvHeaders.length}
              >
                <option value="">Select CSV Column</option>
                {csvHeaders.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-4">
              <label className="form-label fw-semibold text-dark required">
                Mobile Number Field
              </label>
              <select
                className="form-select"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading || !csvHeaders.length}
              >
                <option value="">Select CSV Column</option>
                {csvHeaders.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Attributes Mapping */}
            {userAttributes.length > 0 && (
              <>
                <div className="col-12 mb-2 mt-4">
                  <h6 className="text-primary">Custom Attributes (Optional)</h6>
                </div>
                {userAttributes.map((attr) => (
                  <div className="col-md-4 mb-3" key={attr.key}>
                    <label className="form-label fw-semibold text-dark">
                      {attr.displayName}
                    </label>
                    <select
                      className="form-select"
                      value={formData[attr.key] || ""}
                      onChange={(e) => handleUserAttributeMapping(attr.key, e.target.value)}
                      disabled={isLoading || !csvHeaders.length}
                    >
                      <option value=""></option>
                      {csvHeaders.map((header, index) => (
                        <option key={index} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}

            {/* Action Buttons */}
            <div className="col-12 mt-4">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePreview}
                  disabled={isLoading || !areRequiredFieldsFilled()}
                >
                  {isLoading ? (
                    <>
                      <span className=" me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    "View Preview"
                  )}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetFile}
                  disabled={isLoading || !fileUploaded}
                >
                  Reset File
                </button>
              </div>
            </div>

            {/* 🔧 FIX 4: Only show table after "View Preview" is clicked and data exists */}
            {columns.data.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card basic-data-table">
                  <div className="card-body">
                    <h6 className="mb-3">Preview ({columns.data.length} contacts)</h6>
                    <div className="table-responsive">
                      <table className="table bordered-table mb-0">
                        <thead>
                          <tr>
                            <th scope="col">S.No.</th>
                            <th scope="col">Contact Name</th>
                            <th scope="col">Country Code</th>
                            <th scope="col">Mobile Number</th>
                            {userAttributes.length > 0 && (
                              userAttributes.map((attr) => (
                                <th scope="col" key={attr.key}>
                                  {attr.displayName}
                                </th>
                              ))
                            )}
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.data.map((contact, index) => (
                            <tr
                              key={index}
                              className={contact._hasError ? 'table-danger' : ''}
                            >
                              <td>{index + 1}</td>
                              <td>{contact.contactName || '-'}</td>
                              <td>
                                <span className="badge bg-primary" style={{ fontSize: "14px" }}>
                                  {contact.countryCode || '-'}
                                </span>
                              </td>
                              <td>{contact.phoneNumber || '-'}</td>
                              {userAttributes.length > 0 && (
                                userAttributes.map((attr) => (
                                  <td key={`${index}-${attr.key}`}>
                                    {contact[attr.key] || "-"}
                                  </td>
                                ))
                              )}
                              <td style={{
                                position: 'sticky',
                                right: 0,
                                background: contact._hasError ? '#f8d7da' : 'white',
                                zIndex: 5,
                              }}>
                                <div className="d-flex fixed-action-column align-items-center">
                                  {contact._hasError ? (
                                    <span className="text-danger">
                                      Invalid
                                    </span>
                                  ) : (
                                    <span className="text-success">
                                      Valid
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="form-text mt-2">
                      {hasInvalidContacts ? (
                        <span className="text-danger">
                          ⚠️ Some contacts have invalid country codes. Please fix the CSV file.
                        </span>
                      ) : (
                        <span className="text-success">
                          ✓ All {columns.data.length} contacts are valid and ready for import.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer border-0 bg-light">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={isLoading || hasInvalidContacts || columns.data.length === 0}
          >
            {isLoading ? (
              <>
                <span className="me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              "Import Contacts"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactModel;