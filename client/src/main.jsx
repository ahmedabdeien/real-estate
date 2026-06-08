import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { store, persistor } from "./store";
import App from "./App.jsx";
import "./index.scss";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,       // 3 min cache
      gcTime:    1000 * 60 * 10,       // 10 min gc
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) => {
        console.error("[Mutation Error]", err?.response?.data?.message || err.message);
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HelmetProvider>
            <App />
            <SpeedInsights />
          </HelmetProvider>
        </PersistGate>
      </Provider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
