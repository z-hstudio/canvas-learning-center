import { NextResponse } from "next/server";
import { z } from "zod";
import { parseTimetableIcs } from "@/integrations/timetable/parser";
import { toApplicationError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { loadAcademicData, saveTimetableEvents } from "@/repositories/academic-repository";
import { assertTrustedMutation } from "@/lib/http-security";

const payloadSchema = z.object({ sourceText: z.string().min(1).max(2_000_000) });

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request, 2_100_000);
    const { sourceText } = payloadSchema.parse(await request.json());
    const current = await loadAcademicData();
    const events = parseTimetableIcs(sourceText, { subjects: current.subjects });
    const result = await saveTimetableEvents(events);
    logEvent("info", "timetable.import.succeeded", {
      importedCount: result.imported,
      duplicateCount: result.duplicates,
    });
    return NextResponse.json({ ok: true, data: await loadAcademicData(), ...result });
  } catch (error) {
    const applicationError = toApplicationError(error);
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : applicationError.code;
    logEvent("warn", "timetable.import.failed", { errorCode });
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
