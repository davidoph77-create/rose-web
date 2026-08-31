import { BrainEngine } from "../brain/BrainEngine";
import { EventBus } from "../events/EventBus";
import {
  DEFAULT_RUNTIME_CONFIG,
  RuntimeConfig,
} from "./RuntimeConfig";
import { RuntimeEventBus } from "./RuntimeEvents";
import { RuntimeHealthMonitor } from "./RuntimeHealthMonitor";
import { RuntimeLifecycle } from "./RuntimeLifecycle";
import { RuntimeRegistry } from "./RuntimeRegistry";
import {
  RuntimeHealthReport,
  RuntimeRequest,
  RuntimeResponse,
  RuntimeSnapshot,
} from "./RuntimeTypes";

export class RuntimeManager {
  readonly id = "rose-runtime";
  readonly name = "Rose Core Runtime";
  readonly version = "9.0.1";

  private readonly config: RuntimeConfig;
  private readonly lifecycle = new RuntimeLifecycle();
  private readonly registry = new RuntimeRegistry();
  private readonly runtimeEvents = new RuntimeEventBus();

  private eventBus: EventBus;
  private brain: BrainEngine;
  private healthMonitor: RuntimeHealthMonitor;

  constructor(config: Partial<RuntimeConfig> = {}) {
    this.config = { ...DEFAULT_RUNTIME_CONFIG, ...config };
    this.eventBus = new EventBus();
    this.brain = new BrainEngine(this.eventBus);
    this.registerModules();
    this.healthMonitor = new RuntimeHealthMonitor(this.registry);
  }

  async boot(): Promise<RuntimeHealthReport> {
    if (this.lifecycle.getStatus() === "ready") {
      return this.health();
    }

    this.lifecycle.setStatus("booting");
    await this.runtimeEvents.publish("runtime.booting", { version: this.version });

    try {
      await this.brain.initialize();
      this.lifecycle.setStatus("ready");
      this.lifecycle.resetErrors();

      const report = this.health();

      if (!report.healthy && this.config.allowDegradedMode) {
        this.lifecycle.setStatus("degraded");
        await this.runtimeEvents.publish("runtime.degraded", report);
      }

      await this.runtimeEvents.publish("runtime.ready", { health: report });
      return report;
    } catch (error) {
      this.lifecycle.recordError(error);
      this.lifecycle.setStatus("error");
      await this.runtimeEvents.publish("runtime.error", {
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async process(request: RuntimeRequest): Promise<RuntimeResponse> {
    if (
      this.lifecycle.getStatus() === "stopped" ||
      this.lifecycle.getStatus() === "error"
    ) {
      await this.boot();
    }

    this.lifecycle.setStatus("running");
    this.lifecycle.recordRequest();

    await this.runtimeEvents.publish("runtime.request.started", {
      message: request.message,
    });

    try {
      const output = await this.brain.execute(request);
      this.lifecycle.setStatus("ready");

      const health = this.health();

      await this.runtimeEvents.publish("runtime.request.completed", {
        success: output.success,
      });

      return {
        output,
        health,
        runtime: this.snapshot(),
      };
    } catch (error) {
      this.lifecycle.recordError(error);

      this.lifecycle.setStatus(
        this.lifecycle.getErrorCount() >= this.config.maxConsecutiveErrors
          ? "degraded"
          : "ready"
      );

      await this.runtimeEvents.publish("runtime.error", {
        message: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  health(): RuntimeHealthReport {
    const report = this.healthMonitor.check(this.lifecycle.getStatus());
    void this.runtimeEvents.publish("runtime.health.checked", report);
    return report;
  }

  snapshot(): RuntimeSnapshot {
    return this.lifecycle.snapshot(this.version);
  }

  async restart(): Promise<RuntimeHealthReport> {
    await this.shutdown();

    this.eventBus = new EventBus();
    this.brain = new BrainEngine(this.eventBus);

    this.registry.clear();
    this.registerModules();
    this.healthMonitor = new RuntimeHealthMonitor(this.registry);

    return this.boot();
  }

  async shutdown(): Promise<void> {
    this.lifecycle.setStatus("shutting_down");
    await this.runtimeEvents.publish("runtime.shutting_down", {});
    this.lifecycle.setStatus("stopped");
    await this.runtimeEvents.publish("runtime.stopped", {});
  }

  getBrain(): BrainEngine {
    return this.brain;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getRuntimeEvents(): RuntimeEventBus {
    return this.runtimeEvents;
  }

  private registerModules(): void {
    this.registry.register({
      id: this.brain.id,
      name: this.brain.name,
      getStatus: () => this.brain.getStatus(),
    });

    this.registry.register({
      id: "planner-engine",
      name: "Planner Engine",
      getStatus: () => this.brain.getPlanner().getStatus(),
    });

    this.registry.register({
      id: "goal-engine",
      name: "Goal Engine",
      getStatus: () => this.brain.getGoals().getStatus(),
    });

    this.registry.register({
      id: "knowledge-graph-engine",
      name: "Knowledge Graph Engine",
      getStatus: () => this.brain.getKnowledgeGraph().getStatus(),
    });

    this.registry.register({
      id: "cognitive-memory-engine",
      name: "Cognitive Memory Engine",
      getStatus: () => this.brain.getCognitiveMemory().getStatus(),
    });

    this.registry.register({
      id: "agent-manager",
      name: "Agent Manager",
      getStatus: () => this.brain.getAgents().getStatus(),
    });
  }
}
