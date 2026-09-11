import { describe, expect, it } from "vitest";
import { parseTimetableIcs } from "@/integrations/timetable/parser";

const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UTS Study Center Test//EN
BEGIN:VEVENT
UID:41082-lecture@example.edu
DTSTAMP:20260801T000000Z
DTSTART:20260831T000000Z
DTEND:20260831T020000Z
SUMMARY:41082 Data Engineering Lecture
LOCATION:CB11.00.401
END:VEVENT
BEGIN:VEVENT
UID:31268-lab@example.edu
DTSTAMP:20260801T000000Z
DTSTART:20260901T040000Z
DTEND:20260901T060000Z
RRULE:FREQ=WEEKLY;COUNT=2
SUMMARY:31268 Web Systems Lab
LOCATION:CB10.02.230
END:VEVENT
END:VCALENDAR`;

describe("parseTimetableIcs", () => {
  it("normalizes single and recurring timetable events", () => {
    const events = parseTimetableIcs(calendar, {
      windowStart: new Date("2026-08-29T00:00:00Z"),
      windowEnd: new Date("2026-09-15T00:00:00Z"),
    });
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      provider: "ics",
      subjectCode: "41082",
      eventType: "LECTURE",
      location: "CB11.00.401",
    });
    expect(events.filter((event) => event.subjectCode === "31268")).toHaveLength(2);
    expect(new Set(events.map((event) => event.fingerprint)).size).toBe(3);
  });

  it("rejects non-calendar content with a typed error", () => {
    expect(() => parseTimetableIcs("not a calendar")).toThrow("Input is not an iCalendar file");
  });
});
