"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderOpen,
  LockKeyhole,
  Save,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalFormat } from "@/hooks/use-local-format";
import { accessibleTextColor, stripHtml } from "@/lib/presentation";

export function SubjectDetailPage({ subjectId }: { subjectId: string }) {
  const t = useTranslations();
  const { data, saveSubjectNote } = useAcademicData();
  const format = useLocalFormat();
  const subject = data.subjects.find((item) => item.id === subjectId);
  const [note, setNote] = useState(data.subjectNotes[subjectId] ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!subject) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("subjects.notFound")}</p>
        <Button asChild variant="outline" size="sm" className="mt-4"><Link href="/subjects">{t("subjects.back")}</Link></Button>
      </div>
    );
  }

  const assessments = data.assessments.filter((item) => item.subjectId === subject.id);
  const announcements = data.announcements.filter((item) => item.subjectId === subject.id);
  const modules = data.modules.filter((item) => item.subjectId === subject.id);
  const files = data.courseFiles.filter((item) => item.subjectId === subject.id);
  const topics = data.studyTopics.filter((item) => item.subjectId === subject.id);

  const saveNote = async () => {
    setSaveState("saving");
    const result = await saveSubjectNote(subject.id, note);
    setSaveState(result.ok ? "saved" : "error");
  };

  return (
    <>
      <Link href="/subjects" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        {t("subjects.back")}
      </Link>
      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold" style={{ backgroundColor: subject.color, color: accessibleTextColor(subject.color) }}>
            {subject.code.slice(-2)}
          </span>
          <div>
            <p className="font-mono text-xs font-semibold text-primary">{subject.code}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{subject.name}</h1>
          </div>
        </div>
        <div className="w-full sm:w-56">
          {subject.currentScore !== undefined ? <Badge variant="outline" className="mb-3 font-normal">{t("subjects.currentGrade", { value: format.formatPercent(subject.currentScore) })}</Badge> : null}
          <div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{t("common.progress")}</span><span className="font-mono">{subject.progress}%</span></div>
          <Progress value={subject.progress} className="h-1.5" aria-label={t("accessibility.subjectProgress", { subject: subject.code, value: subject.progress })} />
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="mb-5 h-auto w-full justify-start overflow-x-auto rounded-lg bg-muted/60 p-1">
          {(["overview", "modules", "announcements", "files", "studyTopics", "personalNotes"] as const).map((key) => (
            <TabsTrigger key={key} value={key} className="whitespace-nowrap text-xs">{t(`subjects.${key}`)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-sm">{t("nav.assessments")}</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {assessments.map((assessment) => (
                <Link key={assessment.id} href={`/assessments#${assessment.id}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:text-primary">
                  <span className="min-w-0"><span className="block truncate text-sm font-medium">{assessment.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{assessment.dueAt ? format.formatDateTime(assessment.dueAt) : t("assessments.unknownDeadline")}</span></span>
                  <Badge variant="outline" className="shrink-0 font-normal">{t(`status.${assessment.workflowStatus}`)}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-sm">{t("subjects.studyTopics")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id}>
                  <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="truncate font-medium">{topic.title}</span><span className="font-mono text-muted-foreground">{topic.completion}%</span></div>
                  <Progress value={topic.completion} className="h-1.5" aria-label={t("accessibility.topicProgress", { topic: topic.title, value: topic.completion })} />
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full"><Link href="/study">{t("nav.study")}</Link></Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-0 space-y-3">
          {modules.map((moduleValue) => (
            <Card key={moduleValue.id} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {moduleValue.state === "LOCKED" ? <LockKeyhole aria-hidden="true" className="size-4 text-muted-foreground" /> : <BookMarked aria-hidden="true" className="size-4 text-primary" />}
                    <div><h2 className="text-sm font-semibold">{moduleValue.name}</h2><p className="mt-0.5 text-xs text-muted-foreground">{t("subjects.moduleItems", { count: moduleValue.items.length })}</p></div>
                  </div>
                  {moduleValue.state === "COMPLETED" ? <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" /> : null}
                </div>
                <div className="mt-4 divide-y border-t">
                  {moduleValue.items.map((item) => <div key={item.id} className="flex items-center justify-between py-2.5 text-xs"><span>{item.title}</span><span className="text-muted-foreground">{item.type}</span></div>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="announcements" className="mt-0 space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><div className="flex items-center gap-2">{announcement.unread ? <Badge>{t("common.new")}</Badge> : null}<time className="text-xs text-muted-foreground">{t("announcements.published", { date: format.formatDate(announcement.publishedAt) })}</time></div><h2 className="mt-3 text-base font-semibold">{announcement.title}</h2></div>
                  {announcement.htmlUrl ? <Button asChild variant="ghost" size="icon-sm"><a href={announcement.htmlUrl} target="_blank" rel="noreferrer" aria-label={t("common.openInCanvas")}><ExternalLink aria-hidden="true" className="size-4" /></a></Button> : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{stripHtml(announcement.message)}</p>
                <p className="mt-3 text-[11px] text-muted-foreground">{t("common.originalSource")} · {t("common.sourceUnchanged")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["summarize", "explain", "translateChinese", "extractActions"].map((key) => (
                    <Tooltip key={key}><TooltipTrigger asChild><span tabIndex={0}><Button disabled variant="outline" size="sm"><Sparkles aria-hidden="true" className="size-3.5" />{t(`announcements.${key}`)}</Button></span></TooltipTrigger><TooltipContent>{t("announcements.aiUnavailableTooltip")}</TooltipContent></Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          {files.length > 0 ? (
            <Card className="shadow-none">
              <CardContent className="divide-y p-0">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-4 sm:px-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <FileText aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {fileTypeLabel(file.contentType, t)}
                        {file.size ? ` · ${format.formatFileSize(file.size)}` : null}
                        {file.updatedAt ? ` · ${t("common.updated", { date: format.formatDate(file.updatedAt) })}` : null}
                      </p>
                    </div>
                    {file.url ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={file.url} target="_blank" rel="noreferrer" aria-label={t("subjects.openFile", { file: file.name })}>
                          {t("subjects.openFileAction")}
                          <ExternalLink aria-hidden="true" className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="font-normal">{t("common.mockMode")}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <EmptyState icon={FolderOpen} title={t("subjects.filesUnavailable")} />
          )}
        </TabsContent>

        <TabsContent value="studyTopics" className="mt-0 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id} className="shadow-none"><CardContent className="p-5"><p className="font-mono text-[11px] text-primary">{topic.subjectCode}</p><h2 className="mt-1 text-sm font-semibold">{topic.title}</h2><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{t("study.confidence")}</span><span>{topic.confidence}/5</span></div><Progress value={topic.completion} className="mt-2 h-1.5" aria-label={t("accessibility.topicProgress", { topic: topic.title, value: topic.completion })} /></CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="personalNotes" className="mt-0">
          <Card className="max-w-3xl shadow-none"><CardContent className="p-5"><label htmlFor="subject-note" className="mb-2 block text-sm font-medium">{t("subjects.personalNotes")}</label><Textarea id="subject-note" value={note} onChange={(event) => { setNote(event.target.value); setSaveState("idle"); }} placeholder={t("subjects.notesPlaceholder")} className="min-h-48 resize-y" /><div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{saveState === "saved" ? t("common.saved") : saveState === "error" ? t("errors.UNKNOWN") : null}</span><Button onClick={saveNote} disabled={saveState === "saving"} size="sm"><Save aria-hidden="true" className="size-3.5" />{saveState === "saving" ? t("loading.saving") : t("common.save")}</Button></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function fileTypeLabel(
  contentType: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string {
  if (contentType === "application/pdf") return t("subjects.fileTypePdf");
  if (contentType?.includes("wordprocessingml") || contentType === "application/msword") {
    return t("subjects.fileTypeDocument");
  }
  if (contentType === "text/csv") return t("subjects.fileTypeData");
  return t("subjects.fileTypeOther");
}
