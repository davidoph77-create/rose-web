import {
  AutonomyPolicy,
} from "./AutonomyTypes";

export const DEFAULT_AUTONOMY_POLICY: AutonomyPolicy = {
  enabled: true,
  maxCycles: 3,
  requireValidationForExternalActions: true,
  requireValidationForBusinessActions: true,
  requireValidationForCalendarActions: true,
  allowMemoryWrites: true,
  allowGoalProgressUpdates: true,
};

export class AutonomyPolicyManager {
  private policy: AutonomyPolicy;

  constructor(
    initial: AutonomyPolicy =
      DEFAULT_AUTONOMY_POLICY
  ) {
    this.policy = {
      ...initial,
    };
  }

  get(): AutonomyPolicy {
    return {
      ...this.policy,
    };
  }

  update(
    patch: Partial<AutonomyPolicy>
  ): AutonomyPolicy {
    this.policy = {
      ...this.policy,
      ...patch,
    };

    return this.get();
  }

  isActionAllowed(
    capability?: string
  ) {
    if (!this.policy.enabled) {
      return false;
    }

    if (
      capability === "memory"
    ) {
      return this.policy.allowMemoryWrites;
    }

    return true;
  }

  requiresValidation(
    capability?: string
  ) {
    if (
      capability === "calendar"
    ) {
      return this.policy.requireValidationForCalendarActions;
    }

    if (
      capability === "business"
    ) {
      return this.policy.requireValidationForBusinessActions;
    }

    if (
      capability === "web"
    ) {
      return this.policy.requireValidationForExternalActions;
    }

    return false;
  }
}
