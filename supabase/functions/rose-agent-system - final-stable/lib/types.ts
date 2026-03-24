export type Intent =
  | "chat"
  | "memory"
  | "calendar"
  | "task"
  | "search"
  | "project"
  | "self_improvement"
  | "goal_tracking"
  | "emergency";

export type Mood =
  | "neutral"
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "stress"
  | "love";

export type AgentName =
  | "core_agent"
  | "emotion_agent"
  | "summary_agent"
  | "memory_agent"
  | "planner_agent"
  | "task_agent"
  | "calendar_agent"
  | "search_agent"
  | "growth_agent"
  | "safety_agent";

export type HistoryMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ConversationSummary = {
  short_summary: string;
  key_points: string[];
  user_needs: string[];
};

export type MemoryItem = {
  id?: string;
  user_id: string;
  content: string;
  category: string;
  importance: number;
  created_at: string;
};

export type ActionItem = {
  type: string;
  priority: number;
};

export type OrchestratorInput = {
  user_id: string;
  conversation_id?: string | null;
  message: string;
  history?: HistoryMessage[];
};

export type OrchestratorOutput = {
  ok: boolean;
  source: string;
  reply: string;
  mood: Mood;
  intent: Intent;
  selected_agents: AgentName[];
  actions: ActionItem[];
  memory_saved: boolean;
  conversation_summary: ConversationSummary;
  debug?: Record<string, unknown>;
};

export type WebSearchResult = {
  title: string;
  snippet: string;
  url: string;
};

export type WebAgentOutput = {
  should_search: boolean;
  query: string;
  reason: string;
  results: WebSearchResult[];
};

export type PlanStep = {
  title: string;
  description: string;
  priority: number;
};

export type AutonomousPlan = {
  goal: string;
  strategy: string;
  steps: PlanStep[];
};