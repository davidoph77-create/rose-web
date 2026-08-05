export type MemoryCategory =
  | "identity"
  | "preference"
  | "project"
  | "business"
  | "personal"
  | "goal"
  | "task"
  | "decision"
  | "event"
  | "knowledge"
  | "other";

export type MemoryRelationType =
  | "related_to"
  | "part_of"
  | "depends_on"
  | "supports"
  | "contradicts"
  | "replaces"
  | "created_from";

export type MemoryRelation = {
  targetId: string;
  type: MemoryRelationType;
  weight: number;
  createdAt: string;
};

export type MemoryNode = {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  importance: number;
  confidence: number;
  tags: string[];
  relations: MemoryRelation[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  source?: string;
  archived: boolean;
};

export type CreateMemoryInput = {
  title?: string;
  content: string;
  category?: MemoryCategory;
  importance?: number;
  confidence?: number;
  tags?: string[];
  source?: string;
};

export type MemorySearchQuery = {
  text: string;
  categories?: MemoryCategory[];
  tags?: string[];
  limit?: number;
  includeArchived?: boolean;
};

export type RankedMemory = {
  memory: MemoryNode;
  score: number;
  reasons: string[];
};

export type CognitiveMemorySnapshot = {
  version: string;
  memories: MemoryNode[];
  exportedAt: string;
};
