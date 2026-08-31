import {
  AgentMessage,
} from "./MessageTypes";

export class Inbox {
  private readonly messages:
    AgentMessage[] = [];

  constructor(
    readonly agentId: string,
    private readonly maxMessages = 200
  ) {}

  push(
    message: AgentMessage
  ): void {
    this.messages.push(
      message
    );

    if (
      this.messages.length >
      this.maxMessages
    ) {
      this.messages.splice(
        0,
        this.messages.length -
          this.maxMessages
      );
    }
  }

  getAll(): AgentMessage[] {
    return [...this.messages];
  }

  latest(
    limit = 20
  ): AgentMessage[] {
    return this.messages.slice(
      -Math.max(1, limit)
    );
  }

  clear(): void {
    this.messages.length = 0;
  }
}
