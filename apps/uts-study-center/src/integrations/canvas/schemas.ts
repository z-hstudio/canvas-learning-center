import { z } from "zod";
import { ApplicationError } from "@/lib/errors";

const httpUrlSchema = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "https:" || protocol === "http:";
}, "Expected an HTTP(S) URL");

export const canvasUserSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  short_name: z.string().optional(),
});

const canvasSubmissionSchema = z.object({
  workflow_state: z.string().optional(),
  submitted_at: z.string().nullable().optional(),
  graded_at: z.string().nullable().optional(),
  missing: z.boolean().optional(),
});

export const canvasCourseSchema = z.object({
  id: z.number(),
  name: z.string().max(1_000),
  course_code: z.string().max(200).optional(),
  workflow_state: z.string().optional(),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  html_url: httpUrlSchema.optional(),
});

export const canvasAssignmentSchema = z.object({
  id: z.number(),
  name: z.string().max(1_000),
  description: z.string().max(2_000_000).nullable().optional(),
  due_at: z.string().nullable().optional(),
  points_possible: z.number().nullable().optional(),
  html_url: httpUrlSchema.optional(),
  updated_at: z.string().optional(),
  submission: canvasSubmissionSchema.optional(),
});

export const canvasAnnouncementSchema = z.object({
  id: z.number(),
  context_code: z.string().optional(),
  title: z.string().max(1_000),
  message: z.string().max(2_000_000).optional(),
  posted_at: z.string().optional(),
  html_url: httpUrlSchema.optional(),
  read_state: z.enum(["read", "unread"]).optional(),
});

const canvasModuleItemSchema = z.object({
  id: z.number(),
  title: z.string().max(1_000),
  type: z.string(),
  html_url: httpUrlSchema.optional(),
});

export const canvasModuleSchema = z.object({
  id: z.number(),
  name: z.string().max(1_000),
  position: z.number(),
  state: z.string().optional(),
  items: z.array(canvasModuleItemSchema).optional(),
});

export const canvasFileSchema = z.object({
  id: z.number(),
  display_name: z.string().max(1_000),
  url: httpUrlSchema,
  content_type: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  updated_at: z.string().optional(),
});

export const canvasEnrollmentSchema = z.object({
  id: z.number(),
  course_id: z.number(),
  type: z.string(),
  computed_current_score: z.number().nullable().optional(),
  computed_final_score: z.number().nullable().optional(),
});

export function parseCanvasPayload<T>(schema: z.ZodType<T>, input: unknown, entity: string): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new ApplicationError(
    "SYNC_FAILED",
    `Canvas returned an unexpected ${entity} response`,
    result.error,
  );
}
