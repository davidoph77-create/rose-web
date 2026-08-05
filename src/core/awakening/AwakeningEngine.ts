import { BrainEngine } from "../brain/BrainEngine";

export class AwakeningEngine {
  constructor(private readonly brain: BrainEngine) {}

  async awaken() {
    await this.brain.initialize();

    return {
      status: "awake",
      startedAt: new Date().toISOString(),
      modules: {
        brain: this.brain.getStatus(),
        planner: this.brain.getPlanner().getStatus(),
        goals: this.brain.getGoals().getStatus(),
        knowledge: this.brain.getKnowledgeGraph().getStatus(),
        memory: this.brain.getCognitiveMemory().getStatus(),
        agents: this.brain.getAgents().getStatus()
      },
      message:
        "Rose est initialisée. Les moteurs cognitifs sont synchronisés et prêts."
    };
  }
}
