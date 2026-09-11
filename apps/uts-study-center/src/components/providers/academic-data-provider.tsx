"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AcademicData,
  AssessmentWorkflowStatus,
} from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";
import { syncNowAction } from "@/app/actions";
import { parseTimetableIcs } from "@/integrations/timetable/parser";
import { toApplicationError, type ApplicationErrorCode } from "@/lib/errors";
import {
  loadLocalAcademicData,
  saveLocalAcademicData,
} from "@/lib/local-academic-store";

export type PersistenceMode = "server" | "browser";

interface AcademicDataContextValue {
  data: AcademicData;
  persistenceMode: PersistenceMode;
  saveAssessment: (input: {
    id: string;
    workflowStatus: AssessmentWorkflowStatus;
    completion: number;
    notes: string;
    pinned: boolean;
  }) => Promise<{ ok: boolean; errorCode?: ApplicationErrorCode }>;
  saveTopic: (input: {
    id: string;
    confidence: number;
    completion: number;
    notes: string;
    markReviewed: boolean;
  }) => Promise<{ ok: boolean; errorCode?: ApplicationErrorCode }>;
  createTopic: (input: {
    subjectId: string;
    title: string;
  }) => Promise<{ ok: boolean; errorCode?: ApplicationErrorCode }>;
  saveSubjectNote: (
    subjectId: string,
    body: string,
  ) => Promise<{ ok: boolean; errorCode?: ApplicationErrorCode }>;
  syncNow: () => Promise<{ ok: boolean; partial?: boolean; errorCode?: ApplicationErrorCode }>;
  importTimetable: (
    sourceText: string,
  ) => Promise<{ ok: boolean; imported?: number; duplicates?: number; errorCode?: ApplicationErrorCode }>;
}

const AcademicDataContext = createContext<AcademicDataContextValue | null>(null);

export function AcademicDataProvider({
  initialData,
  persistenceMode,
  children,
}: {
  initialData: AcademicData;
  persistenceMode: PersistenceMode;
  children: ReactNode;
}) {
  const [data, setData] = useState(initialData);
  const [hydrationRevision, setHydrationRevision] = useState(0);
  const dataRef = useRef(initialData);

  useEffect(() => {
    if (persistenceMode !== "browser") return;
    const hydrated = loadLocalAcademicData(initialData);
    dataRef.current = hydrated;
    queueMicrotask(() => {
      setData(hydrated);
      setHydrationRevision(1);
    });
  }, [initialData, persistenceMode]);

  const replaceData = useCallback((nextData: AcademicData) => {
    dataRef.current = nextData;
    setData(nextData);
  }, []);

  const commitBrowserData = useCallback(
    (update: (current: AcademicData) => AcademicData): boolean => {
      const nextData = update(dataRef.current);
      if (!saveLocalAcademicData(nextData)) return false;
      replaceData(nextData);
      return true;
    },
    [replaceData],
  );

  const saveAssessment = useCallback<AcademicDataContextValue["saveAssessment"]>(
    async (input) => {
      if (persistenceMode === "browser") {
        if (!dataRef.current.assessments.some((assessment) => assessment.id === input.id)) {
          return { ok: false, errorCode: "UNKNOWN" };
        }
        const saved = commitBrowserData((current) => withRecommendations({
          ...current,
          assessments: current.assessments.map((assessment) =>
            assessment.id === input.id ? { ...assessment, ...input } : assessment,
          ),
        }));
        return saved ? { ok: true } : { ok: false, errorCode: "UNKNOWN" };
      }
      const result = await mutateData(`/api/assessments/${encodeURIComponent(input.id)}/progress`, "PATCH", {
        workflowStatus: input.workflowStatus,
        completion: input.completion,
        notes: input.notes,
        pinned: input.pinned,
      });
      if (result.ok) replaceData(result.data);
      return result.ok ? { ok: true } : result;
    },
    [commitBrowserData, persistenceMode, replaceData],
  );

  const saveTopic = useCallback<AcademicDataContextValue["saveTopic"]>(
    async (input) => {
      if (persistenceMode === "browser") {
        if (!dataRef.current.studyTopics.some((topic) => topic.id === input.id)) {
          return { ok: false, errorCode: "UNKNOWN" };
        }
        const reviewedAt = input.markReviewed ? new Date() : undefined;
        const saved = commitBrowserData((current) => ({
          ...current,
          studyTopics: current.studyTopics.map((topic) =>
            topic.id === input.id
              ? {
                  ...topic,
                  confidence: input.confidence,
                  completion: input.completion,
                  notes: input.notes,
                  ...(reviewedAt
                    ? {
                        lastReviewed: reviewedAt.toISOString(),
                        nextReviewAt: new Date(reviewedAt.getTime() + 7 * 86_400_000).toISOString(),
                      }
                    : {}),
                }
              : topic,
          ),
        }));
        return saved ? { ok: true } : { ok: false, errorCode: "UNKNOWN" };
      }
      const result = await mutateData(`/api/study-topics/${encodeURIComponent(input.id)}`, "PATCH", {
        confidence: input.confidence,
        completion: input.completion,
        notes: input.notes,
        markReviewed: input.markReviewed,
      });
      if (result.ok) replaceData(result.data);
      return result.ok ? { ok: true } : result;
    },
    [commitBrowserData, persistenceMode, replaceData],
  );

  const createTopic = useCallback<AcademicDataContextValue["createTopic"]>(
    async ({ subjectId, title }) => {
      const subject = dataRef.current.subjects.find((item) => item.id === subjectId);
      const normalizedTitle = title.trim();
      if (!subject || !normalizedTitle || normalizedTitle.length > 200) {
        return { ok: false, errorCode: "VALIDATION_FAILED" };
      }
      if (persistenceMode === "browser") {
        const saved = commitBrowserData((current) => ({
          ...current,
          studyTopics: [
            {
              id: `local-topic-${globalThis.crypto.randomUUID()}`,
              subjectId,
              subjectCode: subject.code,
              title: normalizedTitle,
              confidence: 1,
              completion: 0,
              notes: "",
              userCreated: true,
            },
            ...current.studyTopics,
          ],
        }));
        return saved ? { ok: true } : { ok: false, errorCode: "UNKNOWN" };
      }
      const result = await mutateData("/api/study-topics", "POST", { subjectId, title: normalizedTitle });
      if (result.ok) replaceData(result.data);
      return result.ok ? { ok: true } : result;
    },
    [commitBrowserData, persistenceMode, replaceData],
  );

  const saveSubjectNote = useCallback<AcademicDataContextValue["saveSubjectNote"]>(
    async (subjectId, body) => {
      if (persistenceMode === "browser") {
        if (!dataRef.current.subjects.some((subject) => subject.id === subjectId)) {
          return { ok: false, errorCode: "UNKNOWN" };
        }
        const saved = commitBrowserData((current) => ({
          ...current,
          subjectNotes: { ...current.subjectNotes, [subjectId]: body },
        }));
        return saved ? { ok: true } : { ok: false, errorCode: "UNKNOWN" };
      }
      const result = await mutateData(`/api/subjects/${encodeURIComponent(subjectId)}/note`, "PUT", { body });
      if (result.ok) replaceData(result.data);
      return result.ok ? { ok: true } : result;
    },
    [commitBrowserData, persistenceMode, replaceData],
  );

  const syncNow = useCallback<AcademicDataContextValue["syncNow"]>(async () => {
    if (persistenceMode === "browser") {
      return { ok: false, errorCode: "SYNC_FAILED" };
    }
    const result = await syncNowAction();
    if (result.ok) replaceData(result.data);
    return result.ok
      ? { ok: true, partial: result.partial }
      : { ok: false, errorCode: result.errorCode };
  }, [persistenceMode, replaceData]);

  const importTimetable = useCallback<AcademicDataContextValue["importTimetable"]>(
    async (sourceText) => {
      if (persistenceMode === "browser") {
        try {
          const current = dataRef.current;
          const events = parseTimetableIcs(sourceText, { subjects: current.subjects });
          const existing = new Set(current.timetableEvents.map((event) => event.fingerprint));
          const importedEvents = events.filter((event) => !existing.has(event.fingerprint));
          const duplicates = events.length - importedEvents.length;
          const saved = commitBrowserData((latest) => withRecommendations({
            ...latest,
            timetableEvents: [...latest.timetableEvents, ...importedEvents]
              .sort((left, right) => left.startAt.localeCompare(right.startAt)),
          }));
          return saved
            ? { ok: true, imported: importedEvents.length, duplicates }
            : { ok: false, errorCode: "UNKNOWN" };
        } catch (error) {
          return { ok: false, errorCode: toApplicationError(error).code };
        }
      }
      const response = await fetch("/api/timetable/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText }),
      });
      const result = (await response.json()) as
        | { ok: true; data: AcademicData; imported: number; duplicates: number }
        | { ok: false; errorCode: ApplicationErrorCode };
      if (result.ok) {
        replaceData(result.data);
        return { ok: true, imported: result.imported, duplicates: result.duplicates };
      }
      return { ok: false, errorCode: result.errorCode };
    },
    [commitBrowserData, persistenceMode, replaceData],
  );

  const value = useMemo(
    () => ({ data, persistenceMode, saveAssessment, saveTopic, createTopic, saveSubjectNote, syncNow, importTimetable }),
    [createTopic, data, importTimetable, persistenceMode, saveAssessment, saveSubjectNote, saveTopic, syncNow],
  );

  return (
    <AcademicDataContext.Provider key={hydrationRevision} value={value}>
      {children}
    </AcademicDataContext.Provider>
  );
}

function withRecommendations(data: AcademicData): AcademicData {
  return {
    ...data,
    recommendations: recommendTasks({
      assessments: data.assessments,
      timetableEvents: data.timetableEvents,
    }),
  };
}

export function useAcademicData(): AcademicDataContextValue {
  const value = useContext(AcademicDataContext);
  if (!value) throw new Error("AcademicDataProvider is missing");
  return value;
}

async function mutateData(
  url: string,
  method: "PATCH" | "POST" | "PUT",
  body: Record<string, unknown>,
): Promise<
  | { ok: true; data: AcademicData }
  | { ok: false; errorCode: ApplicationErrorCode }
> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as
      | { ok: true; data: AcademicData }
      | { ok: false; errorCode: ApplicationErrorCode };
  } catch {
    return { ok: false, errorCode: "NETWORK_OFFLINE" };
  }
}
