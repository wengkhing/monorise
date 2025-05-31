import { spawn } from 'node:child_process';
import path from 'node:path';
import chokidar from 'chokidar';
import generateFiles from './utils/generate';

async function runDevCommand() {
  const configDir = await generateFiles();

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

export default runDevCommand;
