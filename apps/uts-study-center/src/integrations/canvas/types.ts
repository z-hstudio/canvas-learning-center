export interface CanvasUserDto {
  id: number;
  name: string;
  short_name?: string;
}

export interface CanvasCourseDto {
  id: number;
  name: string;
  course_code?: string;
  workflow_state?: string;
  start_at?: string | null;
  end_at?: string | null;
  html_url?: string;
}

export interface CanvasSubmissionDto {
  workflow_state?: string;
  submitted_at?: string | null;
  graded_at?: string | null;
  missing?: boolean;
}

export interface CanvasAssignmentDto {
  id: number;
  name: string;
  description?: string | null;
  due_at?: string | null;
  points_possible?: number | null;
  html_url?: string;
  updated_at?: string;
  submission?: CanvasSubmissionDto;
}

export interface CanvasDiscussionTopicDto {
  id: number;
  context_code?: string;
  title: string;
  message?: string;
  posted_at?: string;
  html_url?: string;
  read_state?: "read" | "unread";
}

export interface CanvasModuleItemDto {
  id: number;
  title: string;
  type: string;
  html_url?: string;
}

export interface CanvasModuleDto {
  id: number;
  name: string;
  position: number;
  state?: string;
  items?: CanvasModuleItemDto[];
}

export interface CanvasFileDto {
  id: number;
  display_name: string;
  url: string;
  content_type?: string;
  size?: number;
  updated_at?: string;
}

export interface CanvasEnrollmentDto {
  id: number;
  course_id: number;
  type: string;
  computed_current_score?: number | null;
  computed_final_score?: number | null;
}
