import { NextResponse } from "next/server";
import { z } from "zod";
import { toApplicationError } from "@/lib/errors";
import { assertTrustedMutation } from "@/lib/http-security";
import { createStudyTopic, loadAcademicData } from "@/repositories/academic-repository";

const payloadSchema = z.object({
  subjectId: z.string().min(1).max(200),
  title: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request, 4_096);
    const values = payloadSchema.parse(await request.json());
    await createStudyTopic(values);
    return NextResponse.json({ ok: true, data: await loadAcademicData() });
  } catch (error) {
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : toApplicationError(error).code;
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
