# Discovery: Mutuelle Ardoise

!!! warning "Fictional customer, invented numbers."
    Mutuelle Ardoise doesn't exist. Every volume, headcount and process figure on this page is invented to make the engagement concrete, and is marked *(invented)*. The regulatory rules are real and link to their sources. [What is simulated](../simulated.md) lists everything that isn't real.

This note records what a first discovery call would establish before anyone writes a prompt: who is asking, what they want to decide, how the work is done today, and which constraints rule options out. The [success criteria](01-success-criteria.md) are built on it.

## Who is asking, and what they want to decide

The customer service director of Mutuelle Ardoise, a French mutual health insurer, is weighing whether to put Claude into the written complaints channel. The director's question isn't whether the model is impressive. It is whether they can say yes to two things without taking a regulatory or privacy risk:

1. **Triage:** sort every incoming written message by subject, urgency, whether it is a complaint, and whether it contains health details.
2. **Reply drafting:** prepare a French reply that an agent checks and sends.

The director wants a go or no-go they can defend to the director general and the data protection officer, with a cost per 1,000 complaints next to it.

## The business today *(all figures invented)*

| | |
|---|---|
| Members | about 180,000 |
| Written messages (email, web form, letters scanned on arrival) | about 2,400 a month |
| Of which complaints in the ACPR sense | about 900 a month |
| Agents on the written channel | 14 |
| Time an agent spends reading and routing one message | about 3 minutes |
| Acknowledgements sent after the 10-working-day limit, last quarter | about 1 in 8 complaints |

Every message is read in a shared inbox by the next free agent, who decides which team should handle it and whether it is a complaint. Complaints go into a register that starts the ACPR clock. When the inbox backs up, messages are routed late. The late acknowledgements come from that queue, not from slow answers.

What the director expects from triage is narrow: route correctly the first time, never miss a complaint, never let a health detail travel further than it needs to, and shorten the queue that makes acknowledgements late.

## Constraints

| Constraint | Source | What it rules out or requires |
|---|---|---|
| A complaint is any expression of dissatisfaction; a plain request is not. 10 working days to acknowledge, 2 months to answer | [ACPR Recommandation 2024-R-02](https://acpr.banque-france.fr/fr/publications-et-statistiques/publications/recommandation-2024-r-02-du-2-juillet-2024-sur-le-traitement-des-reclamations), see [findings](../findings.md#complaint-handling-rules-acpr) | Missing a complaint is the costliest triage error, so `is_complaint` recall is a hard target |
| Health details are a special category of personal data under the GDPR | GDPR, Article 9 | Messages with health details must be flagged so they get stricter handling. From phase 2, PII is redacted before anything is logged |
| A person sends every reply | The director's condition | Claude sorts and drafts. It never sends. Reply quality is judged as a draft an agent would accept |
| Member data stays in the EU, under contracts the DPO accepts | The director's condition | The deployment route (Claude API, Amazon Bedrock or Google Vertex AI) is a phase 4 decision with EU data handling as the main criterion |
| Cost has to be stated per 1,000 complaints | The director's request | Every run records token usage and cost. The comparison reports a cost per 1,000, not only a quality score |

## What triage would cost at this volume

At 2,400 messages a month *(invented)*, the worst-case planning ceilings from the [evaluation page](../evaluation.md#cost-per-1000-complaints) come to about $0.67 a month on Haiku 5.5 ($0.28 per 1,000) and about $19.50 a month on Sonnet 5.5 ($8.12 per 1,000). Both are ceilings, not measurements.

Either is small next to the agent time spent routing (3 minutes per message, *invented*). So the choice between the two models turns on the hard targets, not on price. Price matters again in phase 1, when reply drafting adds longer prompts and longer outputs.

## Scope agreed for phase 0

- **In:** triage only, on 30 French messages labelled by hand, measured against targets agreed before any prompt work. Haiku 5.5 against Sonnet 5.5.
- **Out until later phases:** reply drafting (phase 1), adversarial messages and PII redaction (phase 2), the larger comparison including Opus (phase 3), the deployment route and the go or no-go (phase 4).

## Open questions for later phases

- How much of the policy wording can a reply quote, and which extracts are current? (Phase 1)
- Which fields may appear in logs and traces once redaction runs? (Phase 2, with the DPO)
- Does the hosting route for messages that contain health data need a specific French certification, and which of the three routes can meet it? (Phase 4, with the DPO)
- What does an agent change in a draft before sending it, and how often? That rate is what reply quality is finally judged on. (Phase 1 onwards)
