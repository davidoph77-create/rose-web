import {
  CoreModule,
  CoreStatus,
} from "../types/core";

export type PersonalityInput = {
  text: string;
  userName?: string;
};

export class PersonalityEngine
  implements CoreModule<PersonalityInput, string>
{
  readonly id = "personality-engine";
  readonly name = "Personality Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(input: PersonalityInput): Promise<string> {
    this.status = "running";

    try {
      const name = input.userName?.trim();
      return name
        ? `${name}, ${input.text}`.trim()
        : input.text.trim();
    } finally {
      this.status = "ready";
    }
  }
}
