export type CoreStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "running"
  | "error";

export type RoseDomain =
  | "general"
  | "memory"
  | "goals"
  | "tasks"
  | "web"
  | "agenda"
  | "business"
  | "coach"
  | "autonomy";

export type RoseIntent =
  | "conversation"
  | "remember"
  | "plan"
  | "search"
  | "schedule"
  | "manage_business"
  | "manage_goal"
  | "manage_task"
  | "request_explanation"
  | "unknown";

export type CoreInput = {
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export type CoreContext = {
  userId?: string;
  message: string;
  normalizedMessage: string;
  intent: RoseIntent;
  domains: RoseDomain[];
  confidence: number;
  metadata: Record<string, unknown>;
};

export type CoreTraceStep = {
  id: string;
  moduleId: string;
  label: string;
  detail?: string;
  status: "success" | "warning" | "error";
  createdAt: string;
};

export type CoreRecommendation = {
  title: string;
  reason: string;
  confidence: number;
  requiresValidation: boolean;
};

export type CoreOutput = {
  success: boolean;
  response: string;
  context: CoreContext;
  recommendations: CoreRecommendation[];
  trace: CoreTraceStep[];
  missingInformation: string[];
};

export interface CoreModule<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly maturity: 1 | 2 | 3 | 4;

  getStatus(): CoreStatus;
  initialize(): Promise<void>;
  execute(input: TInput): Promise<TOutput>;
}
