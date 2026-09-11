"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalePreference } from "@/components/providers/locale-provider";
import type { LocalePreference } from "@/i18n/config";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const t = useTranslations();
  const { preference, setPreference } = useLocalePreference();

  return (
    <Select value={preference} onValueChange={(value) => setPreference(value as LocalePreference)}>
      <SelectTrigger
        aria-label={t("accessibility.languageSelector")}
        className={compact ? "h-8 w-[116px] border-0 bg-transparent text-xs shadow-none" : "w-full"}
      >
        <Languages aria-hidden="true" className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en-AU">{t("settings.english")}</SelectItem>
        <SelectItem value="zh-CN">{t("settings.chinese")}</SelectItem>
        <SelectItem value="system">{t("settings.system")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
