// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Root from "./routes/Root";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);