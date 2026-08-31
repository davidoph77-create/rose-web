import {
  RoseOSDiagnostics,
  RoseOSRequest,
  RoseOSResponse,
} from "../rose_os";

export type AppBridgeStatus =
  | "idle"
  | "starting"
  | "ready"
  | "stopping"
  | "stopped"
  | "error";

export type AppBridgeConfig = {
  enableAutonomy?: boolean;
  autoStart?: boolean;
};

export type AppBridgeRequest =
  | string
  | RoseOSRequest;

export type AppBridgeResult =
  RoseOSResponse;

export type AppBridgeSnapshot = {
  status: AppBridgeStatus;
  started: boolean;
  diagnostics?: RoseOSDiagnostics;
  lastError?: string;
  generatedAt: string;
};
