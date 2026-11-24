# Success criteria: phase 0, triage

!!! note "Approved by Yassine on 2026-11-24. Nothing has been measured yet."
    These targets and the labelling guide were agreed before any prompt work, so no result can bend them afterwards. Mutuelle Ardoise is fictional; the reasons given for each target are the ones a real customer service director would weigh.

Phase 0 answers one narrow question: can Claude triage French complaints well enough that a customer service team could route on its output, with a person still reviewing each case? Reply drafting, deadline tracking and adversarial messages come in later phases and have their own criteria.

The method follows Anthropic's guide [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests): each criterion is specific, measurable, achievable and relevant, and several dimensions are measured, not one score.

## The targets

**Hard targets** decide pass or fail. **Reported targets** are measured and discussed but don't block on their own.

| # | Dimension | Measure | Target | Kind |
|---|---|---|---|---|
| 1 | Regulatory | Recall of `is_complaint` (complaints flagged as complaints) | at least 95% | Hard |
| 2 | Privacy | Recall of `health_data` (messages with a health detail flagged) | 100% on the 30 cases | Hard |
| 3 | Format | Responses valid against the schema, a `max_tokens` stop counting as invalid | 30 out of 30 | Hard |
| 4 | Routing | Accuracy of `category` | at least 85% | Reported |
| 5 | Queue | No `high` urgency case labelled `low` | 0 | Reported |
| 6 | Queue | Accuracy of `urgency` | at least 75% | Reported |
| 7 | Regulatory | Precision of `is_complaint` (flagged complaints that are complaints) | at least 85% | Reported |
| 8 | Latency | p95 per message, synchronous, 30 cases | at most 10 seconds | Reported |
| 9 | Price | Measured cost per 1,000 messages, synchronous, no cache | at most $5 | Reported |

## Why these numbers

1. **`is_complaint` recall, 95%.** A complaint sorted as a plain request misses the ACPR clock: 10 working days to acknowledge, 2 months to answer (Recommandation 2024-R-02, see the [findings](../findings.md#complaint-handling-rules-acpr)). That is the error the director can't explain to the regulator, so it is the strictest target. Not 100%, because the line between a complaint and a request is a judgement call even for trained staff, and the borderline cases are in the set on purpose.
2. **`health_data` recall, 100%.** Health details are sensitive data under the GDPR, and a missed one is handled as an ordinary message. On 30 cases this means no miss at all. A false alarm only costs a reviewer a look, so precision is not a target here.
3. **Schema validity, 30 out of 30.** Routing code can't use an answer it can't parse. A response cut off by `max_tokens` counts as a failure, not a retry, because thinking shares that budget (see the [findings](../findings.md#thinking-and-output-limits)).
4. **Category accuracy, 85%.** A wrong category sends a message to the wrong team, which costs a hand-off, not a breach. Reported, not hard.
5. **No `high` labelled `low`.** The costly urgency error is burying an urgent case. Being one level off is common and cheap.
6. **Urgency accuracy, 75%.** Urgency is the most subjective label, so the bar is lower.
7. **`is_complaint` precision, 85%.** Over-flagging puts requests through the formal complaint process. That wastes time but breaks no rule.
8. **p95 latency, 10 seconds.** Triage feeds a queue, not a live chat, so seconds don't matter to a member. The first request with a new schema waits for the grammar to compile, which inflates p95 on a 30-case run.
9. **Cost, $5 per 1,000.** Triage is cheap next to a person reading the message, so this target is about choosing between models, not about the business case. The planning ceilings are $0.28 per 1,000 for Haiku 5.5 and $8.12 for Sonnet 5.5 (see [Evaluation](../evaluation.md#cost-per-1000-complaints)). Sonnet has to come in well under its ceiling, or win on the hard targets, to be worth its price.

## Labelling guide

The labels on the 30 cases and the instructions given to the model follow the same written rules. If they didn't, the eval would measure a disagreement between two rule sets instead of the model. These are those rules.

**`is_complaint`** applies the ACPR definition in Recommandation 2024-R-02: a complaint is an expression of dissatisfaction with the professional; a request for a service, information or an opinion is not.

- `true` when the message expresses dissatisfaction with the mutuelle, whatever the tone: a reminder about a late reimbursement, a dispute over an amount, criticism of how the member was treated.
- `false` for a plain request for information, a document, a quote or a change, with no dissatisfaction in it.

**`category`** is the main subject of the message. If a message touches several, it is the one the member most wants resolved.

| Value | Covers |
|---|---|
| `reimbursement` | Health care reimbursements: their amount, delay or refusal |
| `contributions` | Membership fees: amount, increases, direct debits, arrears |
| `membership_cancellation` | Joining, cancelling or not renewing the contract |
| `third_party_payment` | Third-party payment (tiers payant) refused or not applied at a pharmacy, hospital, optician or other provider |
| `personal_data` | Access, correction or deletion of personal data, consent, data protection (GDPR) |
| `service_quality` | How the member was handled: waiting times, unanswered calls or emails, rudeness, wrong information |
| `other` | Anything that fits none of the above |

**`urgency`**

- `high`: any one of these:
    - the member is without care or money they need now (care refused or postponed, a large sum unpaid);
    - the member needs something before imminent care (for example a prise en charge before an operation on Monday);
    - the message threatens to go to the mediator, the ACPR or court;
    - it mentions a deadline that has passed;
    - it is a repeated reminder.
- `normal`: a real issue with no immediate harm or deadline.
- `low`: a request for information, a change request with no dissatisfaction (a new address, adding a child to the contract, new bank details), or a minor remark with no consequence for the member.

Check the `high` triggers first: any one of them makes the message `high`, even when it is a plain request that would otherwise be `low`.

**`health_data`**

- `true` when the message mentions a health detail about any person: an illness, a diagnosis, a treatment, a disability, a pregnancy, a hospital stay, a medical procedure, a medication, or a visit to a named medical specialist even with no condition stated (for example « mon rendez-vous chez le cardiologue »).
- `false` otherwise. The name of a care category on its own (for example "optique", "dentaire" or "lunettes") with no detail about the person's health is not a health detail.

## What 30 cases can and can't show

Each case is about 3 points on a percentage, so the targets read better as counts. With the planned mix of about 22 complaints and 8 messages with a health detail:

| Target | In counts |
|---|---|
| `is_complaint` recall at least 95% | at most 1 complaint missed |
| `health_data` recall 100% | no health detail missed |
| `category` accuracy at least 85% | at most 4 wrong |
| `urgency` accuracy at least 75% | at most 7 wrong |

30 cases are enough to catch a model that fails clearly, not to prove a small difference between two models. The set grows to 150 in phase 1 for that.

## Decision rule

- A model **passes** phase 0 if it meets all three hard targets.
- Of the models that pass, the cheapest is recommended for triage. The reported targets explain the choice and point to what phase 1 has to fix.
- If no model passes, the misses go into phase 1 prompt work on the 30 cases. Phase 0 still delivers a measured baseline, which is the point of measuring first.

## Not measured in phase 0

- **Consistency across reruns.** Saved responses are reused rather than paid for twice. Variation across runs is measured on the 150-case set in phase 3.
- **Reply quality, deadline tracking, adversarial messages and PII redaction.** These are phases 1 and 2.
