import type { AcademicData, SyncSectionState } from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";
import { toApplicationError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { getCredentialStore } from "@/lib/credentials";
import type { CanvasProvider } from "@/integrations/canvas/provider";
import { buildMockAcademicData } from "@/integrations/canvas/mock-data";
import { MockCanvasProvider } from "@/integrations/canvas/mock-provider";
import { CanvasClient } from "@/integrations/canvas/client";
import { RestCanvasProvider } from "@/integrations/canvas/provider";
import {
  assertCanvasHostResolvesPublic,
  DEFAULT_CANVAS_BASE_URL,
  parseCanvasConfig,
} from "@/integrations/canvas/config";
import {
  loadAcademicData,
  recordSyncState,
  saveAcademicData,
} from "@/repositories/academic-repository";

export interface SyncResult {
  data: AcademicData;
  partial: boolean;
  failedSections: string[];
}

export async function syncConfiguredProvider(): Promise<SyncResult> {
  const token = await getCredentialStore().get("CANVAS_ACCESS_TOKEN");
  if (!token) {
    const data = buildMockAcademicData();
    await saveAcademicData(data);
    return { data: await loadAcademicData(), partial: false, failedSections: [] };
  }

  const config = parseCanvasConfig({
    baseUrl: process.env.CANVAS_BASE_URL ?? DEFAULT_CANVAS_BASE_URL,
    accessToken: token,
  });
  await assertCanvasHostResolvesPublic(config.baseUrl);
  const provider = new RestCanvasProvider(new CanvasClient(config));
  return syncCanvasProvider(provider);
}

export async function syncCanvasProvider(provider: CanvasProvider): Promise<SyncResult> {
  if (provider instanceof MockCanvasProvider) {
    const data = buildMockAcademicData();
    await saveAcademicData(data);
    return { data: await loadAcademicData(), partial: false, failedSections: [] };
  }

  const attemptedAt = new Date().toISOString();
  logEvent("info", "canvas.sync.started", { provider: provider.name });
  await recordSyncState(provider.name, {
    entityType: "all",
    state: "SYNCING",
    lastAttemptedAt: attemptedAt,
  });

  try {
    const subjects = await provider.getCourses();
    const [assignmentResults, moduleResults, fileResults, gradeResults, announcementResult] = await Promise.all([
      Promise.allSettled(subjects.map((subject) => provider.getAssignments(subject))),
      Promise.allSettled(subjects.map((subject) => provider.getModules(subject))),
      Promise.allSettled(subjects.map((subject) => provider.getFiles(subject))),
      Promise.allSettled(subjects.map((subject) => provider.getGrade(subject))),
      Promise.allSettled([provider.getAnnouncements(subjects)]),
    ]);

    const failedSections: string[] = [];
    const syncedSubjects = subjects.map((subject, index) => {
      const result = gradeResults[index];
      if (result.status === "fulfilled") return { ...subject, ...result.value };
      failedSections.push(`grades:${subject.externalId}`);
      return subject;
    });
    const assessments = assignmentResults.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      failedSections.push(`assignments:${subjects[index].externalId}`);
      return [];
    });
    const modules = moduleResults.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      failedSections.push(`modules:${subjects[index].externalId}`);
      return [];
    });
    const courseFiles = fileResults.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      failedSections.push(`files:${subjects[index].externalId}`);
      return [];
    });
    const announcements = announcementResult[0].status === "fulfilled"
      ? announcementResult[0].value
      : [];
    if (announcementResult[0].status === "rejected") failedSections.push("announcements");

    const completedAt = new Date().toISOString();
    const syncState: SyncSectionState = {
      entityType: "all",
      state: failedSections.length > 0 ? "PARTIAL" : "SUCCESS",
      lastAttemptedAt: attemptedAt,
      lastSuccessfulAt: failedSections.length === 0 ? completedAt : undefined,
      errorCode: failedSections.length > 0 ? "SYNC_FAILED" : undefined,
    };
    const data: AcademicData = {
      subjects: syncedSubjects,
      assessments,
      announcements,
      modules,
      courseFiles,
      timetableEvents: [],
      studyTopics: [],
      subjectNotes: {},
      recommendations: recommendTasks({ assessments }),
      syncStates: [syncState],
      mode: "canvas",
    };
    await saveAcademicData(data);
    logEvent(failedSections.length ? "warn" : "info", "canvas.sync.completed", {
      provider: provider.name,
      failedSectionCount: failedSections.length,
      subjectCount: subjects.length,
    });
    return { data: await loadAcademicData(), partial: failedSections.length > 0, failedSections };
  } catch (error) {
    const applicationError = toApplicationError(error);
    await recordSyncState(provider.name, {
      entityType: "all",
      state: "FAILED",
      lastAttemptedAt: attemptedAt,
      errorCode: applicationError.code,
    });
    logEvent("error", "canvas.sync.failed", {
      provider: provider.name,
      errorCode: applicationError.code,
    });
    throw applicationError;
  }
}
