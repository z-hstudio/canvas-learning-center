"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAcademicData } from "@/components/providers/academic-data-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalFormat } from "@/hooks/use-local-format";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "agenda";
type DisplayEvent = {
  id: string;
  kind: "class" | "deadline";
  title: string;
  subjectCode?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  eventType?: string;
};

export function CalendarPage() {
  const t = useTranslations();
  const { data } = useAcademicData();
  const format = useLocalFormat();
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(startOfDay(new Date()));

  const events = useMemo<DisplayEvent[]>(
    () => [
      ...data.timetableEvents.map((event) => ({
        id: event.id,
        kind: "class" as const,
        title: event.title || t("calendar.untitledEvent"),
        subjectCode: event.subjectCode,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        eventType: event.eventType,
      })),
      ...data.assessments.flatMap((assessment) =>
        assessment.dueAt
          ? [{
              id: `deadline-${assessment.id}`,
              kind: "deadline" as const,
              title: assessment.title,
              subjectCode: assessment.subjectCode,
              startAt: assessment.dueAt,
            }]
          : [],
      ),
    ].sort((left, right) => left.startAt.localeCompare(right.startAt)),
    [data.assessments, data.timetableEvents, t],
  );

  const move = (direction: -1 | 1) => {
    if (view === "month") setAnchor((value) => direction === 1 ? addMonths(value, 1) : subMonths(value, 1));
    else setAnchor((value) => direction === 1 ? addWeeks(value, 1) : subWeeks(value, 1));
  };

  const periodLabel = view === "month"
    ? new Intl.DateTimeFormat(format.locale, { month: "long", year: "numeric", timeZone: format.timeZone }).format(anchor)
    : `${format.formatShortDate(startOfWeek(anchor, { weekStartsOn: 1 }))} – ${format.formatShortDate(endOfWeek(anchor, { weekStartsOn: 1 }))}`;

  return (
    <>
      <PageHeading
        title={t("calendar.title")}
        description={t("calendar.subtitle")}
        actions={
          <div role="group" aria-label={t("calendar.title")} className="inline-flex h-8 items-center rounded-lg bg-muted p-[3px]">
            {(["month", "week", "agenda"] as const).map((key) => (
              <Button
                key={key}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={view === key}
                className={cn("h-[26px] px-2.5 text-xs shadow-none", view === key && "bg-background text-foreground shadow-sm hover:bg-background")}
                onClick={() => setView(key)}
              >
                {t(`calendar.${key}`)}
              </Button>
            ))}
          </div>
        }
      />

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col justify-between gap-3 border-b p-3 sm:flex-row sm:items-center sm:px-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label={t("calendar.previous")} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" className="size-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(startOfDay(new Date()))}>{t("calendar.jumpToday")}</Button>
            <Button variant="ghost" size="icon-sm" aria-label={t("calendar.next")} onClick={() => move(1)}><ChevronRight aria-hidden="true" className="size-4" /></Button>
          </div>
          <h2 className="text-sm font-semibold capitalize">{periodLabel}</h2>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" aria-hidden="true" />{t("calendar.classes")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />{t("calendar.deadlines")}</span>
          </div>
        </div>
        <CardContent className="p-0">
          {view === "month" ? <MonthView anchor={anchor} events={events} /> : <AgendaView anchor={anchor} events={events} compact={view === "week"} />}
        </CardContent>
      </Card>
    </>
  );
}

function MonthView({ anchor, events }: { anchor: Date; events: DisplayEvent[] }) {
  const t = useTranslations();
  const format = useLocalFormat();
  const range = eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }),
  });
  const weekDays = eachDayOfInterval({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6) });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 border-b bg-muted/20">
        {weekDays.map((day) => <div key={day.toISOString()} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{new Intl.DateTimeFormat(format.locale, { weekday: "short", timeZone: format.timeZone }).format(day)}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {range.map((day) => {
            const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), day));
            return (
              <div key={day.toISOString()} className={cn("min-h-28 border-b border-r p-2 last:border-r-0", !isSameMonth(day, anchor) && "bg-muted/20 text-muted-foreground")}>
                <time className={cn("grid size-6 place-items-center rounded-full text-[11px] font-medium", isSameDay(day, new Date()) && "bg-primary text-primary-foreground")}>{day.getDate()}</time>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div key={event.id} title={event.title} className={cn("truncate rounded px-1.5 py-1 text-[10px] font-medium", event.kind === "class" ? "bg-primary/10 text-primary" : "bg-amber-500/12 text-amber-800 dark:text-amber-300")}>
                      {format.formatTime(event.startAt)} {event.subjectCode ?? event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 ? <p className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 3} {t("common.viewAll")}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgendaView({ anchor, events, compact }: { anchor: Date; events: DisplayEvent[]; compact: boolean }) {
  const t = useTranslations();
  const format = useLocalFormat();
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = compact ? addDays(start, 6) : addDays(start, 27);
  const days = eachDayOfInterval({ start, end });
  const populated = days.map((day) => ({ day, events: events.filter((event) => isSameDay(new Date(event.startAt), day)) })).filter((entry) => entry.events.length > 0);

  if (populated.length === 0) return <div className="p-5"><EmptyState icon={CalendarDays} title={t("calendar.noEvents")} /></div>;

  return (
    <div className="divide-y">
      {populated.map(({ day, events: dayEvents }) => (
        <section key={day.toISOString()} className="grid gap-3 p-4 sm:grid-cols-[120px_1fr] sm:p-5">
          <div><p className="text-sm font-semibold">{format.formatDate(day)}</p></div>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div key={event.id} className="flex gap-3 rounded-lg border bg-background p-3">
                <span className={cn("mt-1 size-2 shrink-0 rounded-full", event.kind === "class" ? "bg-primary" : "bg-amber-500")} aria-hidden="true" />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium">{event.title}</h3>{event.subjectCode ? <Badge variant="outline" className="font-mono font-normal">{event.subjectCode}</Badge> : null}</div><div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3" />{format.formatTime(event.startAt)}{event.endAt ? `–${format.formatTime(event.endAt)}` : null}</span>{event.location ? <span className="inline-flex items-center gap-1"><MapPin aria-hidden="true" className="size-3" />{event.location}</span> : null}</div></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
