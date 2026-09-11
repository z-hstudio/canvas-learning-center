import type {
  ExplanationRequest,
  ExplanationResult,
  StudyPlanRequest,
  StudyPlanResult,
  SummaryRequest,
  SummaryResult,
  TranslationRequest,
  TranslationResult,
} from "./types";

export interface AIProvider {
  readonly name: string;
  readonly available: boolean;
  summarize(input: SummaryRequest): Promise<SummaryResult>;
  translate(input: TranslationRequest): Promise<TranslationResult>;
  explain(input: ExplanationRequest): Promise<ExplanationResult>;
  generateStudyPlan(input: StudyPlanRequest): Promise<StudyPlanResult>;
}
