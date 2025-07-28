import { join } from "std/path/mod.ts";

interface Config {
  originalProject: string;
  rebaseFrom: string;
  rebaseInto: string;
}

const getGitConflicts = async (repoPath: string): Promise<string[]> => {
  const command = new Deno.Command("git", {
    args: ["status", "--porcelain"],
    cwd: repoPath,
  });

  const { stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  const conflictStatusCodes = ["UU", "AA", "AU", "UA", "DU", "UD", "DD"];
  return output
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => conflictStatusCodes.includes(line.slice(0, 2)))
    .map((line) => line.slice(3))
    .filter(Boolean);
};

const main = async (): Promise<void> => {
  try {
    // Parse command line arguments
    const args = Deno.args;
    const overwrite = args.includes("--overwrite");
    
    if (overwrite) {
      console.log("⚠️  Overwrite mode enabled - existing files will be overwritten");
    }

    // Read configuration
    const configPath = join(Deno.cwd(), "config.json");
    const configText = await Deno.readTextFile(configPath);
    const config: Config = JSON.parse(configText);

    const { originalProject, rebaseFrom, rebaseInto } = config;

    console.log("Reading conflicts from original project...");
    const conflicts = await getGitConflicts(originalProject);

    if (conflicts.length === 0) {
      console.log("No conflicts found.");
      return;
    }

    console.log(`Found ${conflicts.length} conflicted files.`);
    console.log("Copying source files from rebase-from to rebase-into...");

    for (const conflictFile of conflicts) {
      const fromFile = join(rebaseFrom, conflictFile);
      const toFile = join(rebaseInto, conflictFile);

      try {
        const fileInfo = await Deno.stat(fromFile);
        if (fileInfo.isFile) {
          let targetExists = false;
          try {
            await Deno.stat(toFile);
            targetExists = true;
          } catch {
            targetExists = false;
          }

          if (!targetExists || overwrite) {
            const toDir = join(toFile, "..");
            await Deno.mkdir(toDir, { recursive: true });

            await Deno.copyFile(fromFile, toFile);
            console.log(`✓ Copied: ${conflictFile}${overwrite && targetExists ? " (overwritten)" : ""}`);
          } else {
            console.log(`⏭️  Skipped: ${conflictFile} (already exists)`);
          }
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          console.log(`✗ Source file does not exist: ${conflictFile}`);
        } else {
          console.error(
            `Error copying ${conflictFile}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    }

    console.log(
      "\n✅ All conflicted files have been prepared in rebase-into repository.",
    );
    console.log(
      "📝 Now resolve the conflicts in the rebase-into repository, then run: deno task apply",
    );
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
