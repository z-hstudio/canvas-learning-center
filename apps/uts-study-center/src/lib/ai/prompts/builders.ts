import type {
  ExplanationRequest,
  StudyPlanRequest,
  SummaryRequest,
  TranslationRequest,
} from "../types";

export function buildSummaryPrompt(input: SummaryRequest): string {
  return JSON.stringify({
    task: "Summarize academic source content",
    sourceType: input.sourceType,
    style: input.style,
    preserveTechnicalTerms: input.preserveTechnicalTerms,
    requiredShape: {
      summary: "string",
      keyPoints: ["string"],
      importantDates: [{ date: "string", label: "string", sourceQuote: "string?" }],
      actionItems: ["string"],
      warnings: ["string"],
    },
    sourceText: input.sourceText,
  });
}

export function buildTranslationPrompt(input: TranslationRequest): string {
  return JSON.stringify({
    task: "Translate academic source content without changing meaning",
    sourceType: input.sourceType,
    preserveTechnicalTerms: input.preserveTechnicalTerms,
    requiredShape: {
      translatedText: "string",
      terminology: [{ source: "string", translated: "string" }],
    },
    sourceText: input.sourceText,
  });
}

export function buildExplanationPrompt(input: ExplanationRequest): string {
  return JSON.stringify({
    task: "Explain supplied academic content",
    level: input.level,
    question: input.question,
    preserveTechnicalTerms: input.preserveTechnicalTerms,
    requiredShape: {
      explanation: "string",
      keyTerms: [{ term: "string", explanation: "string" }],
      sourceFacts: ["string"],
      inferences: ["string"],
    },
    sourceText: input.sourceText,
  });
}

export function buildStudyPlanPrompt(input: StudyPlanRequest): string {
  return JSON.stringify({
    task: "Create a feasible study plan",
    goals: input.goals,
    availableMinutes: input.availableMinutes,
    deadline: input.deadline,
    requiredShape: {
      overview: "string",
      steps: [{ title: "string", minutes: "positive integer" }],
    },
  });
}
