import { generateId } from "../core/ids";

export type RoseGoalStatus = "active" | "paused" | "done";

export type RoseGoal = {
  id: string;
  title: string;
  target: string;
  progress: number;
  status: RoseGoalStatus;
  subGoals: string[];
  createdAt: string;
  updatedAt: string;
};

export function createGoal(title: string, target = ""): RoseGoal {
  const now = new Date().toISOString();

  return {
    id: generateId("goal"),
    title,
    target,
    progress: 0,
    status: "active",
    subGoals: generateSubGoals(title),
    createdAt: now,
    updatedAt: now,
  };
}

export function generateSubGoals(title: string): string[] {
  const msg = title.toLowerCase();

  if (msg.includes("8000") || msg.includes("argent") || msg.includes("mois")) {
    return [
      "Suivre le chiffre d’affaires chaque semaine",
      "Identifier les chantiers les plus rentables",
      "Trouver de nouvelles opportunités",
      "Réduire les pertes de temps",
    ];
  }

  if (msg.includes("rose") || msg.includes("ia")) {
    return [
      "Stabiliser la mémoire",
      "Améliorer la voix",
      "Ajouter les moteurs d’agents",
      "Préparer l’agent web et l’agenda",
    ];
  }

  if (msg.includes("entreprise") || msg.includes("chantier")) {
    return [
      "Lister les chantiers importants",
      "Suivre les clients prioritaires",
      "Analyser les réussites et difficultés",
      "Mettre à jour le plan d’action",
    ];
  }

  return [
    "Définir une première action simple",
    "Mesurer l’avancement",
    "Identifier les blocages",
    "Mettre à jour la priorité",
  ];
}

export function suggestGoalsFromMemory(memories: string[]): RoseGoal[] {
  const goals: RoseGoal[] = [];

  memories.forEach((memory) => {
    const msg = memory.toLowerCase();

    if (msg.includes("8000") || msg.includes("objectif") || msg.includes("gagner")) {
      goals.push(createGoal("Atteindre l’objectif financier principal", "8000 €/mois"));
    }

    if (msg.includes("rose") || msg.includes("ia") || msg.includes("autonome")) {
      goals.push(createGoal("Faire évoluer Rose IA", "IA personnelle évolutive"));
    }

    if (msg.includes("entreprise") || msg.includes("chantier") || msg.includes("client")) {
      goals.push(createGoal("Développer l’activité entreprise", "Activité plus stable et rentable"));
    }
  });

  return removeDuplicateGoals(goals);
}

export function removeDuplicateGoals(goals: RoseGoal[]): RoseGoal[] {
  const seen = new Set<string>();

  return goals.filter((goal) => {
    const key = goal.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function updateGoalProgress(
  goals: RoseGoal[],
  goalId: string,
  progress: number
): RoseGoal[] {
  return goals.map((goal) =>
    goal.id === goalId
      ? {
          ...goal,
          progress: Math.max(0, Math.min(100, progress)),
          status: progress >= 100 ? "done" : "active",
          updatedAt: new Date().toISOString(),
        }
      : goal
  );
}

export function deleteGoal(goals: RoseGoal[], goalId: string): RoseGoal[] {
  return goals.filter((goal) => goal.id !== goalId);
}