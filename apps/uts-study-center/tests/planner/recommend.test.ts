import { describe, expect, it } from "vitest";
import type { Assessment } from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";

const now = new Date("2026-08-29T10:00:00+10:00");

describe("recommendTasks", () => {
  it("ranks an overdue unfinished assessment highly", () => {
    const overdue = assessment("overdue", "2026-08-28T23:59:00+10:00", 20);
    const later = assessment("later", "2026-09-20T23:59:00+10:00", 20);
    const result = recommendTasks({ assessments: [later, overdue], now });
    expect(result[0].taskId).toBe("overdue");
    expect(result[0].reasons).toContain("OVERDUE");
  });

  it("suppresses a submitted assessment even when overdue", () => {
    const submitted = assessment("submitted", "2026-08-20T23:59:00+10:00", 0, {
      officialStatus: "SUBMITTED",
      workflowStatus: "SUBMITTED",
    });
    const active = assessment("active", "2026-09-04T23:59:00+10:00", 70);
    const result = recommendTasks({ assessments: [submitted, active], now });
    expect(result.map((task) => task.taskId)).not.toContain("submitted");
  });

  it("increases priority for a near deadline with low progress and high weighting", () => {
    const urgent = assessment("urgent", "2026-08-30T23:59:00+10:00", 15, { weighting: 40 });
    const routine = assessment("routine", "2026-08-30T23:59:00+10:00", 80, { weighting: 10 });
    const result = recommendTasks({ assessments: [routine, urgent], now });
    expect(result[0].taskId).toBe("urgent");
    expect(result[0].reasons).toEqual(expect.arrayContaining(["DUE_SOON", "LOW_PROGRESS", "HIGH_WEIGHT"]));
  });

  it("uses the Sydney calendar day at the UTC date boundary", () => {
    const afterMidnightInSydney = new Date("2026-08-30T14:30:00Z");
    const dueLaterThatSydneyDay = assessment("sydney-today", "2026-08-31T03:00:00Z", 50);
    const [result] = recommendTasks({ assessments: [dueLaterThatSydneyDay], now: afterMidnightInSydney });
    expect(result.reasons).toContain("DUE_TODAY");
  });
});

function assessment(
  id: string,
  dueAt: string,
  completion: number,
  values: Partial<Assessment> = {},
): Assessment {
  return {
    id,
    provider: "mock",
    externalId: id,
    subjectId: "subject-1",
    subjectCode: "41082",
    subjectName: "Introduction to Data Engineering",
    title: id,
    dueAt,
    officialStatus: "UNSUBMITTED",
    workflowStatus: "IN_PROGRESS",
    completion,
    notes: "",
    pinned: false,
    ...values,
  };
}
