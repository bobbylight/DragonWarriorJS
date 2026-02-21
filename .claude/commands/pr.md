# Create a Pull Request

Create a branch (if needed), commit staged/unstaged changes, push, and open a PR.

## Steps

1. **Check branch status**: Run `git status` and `git branch --show-current`
   - If on `master` or `main`, create a new branch:
     - Analyze the changes to determine a descriptive branch name
     - Use lower-kebab-case (e.g., `add-user-authentication`, `fix-login-bug`)
     - Run `git checkout -b <branch-name>`
   - If already on a feature branch, continue on that branch

2. **Review changes**: Run `git status` and `git diff` to understand what will be committed

3. **Stage and commit**:
   - Stage relevant files (prefer specific files over `git add -A`)
   - Write a commit message using the [conventional commit style](https://www.conventionalcommits.org/en/v1.0.0/)
     - Don't read the conventional commit site/URL if you already know the style
     - Use "!" after the type to indicate a breaking change
     - Use "build(deps)" for dependency bumps
     - Besides dependencies, don't worry too much about adding a scope to the commit type unless it's a larger
       change concentrated on a specific component or area
   - Do NOT run `npm run test` as this project doesn't yet have unit tests
   - Include `Co-Authored-By: Claude <noreply@anthropic.com>` in the commit

4. **Push**: Run `git push -u origin <branch-name>`

5. **Create PR**: Use `gh pr create` with:
   - A concise title matching the commit style
   - A body with `## Summary` (bullet points) and `## Test plan` sections
   - Footer: `🤖 Generated with [Claude Code](https://claude.ai/claude-code)`

If any step fails, report the error and ask how to proceed.
