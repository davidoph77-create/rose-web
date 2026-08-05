import { KnowledgeGraph } from "./KnowledgeGraph";
import {
  KnowledgeEntity,
  KnowledgePath,
} from "./types";

export type KnowledgeReasoningResult = {
  answer: string;
  paths: KnowledgePath[];
  entities: KnowledgeEntity[];
  confidence: number;
};

export class KnowledgeReasoner {
  constructor(private readonly graph: KnowledgeGraph) {}

  explainConnection(
    sourceId: string,
    targetId: string
  ): KnowledgeReasoningResult {
    const source = this.graph.getEntity(sourceId);
    const target = this.graph.getEntity(targetId);

    if (!source || !target) {
      return {
        answer:
          "Je ne possède pas encore assez d’informations pour expliquer ce lien.",
        paths: [],
        entities: [],
        confidence: 0,
      };
    }

    const paths = this.graph.findPaths(
      sourceId,
      targetId,
      4
    );

    if (paths.length === 0) {
      return {
        answer:
          `${source.label} et ${target.label} sont présents dans le graphe, ` +
          "mais aucune relation exploitable n’a encore été trouvée.",
        paths: [],
        entities: [source, target],
        confidence: 0.3,
      };
    }

    const bestPath = paths[0];
    const entities = bestPath.entityIds
      .map((id) => this.graph.getEntity(id))
      .filter(
        (entity): entity is KnowledgeEntity =>
          Boolean(entity)
      );

    return {
      answer:
        `J’ai trouvé un lien entre ${source.label} et ${target.label} ` +
        `en passant par ${entities
          .map((entity) => entity.label)
          .join(" → ")}.`,
      paths,
      entities,
      confidence: Math.min(1, bestPath.score),
    };
  }
}
