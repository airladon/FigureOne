# Code Review

Review code changes for: **quality**, **readability**, **conciseness**, **security**, **performance**, **correctness**, **error handling**, and **maintainability**.

## Input

The user will specify one of the following scopes (ask if not provided):

- **all** — All uncommitted changes (staged + unstaged) compared to HEAD
- **staged** — Only staged changes (`git diff --cached`)
- **branch `<branch-name>`** — Changes that would result from merging `<branch-name>` into the current branch (`git diff ...branch-name`)

$ARGUMENTS

## Instructions

1. **Determine the scope** from the user's input above. If `$ARGUMENTS` is empty or unclear, ask the user which scope they want.

2. **Collect the diff** using the appropriate git command:
   - `all` → `git diff HEAD`
   - `staged` → `git diff --cached`
   - `branch <name>` → `git diff ...<name>` (three-dot merge-base diff)

   Run the git command via Bash. If the diff is empty, tell the user there are nothing to review and stop.

3. **Read full file context** for every file that appears in the diff so you understand the surrounding code, not just the changed lines.

4. **Review each file's changes** against all categories below. Only report findings that are actionable — skip categories with no issues for a given file.

### Review categories

| Category | What to look for |
|---|---|
| **Correctness** | Logic errors, off-by-one bugs, race conditions, wrong assumptions, type mismatches, null/undefined risks |
| **Security** | Injection (XSS, SQL, command), secrets in code, unsafe deserialization, improper auth/authz, OWASP top-10 |
| **Performance** | Unnecessary allocations, O(n²) where O(n) is possible, missing memoization, layout thrashing, large bundle impact |
| **Error handling** | Missing try/catch, swallowed errors, unhelpful messages, unhandled promise rejections, missing edge cases |
| **Readability** | Unclear naming, overly clever code, missing context for non-obvious logic, inconsistent style |
| **Conciseness** | Dead code, redundant checks, copy-paste duplication, overly verbose patterns that have simpler equivalents |
| **Maintainability** | Tight coupling, hidden side effects, magic numbers/strings, DRY violations, poor separation of concerns |
| **Quality** | Test coverage gaps for new logic, API contract changes without migration, inconsistency with surrounding codebase patterns |

5. **Output format**

   Start with a one-line summary: `## Review: <scope> (<N> files, <M> findings)`

   Then for each file with findings, output:

   ### `path/to/file`

   For each finding:
   - **[Category]** `line(s)` — Description of the issue and a suggested fix or improvement.

   End with a section:

   ### Summary

   - Total findings by severity: critical / warning / suggestion
   - An overall assessment (1-2 sentences)

6. **Severity classification**
   - **Critical**: Bugs, security vulnerabilities, data loss risks — must fix before merge
   - **Warning**: Performance issues, poor error handling, maintainability concerns — should fix
   - **Suggestion**: Style, readability, minor improvements — nice to have
