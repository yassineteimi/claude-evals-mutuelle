# ADR 0001: Evals before prompt tuning, smallest model first

Status: accepted
Date: proposed 2026-11-25, accepted 2026-11-25. Phase: 0.

## Context

Mutuelle Ardoise (fictional) wants a go or no-go on Claude for triaging written complaints. A missed complaint misses the ACPR clock (10 working days to acknowledge, 2 months to answer), and a missed health detail means special-category data under the GDPR gets ordinary handling. The decision has to be defensible to a regulator and a data protection officer, so "it looked good on the examples we tried" isn't evidence. Cost per 1,000 complaints has to sit next to the quality result.

## Options considered

| Option | What it is | For Mutuelle Ardoise | Against, for Mutuelle Ardoise |
|---|---|---|---|
| A. Evals first, smallest model first | Agree targets, label 30 cases and write code graders before any prompt work. Run Haiku 5.5 first; Sonnet 5.5 is the comparison | Every prompt change is measured against the same set. The go or no-go rests on numbers agreed in advance. Cost is measured from the cheapest model up | Up to a day of work before the first model call. 30 cases only catch clear failures |
| B. Prompt first, evaluate later | Write the prompt, tune it by eye on a handful of messages, build an eval once it looks right | First demo the same day | The eval gets written to fit a prompt that already "works", so it confirms rather than tests. Nothing shows a regression when the prompt changes. The director can't defend "it looked right" |
| C. Largest model first, then downsize | Start on Sonnet 5.5 (or Opus 5.5) for the best quality, try smaller models once it works | Fewer early failures to explain | Sets the quality bar on the most expensive model, so a cheaper model that would pass looks like a downgrade. At $8.12 against $0.28 per 1,000 messages (planning ceilings), that bias is costly at scale |

## Decision

**Option A.** The success criteria were written first, and approved on 2026-11-24 (three hard targets: `is_complaint` recall at least 95%, `health_data` recall 100%, schema validity 30 out of 30). The 30 cases are labelled by hand against a written labelling guide, the same rules the prompt follows. Haiku 5.5 runs first, and Sonnet 5.5 is recommended only if Haiku misses a hard target that Sonnet meets.

Two things decided it. First, the customer's question is a yes or no that must hold up in front of a regulator, and only targets fixed before the results can carry that. Second, triage cost is small at this volume either way (see the [discovery note](../engagement/00-discovery.md#what-triage-would-cost-at-this-volume)), so the model choice should be driven by the hard targets, measured from the cheapest model up.

What would change the answer: if Haiku 5.5 misses a hard target and prompt work on the 30 cases can't close the gap, Sonnet 5.5 becomes the recommendation for triage. If both miss, phase 0 reports a no-go for unattended routing and phase 1 takes up prompt work. A large change in the price gap between the two models would also reopen the question.

## Consequences

- Every prompt or code change is measured on the same 30 cases, and saved responses make re-grading free.
- The customer's team owns the labelling guide. A rule change is a decision to approve, not a quiet edit, and it changes both the labels and the prompt together.
- The first model call comes after a day of setup. That day is the work the customer would otherwise do later, under pressure.
- This PoC can't show performance on real messages, on a production mix or at production load. The data is fictional, and 30 cases can't separate two models that are close. The set grows to 150 in phase 1 for that.

## Evidence

- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), Anthropic's guide this method follows.
- [Success criteria and labelling guide](../engagement/01-success-criteria.md), approved 2026-11-24.
- [Evaluation](../evaluation.md): method and the cost per 1,000 planning ceilings.
- [Findings](../findings.md): model IDs, prices, the ACPR rules.
- Baseline results: none yet. `results/` will hold them after the first paid run.
