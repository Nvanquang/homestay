import { vi } from "vitest";
import viMessages from "../../messages/vi.json";

// Default global mock for next-intl in tests
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, params?: Record<string, unknown>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const parts = fullKey.split(".");
      let curr: unknown = viMessages;
      for (const part of parts) {
        if (curr && typeof curr === "object" && part in curr) {
          curr = (curr as Record<string, unknown>)[part];
        } else {
          curr = undefined;
          break;
        }
      }
      if (typeof curr === "string") {
        let res = curr;
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            res = res.replace(`{${k}}`, String(v));
          });
        }
        return res;
      }
      return fullKey;
    };
  },
  useLocale: () => "vi",
}));

// Default global mock for next/navigation in tests
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/vi",
  useParams: () => ({ locale: "vi" }),
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

