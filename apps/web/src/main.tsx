import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // scaffold:line channels
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import "./i18n";
import "./index.css";

// scaffold:begin channels
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
// scaffold:end channels

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* scaffold:begin channels */}
    <QueryClientProvider client={queryClient}>
      {/* scaffold:end channels */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* scaffold:begin channels */}
    </QueryClientProvider>
    {/* scaffold:end channels */}
  </StrictMode>,
);
