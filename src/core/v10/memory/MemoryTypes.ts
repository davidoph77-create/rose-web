export type MemoryKind =
  | "conversation"
  | "fact"
  | "preference"
  | "goal"
  | "project"
  | "event"
  | "decision"
  | "habit"
  | "note"
  | string;

export type MemoryImportance =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type MemoryRecord<T = unknown> = {
  id: string;
  kind: MemoryKind;
  title?: string;
  content: T;
  tags: string[];
  importance: MemoryImportance;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  metadata?: Record<string, unknown>;
};

export type MemorySearchQuery = {
  text?: string;
  kinds?: MemoryKind[];
  tags?: string[];
  minConfidence?: number;
  limit?: number;
};

export type MemorySearchResult = {
  record: MemoryRecord;
  score: number;
  reasons: string[];
};

export type MemoryStoreSnapshot = {
  count: number;
  kinds: Record<string, number>;
  tags: Record<string, number>;
  generatedAt: string;
};
