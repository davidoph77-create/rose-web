export type GoalStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "blocked";

export type GoalPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type GoalCategory =
  | "personal"
  | "business"
  | "project"
  | "financial"
  | "learning"
  | "health"
  | "property"
  | "other";

export type GoalMilestone = {
  id: string;
  title: string;
  description?: string;
  order: number;
  completed: boolean;
  completedAt?: string;
  dueAt?: string;
};

export type GoalProgressEntry = {
  id: string;
  value: number;
  note?: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  milestones: GoalMilestone[];
  dependencies: string[];
  blockedReason?: string;
  requiresValidation: boolean;
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  completedAt?: string;
  history: GoalProgressEntry[];
};

export type CreateGoalInput = {
  title: string;
  description?: string;
  category?: GoalCategory;
  priority?: GoalPriority;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  dueAt?: string;
  milestones?: Array<{
    title: string;
    description?: string;
    dueAt?: string;
  }>;
  dependencies?: string[];
  requiresValidation?: boolean;
};

export type GoalEngineResult =
  | Goal
  | Goal[]
  | boolean
  | undefined;
