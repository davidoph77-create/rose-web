export type RoseEventName =
  | "core.initialized"
  | "brain.request.received"
  | "context.analyzed"
  | "memory.searched"
  | "cognitive.memory.searched"
  | "knowledge.graph.updated"
  | "reasoning.completed"
  | "plan.created"
  | "agents.selected"
  | "explanation.generated"
  | "personality.applied"
  | "brain.response.ready"
  | "core.error";

export type RoseEvent<TPayload = unknown> = {
  id: string;
  name: RoseEventName;
  payload: TPayload;
  source: string;
  createdAt: string;
};

export type RoseEventHandler<TPayload = unknown> = (
  event: RoseEvent<TPayload>
) => void | Promise<void>;

export type RoseEventSubscription = {
  unsubscribe: () => void;
};
