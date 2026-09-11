"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const t = useTranslations();
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{t("loading.page")}</span>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-9 w-72 max-w-full" />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((value) => <Skeleton key={value} className="h-64 rounded-xl" />)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
