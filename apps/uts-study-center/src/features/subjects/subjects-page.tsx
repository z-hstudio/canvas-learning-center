"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalFormat } from "@/hooks/use-local-format";
import { accessibleTextColor } from "@/lib/presentation";

export function SubjectsPage() {
  const t = useTranslations();
  const { data } = useAcademicData();
  const format = useLocalFormat();

  return (
    <>
      <PageHeading
        title={t("subjects.title")}
        description={t("subjects.subtitle")}
        actions={<Badge variant="secondary">{t("subjects.active", { count: data.subjects.length })}</Badge>}
      />

      {data.subjects.length === 0 ? (
        <EmptyState icon={GraduationCap} title={t("empty.subjects")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {data.subjects.map((subject) => {
            const assessments = data.assessments
              .filter((assessment) => assessment.subjectId === subject.id && assessment.dueAt)
              .sort((left, right) => (left.dueAt ?? "").localeCompare(right.dueAt ?? ""));
            const nextAssessment = assessments.find(
              (assessment) => new Date(assessment.dueAt ?? 0).getTime() >= Date.now(),
            );
            const recentAnnouncement = data.announcements.find(
              (announcement) => announcement.subjectId === subject.id,
            );
            return (
              <Link key={subject.id} href={`/subjects/${subject.id}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Card className="h-full shadow-none transition-colors group-hover:border-primary/30 group-hover:bg-muted/20">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-10 place-items-center rounded-xl text-sm font-bold" style={{ backgroundColor: subject.color, color: accessibleTextColor(subject.color) }}>
                        {subject.code.slice(-2)}
                      </span>
                      <div className="flex items-center gap-2">
                        {subject.currentScore !== undefined ? <Badge variant="outline" className="font-normal">{t("subjects.currentGrade", { value: format.formatPercent(subject.currentScore) })}</Badge> : null}
                        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </div>
                    <p className="mt-5 font-mono text-xs font-semibold text-primary">{subject.code}</p>
                    <h2 className="mt-1 min-h-12 text-base font-semibold leading-6">{subject.name}</h2>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                        <span>{t("common.progress")}</span>
                        <span className="font-mono">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-1.5" aria-label={t("accessibility.subjectProgress", { subject: subject.code, value: subject.progress })} />
                    </div>
                    <div className="mt-5 space-y-3 border-t pt-4">
                      <div className="flex items-start gap-2.5">
                        <Clock3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("subjects.nextAssessment")}</p>
                          <p className="mt-0.5 truncate text-xs font-medium">
                            {nextAssessment ? nextAssessment.title : t("subjects.noUpcomingAssessment")}
                          </p>
                          {nextAssessment?.dueAt ? <p className="mt-0.5 text-[11px] text-muted-foreground">{format.formatDateTime(nextAssessment.dueAt)}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <BookOpen aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("subjects.recentActivity")}</p>
                          <p className="mt-0.5 truncate text-xs font-medium">{recentAnnouncement?.title ?? t("empty.announcements")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
