"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CloudCog,
  DatabaseZap,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSelect } from "@/components/app/language-select";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { useLocalePreference } from "@/components/providers/locale-provider";
import { PageHeading } from "@/components/shared/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_CANVAS_BASE_URL } from "@/integrations/canvas/constants";
import type { ApplicationErrorCode } from "@/lib/errors";

const CANVAS_URL_STORAGE_KEY = "uts-study-center.canvas-base-url";

export function SettingsPage() {
  const t = useTranslations();

  return (
    <>
      <PageHeading title={t("settings.title")} description={t("settings.subtitle")} />
      <Tabs defaultValue="general" orientation="vertical" className="grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <TabsList className="grid h-auto grid-cols-2 gap-1 bg-muted/50 p-1 lg:sticky lg:top-8 lg:grid-cols-1">
          <TabsTrigger value="general" className="justify-start"><Settings2 aria-hidden="true" className="size-4" />{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="canvas" className="justify-start"><CloudCog aria-hidden="true" className="size-4" />{t("settings.canvas")}</TabsTrigger>
          <TabsTrigger value="timetable" className="justify-start"><CalendarDays aria-hidden="true" className="size-4" />{t("settings.timetable")}</TabsTrigger>
          <TabsTrigger value="ai" className="justify-start"><Bot aria-hidden="true" className="size-4" />{t("settings.ai")}</TabsTrigger>
        </TabsList>
        <div>
          <TabsContent value="general" className="mt-0"><GeneralSettings /></TabsContent>
          <TabsContent value="canvas" className="mt-0"><CanvasSettings /></TabsContent>
          <TabsContent value="timetable" className="mt-0"><TimetableSettings /></TabsContent>
          <TabsContent value="ai" className="mt-0"><AISettings /></TabsContent>
        </div>
      </Tabs>
    </>
  );
}

function GeneralSettings() {
  const t = useTranslations();
  const { timeZone, setTimeZone } = useLocalePreference();
  const { theme, setTheme } = useTheme();

  return (
    <Card className="shadow-none">
      <CardHeader><CardTitle className="text-base">{t("settings.general")}</CardTitle><CardDescription>{t("settings.languageDescription")}</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <SettingRow title={t("settings.language")} description={t("settings.languageDescription")}><div className="w-full sm:w-56"><LanguageSelect /></div></SettingRow>
        <Separator />
        <SettingRow title={t("settings.timezone")}><Select value={timeZone} onValueChange={setTimeZone}><SelectTrigger className="w-full sm:w-56" aria-label={t("settings.timezone")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem></SelectContent></Select></SettingRow>
        <Separator />
        <SettingRow title={t("settings.theme")}><Select value={theme ?? "system"} onValueChange={setTheme}><SelectTrigger className="w-full sm:w-56" aria-label={t("settings.theme")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">{t("settings.light")}</SelectItem><SelectItem value="dark">{t("settings.dark")}</SelectItem><SelectItem value="system">{t("settings.systemTheme")}</SelectItem></SelectContent></Select></SettingRow>
      </CardContent>
    </Card>
  );
}

function CanvasSettings() {
  const t = useTranslations();
  const { data, persistenceMode, syncNow } = useAcademicData();
  const [baseUrl, setBaseUrl] = useState(DEFAULT_CANVAS_BASE_URL);
  const [token, setToken] = useState("");
  const [connectionState, setConnectionState] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "success" | "partial" | "error">("idle");
  const [errorCode, setErrorCode] = useState<ApplicationErrorCode>();

  useEffect(() => {
    const savedUrl = window.localStorage.getItem(CANVAS_URL_STORAGE_KEY);
    if (savedUrl) queueMicrotask(() => setBaseUrl(savedUrl));
  }, []);

  const testConnection = async () => {
    setConnectionState("testing");
    window.localStorage.setItem(CANVAS_URL_STORAGE_KEY, baseUrl);
    let result:
      | { ok: true; userName: string }
      | { ok: false; errorCode: ApplicationErrorCode };
    try {
      const response = await fetch("/api/canvas/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, accessToken: token }),
      });
      result = (await response.json()) as typeof result;
    } catch {
      result = { ok: false, errorCode: "NETWORK_OFFLINE" };
    }
    setToken("");
    if (result.ok) setConnectionState("success");
    else {
      setConnectionState("error");
      setErrorCode(result.errorCode);
    }
  };

  const synchronize = async () => {
    setSyncState("syncing");
    const result = await syncNow();
    if (result.ok) setSyncState(result.partial ? "partial" : "success");
    else {
      setSyncState("error");
      setErrorCode(result.errorCode);
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base">{t("settings.canvas")}</CardTitle><CardDescription className="mt-1">{t("settings.tokenSecurity")}</CardDescription></div><Badge variant={data.mode === "canvas" ? "default" : "secondary"}><span className="mr-1.5 size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />{data.mode === "canvas" ? t("settings.connected") : t("settings.notConnected")}</Badge></div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2"><Label htmlFor="canvas-url">{t("settings.baseUrl")}</Label><Input id="canvas-url" type="url" value={baseUrl} onChange={(event) => { setBaseUrl(event.target.value); setConnectionState("idle"); }} autoComplete="url" /></div>
        <div className="space-y-2"><Label htmlFor="canvas-token">{t("settings.accessToken")}</Label><div className="relative"><KeyRound aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="canvas-token" type="password" value={token} onChange={(event) => { setToken(event.target.value); setConnectionState("idle"); }} placeholder={t("settings.tokenPlaceholder")} autoComplete="off" className="pl-9" /></div></div>
        <Alert><LockKeyhole aria-hidden="true" /><AlertTitle>{t("settings.localFirst")}</AlertTitle><AlertDescription>{t("settings.tokenSecurity")}</AlertDescription></Alert>
        {persistenceMode === "browser" ? <Alert><CloudCog aria-hidden="true" /><AlertTitle>{t("settings.hostedDemo")}</AlertTitle><AlertDescription>{t("settings.hostedSyncUnavailable")}</AlertDescription></Alert> : null}
        {connectionState === "success" ? <InlineState success text={t("settings.connectionSuccess")} /> : connectionState === "error" ? <InlineState text={t(`errors.${errorCode ?? "UNKNOWN"}`)} /> : null}
        {syncState === "success" ? <InlineState success text={t("settings.syncComplete")} /> : syncState === "partial" ? <InlineState text={t("sync.partial")} /> : syncState === "error" ? <InlineState text={t(`errors.${errorCode ?? "UNKNOWN"}`)} /> : null}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={!token || connectionState === "testing"} onClick={testConnection}>{connectionState === "testing" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ShieldCheck aria-hidden="true" className="size-4" />}{connectionState === "testing" ? t("settings.testingConnection") : t("settings.testConnection")}</Button><Button type="button" disabled={persistenceMode === "browser" || syncState === "syncing"} onClick={synchronize}>{syncState === "syncing" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <DatabaseZap aria-hidden="true" className="size-4" />}{syncState === "syncing" ? t("settings.syncing") : t("settings.syncNow")}</Button></div>
      </CardContent>
    </Card>
  );
}

function TimetableSettings() {
  const t = useTranslations();
  const { importTimetable } = useAcademicData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [state, setState] = useState<"idle" | "importing" | "success" | "error">("idle");
  const [result, setResult] = useState({ imported: 0, duplicates: 0 });
  const [errorCode, setErrorCode] = useState<ApplicationErrorCode>();

  const importFile = async () => {
    if (!file) return;
    setState("importing");
    const actionResult = await importTimetable(await file.text());
    if (actionResult.ok) {
      setResult({ imported: actionResult.imported ?? 0, duplicates: actionResult.duplicates ?? 0 });
      setState("success");
      setFile(undefined);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      setState("error");
      setErrorCode(actionResult.errorCode);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">{t("settings.icsImport")}</CardTitle><CardDescription>{t("settings.icsDescription")}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="ics-file">{t("settings.chooseIcs")}</Label><Input ref={inputRef} id="ics-file" type="file" accept=".ics,text/calendar" onChange={(event) => { setFile(event.target.files?.[0]); setState("idle"); }} /></div>{state === "success" ? <InlineState success text={t("settings.importSuccess", { count: result.imported, duplicates: result.duplicates })} /> : state === "error" ? <InlineState text={t(`errors.${errorCode ?? "TIMETABLE_PARSE_FAILED"}`)} /> : null}<Button disabled={!file || state === "importing"} onClick={importFile}>{state === "importing" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Upload aria-hidden="true" className="size-4" />}{state === "importing" ? t("settings.importing") : t("settings.importIcs")}</Button></CardContent></Card>
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">{t("settings.calendarFeed")}</CardTitle><CardDescription>{t("settings.feedFuture")}</CardDescription></CardHeader><CardContent><Input disabled type="url" placeholder={t("settings.calendarFeedPlaceholder")} /></CardContent></Card>
    </div>
  );
}

function AISettings() {
  const t = useTranslations();
  return (
    <Card className="shadow-none"><CardHeader><CardTitle className="text-base">{t("settings.ai")}</CardTitle><CardDescription>{t("settings.aiUnavailable")}</CardDescription></CardHeader><CardContent className="space-y-5"><Alert><Bot aria-hidden="true" /><AlertTitle>{t("errors.AI_PROVIDER_UNAVAILABLE")}</AlertTitle><AlertDescription>{t("settings.aiUnavailable")}</AlertDescription></Alert><SettingRow title={t("settings.provider")}><Input disabled value="DeepSeek" aria-label={t("settings.provider")} className="w-full sm:w-56" /></SettingRow><Separator /><SettingRow title={t("settings.preferredLanguage")}><Select disabled value="zh-CN"><SelectTrigger className="w-full sm:w-56" aria-label={t("settings.preferredLanguage")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="zh-CN">{t("settings.chinese")}</SelectItem></SelectContent></Select></SettingRow><Separator /><SettingRow title={t("settings.summaryLength")}><Select disabled value="standard"><SelectTrigger className="w-full sm:w-56" aria-label={t("settings.summaryLength")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">{t("settings.standard")}</SelectItem></SelectContent></Select></SettingRow><Alert><ShieldCheck aria-hidden="true" /><AlertTitle>{t("settings.localFirst")}</AlertTitle><AlertDescription>{t("settings.localFirstDescription")}</AlertDescription></Alert></CardContent></Card>
  );
}

function SettingRow({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">{title}</p>{description ? <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">{description}</p> : null}</div>{children}</div>;
}

function InlineState({ success = false, text }: { success?: boolean; text: string }) {
  return <p className={success ? "flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400" : "flex items-center gap-2 text-xs text-destructive"}>{success ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <CircleAlert aria-hidden="true" className="size-4" />}{text}</p>;
}
