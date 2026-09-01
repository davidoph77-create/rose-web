import {
  AdapterCapability,
  AdapterDescriptor,
  AdapterResolution,
} from "./AdapterTypes";

const REGISTRY: AdapterDescriptor[] = [
  {
    id: "calendar-sim-adapter",
    capability: "calendar",
    mode: "simulation",
    requiresReleaseGate: true,
    requiresHumanApproval: true,
    external: true,
    description:
      "Calendar adapter en simulation uniquement.",
  },
  {
    id: "web-sim-adapter",
    capability: "web",
    mode: "simulation",
    requiresReleaseGate: true,
    requiresHumanApproval: true,
    external: true,
    description:
      "Web adapter en simulation uniquement.",
  },
  {
    id: "business-internal-adapter",
    capability: "business",
    mode: "simulation",
    requiresReleaseGate: false,
    requiresHumanApproval: false,
    external: false,
    description:
      "Traitement entreprise interne simulé.",
  },
  {
    id: "memory-internal-adapter",
    capability: "memory",
    mode: "simulation",
    requiresReleaseGate: false,
    requiresHumanApproval: false,
    external: false,
    description:
      "Traitement mémoire interne simulé.",
  },
  {
    id: "planning-internal-adapter",
    capability: "planning",
    mode: "simulation",
    requiresReleaseGate: false,
    requiresHumanApproval: false,
    external: false,
    description:
      "Traitement planning interne simulé.",
  },
  {
    id: "general-internal-adapter",
    capability: "general",
    mode: "simulation",
    requiresReleaseGate: false,
    requiresHumanApproval: false,
    external: false,
    description:
      "Adaptateur générique interne simulé.",
  },
];

export function listAdapters() {
  return [...REGISTRY];
}

export function resolveAdapter(
  capability: AdapterCapability
): AdapterResolution {
  const adapter =
    REGISTRY.find(
      (item) =>
        item.capability === capability
    );

  if (!adapter) {
    return {
      found: false,
      reason:
        `Aucun adaptateur déclaré pour ${capability}.`,
    };
  }

  return {
    found: true,
    adapter,
    reason:
      `Adaptateur ${adapter.id} sélectionné en mode ${adapter.mode}.`,
  };
}
