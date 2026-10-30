import { Card, CardContent, CardHeader } from "@repo/ui";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { UpdateState } from "../shared";

// Independent of the three channel panels: it talks to the Electron main process over IPC.
export function UpdatesStatus() {
  const { t } = useTranslation("home");
  const [state, setState] = useState<UpdateState | null>(null);

  useEffect(() => {
    void window.updates.getStatus().then(setState);
    return window.updates.onStatus(setState);
  }, []);

  const text = (() => {
    if (!state) return t("updates.checking");
    switch (state.status) {
      case "dev":
        return t("updates.dev");
      case "checking":
        return t("updates.checking");
      case "available":
        return t("updates.available", { version: state.version });
      case "not-available":
        return t("updates.upToDate");
      case "downloaded":
        return t("updates.downloaded", { version: state.version });
      case "error":
        return t("updates.error", { message: state.message });
    }
  })();

  return (
    <Card className="mt-4">
      <CardHeader>
        <h2 className="flex items-center gap-2 font-semibold">
          <Download size={16} /> {t("updates.title")}
        </h2>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">{text}</p>
      </CardContent>
    </Card>
  );
}
