"use client";

import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();
  return (
    <Card className="mx-auto mt-20 max-w-lg shadow-none">
      <CardContent className="p-8 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive"><CircleAlert aria-hidden="true" className="size-5" /></span>
        <h1 className="mt-4 text-base font-semibold">{t("errors.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("errors.UNKNOWN")}</p>
        <Button className="mt-5" onClick={reset}>{t("common.retry")}</Button>
      </CardContent>
    </Card>
  );
}
