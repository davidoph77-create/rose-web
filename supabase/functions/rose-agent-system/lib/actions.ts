import { Intent, ActionItem } from "./types.ts";

export function inferActions(intent: Intent): ActionItem[] {
  switch (intent) {
    case "memory":
      return [
        { type: "save_memory", priority: 90 },
        { type: "recall_memory", priority: 80 },
      ];

    case "calendar":
      return [
        { type: "prepare_calendar_event", priority: 85 },
      ];

    case "task":
      return [
        { type: "extract_task", priority: 90 },
      ];

    case "search":
      return [
        { type: "prepare_web_search", priority: 85 },
      ];

    case "project":
      return [
        { type: "build_architecture_plan", priority: 90 },
        { type: "propose_next_step", priority: 85 },
        { type: "save_memory", priority: 70 },
      ];

    case "self_improvement":
      return [
        { type: "analyze_self_improvement", priority: 90 },
        { type: "propose_growth_plan", priority: 85 },
      ];

    case "goal_tracking":
      return [
        { type: "track_goal_progress", priority: 90 },
        { type: "suggest_next_goal_step", priority: 85 },
      ];

    case "emergency":
      return [
        { type: "trigger_safety_protocol", priority: 100 },
      ];

    case "chat":
    default:
      return [
        { type: "analyze_request", priority: 80 },
      ];
  }
}