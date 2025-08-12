import { join } from "std/path/mod.ts";

interface Config {
  originalProject: string;
  rebaseFrom: string;
  rebaseInto: string;
  sourceBranch: string;
  targetBranch: string;
}

const runGitCommand = async (
  repoPath: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> => {
  const command = new Deno.Command("git", { args, cwd: repoPath });
  const { code, stdout, stderr } = await command.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
};

const ensureRepoPathExists = async (repoPath: string): Promise<void> => {
  try {
    const stat = await Deno.stat(repoPath);
    if (!stat.isDirectory) {
      throw new Error(`Path exists but is not a directory: ${repoPath}`);
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw new Error(`Repository path does not exist: ${repoPath}`);
    }
    throw err;
  }
};

const main = async (): Promise<void> => {
  try {
    const configPath = join(Deno.cwd(), "config.json");
    const configText = await Deno.readTextFile(configPath);
    const config: Config = JSON.parse(configText);

    const { rebaseFrom, rebaseInto, sourceBranch, targetBranch } = config;

    await ensureRepoPathExists(rebaseFrom);
    await ensureRepoPathExists(rebaseInto);

    console.log(`Checking out source branch in rebase-from repo...`);
    // Optional: fetch to ensure branch availability
    await runGitCommand(rebaseFrom, ["fetch", "--all"]);
    const checkoutFrom = await runGitCommand(rebaseFrom, [
      "checkout",
      sourceBranch,
    ]);
    if (checkoutFrom.code !== 0) {
      console.error(checkoutFrom.stderr.trim() || checkoutFrom.stdout.trim());
      throw new Error(
        `Failed to checkout branch ${sourceBranch} in ${rebaseFrom}`,
      );
    }
    console.log(`✓ rebase-from -> ${sourceBranch}`);

    console.log(`Checking out target branch in rebase-into repo...`);
    await runGitCommand(rebaseInto, ["fetch", "--all"]);
    const checkoutInto = await runGitCommand(rebaseInto, [
      "checkout",
      targetBranch,
    ]);
    if (checkoutInto.code !== 0) {
      console.error(checkoutInto.stderr.trim() || checkoutInto.stdout.trim());
      throw new Error(
        `Failed to checkout branch ${targetBranch} in ${rebaseInto}`,
      );
    }
    console.log(`✓ rebase-into -> ${targetBranch}`);

    console.log("\n✅ Branches checked out successfully.");
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
