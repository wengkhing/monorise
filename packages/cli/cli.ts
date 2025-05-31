#!/usr/bin/env node

import 'tsx';
import 'tsconfig-paths/register.js';
import runBuildCommand from './commands/build';
import runDevCommand from './commands/dev';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'dev':
        await runDevCommand();
        break;
      case 'build':
        await runBuildCommand();
        break;
      default:
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
