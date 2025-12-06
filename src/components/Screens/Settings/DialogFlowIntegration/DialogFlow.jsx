import React from "react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Icon } from "@iconify/react/dist/iconify.js";

const DialogFlow = () => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle the file upload logic here
      console.log("File selected:", file.name);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // Handle the dropped file
      console.log("File dropped:", files[0].name);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleAreaClick = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <MasterLayout>
      <Breadcrumb title="Dialogflow Integration" />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-12 col-lg-12 p-0">
            {/* File upload area */}
            <div
              className="file-upload-area border-dashed rounded p-5 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleAreaClick}
              style={{ cursor: "pointer" }}
            >
              {/* Hidden file input */}
              <input
                type="file"
                id="fileInput"
                className="d-none"
                accept=".json"
                onChange={handleFileUpload}
              />

              {/* Upload icon or text */}
              <div className="upload-icon mb-3">
                <i className="bi bi-cloud-arrow-up display-4 text-muted"></i>
                {/* Alternatively, you can use Font Awesome or another icon library */}
              </div>

              {/* Instructions */}
              <Icon
                style={{ fontSize: "36px" }}
                icon="solar:cloud-upload-broken"
              />
              <p className="h5 mb-2">
                Click or drag files to this area to upload
              </p>
              <p className="text-muted mb-3">
                Only JSON files are allowed. You can upload a single file at a
                time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default DialogFlow;
