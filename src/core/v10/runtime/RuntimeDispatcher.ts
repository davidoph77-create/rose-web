import {
  RuntimeEventBus,
} from "./RuntimeEvents";
import {
  RuntimeLogger,
} from "./RuntimeLogger";
import {
  RuntimeRegistry,
} from "./RuntimeRegistry";
import {
  RuntimeState,
} from "./RuntimeState";
import {
  RuntimeCommand,
  RuntimeCommandResult,
} from "./RuntimeTypes";

export class RuntimeDispatcher {
  constructor(
    private readonly registry: RuntimeRegistry,
    private readonly state: RuntimeState,
    private readonly events: RuntimeEventBus,
    private readonly logger: RuntimeLogger
  ) {}

  async dispatch<T = unknown>(
    command: RuntimeCommand
  ): Promise<RuntimeCommandResult<T>> {
    const commandId =
      command.id ??
      `command-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    const startedAt =
      new Date().toISOString();

    this.state.recordCommand();
    this.state.setStatus("running");

    await this.events.emit(
      "command.started",
      {
        commandId,
        name: command.name,
        target: command.target,
      },
      "runtime-dispatcher"
    );

    try {
      const handler =
        this.registry.findHandler({
          ...command,
          id: commandId,
        });

      if (!handler) {
        throw new Error(
          `Aucun module ne peut traiter la commande : ${command.name}`
        );
      }

      if (!handler.invoke) {
        throw new Error(
          `Le module ${handler.id} ne possède pas de méthode invoke().`
        );
      }

      const data =
        await handler.invoke<T>({
          ...command,
          id: commandId,
        });

      this.state.recordSuccess();
      this.state.setStatus("ready");

      const result:
        RuntimeCommandResult<T> = {
        success: true,
        commandId,
        target: handler.id,
        data,
        startedAt,
        completedAt:
          new Date().toISOString(),
      };

      await this.events.emit(
        "command.completed",
        result,
        handler.id
      );

      return result;
    } catch (error) {
      this.state.recordError(error);
      this.state.setStatus("ready");

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      this.logger.error(
        message,
        "runtime-dispatcher",
        command
      );

      const result:
        RuntimeCommandResult<T> = {
        success: false,
        commandId,
        target: command.target,
        error: message,
        startedAt,
        completedAt:
          new Date().toISOString(),
      };

      await this.events.emit(
        "command.error",
        result,
        "runtime-dispatcher"
      );

      return result;
    }
  }
}
