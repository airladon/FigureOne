# Merge PR

Review, test, and merge a pull request into main.

## Input

$ARGUMENTS

The user may provide a PR number, a PR URL, or nothing (in which case use the current branch's PR).

## Instructions

Follow these phases in order. Stop and report if any phase fails.

---

### Phase 1: Identify the PR

1. If `$ARGUMENTS` contains a PR number or URL, use that. Otherwise, detect the PR for the current branch with `gh pr view --json number,title,headRefName,baseRefName,body`.
2. **The PR must target `main`.** If it does not, stop and tell the user this skill is only for PRs merging into main.
3. Save the PR number, branch name, title, and body for later use.

---

### Phase 2: Checkout and prepare

1. Stash any uncommitted changes in the current working tree (`git stash --include-untracked` — only if there are changes).
2. Fetch latest from origin: `git fetch origin`.
3. Check out the PR branch: `git checkout <branch>` and `git pull origin <branch>`.
4. Verify the branch is up to date with its remote tracking branch.

---

### Phase 3: Code review

1. Get the diff against main: `git diff origin/main...HEAD`.
2. Read the full file context for every file that appears in the diff.
3. Review the changes against these categories:

| Category | What to look for |
|---|---|
| **Correctness** | Logic errors, off-by-one bugs, race conditions, wrong assumptions, type mismatches, null/undefined risks |
| **Security** | Injection (XSS, SQL, command), secrets in code, unsafe deserialization, improper auth/authz |
| **Performance** | Unnecessary allocations, O(n^2) where O(n) is possible, missing memoization, layout thrashing |
| **Error handling** | Missing try/catch, swallowed errors, unhelpful messages, unhandled promise rejections |
| **Readability** | Unclear naming, overly clever code, missing context for non-obvious logic, inconsistent style |
| **Maintainability** | Tight coupling, hidden side effects, magic numbers/strings, DRY violations |

4. Classify each finding as:
   - **Critical**: Bugs, security vulnerabilities, data loss risks
   - **Warning**: Performance issues, poor error handling, maintainability concerns
   - **Suggestion**: Style, readability, minor improvements

5. Present the review results:
   - One-line summary: `## Review: <N> files, <M> findings`
   - Findings grouped by file with category, line numbers, and description
   - Summary with counts by severity

---

### Phase 4: Run tests

Ensure the `figureone_dev` Docker container is running. Check with `docker ps --filter name=figureone_dev --format '{{.Names}}'`. If not running, start it:

```
docker run -d --rm \
  -v $(pwd):/opt/app \
  --name figureone_dev \
  figureone_dev \
  tail -f /dev/null
```

Run each test step sequentially inside the container. **All must pass to proceed.** Stop at the first failure.

1. **Lint**: `docker exec figureone_dev npm run lint`
2. **TypeScript**: `docker exec figureone_dev npm run tsc`
3. **Unit tests**: `docker exec figureone_dev npm run jest`
4. **Browser tests**: `docker exec figureone_dev npm run browser`

Present a summary of test results:
```
## Test Results
- Lint: PASS/FAIL
- TypeScript: PASS/FAIL
- Unit tests: PASS/FAIL
- Browser tests: PASS/FAIL
```

---

### Phase 5: Decision checkpoint

Present the full results to the user:
- Code review summary (number of critical/warning/suggestion findings)
- Test results summary
- If there are any **critical** findings, recommend against merging

Then ask the user:
1. Whether to proceed with the merge (approve or reject)
2. If approved, what type of version bump: **patch**, **minor**, or **major**

**Do not proceed past this point without explicit user approval.**

---

### Phase 6: Version bump and changelog

1. Read `package.json` and extract the current version.
2. Increment the version according to the user's choice (patch/minor/major).
3. Update the `"version"` field in `package.json`.
4. Read `docs/changelog.md` and add a new entry at the top (below the `# Releases` header), matching the existing format:

```markdown
## X.Y.Z
* <succinct summary of the PR changes, derived from the code review and PR description>
```

The summary should be 1-3 bullet points describing what changed, written from a user/consumer perspective (not implementation details).

---

### Phase 7: Commit, push, and merge

1. Stage the changes: `git add package.json docs/changelog.md`
2. Commit with message: `Release vX.Y.Z`
3. Push: `git push origin <branch>`
4. Merge the PR: `gh pr merge <number> --merge --delete-branch`
5. Check out main and pull: `git checkout main && git pull origin main && git fetch --prune`
6. If changes were stashed in Phase 2, notify the user to `git stash pop` on their original branch.

---

### Phase 8: Deploy and release

1. Run the deploy build: `./build deploy skip-tests`
2. Create a GitHub release for the new version:
   ```
   gh release create vX.Y.Z --title "vX.Y.Z" --notes "<changelog entry from Phase 6>"
   ```
   Use the same bullet points written for `docs/changelog.md` as the release notes.

---

### Error handling

- If any test fails, show the full failure output and stop. Do not proceed to the merge.
- If the PR has merge conflicts with main, stop and tell the user to resolve them.
- If `gh` CLI is not authenticated, stop and tell the user to run `gh auth login`.
- If the Docker container cannot be started, stop and tell the user to check their Docker setup.
