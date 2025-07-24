# Conflicts Resolver

This project provides a utility script, `merge-conficts-overwriter.js`, to automate the resolution of recurring merge conflicts in your project files. It is especially useful when you know what the resolved files should look like, but Git keeps generating conflicts for the same files during merges.

## How It Works

1. **Prepare Resolved Files:**
   - As you resolve merge conflicts, place the resolved versions of the files in the root of this project, mirroring the directory structure of your target project.
2. **Run the Script:**
   - The script will scan for files with merge conflicts in your target project (using `git status --porcelain`), and for each conflicting file, it will overwrite it with the corresponding resolved file from this project (if available and non-empty).
3. **Repeat as Needed:**
   - As you encounter new conflicts, add the resolved files to this project and rerun the script.

## How Is This Different from `git rerere`?

[`git rerere`](https://git-scm.com/docs/git-rerere) ("reuse recorded resolution") is a Git feature that helps automatically resolve conflicts that have been resolved before by recording and reapplying your conflict resolutions. However, this script offers a different approach and some unique benefits:

- **Manual, Explicit Control:**
  - With this script, you explicitly provide the resolved files you want to use, ensuring the exact content you want is applied every time, regardless of how the conflict appears.
- **Works Across Branches and Repositories:**
  - You can use this script to apply the same resolution to multiple branches or even different repositories, as long as you have the resolved files.
- **No Internal Git State Required:**
  - `git rerere` relies on Git's internal state and history of conflict resolutions, which can be lost or become inconsistent. This script only needs the resolved files and the target project.
- **Ideal for Recurring, Known Conflicts:**
  - If you know what the resolved files should look like (e.g., generated files, formatting, or boilerplate), this script lets you enforce that state directly.
- **Simple and Transparent:**
  - The process is straightforward: copy resolved files, run the script, and your conflicts are resolved. No need to manage or understand Git's rerere cache.

## Benefits

- **Consistency:** Always applies the exact resolution you want.
- **Portability:** Easily share and reuse resolutions across machines, branches, or teams.
- **Simplicity:** No need to learn or manage advanced Git features.
- **Reliability:** Works even if Git's rerere cache is unavailable or corrupted.

## Usage

1. **Clone this repository** (or copy the script) to a directory of your choice.
2. **Set the target project path:**
   - Edit the `projectPath` variable in `merge-conficts-overwriter.js` to point to the root directory of your target project.
3. **Add resolved files:**
   - Place your resolved files in this directory, following the same folder structure as your target project.
4. **Run the script:**
   - Execute the script with Node.js:
     ```bash
     node merge-conficts-overwriter.js
     ```
5. **Check your target project:**
   - The conflicting files should now be replaced with your resolved versions.

## Example Workflow

1. You have a project at `/Users/kuze/Desktop/git/PATH_TO_PROJECT` with recurring merge conflicts.
2. You resolve a conflict in `src/utils/helpers.js` and copy the resolved file to `conflicts-resolver/src/utils/helpers.js`.
3. Run the script:
   ```bash
   node merge-conficts-overwriter.js
   ```
4. The script overwrites the conflicting file in your project with the resolved version.

## Notes
- The script only overwrites files that are both in conflict and have a corresponding non-empty resolved file in this directory.
- Make sure to update the `projectPath` variable to match your actual project path.
- The script uses Node.js and requires no additional dependencies.

## License
MIT 