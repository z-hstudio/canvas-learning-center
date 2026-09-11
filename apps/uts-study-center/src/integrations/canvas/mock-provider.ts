import type { Announcement, Assessment, CourseFile, Subject, SubjectModule } from "@/domain/academic/types";
import { buildMockAcademicData } from "./mock-data";
import type { CanvasProvider, ProviderGrade, ProviderUser } from "./provider";

export class MockCanvasProvider implements CanvasProvider {
  readonly name = "mock" as const;

  async getCurrentUser(): Promise<ProviderUser> {
    return { externalId: "demo-student", name: "Demo student" };
  }

  async getCourses(): Promise<Subject[]> {
    return buildMockAcademicData().subjects;
  }

  async getAssignments(subject: Subject): Promise<Assessment[]> {
    return buildMockAcademicData().assessments.filter((item) => item.subjectId === subject.id);
  }

  async getModules(subject: Subject): Promise<SubjectModule[]> {
    return buildMockAcademicData().modules.filter((item) => item.subjectId === subject.id);
  }

  async getAnnouncements(subjects: Subject[]): Promise<Announcement[]> {
    const subjectIds = new Set(subjects.map((subject) => subject.id));
    return buildMockAcademicData().announcements.filter((item) => subjectIds.has(item.subjectId));
  }

  async getFiles(subject: Subject): Promise<CourseFile[]> {
    return buildMockAcademicData().courseFiles.filter((item) => item.subjectId === subject.id);
  }

  async getGrade(subject: Subject): Promise<ProviderGrade> {
    return { currentScore: subject.currentScore, finalScore: subject.finalScore };
  }
}
