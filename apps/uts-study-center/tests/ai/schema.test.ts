import { describe, expect, it } from "vitest";
import { summaryResultSchema } from "@/lib/ai/types";

describe("AI structured output validation", () => {
  it("accepts a grounded structured summary", () => {
    const result = summaryResultSchema.parse({
      summary: "The deadline is Monday.",
      keyPoints: ["Submit the report"],
      importantDates: [{ date: "2026-09-07", label: "Submission deadline" }],
      actionItems: ["Review the rubric"],
      warnings: [],
    });
    expect(result.importantDates[0].date).toBe("2026-09-07");
  });

  it("rejects uncontrolled or incomplete model JSON", () => {
    expect(() => summaryResultSchema.parse({ summary: "Incomplete" })).toThrow();
  });
});
