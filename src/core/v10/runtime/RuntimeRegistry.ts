import {
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "./RuntimeTypes";

export class RuntimeRegistry {
  private readonly modules =
    new Map<string, UnifiedRuntimeModule>();

  register(module: UnifiedRuntimeModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(
        `Module déjà enregistré : ${module.id}`
      );
    }

    this.modules.set(module.id, module);
  }

  replace(module: UnifiedRuntimeModule): void {
    this.modules.set(module.id, module);
  }

  unregister(id: string): boolean {
    return this.modules.delete(id);
  }

  get(id: string):
    | UnifiedRuntimeModule
    | undefined {
    return this.modules.get(id);
  }

  getAll(): UnifiedRuntimeModule[] {
    return Array.from(
      this.modules.values()
    );
  }

  findHandler(
    command: RuntimeCommand
  ): UnifiedRuntimeModule | undefined {
    if (command.target) {
      return this.modules.get(command.target);
    }

    return this.getAll().find(
      (module) =>
        module.canHandle?.(command) === true
    );
  }

  size(): number {
    return this.modules.size;
  }

  clear(): void {
    this.modules.clear();
  }
}
