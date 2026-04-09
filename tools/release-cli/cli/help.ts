export function printHelp(): void {
  console.log("Release CLI v2");
  console.log("");
  console.log("Commands:");
  console.log("  yarn release:cli release prepare <version>");
  console.log("  yarn release:cli release prepare-revert <version>");
  console.log("  yarn release:cli release apply [version] [--push] [--yes]");
  console.log(
    "  yarn release:cli deploy-web --mode stable|production [--host ...] [--path ...] [--keep ...]",
  );
  console.log(
    "  yarn release:cli build-apk stable|prod [--no-upload] [--upload-url ...]",
  );
  console.log(
    "  yarn release:cli rollback [version] [--host ...] [--path ...]",
  );
}
