import {
  AgentManager,
} from "../agents";
import {
  Runtime,
} from "../runtime";
import {
  AgentScheduler,
} from "./AgentScheduler";
import {
  AgentSupervisor,
  DEFAULT_SUPERVISOR_POLICY,
} from "./AgentSupervisor";
import {
  HeartbeatMonitor,
} from "./HeartbeatMonitor";
import {
  SupervisionHealth,
} from "./SupervisionHealth";
import {
  SupervisorPolicy,
} from "./SupervisionTypes";

export class SupervisionRuntimeBridge {
  readonly heartbeat: HeartbeatMonitor;
  readonly supervisor: AgentSupervisor;
  readonly scheduler: AgentScheduler;
  readonly health: SupervisionHealth;

  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly runtime: Runtime,
    private readonly manager: AgentManager,
    private readonly policy: SupervisorPolicy =
      DEFAULT_SUPERVISOR_POLICY
  ) {
    this.heartbeat =
      new HeartbeatMonitor(
        manager,
        policy
      );

    this.supervisor =
      new AgentSupervisor(
        manager,
        this.heartbeat,
        policy
      );

    this.scheduler =
      new AgentScheduler(
        manager
      );

    this.health =
      new SupervisionHealth(
        this.supervisor
      );
  }

  start(): void {
    if (this.timer) {
      return;
    }

    for (
      const agent of this.manager.getAgents()
    ) {
      this.heartbeat.beat(
        agent.id
      );
    }

    this.timer = setInterval(
      () => {
        void this.tick();
      },
      this.policy.heartbeatIntervalMs
    );
  }

  stop(): void {
    if (this.timer) {
      clearInterval(
        this.timer
      );
      this.timer = undefined;
    }
  }

  beat(agentId: string) {
    return this.heartbeat.beat(
      agentId
    );
  }

  async tick() {
    const report =
      await this.supervisor.inspect();

    await this.runtime.emit(
      "supervision.checked",
      report,
      "v10-supervision"
    );

    return report;
  }

  diagnostics() {
    return {
      policy:
        this.policy,
      pendingTasks:
        this.scheduler.pending(),
      heartbeats:
        this.manager
          .getAgents()
          .map((agent) =>
            this.heartbeat.get(
              agent.id
            )
          ),
    };
  }
}
