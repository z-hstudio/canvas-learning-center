import { describe, expect, it } from "vitest";
import { buildMockAcademicData } from "@/integrations/canvas/mock-data";
import {
  applyLocalAcademicState,
  extractLocalAcademicState,
} from "@/lib/local-academic-store";

describe("browser-local academic persistence", () => {
  it("restores personal state without replacing official source fields", () => {
    const source = buildMockAcademicData(new Date("2026-08-29T00:00:00Z"));
    const assessment = source.assessments[0];
    const localState = extractLocalAcademicState(source);
    localState.assessments[assessment.id] = {
      workflowStatus: "IN_PROGRESS",
      completion: 73,
      notes: "Local planning note",
      pinned: true,
    };

    const changedSource = {
      ...source,
      assessments: source.assessments.map((item) =>
        item.id === assessment.id
          ? { ...item, title: "Official title changed", points: 120 }
          : item,
      ),
    };
    const restored = applyLocalAcademicState(changedSource, localState);
    const restoredAssessment = restored.assessments.find((item) => item.id === assessment.id);

    expect(restoredAssessment).toMatchObject({
      title: "Official title changed",
      points: 120,
      workflowStatus: "IN_PROGRESS",
      completion: 73,
      notes: "Local planning note",
      pinned: true,
    });
  });

  it("keeps imported ICS events deduplicated by fingerprint", () => {
    const source = buildMockAcademicData(new Date("2026-08-29T00:00:00Z"));
    const localState = extractLocalAcademicState(source);
    const imported = {
      id: "ics-local-event",
      fingerprint: "stable-local-event",
      provider: "ics" as const,
      title: "41082 Local tutorial",
      subjectCode: "41082",
      startAt: "2026-09-01T00:00:00.000Z",
      endAt: "2026-09-01T01:00:00.000Z",
      eventType: "TUTORIAL" as const,
      source: "UTS MyTimetable ICS",
    };
    localState.timetableEvents = [imported, imported];

    const restored = applyLocalAcademicState(source, localState);
    expect(restored.timetableEvents.filter((event) => event.fingerprint === imported.fingerprint))
      .toHaveLength(1);
  });

  it("restores user-created study topics without turning them into source data", () => {
    const source = buildMockAcademicData(new Date("2026-08-29T00:00:00Z"));
    const localState = extractLocalAcademicState(source);
    const subject = source.subjects[0];
    localState.createdStudyTopics = [{
      id: "local-topic-normalisation",
      subjectId: subject.id,
      subjectCode: subject.code,
      title: "Database normalisation",
      confidence: 1,
      completion: 0,
      notes: "",
      userCreated: true,
    }];

    const restored = applyLocalAcademicState(source, localState);
    expect(restored.studyTopics).toContainEqual(expect.objectContaining({
      id: "local-topic-normalisation",
      title: "Database normalisation",
      userCreated: true,
    }));
  });
});
