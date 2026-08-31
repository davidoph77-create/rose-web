import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  MemoryEngine,
} from "./MemoryEngine";

export class MemoryRuntime
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-memory-runtime";
  readonly name =
    "Rose V10 Memory Engine";
  readonly version = "10.0.6";

  private status:
    ModuleStatus = "idle";

  constructor(
    readonly engine =
      new MemoryEngine()
  ) {}

  async initialize() {
    this.status = "ready";
  }

  async start() {
    this.status = "ready";
  }

  async stop() {
    this.status = "stopped";
  }

  getStatus():
    ModuleStatus {
    return this.status;
  }

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.target === this.id ||
      command.name.startsWith(
        "memory."
      )
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    const payload =
      asRecord(
        command.payload
      );

    switch (
      command.name
    ) {
      case "memory.remember":
        return this.engine.remember({
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
        }) as T;

      case "memory.search":
        return this.engine.search({
          text:
            typeof payload.query ===
            "string"
              ? payload.query
              : "",
          limit:
            typeof payload.limit ===
            "number"
              ? payload.limit
              : 10,
        }) as T;

      case "memory.snapshot":
        return this.engine.snapshot() as T;

      case "memory.export":
        return this.engine.exportJSON() as T;

      case "memory.import":
        return {
          imported:
            this.engine.importJSON(
              String(
                payload.json ?? "[]"
              )
            ),
        } as T;

      default:
        throw new Error(
          `Commande mémoire inconnue : ${command.name}`
        );
    }
  }
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
