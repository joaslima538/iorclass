import { useEffect, useState } from "react";

export function readLocal<T>(key: string, initial: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? initial;
  } catch {
    return initial;
  }
}

export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState(() => readLocal(key, initial));
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
}

export type Group = { id: string; name: string; members: number[] };
export const initialGroups: Group[] = [
  { id: "voices", name: "Vozes em harmonia", members: [1, 3, 4] },
  { id: "english", name: "Inglês em boa companhia", members: [2, 6, 7, 8] },
];
export const groupsKey = "ior-groups";

export type Bulletin = { id: string; text: string; recipients: number[] };
export const bulletinsKey = "ior-bulletins";

export type Task = {
  text: string;
  done: boolean;
  inProgress?: boolean;
  description?: string;
  dueDate?: string;
  attachments?: { id: string; name: string }[];
  checklist?: { text: string; done: boolean }[];
  history?: { action: string; date: string }[];
};
export function logTask(task: Task, action: string): Task {
  return { ...task, history: [...(task.history ?? []), { action, date: new Date().toISOString() }] };
}

export const formatMoney = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type Assignment = {
  id?: string;
  title: string;
  description: string;
  studentId?: number;
  answer?: string;
  status?: "Avaliado" | "Refazer";
};
export const assignmentsKey = "ior-extra-activities";
export const assignmentStatus = (item: Assignment) => item.status ?? (item.answer ? "Respondido" : "Pendente");

export type TeacherProfile = { name: string; studio: string; subject: string; bio: string; color: string };
export const profileKey = "ior-teacher-profile";
export const defaultProfile: TeacherProfile = {
  name: "Carol Hends",
  studio: "Estúdio Carol Hends",
  subject: "Professora de canto",
  bio: "",
  color: "#344bfa",
};

export type Partner = { id: string; name: string; email: string; permissions: string[]; archived: boolean };
export const partnersKey = "ior-partners";
