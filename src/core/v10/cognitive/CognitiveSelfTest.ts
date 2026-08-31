import {
  Runtime,
} from "../runtime";
import {
  installBuiltinAgents,
} from "../agents/builtin";
import {
  installCognitiveLayer,
} from "./CognitiveInstaller";

export async function runCognitiveSelfTest() {
  const runtime =
    new Runtime();

  const {
    manager,
  } = installBuiltinAgents(
    runtime,
    {
      memory: async (
        command
      ) => ({
        source:
          "memory-handler",
        payload:
          command.payload,
      }),

      planner: async (
        command
      ) => ({
        source:
          "planner-handler",
        payload:
          command.payload,
      }),

      calendar: async (
        command
      ) => ({
        source:
          "calendar-handler",
        payload:
          command.payload,
      }),
    }
  );

  const {
    cognitive,
  } = installCognitiveLayer(
    runtime,
    manager
  );

  await runtime.start();

  const memory =
    await runtime.invoke({
      name:
        "cognitive.route",
      target:
        cognitive.id,
      payload: {
        message:
          "Rose, retrouve dans ta mémoire mon projet.",
      },
    });

  const planning =
    await runtime.invoke({
      name:
        "cognitive.route",
      target:
        cognitive.id,
      payload: {
        message:
          "Organise mon objectif en plusieurs étapes.",
      },
    });

  const calendar =
    await runtime.invoke({
      name:
        "cognitive.route",
      target:
        cognitive.id,
      payload: {
        message:
          "Prépare mon rendez-vous dans l'agenda demain.",
      },
    });

  const health =
    runtime.health();

  await runtime.stop();

  return {
    success:
      memory.success &&
      planning.success &&
      calendar.success &&
      health.healthy,
    memory,
    planning,
    calendar,
    health,
  };
}
