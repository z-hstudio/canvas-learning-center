import { z } from "zod";
import type {
  AcademicData,
  Announcement,
  Assessment,
  AssessmentWorkflowStatus,
  CourseFile,
  OfficialAssessmentStatus,
  ProviderKind,
  StudyTopic,
  Subject,
  SubjectModule,
  SyncSectionState,
  TimetableEvent,
  TimetableEventType,
} from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";
import { db } from "@/lib/db";

const moduleItemsSchema = z.array(
  z.object({ id: z.string(), title: z.string(), type: z.string() }),
);

export async function hasAcademicData(): Promise<boolean> {
  return (await db.subject.count()) > 0;
}

export async function saveAcademicData(data: AcademicData): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.subject.updateMany({
      where: { provider: data.mode },
      data: { current: false },
    });

    for (const subject of data.subjects) {
      await tx.subject.upsert({
        where: {
          provider_externalId: {
            provider: subject.provider,
            externalId: subject.externalId,
          },
        },
        create: {
          id: subject.id,
          provider: subject.provider,
          externalId: subject.externalId,
          code: subject.code,
          name: subject.name,
          color: subject.color,
          progress: subject.progress,
          currentScore: subject.currentScore,
          finalScore: subject.finalScore,
          sourceUrl: subject.sourceUrl,
        },
        update: {
          code: subject.code,
          name: subject.name,
          color: subject.color,
          sourceUrl: subject.sourceUrl,
          currentScore: subject.currentScore,
          finalScore: subject.finalScore,
          current: true,
        },
      });
    }

    for (const assessment of data.assessments) {
      await tx.assessment.upsert({
        where: {
          provider_externalId: {
            provider: assessment.provider,
            externalId: assessment.externalId,
          },
        },
        create: {
          id: assessment.id,
          provider: assessment.provider,
          externalId: assessment.externalId,
          subjectId: assessment.subjectId,
          title: assessment.title,
          description: assessment.description,
          dueAt: assessment.dueAt ? new Date(assessment.dueAt) : null,
          points: assessment.points,
          weighting: assessment.weighting,
          officialStatus: assessment.officialStatus,
          submissionState: assessment.officialStatus,
          htmlUrl: assessment.htmlUrl,
          sourceUpdatedAt: assessment.sourceUpdatedAt ? new Date(assessment.sourceUpdatedAt) : null,
          progress: {
            create: {
              workflowStatus: assessment.workflowStatus,
              completion: assessment.completion,
              notes: assessment.notes,
              pinned: assessment.pinned,
            },
          },
        },
        update: {
          subjectId: assessment.subjectId,
          title: assessment.title,
          description: assessment.description,
          dueAt: assessment.dueAt ? new Date(assessment.dueAt) : null,
          points: assessment.points,
          weighting: assessment.weighting,
          officialStatus: assessment.officialStatus,
          submissionState: assessment.officialStatus,
          htmlUrl: assessment.htmlUrl,
          sourceUpdatedAt: assessment.sourceUpdatedAt ? new Date(assessment.sourceUpdatedAt) : null,
        },
      });
    }

    for (const announcement of data.announcements) {
      await tx.announcementCache.upsert({
        where: {
          provider_externalId: {
            provider: announcement.provider,
            externalId: announcement.externalId,
          },
        },
        create: {
          id: announcement.id,
          provider: announcement.provider,
          externalId: announcement.externalId,
          subjectId: announcement.subjectId,
          title: announcement.title,
          message: announcement.message,
          publishedAt: new Date(announcement.publishedAt),
          htmlUrl: announcement.htmlUrl,
          unread: announcement.unread,
        },
        update: {
          subjectId: announcement.subjectId,
          title: announcement.title,
          message: announcement.message,
          publishedAt: new Date(announcement.publishedAt),
          htmlUrl: announcement.htmlUrl,
          unread: announcement.unread,
        },
      });
    }

    for (const moduleValue of data.modules) {
      await tx.moduleCache.upsert({
        where: {
          provider_externalId: {
            provider: data.mode === "canvas" ? "canvas" : "mock",
            externalId: moduleValue.id.replace(/^(canvas|mock)-module-/, ""),
          },
        },
        create: {
          id: moduleValue.id,
          provider: data.mode === "canvas" ? "canvas" : "mock",
          externalId: moduleValue.id.replace(/^(canvas|mock)-module-/, ""),
          subjectId: moduleValue.subjectId,
          name: moduleValue.name,
          position: moduleValue.position,
          state: moduleValue.state,
          itemsJson: JSON.stringify(moduleValue.items),
        },
        update: {
          subjectId: moduleValue.subjectId,
          name: moduleValue.name,
          position: moduleValue.position,
          state: moduleValue.state,
          itemsJson: JSON.stringify(moduleValue.items),
        },
      });
    }

    for (const file of data.courseFiles) {
      await tx.courseFileCache.upsert({
        where: {
          provider_externalId: {
            provider: file.provider,
            externalId: file.externalId,
          },
        },
        create: {
          id: file.id,
          provider: file.provider,
          externalId: file.externalId,
          subjectId: file.subjectId,
          name: file.name,
          url: file.url,
          contentType: file.contentType,
          size: file.size,
          updatedAt: file.updatedAt ? new Date(file.updatedAt) : null,
        },
        update: {
          subjectId: file.subjectId,
          name: file.name,
          url: file.url,
          contentType: file.contentType,
          size: file.size,
          updatedAt: file.updatedAt ? new Date(file.updatedAt) : null,
        },
      });
    }

    for (const event of data.timetableEvents) {
      await tx.timetableEvent.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          fingerprint: event.fingerprint,
          provider: event.provider,
          externalId: event.externalId,
          subjectId: event.subjectId,
          title: event.title,
          subjectCode: event.subjectCode,
          location: event.location,
          startAt: new Date(event.startAt),
          endAt: new Date(event.endAt),
          eventType: event.eventType,
          source: event.source,
        },
        update: {
          fingerprint: event.fingerprint,
          provider: event.provider,
          externalId: event.externalId,
          subjectId: event.subjectId,
          title: event.title,
          subjectCode: event.subjectCode,
          location: event.location,
          startAt: new Date(event.startAt),
          endAt: new Date(event.endAt),
          eventType: event.eventType,
          source: event.source,
        },
      });
    }

    for (const topic of data.studyTopics) {
      await tx.studyTopic.upsert({
        where: { id: topic.id },
        create: {
          id: topic.id,
          subjectId: topic.subjectId,
          title: topic.title,
          confidence: topic.confidence,
          completion: topic.completion,
          notes: topic.notes,
          lastReviewed: topic.lastReviewed ? new Date(topic.lastReviewed) : null,
          nextReviewAt: topic.nextReviewAt ? new Date(topic.nextReviewAt) : null,
          userCreated: topic.userCreated ?? false,
        },
        update: {
          subjectId: topic.subjectId,
          title: topic.title,
        },
      });
    }

    for (const state of data.syncStates) {
      await tx.syncState.upsert({
        where: { provider_entityType: { provider: data.mode, entityType: state.entityType } },
        create: {
          provider: data.mode,
          entityType: state.entityType,
          state: state.state,
          lastAttemptedAt: state.lastAttemptedAt ? new Date(state.lastAttemptedAt) : null,
          lastSuccessfulAt: state.lastSuccessfulAt ? new Date(state.lastSuccessfulAt) : null,
          errorCode: state.errorCode,
        },
        update: {
          state: state.state,
          lastAttemptedAt: state.lastAttemptedAt ? new Date(state.lastAttemptedAt) : null,
          lastSuccessfulAt: state.lastSuccessfulAt ? new Date(state.lastSuccessfulAt) : undefined,
          errorCode: state.errorCode,
        },
      });
    }
  });
}

export async function loadAcademicData(now = new Date()): Promise<AcademicData> {
  const canvasCount = await db.subject.count({ where: { provider: "canvas", current: true } });
  const activeProvider = canvasCount > 0 ? "canvas" : "mock";

  const [subjectRows, assessmentRows, announcementRows, moduleRows, fileRows, timetableRows, topicRows, noteRows, syncRows] =
    await Promise.all([
      db.subject.findMany({ where: { provider: activeProvider, current: true }, orderBy: { code: "asc" } }),
      db.assessment.findMany({
        where: { subject: { provider: activeProvider, current: true } },
        include: { progress: true, subject: true },
        orderBy: { dueAt: "asc" },
      }),
      db.announcementCache.findMany({
        where: { subject: { provider: activeProvider, current: true } },
        include: { subject: true },
        orderBy: { publishedAt: "desc" },
      }),
      db.moduleCache.findMany({
        where: { subject: { provider: activeProvider, current: true } },
        orderBy: [{ subjectId: "asc" }, { position: "asc" }],
      }),
      db.courseFileCache.findMany({
        where: { subject: { provider: activeProvider, current: true } },
        orderBy: [{ subjectId: "asc" }, { name: "asc" }],
      }),
      db.timetableEvent.findMany({
        where: activeProvider === "canvas" ? { provider: { not: "mock" } } : undefined,
        orderBy: { startAt: "asc" },
      }),
      db.studyTopic.findMany({
        where: { subject: { provider: activeProvider, current: true } },
        include: { subject: true },
        orderBy: [{ nextReviewAt: "asc" }, { title: "asc" }],
      }),
      db.studyNote.findMany({ where: { subjectId: { not: null }, topicId: null } }),
      db.syncState.findMany({ where: { provider: activeProvider } }),
    ]);

  const subjects: Subject[] = subjectRows.map((row) => ({
    id: row.id,
    provider: providerKind(row.provider),
    externalId: row.externalId,
    code: row.code,
    name: row.name,
    color: row.color ?? "#0F6CBD",
    progress: row.progress,
    currentScore: row.currentScore ?? undefined,
    finalScore: row.finalScore ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
  }));

  const assessments: Assessment[] = assessmentRows.map((row) => ({
    id: row.id,
    provider: providerKind(row.provider),
    externalId: row.externalId,
    subjectId: row.subjectId,
    subjectCode: row.subject.code,
    subjectName: row.subject.name,
    title: row.title,
    description: row.description ?? undefined,
    dueAt: row.dueAt?.toISOString(),
    points: row.points ?? undefined,
    weighting: row.weighting ?? undefined,
    officialStatus: officialStatus(row.officialStatus),
    workflowStatus: workflowStatus(row.progress?.workflowStatus),
    completion: row.progress?.completion ?? 0,
    notes: row.progress?.notes ?? "",
    pinned: row.progress?.pinned ?? false,
    htmlUrl: row.htmlUrl ?? undefined,
    sourceUpdatedAt: row.sourceUpdatedAt?.toISOString(),
  }));

  const announcements: Announcement[] = announcementRows.map((row) => ({
    id: row.id,
    provider: providerKind(row.provider),
    externalId: row.externalId,
    subjectId: row.subjectId,
    subjectCode: row.subject.code,
    title: row.title,
    message: row.message,
    publishedAt: row.publishedAt.toISOString(),
    htmlUrl: row.htmlUrl ?? undefined,
    unread: row.unread,
  }));

  const modules: SubjectModule[] = moduleRows.map((row) => ({
    id: row.id,
    subjectId: row.subjectId,
    name: row.name,
    position: row.position,
    state: moduleState(row.state),
    items: parseModuleItems(row.itemsJson),
  }));

  const courseFiles: CourseFile[] = fileRows.map((row) => ({
    id: row.id,
    provider: providerKind(row.provider),
    externalId: row.externalId,
    subjectId: row.subjectId,
    name: row.name,
    url: row.url ?? undefined,
    contentType: row.contentType ?? undefined,
    size: row.size ?? undefined,
    updatedAt: row.updatedAt?.toISOString(),
  }));

  const timetableEvents: TimetableEvent[] = timetableRows.map((row) => ({
    id: row.id,
    fingerprint: row.fingerprint,
    provider: providerKind(row.provider),
    externalId: row.externalId ?? undefined,
    subjectId: row.subjectId ?? undefined,
    title: row.title,
    subjectCode: row.subjectCode ?? undefined,
    location: row.location ?? undefined,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    eventType: eventType(row.eventType),
    source: row.source,
  }));

  const studyTopics: StudyTopic[] = topicRows.map((row) => ({
    id: row.id,
    subjectId: row.subjectId,
    subjectCode: row.subject.code,
    title: row.title,
    confidence: row.confidence,
    completion: row.completion,
    notes: row.notes,
    lastReviewed: row.lastReviewed?.toISOString(),
    nextReviewAt: row.nextReviewAt?.toISOString(),
    userCreated: row.userCreated,
  }));

  const syncStates: SyncSectionState[] = syncRows.map((row) => ({
    entityType: row.entityType,
    state: syncState(row.state),
    lastAttemptedAt: row.lastAttemptedAt?.toISOString(),
    lastSuccessfulAt: row.lastSuccessfulAt?.toISOString(),
    errorCode: row.errorCode ?? undefined,
  }));

  return {
    subjects,
    assessments,
    announcements,
    modules,
    courseFiles,
    timetableEvents,
    studyTopics,
    subjectNotes: Object.fromEntries(
      noteRows.flatMap((note) => (note.subjectId ? [[note.subjectId, note.body]] : [])),
    ),
    recommendations: recommendTasks({ assessments, timetableEvents, now }),
    syncStates,
    mode: activeProvider,
  };
}

export async function updateAssessmentProgress(
  id: string,
  values: {
    workflowStatus: AssessmentWorkflowStatus;
    completion: number;
    notes: string;
    pinned: boolean;
  },
): Promise<void> {
  await db.assessmentProgress.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...values },
    update: values,
  });
}

export async function updateStudyTopic(
  id: string,
  values: { confidence: number; completion: number; notes: string; markReviewed: boolean },
): Promise<void> {
  await db.studyTopic.update({
    where: { id },
    data: {
      confidence: values.confidence,
      completion: values.completion,
      notes: values.notes,
      ...(values.markReviewed
        ? { lastReviewed: new Date(), nextReviewAt: new Date(Date.now() + 7 * 86_400_000) }
        : {}),
    },
  });
}

export async function createStudyTopic(values: { subjectId: string; title: string }): Promise<void> {
  await db.studyTopic.create({
    data: {
      subjectId: values.subjectId,
      title: values.title,
      confidence: 1,
      completion: 0,
      notes: "",
      userCreated: true,
    },
  });
}

export async function saveSubjectNote(subjectId: string, body: string): Promise<void> {
  const existing = await db.studyNote.findFirst({ where: { subjectId, topicId: null } });
  if (existing) {
    await db.studyNote.update({ where: { id: existing.id }, data: { body } });
  } else {
    await db.studyNote.create({ data: { subjectId, body } });
  }
}

export async function saveTimetableEvents(events: TimetableEvent[]): Promise<{ imported: number; duplicates: number }> {
  let imported = 0;
  let duplicates = 0;
  for (const event of events) {
    const existing = await db.timetableEvent.findUnique({ where: { fingerprint: event.fingerprint } });
    if (existing) {
      duplicates += 1;
      continue;
    }
    await db.timetableEvent.create({
      data: {
        id: event.id,
        fingerprint: event.fingerprint,
        provider: event.provider,
        externalId: event.externalId,
        subjectId: event.subjectId,
        title: event.title,
        subjectCode: event.subjectCode,
        location: event.location,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
        eventType: event.eventType,
        source: event.source,
      },
    });
    imported += 1;
  }
  return { imported, duplicates };
}

export async function recordSyncState(
  provider: "mock" | "canvas",
  state: SyncSectionState,
): Promise<void> {
  await db.syncState.upsert({
    where: { provider_entityType: { provider, entityType: state.entityType } },
    create: {
      provider,
      entityType: state.entityType,
      state: state.state,
      lastAttemptedAt: state.lastAttemptedAt ? new Date(state.lastAttemptedAt) : null,
      lastSuccessfulAt: state.lastSuccessfulAt ? new Date(state.lastSuccessfulAt) : null,
      errorCode: state.errorCode,
    },
    update: {
      state: state.state,
      lastAttemptedAt: state.lastAttemptedAt ? new Date(state.lastAttemptedAt) : null,
      lastSuccessfulAt: state.lastSuccessfulAt ? new Date(state.lastSuccessfulAt) : undefined,
      errorCode: state.errorCode,
    },
  });
}

function parseModuleItems(value: string): SubjectModule["items"] {
  try {
    return moduleItemsSchema.parse(JSON.parse(value));
  } catch {
    return [];
  }
}

function providerKind(value: string): ProviderKind {
  return value === "canvas" || value === "ics" ? value : "mock";
}

function workflowStatus(value?: string): AssessmentWorkflowStatus {
  if (
    value === "IN_PROGRESS" ||
    value === "READY_TO_SUBMIT" ||
    value === "SUBMITTED" ||
    value === "GRADED"
  ) return value;
  return "NOT_STARTED";
}

function officialStatus(value: string): OfficialAssessmentStatus {
  if (value === "SUBMITTED" || value === "GRADED" || value === "MISSING") return value;
  return "UNSUBMITTED";
}

function moduleState(value: string): SubjectModule["state"] {
  if (value === "LOCKED" || value === "STARTED" || value === "COMPLETED") return value;
  return "UNLOCKED";
}

function eventType(value: string): TimetableEventType {
  if (
    value === "LECTURE" ||
    value === "TUTORIAL" ||
    value === "LAB" ||
    value === "WORKSHOP" ||
    value === "SEMINAR"
  ) return value;
  return "OTHER";
}

function syncState(value: string): SyncSectionState["state"] {
  if (value === "SYNCING" || value === "SUCCESS" || value === "PARTIAL" || value === "FAILED") return value;
  return "IDLE";
}
