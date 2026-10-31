import { api, HealthResponseSchema } from "@repo/lib";
import { ItemCreateSchema, ItemListSchema, type Item } from "@repo/lib"; // scaffold:line items
import { Card, CardContent, CardHeader } from "@repo/ui";
import { Button, Input } from "@repo/ui"; // scaffold:line items
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // scaffold:line items
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react"; // scaffold:line items
import { useTranslation } from "react-i18next";

// Independent panel: its own queries (keys start with "rest"), its own state, no shared hooks.
export function PanelREST() {
  const { t } = useTranslation("home");
  const queryClient = useQueryClient(); // scaffold:line items
  const [name, setName] = useState(""); // scaffold:line items

  const health = useQuery({
    queryKey: ["rest", "health"],
    queryFn: async () => HealthResponseSchema.parse((await api.get("/health")).data),
    refetchInterval: 5000,
  });

  // scaffold:begin items
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

  // scaffold:end items

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

        {/* scaffold:begin items */}
        <h3 className="text-sm font-semibold">{t("rest.itemsTitle")}</h3>
        {items.isError && <p className="text-sm text-danger">{t("rest.itemsError")}</p>}
        {items.isSuccess && items.data.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("rest.empty")}</p>
        )}
        <ul className="space-y-1 text-sm wrap-anywhere">
          {items.data?.map((item) => (
            <li key={item.id}>
              #{item.id} {item.name}
            </li>
          ))}
        </ul>

        <form
          className="flex flex-col gap-2 sm:flex-row"
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
        {addItem.isError && <p className="text-sm text-danger">{t("rest.saveError")}</p>}
        {/* scaffold:end items */}
      </CardContent>
    </Card>
  );
}
