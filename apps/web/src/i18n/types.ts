import type about from "./locales/en/about.json";
import type common from "./locales/en/common.json";
import type home from "./locales/en/home.json";

// English is the source of truth: t("key") is type-checked against these files.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      home: typeof home;
      about: typeof about;
    };
  }
}
