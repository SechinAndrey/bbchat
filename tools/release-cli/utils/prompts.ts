import prompts from "prompts";

export async function askYesNo(
  question: string,
  defaultYes = false,
): Promise<boolean> {
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: question,
    initial: defaultYes,
  });

  return confirm ?? defaultYes;
}
