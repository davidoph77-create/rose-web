import {
  Runtime,
} from "../../runtime";
import {
  installBuiltinAgents,
} from "./BuiltinAgentInstaller";

export async function runIntegratedAgentsSelfTest() {
  const runtime =
    new Runtime();

  const {
    manager,
    agents,
  } = installBuiltinAgents(
    runtime,
    {
      memory: async (
        command,
        context
      ) => ({
        ok: true,
        source: "memory-handler",
        payload:
          command.payload,
        context,
      }),
      planner: async (
        command
      ) => ({
        ok: true,
        source: "planner-handler",
        payload:
          command.payload,
      }),
    }
  );

  manager.setContext({
    userId:
      "integrated-agent-test",
    metadata: {
      roseVersion:
        "V10-004D",
    },
  });

  await runtime.start();

  const list =
    await runtime.invoke({
      name: "agent.list",
      target: manager.id,
    });

  const memory =
    await runtime.invoke({
      name: "agent.execute",
      target: manager.id,
      payload: {
        agentId:
          "memory-agent",
        commandName:
          "memory.search",
        payload: {
          query:
            "Rose",
        },
      },
    });

  const planner =
    await runtime.invoke({
      name: "agent.execute",
      target: manager.id,
      payload: {
        agentId:
          "planner-agent",
        commandName:
          "planner.create",
        payload: {
          objective:
            "Tester V10-004D",
        },
      },
    });

  const webSafeFallback =
    await runtime.invoke({
      name: "agent.execute",
      target: manager.id,
      payload: {
        agentId:
          "web-agent",
        commandName:
          "web.search",
        payload: {
          query:
            "test",
        },
      },
    });

  const health =
    runtime.health();

  await runtime.stop();

  return {
    success:
      list.success &&
      memory.success &&
      planner.success &&
      webSafeFallback.success &&
      health.healthy &&
      agents.length === 6,
    list,
    memory,
    planner,
    webSafeFallback,
    health,
  };
}
