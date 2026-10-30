import { api, HealthResponseSchema, ItemCreateSchema, ItemListSchema, type Item } from "@repo/lib";
import { Button, Card, CardContent, CardHeader, Input } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Independent panel: its own queries (keys start with "rest"), its own state, no shared hooks.
export function PanelREST() {
  const { t } = useTranslation("home");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const health = useQuery({
    queryKey: ["rest", "health"],
    queryFn: async () => HealthResponseSchema.parse((await api.get("/health")).data),
    refetchInterval: 5000,
  });

  const items = useQuery({
    queryKey: ["rest", "items"],
    queryFn: async (): Promise<Item[]> => ItemListSchema.parse((await api.get("/api/items")).data),
  });

  const addItem = useMutation({
    mutationFn: async (itemName: string) =>
      api.post("/api/items", ItemCreateSchema.parse({ name: itemName })),
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["rest", "items"] });
    },
  });

  const status = health.isPending
    ? { icon: <Loader2 size={16} className="animate-spin" />, text: t("rest.checking") }
    : health.isError
      ? { icon: <CircleAlert size={16} className="text-danger" />, text: t("rest.error") }
      : { icon: <CheckCircle2 size={16} className="text-success" />, text: t("rest.connected") };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">{t("rest.title")}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          {status.icon} {status.text}
        </p>
        {health.isSuccess && <p className="text-xs text-muted-foreground">{t("rest.zod")}</p>}

        <h3 className="text-sm font-semibold">{t("rest.itemsTitle")}</h3>
        {items.isSuccess && items.data.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("rest.empty")}</p>
        )}
        <ul className="space-y-1 text-sm">
          {items.data?.map((item) => (
            <li key={item.id}>
              #{item.id} {item.name}
            </li>
          ))}
        </ul>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) addItem.mutate(name.trim());
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("rest.placeholder")}
          />
          <Button type="submit" disabled={addItem.isPending}>
            {t("rest.add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
