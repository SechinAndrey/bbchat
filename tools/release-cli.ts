#!/usr/bin/env node
import { runCli } from "./release-cli/cli/index.js";

runCli(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`FAIL: ${error.message}`);
  } else {
    console.error("FAIL: Unknown error");
  }
  process.exit(1);
});
