"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PanelDatabases } from "./PanelDatabases"; // scaffold:line db-status
import { PanelGraphQL } from "./PanelGraphQL"; // scaffold:line graphql
import { PanelREST } from "./PanelREST"; // scaffold:line rest
import { PanelWebSocket } from "./PanelWebSocket"; // scaffold:line websocket

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
        {/* scaffold:begin rest */}
        <PanelREST />
        {/* scaffold:end rest */}
        {/* scaffold:begin graphql */}
        <PanelGraphQL />
        {/* scaffold:end graphql */}
        {/* scaffold:begin websocket */}
        <PanelWebSocket />
        {/* scaffold:end websocket */}
      </div>
      {/* scaffold:begin db-status */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelDatabases />
      </div>
      {/* scaffold:end db-status */}
    </QueryClientProvider>
  );
}
