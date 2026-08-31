import {
  V10ModuleDescriptor,
  V10Status,
} from "../foundation/V10Types";

export interface V10Module {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  initialize(): Promise<void>;
  shutdown?(): Promise<void>;

  getStatus(): V10Status;
  describe(): V10ModuleDescriptor;
}
