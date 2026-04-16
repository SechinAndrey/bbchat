import { tuiStatus, tuiList, tuiBanner } from "../shared/tui.js";

export function printHelp(): void {
  tuiBanner("Release CLI", "command reference");
  tuiStatus("Use one command per run:", "muted");
  tuiList([
    "yarn release:cli release prepare <version>",
    "yarn release:cli release prepare-revert <version>",
    "yarn release:cli release apply [version] [--push] [--yes]",
    "yarn release:cli deploy-web --mode stable|production [--host ...] [--path ...] [--keep ...]",
    "yarn release:cli build-apk stable|production [--no-upload] [--upload-url ...]",
    "yarn release:cli rollback --mode stable|production [version] [--host ...] [--path ...]",
  ]);
}
