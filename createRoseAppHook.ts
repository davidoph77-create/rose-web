import {
  RoseAppHook,
  LegacyHandler,
} from "./RoseAppHook";
import {
  isRoseV10Enabled,
} from "./RoseAppFeatureFlag";
import {
  RoseAppHookConfig,
} from "./AppHookTypes";

export type CreateRoseAppHookOptions =
  Partial<RoseAppHookConfig>;

export function createRoseAppHook<TLegacy = unknown>(
  legacyHandler: LegacyHandler<TLegacy>,
  options: CreateRoseAppHookOptions = {}
) {
  const hook =
    new RoseAppHook(
      legacyHandler,
      {
        enabled:
          options.enabled ??
          isRoseV10Enabled(),
        fallbackToLegacy:
          options.fallbackToLegacy ??
          true,
        enableAutonomy:
          options.enableAutonomy ??
          false,
      }
    );

  return hook;
}
