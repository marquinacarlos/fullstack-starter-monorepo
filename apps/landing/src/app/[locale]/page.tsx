import { Cpu } from "lucide-react"; // scaffold:line web,desktop
import { Globe } from "lucide-react";
import { Server } from "lucide-react"; // scaffold:line api
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";

import { ConnectedSection } from "../../components/connected/ConnectedSection"; // scaffold:line landing-demo
import { Link } from "../../i18n/navigation"; // scaffold:line desktop

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  const features = [
    { key: "api", icon: <Server size={20} /> }, // scaffold:line api
    { key: "web", icon: <Cpu size={20} /> }, // scaffold:line web,desktop
    { key: "i18n", icon: <Globe size={20} /> },
  ] as const;

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted-foreground">{t("greeting")}</p>
      {/* scaffold:begin desktop */}
      <Link
        href="/download"
        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground sm:min-h-0 sm:py-2"
      >
        {t("cta")}
      </Link>
      {/* scaffold:end desktop */}

      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("features.title")}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map(({ key, icon }) => (
          <section key={key} className="rounded-card border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              {icon} {t(`features.${key}.title`)}
            </div>
            <p className="text-sm text-muted-foreground">{t(`features.${key}.text`)}</p>
          </section>
        ))}
      </div>
      {/* scaffold:begin landing-demo */}
      <ConnectedSection />
      {/* scaffold:end landing-demo */}
    </>
  );
}
