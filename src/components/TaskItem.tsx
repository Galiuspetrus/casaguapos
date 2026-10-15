import { Check, Pencil, Trash2 } from "lucide-react";
import { api, NAMES, type Task } from "@/lib/household";
import { cn } from "@/lib/utils";

export function TaskItem({ task, onEdit, compact }: { task: Task; onEdit?: (t: Task) => void; compact?: boolean }) {
  const isS = task.assignee === "sheila";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-l-4 bg-card p-3 shadow-soft transition-opacity",
        isS ? "border-sheila" : "border-diego",
        task.done && "opacity-55",
      )}
    >
      <button
        aria-label={task.done ? "Marcar pendiente" : "Marcar hecha"}
        onClick={() => api.updateTask(task.id, { done: !task.done })}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
          isS ? "border-sheila" : "border-diego",
          task.done && (isS ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground"),
        )}
      >
        {task.done && <Check className="size-4" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold leading-tight", task.done && "line-through")}>{task.title}</p>
        {!compact && task.description && (
          <p className="truncate text-sm text-muted-foreground">{task.description}</p>
        )}
        {!compact && task.created_by !== task.assignee && (
          <p className="text-xs text-muted-foreground">Añadida por {NAMES[task.created_by]}</p>
        )}
      </div>
      {onEdit && (
        <button aria-label="Editar" onClick={() => onEdit(task)} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
          <Pencil className="size-4" />
        </button>
      )}
      <button
        aria-label="Borrar"
        onClick={() => confirm("¿Borrar esta tarea?") && api.deleteTask(task.id)}
        className="rounded-full p-2 text-muted-foreground hover:bg-muted"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
