import prompts from "prompts";
import chalk from "chalk";
import { showHelp } from "./help.js";
import {
  runReleasePrepare,
  runReleaseApply,
  runReleaseRollbackPrepare,
} from "../commands/release.js";
import { runDeployWeb } from "../commands/deploy-web.js";
import { runBuildApk } from "../commands/build-apk.js";
import { runRollback } from "../commands/rollback.js";

type ActionType =
  | "help"
  | "prepare"
  | "apply"
  | "rollback-prepare"
  | "deploy"
  | "build"
  | "rollback"
  | "exit";

export async function runTui(): Promise<void> {
  console.clear();
  console.log(chalk.cyan.bold("╔════════════════════════════════════╗"));
  console.log(chalk.cyan.bold("║      Release CLI - Interactive     ║"));
  console.log(chalk.cyan.bold("╚════════════════════════════════════╝"));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await prompts({
      type: "select",
      name: "action",
      message: "Выбери действие",
      choices: [
        { title: "📖 Справка по командам", value: "help" },
        { title: "🏗️  Release prepare", value: "prepare" },
        { title: "✅ Release apply", value: "apply" },
        { title: "↩ Release rollback-prepare", value: "rollback-prepare" },
        { title: "🚀 Deploy web", value: "deploy" },
        { title: "📦 Build APK", value: "build" },
        { title: "⏮️  Rollback", value: "rollback" },
        { title: "❌ Выход", value: "exit" },
      ],
    });

    const action = response.action as ActionType;

    if (action === "exit") {
      console.log(chalk.gray("\nДо свидания!"));
      return;
    }

    if (action === "help") {
      showHelp();
      continue;
    }

    if (action === "prepare") {
      const resp = await prompts([
        {
          type: "text",
          name: "version",
          message: "Версия (X.Y.Z)",
          validate: (val: string) =>
            /^\d+\.\d+\.\d+$/.test(val) ? true : "Неверный формат",
        },
        {
          type: "confirm",
          name: "skipChangelog",
          message: "Пропустить генерацию changelog?",
          initial: false,
        },
      ]);
      runReleasePrepare({
        version: resp.version as string,
        skipChangelog: resp.skipChangelog as boolean,
      });
      continue;
    }

    if (action === "apply") {
      const resp = await prompts([
        {
          type: "text",
          name: "version",
          message: "Версия (X.Y.Z)",
          validate: (val: string) =>
            /^\d+\.\d+\.\d+$/.test(val) ? true : "Неверный формат",
        },
        {
          type: "confirm",
          name: "push",
          message: "Запушить в origin?",
          initial: false,
        },
      ]);
      await runReleaseApply({
        version: resp.version as string,
        push: resp.push as boolean,
        yes: true,
      });
      continue;
    }

    if (action === "rollback-prepare") {
      const resp = await prompts([
        {
          type: "confirm",
          name: "yes",
          message: "Откатить изменения release prepare?",
          initial: false,
        },
      ]);

      await runReleaseRollbackPrepare({
        yes: resp.yes as boolean,
      });
      continue;
    }

    if (action === "deploy") {
      const resp = await prompts([
        {
          type: "select",
          name: "mode",
          message: "Выбери окружение",
          choices: [
            { title: "Stable (тестирование)", value: "stable" },
            { title: "Production", value: "production" },
          ],
        },
        {
          type: "number",
          name: "keep",
          message: "Количество релизов для хранения",
          initial: 5,
        },
      ]);
      runDeployWeb({
        mode: resp.mode as string,
        keep: resp.keep as number,
      });
      continue;
    }

    if (action === "build") {
      const resp = await prompts([
        {
          type: "select",
          name: "env",
          message: "Выбери окружение",
          choices: [
            { title: "Stable", value: "stable" },
            { title: "Production", value: "prod" },
          ],
        },
        {
          type: "confirm",
          name: "noUpload",
          message: "Пропустить загрузку APK?",
          initial: false,
        },
      ]);
      runBuildApk({
        env: resp.env as "stable" | "prod",
        noUpload: resp.noUpload as boolean,
      });
      continue;
    }

    if (action === "rollback") {
      const resp = await prompts([
        {
          type: "text",
          name: "version",
          message: "Версия для отката (пусто = предыдущая)",
          initial: "",
        },
      ]);
      runRollback({
        version: (resp.version as string) || undefined,
      });
      continue;
    }
  }
}
