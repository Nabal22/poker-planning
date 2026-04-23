import "server-only";

const dictionaries = {
  fr: {
    landing: () =>
      import("../../../public/locales/fr/landing.json").then((m) => m.default),
    common: () =>
      import("../../../public/locales/fr/common.json").then((m) => m.default),
    app: () =>
      import("../../../public/locales/fr/app.json").then((m) => m.default),
  },
  en: {
    landing: () =>
      import("../../../public/locales/en/landing.json").then((m) => m.default),
    common: () =>
      import("../../../public/locales/en/common.json").then((m) => m.default),
    app: () =>
      import("../../../public/locales/en/app.json").then((m) => m.default),
  },
};

export type Locale = keyof typeof dictionaries;

export const locales: Locale[] = ["fr", "en"];

export const defaultLocale: Locale = "fr";

export function hasLocale(locale: string): locale is Locale {
  return locale in dictionaries;
}

export async function getDictionary<N extends keyof typeof dictionaries["fr"]>(
  locale: Locale,
  namespace: N
): Promise<Awaited<ReturnType<typeof dictionaries["fr"][N]>>> {
  return dictionaries[locale][namespace]() as Promise<Awaited<ReturnType<typeof dictionaries["fr"][N]>>>;
}
