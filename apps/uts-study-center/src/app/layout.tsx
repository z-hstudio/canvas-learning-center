import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/app/app-shell";
import { buildMockAcademicData } from "@/integrations/canvas/mock-data";
import { logEvent } from "@/lib/logger";
import { getAcademicData } from "@/services/academic-data-service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UTS Study Center",
    template: "%s · UTS Study Center",
  },
  description: "A bilingual, local-first academic workspace for UTS students.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  let initialData;
  try {
    initialData = await getAcademicData();
  } catch (error) {
    logEvent("error", "academic.initialization.failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    initialData = buildMockAcademicData();
  }

  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders
          initialData={initialData}
          persistenceMode={process.env.VERCEL ? "browser" : "server"}
        >
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
