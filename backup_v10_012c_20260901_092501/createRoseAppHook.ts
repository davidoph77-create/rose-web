import {
  RoseAppHook,
  LegacyHandler,
} from "./RoseAppHook";
import {
  isRoseV10Enabled,
} from "./RoseAppFeatureFlag";

export function createRoseAppHook<TLegacy = unknown>(
  legacyHandler: LegacyHandler<TLegacy>
) {
  const hook =
    new RoseAppHook(
      legacyHandler,
      {
        enabled:
          isRoseV10Enabled(),
        fallbackToLegacy: true,
        enableAutonomy: false,
      }
    );

  return hook;
}
