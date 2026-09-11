import { ApplicationError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import type { AIProvider } from "./provider";
import {
  explanationResultSchema,
  studyPlanResultSchema,
  summaryResultSchema,
  translationResultSchema,
  type ExplanationRequest,
  type ExplanationResult,
  type StudyPlanRequest,
  type StudyPlanResult,
  type SummaryRequest,
  type SummaryResult,
  type TranslationRequest,
  type TranslationResult,
} from "./types";
import { academicSystemPrompt } from "./prompts/system";
import {
  buildExplanationPrompt,
  buildStudyPlanPrompt,
  buildSummaryPrompt,
  buildTranslationPrompt,
} from "./prompts/builders";
import type { ZodType } from "zod";

interface DeepSeekConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek";
  readonly available: boolean;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: DeepSeekConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.DEEPSEEK_API_KEY;
    this.baseUrl = (config.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(/\/$/, "");
    this.model = config.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    this.available = Boolean(this.apiKey);
  }

  summarize(input: SummaryRequest): Promise<SummaryResult> {
    return this.request(input.outputLocale, buildSummaryPrompt(input), summaryResultSchema);
  }

  translate(input: TranslationRequest): Promise<TranslationResult> {
    return this.request(input.outputLocale, buildTranslationPrompt(input), translationResultSchema);
  }

  explain(input: ExplanationRequest): Promise<ExplanationResult> {
    return this.request(input.outputLocale, buildExplanationPrompt(input), explanationResultSchema);
  }

  generateStudyPlan(input: StudyPlanRequest): Promise<StudyPlanResult> {
    return this.request(input.outputLocale, buildStudyPlanPrompt(input), studyPlanResultSchema);
  }

  private async request<T>(
    outputLocale: SummaryRequest["outputLocale"],
    userPrompt: string,
    schema: ZodType<T>,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new ApplicationError("AI_PROVIDER_UNAVAILABLE", "DeepSeek is not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          temperature: 0.1,
          messages: [
            { role: "system", content: academicSystemPrompt(outputLocale) },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (response.status === 429) {
        throw new ApplicationError("AI_RATE_LIMITED", "DeepSeek rate limit reached");
      }
      if (!response.ok) {
        throw new ApplicationError("AI_PROVIDER_UNAVAILABLE", `DeepSeek returned ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("DeepSeek returned no structured content");
      return schema.parse(JSON.parse(content));
    } catch (error) {
      logEvent("error", "ai.request.failed", {
        provider: this.name,
        errorCode: error instanceof ApplicationError ? error.code : "UNKNOWN",
      });
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("AI_PROVIDER_UNAVAILABLE", "DeepSeek request failed", error);
    }
  }
}
