import {
  KnowledgeEntityType,
  KnowledgeRelationType,
} from "./types";

export type ExtractedEntity = {
  label: string;
  type: KnowledgeEntityType;
  aliases: string[];
};

export type ExtractedRelation = {
  sourceLabel: string;
  targetLabel: string;
  type: KnowledgeRelationType;
  confidence: number;
};

export type ExtractionResult = {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
};

export class KnowledgeExtractor {
  extract(text: string): ExtractionResult {
    const normalized = text.trim();
    const entities: ExtractedEntity[] = [];
    const relations: ExtractedRelation[] = [];

    this.addKnownEntity(
      entities,
      normalized,
      "David",
      "person"
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Rose",
      "project",
      ["Rose IA"]
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Atlas",
      "concept"
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Supabase",
      "tool"
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Expo",
      "tool"
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Event Bus",
      "concept"
    );
    this.addKnownEntity(
      entities,
      normalized,
      "Cognitive Memory",
      "concept"
    );

    const lower = normalized.toLowerCase();

    if (
      lower.includes("david") &&
      lower.includes("rose")
    ) {
      relations.push({
        sourceLabel: "David",
        targetLabel: "Rose",
        type: "works_on",
        confidence: 0.95,
      });
    }

    if (
      lower.includes("rose") &&
      lower.includes("event bus")
    ) {
      relations.push({
        sourceLabel: "Rose",
        targetLabel: "Event Bus",
        type: "uses",
        confidence: 0.9,
      });
    }

    if (
      lower.includes("rose") &&
      lower.includes("cognitive memory")
    ) {
      relations.push({
        sourceLabel: "Cognitive Memory",
        targetLabel: "Rose",
        type: "part_of",
        confidence: 0.9,
      });
    }

    if (
      lower.includes("rose") &&
      lower.includes("supabase")
    ) {
      relations.push({
        sourceLabel: "Rose",
        targetLabel: "Supabase",
        type: "uses",
        confidence: 0.88,
      });
    }

    if (
      lower.includes("rose") &&
      lower.includes("expo")
    ) {
      relations.push({
        sourceLabel: "Rose",
        targetLabel: "Expo",
        type: "uses",
        confidence: 0.88,
      });
    }

    return {
      entities,
      relations,
    };
  }

  private addKnownEntity(
    entities: ExtractedEntity[],
    text: string,
    label: string,
    type: KnowledgeEntityType,
    aliases: string[] = []
  ): void {
    const candidates = [label, ...aliases];
    const found = candidates.some((candidate) =>
      text.toLowerCase().includes(candidate.toLowerCase())
    );

    if (!found) {
      return;
    }

    entities.push({
      label,
      type,
      aliases,
    });
  }
}
