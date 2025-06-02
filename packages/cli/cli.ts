#!/usr/bin/env node

import 'tsx';
import 'tsconfig-paths/register.js';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function kebabToPascal(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

async function generateConfigFile(
  configDir: string,
  monoriseOutputDir: string,
): Promise<string> {
  const configOutputPath = path.join(monoriseOutputDir, 'config.ts');
  const initialConfigContent = `
export enum Entity {}
`;
  fs.writeFileSync(configOutputPath, initialConfigContent);

  const files = fs
    .readdirSync(configDir)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts');

  const names = new Set<string>();
  const nameRegex = /^[a-z]+(-[a-z]+)*$/;
  const imports: string[] = [];

  const enumEntries: string[] = [];
  const typeEntries: string[] = [];
  const schemaMapEntries: string[] = [];
  const configEntries: string[] = [];
  const schemaEntries: string[] = [];
  const allowedEntityEntries: string[] = [];
  const entityWithEmailAuthEntries: string[] = [];

  const relativePathToConfigDir = path.relative(monoriseOutputDir, configDir);
  const importPathPrefix = relativePathToConfigDir
    ? `${relativePathToConfigDir}/`
    : './';

  for (const file of files) {
    const fullPath = path.join(configDir, file);
    const module = await import(fullPath);
    const config = module.default;

    if (!nameRegex.test(config.name)) {
      throw new Error(
        `Invalid name format: ${config.name} in ${file}. Must be kebab-case.`,
      );
    }

    if (names.has(config.name)) {
      throw new Error(`Duplicate name found: ${config.name} in ${file}`);
    }
    names.add(config.name);

    const fileName = file.replace(/\.ts$/, '');
    const variableName = kebabToCamel(fileName);
    imports.push(
      `import ${variableName} from '${importPathPrefix}${fileName}';`,
    );

    const enumKey = config.name.toUpperCase().replace(/-/g, '_');
    enumEntries.push(`${enumKey} = '${config.name}'`);
    typeEntries.push(
      `export type ${kebabToPascal(config.name)}Type = z.infer<(typeof ${variableName})['finalSchema']>;`,
    );
    schemaMapEntries.push(
      `[Entity.${enumKey}]: ${kebabToPascal(config.name)}Type;`,
    );

    configEntries.push(`[Entity.${enumKey}]: ${kebabToCamel(config.name)},`);
    schemaEntries.push(
      `[Entity.${enumKey}]: ${kebabToCamel(config.name)}.finalSchema,`,
    );

    allowedEntityEntries.push(`Entity.${enumKey}`);

    if (config.authMethod?.email) {
      entityWithEmailAuthEntries.push(`Entity.${enumKey}`);
    }
  }

  const configOutputContent = `
import type { z } from 'zod';
${imports.join('\n')}

export enum Entity {
  ${enumEntries.join(',\n  ')}
}

${typeEntries.join('\n')}

export interface EntitySchemaMap {
  ${schemaMapEntries.join('\n  ')}
}

const EntityConfig = {
  ${configEntries.join('\n  ')}
};

const FormSchema = {
  ${schemaEntries.join('\n  ')}
};

const AllowedEntityTypes = [
  ${allowedEntityEntries.join(',\n  ')}
];

const EmailAuthEnabledEntities = [${entityWithEmailAuthEntries.join(', ')}];

export {
  EntityConfig,
  FormSchema,
  AllowedEntityTypes,
  EmailAuthEnabledEntities,
};

const config = {
  EntityConfig,
  FormSchema,
  AllowedEntityTypes,
  EmailAuthEnabledEntities,
};

export default config;

declare module '@monorise/base' {
  export enum Entity {
    ${enumEntries.join(',\n    ')}
  }

  ${typeEntries.join('\n  ')}

  export interface EntitySchemaMap {
    ${schemaMapEntries.join('\n    ')}
  }
}
`;

  fs.writeFileSync(configOutputPath, configOutputContent);
  console.log('Successfully generated config.ts!');
  return configOutputPath;
}

async function generateProcessorsFile(
  monoriseOutputDir: string,
): Promise<string> {
  const processorsOutputPath = path.join(monoriseOutputDir, 'processors.ts');
  const processorsContent = `
import CoreFactory from '@monorise/core';
import config from './config';

const coreFactory = new CoreFactory(config);

export const replicationHandler = coreFactory.replicationProcessor;
export const mutualHandler = coreFactory.mutualProcessor;
export const tagHandler = coreFactory.tagProcessor;
export const treeHandler = coreFactory.treeProcessor;
`;
  fs.writeFileSync(processorsOutputPath, processorsContent);
  console.log('Successfully generated processors.ts!');
  return processorsOutputPath;
}

async function generateAppFile(
  monoriseConfig: { customRoutes?: string; configDir: string },
  projectRoot: string,
  monoriseOutputDir: string,
): Promise<string> {
  const appOutputPath = path.join(monoriseOutputDir, 'app.ts');
  const customRoutesPath = monoriseConfig.customRoutes;

  if (!customRoutesPath) {
    throw new Error(
      "monorise.config.ts must define 'customRoutes' (e.g., './src/app') for app.ts generation.",
    );
  }

  const absoluteCustomRoutesPath = path.resolve(projectRoot, customRoutesPath);

  if (
    !fs.existsSync(absoluteCustomRoutesPath) &&
    !fs.existsSync(`${absoluteCustomRoutesPath}.ts`) &&
    !fs.existsSync(`${absoluteCustomRoutesPath}.js`)
  ) {
    throw new Error(
      `Custom routes file not found: '${absoluteCustomRoutesPath}'. Please ensure 'customRoutes' in monorise.config.ts points to a valid file.`,
    );
  }

  let routesModule;
  try {
    routesModule = await import(absoluteCustomRoutesPath);
  } catch (e: any) {
    throw new Error(
      `Failed to load custom routes file at '${absoluteCustomRoutesPath}'. Ensure it's a valid JavaScript/TypeScript module. Error: ${e.message}`,
    );
  }

  const routesExport = routesModule.default;

  if (
    !routesExport ||
    (typeof routesExport !== 'function' && typeof routesExport !== 'object') ||
    routesExport === null ||
    !('get' in routesExport && 'post' in routesExport && 'use' in routesExport)
  ) {
    throw new Error(
      `Custom routes file at '${absoluteCustomRoutesPath}' must default export an instance of Hono (or an object with .get, .post, .use methods).`,
    );
  }

  let relativePathToRoutes = path.relative(
    monoriseOutputDir,
    absoluteCustomRoutesPath,
  );
  relativePathToRoutes = relativePathToRoutes.replace(/\.(ts|js|mjs|cjs)$/, '');

  const appContent = `
import { AppHandler } from '@monorise/core';
import config from './config';
import routes from '${relativePathToRoutes}';

export const handler = AppHandler({
  config,
  routes
});
`;
  fs.writeFileSync(appOutputPath, appContent);
  console.log('Successfully generated app.ts!');
  return appOutputPath;
}

async function generateFiles(): Promise<string> {
  const configFilePathTS = path.resolve('./monorise.config.ts');
  const configFilePathJS = path.resolve('./monorise.config.js');

  let configFilePath: string;
  if (fs.existsSync(configFilePathTS)) {
    configFilePath = configFilePathTS;
  } else if (fs.existsSync(configFilePathJS)) {
    configFilePath = configFilePathJS;
  } else {
    throw new Error(
      'Neither monorise.config.ts nor monorise.config.js found in the root of the project.',
    );
  }

  const projectRoot = path.dirname(configFilePath);
  const monoriseConfigModule = await import(configFilePath);
  const monoriseConfig = monoriseConfigModule.default;

  const configDir = path.resolve(monoriseConfig.configDir);
  const monoriseOutputDir = path.join(projectRoot, '.monorise');

  fs.mkdirSync(monoriseOutputDir, { recursive: true });

  await generateConfigFile(configDir, monoriseOutputDir);
  await generateProcessorsFile(monoriseOutputDir);
  await generateAppFile(monoriseConfig, projectRoot, monoriseOutputDir);

  return configDir;
}

/**
 * Handles the 'dev' command logic.
 * Generates files, sets up file watching, and starts sst dev.
 * @param configDir The directory containing source configuration files to watch.
 */
async function runDevCommand(configDir: string) {
  console.log(`Watching for changes in ${configDir}...`);
  const watcher = chokidar.watch(configDir, {
    ignored: (watchedPath: string) => {
      const fileName = path.basename(watchedPath);
      return (
        fileName === 'index.ts' || // Old name, still ignore in case it exists
        fileName === 'config.ts' || // Generated config file
        fileName === 'processors.ts' || // Generated processors file
        fileName === 'app.ts' || // Generated app file
        fileName.startsWith('.') ||
        watchedPath.endsWith('.js') ||
        watchedPath.endsWith('.jsx') ||
        watchedPath.endsWith('.d.ts')
      );
    },
    persistent: true,
    ignoreInitial: true,
  });

  let sstDevProcess: ReturnType<typeof spawn> | null = null;

  const runSSTDev = () => {
    if (sstDevProcess) {
      console.log('Terminating existing sst dev process...');
      sstDevProcess.kill('SIGTERM');
      sstDevProcess = null;
    }
    console.log('Starting sst dev...');
    sstDevProcess = spawn('npx', ['sst', 'dev'], { stdio: 'inherit' });
    sstDevProcess.on('close', (code) => {
      console.log(`sst dev process exited with code ${code}`);
      sstDevProcess = null;
    });
    sstDevProcess.on('error', (err) => {
      console.error('Failed to start sst dev process:', err);
      sstDevProcess = null;
    });
  };

  watcher.on('add', async (filePath) => {
    console.log(`File ${filePath} has been added. Regenerating...`);
    try {
      await generateFiles();
    } catch (err) {
      console.error('Regeneration failed:', err);
    }
  });

  watcher.on('change', async (filePath) => {
    console.log(`File ${filePath} has been changed. Regenerating...`);
    try {
      await generateFiles();
    } catch (err) {
      console.error('Regeneration failed:', err);
    }
  });

  watcher.on('unlink', async (filePath) => {
    console.log(`File ${filePath} has been removed. Regenerating...`);
    try {
      await generateFiles();
    } catch (err) {
      console.error('Regeneration failed:', err);
    }
  });

  runSSTDev();

  process.on('SIGINT', () => {
    console.log('Monorise dev terminated. Closing watcher and sst dev...');
    watcher.close();
    if (sstDevProcess) {
      sstDevProcess.kill('SIGTERM');
    }
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    console.log('Monorise dev terminated. Closing watcher and sst dev...');
    watcher.close();
    if (sstDevProcess) {
      sstDevProcess.kill('SIGTERM');
    }
    process.exit(0);
  });
}

/**
 * Handles the 'build' command logic.
 * Runs sst build after file generation.
 */
async function runBuildCommand() {
  console.log('Starting sst build...');
  await generateFiles();
  const sstBuildProcess = spawn('npx', ['sst', 'build'], {
    stdio: 'inherit',
  });

  await new Promise<void>((resolve, reject) => {
    sstBuildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('sst build completed successfully.');
        resolve();
      } else {
        reject(new Error(`sst build exited with code ${code}.`));
      }
    });
    sstBuildProcess.on('error', (err) => {
      reject(new Error(`Failed to start sst build process: ${err.message}.`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'dev') {
      const configDir = await generateFiles();
      await runDevCommand(configDir);
    } else if (command === 'build') {
      await runBuildCommand();
    } else {
      console.error('Unknown command. Usage: monorise [dev|build]');
      process.exit(1);
    }
  } catch (err) {
    console.error('Monorise process failed:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Monorise encountered an unhandled error:', err);
  process.exit(1);
});
