#!/usr/bin/env node
import { runCli } from "./release-cli/cli/index.js";
import { tuiFail } from "./release-cli/shared/tui.js";

runCli(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof Error) {
    tuiFail(error.message);
  } else {
    tuiFail("Unknown error");
  }
  process.exit(1);
});
