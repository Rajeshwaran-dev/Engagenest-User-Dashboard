import React from "react";
import ReactDOM from "react-dom/client";

/* ================= GLOBAL CSS ================= */

/* Editor / Plugins */
import "react-quill-new/dist/quill.snow.css";
import "jsvectormap/dist/css/jsvectormap.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";

/* Bootstrap JS */
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/* 🔥 YOUR MOVED ASSETS (src/assets) */
import "./assets/css/remixicon.css";

import "./assets/css/lib/bootstrap.min.css";
import "./assets/css/lib/apexcharts.css";
import "./assets/css/lib/dataTables.min.css";
import "./assets/css/lib/flatpickr.min.css";
import "./assets/css/lib/full-calendar.css";
import "./assets/css/lib/slick.css";
import "./assets/css/lib/prism.css";
import "./assets/css/lib/jquery-jvectormap-2.0.5.css";
import "./assets/css/lib/magnific-popup.css";
import "./assets/css/lib/file-upload.css";
import "./assets/css/lib/audioplayer.css";
import "./assets/css/lib/animate.min.css";

/* Main Theme CSS */
import "./assets/css/style.css";
import "./assets/css/extra.css";

/* ================= APP ================= */

import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
