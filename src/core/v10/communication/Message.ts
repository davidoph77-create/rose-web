import {
  AgentMessage,
  MessagePriority,
  MessageTarget,
} from "./MessageTypes";

export type CreateMessageInput<T = unknown> = {
  sourceAgentId: string;
  target: MessageTarget;
  type: string;
  payload: T;
  priority?: MessagePriority;
  correlationId?: string;
  replyTo?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export function createMessage<T = unknown>(
  input: CreateMessageInput<T>
): AgentMessage<T> {
  return {
    id: `message-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`,
    correlationId: input.correlationId,
    replyTo: input.replyTo,
    sourceAgentId: input.sourceAgentId,
    target: input.target,
    type: input.type,
    payload: input.payload,
    priority: input.priority ?? "normal",
    status: "queued",
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    metadata: input.metadata,
  };
}
