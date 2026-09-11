"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations();
  return <div className="py-24 text-center"><FileQuestion aria-hidden="true" className="mx-auto size-8 text-muted-foreground" /><h1 className="mt-4 text-lg font-semibold">{t("errors.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("subjects.notFound")}</p><Button asChild variant="outline" className="mt-5"><Link href="/">{t("nav.dashboard")}</Link></Button></div>;
}
