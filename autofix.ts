import { join } from "std/path/mod.ts";
import { applyResolutions } from "./apply-resolutions.ts";

interface Config {
  originalProject: string;
  rebaseFrom: string;
  rebaseInto: string;
}

const rebaseContinue = async (repoPath: string): Promise<{
  isFinished: boolean;
}> => {
  const gitAddCommand = new Deno.Command("git", {
    args: ["add", "."],
    cwd: repoPath,
  });
  const rebaseContinueCommand = new Deno.Command("git", {
    args: ["rebase", "--continue"],
    env: {
      GIT_EDITOR: "true",
    },
    cwd: repoPath,
  });

  await gitAddCommand.output();
  const { stdout } = await rebaseContinueCommand.output();
  const output = new TextDecoder().decode(stdout);

  const preparedOutput = output
    .split("\n")
    .map((line) => line.trimEnd());

  const isFinished = preparedOutput
    .filter((line) => line).length <= 0;

  return {
    isFinished,
  }
};

const main = async (): Promise<void> => {
  try {
    const configPath = join(Deno.cwd(), 'config.json');
    const configText = await Deno.readTextFile(configPath);
    const config: Config = JSON.parse(configText);

    const { originalProject } = config;

    let loop = true;
    let index = 2;

    while (loop) {
      const shouldContinue = index % 2 === 0;
      if (shouldContinue) {
        console.log('CONTINUING REBASE')
        const { isFinished } = await rebaseContinue(originalProject);
        if (isFinished) {
          loop = false;
          break;
        }
      } else {
        console.log('APPLYING RESOLUTIONS')
        await applyResolutions();
      }
      index += 1;
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
};

if (import.meta.main) {
  await main();
}
