import { useTranslation } from "react-i18next";

// Each panel is self-contained. To remove a channel, delete its panel and its line here.
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
      <div className="grid gap-4 md:grid-cols-3">
        <PanelREST />
        <PanelGraphQL />
        <PanelWebSocket />
      </div>
      <UpdatesStatus />
    </>
  );
}
