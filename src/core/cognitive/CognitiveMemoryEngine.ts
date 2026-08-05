import {
  CoreModule,
  CoreStatus,
} from "../types/core";
import { MemoryClassifier } from "./MemoryClassifier";
import { MemoryGraph } from "./MemoryGraph";
import { MemoryRanker } from "./MemoryRanker";
import { MemorySearch } from "./MemorySearch";
import { MemoryTimeline } from "./MemoryTimeline";
import {
  CognitiveMemorySnapshot,
  CreateMemoryInput,
  MemoryNode,
  MemoryRelationType,
  MemorySearchQuery,
  RankedMemory,
} from "./types";

export type CognitiveMemoryCommand =
  | {
      type: "create";
      input: CreateMemoryInput;
    }
  | {
      type: "search";
      query: MemorySearchQuery;
    }
  | {
      type: "link";
      sourceId: string;
      targetId: string;
      relationType?: MemoryRelationType;
      weight?: number;
    }
  | {
      type: "get";
      id: string;
    }
  | {
      type: "remove";
      id: string;
    }
  | {
      type: "snapshot";
    };

export type CognitiveMemoryResult =
  | MemoryNode
  | MemoryNode[]
  | RankedMemory[]
  | CognitiveMemorySnapshot
  | boolean
  | undefined;

export class CognitiveMemoryEngine
  implements
    CoreModule<
      CognitiveMemoryCommand,
      CognitiveMemoryResult
    >
{
  readonly id = "cognitive-memory-engine";
  readonly name = "Cognitive Memory Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";

  private readonly graph = new MemoryGraph();
  private readonly classifier = new MemoryClassifier();
  private readonly ranker = new MemoryRanker();
  private readonly searchEngine =
    new MemorySearch(this.graph, this.ranker);
  private readonly timeline = new MemoryTimeline();

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(
    command: CognitiveMemoryCommand
  ): Promise<CognitiveMemoryResult> {
    this.status = "running";

    try {
      switch (command.type) {
        case "create":
          return this.create(command.input);

        case "search":
          return this.search(command.query);

        case "link":
          this.graph.link(
            command.sourceId,
            command.targetId,
            command.relationType,
            command.weight
          );
          return true;

        case "get":
          return this.graph.get(command.id);

        case "remove":
          return this.graph.remove(command.id);

        case "snapshot":
          return this.exportSnapshot();
      }
    } finally {
      this.status = "ready";
    }
  }

  create(input: CreateMemoryInput): MemoryNode {
    const classification =
      this.classifier.classify(input.content);

    const now = new Date().toISOString();

    const memory: MemoryNode = {
      id: this.createId(),
      title:
        input.title?.trim() ||
        this.createTitle(input.content),
      content: input.content.trim(),
      category:
        input.category ?? classification.category,
      importance: this.clamp(
        input.importance ?? 60,
        0,
        100
      ),
      confidence: this.clamp(
        input.confidence ??
          classification.confidence,
        0,
        1
      ),
      tags: Array.from(
        new Set([
          ...(input.tags ?? []),
          ...classification.tags,
        ])
      ),
      relations: [],
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      source: input.source,
      archived: false,
    };

    return this.graph.add(memory);
  }

  search(query: MemorySearchQuery): RankedMemory[] {
    const results = this.searchEngine.search(query);

    results.forEach(({ memory }) => {
      memory.accessCount += 1;
      memory.lastAccessedAt =
        new Date().toISOString();
      memory.updatedAt = memory.updatedAt;
    });

    return results;
  }

  getRelated(
    id: string,
    maxDepth = 1
  ): MemoryNode[] {
    return this.graph.getRelated(id, maxDepth);
  }

  getRecent(limit = 10): MemoryNode[] {
    return this.timeline.getRecent(
      this.graph.getAll(),
      limit
    );
  }

  getAll(): MemoryNode[] {
    return this.graph.getAll();
  }

  importSnapshot(
    snapshot: CognitiveMemorySnapshot
  ): void {
    if (!Array.isArray(snapshot.memories)) {
      throw new Error(
        "Snapshot de mémoire invalide."
      );
    }

    this.graph.replaceAll(snapshot.memories);
  }

  exportSnapshot(): CognitiveMemorySnapshot {
    return {
      version: this.version,
      memories: this.graph.getAll(),
      exportedAt: new Date().toISOString(),
    };
  }

  private createTitle(content: string): string {
    const cleaned = content.trim().replace(/\s+/g, " ");

    return cleaned.length <= 60
      ? cleaned
      : `${cleaned.slice(0, 57)}...`;
  }

  private createId(): string {
    return `memory-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.max(min, Math.min(max, value));
  }
}
