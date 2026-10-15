import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm, type TaskFormState } from "@/components/TaskForm";
import { fmt, NAMES, PEOPLE, toKey, useTasks } from "@/lib/household";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoy · Nuestro hogar" },
      { name: "description", content: "Las tareas de hoy de Sheila y Diego." },
      { property: "og:title", content: "Hoy · Nuestro hogar" },
      { property: "og:description", content: "Las tareas de hoy de Sheila y Diego." },
    ],
  }),
  component: Today,
});

function Today() {
  const tasks = useTasks();
  const [form, setForm] = useState<TaskFormState>({ open: false });
  const today = toKey(new Date());
  return (
    <AppShell>
      <p className="mb-4 text-lg first-letter:uppercase text-muted-foreground">{fmt(new Date(), "EEEE d 'de' MMMM")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {PEOPLE.map((p) => {
          const list = tasks.filter((t) => t.date === today && t.assignee === p);
          const done = list.filter((t) => t.done).length;
          const isS = p === "sheila";
          return (
            <section key={p} className={cn("rounded-3xl p-4", isS ? "bg-sheila-soft" : "bg-diego-soft")}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className={cn("text-2xl font-semibold", isS ? "text-sheila" : "text-diego")}>{NAMES[p]}</h2>
                <span className="text-sm font-semibold text-muted-foreground">{done}/{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.length === 0 && <p className="py-3 text-sm text-muted-foreground">Nada para hoy 🎉</p>}
                {list.map((t) => <TaskItem key={t.id} task={t} onEdit={(task) => setForm({ open: true, task })} />)}
              </div>
              <button
                onClick={() => setForm({ open: true, assignee: p, date: today })}
                className={cn("mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed py-2.5 font-semibold", isS ? "border-sheila text-sheila" : "border-diego text-diego")}
              >
                <Plus className="size-4" /> Añadir tarea a {NAMES[p]}
              </button>
            </section>
          );
        })}
      </div>
      <TaskForm state={form} onClose={() => setForm({ open: false })} />
    </AppShell>
  );
}
