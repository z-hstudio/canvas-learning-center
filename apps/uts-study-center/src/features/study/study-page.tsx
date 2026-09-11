"use client";

import { useState } from "react";
import { BookOpenCheck, BrainCircuit, CheckCircle2, CircleAlert, Plus, RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StudyTopic } from "@/domain/academic/types";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useLocalFormat } from "@/hooks/use-local-format";
import type { ApplicationErrorCode } from "@/lib/errors";

export function StudyPage() {
  const t = useTranslations();
  const { createTopic, data } = useAcademicData();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [newSubjectId, setNewSubjectId] = useState(data.subjects[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [createState, setCreateState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const topics = data.studyTopics.filter((topic) => subjectFilter === "all" || topic.subjectId === subjectFilter);
  const needsReview = topics.filter((topic) => !topic.nextReviewAt || new Date(topic.nextReviewAt) <= new Date()).length;

  const addTopic = async () => {
    setCreateState("saving");
    const result = await createTopic({ subjectId: newSubjectId, title: newTitle });
    if (result.ok) {
      setNewTitle("");
      setCreateState("saved");
    } else {
      setCreateState("error");
    }
  };

  return (
    <>
      <PageHeading
        title={t("study.title")}
        description={t("study.subtitle")}
        actions={<Badge variant={needsReview > 0 ? "destructive" : "secondary"}>{t("study.needsReview")} · {needsReview}</Badge>}
      />

      <Card className="mb-5 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">{t("study.addTopic")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("study.addTopicDescription")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] sm:items-end">
            <div>
              <Label htmlFor="new-topic-subject" className="mb-1.5 block text-xs">{t("assessments.subject")}</Label>
              <Select value={newSubjectId} onValueChange={(value) => { setNewSubjectId(value); setCreateState("idle"); }}>
                <SelectTrigger id="new-topic-subject" className="w-full" aria-label={t("assessments.subject")}><SelectValue /></SelectTrigger>
                <SelectContent>{data.subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.code}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-topic-title" className="mb-1.5 block text-xs">{t("study.topicTitle")}</Label>
              <Input id="new-topic-title" value={newTitle} maxLength={200} placeholder={t("study.topicTitlePlaceholder")} onChange={(event) => { setNewTitle(event.target.value); setCreateState("idle"); }} onKeyDown={(event) => { if (event.key === "Enter" && newTitle.trim()) { event.preventDefault(); void addTopic(); } }} />
            </div>
            <Button type="button" disabled={!newSubjectId || !newTitle.trim() || createState === "saving"} onClick={addTopic}>
              <Plus aria-hidden="true" className="size-4" />
              {createState === "saving" ? t("loading.saving") : t("study.createTopic")}
            </Button>
          </div>
          <div aria-live="polite" className="mt-2 min-h-5 text-xs">
            {createState === "saved" ? <span className="text-emerald-700 dark:text-emerald-400">{t("study.topicCreated")}</span> : createState === "error" ? <span className="text-destructive">{t("errors.VALIDATION_FAILED")}</span> : null}
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 max-w-xs">
        <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("assessments.filterBySubject")}</Label>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="h-9" aria-label={t("assessments.filterBySubject")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("common.all")}</SelectItem>{data.subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.code} · {subject.name}</SelectItem>)}</SelectContent></Select>
      </div>

      {topics.length === 0 ? (
        <EmptyState icon={BookOpenCheck} title={t("empty.topics")} />
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-2">
          {topics.map((topic) => <StudyTopicCard key={topic.id} topic={topic} />)}
        </div>
      )}

      <Card className="mt-6 border-dashed bg-muted/15 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BrainCircuit aria-hidden="true" className="size-5" /></span>
          <div><h2 className="text-sm font-semibold">{t("study.futureTools")}</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{t("study.futureToolsDescription")}</p></div>
        </CardContent>
      </Card>
    </>
  );
}

function StudyTopicCard({ topic }: { topic: StudyTopic }) {
  const t = useTranslations();
  const format = useLocalFormat();
  const { saveTopic } = useAcademicData();
  const [confidence, setConfidence] = useState(topic.confidence);
  const [completion, setCompletion] = useState(topic.completion);
  const [notes, setNotes] = useState(topic.notes);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorCode, setErrorCode] = useState<ApplicationErrorCode>();

  const persist = async (markReviewed: boolean) => {
    setSaveState("saving");
    const result = await saveTopic({ id: topic.id, confidence, completion, notes, markReviewed });
    if (result.ok) setSaveState("saved");
    else {
      setSaveState("error");
      setErrorCode(result.errorCode);
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-semibold text-primary">{topic.subjectCode}</p><CardTitle className="mt-1 text-[15px] leading-6">{topic.title}</CardTitle></div>{topic.nextReviewAt && new Date(topic.nextReviewAt) <= new Date() ? <Badge variant="destructive">{t("study.needsReview")}</Badge> : null}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span>{topic.lastReviewed ? t("study.lastReviewed", { date: format.formatDate(topic.lastReviewed) }) : t("study.neverReviewed")}</span>{topic.nextReviewAt ? <span>{t("study.nextReview", { date: format.formatDate(topic.nextReviewAt) })}</span> : null}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div><div className="mb-3 flex justify-between text-xs"><Label>{t("study.confidence")}</Label><span className="font-mono text-muted-foreground">{confidence}/5</span></div><Slider value={[confidence]} min={1} max={5} step={1} aria-label={t("accessibility.confidenceSlider")} onValueChange={([value]) => { setConfidence(value); setSaveState("idle"); }} /></div>
          <div><div className="mb-3 flex justify-between text-xs"><Label>{t("study.completion")}</Label><span className="font-mono text-muted-foreground">{completion}%</span></div><Slider value={[completion]} min={0} max={100} step={5} aria-label={t("accessibility.completionSlider")} onValueChange={([value]) => { setCompletion(value); setSaveState("idle"); }} /><Progress value={completion} className="mt-3 h-1" aria-label={t("accessibility.topicProgress", { topic: topic.title, value: completion })} /></div>
        </div>
        <div><Label htmlFor={`topic-notes-${topic.id}`} className="mb-2 block text-xs">{t("study.notes")}</Label><Textarea id={`topic-notes-${topic.id}`} value={notes} onChange={(event) => { setNotes(event.target.value); setSaveState("idle"); }} placeholder={t("study.notesPlaceholder")} className="min-h-24 resize-y" /></div>
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-h-5 text-xs">{saveState === "saved" ? <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><CheckCircle2 aria-hidden="true" className="size-3.5" />{t("study.topicSaved")}</span> : saveState === "error" ? <span className="inline-flex items-center gap-1.5 text-destructive"><CircleAlert aria-hidden="true" className="size-3.5" />{t(`errors.${errorCode ?? "UNKNOWN"}`)}</span> : null}</div>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={saveState === "saving"} onClick={() => persist(true)}><RotateCcw aria-hidden="true" className="size-3.5" />{t("study.markReviewed")}</Button><Button size="sm" disabled={saveState === "saving"} onClick={() => persist(false)}><Save aria-hidden="true" className="size-3.5" />{saveState === "saving" ? t("loading.saving") : t("study.saveTopic")}</Button></div>
        </div>
      </CardContent>
    </Card>
  );
}
