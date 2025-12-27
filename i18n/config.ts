export const locales = ["en", "th"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export async function getMessages(locale: string) {
  return (await import(`../messages/${locale}.json`)).default;
}
