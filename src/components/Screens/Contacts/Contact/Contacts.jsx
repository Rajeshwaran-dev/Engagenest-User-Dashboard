import React, { useState, useEffect, useRef, useMemo } from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useNavigate } from "react-router-dom";
import ContactActionModal from "../Modules/ContactActionModal";
import ImportContactsModal from "../Modules/ImportModal";
import { useSnackbar } from "notistack";
import {
  useGetAllContactsQuery,
  useCreateContactMutation,
  useDeleteContactsMutation,
  useEditContactMutation,
  useMoveContactToGroupMutation,
  useCopyContactMutation,
  useExportOneContactMutation,
  useGetAllContactGroupsQuery
} from "../../../../store/ApiFilesV2/ContactApis";
import { useGetUserAttrQuery } from "../../../../store/ApiFilesV2/UserApis";

const Contacts = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isMounted = useRef(true);

  const [modalType, setModalType] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [availableFilterGroups, setAvailableFilterGroups] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page

  const [formData, setFormData] = useState({
    group: "",
    countryCode: "+91",
    mobileNumber: "",
    contactName: "",
    tags: "",
  });

  const [moveData, setMoveData] = useState({
    currentGroup: "",
    availableGroups: "",
    contactId: null
  });

  const [copyData, setCopyData] = useState({
    availableGroups: "",
    contactId: null,
    currentGroups: ""
  });

  // Fetch user attributes
  const { data: userAttributesData } = useGetUserAttrQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const loginDetails = JSON.parse(localStorage.getItem("loginData"));

        const authenticated = !!loginDetails?.token;
        if (isMounted.current) {
          setIsAuthenticated(authenticated);
        }
        return authenticated;
      } catch (error) {
        if (isMounted.current) {
          setIsAuthenticated(false);
        }
        return false;
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      if (isMounted.current) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const {
    data: contactsData,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts
  } = useGetAllContactsQuery({
    offset: 0,
    limit: 100,
    groups: "null"
  }, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: groupsData,
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useGetAllContactGroupsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [createContact] = useCreateContactMutation();
  const [deleteContacts] = useDeleteContactsMutation();
  const [editContact] = useEditContactMutation();
  const [moveContactToGroup] = useMoveContactToGroupMutation();
  const [copyContact] = useCopyContactMutation();
  const [exportOneContact] = useExportOneContactMutation();

  // Get available groups from API
  const availableGroups = useMemo(() => {
    if (groupsData?.data) {
      return groupsData.data.map(group => group.name);
    }
    return [];
  }, [groupsData]);

  // Update filter groups when groups data changes
  useEffect(() => {
    if (groupsData?.data) {
      const groups = groupsData.data.map(group => group.name);
      setAvailableFilterGroups(groups);
    }
  }, [groupsData]);

  // Helper function to validate if an ID is valid
  const isValidId = (id) => {
    if (!id) return false;
    const stringId = String(id).trim();
    const invalidIds = ['-', 'undefined', 'null', '', 'NaN', 'temp_', 'generated_', 'fallback_'];
    return !invalidIds.includes(stringId) && stringId !== '';
  };

  // Helper function to convert tags to string
  const tagsToString = (tagsParam) => {
    if (!tagsParam) return "";
    if (Array.isArray(tagsParam)) return tagsParam.join(", ");
    if (typeof tagsParam === 'string') return tagsParam;
    return String(tagsParam);
  };

  // Updated transformation logic with enhanced ID generation
  useEffect(() => {
    if (!isAuthenticated) {
      setContacts([]);
      setFilteredContacts([]);
      return;
    }

    if (contactsData && !contactsLoading && groupsData) {
      let dataArray = [];

      // Handle different response structures
      if (Array.isArray(contactsData)) {
        dataArray = contactsData;
      } else if (contactsData.data && Array.isArray(contactsData.data)) {
        dataArray = contactsData.data;
      } else if (contactsData.contacts && Array.isArray(contactsData.contacts)) {
        dataArray = contactsData.contacts;
      } else if (contactsData.result && Array.isArray(contactsData.result)) {
        dataArray = contactsData.result;
      } else if (contactsData.results && Array.isArray(contactsData.results)) {
        dataArray = contactsData.results;
      } else if (contactsData.body && Array.isArray(contactsData.body)) {
        dataArray = contactsData.body;
      } else if (contactsData.response && Array.isArray(contactsData.response)) {
        dataArray = contactsData.response;
      }

      if (dataArray && Array.isArray(dataArray)) {
        const transformedContacts = [];

        dataArray.forEach((contact, index) => {
          // ✅ Always guarantee valid and unique IDs for all contacts
          let apiId = contact._id || contact.id || contact.contactId || contact.uuid;

          // If missing or invalid, build one using phone number and index
          if (!isValidId(apiId)) {
            const base =
              contact.contactNumber ||
              contact.phoneNumber ||
              contact.mobileNumber ||
              contact.phone ||
              `noNum_${index}`;

            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substr(2, 5);
            apiId = `contact_${base}_${index}_${timestamp}_${random}`;
          }

          apiId = String(apiId).trim();

          // Edge fallback
          if (!isValidId(apiId)) {
            apiId = `fallback_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          }

          const phoneNumber = contact.contactNumber || contact.phoneNumber || contact.mobileNumber || contact.phone || '';

          if (!isValidId(apiId)) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            apiId = `temp_${phoneNumber}_${timestamp}_${random}`;
            console.warn(`Generated temporary ID for contact at index ${index}:`, apiId);
          }

          apiId = String(apiId).trim();
          if (!apiId) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            apiId = `fallback_${index}_${timestamp}_${random}`;
            console.error(`Fallback ID generated for contact at index ${index}:`, apiId);
          }

          // Extract groups safely
          let groupDisplay = "No Group";
          let groupsArray = [];

          const possibleGroupFields = ['groups', 'group', 'groupName', 'contactGroup', 'category'];

          for (const field of possibleGroupFields) {
            if (contact[field]) {
              if (Array.isArray(contact[field])) {
                const validGroups = contact[field].filter(group =>
                  availableGroups.some(availGroup =>
                    availGroup.toLowerCase() === String(group).toLowerCase()
                  )
                );

                if (validGroups.length > 0) {
                  groupsArray = validGroups;
                  groupDisplay = validGroups.join(", ");
                  break;
                }
              } else if (typeof contact[field] === 'string') {
                const groupNames = contact[field].split(",").map(g => g.trim());
                const validGroups = groupNames.filter(group =>
                  availableGroups.some(availGroup =>
                    availGroup.toLowerCase() === group.toLowerCase()
                  )
                );

                if (validGroups.length > 0) {
                  groupsArray = validGroups;
                  groupDisplay = validGroups.join(", ");
                  break;
                }
              }
            }
          }

          // Get phone number
          let phoneNum = "";
          const possiblePhoneFields = ['contactNumber', 'phoneNumber', 'mobileNumber', 'phone', 'mobile', 'number'];

          for (const field of possiblePhoneFields) {
            if (contact[field]) {
              phoneNum = String(contact[field]).trim();
              break;
            }
          }

          // Get contact name
          const possibleNameFields = ['contactName', 'name', 'firstName', 'firstname', 'fullName', 'fullname', 'profileName'];
          let contactName = contact.contactName || contact.name || "Unnamed";

          for (const field of possibleNameFields) {
            if (contact[field]) {
              contactName = contact[field];
              break;
            }
          }

          // Extract tags
          const contactTags = contact.tags || "";
          let tagsArray = [];
          let tagsDisplay = "";

          if (contactTags) {
            if (Array.isArray(contactTags)) {
              tagsArray = contactTags;
              tagsDisplay = contactTags.join(", ");
            } else if (typeof contactTags === 'string') {
              tagsArray = contactTags.split(",").map(t => t.trim()).filter(t => t);
              tagsDisplay = contactTags;
            }
          }

          // Extract user attributes
          const userAttributesObj = {};
          if (userAttributesData) {
            userAttributesData.forEach(attr => {
              if (attr.key !== "contactName" && attr.key !== "name") {
                userAttributesObj[attr.key] = contact[attr.key] || "-";
              }
            });
          }

          // 🔧 CRITICAL: Use validated apiId as the main id
          const transformedContact = {
            id: apiId,        // This MUST be unique and valid
            apiId: apiId,     // Store separately for reference
            originalId: contact._id || contact.id, // Keep original MongoDB ID if exists
            name: contactName,
            number: phoneNum,
            group: groupDisplay,
            groupsArray: groupsArray,
            tags: tagsDisplay || "-",
            tagsArray: tagsArray,
            ...userAttributesObj
          };

          transformedContacts.push(transformedContact);
        });

        // ✅ Final cleanup pass: ensure all IDs are unique and valid before rendering
        const cleanedContacts = transformedContacts.map((c, idx) => {
          if (!isValidId(c.id) || c.id === '-') {
            const fallback = `cleaned_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            return { ...c, id: fallback, apiId: fallback };
          }
          return c;
        });

        // ✅ Only keep the cleaned version
        setContacts(cleanedContacts);
        setFilteredContacts(cleanedContacts); // Initially set filtered contacts to all contacts

        // Reset to first page when data changes
        setCurrentPage(1);
      } else {
        setContacts([]);
        setFilteredContacts([]);
      }
    } else if (!contactsLoading && !contactsData) {
      setContacts([]);
      setFilteredContacts([]);
    }
  }, [contactsData, groupsData, contactsLoading, contactsError, isAuthenticated, availableGroups, userAttributesData]);

  // Apply filters whenever search term or selected group changes
  useEffect(() => {
    if (contacts.length === 0) {
      setFilteredContacts([]);
      return;
    }

    let result = [...contacts];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(contact =>
        contact.name.toLowerCase().includes(term) ||
        contact.number.toLowerCase().includes(term) ||
        contact.tags.toLowerCase().includes(term) ||
        (contact.groupsArray && contact.groupsArray.some(group =>
          group.toLowerCase().includes(term)
        )) ||
        (userAttributesData && userAttributesData.some(attr =>
          contact[attr.key] && String(contact[attr.key]).toLowerCase().includes(term)
        ))
      );
    }

    // Apply group filter
    if (selectedGroup !== "all") {
      result = result.filter(contact =>
        contact.groupsArray && contact.groupsArray.includes(selectedGroup)
      );
    }

    setFilteredContacts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [contacts, searchTerm, selectedGroup, userAttributesData]);

  // Handle authentication errors
  useEffect(() => {
    if (contactsError?.status === 403 || groupsError?.status === 403) {
      console.error("Authentication error - Token might be expired or invalid");

      localStorage.removeItem("loginData");
      setIsAuthenticated(false);

      enqueueSnackbar("Your session has expired. Please login again.", {
        variant: "error",
        autoHideDuration: 3000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [contactsError, groupsError, navigate, enqueueSnackbar]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  // Get current page contacts
  const indexOfLastContact = currentPage * itemsPerPage;
  const indexOfFirstContact = indexOfLastContact - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter handler functions
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGroupFilterChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("all");
  };

  // Generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const convertTagsToString = (tags) => {
    if (!tags) return "";
    if (Array.isArray(tags)) return tags.join(", ");
    if (typeof tags === 'string') return tags;
    return String(tags);
  };

  const downloadCSV = (data, filename) => {
    if (data instanceof Blob) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else if (Array.isArray(data)) {
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    // Get user attribute keys
    const userAttrHeaders = userAttributesData ?
      userAttributesData.map(attr => attr.key.startsWith('$') ? attr.key : `${attr.key}`) :
      [];

    const headers = [
      'S.No',
      'Contact Name',
      'Mobile Number',
      'Group Name',
      'Tags',
      ...userAttrHeaders
    ];

    const rows = data.map((contact, index) => {
      const userAttrValues = userAttributesData ?
        userAttributesData.map(attr => `"${contact[attr.key] || ''}"`) :
        [];

      return [
        index + 1,
        `"${contact.name || ''}"`,
        `"${contact.number || ''}"`,
        `"${contact.group || ''}"`,
        `"${contact.tags || ''}"`,
        ...userAttrValues
      ];
    });

    const csvArray = [headers.join(','), ...rows.map(row => row.join(','))];
    return csvArray.join('\n');
  };

  const generateCSVForSelectedContacts = (selectedContactsData) => {
    if (!selectedContactsData || selectedContactsData.length === 0) return '';

    // Get user attribute keys
    const userAttrHeaders = userAttributesData ?
      userAttributesData.map(attr => attr.key.startsWith('$') ? attr.key : `${attr.key}`) :
      [];

    const headers = [
      'S.No.',
      'Contact Name',
      'Group Name',
      'Tags',
      'Mobile Number',
      ...userAttrHeaders
    ];

    const rows = selectedContactsData.map((contact, index) => {
      const userAttrValues = userAttributesData ?
        userAttributesData.map(attr => `"${contact[attr.key] || ''}"`) :
        [];

      return [
        index + 1,
        `"${contact.name || ''}"`,
        `"${contact.group || ''}"`,
        `"${contact.tags || ''}"`,
        `"${contact.number || ''}"`,
        ...userAttrValues
      ];
    });

    const csvArray = [headers.join(','), ...rows.map(row => row.join(','))];
    return csvArray.join('\n');
  };

  const openModal = (type, contact = null) => {
    if (type === "edit" && contact) {
      setEditingContact(contact);

      let countryCode = "+" + (contact.countryCode || "91");
      let mobileNumber = contact.phoneNumber || "";

      if (!mobileNumber && contact.number) {
        const fullNumber = contact.number;
        const possibleCountryCode = (contact.countryCode || "91").toString();
        if (fullNumber.startsWith(possibleCountryCode)) {
          mobileNumber = fullNumber.substring(possibleCountryCode.length);
        } else {
          mobileNumber = fullNumber;
        }
      }

      let groupValue = "";
      if (contact.groupsArray && contact.groupsArray.length > 0) {
        groupValue = contact.groupsArray.join(", ");
      } else if (contact.group && contact.group !== "No Group") {
        groupValue = contact.group;
      } else {
        groupValue = "";
      }

      let tagsValue = convertTagsToString(contact.tags);

      const userAttrData = {};
      if (userAttributesData) {
        userAttributesData.forEach(attr => {
          userAttrData[attr.key] = contact[attr.key] || "";
        });
      }

      setFormData({
        group: groupValue,
        countryCode,
        mobileNumber,
        contactName: contact.name || "",
        tags: tagsValue,
        ...userAttrData
      });
    }

    if ((type === "move" || type === "copy") && contact) {
      const mongoId = contact.apiId && /^[0-9a-fA-F]{24}$/.test(contact.apiId)
        ? contact.apiId
        : contact.id;

      if (type === "move") {
        setMoveData({
          currentGroup: contact.group || "",
          availableGroups: "",
          contactId: mongoId
        });
        setEditingContact(contact);
      } else {
        setCopyData({
          availableGroups: "",
          contactId: mongoId,
          currentGroups: contact.group || ""
        });
        setEditingContact(contact);
      }
    }

    if (type === "delete" && selectedContacts.length === 0 && contact) {
      setSelectedContacts([contact.id]);
    }

    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingContact(null);
    if (modalType === "delete") {
      setSelectedContacts([]);
    }
    resetForms();
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();

    if (e.target.checked) {
      const validIds = filteredContacts
        .filter(c => isValidId(c.id))
        .map(c => String(c.id).trim());

      setSelectedContacts(validIds);
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (e, contactId) => {
    e.stopPropagation();

    // 🔧 FIX: Comprehensive validation of contactId
    if (!contactId) {
      console.error("❌ Contact missing ID, skipping selection");
      return;
    }

    const validContactId = String(contactId).trim();

    if (e.target.checked) {
      // Add to selection
      setSelectedContacts(prev => {
        if (prev.includes(validContactId)) {
          return prev;
        }
        return [...prev, validContactId];
      });
    } else {
      // Remove from selection
      setSelectedContacts(prev => {
        const filtered = prev.filter(id => id !== validContactId);
        return filtered;
      });
    }
  };

  const openBulkDeleteModal = () => {
    if (selectedContacts.length > 0) {
      setIsBulkDeleteModalOpen(true);
    } else {
      enqueueSnackbar("Please select at least one contact to delete.", { variant: "warning" });
    }
  };

  const closeBulkDeleteModal = () => {
    setIsBulkDeleteModalOpen(false);
  };

  const handleBulkDelete = async () => {
    try {
      const validIds = selectedContacts
        .map(id => {
          const match = contacts.find(c => c.id === id || c.apiId === id);
          return match?.originalId || match?.apiId || match?.id;
        })
        .filter(id => /^[0-9a-fA-F]{24}$/.test(id));

      if (validIds.length === 0) {
        enqueueSnackbar("No valid contact IDs were available to delete via API.", { variant: "error" });
        closeBulkDeleteModal();
        return;
      }

      await deleteContacts({ ids: validIds }).unwrap();

      // 🧹 Remove deleted contacts from local state
      setContacts(prev => prev.filter(c => !validIds.includes(c.id)));
      setSelectedContacts([]);

      // ✅ Show success toast
      enqueueSnackbar(`${validIds.length} contact(s) deleted successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      closeBulkDeleteModal();
      refetchContacts();
    } catch (error) {
      console.error("Delete error:", error);
      enqueueSnackbar(error?.data?.msg || "Failed to delete contacts", { variant: "error" });
    }
  };

  const resetForms = () => {
    setFormData({
      group: "",
      countryCode: "+91",
      mobileNumber: "",
      contactName: "",
      tags: "",
    });
    setMoveData({
      currentGroup: "",
      availableGroups: "",
      contactId: null
    });
    setCopyData({
      availableGroups: "",
      contactId: null,
      currentGroups: ""
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

  const validateContactForm = () => {
    if (!formData.contactName.trim()) {
      enqueueSnackbar("Contact name is required!", { variant: "error" });
      return false;
    }
    if (!formData.mobileNumber.trim()) {
      enqueueSnackbar("Mobile number is required!", { variant: "error" });
      return false;
    }

    // Split groups by newline or comma
    const groupsArray = formData.group
      .split(/[\n,]/)
      .map(g => g.trim())
      .filter(g => g);

    if (groupsArray.length === 0) {
      enqueueSnackbar("At least one group is required!", { variant: "error" });
      return false;
    }

    const cleanNumber = formData.mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      enqueueSnackbar("Please enter a valid 10-digit mobile number!", { variant: "error" });
      return false;
    }

    return true;
  };

  const validateMoveForm = () => {
    if (!moveData.availableGroups) {
      enqueueSnackbar("Please select a group to move to!", { variant: "error" });
      return false;
    }
    return true;
  };

  const validateCopyForm = () => {
    if (!copyData.availableGroups) {
      enqueueSnackbar("Please select a group to copy to!", { variant: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      switch (modalType) {
        case "add":
          if (validateContactForm()) {
            const userAttributesPayload = {};
            if (userAttributesData) {
              userAttributesData.forEach(attr => {
                userAttributesPayload[attr.key] = formData[attr.key] || "";
              });
            }

            // Split groups and tags by newline or comma
            const groupsArray = formData.group
              .split(/[\n,]/)
              .map(g => g.trim())
              .filter(Boolean);

            const tagsArray = formData.tags
              .split(/[\n,]/)
              .map(t => t.trim())
              .filter(Boolean);

            const contactData = {
              contactName: formData.contactName,
              countryCode: formData.countryCode.replace(/^\+/, ""),
              phoneNumber: formData.mobileNumber.replace(/\D/g, ""),
              groups: groupsArray,  // Array, not comma-separated
              tags: tagsArray,      // Array, not comma-separated
              ...userAttributesPayload
            };
            await createContact(contactData).unwrap();
            enqueueSnackbar("Contact added successfully!", { variant: "success" });
            closeModal();
            refetchContacts();
            refetchGroups();
          }
          break;

        case "edit":
          if (validateContactForm() && editingContact) {
            let contactId = null;

            if (contactsData?.data && Array.isArray(contactsData.data)) {
              const originalContact = contactsData.data.find(c => {
                const phoneMatch = (c.contactNumber || c.phoneNumber || c.mobileNumber || c.number) === editingContact.number;
                const nameMatch = (c.contactName || c.name) === editingContact.name;
                return phoneMatch && nameMatch;
              });

              if (originalContact) {
                contactId = originalContact._id || originalContact.id || originalContact.contactId;
              }
            }

            if (!contactId && editingContact.apiId && /^[0-9a-fA-F]{24}$/.test(editingContact.apiId)) {
              contactId = editingContact.apiId;
            }

            if (!contactId && editingContact.id && editingContact.id !== "." && /^[0-9a-fA-F]{24}$/.test(editingContact.id)) {
              contactId = editingContact.id;
            }

            if (!contactId) {
              console.error("Could not find valid contact ID for editing");
              enqueueSnackbar("Cannot edit contact: Invalid or missing contact ID", { variant: "error" });
              break;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(contactId)) {
              console.warn("Contact ID doesn't look like MongoDB ID:", contactId);
            }

            // Split tags by newline or comma
            const tagsArray = formData.tags
              .split(/[\n,]/)
              .map(t => t.trim())
              .filter(Boolean);

            const RESERVED_KEYS = ["id", "_id", "contactId", "createdAt", "updatedAt"];
            const userAttributesPayload = {};

            if (userAttributesData) {
              userAttributesData.forEach(attr => {
                if (!RESERVED_KEYS.includes(attr.key)) {
                  userAttributesPayload[attr.key] = formData[attr.key] || "";
                }
              });
            }

            // Split groups by newline or comma
            const groupsArray = formData.group
              .split(/[\n,]/)
              .map(g => g.trim())
              .filter(Boolean);

            const contactPayload = {
              contactName: formData.contactName,
              countryCode: formData.countryCode.replace(/^\+/, ""),
              phoneNumber: formData.mobileNumber.replace(/\D/g, ""),
              groups: groupsArray,
              tags: tagsArray,
              ...userAttributesPayload
            };

            try {
              await editContact({
                id: contactId,
                contact: contactPayload,
                body: {
                  id: contactId,
                  contact: contactPayload
                }
              }).unwrap();

              enqueueSnackbar("Contact updated successfully!", { variant: "success" });
              closeModal();
              refetchContacts();
              refetchGroups();
            } catch (error) {
              enqueueSnackbar(error?.data?.msg || "Failed to update contact", { variant: "error" });
            }
          }
          break;

        case "move":
          if (validateMoveForm() && moveData.contactId) {
            let contactId = moveData.contactId;

            if (!/^[0-9a-fA-F]{24}$/.test(contactId)) {
              if (contactsData?.data && Array.isArray(contactsData.data)) {
                const original = contactsData.data.find(c => {
                  const phoneMatch = (
                    c.contactNumber === editingContact?.number ||
                    c.phoneNumber === editingContact?.number ||
                    c.mobileNumber === editingContact?.number
                  );
                  const nameMatch = (
                    c.contactName === editingContact?.name ||
                    c.name === editingContact?.name
                  );
                  return phoneMatch && nameMatch;
                });

                if (original) {
                  contactId = original._id || original.id || contactId;
                }
              }
            }

            if (!/^[0-9a-fA-F]{24}$/.test(contactId)) {
              console.error("Could not determine valid contact ID for move:", contactId);
              enqueueSnackbar("Could not determine valid contact ID for move", { variant: "error" });
              break;
            }

            try {
              await moveContactToGroup({
                contactId: contactId,
                currentGroups: moveData.currentGroup.split(",").map(g => g.trim()).filter(Boolean),
                targetGroup: moveData.availableGroups
              }).unwrap();

              enqueueSnackbar("Contact moved successfully!", { variant: "success" });
              closeModal();
              refetchContacts();
              refetchGroups();
            } catch (error) {
              console.error("Move contact error:", error);
              enqueueSnackbar(error?.data?.msg || "Failed to move contact", { variant: "error" });
            }
          }
          break;

        case "copy":
          if (validateCopyForm() && copyData.contactId) {
            let contactId = copyData.contactId;

            if (!/^[0-9a-fA-F]{24}$/.test(contactId)) {
              if (contactsData?.data && Array.isArray(contactsData.data)) {
                const original = contactsData.data.find(c => {
                  const phoneMatch = (
                    c.contactNumber === editingContact?.number ||
                    c.phoneNumber === editingContact?.number ||
                    c.mobileNumber === editingContact?.number
                  );
                  const nameMatch = (
                    c.contactName === editingContact?.name ||
                    c.name === editingContact?.name
                  );
                  return phoneMatch && nameMatch;
                });

                if (original) {
                  contactId = original._id || original.id || contactId;
                }
              }
            }

            if (!/^[0-9a-fA-F]{24}$/.test(contactId)) {
              console.error("Could not determine valid contact ID for copy:", contactId);
              enqueueSnackbar("Could not determine valid contact ID for copy", { variant: "error" });
              break;
            }

            try {
              await copyContact({
                contactId: contactId,
                targetGroup: copyData.availableGroups
              }).unwrap();

              enqueueSnackbar("Contact copied successfully!", { variant: "success" });
              closeModal();
              refetchContacts();
              refetchGroups();
            } catch (error) {
              console.error("Copy contact error:", error);
              enqueueSnackbar(error?.data?.msg || "Failed to copy contact", { variant: "error" });
            }
          }
          break;

        case "delete":
          if (selectedContacts.length > 0) {
            try {
              const idsToAttempt = selectedContacts.slice();
              const nonEmpty = idsToAttempt.filter(Boolean);

              const validIds = nonEmpty.map(id => {
                if (/^[0-9a-fA-F]{24}$/.test(id)) return id;
                const original = contactsData?.data?.find(
                  c =>
                    (c.contactName === contacts.find(co => co.id === id)?.name ||
                      c.name === contacts.find(co => co.id === id)?.name) &&
                    (c.phoneNumber === contacts.find(co => co.id === id)?.number ||
                      c.contactNumber === contacts.find(co => co.id === id)?.number)
                );
                return original?._id || original?.id || null;
              }).filter(Boolean);

              if (validIds.length === 0) {
                enqueueSnackbar("No valid contact IDs were available to delete via API.", { variant: "error" });
                closeModal();
                break;
              }

              await deleteContacts({ ids: validIds }).unwrap();

              setContacts(prev => prev.filter(c => !validIds.includes(c.id)));
              setSelectedContacts(prev => prev.filter(sid => !validIds.includes(sid)));

              enqueueSnackbar(`${validIds.length} contact(s) deleted successfully!`, { variant: "success" });
              closeModal();
              refetchContacts();
              refetchGroups();
            } catch (error) {
              console.error("Delete error:", error);
              enqueueSnackbar(error?.data?.msg || "Failed to delete contact", { variant: "error" });
            }
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Operation error:", error);
      enqueueSnackbar(error?.data?.msg || error?.data?.error || "Operation failed. Please try again.", { variant: "error" });
    }
  };

  const handleExportContact = async (contactId) => {
    if (!isAuthenticated) {
      enqueueSnackbar("Please log in to export contacts", { variant: "error" });
      return;
    }

    if (!contactId || !/^[0-9a-fA-F]{24}$/.test(contactId)) {
      enqueueSnackbar("Invalid contact ID. Falling back to local export.", { variant: "warning" });
    } else {
      try {
        const result = await exportOneContact(contactId).unwrap();

        if (result instanceof Blob) {
          const contact = contacts.find(c => c.id === contactId);
          const contactName = contact?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'contact';
          const filename = `contact_${contactName}_${new Date().toISOString().split('T')[0]}.csv`;
          downloadCSV(result, filename);
          enqueueSnackbar("Contact exported successfully!", { variant: "success" });
          return;
        }
      } catch (error) {
        console.error("API Export error, falling back to local:", error);
        // enqueueSnackbar("API export failed. Exporting locally.", { variant: "warning" });
      }
    }

    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      const csvData = convertToCSV([contact]);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const contactName = contact.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'contact';
      const filename = `contact_${contactName}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(blob, filename);
      enqueueSnackbar("Contact exported locally!", { variant: "success" });
    } else {
      enqueueSnackbar("Export failed: Contact not found locally.", { variant: "error" });
    }
  };

  const handleExportAllContacts = async () => {
    if (!contacts || contacts.length === 0) {
      enqueueSnackbar("No contacts to export", { variant: "warning" });
      return;
    }

    if (!isAuthenticated) {
      enqueueSnackbar("Please log in to export contacts", { variant: "error" });
      return;
    }

    try {
      const csvContent = generateCSVForSelectedContacts(contacts);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_contacts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(
        `${contacts.length} contact(s) exported successfully!`,
        { variant: "success" }
      );
    } catch (error) {
      console.error("Export all error:", error);
      enqueueSnackbar("Failed to export contacts", { variant: "error" });
    }
  };

  const handleExportSelectedContacts = async () => {
    if (selectedContacts.length === 0) {
      enqueueSnackbar("Please select at least one contact to export.", { variant: "warning" });
      return;
    }

    if (!isAuthenticated) {
      enqueueSnackbar("Please log in to export contacts", { variant: "error" });
      return;
    }

    try {
      const selectedContactsData = contacts.filter(contact =>
        selectedContacts.includes(contact.id)
      );
      const csvContent = generateCSVForSelectedContacts(selectedContactsData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `selected_contacts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(
        `${selectedContacts.length} contact(s) exported successfully!`,
        { variant: "success" }
      );
    } catch (error) {
      console.error("Export error:", error);
      enqueueSnackbar("Failed to export contacts", { variant: "error" });
    }
  };

  const isAllSelected = selectedContacts.length === filteredContacts.length && filteredContacts.length > 0;

  if (!isAuthenticated) {
    return (
      <MasterLayout>
        <Breadcrumb title="Contact Group" />
        <div className="text-center p-4">
          <Icon icon="mdi:alert-circle" style={{ fontSize: '48px', color: '#faad14' }} className="mb-3" />
          <h5 className="text-warning mb-3">Authentication Required</h5>
          <p className="mb-3">Please log in to view contacts.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </MasterLayout>
    );
  }

  if (contactsError || groupsError) {
    let errorMessage = "Unknown error";

    if (contactsError?.data || groupsError?.data) {
      const errorData = contactsError?.data || groupsError?.data;
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.msg) {
        errorMessage = errorData.msg;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (contactsError?.error || groupsError?.error) {
      errorMessage = contactsError?.error || groupsError?.error;
    } else if (contactsError?.message || groupsError?.message) {
      errorMessage = contactsError?.message || groupsError?.message;
    } else if (contactsError?.status || groupsError?.status) {
      const status = contactsError?.status || groupsError?.status;
      errorMessage = `HTTP Error: ${status}`;
    }

    return (
      <MasterLayout>
        <Breadcrumb title="Contact Group" />
        <div className="text-center p-4">
          <Icon icon="mdi:alert-circle" style={{ fontSize: '48px', color: '#ff4d4f' }} className="mb-3" />
          <h5 className="text-danger mb-3">Error Loading Contacts</h5>
          <p className="mb-3">{errorMessage}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn-primary" onClick={() => {
              refetchContacts();
              refetchGroups();
            }}>
              <Icon icon="mdi:refresh" style={{ marginRight: '8px' }} />
              Retry
            </button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>
              Re-login
            </button>
          </div>
        </div>
      </MasterLayout>
    );
  }

  if (contactsLoading || groupsLoading) {
    return (
      <MasterLayout>
        <Breadcrumb title="Contact Group" />
        <div className="text-center p-4">
          <Icon icon="mdi:loading" className="spin" style={{ fontSize: '48px' }} />
          <p className="mt-3">Loading contacts...</p>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <Breadcrumb title="Contact Group" />
      <div>
        {/* Results Count and Action Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-12">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <Icon
                icon="material-symbols:search"
                className="position-absolute"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  zIndex: 10
                }}
              />
              <input
                type="text"
                className="form-control ps-40"
                placeholder="Search by name, number, tags, or groups..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  className="btn btn-link position-absolute"
                  onClick={() => setSearchTerm("")}
                  style={{
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "0",
                    color: "#6b7280"
                  }}
                  title="Clear search"
                >
                  <Icon icon="mingcute:close-line" />
                </button>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-8">
            <button
              className="d-flex align-items-center justify-content-center"
              onClick={() => openModal("add")}
              title="Add Contact"
            >
              <Icon icon="icon-park-outline:add" style={{ fontSize: "24px" }} />
            </button>

            <button
              className="d-flex align-items-center justify-content-center"
              onClick={openBulkDeleteModal}
              title="Delete Selected"
              style={{
                fontSize: "24px",
                color: selectedContacts.length > 0 ? '#ff4d4f' : '',
              }}
              disabled={selectedContacts.length === 0}
            >
              <Icon
                icon="icon-park-outline:delete"
                style={{ fontSize: "24px" }}
              />
            </button>

            <button
              className="d-flex align-items-center justify-content-center"
              onClick={() => setShowImportModal(true)}
              title="Import Contacts"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <Icon icon="gg:import" style={{ fontSize: "24px" }} />
            </button>

            <button
              className="d-flex align-items-center justify-content-center"
              onClick={handleExportSelectedContacts}
              title={selectedContacts.length > 0 ? `Export ${selectedContacts.length} selected contact(s)` : "Export Selected"}
              style={{
                border: "none",
                background: "transparent",
                cursor: selectedContacts.length > 0 ? "pointer" : "not-allowed",
                opacity: selectedContacts.length > 0 ? 1 : 0.5
              }}
              disabled={selectedContacts.length === 0}
            >
              <Icon
                icon="gg:export"
                style={{
                  fontSize: "24px",
                  color: selectedContacts.length > 0 ? '' : '#ccc'
                }}
              />
            </button>

            <button className="btn-primary d-flex align-items-center gap-2" onClick={() => navigate("/managegroups")}>
              <Icon
                style={{ fontSize: "20px" }}
                icon="mingcute:group-fill"
              />
              Manage Groups
            </button>

            <button
              className="btn-primary d-flex align-items-center gap-2"
              onClick={handleExportAllContacts}
              disabled={!contacts || contacts.length === 0}
            >
              <Icon
                style={{ fontSize: "20px" }}
                icon="typcn:download"
              />
              Sample CSV File
            </button>
          </div>
        </div>

        <div className="card basic-data-table">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "50px" }}>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all-checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          onClick={(e) => e.stopPropagation()}
                          disabled={filteredContacts.length === 0}
                        />
                      </div>
                    </th>
                    <th scope="col">S.No.</th>
                    <th scope="col">Contact Name</th>
                    <th scope="col">Group Name</th>
                    <th scope="col">Tags</th>
                    <th scope="col">Mobile Number</th>
                    {userAttributesData && userAttributesData.length > 0 && (
                      userAttributesData.map((attr) => (
                        <th scope="col" key={attr.key}>
                          {attr.key.startsWith('') ? attr.key : `${attr.key}`}
                        </th>
                      ))
                    )}
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.length > 0 ? (
                    currentContacts.map((contact, index) => {
                      // Calculate actual serial number based on current page
                      const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const rowKey = `row-${contact.id}-${serialNumber}`;
                      const isSelected = selectedContacts.includes(contact.id);

                      // Safely get groupsArray
                      const groupsArray = contact.groupsArray || [];

                      // Safely get tagsArray
                      const tagsArray = contact.tagsArray || [];

                      return (
                        <tr key={rowKey}>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="form-check style-check d-flex align-items-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`checkbox-${contact.id}`}
                                name={`contact-checkbox-${contact.id}`}
                                checked={isSelected}
                                onChange={(e) => handleSelectContact(e, contact.id)}
                                value={contact.id}
                              />
                            </div>
                          </td>
                          <td>{serialNumber}</td>
                          <td>{contact.name}</td>
                          <td style={{ width: "180px" }}>
                            <div className="d-flex flex-wrap gap-1">
                              {groupsArray.length > 0 ? (
                                groupsArray.map((group, idx) => (
                                  <span key={`${contact.id}-group-${idx}`} className="contact-badge group-badge me-1 mb-1">
                                    {group}
                                  </span>
                                ))
                              ) : (
                                <span className="contact-badge group-empty">No Group</span>
                              )}
                            </div>
                          </td>
                          <td style={{ width: "180px" }}>
                            <div className="d-flex flex-wrap gap-1">
                              {tagsArray.length > 0 ? (
                                tagsArray.map((tag, idx) => (
                                  <span key={`${contact.id}-tag-${idx}`} className="contact-badge tag-badge me-1 mb-1">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="contact-badge tag-empty">No tags</span>
                              )}
                            </div>
                          </td>
                          <td>{contact.number}</td>
                          {userAttributesData && userAttributesData.length > 0 && (
                            userAttributesData.map((attr) => (
                              <td key={`${rowKey}-${attr.key}`}>
                                {contact[attr.key] || "-"}
                              </td>
                            ))
                          )}
                          <td style={{
                            position: 'sticky',
                            right: 0,
                            background: 'white',
                            zIndex: 5,
                          }}>
                            <div className="d-flex fixed-action-column">
                              <button
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("edit", contact);
                                }}
                                title="Edit"
                              >
                                <Icon icon="lucide:edit" style={{ fontSize: 16 }} />
                              </button>

                              <button
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("move", contact);
                                }}
                                title="Move"
                              >
                                <Icon icon="lets-icons:move-alt" style={{ fontSize: 16 }} />
                              </button>

                              <button
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("copy", contact);
                                }}
                                title="Copy"
                              >
                                <Icon icon="nimbus:copy" style={{ fontSize: 16 }} />
                              </button>

                              <button
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportContact(contact.id);
                                }}
                                title="Export"
                              >
                                <Icon icon="gg:export" style={{ fontSize: 16 }} />
                              </button>

                              <button
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("delete", contact);
                                }}
                                title="Delete"
                              >
                                <Icon icon="mingcute:delete-2-line" style={{ fontSize: 16 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7 + (userAttributesData ? userAttributesData.length : 0)} className="text-center py-4">
                        <div className="d-flex flex-column align-items-center">
                          <Icon icon="mdi:account-multiple-outline" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                          {searchTerm || selectedGroup !== "all" ? (
                            <>
                              <p className="text-muted mb-0">No contacts found matching your filters</p>
                              <p className="text-muted">Try adjusting your search or group filter</p>
                              <button
                                className="btn btn-link mt-2"
                                onClick={clearFilters}
                              >
                                Clear filters
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-muted mb-0">No contacts found</p>
                              <p className="text-muted">Click the + button to add your first contact</p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            {filteredContacts.length > itemsPerPage && (
              <div className="col-md-12 mt-3">
                <div className="card p-10 overflow-hidden position-relative radius-12">
                  <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-end mb-0">
                    <li className="page-item">
                      <button
                        className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
                      </button>
                    </li>

                    {getPaginationNumbers().map((pageNumber, index) => (
                      <li className="page-item" key={index}>
                        {pageNumber === '...' ? (
                          <span className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px disabled">
                            ...
                          </span>
                        ) : (
                          <button
                            className={`page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        )}
                      </li>
                    ))}

                    <li className="page-item">
                      <button
                        className="page-link bg-primary-50 text-secondary-light fw-medium rounded-circle border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <ContactActionModal
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
          editingContact={editingContact}
        />

        <ImportContactsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            refetchContacts();
            refetchGroups();
            enqueueSnackbar("Contacts imported successfully!", { variant: "success" });
          }}
        />

        {isBulkDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: "500px" }}>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-3">
                  <Icon icon="clarity:warning-line" color="#faad14" style={{ fontSize: '24px', marginRight: '8px' }} />
                  <h6 className="mb-0">Are you sure you want to delete these {selectedContacts.length} contacts?</h6>
                </div>
                <p className="text-muted mb-4">
                  This action cannot be undone.
                </p>
                <div className="d-flex justify-content-end gap-3">
                  <button
                    className="btn-secondary"
                    onClick={closeBulkDeleteModal}
                  >
                    No, cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleBulkDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default Contacts;