import { NextResponse } from "next/server";
import { z } from "zod";
import { CanvasClient } from "@/integrations/canvas/client";
import { assertCanvasHostResolvesPublic, parseCanvasConfig } from "@/integrations/canvas/config";
import { RestCanvasProvider } from "@/integrations/canvas/provider";
import { toApplicationError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { assertTrustedMutation } from "@/lib/http-security";

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request, 8_192);
    const config = parseCanvasConfig(await request.json());
    await assertCanvasHostResolvesPublic(config.baseUrl);
    const provider = new RestCanvasProvider(new CanvasClient(config));
    const user = await provider.getCurrentUser();
    logEvent("info", "canvas.connection.succeeded", {
      provider: provider.name,
      canvasHost: new URL(config.baseUrl).hostname,
    });
    return NextResponse.json({ ok: true, userName: user.name });
  } catch (error) {
    const applicationError = toApplicationError(error);
    const errorCode = error instanceof z.ZodError ? "VALIDATION_FAILED" : applicationError.code;
    logEvent("warn", "canvas.connection.failed", { errorCode });
    return NextResponse.json({ ok: false, errorCode }, { status: 400 });
  }
}
