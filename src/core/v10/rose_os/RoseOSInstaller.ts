import {
  buildRoseOS,
  RoseOSBuildOptions,
} from "./RoseOSBuilder";
import {
  RoseOSRuntimeModule,
} from "./RoseOSRuntimeModule";

export function installRoseOS(
  options:
    RoseOSBuildOptions = {}
) {
  const built =
    buildRoseOS(
      options
    );

  const module =
    new RoseOSRuntimeModule(
      built.kernel
    );

  if (
    !built.runtime
      .getRegistry()
      .get(module.id)
  ) {
    built.runtime.register(
      module
    );
  }

  return {
    ...built,
    module,
  };
}
