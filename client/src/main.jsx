import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { store, persistor } from "./store";
import App from "./App.jsx";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <App />
          <SpeedInsights />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
