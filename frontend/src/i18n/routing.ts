import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "vi",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
