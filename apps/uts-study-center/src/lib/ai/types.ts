import { z } from "zod";
import type { SupportedLocale } from "@/domain/academic/types";

export const sourceTypeSchema = z.enum([
  "announcement",
  "assignment",
  "module",
  "document",
]);

export const summaryStyleSchema = z.enum(["short", "standard", "detailed"]);

export interface SummaryRequest {
  sourceText: string;
  sourceType: z.infer<typeof sourceTypeSchema>;
  outputLocale: SupportedLocale;
  style: z.infer<typeof summaryStyleSchema>;
  preserveTechnicalTerms: boolean;
}

export interface TranslationRequest {
  sourceText: string;
  sourceType: z.infer<typeof sourceTypeSchema>;
  outputLocale: SupportedLocale;
  preserveTechnicalTerms: boolean;
}

export interface ExplanationRequest {
  sourceText: string;
  question?: string;
  outputLocale: SupportedLocale;
  level: "plain" | "standard" | "advanced";
  preserveTechnicalTerms: boolean;
}

export interface StudyPlanRequest {
  goals: string[];
  availableMinutes: number;
  deadline?: string;
  outputLocale: SupportedLocale;
}

export const importantDateSchema = z.object({
  date: z.string(),
  label: z.string(),
  sourceQuote: z.string().optional(),
});

export const summaryResultSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  importantDates: z.array(importantDateSchema),
  actionItems: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const translationResultSchema = z.object({
  translatedText: z.string(),
  terminology: z.array(
    z.object({ source: z.string(), translated: z.string() }),
  ),
});

export const explanationResultSchema = z.object({
  explanation: z.string(),
  keyTerms: z.array(
    z.object({ term: z.string(), explanation: z.string() }),
  ),
  sourceFacts: z.array(z.string()),
  inferences: z.array(z.string()),
});

export const studyPlanResultSchema = z.object({
  overview: z.string(),
  steps: z.array(
    z.object({ title: z.string(), minutes: z.number().int().positive() }),
  ),
});

export type SummaryResult = z.infer<typeof summaryResultSchema>;
export type TranslationResult = z.infer<typeof translationResultSchema>;
export type ExplanationResult = z.infer<typeof explanationResultSchema>;
export type StudyPlanResult = z.infer<typeof studyPlanResultSchema>;
