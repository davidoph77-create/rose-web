import {
  AgentHandler,
} from "../agents/builtin";
import {
  MemoryEngine,
} from "./MemoryEngine";

export function createMemoryAgentHandler(
  engine: MemoryEngine
): AgentHandler {
  return async (
    command
  ) => {
    const payload =
      asRecord(
        command.payload
      );

    switch (
      command.name
    ) {
      case "memory.remember":
      case "memory.request": {
        if (
          payload.action ===
          "remember"
        ) {
          return engine.remember({
            kind:
              typeof payload.kind ===
              "string"
                ? payload.kind
                : "note",
            title:
              typeof payload.title ===
              "string"
                ? payload.title
                : undefined,
            content:
              payload.content,
            tags:
              Array.isArray(
                payload.tags
              )
                ? payload.tags.filter(
                    (item) =>
                      typeof item ===
                      "string"
                  )
                : [],
            importance:
              payload.importance ===
                "critical" ||
              payload.importance ===
                "high" ||
              payload.importance ===
                "low"
                ? payload.importance
                : "normal",
            confidence:
              typeof payload.confidence ===
              "number"
                ? payload.confidence
                : 0.8,
            metadata:
              asRecord(
                payload.metadata
              ),
          });
        }

        return engine.search({
          text:
            typeof payload.message ===
            "string"
              ? payload.message
              : typeof payload.query ===
                "string"
                ? payload.query
                : "",
          limit: 5,
        });
      }

      case "memory.search":
        return engine.search({
          text:
            typeof payload.query ===
            "string"
              ? payload.query
              : "",
          kinds:
            Array.isArray(
              payload.kinds
            )
              ? payload.kinds.filter(
                  (item) =>
                    typeof item ===
                    "string"
                )
              : undefined,
          tags:
            Array.isArray(
              payload.tags
            )
              ? payload.tags.filter(
                  (item) =>
                    typeof item ===
                    "string"
                )
              : undefined,
          minConfidence:
            typeof payload.minConfidence ===
            "number"
              ? payload.minConfidence
              : undefined,
          limit:
            typeof payload.limit ===
            "number"
              ? payload.limit
              : 10,
        });

      case "memory.get":
        return engine.recall(
          String(
            payload.id ?? ""
          )
        );

      case "memory.forget":
        return {
          deleted:
            engine.forget(
              String(
                payload.id ?? ""
              )
            ),
        };

      case "memory.snapshot":
        return engine.snapshot();

      default:
        return {
          available: true,
          command:
            command.name,
          message:
            "Commande mémoire non reconnue.",
        };
    }
  };
}

function asRecord(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      any
    >;
  }

  return {};
}
