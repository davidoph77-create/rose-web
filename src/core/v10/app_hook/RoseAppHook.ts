import {
  AppBridge,
} from "../app_bridge";
import {
  RoseAppHookConfig,
  RoseAppHookInput,
  RoseAppHookResult,
} from "./AppHookTypes";

export type LegacyHandler<TLegacy = unknown> = (
  input: RoseAppHookInput
) => Promise<TLegacy>;

const DEFAULT_CONFIG: RoseAppHookConfig = {
  enabled: false,
  fallbackToLegacy: true,
  enableAutonomy: false,
};

export class RoseAppHook<TLegacy = unknown> {
  private config: RoseAppHookConfig;
  private readonly bridge: AppBridge;

  constructor(
    private readonly legacyHandler: LegacyHandler<TLegacy>,
    config: Partial<RoseAppHookConfig> = {}
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.bridge = new AppBridge({
      enableAutonomy:
        this.config.enableAutonomy,
    });
  }

  getConfig(): RoseAppHookConfig {
    return {
      ...this.config,
    };
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  updateConfig(
    patch: Partial<RoseAppHookConfig>
  ) {
    this.config = {
      ...this.config,
      ...patch,
    };

    return this.getConfig();
  }

  async run(
    input: RoseAppHookInput
  ): Promise<RoseAppHookResult<TLegacy>> {
    if (!this.config.enabled) {
      const legacy =
        await this.legacyHandler(input);

      return {
        success: true,
        mode: "legacy",
        value: legacy,
      };
    }

    try {
      const response =
        await this.bridge.ask({
          message: input.message,
          metadata: input.metadata,
        });

      if (!response.success) {
        throw new Error(
          "Rose OS a retourné success=false."
        );
      }

      return {
        success: true,
        mode: "v10",
        value: response,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (!this.config.fallbackToLegacy) {
        return {
          success: false,
          mode: "v10",
          value: undefined,
          v10Error: message,
        };
      }

      const legacy =
        await this.legacyHandler(input);

      return {
        success: true,
        mode: "fallback",
        value: legacy,
        v10Error: message,
      };
    }
  }
}
