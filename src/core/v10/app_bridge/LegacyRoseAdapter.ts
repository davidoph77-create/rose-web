import {
  AppBridge,
} from "./AppBridge";

export type LegacyRoseAdapterOptions = {
  onAnswer?: (
    text: string,
    raw: unknown
  ) => void;
  onError?: (
    message: string,
    error: unknown
  ) => void;
};

export class LegacyRoseAdapter {
  constructor(
    private readonly bridge:
      AppBridge,
    private readonly options:
      LegacyRoseAdapterOptions = {}
  ) {}

  async sendMessage(
    message: string
  ) {
    try {
      const response =
        await this.bridge.ask({
          message,
        });

      const text =
        this.extractText(
          response
        );

      this.options.onAnswer?.(
        text,
        response
      );

      return {
        text,
        raw: response,
      };
    } catch (error) {
      const messageText =
        error instanceof Error
          ? error.message
          : String(error);

      this.options.onError?.(
        messageText,
        error
      );

      throw error;
    }
  }

  private extractText(
    response: any
  ): string {
    const result =
      response?.result;

    if (
      typeof result ===
      "string"
    ) {
      return result;
    }

    if (
      result &&
      typeof result.message ===
        "string"
    ) {
      return result.message;
    }

    if (
      result &&
      Array.isArray(
        result.results
      )
    ) {
      return JSON.stringify(
        result.results
      );
    }

    return JSON.stringify(
      result ?? response
    );
  }
}
