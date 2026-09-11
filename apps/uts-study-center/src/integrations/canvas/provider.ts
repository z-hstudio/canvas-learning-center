import type {
  Announcement,
  Assessment,
  CourseFile,
  Subject,
  SubjectModule,
} from "@/domain/academic/types";
import { CanvasClient } from "./client";
import {
  mapCanvasAnnouncement,
  mapCanvasAssignment,
  mapCanvasCourse,
  mapCanvasFile,
  mapCanvasModule,
} from "./mapper";
import type {
  CanvasAssignmentDto,
  CanvasCourseDto,
  CanvasDiscussionTopicDto,
  CanvasEnrollmentDto,
  CanvasFileDto,
  CanvasModuleDto,
  CanvasUserDto,
} from "./types";
import {
  canvasAnnouncementSchema,
  canvasAssignmentSchema,
  canvasCourseSchema,
  canvasFileSchema,
  canvasEnrollmentSchema,
  canvasModuleSchema,
  canvasUserSchema,
  parseCanvasPayload,
} from "./schemas";

export interface ProviderUser {
  externalId: string;
  name: string;
}

export interface ProviderGrade {
  currentScore?: number;
  finalScore?: number;
}

export interface CanvasProvider {
  readonly name: "canvas" | "mock";
  getCurrentUser(): Promise<ProviderUser>;
  getCourses(): Promise<Subject[]>;
  getAssignments(subject: Subject): Promise<Assessment[]>;
  getModules(subject: Subject): Promise<SubjectModule[]>;
  getAnnouncements(subjects: Subject[]): Promise<Announcement[]>;
  getFiles(subject: Subject): Promise<CourseFile[]>;
  getGrade(subject: Subject): Promise<ProviderGrade | undefined>;
}

export class RestCanvasProvider implements CanvasProvider {
  readonly name = "canvas" as const;

  constructor(private readonly client: CanvasClient) {}

  async getCurrentUser(): Promise<ProviderUser> {
    const user = parseCanvasPayload(
      canvasUserSchema,
      await this.client.get<unknown>("users/self"),
      "user",
    ) satisfies CanvasUserDto;
    return { externalId: String(user.id), name: user.name };
  }

  async getCourses(): Promise<Subject[]> {
    const courses = parseCanvasPayload(
      canvasCourseSchema.array(),
      await this.client.getAll<unknown>("courses", {
        enrollment_state: "active",
        state: "available",
      }),
      "courses",
    ) satisfies CanvasCourseDto[];
    return courses.map(mapCanvasCourse);
  }

  async getAssignments(subject: Subject): Promise<Assessment[]> {
    const assignments = parseCanvasPayload(
      canvasAssignmentSchema.array(),
      await this.client.getAll<unknown>(`courses/${subject.externalId}/assignments`, {
        "include[]": "submission",
      }),
      "assignments",
    ) satisfies CanvasAssignmentDto[];
    return assignments.map((assignment) => mapCanvasAssignment(assignment, subject));
  }

  async getModules(subject: Subject): Promise<SubjectModule[]> {
    const modules = parseCanvasPayload(
      canvasModuleSchema.array(),
      await this.client.getAll<unknown>(`courses/${subject.externalId}/modules`, {
        "include[]": "items",
      }),
      "modules",
    ) satisfies CanvasModuleDto[];
    return modules.map((module) => mapCanvasModule(module, subject.id));
  }

  async getAnnouncements(subjects: Subject[]): Promise<Announcement[]> {
    if (subjects.length === 0) return [];
    const announcements = parseCanvasPayload(
      canvasAnnouncementSchema.array(),
      await this.client.getAll<unknown>("announcements", {
        "context_codes[]": subjects.map((subject) => `course_${subject.externalId}`),
      }),
      "announcements",
    ) satisfies CanvasDiscussionTopicDto[];
    const byExternalId = new Map(subjects.map((subject) => [subject.externalId, subject]));
    return announcements.flatMap((announcement) => {
      const externalSubjectId = announcement.context_code?.replace("course_", "");
      const subject = externalSubjectId ? byExternalId.get(externalSubjectId) : undefined;
      return subject ? [mapCanvasAnnouncement(announcement, subject)] : [];
    });
  }

  async getFiles(subject: Subject): Promise<CourseFile[]> {
    const files = parseCanvasPayload(
      canvasFileSchema.array(),
      await this.client.getAll<unknown>(`courses/${subject.externalId}/files`),
      "files",
    ) satisfies CanvasFileDto[];
    return files.map((file) => mapCanvasFile(file, subject));
  }

  async getGrade(subject: Subject): Promise<ProviderGrade | undefined> {
    const enrollments = parseCanvasPayload(
      canvasEnrollmentSchema.array(),
      await this.client.getAll<unknown>(`courses/${subject.externalId}/enrollments`, {
        "type[]": "StudentEnrollment",
        user_id: "self",
      }),
      "enrolments",
    ) satisfies CanvasEnrollmentDto[];
    const enrollment = enrollments.find((item) => item.type === "StudentEnrollment") ?? enrollments[0];
    if (!enrollment) return undefined;
    return {
      currentScore: enrollment.computed_current_score ?? undefined,
      finalScore: enrollment.computed_final_score ?? undefined,
    };
  }
}
