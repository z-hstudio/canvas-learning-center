import { NextResponse } from "next/server";
import { z } from "zod";
import { loadAcademicData, updateAssessmentProgress } from "@/repositories/academic-repository";
import { toApplicationError } from "@/lib/errors";
import { assertTrustedMutation } from "@/lib/http-security";

const payloadSchema = z.object({
  workflowStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "READY_TO_SUBMIT", "SUBMITTED", "GRADED"]),
  completion: z.number().int().min(0).max(100),
  notes: z.string().max(4_000),
  pinned: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedMutation(request, 8_192);
    const { id } = await params;
    const values = payloadSchema.parse(await request.json());
    await updateAssessmentProgress(id, values);
    return NextResponse.json({ ok: true, data: await loadAcademicData() });
  } catch (error) {
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : toApplicationError(error).code;
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
