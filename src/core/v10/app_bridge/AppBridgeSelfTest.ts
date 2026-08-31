import {
  AppBridge,
} from "./AppBridge";
import {
  resetRoseOSForTests,
} from "./RoseOSSingleton";

export async function runAppBridgeSelfTest() {
  resetRoseOSForTests();

  const bridge =
    new AppBridge({
      enableAutonomy:
        false,
    });

  await bridge.start();

  const response =
    await bridge.ask(
      "Organise un plan simple pour tester le pont entre App et Rose OS."
    );

  const snapshot =
    bridge.snapshot();

  await bridge.stop();

  return {
    success:
      response.success &&
      snapshot.started &&
      snapshot.status ===
        "ready" &&
      Boolean(
        snapshot.diagnostics
          ?.runtimeHealthy
      ),
    response,
    snapshot,
  };
}
