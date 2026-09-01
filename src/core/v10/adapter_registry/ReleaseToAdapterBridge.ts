import type {
  ReleaseGateRecord,
} from "../release_gate/ReleaseGateTypes";
import {
  resolveAdapter,
} from "./AdapterRegistry";
import type {
  AdapterCapability,
} from "./AdapterTypes";

export function resolveReleaseToAdapter(
  record: ReleaseGateRecord
) {
  if (
    record.status !==
    "release_confirmed"
  ) {
    return {
      allowed: false,
      adapter: null,
      summary:
        "Release Gate non confirmé : aucun adaptateur ne peut être sélectionné.",
    };
  }

  const capability =
    normalizeCapability(
      record.kind
    );

  const resolution =
    resolveAdapter(capability);

  if (
    !resolution.found ||
    !resolution.adapter
  ) {
    return {
      allowed: false,
      adapter: null,
      summary:
        resolution.reason,
    };
  }

  return {
    allowed: true,
    adapter:
      resolution.adapter,
    summary:
      `Release Gate confirmé. ${resolution.reason} ` +
      `Aucune exécution réelle : mode=${resolution.adapter.mode}.`,
  };
}

function normalizeCapability(
  value: string
): AdapterCapability {
  switch (value) {
    case "calendar":
      return "calendar";
    case "web":
      return "web";
    case "business":
      return "business";
    case "memory":
      return "memory";
    case "planning":
      return "planning";
    default:
      return "general";
  }
}
