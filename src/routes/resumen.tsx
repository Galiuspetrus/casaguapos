import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { fmt, NAMES, PEOPLE, toKey, useTasks, weekDays, weekStart } from "@/lib/household";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resumen")({
  head: () => ({
    meta: [
      { title: "Resumen semanal · Nuestro hogar" },
      { name: "description", content: "Cuántas tareas ha hecho cada uno esta semana." },
      { property: "og:title", content: "Resumen semanal · Nuestro hogar" },
      { property: "og:description", content: "Cuántas tareas ha hecho cada uno esta semana." },
    ],
  }),
  component: Summary,
});

function Summary() {
  const tasks = useTasks();
  const [week, setWeek] = useState(weekStart(new Date()));
  const days = weekDays(week);
  const keys = days.map(toKey);
  const inWeek = tasks.filter((t) => keys.includes(t.date));
  const stats = PEOPLE.map((p) => {
    const mine = inWeek.filter((t) => t.assignee === p);
    return { p, done: mine.filter((t) => t.done).length, total: mine.length };
  });
  const max = Math.max(1, ...stats.map((s) => s.total));
  const perDay = days.map((d) => {
    const k = toKey(d);
    return PEOPLE.map((p) => inWeek.filter((t) => t.date === k && t.assignee === p && t.done).length);
  });
  const maxDay = Math.max(1, ...perDay.flat());

  return (
    <AppShell>
      <h2 className="mb-3 text-2xl font-semibold">Resumen semanal</h2>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-card p-2 shadow-soft">
        <button onClick={() => setWeek(addDays(week, -7))} aria-label="Semana anterior" className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button>
        <p className="font-semibold">{fmt(days[0], "d MMM")} – {fmt(days[6], "d MMM")}</p>
        <button onClick={() => setWeek(addDays(week, 7))} aria-label="Semana siguiente" className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button>
      </div>

      <div className="space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        {stats.map(({ p, done, total }) => (
          <div key={p}>
            <div className="mb-1 flex justify-between font-semibold">
              <span className={p === "sheila" ? "text-sheila" : "text-diego"}>{NAMES[p]}</span>
              <span>{done} hechas <span className="text-muted-foreground">/ {total}</span></span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-full bg-muted">
              <div className={cn("absolute inset-y-0 left-0 rounded-full opacity-30", p === "sheila" ? "bg-sheila" : "bg-diego")} style={{ width: `${(total / max) * 100}%` }} />
              <div className={cn("absolute inset-y-0 left-0 rounded-full transition-all", p === "sheila" ? "bg-sheila" : "bg-diego")} style={{ width: `${(done / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-semibold">Hechas por día</h3>
        <div className="flex h-36 items-end justify-between gap-2">
          {perDay.map(([s, d], i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end justify-center gap-0.5">
                <div className="w-1/2 rounded-t-md bg-sheila" style={{ height: `${(s / maxDay) * 100}%` }} />
                <div className="w-1/2 rounded-t-md bg-diego" style={{ height: `${(d / maxDay) * 100}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{fmt(days[i], "EEEEE")}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
