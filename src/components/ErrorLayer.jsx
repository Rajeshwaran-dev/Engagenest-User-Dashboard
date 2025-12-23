import React from "react";
import { Link } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "./Breadcrumb";

const ErrorLayer = () => {
  return (
    <>
      <Breadcrumb title="Page Not Found" />
      <div className="card basic-data-table">
        <div className="card-body py-80 px-32 text-center">
          <img src="assets/images/error-img.png" alt="" className="mb-24" />
          <h6 className="mb-16">Page not Found</h6>
          <p className="text-secondary-light">
            Sorry, the page you are looking for doesn’t exist{" "}
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </>


  );
};

export default ErrorLayer;
