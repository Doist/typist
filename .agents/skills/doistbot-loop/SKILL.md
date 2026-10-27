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

Require `doistbot >= 1.0.12`. Earlier versions lack the JSON review output this skill uses (before 1.0.3), `--base` (before 1.0.4), or untracked files in local reviews (before 1.0.12). Parse the semantic version from `doistbot --version`; if the installed version is `1.0.11` or older, stop. Do not upgrade it automatically. Tell the user:

```text
Doistbot CLI 1.0.12 or newer is required for this skill. Upgrade it first:

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

Review the whole change in every round. `doistbot review --json` compares the branch's merge base with the working tree, so it covers the branch's commits, staged and unstaged edits, and untracked files that aren't ignored. Nothing needs to be staged.

Before every review round, check the local change shape:

```bash
git status --short
```

Untracked files that aren't ignored are part of the review, so they are sent to the configured model providers. Checks, builds, and the user's own work can create them between rounds.

- If it lists untracked files that don't belong to the current change, stop and ask the user to move, delete, or ignore them first.
- If any file in the review, untracked or not, holds credentials, tokens, keys, or real user data, stop and ask the user to remove it. It shouldn't be committed either.
- Do not stage, unstage, move, or delete the user's files yourself.

Then review the change:

```bash
doistbot review --json
```

If the branch is stacked on another branch instead of the repository's default branch, review against that branch, so the review covers only this branch's work:

```bash
doistbot review --base <parent-branch> --json
```

Find the parent branch from the branch's open pull request (`gh pr view --json baseRefName --jq .baseRefName`) or, in a GitHub stack, from `gh stack view`. Don't use the branch's upstream (`@{u}`): it is usually the same branch on the remote. If neither source answers, ask the user.

Do not stage files for a review, and never use `git add -A` or `git add .`. Do not use `doistbot review staged --json` either: it reviews only the staged edits against `HEAD`, skips the branch's commits, and can still report a verified review.

Before the first review command, reuse existing user authorization, including applicable standing authorization, to send the selected diff/code to Doistbot's configured model providers. Proceed without asking for confirmation again when that review is covered. If authorization is missing, tell the user that the review sends the selected diff/code to configured providers and request the missing consent.

In a sandboxed or approval-gated agent environment, request any runtime escalation required for provider access and state the existing user authorization in that request. Do not first run Doistbot in a restricted sandbox if that environment is expected to block provider access. If access remains denied, stop and ask the user to run the selected Doistbot JSON review command locally and share the output; do not substitute a manual/local-only review for the Doistbot loop.

Doistbot reviews can take several minutes. After starting a Doistbot JSON review command, wait for the CLI to exit naturally and rely on the CLI's own timeout. Do not interrupt, cancel, or kill the review process while it is still running. Keep posting concise status updates while waiting. If the CLI exits with its own timeout or another error, stop and report that exact failure.

After making any code, test, config, or documentation change, rerun the same review command, with the same `--base` if you used one. It picks up edited, created, and deleted files without staging. Check `git status --short` again before each round.

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

After making edits, run the repository's verification command if its AGENTS.md names one, or targeted checks that match the touched files and repository conventions. Then rerun the same Doistbot review command.

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
