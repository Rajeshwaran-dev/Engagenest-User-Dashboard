import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useUpdateProfileMutation } from "../../../../store/ApiFiles/ProfileApis";
import { useUploadFileMutation } from "../../../../store/ApiFilesV2/FileHandlerApis";
import { useUpdateUserAttrMutation } from "../../../../store/ApiFilesV2/UserApis";
import { toast } from "react-toastify";

const ProfileEditModal = ({ showModal, setShowModal, profileData, refetchProfile }) => {
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    whatsappAbout: "",
    email: "",
    address: "",
    businessVertical: "",
    website: "",
    description: "",
    companyName: ""
  });

  const [updateProfile] = useUpdateProfileMutation();
  const [uploadFile] = useUploadFileMutation();
  const [updateUserAttr] = useUpdateUserAttrMutation();

  // Initialize form data when modal opens
  useEffect(() => {
    if (profileData && showModal) {
      setFormData({
        whatsappAbout: profileData.company?.about || "",
        email: profileData.company?.email || "",
        address: profileData.company?.address || "",
        businessVertical: profileData.company?.vertical || "",
        website: profileData.company?.website || "",
        description: profileData.company?.description || "",
        companyName: profileData.company?.name || ""
      });

      if (profileData.company?.logo) {
        setImagePreview(profileData.company.logo);
      }
    }
  }, [profileData, showModal]);

  const handleCloseModal = () => {
    setShowModal(false);
    setImagePreview("");
    setSelectedFile(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const readURL = (event) => {
    const input = event.target;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (PNG, JPG, JPEG)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = function (e) {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let fileUrl = null;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const uploadResponse = await uploadFile({
          formData: uploadFormData,
          foldername: "profile-pictures"
        }).unwrap();

        fileUrl =
          uploadResponse.fileUrl ||
          uploadResponse.url ||
          uploadResponse.data?.fileUrl;

        if (!fileUrl) {
          toast.error("Failed to get file URL from upload");
          return;
        }
      }

      const profileUpdateData = {
        whatsappAbout: formData.whatsappAbout,
        businessVertical: formData.businessVertical,
        companywebsite: formData.website,
        description: formData.description,
        email: formData.email,
      };

      if (fileUrl) {
        profileUpdateData.whatsAppDisplayImage = fileUrl;
      }

      const userAttrData = {
        companyName: formData.companyName,
        Address: formData.address,
        companywebsite: formData.website,
      };

      await updateProfile(profileUpdateData).unwrap();
      await updateUserAttr(userAttrData).unwrap();

      toast.success("Profile updated successfully!");
      if (refetchProfile) {
        setTimeout(() => refetchProfile(), 300);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  if (!showModal) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <div>
                <Icon className="modal-icon-adjustments" icon="gg:profile" />
              </div>
              <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
                Edit Profile
              </h3>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
            >
              <Icon icon="mingcute:close-line" />
            </button>
          </div>

          <div className="modal-body">
            <div className="tab-pane fade show active">
              <h6 className="text-md text-primary-light mb-16">
                Profile Image
              </h6>
              <div className="mb-24 mt-16">
                <div className="avatar-upload">
                  <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                    <input
                      type="file"
                      id="imageUpload"
                      accept=".png, .jpg, .jpeg"
                      hidden
                      onChange={readURL}
                    />
                    <label
                      htmlFor="imageUpload"
                      className={`w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle ${'' ? 'opacity-50' : ''
                        }`}
                      style={{ cursor: '' ? 'not-allowed' : 'pointer' }}
                    >
                      <Icon icon="solar:camera-outline" className="icon"></Icon>
                    </label>
                  </div>
                  <div className="avatar-preview">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Icon icon="mdi:image" style={{ fontSize: "48px", color: "#ccc" }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="companyName"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Company Name
                        <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control radius-8"
                        id="companyName"
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="whatsappAbout"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        WhatsApp About
                      </label>
                      <input
                        type="text"
                        className="form-control radius-8"
                        id="whatsappAbout"
                        placeholder="WhatsApp About"
                        value={formData.whatsappAbout}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="email"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Email <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control radius-8"
                        id="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="address"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control radius-8"
                        id="address"
                        placeholder="Enter full Address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="businessVertical"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Business Vertical
                        <span className="text-danger-600">*</span>
                      </label>
                      <select
                        className="form-control radius-8 form-select"
                        id="businessVertical"
                        value={formData.businessVertical}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Select Business Vertical
                        </option>
                        <option value="Event Planning and Services">
                          Event Planning and Services
                        </option>
                        <option value="Finance and Banking">
                          Finance and Banking
                        </option>
                        <option value="Food and Groceries">
                          Food and Groceries
                        </option>
                        <option value="Public Service">Public Service</option>
                        <option value="Hotel and Lodging">
                          Hotel and Lodging
                        </option>
                        <option value="Medical and Health">
                          Medical and Health
                        </option>
                        <option value="Charity">Charity</option>
                        <option value="Professional Service">
                          Professional Service
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-20">
                      <label
                        htmlFor="website"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        className="form-control radius-8"
                        id="website"
                        placeholder="Enter website URL"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="mb-20">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Description
                      </label>
                      <textarea
                        className="form-control radius-8"
                        id="description"
                        placeholder="Write description..."
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {'' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;