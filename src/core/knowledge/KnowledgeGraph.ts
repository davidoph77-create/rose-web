import {
  KnowledgeEntity,
  KnowledgeGraphSnapshot,
  KnowledgePath,
  KnowledgeQuery,
  KnowledgeRelation,
  KnowledgeRelationType,
} from "./types";

export class KnowledgeGraph {
  private readonly entities = new Map<string, KnowledgeEntity>();
  private readonly relations = new Map<string, KnowledgeRelation>();

  addEntity(entity: KnowledgeEntity): KnowledgeEntity {
    this.entities.set(entity.id, entity);
    return entity;
  }

  addRelation(relation: KnowledgeRelation): KnowledgeRelation {
    if (
      !this.entities.has(relation.sourceId) ||
      !this.entities.has(relation.targetId)
    ) {
      throw new Error(
        "Impossible d’ajouter une relation entre des entités inexistantes."
      );
    }

    this.relations.set(relation.id, relation);
    return relation;
  }

  getEntity(id: string): KnowledgeEntity | undefined {
    return this.entities.get(id);
  }

  getRelation(id: string): KnowledgeRelation | undefined {
    return this.relations.get(id);
  }

  getEntities(): KnowledgeEntity[] {
    return Array.from(this.entities.values());
  }

  getRelations(): KnowledgeRelation[] {
    return Array.from(this.relations.values());
  }

  findEntityByLabel(label: string): KnowledgeEntity | undefined {
    const normalized = label.trim().toLowerCase();

    return this.getEntities().find((entity) => {
      if (entity.label.toLowerCase() === normalized) {
        return true;
      }

      return entity.aliases.some(
        (alias) => alias.toLowerCase() === normalized
      );
    });
  }

  removeEntity(id: string): boolean {
    const removed = this.entities.delete(id);

    if (!removed) {
      return false;
    }

    for (const [relationId, relation] of this.relations.entries()) {
      if (
        relation.sourceId === id ||
        relation.targetId === id
      ) {
        this.relations.delete(relationId);
      }
    }

    return true;
  }

  removeRelation(id: string): boolean {
    return this.relations.delete(id);
  }

  getNeighbors(
    entityId: string,
    relationTypes?: KnowledgeRelationType[]
  ): KnowledgeEntity[] {
    const ids = new Set<string>();

    for (const relation of this.relations.values()) {
      if (
        relationTypes?.length &&
        !relationTypes.includes(relation.type)
      ) {
        continue;
      }

      if (relation.sourceId === entityId) {
        ids.add(relation.targetId);
      }

      if (relation.targetId === entityId) {
        ids.add(relation.sourceId);
      }
    }

    return Array.from(ids)
      .map((id) => this.entities.get(id))
      .filter(
        (entity): entity is KnowledgeEntity =>
          Boolean(entity)
      );
  }

  search(query: KnowledgeQuery): KnowledgeEntity[] {
    const limit = Math.max(1, Math.min(query.limit ?? 20, 100));
    const text = query.text?.trim().toLowerCase();

    if (query.entityId) {
      return this.getNeighbors(
        query.entityId,
        query.relationTypes
      ).slice(0, limit);
    }

    if (!text) {
      return this.getEntities().slice(0, limit);
    }

    return this.getEntities()
      .filter((entity) => {
        const haystack = [
          entity.label,
          ...entity.aliases,
          JSON.stringify(entity.properties),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(text);
      })
      .slice(0, limit);
  }

  findPaths(
    sourceId: string,
    targetId: string,
    maxDepth = 4
  ): KnowledgePath[] {
    if (
      !this.entities.has(sourceId) ||
      !this.entities.has(targetId)
    ) {
      return [];
    }

    const results: KnowledgePath[] = [];
    const queue: Array<{
      currentId: string;
      entityIds: string[];
      relationIds: string[];
      score: number;
    }> = [
      {
        currentId: sourceId,
        entityIds: [sourceId],
        relationIds: [],
        score: 1,
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) {
        break;
      }

      if (current.relationIds.length >= maxDepth) {
        continue;
      }

      for (const relation of this.relations.values()) {
        let nextId: string | undefined;

        if (relation.sourceId === current.currentId) {
          nextId = relation.targetId;
        } else if (relation.targetId === current.currentId) {
          nextId = relation.sourceId;
        }

        if (!nextId || current.entityIds.includes(nextId)) {
          continue;
        }

        const next = {
          currentId: nextId,
          entityIds: [...current.entityIds, nextId],
          relationIds: [...current.relationIds, relation.id],
          score:
            current.score *
            relation.weight *
            relation.confidence,
        };

        if (nextId === targetId) {
          results.push({
            entityIds: next.entityIds,
            relationIds: next.relationIds,
            score: Math.round(next.score * 10000) / 10000,
          });
        } else {
          queue.push(next);
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  exportSnapshot(version = "1.0.0"): KnowledgeGraphSnapshot {
    return {
      version,
      entities: this.getEntities(),
      relations: this.getRelations(),
      exportedAt: new Date().toISOString(),
    };
  }

  importSnapshot(snapshot: KnowledgeGraphSnapshot): void {
    this.entities.clear();
    this.relations.clear();

    snapshot.entities.forEach((entity) => {
      this.entities.set(entity.id, entity);
    });

    snapshot.relations.forEach((relation) => {
      this.relations.set(relation.id, relation);
    });
  }
}
