export type SupportedLocale = "en-AU" | "zh-CN";

export type ProviderKind = "canvas" | "mock" | "ics";

export type AssessmentWorkflowStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_TO_SUBMIT"
  | "SUBMITTED"
  | "GRADED";

export type OfficialAssessmentStatus =
  | "UNSUBMITTED"
  | "SUBMITTED"
  | "GRADED"
  | "MISSING";

export type TimetableEventType =
  | "LECTURE"
  | "TUTORIAL"
  | "LAB"
  | "WORKSHOP"
  | "SEMINAR"
  | "OTHER";

export interface Subject {
  id: string;
  provider: ProviderKind;
  externalId: string;
  code: string;
  name: string;
  color: string;
  progress: number;
  currentScore?: number;
  finalScore?: number;
  sourceUrl?: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  provider: ProviderKind;
  externalId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  description?: string;
  dueAt?: string;
  points?: number;
  weighting?: number;
  officialStatus: OfficialAssessmentStatus;
  workflowStatus: AssessmentWorkflowStatus;
  completion: number;
  notes: string;
  pinned: boolean;
  estimatedMinutes?: number;
  htmlUrl?: string;
  sourceUpdatedAt?: string;
}

export interface Announcement {
  id: string;
  provider: ProviderKind;
  externalId: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  message: string;
  publishedAt: string;
  htmlUrl?: string;
  unread: boolean;
}

export interface SubjectModule {
  id: string;
  subjectId: string;
  name: string;
  position: number;
  state: "LOCKED" | "UNLOCKED" | "STARTED" | "COMPLETED";
  items: Array<{ id: string; title: string; type: string }>;
}

export interface CourseFile {
  id: string;
  provider: ProviderKind;
  externalId: string;
  subjectId: string;
  name: string;
  url?: string;
  contentType?: string;
  size?: number;
  updatedAt?: string;
}

export interface TimetableEvent {
  id: string;
  fingerprint: string;
  provider: ProviderKind;
  externalId?: string;
  subjectId?: string;
  title: string;
  subjectCode?: string;
  location?: string;
  startAt: string;
  endAt: string;
  eventType: TimetableEventType;
  source: string;
}

export interface StudyTopic {
  id: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  confidence: number;
  completion: number;
  notes: string;
  lastReviewed?: string;
  nextReviewAt?: string;
  userCreated?: boolean;
}

export type PriorityReason =
  | "OVERDUE"
  | "DUE_TODAY"
  | "DUE_SOON"
  | "LOW_PROGRESS"
  | "HIGH_WEIGHT"
  | "PINNED"
  | "CLASS_TODAY";

export interface RecommendedTask {
  taskId: string;
  score: number;
  reasons: PriorityReason[];
}

export interface SyncSectionState {
  entityType: string;
  state: "IDLE" | "SYNCING" | "SUCCESS" | "PARTIAL" | "FAILED";
  lastAttemptedAt?: string;
  lastSuccessfulAt?: string;
  errorCode?: string;
}

export interface AcademicData {
  subjects: Subject[];
  assessments: Assessment[];
  announcements: Announcement[];
  modules: SubjectModule[];
  courseFiles: CourseFile[];
  timetableEvents: TimetableEvent[];
  studyTopics: StudyTopic[];
  subjectNotes: Record<string, string>;
  recommendations: RecommendedTask[];
  syncStates: SyncSectionState[];
  mode: "mock" | "canvas";
}
