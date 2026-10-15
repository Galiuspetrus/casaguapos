import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api, NAMES, PEOPLE, toKey, useProfile, type Person, type Task } from "@/lib/household";
import { cn } from "@/lib/utils";

export type TaskFormState = { open: boolean; task?: Task; date?: string; assignee?: Person };

export function TaskForm({ state, onClose }: { state: TaskFormState; onClose: () => void }) {
  const { profile } = useProfile();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Person>("sheila");
  const [date, setDate] = useState(toKey(new Date()));

  useEffect(() => {
    if (!state.open) return;
    setTitle(state.task?.title ?? "");
    setDescription(state.task?.description ?? "");
    setAssignee(state.task?.assignee ?? state.assignee ?? profile ?? "sheila");
    setDate(state.task?.date ?? state.date ?? toKey(new Date()));
  }, [state, profile]);

  if (!state.open) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !profile) return;
    const payload = { title: title.trim(), description: description.trim() || null, assignee, date };
    if (state.task) await api.updateTask(state.task.id, payload);
    else await api.addTask({ ...payload, created_by: profile });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 sm:items-center" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-t-3xl bg-card p-5 pb-8 shadow-soft animate-in slide-in-from-bottom sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{state.task ? "Editar tarea" : "Nueva tarea"}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PEOPLE.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setAssignee(p)}
              className={cn(
                "rounded-2xl border-2 py-3 font-semibold transition-colors",
                p === "sheila" ? "border-sheila" : "border-diego",
                assignee === p
                  ? p === "sheila" ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground"
                  : p === "sheila" ? "text-sheila" : "text-diego",
              )}
            >
              Para {NAMES[p]}
            </button>
          ))}
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          className="w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full resize-none rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground">
          Guardar
        </button>
      </form>
    </div>
  );
}
