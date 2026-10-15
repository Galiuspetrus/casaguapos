import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Home, Repeat, Bell } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { api, NAMES, useProfile, useTasks, type Person } from "@/lib/household";
import { cn } from "@/lib/utils";

function ProfilePicker({ onPick }: { onPick: (p: Person) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <p className="text-5xl">🏡</p>
        <h1 className="mt-3 text-4xl font-semibold text-couple">Nuestro hogar</h1>
        <p className="mt-2 text-lg text-muted-foreground">¿Quién eres?</p>
      </div>
      <div className="grid w-full max-w-sm gap-4">
        <button onClick={() => onPick("sheila")} className="rounded-3xl bg-sheila py-8 text-3xl font-semibold text-sheila-foreground shadow-soft active:scale-95 transition-transform font-display">
          Sheila
        </button>
        <button onClick={() => onPick("diego")} className="rounded-3xl bg-diego py-8 text-3xl font-semibold text-diego-foreground shadow-soft active:scale-95 transition-transform font-display">
          Diego
        </button>
      </div>
    </div>
  );
}

const NAV = [
  { to: "/", label: "Hoy", icon: Home },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/semanal", label: "Semanal", icon: Repeat },
  { to: "/resumen", label: "Resumen", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, setProfile, ready } = useProfile();
  const tasks = useTasks();
  const loc = useLocation();
  const [showNew, setShowNew] = useState(false);

  const unseen = profile ? tasks.filter((t) => t.assignee === profile && t.created_by !== profile && !t.seen) : [];

  useEffect(() => setShowNew(false), [profile]);

  if (!ready) return <div className="min-h-screen" />;
  if (!profile) return <ProfilePicker onPick={setProfile} />;

  const isS = profile === "sheila";
  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur">
        <h1 className="text-2xl font-semibold text-couple">Nuestro hogar</h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="Avisos"
            onClick={() => setShowNew((v) => !v)}
            className="relative rounded-full p-2 hover:bg-muted"
          >
            <Bell className="size-5" />
            {unseen.length > 0 && (
              <span className={cn("absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full text-xs font-bold", isS ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground")}>
                {unseen.length}
              </span>
            )}
          </button>
          <button
            onClick={() => confirm("¿Cambiar de perfil?") && setProfile(null)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", isS ? "bg-sheila text-sheila-foreground" : "bg-diego text-diego-foreground")}
          >
            {NAMES[profile]} ⇄
          </button>
        </div>
      </header>

      {showNew && (
        <div className="mx-4 mb-3 rounded-2xl bg-card p-4 shadow-soft">
          {unseen.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes tareas nuevas.</p>
          ) : (
            <>
              <p className="mb-2 font-semibold">{NAMES[unseen[0]!.created_by]} te ha añadido:</p>
              <ul className="mb-3 list-disc pl-5 text-sm">
                {unseen.map((t) => <li key={t.id}>{t.title} · {t.date}</li>)}
              </ul>
              <button onClick={() => { api.markSeen(unseen.map((t) => t.id)); setShowNew(false); }} className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                Entendido
              </button>
            </>
          )}
        </div>
      )}
      {!showNew && unseen.length > 0 && (
        <button onClick={() => setShowNew(true)} className={cn("mx-4 mb-3 block w-[calc(100%-2rem)] rounded-2xl px-4 py-2 text-left text-sm font-semibold", isS ? "bg-sheila-soft text-sheila" : "bg-diego-soft text-diego")}>
          ✨ {NAMES[unseen[0]!.created_by]} te ha añadido {unseen.length} tarea{unseen.length > 1 ? "s" : ""} nueva{unseen.length > 1 ? "s" : ""}
        </button>
      )}

      <main className="px-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link key={to} to={to} className={cn("flex flex-col items-center gap-1 py-3 text-xs font-semibold", active ? (isS ? "text-sheila" : "text-diego") : "text-muted-foreground")}>
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
