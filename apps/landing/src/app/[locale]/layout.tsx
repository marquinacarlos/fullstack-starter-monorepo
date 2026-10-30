import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "../../components/Header";
import { ThemeScript } from "../../components/ThemeScript";
import { routing } from "../../i18n/routing";
import "../globals.css";

// Unknown locales (/foo) are a plain 404 instead of an error in `next dev`.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: t("appName") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Needed so pages using next-intl can be rendered statically.
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-page sm:py-10">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
