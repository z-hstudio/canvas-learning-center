import { NextResponse } from "next/server";
import { z } from "zod";
import { loadAcademicData, saveSubjectNote } from "@/repositories/academic-repository";
import { toApplicationError } from "@/lib/errors";
import { assertTrustedMutation } from "@/lib/http-security";

const payloadSchema = z.object({ body: z.string().max(20_000) });

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertTrustedMutation(request, 24_000);
    const { id } = await params;
    const { body } = payloadSchema.parse(await request.json());
    await saveSubjectNote(id, body);
    return NextResponse.json({ ok: true, data: await loadAcademicData() });
  } catch (error) {
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : toApplicationError(error).code;
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
