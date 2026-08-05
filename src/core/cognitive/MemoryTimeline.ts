import { MemoryNode } from "./types";

export type TimelineGroup = {
  date: string;
  memories: MemoryNode[];
};

export class MemoryTimeline {
  groupByDay(memories: MemoryNode[]): TimelineGroup[] {
    const groups = new Map<string, MemoryNode[]>();

    memories.forEach((memory) => {
      const date = memory.createdAt.slice(0, 10);
      const current = groups.get(date) ?? [];
      groups.set(date, [...current, memory]);
    });

    return Array.from(groups.entries())
      .map(([date, items]) => ({
        date,
        memories: items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getRecent(
    memories: MemoryNode[],
    limit = 10
  ): MemoryNode[] {
    return [...memories]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      )
      .slice(0, Math.max(1, limit));
  }
}
