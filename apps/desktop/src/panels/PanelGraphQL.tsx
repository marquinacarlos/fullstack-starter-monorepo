import { graphqlRequest } from "@repo/lib";
import { Button, Card, CardContent, CardHeader } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const HEALTH_QUERY = /* GraphQL */ `
  query Health {
    health
  }
`;

const ITEMS_QUERY = /* GraphQL */ `
  query Items {
    items {
      id
      name
    }
  }
`;

// Independent panel: its own queries (keys start with "graphql"), no REST code involved.
// Health and items are two separate queries on purpose: "health: ok" must not depend on the DB.
export function PanelGraphQL() {
  const { t } = useTranslation("home");

  const health = useQuery({
    queryKey: ["graphql", "health"],
    queryFn: async () => (await graphqlRequest<{ health: string }>(HEALTH_QUERY)).health,
    refetchInterval: 5000,
  });

  const items = useQuery({
    queryKey: ["graphql", "items"],
    queryFn: async () =>
      (await graphqlRequest<{ items: { id: number; name: string }[] }>(ITEMS_QUERY)).items,
  });

  const status = health.isPending
    ? { icon: <Loader2 size={16} className="animate-spin" />, text: t("graphql.checking") }
    : health.isError
      ? { icon: <CircleAlert size={16} className="text-danger" />, text: t("graphql.error") }
      : {
          icon: <CheckCircle2 size={16} className="text-success" />,
          text: t("graphql.connected", { value: health.data }),
        };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">{t("graphql.title")}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          {status.icon} {status.text}
        </p>

        <h3 className="text-sm font-semibold">{t("graphql.itemsTitle")}</h3>
        {items.isError && <p className="text-sm text-danger">{t("graphql.itemsError")}</p>}
        {items.isSuccess && items.data.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("graphql.empty")}</p>
        )}
        <ul className="space-y-1 text-sm">
          {items.data?.map((item) => (
            <li key={item.id}>
              #{item.id} {item.name}
            </li>
          ))}
        </ul>

        <Button
          variant="secondary"
          onClick={() => {
            void health.refetch();
            void items.refetch();
          }}
        >
          <RefreshCw size={14} /> {t("graphql.refresh")}
        </Button>
      </CardContent>
    </Card>
  );
}
