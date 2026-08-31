export type CognitiveIntent =
  | "memory"
  | "planning"
  | "calendar"
  | "business"
  | "voice"
  | "web"
  | "general";

export type CognitiveDecision = {
  intent: CognitiveIntent;
  confidence: number;
  selectedCapabilities: string[];
  reasons: string[];
  requiresValidation: boolean;
};

export type CognitiveInput = {
  message: string;
  metadata?: Record<string, unknown>;
};

export type CognitiveExecutionResult = {
  success: boolean;
  decision: CognitiveDecision;
  selectedAgents: string[];
  results: unknown[];
};
