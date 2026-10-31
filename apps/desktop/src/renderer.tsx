import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // scaffold:line channels
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { App } from "./App";
import "./i18n";
import "./index.css";

// scaffold:begin channels
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
// scaffold:end channels

// HashRouter, not BrowserRouter: a packaged app loads index.html from file://,
// where path-based routes (/about) would not resolve.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* scaffold:begin channels */}
    <QueryClientProvider client={queryClient}>
      {/* scaffold:end channels */}
      <HashRouter>
        <App />
      </HashRouter>
      {/* scaffold:begin channels */}
    </QueryClientProvider>
    {/* scaffold:end channels */}
  </StrictMode>,
);
