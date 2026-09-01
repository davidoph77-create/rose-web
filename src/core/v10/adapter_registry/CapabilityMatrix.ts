import {
  AdapterCapability,
} from "./AdapterTypes";
import {
  resolveAdapter,
} from "./AdapterRegistry";

export type CapabilityMatrixRow = {
  capability: AdapterCapability;
  available: boolean;
  mode: string;
  external: boolean;
  releaseGateRequired: boolean;
  humanApprovalRequired: boolean;
};

const CAPABILITIES: AdapterCapability[] = [
  "calendar",
  "web",
  "business",
  "memory",
  "planning",
  "general",
];

export function buildCapabilityMatrix(): CapabilityMatrixRow[] {
  return CAPABILITIES.map(
    (capability) => {
      const resolution =
        resolveAdapter(capability);

      const adapter =
        resolution.adapter;

      return {
        capability,
        available:
          resolution.found,
        mode:
          adapter?.mode || "disabled",
        external:
          adapter?.external || false,
        releaseGateRequired:
          adapter?.requiresReleaseGate ||
          false,
        humanApprovalRequired:
          adapter?.requiresHumanApproval ||
          false,
      };
    }
  );
}
