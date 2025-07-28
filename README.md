# Conflicts Resolver

This project provides utility scripts to automate the resolution of merge conflicts during Git rebase operations. It uses a simplified three-repository approach to handle conflicts efficiently. Built with Deno and TypeScript for modern JavaScript runtime and type safety.

----

PT-BR README: [README_PT-BR.md](README_PT-BR.md)

----

## Overview

The Conflicts Resolver uses a three-repository approach to handle merge conflicts efficiently:

1. **Original Project** - The main repository where you initiated the rebase
2. **Rebase From Repository** - A copy of the repository checked out to the source branch
3. **Rebase Into Repository** - A copy of the repository checked out to the target branch

## Scripts

### 1. `prepare-conflicts.ts`
Copies conflicted files from the "rebase-from" repository to the "rebase-into" repository, overwriting the conflicted versions with the source branch versions. By default, existing files are protected from overwriting. Use the `--overwrite` flag to force overwriting of existing files.

### 2. `apply-resolutions.ts`
Copies resolved files directly from the "rebase-into" repository to the original project, overwriting the conflicted files.

## Configuration

All repository paths are configured in a single `config.json` file:

```json
{
  "originalProject": "/path/to/your/original-project",
  "rebaseFrom": "/path/to/your/rebase-from-repo",
  "rebaseInto": "/path/to/your/rebase-into-repo"
}
```

## Workflow

### Setup
1. **Original Project**: Your main repository where you're performing the rebase
2. **Rebase From Repository**: Clone/copy of your repository, checked out to the source branch
3. **Rebase Into Repository**: Clone/copy of your repository, checked out to the target branch
4. **Update config.json**: Set the correct paths for your repositories

### Conflict Resolution Process

1. **Conflict Occurs**: During a rebase operation, Git encounters merge conflicts
2. **Prepare Conflicts**: Run `deno task prepare` to copy conflicted files from the source branch to the target branch repository (existing files are protected by default)
3. **Resolve Conflicts**: Manually resolve the conflicts in the "rebase-into" repository
4. **Apply Resolutions**: Run `deno task apply` to copy the resolved files directly to the original project

## Usage Example

1. **Start a rebase** in your original project:
   ```bash
   git rebase feature-branch
   ```

2. **When conflicts occur**, prepare the conflicts:
   ```bash
   # Safe mode (default) - protects existing files
   deno task prepare
   
   # Overwrite mode - forces overwriting of existing files
   deno task prepare:overwrite
   ```

3. **Resolve conflicts** in the "rebase-into" repository using your preferred editor

4. **Apply resolutions** to the original project:
   ```bash
   deno task apply
   ```

5. **Continue the rebase**:
   ```bash
   git add .
   git rebase --continue
   ```

## Benefits

- **Centralized Configuration**: All paths in one config file
- **Isolated Conflict Resolution**: Work on conflicts in a separate repository without affecting your main project
- **Automated File Management**: Scripts handle file copying and directory structure maintenance
- **Safe Operations**: Original project remains untouched until you're ready to apply resolutions
- **File Protection**: By default, existing files are protected from accidental overwriting
- **Flexible Overwrite**: Use `--overwrite` flag when you need to force overwrite existing files

## Requirements

- Deno (latest version recommended)
- Git repositories with proper access permissions
- Configured repository paths in `config.json`

## Notes

- Make sure to update the repository paths in `config.json` before use
- The scripts will create necessary directories automatically
- All scripts provide console output to track their operations
- The workflow is now streamlined from 5 steps to 3 steps
- Built with TypeScript for better type safety and developer experience
- Uses Deno's modern APIs for file system operations and process execution

## License

MIT
