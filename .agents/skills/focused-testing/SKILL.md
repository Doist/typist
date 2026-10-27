---
name: focused-testing
description: Keep test changes small and useful during feature work, bug fixes, refactors, and test reviews. Use before adding or changing tests. Reuse sufficient coverage unchanged, consolidate overlap, and add checks only for important behavior within the task.
---

# Focused Testing

Use the least test code needed to protect the requested behavior. A changed function or file does not need a new test of its own. Follow repository checks without inventing targets for test count, test lines, or coverage.

## Choose before editing

Read the nearest tests and their setup. Identify the result a caller must observe: output, an error, saved data, or an effect on another system.

- **Already covered:** run the existing test unchanged. Do not strengthen it merely because you can.
- **Changed scenario:** update the existing case or test table. Preserve cases that still protect supported behavior.
- **Missing important behavior:** extend the nearest suitable test. Add a separate test only when the outcome or setup needs one.
- **Refactor or cleanup:** preserve useful coverage and remove overlap. Do not turn cleanup into a coverage expansion. Report other possible gaps in the task response.

Before adding an assertion, case, fixture, or helper, name the important fault within this task that the existing tests would miss. A different input value, error reason, or test layer alone is not a new fault. If it is already caught, reuse that coverage unchanged.

## Consolidate overlapping checks

When tests detect the same fault, keep the clearest useful check and remove repeated checks and their unused setup within the task's scope.

A second test layer must protect a different risk. Once a test proves a result through the real interface, avoid also checking the internal steps that produce it. Keep a lower-level check only when it detects an important fault the broader test misses. Do not keep both merely because both pass.

Reuse the current test file and setup. Keep distinct success, rejection, safety, and recovery outcomes separate where needed. Do not combine unrelated scenarios into a large test or add helpers that cost more code than they remove.

During cleanup, consolidate before strengthening tests. Change a retained test only as needed to preserve important behavior. Do not replace deleted tests with optional coverage. If the test code grows, check which additions can be left out before calling the cleanup complete.

## Check meaningful results

Derive expected values from requirements, worked examples, or checked fixtures. Do not compute them with the code being tested or copy its output without checking it.

Assert results callers depend on. An external request's contents can be a real contract. Private helper calls, internal call order, and intermediate objects usually are not. Avoid exact error wording unless callers depend on it. Tests should survive internal changes that preserve behavior.

Avoid checks only for source text, compiler guarantees, framework mechanics, simple getters, or forwarding calls. Check the meaningful result that depends on them. A documented protocol value or default can itself be a contract.

Use real local components when setup is small and reliable. Replace slow or external dependencies only where necessary. Avoid layers of mocks that mostly verify themselves. Keep test-only helpers out of production APIs.

## Verify and stop

For bug fixes, show that the new or changed test fails for the original bug and passes with the fix, where practical. A small temporary fault can check critical assertions. Restore the code afterwards. Do not add mutation tools or a new test framework for this process.

If a small task needs large unrelated fixtures, brittle timing, or expensive infrastructure to add a test, use the closest useful existing check, dry run, or temporary script. State any important gap.

Run relevant tests and required repository checks. Review the whole test diff, including setup. Fewer test names alone do not mean less test code. Remove temporary files and unused support. Do not weaken assertions or delete failing tests to reduce the diff. Stop once the requested behavior has useful coverage. Keep the report short and put optional follow-up findings in the task response.
