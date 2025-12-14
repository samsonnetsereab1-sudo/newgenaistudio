// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import SimpleApp from "./SimpleApp.jsx";
import "./index.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SimpleApp />
    </BrowserRouter>
  </React.StrictMode>
);
