"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Pin,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  Assessment,
  AssessmentWorkflowStatus,
} from "@/domain/academic/types";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useLocalFormat } from "@/hooks/use-local-format";
import type { ApplicationErrorCode } from "@/lib/errors";
import { cn } from "@/lib/utils";

type SortKey = "deadline" | "subject" | "status" | "urgency";

const workflowStatuses: AssessmentWorkflowStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "GRADED",
];

export function AssessmentsPage() {
  const t = useTranslations();
  const { data } = useAcademicData();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");

  const rows = useMemo(() => {
    const filtered = data.assessments.filter(
      (assessment) =>
        (subjectFilter === "all" || assessment.subjectId === subjectFilter) &&
        (statusFilter === "all" || assessment.workflowStatus === statusFilter),
    );
    return filtered.sort((left, right) => compareAssessments(left, right, sortKey));
  }, [data.assessments, sortKey, statusFilter, subjectFilter]);

  return (
    <>
      <PageHeading title={t("assessments.title")} description={t("assessments.subtitle")} />

      <div className="mb-5 grid gap-3 rounded-xl border bg-card p-3 shadow-none sm:grid-cols-3">
        <FilterSelect label={t("assessments.filterBySubject")} value={subjectFilter} onChange={setSubjectFilter}>
          <SelectItem value="all">{t("common.all")}</SelectItem>
          {data.subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.code}</SelectItem>)}
        </FilterSelect>
        <FilterSelect label={t("assessments.filterByStatus")} value={statusFilter} onChange={setStatusFilter}>
          <SelectItem value="all">{t("common.all")}</SelectItem>
          {workflowStatuses.map((status) => <SelectItem key={status} value={status}>{t(`status.${status}`)}</SelectItem>)}
        </FilterSelect>
        <FilterSelect label={t("assessments.sortBy")} value={sortKey} onChange={(value) => setSortKey(value as SortKey)} icon={ArrowUpDown}>
          {(["deadline", "subject", "status", "urgency"] as const).map((key) => <SelectItem key={key} value={key}>{t(`assessments.${key}`)}</SelectItem>)}
        </FilterSelect>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={CheckCircle2} title={t("assessments.noResults")} />
      ) : (
        <div className="space-y-3">
          {rows.map((assessment) => <AssessmentRow key={assessment.id} assessment={assessment} />)}
        </div>
      )}
    </>
  );
}

function AssessmentRow({ assessment }: { assessment: Assessment }) {
  const t = useTranslations();
  const format = useLocalFormat();
  const { saveAssessment } = useAcademicData();
  const [status, setStatus] = useState(assessment.workflowStatus);
  const [completion, setCompletion] = useState(assessment.completion);
  const [notes, setNotes] = useState(assessment.notes);
  const [pinned, setPinned] = useState(assessment.pinned);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorCode, setErrorCode] = useState<ApplicationErrorCode>();
  const urgency = assessmentUrgency(assessment);

  const dirty = status !== assessment.workflowStatus || completion !== assessment.completion || notes !== assessment.notes || pinned !== assessment.pinned;

  const save = async () => {
    setSaveState("saving");
    const result = await saveAssessment({
      id: assessment.id,
      workflowStatus: status,
      completion,
      notes,
      pinned,
    });
    if (result.ok) setSaveState("saved");
    else {
      setSaveState("error");
      setErrorCode(result.errorCode);
    }
  };

  return (
    <Card id={assessment.id} className={cn("scroll-mt-20 shadow-none", pinned && "border-primary/35")}>
      <CardContent className="p-0">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_180px_170px] lg:items-center">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-primary">{assessment.subjectCode}</span>
              <Badge variant={urgency === "high" ? "destructive" : "secondary"} className="font-normal">{t(`assessments.${urgency}Urgency`)}</Badge>
              {pinned ? <Pin aria-hidden="true" className="size-3.5 fill-primary text-primary" /> : null}
            </div>
            <h2 className="truncate text-sm font-semibold sm:text-[15px]">{assessment.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CalendarClock aria-hidden="true" className="size-3.5" />{assessment.dueAt ? format.formatDateTime(assessment.dueAt) : t("assessments.unknownDeadline")}</span>
              {assessment.points !== undefined ? <span>{t("common.points", { value: assessment.points })}</span> : null}
              {assessment.weighting !== undefined ? <span>{t("common.weighting", { value: assessment.weighting })}</span> : null}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("assessments.officialStatus")}</p>
            <Badge variant="outline" className="font-normal">{t(`status.${assessment.officialStatus}`)}</Badge>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("assessments.personalStatus")}</p>
            <Select value={status} onValueChange={(value) => { setStatus(value as AssessmentWorkflowStatus); setSaveState("idle"); }}>
              <SelectTrigger className="h-8 w-full text-xs" aria-label={`${t("assessments.personalStatus")} · ${assessment.title}`}><SelectValue /></SelectTrigger>
              <SelectContent>{workflowStatuses.map((value) => <SelectItem key={value} value={value}>{t(`status.${value}`)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 border-t bg-muted/15 p-4 sm:p-5 lg:grid-cols-[minmax(240px,0.7fr)_minmax(280px,1.3fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center justify-between text-xs"><Label>{t("assessments.completion")}</Label><span className="font-mono text-muted-foreground">{completion}%</span></div>
            <Slider value={[completion]} min={0} max={100} step={5} aria-label={t("accessibility.completionSlider")} onValueChange={([value]) => { setCompletion(value); setSaveState("idle"); }} />
            <Progress value={completion} className="mt-3 h-1" aria-label={t("accessibility.assessmentProgress", { assessment: assessment.title, value: completion })} />
          </div>
          <div>
            <Label htmlFor={`notes-${assessment.id}`} className="mb-2 block text-xs">{t("assessments.notes")}</Label>
            <Textarea id={`notes-${assessment.id}`} value={notes} onChange={(event) => { setNotes(event.target.value); setSaveState("idle"); }} placeholder={t("assessments.notesPlaceholder")} className="min-h-16 resize-y bg-background text-xs" />
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {assessment.htmlUrl ? <Button asChild variant="ghost" size="sm"><a href={assessment.htmlUrl} target="_blank" rel="noreferrer" aria-label={`${t("common.openInCanvas")} · ${t("accessibility.externalLink")}`}><ExternalLink aria-hidden="true" className="size-3.5" /></a></Button> : null}
            <Button type="button" variant={pinned ? "secondary" : "outline"} size="sm" onClick={() => { setPinned((value) => !value); setSaveState("idle"); }} aria-label={pinned ? t("assessments.unpin") : t("assessments.pin")}><Pin aria-hidden="true" className={cn("size-3.5", pinned && "fill-current")} /></Button>
            <Button type="button" size="sm" disabled={!dirty || saveState === "saving"} onClick={save}><Save aria-hidden="true" className="size-3.5" />{saveState === "saving" ? t("loading.saving") : t("assessments.saveProgress")}</Button>
          </div>
          {saveState === "saved" ? <p className="text-xs text-emerald-700 dark:text-emerald-400 lg:col-span-3">{t("assessments.progressSaved")}</p> : null}
          {saveState === "error" ? <p className="flex items-center gap-1.5 text-xs text-destructive lg:col-span-3"><CircleAlert aria-hidden="true" className="size-3.5" />{t(`errors.${errorCode ?? "UNKNOWN"}`)}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  icon?: typeof ArrowUpDown;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-background text-xs" aria-label={label}>{Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}<SelectValue /></SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function assessmentUrgency(assessment: Assessment): "high" | "medium" | "low" {
  if (!assessment.dueAt || assessment.officialStatus === "SUBMITTED" || assessment.officialStatus === "GRADED") return "low";
  const days = (new Date(assessment.dueAt).getTime() - Date.now()) / 86_400_000;
  if (days <= 2 || (days <= 4 && assessment.completion < 40)) return "high";
  if (days <= 7 || (assessment.weighting ?? 0) >= 30) return "medium";
  return "low";
}

function compareAssessments(left: Assessment, right: Assessment, key: SortKey): number {
  if (key === "subject") return left.subjectCode.localeCompare(right.subjectCode);
  if (key === "status") return left.workflowStatus.localeCompare(right.workflowStatus);
  if (key === "urgency") {
    const order = { high: 0, medium: 1, low: 2 };
    return order[assessmentUrgency(left)] - order[assessmentUrgency(right)];
  }
  return (left.dueAt ?? "9999").localeCompare(right.dueAt ?? "9999");
}
