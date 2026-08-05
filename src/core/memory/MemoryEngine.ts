import {
  CoreContext,
  CoreModule,
  CoreStatus,
} from "../types/core";

export type MemorySummary = {
  relevantMemories: string[];
  sourceCount: number;
};

export class MemoryEngine
  implements CoreModule<CoreContext, MemorySummary>
{
  readonly id = "memory-engine";
  readonly name = "Memory Engine";
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

  async execute(context: CoreContext): Promise<MemorySummary> {
    this.status = "running";

    try {
      const rawMemories = context.metadata.memories;

      if (!Array.isArray(rawMemories)) {
        return {
          relevantMemories: [],
          sourceCount: 0,
        };
      }

      const memories = rawMemories.filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0
      );

      const words = context.normalizedMessage
        .split(/\s+/)
        .filter((word) => word.length >= 4);

      const relevantMemories = memories
        .filter((memory) => {
          const normalized = memory.toLowerCase();
          return words.some((word) => normalized.includes(word));
        })
        .slice(0, 5);

      return {
        relevantMemories,
        sourceCount: memories.length,
      };
    } finally {
      this.status = "ready";
    }
  }
}
