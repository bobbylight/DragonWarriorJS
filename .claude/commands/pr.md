# Create a Pull Request

Create a branch (if needed), commit staged/unstaged changes, push, and open/update a PR.

## Steps

1. **Check branch status**: Run `git status` and `git branch --show-current`
   - If on `master` or `main`, create a new branch:
     - Analyze the changes to determine a descriptive branch name
     - Use lower-kebab-case (e.g., `add-user-authentication`, `fix-login-bug`)
     - Run `git checkout -b <branch-name>`
   - If already on a feature branch, continue on that branch

2. **Fix formatting errors** by running `npm run lint:fix`. If there are any failures,
   stop here and let the user fix them.

3. **Review changes**: Run `git status` and `git diff` to understand what will be committed

4. **Stage and commit**:
   - Stage relevant files (prefer specific files over `git add -A`)
   - Determine the commit strategy:
     - If the feature branch has no prior commits: create a new commit
     - If the feature branch has a prior commit and a draft PR exists (`gh pr view --json isDraft`): amend the existing commit (`git commit --amend`)
     - If the feature branch has a prior commit and no PR exists, or the PR is not in draft: create a new commit
   - Write a commit message (or update the existing one if needed) using the [conventional commit style](https://www.conventionalcommits.org/en/v1.0.0/)
     - Don't read the conventional commit site/URL if you already know the style
     - Use "!" after the type to indicate a breaking change
     - Use "build(deps)" for dependency bumps
     - Besides dependencies, don't worry too much about adding a scope to the commit type unless it's a larger
       change concentrated on a specific component or area
   - Do NOT run `npm run test`; let the CI run it for you
   - Include `Co-Authored-By: Claude <noreply@anthropic.com>` in the commit message

5. **Push**:
   - If the commit was amended: `git push --force-with-lease`
   - Otherwise: `git push -u origin <branch-name>`

6. **Create or update PR**:
   - Check if a PR already exists for this branch with `gh pr view`
   - If no PR exists: use `gh pr create` with the title, body, and labels below
     - When creating a new PR, create it as a draft
   - If a PR exists: use `gh pr edit` to update the title, body, and labels
   - Title: concise, matching the commit style
   - Body: formatted using this repo's PR template (`.github/PULL_REQUEST_TEMPLATE.md`),
     with an additional footer: `🤖 Generated with [Claude Code](https://claude.ai/claude-code)`
   - Labels — add any that are relevant:
     - `bug`, `build`, `ci/cd`, `dependencies`, `enhancement`, `refactor`
     - Only add a `tests` label if the PR is *only* adding test coverage

If any step fails, report the error and ask how to proceed.
