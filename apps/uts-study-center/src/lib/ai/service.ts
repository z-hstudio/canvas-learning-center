import type { AIProvider } from "./provider";
import type {
  ExplanationRequest,
  StudyPlanRequest,
  SummaryRequest,
  TranslationRequest,
} from "./types";

export class AIService {
  constructor(private readonly provider: AIProvider) {}

  get available(): boolean {
    return this.provider.available;
  }

  summarize(input: SummaryRequest) {
    return this.provider.summarize(input);
  }

  translate(input: TranslationRequest) {
    return this.provider.translate(input);
  }

  explain(input: ExplanationRequest) {
    return this.provider.explain(input);
  }

  generateStudyPlan(input: StudyPlanRequest) {
    return this.provider.generateStudyPlan(input);
  }
}
