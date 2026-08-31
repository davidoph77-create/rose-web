import {
  RuntimeLogEntry,
  RuntimeLogLevel,
} from "./RuntimeTypes";

export class RuntimeLogger {
  private readonly entries: RuntimeLogEntry[] = [];

  constructor(
    private readonly maxEntries = 500
  ) {}

  debug(
    message: string,
    source = "runtime",
    data?: unknown
  ): void {
    this.write("debug", message, source, data);
  }

  info(
    message: string,
    source = "runtime",
    data?: unknown
  ): void {
    this.write("info", message, source, data);
  }

  warn(
    message: string,
    source = "runtime",
    data?: unknown
  ): void {
    this.write("warn", message, source, data);
  }

  error(
    message: string,
    source = "runtime",
    data?: unknown
  ): void {
    this.write("error", message, source, data);
  }

  getEntries(
    level?: RuntimeLogLevel
  ): RuntimeLogEntry[] {
    if (!level) {
      return [...this.entries];
    }

    return this.entries.filter(
      (entry) => entry.level === level
    );
  }

  clear(): void {
    this.entries.length = 0;
  }

  private write(
    level: RuntimeLogLevel,
    message: string,
    source: string,
    data?: unknown
  ): void {
    this.entries.push({
      id: `log-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      level,
      message,
      source,
      data,
      createdAt: new Date().toISOString(),
    });

    if (this.entries.length > this.maxEntries) {
      this.entries.splice(
        0,
        this.entries.length - this.maxEntries
      );
    }
  }
}
