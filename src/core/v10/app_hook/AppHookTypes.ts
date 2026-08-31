export type RoseAppHookMode =
  | "legacy"
  | "v10"
  | "fallback";

export type RoseAppHookConfig = {
  enabled: boolean;
  fallbackToLegacy: boolean;
  enableAutonomy: boolean;
};

export type RoseAppHookInput = {
  message: string;
  metadata?: Record<string, unknown>;
};

export type RoseAppHookResult<TLegacy = unknown> = {
  success: boolean;
  mode: RoseAppHookMode;
  value: unknown | TLegacy;
  v10Error?: string;
};
