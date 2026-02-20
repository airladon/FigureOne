# Create PR

Create a pull request from the current branch.

## Input

$ARGUMENTS

The user may provide additional context or instructions for the PR.

## Instructions

### Step 1: Gather context

1. Get the current branch name: `git branch --show-current`.
   - If on `main`, stop and tell the user to check out a feature/bugfix branch first.
2. Fetch latest: `git fetch origin`.
3. Get the commit log for this branch vs main: `git log origin/main..HEAD --oneline`.
   - If there are no commits ahead of main, stop and tell the user there is nothing to open a PR for.
4. Get the full diff: `git diff origin/main...HEAD`.
5. Check if there are unpushed commits: `git status -sb` and compare with remote tracking branch.
6. Check if a PR already exists for this branch: `gh pr view --json number,title,url 2>/dev/null`. If one exists, tell the user and stop.

### Step 2: Propose PR details

Based on the commit log, diff, and any `$ARGUMENTS` the user provided, propose:

- **Base branch**: `main` (default)
- **Title**: A concise title (under 70 characters) summarizing the change
- **Body**: A short summary using this format:

```
## Summary
- <1-3 bullet points describing the change>
```

Present the proposed title, base branch, and body to the user. Ask them to approve or provide overrides for any of the three (title, base branch, body).

**Do not create the PR without explicit user approval.**

### Step 3: Push and create

1. If there are unpushed commits, push the branch: `git push -u origin <branch>`.
2. Create the PR:
   ```
   gh pr create --base <base-branch> --title "<title>" --body "<body>"
   ```
3. Show the PR URL to the user.
