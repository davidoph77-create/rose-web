export type RuntimeHookName =
  | "beforeStart"
  | "afterStart"
  | "beforeCommand"
  | "afterCommand"
  | "beforeStop"
  | "afterStop";

export type RuntimeHook = (
  payload?: unknown
) => void | Promise<void>;

export class RuntimeHooks {
  private readonly hooks =
    new Map<RuntimeHookName, RuntimeHook[]>();

  add(
    name: RuntimeHookName,
    hook: RuntimeHook
  ): () => void {
    const current =
      this.hooks.get(name) ?? [];

    this.hooks.set(
      name,
      [...current, hook]
    );

    return () => {
      const list =
        this.hooks.get(name) ?? [];

      this.hooks.set(
        name,
        list.filter(
          (candidate) =>
            candidate !== hook
        )
      );
    };
  }

  async run(
    name: RuntimeHookName,
    payload?: unknown
  ): Promise<void> {
    for (
      const hook of this.hooks.get(name) ?? []
    ) {
      await hook(payload);
    }
  }
}
