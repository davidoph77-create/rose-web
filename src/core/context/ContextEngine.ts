import {
  CoreContext,
  CoreInput,
  CoreModule,
  CoreStatus,
  RoseDomain,
  RoseIntent,
} from "../types/core";

export class ContextEngine
  implements CoreModule<CoreInput, CoreContext>
{
  readonly id = "context-engine";
  readonly name = "Context Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(input: CoreInput): Promise<CoreContext> {
    this.status = "running";

    try {
      const normalizedMessage = input.message.trim().toLowerCase();
      const { intent, confidence } =
        this.detectIntent(normalizedMessage);

      return {
        userId: input.userId,
        message: input.message,
        normalizedMessage,
        intent,
        domains: this.detectDomains(normalizedMessage),
        confidence,
        metadata: input.metadata ?? {},
      };
    } finally {
      this.status = "ready";
    }
  }

  private detectIntent(
    message: string
  ): { intent: RoseIntent; confidence: number } {
    if (!message) {
      return { intent: "unknown", confidence: 0 };
    }

    if (
      message.includes("souviens") ||
      message.includes("mémorise") ||
      message.includes("retiens")
    ) {
      return { intent: "remember", confidence: 0.92 };
    }

    if (
      message.includes("plan") ||
      message.includes("organise") ||
      message.includes("prépare ma journée")
    ) {
      return { intent: "plan", confidence: 0.9 };
    }

    if (
      message.includes("cherche") ||
      message.includes("internet") ||
      message.includes("web")
    ) {
      return { intent: "search", confidence: 0.9 };
    }

    if (
      message.includes("agenda") ||
      message.includes("rendez-vous") ||
      message.includes("rappel")
    ) {
      return { intent: "schedule", confidence: 0.9 };
    }

    if (
      message.includes("entreprise") ||
      message.includes("chantier") ||
      message.includes("client") ||
      message.includes("devis")
    ) {
      return { intent: "manage_business", confidence: 0.86 };
    }

    if (message.includes("objectif")) {
      return { intent: "manage_goal", confidence: 0.86 };
    }

    if (
      message.includes("tâche") ||
      message.includes("mission")
    ) {
      return { intent: "manage_task", confidence: 0.86 };
    }

    if (
      message.includes("pourquoi") ||
      message.includes("explique")
    ) {
      return {
        intent: "request_explanation",
        confidence: 0.88,
      };
    }

    return { intent: "conversation", confidence: 0.65 };
  }

  private detectDomains(message: string): RoseDomain[] {
    const domains = new Set<RoseDomain>();

    if (
      message.includes("mémoire") ||
      message.includes("souviens") ||
      message.includes("retiens")
    ) {
      domains.add("memory");
    }

    if (message.includes("objectif")) {
      domains.add("goals");
    }

    if (
      message.includes("tâche") ||
      message.includes("mission")
    ) {
      domains.add("tasks");
    }

    if (
      message.includes("web") ||
      message.includes("internet") ||
      message.includes("cherche")
    ) {
      domains.add("web");
    }

    if (
      message.includes("agenda") ||
      message.includes("rendez-vous") ||
      message.includes("rappel")
    ) {
      domains.add("agenda");
    }

    if (
      message.includes("entreprise") ||
      message.includes("chantier") ||
      message.includes("client") ||
      message.includes("devis")
    ) {
      domains.add("business");
    }

    if (
      message.includes("conseil") ||
      message.includes("coach")
    ) {
      domains.add("coach");
    }

    if (
      message.includes("autonome") ||
      message.includes("autonomie")
    ) {
      domains.add("autonomy");
    }

    if (domains.size == 0) {
      domains.add("general");
    }

    return Array.from(domains);
  }
}
