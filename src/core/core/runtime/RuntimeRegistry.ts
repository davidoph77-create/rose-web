import { CoreStatus } from "../types/core";

export type RuntimeRegisteredModule = {
  id: string;
  name: string;
  getStatus: () => CoreStatus | "unknown";
};

export class RuntimeRegistry {
  private readonly modules = new Map<string, RuntimeRegisteredModule>();

  register(module: RuntimeRegisteredModule): void {
    this.modules.set(module.id, module);
  }

  getAll(): RuntimeRegisteredModule[] {
    return Array.from(this.modules.values());
  }

  clear(): void {
    this.modules.clear();
  }
}
