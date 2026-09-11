"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHeading } from "@/components/shared/page-heading";
import { useLocalFormat } from "@/hooks/use-local-format";
import { stripHtml } from "@/lib/presentation";
import type { Assessment } from "@/domain/academic/types";

export function DashboardPage() {
  const t = useTranslations();
  const { data } = useAcademicData();
  const format = useLocalFormat();
  const now = new Date();
  const period = now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening";
  const todayKey = format.dateKey(now);
  const todayClasses = data.timetableEvents.filter((event) => format.dateKey(event.startAt) === todayKey);
  const recommendationRows = data.recommendations.flatMap((recommendation) => {
    const assessment = data.assessments.find((item) => item.id === recommendation.taskId);
    return assessment ? [{ recommendation, assessment }] : [];
  });
  const lastSync = data.syncStates
    .map((state) => state.lastSuccessfulAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return (
    <>
      <PageHeading
        eyebrow={format.formatLongDate(now)}
        title={t("dashboard.title", { period: t(`dashboard.${period}`) })}
        description={t("dashboard.subtitle")}
        actions={
          <Badge variant="outline" className="h-8 gap-2 rounded-lg px-3 font-normal">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {lastSync ? t("sync.success", { date: format.formatDateTime(lastSync) }) : t("sync.never")}
          </Badge>
        }
      />

      <section aria-labelledby="top-three-heading" className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 id="top-three-heading" className="text-base font-semibold tracking-tight">{t("dashboard.todayTop3")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.todayTop3Description")}</p>
          </div>
          <Link href="/assessments" className="hidden text-xs font-medium text-primary hover:underline sm:block">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {recommendationRows.map(({ recommendation, assessment }, index) => (
            <Card
              key={assessment.id}
              className={index === 0 ? "border-primary/30 bg-primary/[0.035] shadow-sm dark:bg-primary/[0.06]" : "shadow-none"}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-medium text-muted-foreground">0{index + 1}</span>
                  <SubjectMark code={assessment.subjectCode} color={subjectColour(data.subjects, assessment.subjectId)} />
                </div>
                <h3 className="text-[15px] font-semibold leading-6">{assessment.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{dueText(assessment, now, t, format)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recommendation.reasons.slice(0, 3).map((reason) => (
                    <Badge key={reason} variant={reason === "OVERDUE" || reason === "DUE_TODAY" ? "destructive" : "secondary"} className="font-normal">
                      {t(`priority.${reason}`)}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto pt-5">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t("common.progress")}</span>
                    <span className="font-mono">{assessment.completion}%</span>
                  </div>
                  <Progress value={assessment.completion} className="h-1.5" aria-label={t("accessibility.assessmentProgress", { assessment: assessment.title, value: assessment.completion })} />
                  <Button asChild variant={index === 0 ? "default" : "outline"} size="sm" className="mt-4 w-full">
                    <Link href={`/assessments#${assessment.id}`}>
                      {index === 0 ? t("dashboard.focusNow") : t("dashboard.continueTask")}
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock aria-hidden="true" className="size-4 text-primary" />
                {t("dashboard.todayClasses")}
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Link href="/calendar">{t("common.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayClasses.length ? (
                <div className="divide-y">
                  {todayClasses.map((event) => (
                    <div key={event.id} className="grid gap-2 py-3 first:pt-0 sm:grid-cols-[104px_1fr_auto] sm:items-center">
                      <div className="font-mono text-xs font-medium">
                        {format.formatTime(event.startAt)}–{format.formatTime(event.endAt)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title || t("calendar.untitledEvent")}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin aria-hidden="true" className="size-3" />
                          {event.location}
                        </p>
                      </div>
                      <Badge variant="outline" className="w-fit font-normal">{t(`eventType.${event.eventType}`)}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("dashboard.noClassToday")}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Bell aria-hidden="true" className="size-4 text-primary" />
                {t("dashboard.recentAnnouncements")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {data.announcements.slice(0, 3).map((announcement, index) => (
                <div key={announcement.id}>
                  <article className="py-4 first:pt-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-primary">{announcement.subjectCode}</span>
                      {announcement.unread ? <><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /><span className="sr-only">{t("common.new")}</span></> : null}
                    </div>
                    <h3 className="text-sm font-medium">{announcement.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{stripHtml(announcement.message)}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <time className="text-[11px] text-muted-foreground">{format.formatDate(announcement.publishedAt)}</time>
                      {announcement.htmlUrl ? (
                        <a href={announcement.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                          {t("common.openInCanvas")}
                          <ExternalLink aria-hidden="true" className="size-3" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                  {index < Math.min(data.announcements.length, 3) - 1 ? <Separator /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 aria-hidden="true" className="size-4 text-primary" />
                {t("dashboard.upcomingDeadlines")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.assessments
                .filter((assessment) => assessment.dueAt && assessment.officialStatus === "UNSUBMITTED")
                .slice(0, 4)
                .map((assessment) => (
                  <Link key={assessment.id} href={`/assessments#${assessment.id}`} className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-mono text-[10px] font-semibold">
                      {assessment.dueAt ? format.formatShortDate(assessment.dueAt).split(" ")[0] : "–"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{assessment.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{assessment.subjectCode} · {assessment.dueAt ? format.formatDateTime(assessment.dueAt) : t("assessments.unknownDeadline")}</span>
                    </span>
                  </Link>
                ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BookOpenCheck aria-hidden="true" className="size-4 text-primary" />
                {t("dashboard.studyProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.subjects.map((subject) => (
                <div key={subject.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-medium">{subject.code}</span>
                    <span className="font-mono text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-1.5" aria-label={t("accessibility.subjectProgress", { subject: subject.code, value: subject.progress })} />
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/study">
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  {t("nav.study")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <p className="px-1 text-[11px] leading-5 text-muted-foreground">{t("dashboard.plannerDisclosure")}</p>
        </div>
      </div>
    </>
  );
}

function SubjectMark({ code, color }: { code: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {code}
    </span>
  );
}

function subjectColour(subjects: Array<{ id: string; color: string }>, id: string): string {
  return subjects.find((subject) => subject.id === id)?.color ?? "#0F6CBD";
}

function dueText(
  assessment: Assessment,
  now: Date,
  t: ReturnType<typeof useTranslations>,
  format: ReturnType<typeof useLocalFormat>,
): string {
  if (!assessment.dueAt) return t("assessments.unknownDeadline");
  const dueAt = new Date(assessment.dueAt);
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return t("dashboard.overdueBy", { duration: `${Math.abs(days)}d` });
  if (days <= 3) return t("dashboard.remainingDays", { count: days });
  return t("dashboard.dueAt", { date: format.formatDate(dueAt), time: format.formatTime(dueAt) });
}
