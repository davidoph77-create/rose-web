export type AdapterCapability =
  | "calendar"
  | "web"
  | "business"
  | "memory"
  | "planning"
  | "general";

export type AdapterMode =
  | "simulation"
  | "disabled"
  | "real";

export type AdapterDescriptor = {
  id: string;
  capability: AdapterCapability;
  mode: AdapterMode;
  requiresReleaseGate: boolean;
  requiresHumanApproval: boolean;
  external: boolean;
  description: string;
};

export type AdapterResolution = {
  found: boolean;
  adapter?: AdapterDescriptor;
  reason: string;
};
