/*
Merge conflicts overwriter

This file is used to resolve merge conflicts that keep happening in the the same files. We know what our files should look like after the merge, 
but git keeps comming up with different conflicts for the same files.
That's where this file comes in. It's a javascript file that will be run to replace the conflicting files with the correct ones.

How it works:

1. As we start to resolve merge conflicts, we are going to add the resolved files in the root of the project following THE SAME STRUCTURE as the target project
2. We are going to run this file, which will read the root of the project and replace the conflicting files with the correct ones in the project
3. As we continue the merge conflicts, we will add the resolved files in the root of the project again and so on.
*/

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async () => {
  const resolvedPath = __dirname;
  const projectPath = '/Users/kuze/Desktop/git/PATH_TO_PROJECT';

  const getProjectGitStatus = async (projectPath) => {
    const { stdout, stderr } = await exec(
      `git status --porcelain`,
      { cwd: projectPath },
    );

    console.log(stdout);

    return stdout;
  };

  const gitStatus = await getProjectGitStatus(projectPath);
  const gitStatusFiles = gitStatus.split('\n');

  // Extract file paths with conflicts from the git status --porcelain output
  const conflictStatusCodes = ['UU', 'AA', 'AU', 'UA', 'DU', 'UD', 'DD'];
  const gitConflictsOutput = gitStatusFiles
    .map(line => line.trimEnd())
    .filter(line => conflictStatusCodes.includes(line.slice(0, 2)))
    .map(line => line.slice(3)); // file path starts at index 3

  // Check if the "resolved" folder exists
  if (!fs.existsSync(resolvedPath)) {
    console.log('The "resolved" folder does not exist. Exiting...');
    process.exit(1);
  }

  // Loop through each file in the list of conflicts
  for (const fileWithConflict of gitConflictsOutput) {
    // Get the path of the resolved file (mirrored structure)
    const resolvedFilePath = path.join(resolvedPath, fileWithConflict);
    const projectFilePath = path.join(projectPath, fileWithConflict);

    // Check if the resolved file exists
    if (fs.existsSync(resolvedFilePath)) {
      // Read the resolved file
      const fileContent = fs.readFileSync(resolvedFilePath, 'utf-8');
      // Check if the file exists in the project
      if (fs.existsSync(projectFilePath)) {

        const isFileContentEmpty = fileContent.trim().length === 0;

        if (!isFileContentEmpty) {
          // Replace the file with the resolved file
          fs.writeFileSync(projectFilePath, fileContent);
          console.log(`File ${fileWithConflict} has been resolved`);
        } else {
          console.log(`File ${fileWithConflict} was empty, skipping...`);
        }
      } else {
        console.log(`File ${fileWithConflict} does not exist in the project`);
      }
    } else {
      console.log(`Resolved file for ${fileWithConflict} does not exist in the resolved folder`);
    }
  }

  console.log('All conflicts have been resolved!');
})();
