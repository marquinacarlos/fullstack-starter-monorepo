import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// One JSON file per namespace in messages/{locale}/. To add a namespace, add its name here
// and create the file in every language. See docs/I18N.md.
const namespaces = ["common", "home", "download"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const entries = await Promise.all(
    namespaces.map(async (ns) => [
      ns,
      (await import(`../../messages/${locale}/${ns}.json`)).default,
    ]),
  );

  return { locale, messages: Object.fromEntries(entries) };
});
