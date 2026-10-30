import { graphqlRequest } from "@repo/lib";
import { Button, Card, CardContent, CardHeader } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Overview {
  health: string;
  items: { id: number; name: string }[];
}

const OVERVIEW_QUERY = /* GraphQL */ `
  query Overview {
    health
    items {
      id
      name
    }
  }
`;

// Independent panel: its own query (keys start with "graphql"), no REST code involved.
export function PanelGraphQL() {
  const { t } = useTranslation("home");

  const overview = useQuery({
    queryKey: ["graphql", "overview"],
    queryFn: () => graphqlRequest<Overview>(OVERVIEW_QUERY),
    refetchInterval: 5000,
  });

  const status = overview.isPending
    ? { icon: <Loader2 size={16} className="animate-spin" />, text: t("graphql.checking") }
    : overview.isError
      ? { icon: <CircleAlert size={16} className="text-danger" />, text: t("graphql.error") }
      : {
          icon: <CheckCircle2 size={16} className="text-success" />,
          text: t("graphql.connected", { value: overview.data.health }),
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
        {overview.isSuccess && overview.data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("graphql.empty")}</p>
        )}
        <ul className="space-y-1 text-sm">
          {overview.data?.items.map((item) => (
            <li key={item.id}>
              #{item.id} {item.name}
            </li>
          ))}
        </ul>

        <Button variant="secondary" onClick={() => void overview.refetch()}>
          <RefreshCw size={14} /> {t("graphql.refresh")}
        </Button>
      </CardContent>
    </Card>
  );
}
