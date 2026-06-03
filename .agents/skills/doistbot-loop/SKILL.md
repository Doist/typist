---
name: doistbot-loop
description: Run judgment-driven Doistbot local self-review loops against local git changes. Use when a user wants an agent to review and refine a branch before opening a pull request by running the Doistbot CLI, classifying findings for scope and relevance, fixing actionable issues, rerunning review, and stopping when remaining feedback is nits, out of scope, speculative, or no longer worth addressing.
---

# Doistbot Loop

Use Doistbot CLI findings as review input, not as an automatic task list. The CLI's job is to propose findings; the agent's job is to exercise independent engineering judgment. Only change code when a finding is high quality, high impact, in scope for the current work, and likely to improve the PR's quality, stability, correctness, or maintainability.

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

While a Doistbot review command is running, keep updates quiet. Post at most one or two brief waiting updates such as "Doistbot reviews can take a while, so I am waiting for the CLI to finish." Do not post repeated minute-by-minute chatter. For tests or edit work that runs longer than roughly 30-60 seconds, post concise progress updates with the current activity and next expected step.

## Review Loop

Start by checking the local change shape:

```bash
git status --short
```

Choose the initial review scope from `git status --short`:

- If the output is empty, the working tree is clean. Review the branch's committed changes against the repository base with:

```bash
doistbot review --json
```

- If there are unstaged or untracked files, stage all local files first, then review the staged snapshot:

```bash
git add -A
doistbot review staged --json
```

- If there are already staged files and no unstaged or untracked files, review the staged snapshot:

```bash
doistbot review staged --json
```

When operating inside a sandboxed or approval-gated agent environment, request the approval needed for Doistbot review to reach its configured model providers before the first review command. Tell the user that the review may send the local diff/code to configured providers. Do not first run Doistbot in a restricted sandbox if that environment is expected to block provider access. If approval is denied, stop and ask the user to run the selected Doistbot JSON review command locally and share the output; do not substitute a manual/local-only review for the Doistbot loop.

Doistbot reviews can take several minutes. After starting a Doistbot JSON review command, wait for the CLI to exit naturally and rely on the CLI's own timeout. Do not interrupt, cancel, or kill the review process while it is still running. Keep posting concise status updates while waiting. If the CLI exits with its own timeout or another error, stop and report that exact failure.

After making any code, test, config, or documentation change, stage the changed files before continuing:

```bash
git add -A
```

Once the agent has edited, created, or deleted even one file during the loop, every following Doistbot round must review the staged snapshot:

```bash
doistbot review staged --json
```

Do not run another Doistbot review while agent-made edits remain unstaged. Do not keep rerunning `doistbot review staged --json` against an outdated staged snapshot after editing files.

In JSON mode, treat `review.findings` as the canonical feedback list and `review.count` as the derived finding total for reporting.

After every JSON review, inspect the review status before classifying findings.

If `providerFailures` is non-empty, stop the loop even when `status` is `reviewed`. Surface the specific provider failure messages to the user, explain that the review did not run with full provider coverage, and ask the user to run:

```bash
doistbot doctor
```

If `status` is `unverified` or `verified` is `false`, stop the loop. Surface `unverifiedReason`, include any provider failure messages, explain that the review cannot be trusted, and ask the user to run `doistbot doctor`. Do not classify findings, edit files, or start another review round until the user resolves the issue and reruns the skill.

If `status` is `skipped`, stop the loop and summarize `skipReason`. For `no_diff` or `empty_diff`, tell the user there are no local changes in the selected review scope.

Doistbot will return findings on every round. The agent must not treat findings as mandatory tasks or optimize for reaching `review.count: 0`. Before editing, carefully critique every finding for correctness, scope, expected impact, risk, and practical value. Be judicious and decisive: fix only feedback that is clearly valid, high quality, within the current work's scope, and reasonable to address immediately.

For each finding, ask:

- Is the finding factually correct after inspecting the code and relevant context?
- Would fixing it materially improve quality, stability, correctness, security, performance, or maintainability?
- Is it within the current diff's intended scope?
- Can it be fixed surgically without changing broad ownership, architecture, or unrelated behavior?
- Is the proposed fix safer and simpler than leaving the code as-is?

- `address`: high-quality and high-impact enough to fix now; actionable, in scope for the current diff, likely correct, and fixable without broad unrelated changes or architecture decisions
- `defer`: valid but outside this PR, too broad, requires product/design judgment, or belongs in follow-up work
- `dismiss`: speculative, incorrect, already handled, or not worth author attention
- `nit`: optional polish; fix only when cheap and clearly beneficial

Fix only `address` findings. Omit `defer`, `dismiss`, and `nit` findings from the edit batch. When omitting a finding, say which finding is being omitted and why, either in the classification update or the final summary.

When several fixes are possible, choose the smallest conservative fix that preserves existing ownership, safety, and behavior. Do not introduce custom wrappers, broad ownership changes, cross-cutting refactors, or clever abstractions just to satisfy a finding. If a finding can only be addressed with a larger redesign, defer it and explain the tradeoff instead of expanding the loop.

After making edits, stage all changes and run targeted checks that match the touched files and repository conventions. If checks require follow-up edits, stage those edits too before the next Doistbot round. Then rerun Doistbot with `doistbot review staged --json`.

There is no fixed round cap, but the loop must stay surgical. Stop when no clearly addressable findings remain, even if Doistbot still reports feedback. A branch can be ready when the remaining findings are nits, deferred items, dismissed items, disputed tradeoffs, or scope-expanding suggestions.

Stop and summarize instead of continuing when:

- the next finding would expand the change beyond the current work's intended scope
- the next finding requires touching broad/shared architecture, large ownership boundaries, or many unrelated files
- the same finding repeats after a reasonable fix or explicit dismissal
- the loop starts revisiting or reversing the same design tradeoff
- new findings are only nits, preferences, or speculation
- fixing requires user, product, design, or reviewer judgment
- provider failures are reported in the JSON output
- the agent is no longer making meaningful progress

## Final Summary

End with a concise readiness summary:

- review rounds run
- feedback raised during the loop, grouped by fixed, omitted/deferred, dismissed, and nits
- for every omitted/deferred/dismissed finding, a brief reason why it was not fixed
- checks run and their result
- whether the branch looks ready to open as a PR
