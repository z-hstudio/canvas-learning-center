"use server";

import type { AcademicData } from "@/domain/academic/types";
import type { ApplicationErrorCode } from "@/lib/errors";
import { toApplicationError } from "@/lib/errors";
import { syncConfiguredProvider } from "@/services/canvas-sync-service";

type DataActionResult =
  | { ok: true; data: AcademicData; partial?: boolean; failedSections?: string[] }
  | { ok: false; errorCode: ApplicationErrorCode };

export async function syncNowAction(): Promise<DataActionResult> {
  try {
    const result = await syncConfiguredProvider();
    return {
      ok: true,
      data: result.data,
      partial: result.partial,
      failedSections: result.failedSections,
    };
  } catch (error) {
    return { ok: false, errorCode: toApplicationError(error).code };
  }
}
