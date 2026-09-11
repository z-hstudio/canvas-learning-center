import { z } from "zod";
import type { AcademicData, TimetableEvent } from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";

const STORAGE_KEY = "uts-study-center.academic-data.v1";

const assessmentProgressSchema = z.object({
  workflowStatus: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "READY_TO_SUBMIT",
    "SUBMITTED",
    "GRADED",
  ]),
  completion: z.number().int().min(0).max(100),
  notes: z.string().max(4_000),
  pinned: z.boolean(),
});

const studyTopicProgressSchema = z.object({
  confidence: z.number().int().min(1).max(5),
  completion: z.number().int().min(0).max(100),
  notes: z.string().max(8_000),
  lastReviewed: z.string().optional(),
  nextReviewAt: z.string().optional(),
});

const createdStudyTopicSchema = studyTopicProgressSchema.extend({
  id: z.string(),
  subjectId: z.string(),
  subjectCode: z.string(),
  title: z.string().min(1).max(200),
  userCreated: z.literal(true),
});

const timetableEventSchema = z.object({
  id: z.string(),
  fingerprint: z.string(),
  provider: z.literal("ics"),
  externalId: z.string().optional(),
  subjectId: z.string().optional(),
  title: z.string(),
  subjectCode: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  eventType: z.enum(["LECTURE", "TUTORIAL", "LAB", "WORKSHOP", "SEMINAR", "OTHER"]),
  source: z.string(),
});

const localAcademicStateSchema = z.object({
  version: z.literal(1),
  assessments: z.record(z.string(), assessmentProgressSchema),
  studyTopics: z.record(z.string(), studyTopicProgressSchema),
  createdStudyTopics: z.array(createdStudyTopicSchema).max(1_000).default([]),
  subjectNotes: z.record(z.string(), z.string().max(20_000)),
  timetableEvents: z.array(timetableEventSchema).max(10_000),
});

export type LocalAcademicState = z.infer<typeof localAcademicStateSchema>;

export function extractLocalAcademicState(data: AcademicData): LocalAcademicState {
  return {
    version: 1,
    assessments: Object.fromEntries(
      data.assessments.map((assessment) => [
        assessment.id,
        {
          workflowStatus: assessment.workflowStatus,
          completion: assessment.completion,
          notes: assessment.notes,
          pinned: assessment.pinned,
        },
      ]),
    ),
    studyTopics: Object.fromEntries(
      data.studyTopics.map((topic) => [
        topic.id,
        {
          confidence: topic.confidence,
          completion: topic.completion,
          notes: topic.notes,
          lastReviewed: topic.lastReviewed,
          nextReviewAt: topic.nextReviewAt,
        },
      ]),
    ),
    createdStudyTopics: data.studyTopics.flatMap((topic) =>
      topic.userCreated ? [{ ...topic, userCreated: true as const }] : [],
    ),
    subjectNotes: data.subjectNotes,
    timetableEvents: data.timetableEvents.filter(
      (event): event is TimetableEvent & { provider: "ics" } => event.provider === "ics",
    ),
  };
}

export function applyLocalAcademicState(
  sourceData: AcademicData,
  localState: LocalAcademicState,
  now = new Date(),
): AcademicData {
  const subjectIds = new Set(sourceData.subjects.map((subject) => subject.id));
  const assessments = sourceData.assessments.map((assessment) => ({
    ...assessment,
    ...(localState.assessments[assessment.id] ?? {}),
  }));
  const topicSources = Array.from(new Map(
    [
      ...sourceData.studyTopics,
      ...localState.createdStudyTopics.filter((topic) => subjectIds.has(topic.subjectId)),
    ].map((topic) => [topic.id, topic]),
  ).values());
  const studyTopics = topicSources.map((topic) => ({
    ...topic,
    ...(localState.studyTopics[topic.id] ?? {}),
  }));
  const importedEvents = localState.timetableEvents.filter(
    (event) => !event.subjectId || subjectIds.has(event.subjectId),
  );
  const timetableEvents = Array.from(
    new Map(
      [...sourceData.timetableEvents.filter((event) => event.provider !== "ics"), ...importedEvents]
        .map((event) => [event.fingerprint, event]),
    ).values(),
  ).sort((left, right) => left.startAt.localeCompare(right.startAt));
  const subjectNotes = Object.fromEntries(
    Object.entries(localState.subjectNotes).filter(([subjectId]) => subjectIds.has(subjectId)),
  );

  return {
    ...sourceData,
    assessments,
    studyTopics,
    timetableEvents,
    subjectNotes,
    recommendations: recommendTasks({ assessments, timetableEvents, now }),
  };
}

export function loadLocalAcademicData(sourceData: AcademicData): AcademicData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return sourceData;
    const parsed = localAcademicStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? applyLocalAcademicState(sourceData, parsed.data) : sourceData;
  } catch {
    return sourceData;
  }
}

export function saveLocalAcademicData(data: AcademicData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(extractLocalAcademicState(data)));
    return true;
  } catch {
    return false;
  }
}
