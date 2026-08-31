import {
  RoseOSFacade,
} from "./RoseOSFacade";

export async function runRoseOSSelfTest() {
  const rose =
    new RoseOSFacade({
      enableAutonomy:
        false,
      handlers: {
        web: async (
          command
        ) => ({
          ok: true,
          source:
            "web-test-handler",
          payload:
            command.payload,
        }),
        calendar: async (
          command
        ) => ({
          ok: true,
          source:
            "calendar-test-handler",
          payload:
            command.payload,
        }),
      },
    });

  await rose.start();

  const memory =
    await rose.ask(
      "Retrouve dans ta mémoire les informations sur Rose."
    );

  const planning =
    await rose.ask(
      "Organise un plan pour le projet Rose."
    );

  const diagnostics =
    rose.diagnostics();

  await rose.stop();

  return {
    success:
      memory.success &&
      planning.success &&
      diagnostics.runtimeHealthy &&
      diagnostics.registeredAgents
        .length >= 6,
    memory,
    planning,
    diagnostics,
  };
}
