import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDays } from "date-fns";
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Shuffle, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api, autoDistribute, DAY_LABELS, fmt, NAMES, PEOPLE, toKey, useProfile, useTasks, useTemplates, weekDays, weekStart, type Person } from "@/lib/household";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/semanal")({
  head: () => ({
    meta: [
      { title: "Tareas semanales · Nuestro hogar" },
      { name: "description", content: "Plantilla de tareas recurrentes y reparto de la semana." },
      { property: "og:title", content: "Tareas semanales · Nuestro hogar" },
      { property: "og:description", content: "Plantilla de tareas recurrentes y reparto de la semana." },
    ],
  }),
  component: Weekly,
});

type Plan = Record<string, { person: Person; day: number; include: boolean }>;

function Weekly() {
  const templates = useTemplates();
  const tasks = useTasks();
  const { profile } = useProfile();
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);
  const [week, setWeek] = useState(weekStart(new Date()));
  const [plan, setPlan] = useState<Plan | null>(null);

  const days = weekDays(week);
  const weekKeys = days.map(toKey);
  const generated = tasks.filter((t) => t.template_id && weekKeys.includes(t.date));

  const openPlan = () => {
    const p: Plan = {};
    templates.forEach((t, i) => (p[t.id] = { person: i % 2 ? "diego" : "sheila", day: i % 7, include: true }));
    setPlan(p);
  };
  const auto = () => {
    if (!plan) return;
    const ids = templates.filter((t) => plan[t.id]?.include).map((t) => t.id);
    const next = { ...plan };
    autoDistribute(ids).forEach((a) => (next[a.id] = { include: true, ...next[a.id], person: a.person, day: a.day }));
    setPlan(next);
  };
  const confirmPlan = async () => {
    if (!plan || !profile) return;
    const rows = templates
      .filter((t) => plan[t.id]?.include)
      .map((t) => {
        const a = plan[t.id]!;
        return { title: t.title, description: null, assignee: a.person, created_by: profile, date: toKey(addDays(week, a.day)), template_id: t.id, seen: a.person === profile };
      });
    await api.insertMany(rows);
    setPlan(null);
  };

  return (
    <AppShell>
      <h2 className="mb-3 text-2xl font-semibold">Tareas semanales</h2>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-card p-2 shadow-soft">
        <button onClick={() => setWeek(addDays(week, -7))} aria-label="Semana anterior" className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button>
        <p className="font-semibold">{fmt(days[0]!, "d MMM")} – {fmt(days[6]!, "d MMM")}</p>
        <button onClick={() => setWeek(addDays(week, 7))} aria-label="Semana siguiente" className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button>
      </div>

      {!plan && (
        <>
          <button onClick={openPlan} disabled={!templates.length} className="mb-2 w-full rounded-2xl bg-couple py-4 text-lg font-semibold text-primary-foreground shadow-soft disabled:opacity-50 font-display">
            Repartir la semana
          </button>
          {generated.length > 0 && (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Esta semana ya tiene {generated.length} tareas semanales repartidas
              ({PEOPLE.map((p) => `${NAMES[p]}: ${generated.filter((g) => g.assignee === p).length}`).join(" · ")}).
            </p>
          )}

          <h3 className="mb-2 mt-4 text-lg font-semibold">Plantilla</h3>
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-soft">
                {editing?.id === t.id ? (
                  <>
                    <input autoFocus value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="flex-1 rounded-xl border bg-background px-3 py-1.5 outline-none" />
                    <button aria-label="Guardar" onClick={() => { api.updateTemplate(t.id, editing.title.trim() || t.title); setEditing(null); }} className="rounded-full p-2 hover:bg-muted"><Check className="size-4" /></button>
                    <button aria-label="Cancelar" onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-muted"><X className="size-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold">{t.title}</span>
                    <button aria-label="Editar" onClick={() => setEditing({ id: t.id, title: t.title })} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>
                    <button aria-label="Borrar" onClick={() => confirm(`¿Borrar "${t.title}"?`) && api.deleteTemplate(t.id)} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Trash2 className="size-4" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) { api.addTemplate(newTitle.trim()); setNewTitle(""); } }} className="mt-3 flex gap-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nueva tarea semanal…" className="flex-1 rounded-2xl border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
            <button aria-label="Añadir" className="rounded-2xl bg-primary px-4 text-primary-foreground"><Plus /></button>
          </form>
        </>
      )}

      {plan && (
        <div className="space-y-3">
          <button onClick={auto} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary py-3 font-semibold">
            <Shuffle className="size-4" /> Repartir automáticamente
          </button>
          {templates.map((t) => {
            const a = plan[t.id]!;
            if (!a) return null;
            const set = (patch: Partial<Plan[string]>) => setPlan({ ...plan, [t.id]: { ...a, ...patch } });
            return (
              <div key={t.id} className={cn("rounded-2xl border-l-4 bg-card p-3 shadow-soft", a.person === "sheila" ? "border-sheila" : "border-diego", !a.include && "opacity-45")}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" checked={a.include} onChange={(e) => set({ include: e.target.checked })} className="size-4" />
                    {t.title}
                  </label>
                  <div className="flex gap-1">
                    {PEOPLE.map((p) => (
                      <button key={p} onClick={() => set({ person: p })} className={cn("rounded-full px-3 py-1 text-xs font-semibold", a.person === p ? (p === "sheila" ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground") : "bg-muted text-muted-foreground")}>
                        {NAMES[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAY_LABELS.map((l, i) => (
                    <button key={l} onClick={() => set({ day: i })} className={cn("rounded-lg py-1.5 text-xs font-semibold", a.day === i ? (a.person === "sheila" ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground") : "bg-muted text-muted-foreground")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex gap-2">
            <button onClick={() => setPlan(null)} className="flex-1 rounded-2xl bg-muted py-3 font-semibold">Cancelar</button>
            <button onClick={confirmPlan} className="flex-[2] rounded-2xl bg-primary py-3 font-semibold text-primary-foreground">Confirmar y añadir al calendario</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
