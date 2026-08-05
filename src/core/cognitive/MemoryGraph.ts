import {
  MemoryNode,
  MemoryRelation,
  MemoryRelationType,
} from "./types";

export class MemoryGraph {
  private readonly nodes = new Map<string, MemoryNode>();

  add(memory: MemoryNode): MemoryNode {
    this.nodes.set(memory.id, memory);
    return memory;
  }

  get(id: string): MemoryNode | undefined {
    return this.nodes.get(id);
  }

  has(id: string): boolean {
    return this.nodes.has(id);
  }

  getAll(): MemoryNode[] {
    return Array.from(this.nodes.values());
  }

  update(memory: MemoryNode): MemoryNode {
    if (!this.nodes.has(memory.id)) {
      throw new Error(
        `Mémoire introuvable : ${memory.id}`
      );
    }

    this.nodes.set(memory.id, memory);
    return memory;
  }

  remove(id: string): boolean {
    const removed = this.nodes.delete(id);

    if (!removed) {
      return false;
    }

    for (const node of this.nodes.values()) {
      node.relations = node.relations.filter(
        (relation) => relation.targetId !== id
      );
    }

    return true;
  }

  link(
    sourceId: string,
    targetId: string,
    type: MemoryRelationType = "related_to",
    weight = 0.7
  ): void {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);

    if (!source || !target) {
      throw new Error(
        "Impossible de relier deux mémoires inexistantes."
      );
    }

    const relation: MemoryRelation = {
      targetId,
      type,
      weight: this.clamp(weight),
      createdAt: new Date().toISOString(),
    };

    source.relations = [
      ...source.relations.filter(
        (item) =>
          !(
            item.targetId === targetId &&
            item.type === type
          )
      ),
      relation,
    ];

    source.updatedAt = new Date().toISOString();
  }

  getRelated(
    id: string,
    maxDepth = 1
  ): MemoryNode[] {
    const visited = new Set<string>([id]);
    const result: MemoryNode[] = [];
    let frontier = [id];

    for (let depth = 0; depth < maxDepth; depth += 1) {
      const next: string[] = [];

      for (const currentId of frontier) {
        const current = this.nodes.get(currentId);

        if (!current) {
          continue;
        }

        for (const relation of current.relations) {
          if (visited.has(relation.targetId)) {
            continue;
          }

          const related = this.nodes.get(relation.targetId);

          if (related) {
            visited.add(related.id);
            result.push(related);
            next.push(related.id);
          }
        }
      }

      frontier = next;

      if (frontier.length === 0) {
        break;
      }
    }

    return result;
  }

  replaceAll(memories: MemoryNode[]): void {
    this.nodes.clear();

    memories.forEach((memory) => {
      this.nodes.set(memory.id, memory);
    });
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
