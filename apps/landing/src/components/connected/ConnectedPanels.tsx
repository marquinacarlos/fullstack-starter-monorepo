"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PanelDatabases } from "./PanelDatabases";
import { PanelGraphQL } from "./PanelGraphQL";
import { PanelREST } from "./PanelREST";
import { PanelWebSocket } from "./PanelWebSocket";

// Each panel is independent (own query keys, own state). To drop a channel from the demo,
// delete its panel file and its line here.
export function ConnectedPanels() {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelREST />
        <PanelGraphQL />
        <PanelWebSocket />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelDatabases />
      </div>
    </QueryClientProvider>
  );
}
