import {
  V10Module,
} from "../contracts/ModuleContract";
import {
  V10ModuleDescriptor,
} from "./V10Types";

export class V10ModuleRegistry {
  private readonly modules =
    new Map<string, V10Module>();

  register(module: V10Module): void {
    this.modules.set(module.id, module);
  }

  unregister(id: string): boolean {
    return this.modules.delete(id);
  }

  get(id: string):
    | V10Module
    | undefined {
    return this.modules.get(id);
  }

  getAll(): V10Module[] {
    return Array.from(
      this.modules.values()
    );
  }

  describeAll():
    V10ModuleDescriptor[] {
    return this.getAll().map(
      (module) => module.describe()
    );
  }

  clear(): void {
    this.modules.clear();
  }
}
