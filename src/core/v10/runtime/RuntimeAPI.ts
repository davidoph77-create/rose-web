import {
  Runtime,
} from "./Runtime";
import {
  RuntimeCommand,
  RuntimeEventHandler,
  RuntimeEventName,
  UnifiedRuntimeModule,
} from "./RuntimeTypes";

export class RuntimeAPI {
  constructor(
    private readonly runtime: Runtime
  ) {}

  register(
    module: UnifiedRuntimeModule
  ): void {
    this.runtime.register(module);
  }

  unregister(
    moduleId: string
  ): boolean {
    return this.runtime.unregister(
      moduleId
    );
  }

  emit<T = unknown>(
    name: RuntimeEventName,
    payload: T,
    source = "runtime-api"
  ) {
    return this.runtime.emit(
      name,
      payload,
      source
    );
  }

  subscribe<T = unknown>(
    name: RuntimeEventName | "*",
    handler: RuntimeEventHandler<T>
  ): () => void {
    return this.runtime.subscribe(
      name,
      handler
    );
  }

  invoke<T = unknown>(
    command: RuntimeCommand
  ) {
    return this.runtime.invoke<T>(
      command
    );
  }

  health() {
    return this.runtime.health();
  }

  state() {
    return this.runtime.snapshot();
  }

  diagnostics() {
    return this.runtime.diagnostics();
  }
}
