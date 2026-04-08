import { runTuiCore } from "./core/app.js";

export async function runTui(): Promise<void> {
  await runTuiCore();
}
