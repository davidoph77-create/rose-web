export type GoalPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type GoalStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "blocked";

export type GoalProgress = {
  percent: number;
  completedSteps: number;
  totalSteps: number;
  updatedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  targetDate?: string;
  progress: GoalProgress;
  planId?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
};

export type CreateGoalInput = {
  title: string;
  description?: string;
  priority?: GoalPriority;
  targetDate?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type GoalAnalysis = {
  title: string;
  urgency: GoalPriority;
  needsPlan: boolean;
  memoryRelevant: boolean;
  reasons: string[];
};
