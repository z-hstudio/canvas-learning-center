import type {
  Announcement,
  Assessment,
  CourseFile,
  OfficialAssessmentStatus,
  Subject,
  SubjectModule,
} from "@/domain/academic/types";
import type {
  CanvasAssignmentDto,
  CanvasCourseDto,
  CanvasDiscussionTopicDto,
  CanvasFileDto,
  CanvasModuleDto,
  CanvasSubmissionDto,
} from "./types";

export function mapCanvasCourse(dto: CanvasCourseDto): Subject {
  const code = dto.course_code?.trim() || extractSubjectCode(dto.name) || `COURSE-${dto.id}`;
  return {
    id: `canvas-subject-${dto.id}`,
    provider: "canvas",
    externalId: String(dto.id),
    code,
    name: dto.name,
    color: colourForCode(code),
    progress: 0,
    sourceUrl: dto.html_url,
    updatedAt: new Date().toISOString(),
  };
}

export function mapCanvasAssignment(
  dto: CanvasAssignmentDto,
  subject: Subject,
): Assessment {
  const officialStatus = mapSubmissionStatus(dto.submission);
  return {
    id: `canvas-assessment-${dto.id}`,
    provider: "canvas",
    externalId: String(dto.id),
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    title: dto.name,
    description: dto.description ?? undefined,
    dueAt: dto.due_at ?? undefined,
    points: dto.points_possible ?? undefined,
    officialStatus,
    workflowStatus: officialStatus === "GRADED" ? "GRADED" : officialStatus === "SUBMITTED" ? "SUBMITTED" : "NOT_STARTED",
    completion: officialStatus === "SUBMITTED" || officialStatus === "GRADED" ? 100 : 0,
    notes: "",
    pinned: false,
    htmlUrl: dto.html_url,
    sourceUpdatedAt: dto.updated_at,
  };
}

export function mapCanvasAnnouncement(
  dto: CanvasDiscussionTopicDto,
  subject: Subject,
): Announcement {
  return {
    id: `canvas-announcement-${dto.id}`,
    provider: "canvas",
    externalId: String(dto.id),
    subjectId: subject.id,
    subjectCode: subject.code,
    title: dto.title,
    message: dto.message ?? "",
    publishedAt: dto.posted_at ?? new Date().toISOString(),
    htmlUrl: dto.html_url,
    unread: dto.read_state !== "read",
  };
}

export function mapCanvasModule(dto: CanvasModuleDto, subjectId: string): SubjectModule {
  const state = dto.state?.toUpperCase();
  return {
    id: `canvas-module-${dto.id}`,
    subjectId,
    name: dto.name,
    position: dto.position,
    state:
      state === "LOCKED" || state === "STARTED" || state === "COMPLETED"
        ? state
        : "UNLOCKED",
    items: (dto.items ?? []).map((item) => ({
      id: String(item.id),
      title: item.title,
      type: item.type,
    })),
  };
}

export function mapCanvasFile(dto: CanvasFileDto, subject: Subject): CourseFile {
  return {
    id: `canvas-file-${dto.id}`,
    provider: "canvas",
    externalId: String(dto.id),
    subjectId: subject.id,
    name: dto.display_name,
    url: dto.url,
    contentType: dto.content_type,
    size: dto.size,
    updatedAt: dto.updated_at,
  };
}

function mapSubmissionStatus(submission?: CanvasSubmissionDto): OfficialAssessmentStatus {
  if (submission?.missing) return "MISSING";
  if (submission?.graded_at || submission?.workflow_state === "graded") return "GRADED";
  if (submission?.submitted_at || submission?.workflow_state === "submitted") return "SUBMITTED";
  return "UNSUBMITTED";
}

function extractSubjectCode(value: string): string | undefined {
  return value.match(/\b\d{5}\b/)?.[0];
}

function colourForCode(code: string): string {
  const palette = ["#0F6CBD", "#6847D9", "#08756B", "#9C4A00", "#B42318"];
  const total = Array.from(code).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return palette[total % palette.length];
}
