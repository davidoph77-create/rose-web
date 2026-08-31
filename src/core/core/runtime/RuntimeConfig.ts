export type RuntimeConfig = {
  version: string;
  healthCheckAfterRequest: boolean;
  allowDegradedMode: boolean;
  maxConsecutiveErrors: number;
};

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  version: "9.0.1",
  healthCheckAfterRequest: true,
  allowDegradedMode: true,
  maxConsecutiveErrors: 3,
};
