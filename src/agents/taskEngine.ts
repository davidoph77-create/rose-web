import { generateId } from "../core/ids";

export type RoseTaskStatus = "todo" | "doing" | "done" | "blocked";

export type RoseTaskPriority = "low" | "medium" | "high" | "urgent";

export type RoseTaskCategory =
  | "rose"
  | "entreprise"
  | "objectif"
  | "agenda"
  | "web"
  | "memoire"
  | "general";

export type RoseTask = {
  id: string;
  title: string;
  description: string;
  category: RoseTaskCategory;
  priority: RoseTaskPriority;
  status: RoseTaskStatus;
  createdAt: string;
  updatedAt: string;
};

export function createTask(
  title: string,
  description: string,
  category: RoseTaskCategory = "general"
): RoseTask {
  const now = new Date().toISOString();

  return {
    id: generateId("task"),
    title,
    description,
    category,
    priority: detectPriority(title + " " + description),
    status: "todo",
    createdAt: now,
    updatedAt: now,
  };
}

export function detectPriority(text: string): RoseTaskPriority {
  const msg = text.toLowerCase();

  if (
    msg.includes("urgent") ||
    msg.includes("aujourd'hui") ||
    msg.includes("important") ||
    msg.includes("priorité")
  ) {
    return "urgent";
  }

  if (
    msg.includes("objectif") ||
    msg.includes("client") ||
    msg.includes("chantier") ||
    msg.includes("argent") ||
    msg.includes("maison")
  ) {
    return "high";
  }

  if (
    msg.includes("rose") ||
    msg.includes("mémoire") ||
    msg.includes("agenda") ||
    msg.includes("web")
  ) {
    return "medium";
  }

  return "low";
}

export function suggestTasksFromMemory(memories: string[]): RoseTask[] {
  const tasks: RoseTask[] = [];

  memories.forEach((memory) => {
    const msg = memory.toLowerCase();

    if (msg.includes("8000") || msg.includes("objectif")) {
      tasks.push(
        createTask(
          "Suivre l’objectif financier",
          "Analyser les actions nécessaires pour avancer vers l’objectif principal.",
          "objectif"
        )
      );
    }

    if (
      msg.includes("chantier") ||
      msg.includes("client") ||
      msg.includes("entreprise")
    ) {
      tasks.push(
        createTask(
          "Analyser l’activité entreprise",
          "Créer une action pour suivre l’activité, les clients ou les chantiers.",
          "entreprise"
        )
      );
    }

    if (msg.includes("rose") || msg.includes("ia")) {
      tasks.push(
        createTask(
          "Améliorer Rose IA",
          "Prévoir une amélioration stable du cœur intelligent de Rose.",
          "rose"
        )
      );
    }
  });

  return removeDuplicateTasks(tasks);
}

export function removeDuplicateTasks(tasks: RoseTask[]): RoseTask[] {
  const seen = new Set<string>();

  return tasks.filter((task) => {
    const key = task.title.toLowerCase().trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function updateTaskStatus(
  tasks: RoseTask[],
  taskId: string,
  status: RoseTaskStatus
): RoseTask[] {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status,
          updatedAt: new Date().toISOString(),
        }
      : task
  );
}

export function deleteTask(tasks: RoseTask[], taskId: string): RoseTask[] {
  return tasks.filter((task) => task.id !== taskId);
}