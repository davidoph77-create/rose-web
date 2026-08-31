import {
  AgentMessage,
  MessagePriority,
} from "./MessageTypes";

const PRIORITY_SCORE: Record<
  MessagePriority,
  number
> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export class MessageQueue {
  private readonly queue:
    AgentMessage[] = [];

  enqueue(
    message: AgentMessage
  ): void {
    this.queue.push(message);

    this.queue.sort((a, b) => {
      const priority =
        PRIORITY_SCORE[b.priority] -
        PRIORITY_SCORE[a.priority];

      if (priority !== 0) {
        return priority;
      }

      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      );
    });
  }

  dequeue():
    | AgentMessage
    | undefined {
    this.removeExpired();
    return this.queue.shift();
  }

  peek():
    | AgentMessage
    | undefined {
    this.removeExpired();
    return this.queue[0];
  }

  size(): number {
    this.removeExpired();
    return this.queue.length;
  }

  clear(): void {
    this.queue.length = 0;
  }

  getAll(): AgentMessage[] {
    this.removeExpired();
    return [...this.queue];
  }

  private removeExpired(): void {
    const now = Date.now();

    for (
      let index =
        this.queue.length - 1;
      index >= 0;
      index -= 1
    ) {
      const expiresAt =
        this.queue[index]
          .expiresAt;

      if (
        expiresAt &&
        new Date(
          expiresAt
        ).getTime() <= now
      ) {
        this.queue.splice(
          index,
          1
        );
      }
    }
  }
}
