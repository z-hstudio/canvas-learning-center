import type {
  Assessment,
  PriorityReason,
  RecommendedTask,
  TimetableEvent,
} from "@/domain/academic/types";

const DAY_MS = 86_400_000;
const DATE_KEY_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

export interface PlannerInput {
  assessments: Assessment[];
  timetableEvents?: TimetableEvent[];
  now?: Date;
  limit?: number;
  timeZone?: string;
}

export function recommendTasks({
  assessments,
  timetableEvents = [],
  now = new Date(),
  limit = 3,
  timeZone = "Australia/Sydney",
}: PlannerInput): RecommendedTask[] {
  const todaysSubjects = new Set(
    timetableEvents
      .filter((event) => isSameDayInTimeZone(new Date(event.startAt), now, timeZone))
      .map((event) => event.subjectCode)
      .filter(Boolean),
  );

  return assessments
    .map((assessment) => scoreAssessment(assessment, todaysSubjects, now, timeZone))
    .filter((task) => task.score > 0)
    .sort((a, b) => b.score - a.score || a.taskId.localeCompare(b.taskId))
    .slice(0, limit);
}

function scoreAssessment(
  assessment: Assessment,
  todaysSubjects: Set<string | undefined>,
  now: Date,
  timeZone: string,
): RecommendedTask {
  if (
    assessment.officialStatus === "SUBMITTED" ||
    assessment.officialStatus === "GRADED" ||
    assessment.workflowStatus === "SUBMITTED" ||
    assessment.workflowStatus === "GRADED"
  ) {
    return { taskId: assessment.id, score: -100, reasons: [] };
  }

  let score = 0;
  const reasons: PriorityReason[] = [];

  if (assessment.dueAt) {
    const dueAt = new Date(assessment.dueAt);
    const remainingDays = (dueAt.getTime() - now.getTime()) / DAY_MS;

    if (remainingDays < 0) {
      score += 110;
      reasons.push("OVERDUE");
    } else if (isSameDayInTimeZone(dueAt, now, timeZone)) {
      score += 85;
      reasons.push("DUE_TODAY");
    } else if (remainingDays <= 3) {
      score += 62;
      reasons.push("DUE_SOON");
    } else if (remainingDays <= 7) {
      score += 32;
      reasons.push("DUE_SOON");
    } else {
      score += Math.max(0, 18 - remainingDays);
    }
  }

  if (assessment.completion < 40) {
    score += 28;
    reasons.push("LOW_PROGRESS");
  } else if (assessment.completion < 75) {
    score += 12;
  }

  if ((assessment.weighting ?? 0) >= 30) {
    score += 22;
    reasons.push("HIGH_WEIGHT");
  }

  if (assessment.pinned) {
    score += 35;
    reasons.push("PINNED");
  }

  if (todaysSubjects.has(assessment.subjectCode)) {
    score += 8;
    reasons.push("CLASS_TODAY");
  }

  return { taskId: assessment.id, score: Math.round(score), reasons };
}

function isSameDayInTimeZone(left: Date, right: Date, timeZone: string): boolean {
  let formatter = DATE_KEY_FORMATTERS.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    DATE_KEY_FORMATTERS.set(timeZone, formatter);
  }
  return formatter.format(left) === formatter.format(right);
}
