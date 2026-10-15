import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, isSameMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm, type TaskFormState } from "@/components/TaskForm";
import { DAY_LABELS, fmt, fromKey, toKey, useTasks, weekDays, weekStart, type Person } from "@/lib/household";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario · Nuestro hogar" },
      { name: "description", content: "Calendario semanal y mensual de tareas del hogar." },
      { property: "og:title", content: "Calendario · Nuestro hogar" },
      { property: "og:description", content: "Calendario semanal y mensual de tareas del hogar." },
    ],
  }),
  component: Calendar,
});

type Filter = "all" | Person;

function Calendar() {
  const tasks = useTasks();
  const [view, setView] = useState<"week" | "month">("week");
  const [filter, setFilter] = useState<Filter>("all");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(toKey(new Date()));
  const [form, setForm] = useState<TaskFormState>({ open: false });

  const filtered = useMemo(() => tasks.filter((t) => filter === "all" || t.assignee === filter), [tasks, filter]);
  const byDay = useMemo(() => {
    const m: Record<string, typeof filtered> = {};
    filtered.forEach((t) => (m[t.date] ??= []).push(t));
    return m;
  }, [filtered]);

  const days = useMemo(() => {
    if (view === "week") return weekDays(weekStart(cursor));
    const start = weekStart(startOfMonth(cursor));
    const end = endOfMonth(cursor);
    const out: Date[] = [];
    for (let d = start; d <= end || out.length % 7; d = addDays(d, 1)) out.push(d);
    return out;
  }, [view, cursor]);

  const move = (n: number) => setCursor((c) => (view === "week" ? addDays(c, 7 * n) : addMonths(c, n)));
  const today = toKey(new Date());
  const title = view === "week" ? `${fmt(days[0]!, "d MMM")} – ${fmt(days[6]!, "d MMM")}` : fmt(cursor, "MMMM yyyy");
  const dayTasks = byDay[selected] ?? [];

  return (
    <AppShell>
      <div className="mb-3 flex gap-2">
        {(["week", "month"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={cn("flex-1 rounded-full py-2 font-semibold", view === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            {v === "week" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        {([["all", "Todos"], ["sheila", "Sheila"], ["diego", "Diego"]] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={cn(
              "flex-1 rounded-full border-2 py-1.5 text-sm font-semibold",
              v === "sheila" ? "border-sheila" : v === "diego" ? "border-diego" : "border-primary",
              filter === v
                ? v === "sheila" ? "bg-sheila text-sheila-foreground" : v === "diego" ? "bg-diego text-diego-foreground" : "bg-primary text-primary-foreground"
                : v === "sheila" ? "text-sheila" : v === "diego" ? "text-diego" : "text-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => move(-1)} aria-label="Anterior" className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button>
        <h2 className="text-lg font-semibold first-letter:uppercase">{title}</h2>
        <button onClick={() => move(1)} aria-label="Siguiente" className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button>
      </div>

      {view === "week" ? (
        <div className="space-y-2">
          {days.map((d) => {
            const k = toKey(d);
            const list = byDay[k] ?? [];
            return (
              <button key={k} onClick={() => setSelected(k)} className={cn("flex w-full items-start gap-3 rounded-2xl bg-card p-3 text-left shadow-soft", selected === k && "ring-2 ring-ring")}>
                <div className={cn("w-12 shrink-0 text-center", k === today && "font-bold")}>
                  <p className="text-xs uppercase text-muted-foreground">{fmt(d, "EEE")}</p>
                  <p className={cn("text-xl font-display", k === today && "text-couple")}>{fmt(d, "d")}</p>
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {list.length === 0 && <span className="py-1 text-sm text-muted-foreground">—</span>}
                  {list.map((t) => (
                    <span key={t.id} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", t.assignee === "sheila" ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground", t.done && "line-through opacity-45")}>
                      {t.title}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-card p-2 shadow-soft">
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
            {DAY_LABELS.map((l) => <div key={l} className="py-1">{l}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const k = toKey(d);
              const list = byDay[k] ?? [];
              return (
                <button key={k} onClick={() => setSelected(k)} className={cn("flex aspect-square flex-col items-center rounded-xl p-1", !isSameMonth(d, cursor) && "opacity-35", selected === k ? "bg-accent ring-2 ring-ring" : "hover:bg-muted")}>
                  <span className={cn("text-sm", k === today && "font-bold text-couple")}>{fmt(d, "d")}</span>
                  <div className="mt-auto flex flex-wrap justify-center gap-0.5">
                    {list.slice(0, 6).map((t) => (
                      <span key={t.id} className={cn("size-1.5 rounded-full", t.assignee === "sheila" ? "bg-sheila" : "bg-diego", t.done && "opacity-35")} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold first-letter:uppercase">{fmt(fromKey(selected), "EEEE d 'de' MMMM")}</h3>
          <button onClick={() => setForm({ open: true, date: selected })} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" /> Añadir
          </button>
        </div>
        <div className="space-y-2">
          {dayTasks.length === 0 && <p className="text-sm text-muted-foreground">Sin tareas este día.</p>}
          {dayTasks.map((t) => <TaskItem key={t.id} task={t} onEdit={(task) => setForm({ open: true, task })} />)}
        </div>
      </section>
      <TaskForm state={form} onClose={() => setForm({ open: false })} />
    </AppShell>
  );
}
