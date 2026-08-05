import {
  CoreModule,
  CoreStatus,
} from "../types/core";
import { KnowledgeExtractor } from "./KnowledgeExtractor";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { KnowledgeReasoner } from "./KnowledgeReasoner";
import {
  KnowledgeEntity,
  KnowledgeEntityType,
  KnowledgeGraphSnapshot,
  KnowledgePath,
  KnowledgeQuery,
  KnowledgeRelation,
  KnowledgeRelationType,
} from "./types";

export type KnowledgeGraphCommand =
  | {
      type: "add_entity";
      label: string;
      entityType: KnowledgeEntityType;
      aliases?: string[];
      properties?: Record<string, unknown>;
    }
  | {
      type: "add_relation";
      sourceId: string;
      targetId: string;
      relationType: KnowledgeRelationType;
      weight?: number;
      confidence?: number;
      properties?: Record<string, unknown>;
    }
  | {
      type: "extract";
      text: string;
    }
  | {
      type: "search";
      query: KnowledgeQuery;
    }
  | {
      type: "find_paths";
      sourceId: string;
      targetId: string;
      maxDepth?: number;
    }
  | {
      type: "explain_connection";
      sourceId: string;
      targetId: string;
    }
  | {
      type: "snapshot";
    };

export type KnowledgeGraphResult =
  | KnowledgeEntity
  | KnowledgeEntity[]
  | KnowledgeRelation
  | KnowledgePath[]
  | KnowledgeGraphSnapshot
  | ReturnType<KnowledgeReasoner["explainConnection"]>
  | {
      entities: KnowledgeEntity[];
      relations: KnowledgeRelation[];
    };

export class KnowledgeGraphEngine
  implements
    CoreModule<
      KnowledgeGraphCommand,
      KnowledgeGraphResult
    >
{
  readonly id = "knowledge-graph-engine";
  readonly name = "Knowledge Graph Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";
  private readonly graph = new KnowledgeGraph();
  private readonly extractor = new KnowledgeExtractor();
  private readonly reasoner =
    new KnowledgeReasoner(this.graph);

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(
    command: KnowledgeGraphCommand
  ): Promise<KnowledgeGraphResult> {
    this.status = "running";

    try {
      switch (command.type) {
        case "add_entity":
          return this.addEntity(
            command.label,
            command.entityType,
            command.aliases,
            command.properties
          );

        case "add_relation":
          return this.addRelation(
            command.sourceId,
            command.targetId,
            command.relationType,
            command.weight,
            command.confidence,
            command.properties
          );

        case "extract":
          return this.extract(command.text);

        case "search":
          return this.graph.search(command.query);

        case "find_paths":
          return this.graph.findPaths(
            command.sourceId,
            command.targetId,
            command.maxDepth
          );

        case "explain_connection":
          return this.reasoner.explainConnection(
            command.sourceId,
            command.targetId
          );

        case "snapshot":
          return this.graph.exportSnapshot(
            this.version
          );
      }
    } finally {
      this.status = "ready";
    }
  }

  addEntity(
    label: string,
    type: KnowledgeEntityType,
    aliases: string[] = [],
    properties: Record<string, unknown> = {}
  ): KnowledgeEntity {
    const existing =
      this.graph.findEntityByLabel(label);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();

    return this.graph.addEntity({
      id: this.createId("entity"),
      label: label.trim(),
      type,
      aliases: Array.from(new Set(aliases)),
      properties,
      createdAt: now,
      updatedAt: now,
    });
  }

  addRelation(
    sourceId: string,
    targetId: string,
    type: KnowledgeRelationType,
    weight = 0.8,
    confidence = 0.8,
    properties: Record<string, unknown> = {}
  ): KnowledgeRelation {
    return this.graph.addRelation({
      id: this.createId("relation"),
      sourceId,
      targetId,
      type,
      weight: this.clamp(weight),
      confidence: this.clamp(confidence),
      properties,
      createdAt: new Date().toISOString(),
    });
  }

  extract(text: string): {
    entities: KnowledgeEntity[];
    relations: KnowledgeRelation[];
  } {
    const extraction = this.extractor.extract(text);

    const entities = extraction.entities.map((entity) =>
      this.addEntity(
        entity.label,
        entity.type,
        entity.aliases
      )
    );

    const relations: KnowledgeRelation[] = [];

    for (const relation of extraction.relations) {
      const source =
        this.graph.findEntityByLabel(
          relation.sourceLabel
        );
      const target =
        this.graph.findEntityByLabel(
          relation.targetLabel
        );

      if (!source || !target) {
        continue;
      }

      relations.push(
        this.addRelation(
          source.id,
          target.id,
          relation.type,
          0.85,
          relation.confidence
        )
      );
    }

    return {
      entities,
      relations,
    };
  }

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
