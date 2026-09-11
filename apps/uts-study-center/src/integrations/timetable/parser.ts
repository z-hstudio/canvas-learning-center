import ICAL from "ical.js";
import { addYears, subMonths } from "date-fns";
import type {
  Subject,
  TimetableEvent,
  TimetableEventType,
} from "@/domain/academic/types";
import { ApplicationError } from "@/lib/errors";
import { timetableFingerprint } from "./fingerprint";

export interface TimetableParseOptions {
  subjects?: Subject[];
  windowStart?: Date;
  windowEnd?: Date;
}

const MAX_SOURCE_LENGTH = 2_000_000;
const MAX_EVENTS = 10_000;

export function parseTimetableIcs(
  sourceText: string,
  options: TimetableParseOptions = {},
): TimetableEvent[] {
  if (sourceText.length > MAX_SOURCE_LENGTH || !sourceText.includes("BEGIN:VCALENDAR")) {
    throw new ApplicationError("TIMETABLE_PARSE_FAILED", "Input is not an iCalendar file");
  }

  try {
    const calendar = ICAL.Component.fromString(sourceText);
    const components = calendar.getAllSubcomponents("vevent");
    if (components.length > MAX_EVENTS) {
      throw new ApplicationError("TIMETABLE_PARSE_FAILED", "Calendar contains too many events");
    }
    const subjectsByCode = new Map((options.subjects ?? []).map((subject) => [subject.code, subject]));
    const windowStart = options.windowStart ?? subMonths(new Date(), 3);
    const windowEnd = options.windowEnd ?? addYears(new Date(), 1);
    const events: TimetableEvent[] = [];

    for (const component of components) {
      const event = new ICAL.Event(component);
      if (event.isRecurrenceException()) continue;

      if (event.isRecurring()) {
        const iterator = event.iterator();
        for (let occurrenceCount = 0; occurrenceCount < 1_000; occurrenceCount += 1) {
          const occurrence = iterator.next();
          if (!occurrence) break;
          const startAt = occurrence.toJSDate();
          if (startAt > windowEnd) break;
          if (startAt < windowStart) continue;
          const details = event.getOccurrenceDetails(occurrence);
          events.push(
            normalizeEvent(
              details.item,
              details.startDate.toJSDate(),
              details.endDate.toJSDate(),
              subjectsByCode,
            ),
          );
          if (events.length > MAX_EVENTS) {
            throw new ApplicationError("TIMETABLE_PARSE_FAILED", "Calendar expands to too many events");
          }
        }
      } else {
        const startAt = event.startDate.toJSDate();
        const endAt = event.endDate.toJSDate();
        if (endAt >= windowStart && startAt <= windowEnd) {
          events.push(normalizeEvent(event, startAt, endAt, subjectsByCode));
          if (events.length > MAX_EVENTS) {
            throw new ApplicationError("TIMETABLE_PARSE_FAILED", "Calendar contains too many events");
          }
        }
      }
    }

    return deduplicate(events);
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    throw new ApplicationError("TIMETABLE_PARSE_FAILED", "Unable to parse iCalendar data", error);
  }
}

function normalizeEvent(
  event: ICAL.Event,
  startAt: Date,
  endAt: Date,
  subjectsByCode: Map<string, Subject>,
): TimetableEvent {
  const title = event.summary?.trim() ?? "";
  const subjectCode = extractSubjectCode(`${title} ${event.description ?? ""}`);
  const subject = subjectCode ? subjectsByCode.get(subjectCode) : undefined;
  const base = {
    provider: "ics" as const,
    externalId: event.uid || undefined,
    subjectId: subject?.id,
    title,
    subjectCode,
    location: event.location?.trim() || undefined,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    eventType: inferEventType(title),
    source: "UTS MyTimetable ICS",
  };
  const fingerprint = timetableFingerprint(base);
  return { ...base, id: `ics-${fingerprint.slice(0, 24)}`, fingerprint };
}

function extractSubjectCode(value: string): string | undefined {
  return value.match(/\b\d{5}\b/)?.[0];
}

function inferEventType(title: string): TimetableEventType {
  const normalized = title.toLowerCase();
  if (/\blecture\b/.test(normalized)) return "LECTURE";
  if (/\btutorial\b/.test(normalized)) return "TUTORIAL";
  if (/\blab(oratory)?\b/.test(normalized)) return "LAB";
  if (/\bworkshop\b/.test(normalized)) return "WORKSHOP";
  if (/\bseminar\b/.test(normalized)) return "SEMINAR";
  return "OTHER";
}

function deduplicate(events: TimetableEvent[]): TimetableEvent[] {
  return Array.from(new Map(events.map((event) => [event.fingerprint, event])).values()).sort(
    (left, right) => left.startAt.localeCompare(right.startAt),
  );
}
