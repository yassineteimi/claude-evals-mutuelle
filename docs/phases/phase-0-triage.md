# Phase 0: triage

!!! warning "Not yet run against the Claude API."
    This chapter describes the design and the rules it has to follow. Commands and real output are added as each piece runs; until then nothing here is a result.

Triage is the first job a complaint handler does: read the message, decide what it is about, how urgent it is, whether it is a complaint at all, and whether it carries health details that need care. Phase 0 asks Claude to do only that, on 30 French messages, and returns one JSON object per message.

## The triage contract

Every message gets exactly these four fields. The schema lives in `data/schema/triage.schema.json`.

| Field | Values | What it decides |
|---|---|---|
| `category` | `reimbursement`, `contributions`, `membership_cancellation`, `third_party_payment`, `personal_data`, `service_quality`, `other` | Which team handles it |
| `urgency` | `high`, `normal`, `low` | Where it sits in the queue |
| `is_complaint` | `true`, `false` | Whether the ACPR deadlines apply |
| `health_data` | `true`, `false` | Whether the message mentions a health detail about a person |

`is_complaint` is the field with regulatory weight. When it is wrong in one direction, a complaint is handled as a simple request and can miss its deadlines. When it is wrong in the other, a simple request gets the formal complaint process and costs time for nothing. The eval counts both kinds of error separately for this reason.

## Complaint or request: the ACPR test

French insurers, mutuelles included, follow ACPR [Recommandation 2024-R-02 of 2 July 2024](https://acpr.banque-france.fr/fr/publications-et-statistiques/publications/recommandation-2024-r-02-du-2-juillet-2024-sur-le-traitement-des-reclamations) on complaint handling. It replaced 2022-R-01 and keeps the same definition:

> Une réclamation se définit comme l'expression d'un mécontentement envers un professionnel quel que soit l'interlocuteur ou le service auprès duquel elle est formulée.
>
> Une demande de service ou de prestation, d'information ou d'avis n'est pas une réclamation.

In English: a complaint is any expression of dissatisfaction with the professional, whoever receives it. A request for a service, information or an opinion is not a complaint.

Once a written complaint arrives, the insurer has **10 working days** to acknowledge it in writing (unless the answer itself arrives within those 10 days) and **2 months** at most to answer it. The [findings](../findings.md#complaint-handling-rules-acpr) page has the exact wording and links.

The hard cases are on the line between the two, and the eval set includes some on purpose. These come from the annex of 2022-R-01:

| Message | Complaint? | Why |
|---|---|---|
| A second letter chasing a reimbursement that is late | Yes | It says the member is unhappy with the delay |
| A request for a copy of a certificate, with no complaint | No | A request for a service |
| A question about what a policy covers | No | A request for information |

## Request design

The rules below come from the [findings](../findings.md). Each one changes how the request is built.

- **Structured output through `output_config.format`.** The JSON schema goes in `output_config.format` with `type: "json_schema"`, and the answer comes back as JSON matching it. Forced tool use was the alternative. It was rejected because triage needs no tool, and forcing `tool_choice` returns a 400 on Sonnet 5.5.
- **No sampling parameters.** The SDK sends API version `2026-10-21`, which rejects `temperature`, `top_p` and `top_k` on every model.
- **Thinking is set per model.** Both models think by default, and thinking tokens count toward `max_tokens`. Haiku 5.5 accepts `thinking: {type: "disabled"}`. Sonnet 5.5 rejects that and its lowest setting is `between_tools`. So the thinking setting sits in configuration next to the model ID and `max_tokens`, and every results file records it.
- **A truncated answer is a failure.** A response that stops on `max_tokens` counts as a schema failure in the eval, not as a reason to retry.
- **Building and sending are separate.** One function builds the request and another sends it. Phase 1 can then send the same requests through the Batch API without a rewrite.

## What phase 0 delivers

- A discovery note and the success criteria, with the triage targets approved before any prompt work.
- 30 French complaints with labels confirmed by hand.
- Triage on the Claude API, with a pinned model ID and a set `max_tokens`.
- Code graders, offline tests through a stub client, and CI that never calls the API.
- One baseline run of Haiku 5.5 and Sonnet 5.5 on the 30 cases, with its cost in the ledger.
