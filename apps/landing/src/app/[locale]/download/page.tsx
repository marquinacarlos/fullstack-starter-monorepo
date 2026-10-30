import { Laptop, Monitor, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

// Placeholder: point these to your GitHub releases (see apps/desktop/electron-builder.yml).
const RELEASES_URL = "https://github.com/OWNER/REPO/releases/latest";

export default function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("download");

  const platforms = [
    { key: "windows", icon: <Monitor size={20} /> },
    { key: "macos", icon: <Laptop size={20} /> },
    { key: "linux", icon: <Terminal size={20} /> },
  ] as const;

  return (
    <>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted-foreground">{t("subtitle")}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map(({ key, icon }) => (
          <section key={key} className="rounded-card border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              {icon} {t(`platforms.${key}`)}
            </div>
            <a
              href={RELEASES_URL}
              className="inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              {t("button")}
            </a>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{t("note")}</p>
    </>
  );
}
