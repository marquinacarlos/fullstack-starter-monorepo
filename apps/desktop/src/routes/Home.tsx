import { useTranslation } from "react-i18next";

// scaffold:begin channels
// Each panel is self-contained: it has its own queries and state.
import { PanelDatabases } from "../panels/PanelDatabases"; // scaffold:line db-status
import { PanelGraphQL } from "../panels/PanelGraphQL"; // scaffold:line graphql
import { PanelREST } from "../panels/PanelREST"; // scaffold:line rest
import { PanelWebSocket } from "../panels/PanelWebSocket"; // scaffold:line websocket
// scaffold:end channels
import { UpdatesStatus } from "../components/UpdatesStatus";

export function Home() {
  const { t } = useTranslation("home");
  return (
    <>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-6 text-muted-foreground">{t("greeting")}</p>
      {/* scaffold:begin channels */}
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
      {/* scaffold:end channels */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* scaffold:begin db-status */}
        <PanelDatabases />
        {/* scaffold:end db-status */}
        <UpdatesStatus />
      </div>
    </>
  );
}
