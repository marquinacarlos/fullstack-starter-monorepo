"use client";

import { api, DatabasesResponseSchema, type DatabaseStatus } from "@repo/lib";
import { Card, CardContent, CardHeader } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, CircleMinus, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

const icons: Record<DatabaseStatus["status"], ReactNode> = {
  connected: <CheckCircle2 size={16} className="text-success" />,
  disabled: <CircleMinus size={16} className="text-muted-foreground" />,
  unavailable: <CircleAlert size={16} className="text-warning" />,
};

// Independent panel: own query (keys start with "databases"). It talks to GET /health/databases,
// not to any database, so it works even when every database is off.
export function PanelDatabases() {
  const t = useTranslations("connected");

  const databases = useQuery({
    queryKey: ["databases", "status"],
    queryFn: async () =>
      DatabasesResponseSchema.parse((await api.get("/health/databases")).data).databases,
    refetchInterval: 5000,
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">{t("databases.title")}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {databases.isPending && (
          <p className="flex items-center gap-2 text-sm font-medium">
            <Loader2 size={16} className="animate-spin" /> {t("databases.checking")}
          </p>
        )}
        {databases.isError && (
          <p className="flex items-center gap-2 text-sm font-medium">
            <CircleAlert size={16} className="text-danger" /> {t("databases.error")}
          </p>
        )}
        {databases.data?.map((db) => (
          <div key={db.name}>
            <p className="flex items-center gap-2 text-sm font-medium">
              {icons[db.status]} {t(`databases.${db.status}`, { name: db.label })}
            </p>
            {db.status === "unavailable" && (
              <p className="pl-6 text-xs text-muted-foreground">{t("databases.unavailableHint")}</p>
            )}
          </div>
        ))}
        {databases.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("databases.none")}</p>
        )}
        <p className="text-xs text-muted-foreground">{t("databases.note")}</p>
      </CardContent>
    </Card>
  );
}
