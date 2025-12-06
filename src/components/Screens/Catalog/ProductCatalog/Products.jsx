import React, { useState } from "react";
import "datatables.net-dt/js/dataTables.dataTables.js";
import { Icon } from "@iconify/react/dist/iconify.js";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import AddProductModal from "./../Modules/AddProductModal";

const Products = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <MasterLayout>
      <Breadcrumb title="Products" />
      <div className="d-flex justify-content-between align-items-center mb-4 p-12">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/catalog")}
          >
            <Icon
              style={{ fontSize: "20px" }}
              icon="typcn:arrow-left-outline"
            />
            Catalogs
          </button>
          {/* Search Input */}
          <div className=" d-md-none position-relative">
            <input
              style={{ width: "240px" }}
              type="text"
              className="form-control form-control-sm ps-5"
              placeholder="Search by Product Name"
            />
            <Icon
              icon="eva:search-fill"
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ fontSize: "18px" }}
            />
          </div>
        </div>

        {/* Add Chat Agent Button */}
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div></div> {/* Empty div for spacing */}
          <button className="btn-primary d-flex align-items-center gap-2">
            <Icon
              style={{ fontSize: "20px" }}
              icon="streamline-ultimate:synchronize-arrows-three-bold"
            />
            Sync Products
          </button>
          <button
            className="btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Icon style={{ fontSize: "20px" }} icon="mingcute:add-line" />
            Add Product
          </button>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://media.post.rvohealth.io/wp-content/uploads/2020/09/AN313-Tomatoes-732x549-Thumb-732x549.jpg"
              className="card-img-top size-adjustment"
              alt=""
            />
            <div className="mt-24 p-10">
              <ul>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Product Name
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Description
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Brand
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Sale Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://images.immediate.co.uk/production/volatile/sites/30/2019/08/Onion-72ea178.jpg"
              className="card-img-top size-adjustment"
              alt=""
            />
            <div className="mt-24 p-10">
              <ul>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Product Name
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Description
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Brand
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Sale Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100 radius-12">
            <img
              src="https://www.jiomart.com/images/product/original/590003516/potato-1-kg-product-images-o590003516-p590003516-0-202509221825.jpg?im=Resize=(420,420)"
              className="card-img-top size-adjustment"
              alt=""
            />
            <div className="mt-24 p-10">
              <ul>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Product Name
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Description
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Brand
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-sm fw-semibold text-primary-light">
                    Sale Price
                  </span>
                  <span className="w-70 text-secondary-light fw-medium">:</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AddProductModal showModal={showModal} setShowModal={setShowModal} />
    </MasterLayout>
  );
};

export default Products;
