"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckSquare2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LanguageSelect } from "./language-select";
import { ThemeToggle } from "./theme-toggle";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { useLocalePreference } from "@/components/providers/locale-provider";

const navigation = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/subjects", key: "subjects", icon: GraduationCap },
  { href: "/assessments", key: "assessments", icon: CheckSquare2 },
  { href: "/calendar", key: "calendar", icon: CalendarDays },
  { href: "/study", key: "study", icon: BookOpen },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const { locale } = useLocalePreference();
  const pathname = usePathname();
  const { data } = useAcademicData();
  const [open, setOpen] = useState(false);
  const pageKey = navigation.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  )?.key ?? "dashboard";
  const documentTitle = `${t(`nav.${pageKey}`)} · ${t("common.appName")}`;

  useEffect(() => {
    const applyTitle = () => {
      if (document.title !== documentTitle) document.title = documentTitle;
    };
    applyTitle();

    // App Router may stream server metadata after hydration. Keep the title in
    // sync with the locally selected locale without coupling locale to routing.
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [documentTitle, locale]);

  const nav = (
    <nav aria-label={t("common.appName")} className="space-y-1">
      {navigation.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--primary)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden="true" className="size-[18px] shrink-0" />
            <span>{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-3 px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles aria-hidden="true" className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{t("common.appName")}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">UTS</p>
          </div>
        </div>
        <Separator />
        <div className="flex-1 px-3 py-4">{nav}</div>
        <div className="space-y-3 border-t p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="font-normal">
              <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {data.mode === "mock" ? t("common.mockMode") : t("sync.live")}
            </Badge>
            <ThemeToggle />
          </div>
          <LanguageSelect compact />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles aria-hidden="true" className="size-4" />
          </span>
          <span className="text-sm font-semibold">{t("common.appName")}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("nav.openMenu")}>
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 px-3 pt-4" showCloseButton={false}>
              <SheetTitle className="px-3 pb-4 text-left text-base">{t("common.appName")}</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3" aria-label={t("nav.closeMenu")}>
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </SheetClose>
              <div onClick={() => setOpen(false)}>{nav}</div>
              <Separator className="my-4" />
              <div className="px-3">
                <LanguageSelect />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="min-h-dvh lg:pl-64">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
