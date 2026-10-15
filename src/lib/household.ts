import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export type Person = "sheila" | "diego";
export const PEOPLE: Person[] = ["sheila", "diego"];
export const NAMES: Record<Person, string> = { sheila: "Sheila", diego: "Diego" };
export const other = (p: Person): Person => (p === "sheila" ? "diego" : "sheila");

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee: Person;
  created_by: Person;
  date: string;
  done: boolean;
  seen: boolean;
  template_id: string | null;
  created_at: string;
};
export type Template = { id: string; title: string; created_at: string };

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const fromKey = (k: string) => new Date(k + "T00:00:00");
export const weekStart = (d: Date) => startOfWeek(d, { weekStartsOn: 1 });
export const weekDays = (start: Date) => Array.from({ length: 7 }, (_, i) => addDays(start, i));
export const fmt = (d: Date, f: string) => format(d, f, { locale: es });
export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/* ---------- Profile (stored on device) ---------- */
const KEY = "hogar-profile";
const listeners = new Set<(p: Person | null) => void>();
export function useProfile() {
  const [profile, setP] = useState<Person | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem(KEY);
    setP(v === "sheila" || v === "diego" ? v : null);
    setReady(true);
    listeners.add(setP);
    return () => void listeners.delete(setP);
  }, []);
  const setProfile = useCallback((p: Person | null) => {
    if (p) localStorage.setItem(KEY, p);
    else localStorage.removeItem(KEY);
    listeners.forEach((l) => l(p));
  }, []);
  return { profile, setProfile, ready };
}

/* ---------- Shared realtime data ---------- */
let tasksCache: Task[] = [];
let templatesCache: Template[] = [];
const taskSubs = new Set<(t: Task[]) => void>();
const tplSubs = new Set<(t: Template[]) => void>();
let started = false;

async function loadTasks() {
  const { data } = await supabase.from("tasks").select("*").order("created_at");
  tasksCache = (data ?? []) as Task[];
  taskSubs.forEach((s) => s(tasksCache));
}
async function loadTemplates() {
  const { data } = await supabase.from("weekly_templates").select("*").order("created_at");
  templatesCache = (data ?? []) as Template[];
  tplSubs.forEach((s) => s(templatesCache));
}
function start() {
  if (started) return;
  started = true;
  loadTasks();
  loadTemplates();
  supabase
    .channel("hogar")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, loadTasks)
    .on("postgres_changes", { event: "*", schema: "public", table: "weekly_templates" }, loadTemplates)
    .subscribe();
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(tasksCache);
  useEffect(() => {
    start();
    setTasks(tasksCache);
    taskSubs.add(setTasks);
    return () => void taskSubs.delete(setTasks);
  }, []);
  return tasks;
}
export function useTemplates() {
  const [t, setT] = useState<Template[]>(templatesCache);
  useEffect(() => {
    start();
    setT(templatesCache);
    tplSubs.add(setT);
    return () => void tplSubs.delete(setT);
  }, []);
  return t;
}

export const api = {
  async addTask(t: Omit<Task, "id" | "created_at" | "done" | "seen" | "template_id"> & { template_id?: string | null }) {
    await supabase.from("tasks").insert({ ...t, seen: t.assignee === t.created_by });
    loadTasks();
  },
  async updateTask(id: string, patch: Partial<Task>) {
    tasksCache = tasksCache.map((x) => (x.id === id ? { ...x, ...patch } : x));
    taskSubs.forEach((s) => s(tasksCache));
    await supabase.from("tasks").update(patch).eq("id", id);
  },
  async deleteTask(id: string) {
    tasksCache = tasksCache.filter((x) => x.id !== id);
    taskSubs.forEach((s) => s(tasksCache));
    await supabase.from("tasks").delete().eq("id", id);
  },
  async markSeen(ids: string[]) {
    if (!ids.length) return;
    await supabase.from("tasks").update({ seen: true }).in("id", ids);
    loadTasks();
  },
  async insertMany(rows: Array<Omit<Task, "id" | "created_at" | "done">>) {
    await supabase.from("tasks").insert(rows);
    loadTasks();
  },
  async addTemplate(title: string) {
    await supabase.from("weekly_templates").insert({ title });
    loadTemplates();
  },
  async updateTemplate(id: string, title: string) {
    await supabase.from("weekly_templates").update({ title }).eq("id", id);
    loadTemplates();
  },
  async deleteTemplate(id: string) {
    await supabase.from("weekly_templates").delete().eq("id", id);
    loadTemplates();
  },
};

/** Balanced auto-assignment: alternates people and spreads over distinct days. */
export function autoDistribute(templateIds: string[], seed = Math.random()) {
  const offset = Math.floor(seed * 7);
  const firstPerson: Person = seed < 0.5 ? "sheila" : "diego";
  return templateIds.map((id, i) => ({
    id,
    person: i % 2 === 0 ? firstPerson : other(firstPerson),
    day: (offset + i) % 7,
  }));
}
