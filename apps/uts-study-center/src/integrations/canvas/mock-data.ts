import { addDays, addHours, set, startOfDay, subDays } from "date-fns";
import type {
  AcademicData,
  Announcement,
  Assessment,
  CourseFile,
  StudyTopic,
  Subject,
  SubjectModule,
  TimetableEvent,
  TimetableEventType,
} from "@/domain/academic/types";
import { recommendTasks } from "@/domain/planner/recommend";
import { timetableFingerprint } from "@/integrations/timetable/fingerprint";
import { DEFAULT_CANVAS_BASE_URL } from "@/integrations/canvas/constants";

export function buildMockAcademicData(now = new Date()): AcademicData {
  const subjects: Subject[] = [
    subject("41082", "Introduction to Data Engineering", "#0F6CBD", 64),
    subject("41039", "Programming 1", "#7A5AF8", 78),
    subject("31268", "Web Systems", "#08756B", 51),
    subject("31265", "Communication for IT Professionals", "#9C4A00", 83),
  ];

  const assessments: Assessment[] = [
    assessment(subjects[0], "a-de-pipeline", "Data Pipeline Design", addDays(now, 1), {
      points: 40,
      weighting: 35,
      completion: 32,
      workflowStatus: "IN_PROGRESS",
      pinned: true,
      estimatedMinutes: 240,
    }),
    assessment(subjects[2], "a-web-api", "REST API Project", addHours(now, 11), {
      points: 30,
      weighting: 30,
      completion: 66,
      workflowStatus: "IN_PROGRESS",
      estimatedMinutes: 150,
    }),
    assessment(subjects[1], "a-prog-quiz", "Arrays and Objects Quiz", addDays(now, 3), {
      points: 20,
      weighting: 15,
      completion: 18,
      workflowStatus: "NOT_STARTED",
      estimatedMinutes: 90,
    }),
    assessment(subjects[3], "a-comm-report", "Stakeholder Communication Report", addDays(now, 8), {
      points: 50,
      weighting: 40,
      completion: 74,
      workflowStatus: "IN_PROGRESS",
      estimatedMinutes: 180,
    }),
    assessment(subjects[0], "a-de-lab", "ETL Lab Submission", subDays(now, 1), {
      points: 10,
      weighting: 10,
      completion: 100,
      workflowStatus: "SUBMITTED",
      officialStatus: "SUBMITTED",
      estimatedMinutes: 0,
    }),
    assessment(subjects[1], "a-prog-exercises", "Weekly Programming Exercises", addDays(now, 12), {
      points: 25,
      weighting: 20,
      completion: 48,
      workflowStatus: "IN_PROGRESS",
      estimatedMinutes: 120,
    }),
  ];

  const announcements: Announcement[] = [
    announcement(
      subjects[0],
      "announcement-de-extension",
      "Assessment 2 deadline clarification",
      "The submission window for Data Pipeline Design closes at 11:59 PM. Check the rubric before uploading your final report and repository link.",
      subDays(now, 1),
    ),
    announcement(
      subjects[2],
      "announcement-web-lab",
      "Week 5 lab room update",
      "Friday's lab will be held in Building 11, room 310. Bring a working local copy of your API project.",
      subDays(now, 2),
    ),
    announcement(
      subjects[1],
      "announcement-prog-practice",
      "Quiz practice material available",
      "A new practice set on arrays, objects and iteration has been published in Module 4.",
      subDays(now, 3),
      false,
    ),
  ];

  const modules: SubjectModule[] = [
    module(subjects[0], "de-m1", "Module 4 · Data ingestion", 4, ["Batch vs streaming", "Lab: CSV ingestion"]),
    module(subjects[0], "de-m2", "Module 5 · Transformation pipelines", 5, ["ETL design", "Data quality checks"]),
    module(subjects[1], "prog-m1", "Module 4 · Arrays and objects", 4, ["Array traversal", "Object modelling", "Practice quiz"]),
    module(subjects[2], "web-m1", "Module 5 · HTTP and REST", 5, ["HTTP semantics", "REST API design", "Lab project"]),
    module(subjects[3], "comm-m1", "Module 4 · Professional reports", 4, ["Audience analysis", "Report structure"]),
  ];

  const courseFiles: CourseFile[] = [
    courseFile(subjects[0], "de-rubric", "Assessment 2 rubric.pdf", "application/pdf", 284_160),
    courseFile(subjects[0], "de-lab-data", "Week 5 lab dataset.csv", "text/csv", 91_244),
    courseFile(subjects[1], "prog-reference", "Arrays and objects reference.pdf", "application/pdf", 412_380),
    courseFile(subjects[2], "web-api-spec", "REST API project specification.pdf", "application/pdf", 336_042),
    courseFile(subjects[3], "comm-template", "Professional report template.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 58_300),
  ];

  const timetableEvents = buildMockTimetable(subjects, now);
  const studyTopics: StudyTopic[] = [
    topic(subjects[0], "topic-star-schema", "Star schema and dimensional modelling", 3, 60, subDays(now, 2), addDays(now, 2)),
    topic(subjects[0], "topic-etl", "ETL pipeline reliability", 2, 45, subDays(now, 5), now),
    topic(subjects[1], "topic-arrays", "Arrays, loops and nested iteration", 3, 70, subDays(now, 1), addDays(now, 3)),
    topic(subjects[2], "topic-http", "HTTP methods and status codes", 4, 82, subDays(now, 2), addDays(now, 6)),
    topic(subjects[3], "topic-stakeholders", "Stakeholder communication strategy", 4, 76, subDays(now, 4), addDays(now, 4)),
  ];

  return {
    subjects,
    assessments,
    announcements,
    modules,
    courseFiles,
    timetableEvents,
    studyTopics,
    subjectNotes: {},
    recommendations: recommendTasks({ assessments, timetableEvents, now }),
    syncStates: [
      {
        entityType: "all",
        state: "SUCCESS",
        lastAttemptedAt: now.toISOString(),
        lastSuccessfulAt: now.toISOString(),
      },
    ],
    mode: "mock",
  };
}

function courseFile(
  subjectValue: Subject,
  id: string,
  name: string,
  contentType: string,
  size: number,
): CourseFile {
  return {
    id: `mock-file-${id}`,
    provider: "mock",
    externalId: id,
    subjectId: subjectValue.id,
    name,
    contentType,
    size,
    updatedAt: subDays(new Date(), 2).toISOString(),
  };
}

function subject(code: string, name: string, color: string, progress: number): Subject {
  return {
    id: `mock-subject-${code}`,
    provider: "mock",
    externalId: code,
    code,
    name,
    color,
    progress,
    currentScore: Math.min(100, progress + 6),
    sourceUrl: `${DEFAULT_CANVAS_BASE_URL}/courses/${code}`,
    updatedAt: new Date().toISOString(),
  };
}

function assessment(
  subjectValue: Subject,
  id: string,
  title: string,
  dueAt: Date,
  values: Partial<Assessment>,
): Assessment {
  return {
    id,
    provider: "mock",
    externalId: id,
    subjectId: subjectValue.id,
    subjectCode: subjectValue.code,
    subjectName: subjectValue.name,
    title,
    description: `Demonstration assessment content for ${title}. The original provider content is preserved separately from personal progress.`,
    dueAt: set(dueAt, { hours: 23, minutes: 59, seconds: 0, milliseconds: 0 }).toISOString(),
    points: 100,
    officialStatus: "UNSUBMITTED",
    workflowStatus: "NOT_STARTED",
    completion: 0,
    notes: "",
    pinned: false,
    htmlUrl: `${DEFAULT_CANVAS_BASE_URL}/courses/${subjectValue.externalId}/assignments/${id}`,
    sourceUpdatedAt: subDays(new Date(), 1).toISOString(),
    ...values,
  };
}

function announcement(
  subjectValue: Subject,
  id: string,
  title: string,
  message: string,
  publishedAt: Date,
  unread = true,
): Announcement {
  return {
    id,
    provider: "mock",
    externalId: id,
    subjectId: subjectValue.id,
    subjectCode: subjectValue.code,
    title,
    message,
    publishedAt: publishedAt.toISOString(),
    htmlUrl: `${DEFAULT_CANVAS_BASE_URL}/courses/${subjectValue.externalId}/announcements/${id}`,
    unread,
  };
}

function module(
  subjectValue: Subject,
  id: string,
  name: string,
  position: number,
  itemTitles: string[],
): SubjectModule {
  return {
    id,
    subjectId: subjectValue.id,
    name,
    position,
    state: position <= 4 ? "COMPLETED" : "STARTED",
    items: itemTitles.map((title, index) => ({
      id: `${id}-item-${index + 1}`,
      title,
      type: index === itemTitles.length - 1 ? "Assignment" : "Page",
    })),
  };
}

function topic(
  subjectValue: Subject,
  id: string,
  title: string,
  confidence: number,
  completion: number,
  lastReviewed: Date,
  nextReviewAt: Date,
): StudyTopic {
  return {
    id,
    subjectId: subjectValue.id,
    subjectCode: subjectValue.code,
    title,
    confidence,
    completion,
    notes: "",
    lastReviewed: lastReviewed.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
  };
}

function buildMockTimetable(subjects: Subject[], now: Date): TimetableEvent[] {
  const day = startOfDay(now);
  const values: Array<[Subject, string, number, number, string, TimetableEventType]> = [
    [subjects[0], "Data Engineering Lecture", 0, 10, "CB11.00.401", "LECTURE"],
    [subjects[1], "Programming 1 Lab", 0, 14, "CB10.02.230", "LAB"],
    [subjects[2], "Web Systems Tutorial", 1, 11, "CB06.03.022", "TUTORIAL"],
    [subjects[3], "Communication Workshop", 2, 15, "CB08.02.004", "WORKSHOP"],
  ];

  return values.map(([subjectValue, title, dayOffset, hour, location, eventType], index) => {
    const startAt = set(addDays(day, dayOffset), { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
    const endAt = addHours(startAt, 2);
    const base = {
      provider: "mock" as const,
      externalId: `mock-event-${index + 1}`,
      subjectId: subjectValue.id,
      title,
      subjectCode: subjectValue.code,
      location,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      eventType,
      source: "UTS MyTimetable",
    };
    const fingerprint = timetableFingerprint(base);
    return { ...base, id: `mock-timetable-${index + 1}`, fingerprint };
  });
}
