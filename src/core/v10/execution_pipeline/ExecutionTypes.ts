export type RoseExecutionIntent =
  | "memory"
  | "planning"
  | "goal"
  | "calendar"
  | "business"
  | "web"
  | "voice"
  | "general"
  | string;

export type RoseExecutionStep = {
  id: string;
  agent: string;
  title: string;
  status: "prepared" | "completed" | "blocked";
  requiresValidation: boolean;
  external: boolean;
  output: string;
};

export type RoseExecutionResult = {
  intent: RoseExecutionIntent;
  selectedAgents: string[];
  requiresValidation: boolean;
  externalActionsBlocked: boolean;
  steps: RoseExecutionStep[];
  summary: string;
};
