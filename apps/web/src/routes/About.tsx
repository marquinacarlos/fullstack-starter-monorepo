import { Card, CardContent, CardHeader } from "@repo/ui";
import { useTranslation } from "react-i18next";

const stackKeys = ["router", "i18n", "zustand", "tailwind", "lucide"] as const;

export function About() {
  const { t } = useTranslation("about");
  return (
    <Card>
      <CardHeader>
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>{t("intro")}</p>
        <h2 className="font-semibold">{t("stackTitle")}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {stackKeys.map((key) => (
            <li key={key}>{t(`stack.${key}`)}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
