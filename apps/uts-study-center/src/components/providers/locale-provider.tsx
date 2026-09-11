"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupportedLocale } from "@/domain/academic/types";
import {
  defaultLocale,
  defaultTimeZone,
  isSupportedLocale,
  messages,
  resolveSystemLocale,
  type LocalePreference,
} from "@/i18n/config";

const LOCALE_STORAGE_KEY = "uts-study-center.locale";
const TIMEZONE_STORAGE_KEY = "uts-study-center.timezone";

interface LocaleContextValue {
  locale: SupportedLocale;
  preference: LocalePreference;
  timeZone: string;
  setPreference: (preference: LocalePreference) => void;
  setTimeZone: (timeZone: string) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LocalePreference>(defaultLocale);
  const [locale, setLocale] = useState<SupportedLocale>(defaultLocale);
  const [timeZone, setTimeZoneState] = useState(defaultTimeZone);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const nextPreference: LocalePreference =
      storedPreference === "system" || isSupportedLocale(storedPreference)
        ? storedPreference
        : defaultLocale;
    const nextLocale =
      nextPreference === "system"
        ? resolveSystemLocale(window.navigator.language)
        : nextPreference;
    const storedTimeZone = window.localStorage.getItem(TIMEZONE_STORAGE_KEY);
    queueMicrotask(() => {
      setPreferenceState(nextPreference);
      setLocale(nextLocale);
      if (storedTimeZone) setTimeZoneState(storedTimeZone);
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (preference !== "system") return;
    const updateLocale = () => setLocale(resolveSystemLocale(window.navigator.language));
    window.addEventListener("languagechange", updateLocale);
    return () => {
      window.removeEventListener("languagechange", updateLocale);
    };
  }, [preference]);

  const setPreference = useCallback((nextPreference: LocalePreference) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextPreference);
    setPreferenceState(nextPreference);
    setLocale(
      nextPreference === "system"
        ? resolveSystemLocale(window.navigator.language)
        : nextPreference,
    );
  }, []);

  const setTimeZone = useCallback((nextTimeZone: string) => {
    window.localStorage.setItem(TIMEZONE_STORAGE_KEY, nextTimeZone);
    setTimeZoneState(nextTimeZone);
  }, []);

  const value = useMemo(
    () => ({ locale, preference, timeZone, setPreference, setTimeZone }),
    [locale, preference, setPreference, setTimeZone, timeZone],
  );

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        key={locale}
        locale={locale}
        messages={messages[locale]}
        timeZone={timeZone}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocalePreference(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}
