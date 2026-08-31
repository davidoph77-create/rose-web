import {
  MemoryRecord,
  MemorySearchQuery,
} from "./MemoryTypes";

export class MemoryScorer {
  score(
    record: MemoryRecord,
    query: MemorySearchQuery
  ) {
    let score = 0;
    const reasons: string[] = [];

    const text =
      (query.text ?? "")
        .trim()
        .toLowerCase();

    if (text) {
      const haystack =
        JSON.stringify({
          title: record.title,
          content: record.content,
          tags: record.tags,
        }).toLowerCase();

      const terms =
        text.split(/\s+/)
          .filter(Boolean);

      const matches =
        terms.filter(
          (term) =>
            haystack.includes(term)
        );

      if (matches.length > 0) {
        const ratio =
          matches.length /
          Math.max(terms.length, 1);

        score += ratio * 0.55;
        reasons.push(
          `Correspondance texte : ${matches.length}/${terms.length}`
        );
      }
    }

    if (
      query.kinds?.length &&
      query.kinds.includes(record.kind)
    ) {
      score += 0.15;
      reasons.push(
        `Type correspondant : ${record.kind}`
      );
    }

    if (
      query.tags?.length
    ) {
      const matchedTags =
        query.tags.filter(
          (tag) =>
            record.tags.includes(tag)
        );

      if (matchedTags.length > 0) {
        score +=
          Math.min(
            0.15,
            matchedTags.length * 0.05
          );

        reasons.push(
          `Tags correspondants : ${matchedTags.join(", ")}`
        );
      }
    }

    score +=
      Math.min(
        0.1,
        Math.max(0, record.confidence) * 0.1
      );

    const importanceScore = {
      critical: 0.1,
      high: 0.075,
      normal: 0.04,
      low: 0.01,
    }[record.importance];

    score += importanceScore;

    return {
      score:
        Math.min(1, score),
      reasons,
    };
  }
}
