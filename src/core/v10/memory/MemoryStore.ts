import {
  MemoryRecord,
  MemorySearchQuery,
  MemorySearchResult,
  MemoryStoreSnapshot,
} from "./MemoryTypes";
import {
  MemoryScorer,
} from "./MemoryScorer";

export class MemoryStore {
  private readonly records =
    new Map<string, MemoryRecord>();

  private readonly scorer =
    new MemoryScorer();

  upsert<T = unknown>(
    input: Omit<
      MemoryRecord<T>,
      "id" |
      "createdAt" |
      "updatedAt" |
      "accessCount"
    > & {
      id?: string;
    }
  ): MemoryRecord<T> {
    const now =
      new Date().toISOString();

    const id =
      input.id ??
      `memory-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const existing =
      this.records.get(id);

    const record: MemoryRecord<T> = {
      id,
      kind: input.kind,
      title: input.title,
      content: input.content,
      tags: [...input.tags],
      importance: input.importance,
      confidence:
        Math.max(
          0,
          Math.min(
            1,
            input.confidence
          )
        ),
      createdAt:
        existing?.createdAt ??
        now,
      updatedAt: now,
      lastAccessedAt:
        existing?.lastAccessedAt,
      accessCount:
        existing?.accessCount ??
        0,
      metadata:
        input.metadata,
    };

    this.records.set(
      id,
      record
    );

    return {
      ...record,
      tags: [...record.tags],
    };
  }

  get(
    id: string
  ): MemoryRecord | undefined {
    const record =
      this.records.get(id);

    if (!record) {
      return undefined;
    }

    const updated = {
      ...record,
      lastAccessedAt:
        new Date().toISOString(),
      accessCount:
        record.accessCount + 1,
    };

    this.records.set(
      id,
      updated
    );

    return {
      ...updated,
      tags: [...updated.tags],
    };
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  all(): MemoryRecord[] {
    return Array.from(
      this.records.values()
    ).map(
      (record) => ({
        ...record,
        tags: [...record.tags],
      })
    );
  }

  search(
    query: MemorySearchQuery
  ): MemorySearchResult[] {
    const limit =
      Math.max(
        1,
        query.limit ?? 10
      );

    return this.all()
      .filter(
        (record) =>
          !query.minConfidence ||
          record.confidence >=
            query.minConfidence
      )
      .map(
        (record) => {
          const scored =
            this.scorer.score(
              record,
              query
            );

          return {
            record,
            score:
              scored.score,
            reasons:
              scored.reasons,
          };
        }
      )
      .filter(
        (result) =>
          result.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(
        0,
        limit
      );
  }

  snapshot():
    MemoryStoreSnapshot {
    const kinds:
      Record<string, number> = {};
    const tags:
      Record<string, number> = {};

    for (
      const record of this.records.values()
    ) {
      kinds[record.kind] =
        (kinds[record.kind] ?? 0) +
        1;

      for (
        const tag of record.tags
      ) {
        tags[tag] =
          (tags[tag] ?? 0) +
          1;
      }
    }

    return {
      count:
        this.records.size,
      kinds,
      tags,
      generatedAt:
        new Date().toISOString(),
    };
  }

  exportJSON(): string {
    return JSON.stringify(
      this.all(),
      null,
      2
    );
  }

  importJSON(
    json: string
  ): number {
    const parsed =
      JSON.parse(json);

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error(
        "Format mémoire invalide."
      );
    }

    let imported = 0;

    for (
      const candidate of parsed
    ) {
      if (
        candidate &&
        typeof candidate ===
          "object" &&
        typeof candidate.kind ===
          "string"
      ) {
        this.upsert({
          id:
            typeof candidate.id ===
            "string"
              ? candidate.id
              : undefined,
          kind:
            candidate.kind,
          title:
            candidate.title,
          content:
            candidate.content,
          tags:
            Array.isArray(
              candidate.tags
            )
              ? candidate.tags
              : [],
          importance:
            candidate.importance ??
            "normal",
          confidence:
            typeof candidate.confidence ===
            "number"
              ? candidate.confidence
              : 0.5,
          metadata:
            candidate.metadata,
        });

        imported += 1;
      }
    }

    return imported;
  }
}
