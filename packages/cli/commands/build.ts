import { spawn } from 'node:child_process';
import generateFiles from './utils/generate';

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

export default runBuildCommand;
