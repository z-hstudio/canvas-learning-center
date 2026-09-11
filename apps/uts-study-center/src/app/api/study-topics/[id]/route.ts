import { NextResponse } from "next/server";
import { z } from "zod";
import { loadAcademicData, updateStudyTopic } from "@/repositories/academic-repository";
import { toApplicationError } from "@/lib/errors";
import { assertTrustedMutation } from "@/lib/http-security";

const payloadSchema = z.object({
  confidence: z.number().int().min(1).max(5),
  completion: z.number().int().min(0).max(100),
  notes: z.string().max(8_000),
  markReviewed: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedMutation(request, 12_000);
    const { id } = await params;
    const values = payloadSchema.parse(await request.json());
    await updateStudyTopic(id, values);
    return NextResponse.json({ ok: true, data: await loadAcademicData() });
  } catch (error) {
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : toApplicationError(error).code;
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
