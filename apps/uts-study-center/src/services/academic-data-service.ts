import { buildMockAcademicData } from "@/integrations/canvas/mock-data";
import { logEvent } from "@/lib/logger";

export async function getAcademicData() {
  if (process.env.VERCEL) return buildMockAcademicData();

  const {
    hasAcademicData,
    loadAcademicData,
    saveAcademicData,
  } = await import("@/repositories/academic-repository");
  if (!(await hasAcademicData())) {
    logEvent("info", "mock.seed.started", { provider: "mock" });
    await saveAcademicData(buildMockAcademicData());
    logEvent("info", "mock.seed.succeeded", { provider: "mock" });
  }
  return loadAcademicData();
}
