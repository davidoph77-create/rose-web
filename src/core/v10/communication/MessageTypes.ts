export type MessagePriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type MessageStatus =
  | "queued"
  | "routing"
  | "delivered"
  | "failed"
  | "expired";

export type MessageTarget =
  | {
      type: "agent";
      id: string;
    }
  | {
      type: "capability";
      capability: string;
    }
  | {
      type: "broadcast";
    };

export type AgentMessage<T = unknown> = {
  id: string;
  correlationId?: string;
  replyTo?: string;
  sourceAgentId: string;
  target: MessageTarget;
  type: string;
  payload: T;
  priority: MessagePriority;
  status: MessageStatus;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export type MessageDeliveryResult = {
  messageId: string;
  deliveredTo: string[];
  failedTo: Array<{
    agentId: string;
    error: string;
  }>;
  completedAt: string;
};

export type CommunicationEventName =
  | "message.queued"
  | "message.routing"
  | "message.delivered"
  | "message.failed"
  | "message.received"
  | "message.reply.created"
  | "communication.health.checked"
  | string;

export type CommunicationEvent<T = unknown> = {
  id: string;
  name: CommunicationEventName;
  payload: T;
  source: string;
  createdAt: string;
};
