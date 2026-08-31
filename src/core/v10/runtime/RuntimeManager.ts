import {
  Runtime,
  roseRuntime,
} from "./Runtime";
import {
  RuntimeAPI,
} from "./RuntimeAPI";

export class RuntimeManager {
  readonly runtime: Runtime;
  readonly api: RuntimeAPI;

  constructor(
    runtime: Runtime = roseRuntime
  ) {
    this.runtime = runtime;
    this.api =
      new RuntimeAPI(runtime);
  }

  start() {
    return this.runtime.start();
  }

  stop() {
    return this.runtime.stop();
  }

  pause() {
    return this.runtime.pause();
  }

  resume() {
    return this.runtime.resume();
  }

  restart() {
    return this.runtime.restart();
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

export const roseRuntimeManager =
  new RuntimeManager();
