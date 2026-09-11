"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { AcademicData } from "@/domain/academic/types";
import { AcademicDataProvider } from "./academic-data-provider";
import type { PersistenceMode } from "./academic-data-provider";
import { LocaleProvider } from "./locale-provider";

export function AppProviders({
  initialData,
  persistenceMode,
  children,
}: {
  initialData: AcademicData;
  persistenceMode: PersistenceMode;
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider>
        <AcademicDataProvider initialData={initialData} persistenceMode={persistenceMode}>
          <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
        </AcademicDataProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
