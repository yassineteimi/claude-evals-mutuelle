# Evaluation

!!! warning "No results yet."
    The baseline hasn't run. This page sets out the method. Results tables appear here only from committed runs, each with its run date, model IDs, prompt version and cost.

This page is a method, not a scoreboard. The question is never "is Sonnet better than Haiku". It is "which is the smallest model that meets the targets the customer agreed to, and what does that cost per 1,000 complaints".

## Method

The method and its vocabulary follow Anthropic's guide [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests):

- **Success criteria** are specific and measurable, and cover several dimensions: task fidelity, consistency, privacy, latency and price. They are written in the engagement's success criteria note and approved before anything is measured.
- **The eval set** mirrors the real mix of messages, edge cases included.
- **Code-graded** checks decide everything a code check can: exact label matches and schema validity.
- **Model-graded** checks start in phase 1, for reply drafts only. A Sonnet rubric grader is checked against human labels first. The grader is a different model from the one being graded, as the guide advises.

## The eval set

- **30 French messages** to a fictional mutuelle, in `data/cases/`. Each is labelled with the four triage fields. The labels are drafted first and then confirmed one by one by hand. They are the ground truth.
- **The mix follows the categories**, with a few plain requests for information that are not complaints, and a few messages that mention a health detail.
- **ACPR borderline cases are included on purpose**, such as a reminder about a late reimbursement (a complaint) and a document request with no dissatisfaction (not a complaint). See [Phase 0: triage](phases/phase-0-triage.md#complaint-or-request-the-acpr-test).
- **The 30 stay the development set.** From phase 1 the set grows to 150. Prompt changes are tried on the 30, and the 150 run only for a milestone worth measuring.

## What is measured in phase 0

| Dimension | Measure | Graded by |
|---|---|---|
| Task fidelity | Accuracy per field; recall and precision of `is_complaint` | Code |
| Privacy | Recall of `health_data` (a missed health detail is the costly error) | Code |
| Format | Share of responses valid against the schema; a `max_tokens` stop counts as invalid | Code |
| Latency | p50 and p95 per request, synchronous runs on the 30 cases only | Code |
| Price | Cost per 1,000 complaints, from the usage fields of each response | Code |

The first request with a new schema waits while the grammar compiles, so the first case of a run is slower. p95 over 30 cases is read with that in mind.

## Cost per 1,000 complaints

Cost comes from the token counts each response reports, priced from the [pricing page](https://platform.claude.com/docs/en/about-claude/pricing) as recorded in the [findings](findings.md#models-and-prices):

```text
cost per 1,000 = 1,000 x (input tokens x input price + output tokens x output price) / 1,000,000
```

Until the baseline runs, the only figure is a planning ceiling. It assumes about 1,500 input tokens per message and prices the full `max_tokens` as output, synchronous, with no cache. It is a worst case, **not a measurement**:

| `max_tokens` | `claude-haiku-5-5` | `claude-sonnet-5-5` |
|---|---|---|
| 256 | $0.28 | $5.56 |
| 300 | $0.30 | $6.00 |
| 512 | $0.41 | $8.12 |
| 1,024 | $0.66 | $13.24 |

The phase 0 configuration uses two of these cells. `claude-haiku-5-5` runs with `max_tokens` 256 and thinking disabled, a ceiling of about $0.28 per 1,000. `claude-sonnet-5-5` runs with `max_tokens` 512 and thinking set to `between_tools`, its lowest setting, a ceiling of $8.12 per 1,000. Effort is `medium` on both. Thinking tokens are billed as output and share the `max_tokens` budget with the JSON answer, so Sonnet's thinking can't push the cost past its ceiling. It can, though, use up the budget and cut the answer off, and the eval counts that as a schema failure. See [Thinking and output limits](findings.md#thinking-and-output-limits).

Prices in USD per million tokens: Haiku 5.5 $0.10 input and $0.50 output, Sonnet 5.5 $2.00 input and $10.00 output. The Batch API halves both, and later phases use it for full runs. Before the baseline, `make estimate` replaces the 1,500 assumption with input tokens counted per model by the token counting endpoint.

## Results

None yet.
