import {
  Runtime,
} from "../runtime";
import {
  AgentManager,
} from "./AgentManager";
import {
  RoseAgent,
} from "./AgentTypes";

export class AgentRuntimeBridge {
  constructor(
    private readonly runtime:
      Runtime,
    private readonly manager:
      AgentManager = new AgentManager()
  ) {}

  install(
    agents: RoseAgent[] = []
  ): AgentManager {
    for (
      const agent of agents
    ) {
      this.manager.register(
        agent
      );
    }

    const existing =
      this.runtime
        .getRegistry()
        .get(
          this.manager.id
        );

    if (!existing) {
      this.runtime.register(
        this.manager
      );
    }

    return this.manager;
  }

  getManager():
    AgentManager {
    return this.manager;
  }
}
