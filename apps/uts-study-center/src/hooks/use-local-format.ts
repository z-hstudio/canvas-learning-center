"use client";

import { useMemo } from "react";
import { useLocalePreference } from "@/components/providers/locale-provider";

export function useLocalFormat() {
  const { locale, timeZone } = useLocalePreference();

  return useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const longDateFormatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: locale === "en-AU",
    });
    const shortDateFormatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      day: "numeric",
      month: "short",
    });

    return {
      locale,
      timeZone,
      formatDate: (value: string | Date) => dateFormatter.format(new Date(value)),
      formatLongDate: (value: string | Date) => longDateFormatter.format(new Date(value)),
      formatShortDate: (value: string | Date) => shortDateFormatter.format(new Date(value)),
      formatTime: (value: string | Date) => timeFormatter.format(new Date(value)),
      formatDateTime: (value: string | Date) =>
        `${dateFormatter.format(new Date(value))} · ${timeFormatter.format(new Date(value))}`,
      formatPercent: (value: number) =>
        new Intl.NumberFormat(locale, {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(value / 100),
      formatFileSize: (value: number) => {
        const megabytes = value / 1_000_000;
        if (megabytes >= 1) {
          return new Intl.NumberFormat(locale, {
            style: "unit",
            unit: "megabyte",
            unitDisplay: "short",
            maximumFractionDigits: 1,
          }).format(megabytes);
        }
        return new Intl.NumberFormat(locale, {
          style: "unit",
          unit: "kilobyte",
          unitDisplay: "short",
          maximumFractionDigits: 0,
        }).format(value / 1_000);
      },
      dateKey: (value: string | Date) =>
        new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(value)),
    };
  }, [locale, timeZone]);
}
