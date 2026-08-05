import {
  MemoryNode,
  RankedMemory,
} from "./types";

export class MemoryRanker {
  rank(
    memories: MemoryNode[],
    query: string
  ): RankedMemory[] {
    const queryWords = this.words(query);

    return memories
      .map((memory) =>
        this.scoreMemory(memory, queryWords)
      )
      .sort((a, b) => b.score - a.score);
  }

  private scoreMemory(
    memory: MemoryNode,
    queryWords: string[]
  ): RankedMemory {
    const reasons: string[] = [];
    let score = 0;

    const searchable = [
      memory.title,
      memory.content,
      memory.category,
      ...memory.tags,
    ]
      .join(" ")
      .toLowerCase();

    const matches = queryWords.filter((word) =>
      searchable.includes(word)
    ).length;

    if (matches > 0) {
      const lexicalScore =
        matches / Math.max(queryWords.length, 1);
      score += lexicalScore * 45;
      reasons.push(
        `${matches} terme(s) de la demande correspondent`
      );
    }

    score += memory.importance * 0.25;

    if (memory.importance >= 80) {
      reasons.push("Souvenir important");
    }

    score += memory.confidence * 15;

    const recency = this.recencyScore(memory.updatedAt);
    score += recency * 10;

    if (recency >= 0.7) {
      reasons.push("Souvenir récent");
    }

    const accessScore = Math.min(memory.accessCount / 10, 1);
    score += accessScore * 5;

    if (memory.relations.length > 0) {
      score += Math.min(memory.relations.length * 1.5, 5);
      reasons.push("Souvenir relié à d’autres connaissances");
    }

    return {
      memory,
      score: Math.round(score * 100) / 100,
      reasons,
    };
  }

  private words(value: string): string[] {
    return value
      .toLowerCase()
      .split(/[^a-zà-ÿ0-9]+/i)
      .filter((word) => word.length >= 3);
  }

  private recencyScore(date: string): number {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return 0;
    }

    const ageInDays =
      (Date.now() - timestamp) / 86_400_000;

    return Math.max(
      0,
      Math.min(1, 1 - ageInDays / 365)
    );
  }
}
