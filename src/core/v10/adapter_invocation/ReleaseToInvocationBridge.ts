import type {
  ReleaseGateRecord,
} from "../release_gate/ReleaseGateTypes";
import {
  resolveReleaseToAdapter,
} from "../adapter_registry/ReleaseToAdapterBridge";
import {
  prepareAdapterInvocation,
  invokeAdapterInSandbox,
} from "./AdapterInvocationSandbox";
import {
  appendAdapterInvocation,
} from "./AdapterInvocationStore";

export async function invokeConfirmedReleaseInSandbox(
  record: ReleaseGateRecord
) {
  const resolved =
    resolveReleaseToAdapter(record);

  if (
    !resolved.allowed ||
    !resolved.adapter
  ) {
    return {
      result: null,
      summary:
        resolved.summary,
    };
  }

  const request =
    prepareAdapterInvocation(
      resolved.adapter,
      record.message,
      record.id
    );

  const result =
    invokeAdapterInSandbox(
      request
    );

  await appendAdapterInvocation(
    result
  );

  return {
    result,
    summary:
      `${resolved.summary} ${result.output}`,
  };
}
