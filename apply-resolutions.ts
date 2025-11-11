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

  const conflictStatusCodes = ['UU', 'AA', 'AU', 'UA', 'DU', 'UD', 'DD'];
  return output
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => conflictStatusCodes.includes(line.slice(0, 2)))
    .map(line => line.slice(3))
    .filter(Boolean);
};

export const applyResolutions = async (): Promise<void> => {
  try {
    // Read configuration
    const configPath = join(Deno.cwd(), 'config.json');
    const configText = await Deno.readTextFile(configPath);
    const config: Config = JSON.parse(configText);

    const { originalProject, rebaseInto } = config;

    console.log('Reading conflicts from original project...');
    const conflicts = await getGitConflicts(originalProject);

    if (conflicts.length === 0) {
      console.log('No conflicts found.');
      return;
    }

    console.log(`Found ${conflicts.length} conflicted files.`);
    console.log('Applying resolutions from rebase-into to original project...');

    for (const conflictFile of conflicts) {
      const fromFile = join(rebaseInto, conflictFile);
      const toFile = join(originalProject, conflictFile);

      try {
        const fileInfo = await Deno.stat(fromFile);
        if (fileInfo.isFile) {
          // Ensure target directory exists
          const toDir = join(toFile, '..');
          await Deno.mkdir(toDir, { recursive: true });

          await Deno.copyFile(fromFile, toFile);
          console.log(`✓ Applied: ${conflictFile}`);
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          console.log(`✗ Resolved file does not exist: ${conflictFile}`);
        } else {
          console.error(`Error applying ${conflictFile}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }

    console.log('\n✅ All resolutions have been applied to the original project.');
    console.log('🚀 You can now continue with: git add . && git rebase --continue');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
};

const main = async (): Promise<void> => {
  return await applyResolutions();
};

if (import.meta.main) {
  await main();
} 
