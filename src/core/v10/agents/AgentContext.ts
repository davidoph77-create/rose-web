import {
  AgentContextValue,
} from "./AgentTypes";

export class AgentContext {
  private value: AgentContextValue = {
    metadata: {},
  };

  set(
    value: Partial<AgentContextValue>
  ): AgentContextValue {
    this.value = {
      ...this.value,
      ...value,
      metadata: {
        ...this.value.metadata,
        ...(value.metadata ?? {}),
      },
    };

    return this.get();
  }

  get(): AgentContextValue {
    return {
      ...this.value,
      metadata: {
        ...this.value.metadata,
      },
    };
  }

  clear(): void {
    this.value = {
      metadata: {},
    };
  }
}
