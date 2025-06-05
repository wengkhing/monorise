import { spawn } from 'node:child_process';
import generateFiles from './utils/generate';

async function runBuildCommand() {
  console.log('Starting Monorise build...');
  await generateFiles();
}

export default runBuildCommand;
