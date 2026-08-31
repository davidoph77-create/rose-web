import {
  RoseAppHook,
} from "./RoseAppHook";

export async function runAppHookSelfTest() {
  const legacyCalls: string[] = [];

  const hook =
    new RoseAppHook(
      async (input) => {
        legacyCalls.push(
          input.message
        );

        return {
          source: "legacy",
          message: input.message,
        };
      },
      {
        enabled: false,
        fallbackToLegacy: true,
        enableAutonomy: false,
      }
    );

  const legacyResult =
    await hook.run({
      message:
        "Test chemin historique",
    });

  hook.setEnabled(true);

  const v10Result =
    await hook.run({
      message:
        "Organise un plan simple pour tester le hook V10.",
    });

  return {
    success:
      legacyResult.mode ===
        "legacy" &&
      (
        v10Result.mode ===
          "v10" ||
        v10Result.mode ===
          "fallback"
      ),
    legacyResult,
    v10Result,
    legacyCalls,
  };
}
