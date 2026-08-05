export type KnowledgeEntityType =
  | "person"
  | "project"
  | "company"
  | "goal"
  | "task"
  | "document"
  | "concept"
  | "event"
  | "place"
  | "tool"
  | "other";

export type KnowledgeRelationType =
  | "is_a"
  | "part_of"
  | "related_to"
  | "created_by"
  | "uses"
  | "supports"
  | "depends_on"
  | "located_in"
  | "works_on"
  | "owns"
  | "targets"
  | "precedes"
  | "follows";

export type KnowledgeEntity = {
  id: string;
  label: string;
  type: KnowledgeEntityType;
  aliases: string[];
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeRelation = {
  id: string;
  sourceId: string;
  targetId: string;
  type: KnowledgeRelationType;
  weight: number;
  confidence: number;
  properties: Record<string, unknown>;
  createdAt: string;
};

export type KnowledgePath = {
  entityIds: string[];
  relationIds: string[];
  score: number;
};

export type KnowledgeQuery = {
  text?: string;
  entityId?: string;
  maxDepth?: number;
  limit?: number;
  relationTypes?: KnowledgeRelationType[];
};

export type KnowledgeGraphSnapshot = {
  version: string;
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  exportedAt: string;
};
