import { describe, expect, it, vi } from "vitest";
import { CanvasClient, nextPageUrl } from "@/integrations/canvas/client";
import { ApplicationError } from "@/lib/errors";
import { RestCanvasProvider } from "@/integrations/canvas/provider";
import { mapCanvasCourse } from "@/integrations/canvas/mapper";

describe("CanvasClient", () => {
  it("retries a transient provider response before succeeding", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(Response.json({ id: 7, name: "Student" }));
    const client = new CanvasClient({
      baseUrl: "https://canvas.uts.edu.au",
      accessToken: "secret-token",
      retryBaseDelayMs: 0,
      fetchImpl,
    });

    await expect(client.get("users/self")).resolves.toEqual({ id: 7, name: "Student" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][1]?.headers).toEqual({ Authorization: "Bearer secret-token" });
  });

  it("rejects a pagination link that leaves the configured Canvas origin", () => {
    expect(() => nextPageUrl(
      '<https://attacker.example/api/v1/courses?page=2>; rel="next"',
      new URL("https://canvas.uts.edu.au/api/v1/"),
    )).toThrowError(ApplicationError);
  });

  it("follows same-origin pagination without duplicating results", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), {
        headers: { link: '<https://canvas.uts.edu.au/api/v1/courses?page=2>; rel="next"' },
      }))
      .mockResolvedValueOnce(Response.json([{ id: 2 }]));
    const client = new CanvasClient({
      baseUrl: "https://canvas.uts.edu.au",
      accessToken: "secret-token",
      retryBaseDelayMs: 0,
      fetchImpl,
    });

    await expect(client.getAll("courses")).resolves.toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("reads permitted student grade fields through the provider boundary", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(Response.json([{
      id: 77,
      course_id: 123,
      type: "StudentEnrollment",
      computed_current_score: 78.5,
      computed_final_score: null,
    }]));
    const provider = new RestCanvasProvider(new CanvasClient({
      baseUrl: "https://canvas.uts.edu.au",
      accessToken: "secret-token",
      fetchImpl,
    }));

    await expect(provider.getGrade(
      mapCanvasCourse({ id: 123, name: "Web Systems", course_code: "31268" }),
    )).resolves.toEqual({ currentScore: 78.5, finalScore: undefined });
  });
});
