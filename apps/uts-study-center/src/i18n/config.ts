import enAU from "../../messages/en-AU.json";
import zhCN from "../../messages/zh-CN.json";
import type { SupportedLocale } from "@/domain/academic/types";

export const supportedLocales = ["en-AU", "zh-CN"] as const;
export const defaultLocale: SupportedLocale = "en-AU";
export const defaultTimeZone = "Australia/Sydney";

export const messages = {
  "en-AU": enAU,
  "zh-CN": zhCN,
} as const;

export type LocalePreference = SupportedLocale | "system";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function resolveSystemLocale(language?: string): SupportedLocale {
  return language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-AU";
}
