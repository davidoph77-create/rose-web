import {
  RoseOSFacade,
} from "../rose_os";
import {
  AppBridgeConfig,
} from "./AppBridgeTypes";

let instance:
  | RoseOSFacade
  | undefined;

let currentConfig:
  AppBridgeConfig = {};

export function configureRoseOS(
  config: AppBridgeConfig
) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
}

export function getRoseOS():
  RoseOSFacade {
  if (!instance) {
    instance =
      new RoseOSFacade({
        enableAutonomy:
          currentConfig
            .enableAutonomy ??
          false,
      });
  }

  return instance;
}

export async function startRoseOS() {
  const rose =
    getRoseOS();

  await rose.start();

  return rose;
}

export async function stopRoseOS() {
  if (!instance) {
    return;
  }

  await instance.stop();
}

export function resetRoseOSForTests() {
  instance = undefined;
  currentConfig = {};
}
