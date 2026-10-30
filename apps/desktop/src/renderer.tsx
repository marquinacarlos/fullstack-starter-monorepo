import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { App } from "./App";
import "./i18n";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// HashRouter, not BrowserRouter: a packaged app loads index.html from file://,
// where path-based routes (/about) would not resolve.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
);
