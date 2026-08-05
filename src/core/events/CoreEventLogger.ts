import { EventBus } from "./EventBus";
import {
  RoseEvent,
  RoseEventName,
  RoseEventSubscription,
} from "./types";

export type CoreLogEntry = {
  eventName: RoseEventName;
  source: string;
  message: string;
  createdAt: string;
};

export class CoreEventLogger {
  private readonly logs: CoreLogEntry[] = [];
  private subscriptions: RoseEventSubscription[] = [];

  constructor(
    private readonly eventBus: EventBus
  ) {}

  start(): void {
    this.stop();

    const eventNames: RoseEventName[] = [
      "core.initialized",
      "brain.request.received",
      "context.analyzed",
      "memory.searched",
      "cognitive.memory.searched",
      "knowledge.graph.updated",
      "reasoning.completed",
      "plan.created",
      "plan.step.updated",
      "goal.created",
      "goal.updated",
      "goal.completed",
      "agents.selected",
      "explanation.generated",
      "personality.applied",
      "brain.response.ready",
      "core.error",
    ];

    this.subscriptions =
      eventNames.map(
        (eventName) =>
          this.eventBus.subscribe(
            eventName,
            (event) => {
              this.logs.push({
                eventName:
                  event.name,
                source:
                  event.source,
                message:
                  this.createMessage(
                    event
                  ),
                createdAt:
                  event.createdAt,
              });
            }
          )
      );
  }

  stop(): void {
    this.subscriptions.forEach(
      (subscription) =>
        subscription.unsubscribe()
    );
    this.subscriptions = [];
  }

  getLogs(): CoreLogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs.length = 0;
  }

  private createMessage(
    event: RoseEvent
  ): string {
    switch (event.name) {
      case "goal.created":
        return "Un nouvel objectif a été créé.";
      case "goal.updated":
        return "Un objectif a été mis à jour.";
      case "goal.completed":
        return "Un objectif a été terminé.";
      case "plan.created":
        return "Un plan structuré a été préparé.";
      case "plan.step.updated":
        return "Une étape du plan a changé d’état.";
      case "core.initialized":
        return "Rose Core est initialisé.";
      case "brain.request.received":
        return "Une nouvelle demande a été reçue.";
      case "context.analyzed":
        return "Le contexte et l’intention ont été analysés.";
      case "memory.searched":
        return "La mémoire historique a été consultée.";
      case "cognitive.memory.searched":
        return "La mémoire cognitive a été consultée.";
      case "knowledge.graph.updated":
        return "Le graphe de connaissances a été enrichi.";
      case "reasoning.completed":
        return "Le raisonnement est terminé.";
      case "agents.selected":
        return "Les agents spécialisés ont été sélectionnés.";
      case "explanation.generated":
        return "Une explication a été générée.";
      case "personality.applied":
        return "La personnalité de Rose a été appliquée.";
      case "brain.response.ready":
        return "La réponse de Rose est prête.";
      case "core.error":
        return "Une erreur a été détectée dans Rose Core.";
      default:
        return event.name;
    }
  }
}
