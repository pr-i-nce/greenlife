import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./components/Routes";
import { Provider } from "react-redux";
import { store } from "./components/store/store";
import { PaginationProvider } from "./components/PaginationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PaginationProvider>
        <RouterProvider router={router} />
      </PaginationProvider>
    </Provider>
  </React.StrictMode>
);
