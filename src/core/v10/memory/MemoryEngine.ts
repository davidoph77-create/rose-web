import {
  MemorySearchQuery,
} from "./MemoryTypes";
import {
  MemoryStore,
} from "./MemoryStore";

export class MemoryEngine {
  readonly version = "10.0.6";

  constructor(
    private readonly store =
      new MemoryStore()
  ) {}

  remember(input: Parameters<
    MemoryStore["upsert"]
  >[0]) {
    return this.store.upsert(
      input
    );
  }

  recall(id: string) {
    return this.store.get(id);
  }

  forget(id: string) {
    return this.store.delete(id);
  }

  search(
    query: MemorySearchQuery
  ) {
    return this.store.search(
      query
    );
  }

  snapshot() {
    return this.store.snapshot();
  }

  exportJSON() {
    return this.store.exportJSON();
  }

  importJSON(
    json: string
  ) {
    return this.store.importJSON(
      json
    );
  }

  getStore() {
    return this.store;
  }
}
