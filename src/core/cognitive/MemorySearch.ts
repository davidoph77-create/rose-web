import { MemoryGraph } from "./MemoryGraph";
import { MemoryRanker } from "./MemoryRanker";
import {
  MemorySearchQuery,
  RankedMemory,
} from "./types";

export class MemorySearch {
  constructor(
    private readonly graph: MemoryGraph,
    private readonly ranker: MemoryRanker
  ) {}

  search(query: MemorySearchQuery): RankedMemory[] {
    const limit = Math.max(
      1,
      Math.min(query.limit ?? 10, 50)
    );

    const filtered = this.graph
      .getAll()
      .filter((memory) => {
        if (!query.includeArchived && memory.archived) {
          return false;
        }

        if (
          query.categories?.length &&
          !query.categories.includes(memory.category)
        ) {
          return false;
        }

        if (
          query.tags?.length &&
          !query.tags.some((tag) =>
            memory.tags.includes(tag)
          )
        ) {
          return false;
        }

        return true;
      });

    return this.ranker
      .rank(filtered, query.text)
      .slice(0, limit);
  }
}
