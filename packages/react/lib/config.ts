// src/configLoader.ts
import type { MonoriseConfig } from '@monorise/base';

let config: MonoriseConfig | null = null;

export async function loadConfig(configPath: string): Promise<MonoriseConfig> {
  try {
    const module = await import(configPath);
    config = module.default as MonoriseConfig;

    if (!config.configPath) {
      throw new Error(
        'Configuration file must export a `customPath` property.',
      );
    }

    return config;
  } catch (error) {
    throw new Error(
      `Failed to load configuration file at ${configPath}: ${(error as Error).message}`,
    );
  }
}

export function getConfig(): MonoriseConfig {
  if (!config) {
    throw new Error(
      'Configuration has not been loaded. Call `loadConfig()` first.',
    );
  }
  return config;
}

export async function getEntityConfig() {
  return await import(getConfig().configPath);
}
