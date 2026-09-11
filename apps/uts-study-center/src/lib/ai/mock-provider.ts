import type { AIProvider } from "./provider";
import type {
  ExplanationResult,
  StudyPlanResult,
  SummaryResult,
  TranslationResult,
} from "./types";

export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly available = false;

  async summarize(): Promise<SummaryResult> {
    return unavailable();
  }

  async translate(): Promise<TranslationResult> {
    return unavailable();
  }

  async explain(): Promise<ExplanationResult> {
    return unavailable();
  }

  async generateStudyPlan(): Promise<StudyPlanResult> {
    return unavailable();
  }
}

function unavailable(): never {
  throw new Error("AI_PROVIDER_UNAVAILABLE");
}
