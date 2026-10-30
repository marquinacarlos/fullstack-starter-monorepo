import { useTranslations } from "next-intl";

import { ConnectedPanels } from "./ConnectedPanels";

// Demo section: proves this landing is wired to the API and its databases, like web and desktop.
// The landing stays a static site: the panels run in the browser and call the API directly.
// To remove the demo, see apps/landing/docs/CONNECTED.md.
export function ConnectedSection() {
  const t = useTranslations("connected");
  // Inlined at build time. Without it the panels would throw on load, so show a hint instead.
  const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL);

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <p className="mt-1 mb-6 text-muted-foreground">{t("greeting")}</p>
      {apiConfigured ? (
        <ConnectedPanels />
      ) : (
        <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          {t("notConfigured")}
        </p>
      )}
    </section>
  );
}
