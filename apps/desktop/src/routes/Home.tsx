import { useTranslation } from "react-i18next";

// Each panel is self-contained. To remove a channel, delete its panel and its line here.
import { PanelDatabases } from "../panels/PanelDatabases";
import { PanelGraphQL } from "../panels/PanelGraphQL";
import { PanelREST } from "../panels/PanelREST";
import { PanelWebSocket } from "../panels/PanelWebSocket";
import { UpdatesStatus } from "../components/UpdatesStatus";

export function Home() {
  const { t } = useTranslation("home");
  return (
    <>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 mb-6 text-muted-foreground">{t("greeting")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelREST />
        <PanelGraphQL />
        <PanelWebSocket />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelDatabases />
        <UpdatesStatus />
      </div>
    </>
  );
}
