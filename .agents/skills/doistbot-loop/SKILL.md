---
name: doistbot-loop
description: Run judgment-driven Doistbot local self-review loops against local git changes. Use when a user wants an agent to review and refine a branch before opening a pull request by running the Doistbot CLI, classifying findings for scope and relevance, fixing actionable issues, rerunning review, and stopping when remaining feedback is nits, out of scope, speculative, or no longer worth addressing.
---

# Doistbot Loop

Use Doistbot CLI findings as review input, not as an automatic task list. The agent owns judgment about what is in scope, useful, and worth changing before a PR opens.

## Prerequisites

Before doing any review work, verify the CLI is installed:

```bash
doistbot --version
```

If `doistbot` is not available, stop. Do not install it automatically. Tell the user:

```text
Doistbot CLI is required for this skill. Install it first:

brew install Doist/tap/doistbot-cli
doistbot setup

Or with npm:

npm install -g @doist/doistbot-cli
doistbot setup

Then rerun the skill.
```

Require `doistbot >= 1.0.3`, because earlier versions do not include the internal JSON review output this skill uses. Parse the semantic version from `doistbot --version`; if the installed version is `1.0.2` or older, stop. Do not upgrade it automatically. Tell the user:

```text
Doistbot CLI 1.0.3 or newer is required for this skill. Upgrade it first:

brew update && brew upgrade doistbot-cli

Or with npm:

npm install -g @doist/doistbot-cli@latest

Then rerun the skill.
```

Then check configuration:

```bash
doistbot doctor
```

If `doctor` reports missing auth or setup, stop and tell the user to run `doistbot setup` or `doistbot auth`.

## User Updates

Do not run long review/fix/review cycles silently. Post visible status updates through the current agent interface:

- before starting the first review
- when each review round starts
- after findings are classified
- before editing a batch of files
- after tests or checks complete
- before starting another review round
- when stopping with the final readiness summary

If a review, test, or fix step runs for more than roughly 30-60 seconds, post a brief progress update with the current round, current activity, what has been learned so far, and the next expected step. Keep updates concise; summarize counts and decisions instead of pasting every finding.

## Review Loop

Start by checking the local change shape:

```bash
git status --short
```

Run the review in JSON mode:

```bash
doistbot review --json
```

If the user asks to review only staged changes, run:

```bash
doistbot review staged --json
```

After editing files in a staged-only loop, either stage the intended fixes before rerunning the staged review:

```bash
git add <fixed-files>
doistbot review staged --json
```

or switch to the full local review:

```bash
doistbot review --json
```

Do not keep rerunning `doistbot review staged --json` against an outdated staged snapshot after editing unstaged files.

In JSON mode, treat `review.findings` as the canonical feedback list and `review.count` as the derived finding total for reporting.

After every JSON review, inspect `providerFailures` before classifying findings. If `providerFailures` is non-empty, stop the loop even when `status` is `reviewed`. Surface the specific provider failure messages to the user, explain that the review did not run with full provider coverage, and ask the user to run:

```bash
doistbot doctor
```

Do not continue fixing findings or start another review round until the user resolves the provider issue and reruns the skill.

For every finding, classify it before editing:

- `address`: actionable, in scope for the current diff, likely correct, and fixable without broad unrelated changes
- `defer`: valid but outside this PR, too broad, requires product/design judgment, or belongs in follow-up work
- `dismiss`: speculative, incorrect, already handled, or not worth author attention
- `nit`: optional polish; fix only when cheap and clearly beneficial

Fix only `address` findings. Do not treat Doistbot comments as mandatory tasks.

After edits, run targeted checks that match the touched files and repository conventions. Then rerun Doistbot and repeat while there are addressable findings and the fixes are making meaningful progress.

There is no fixed round cap. Stop when no addressable findings remain. A branch can be ready even if Doistbot still reports nits, deferred items, or dismissed findings.

Stop and summarize instead of continuing when:

- the same finding repeats after a reasonable fix or explicit dismissal
- new findings are only nits, preferences, or speculation
- the next fix would expand beyond the PR's intended scope
- fixing requires user, product, design, or reviewer judgment
- provider failures are reported in the JSON output
- the agent is no longer making meaningful progress

## Final Summary

End with a concise readiness summary:

- review rounds run
- actionable findings fixed
- checks run and their result
- remaining findings grouped as nits, deferred, or dismissed with brief reasons
- whether the branch looks ready to open as a PR
