# Findings

What I checked against primary sources before writing any code or prompt, with the link I read. Everything here was checked on 24 November 2026; prices and model IDs change, so each table says where to recheck it. Where a source disagreed with what the project brief assumed, the gap is listed at the end rather than worked around.

## Models and prices

Source: [Pricing](https://platform.claude.com/docs/en/about-claude/pricing). USD per million tokens, first-party Claude API, global routing (no `inference_geo` multiplier).

| Tier | Model ID | Input | 5 min cache write | 1 h cache write | Cache read | Output | Batch input | Batch output |
|---|---|---|---|---|---|---|---|---|
| Haiku | `claude-haiku-5-5` | 0.10 | 0.125 | 0.20 | 0.01 | 0.50 | 0.05 | 0.25 |
| Sonnet | `claude-sonnet-5-5` | 2.00 | 2.50 | 4.00 | 0.10 | 10.00 | 1.00 | 5.00 |
| Opus | `claude-opus-5-5` | 4.00 | 5.00 | 8.00 | 0.20 | 20.00 | 2.00 | 10.00 |

- Haiku 5.5 prices hold for prompts up to 100,000 tokens; above that every rate is five times higher. A triage prompt is nowhere near that.
- Cache reads on Sonnet 5.5 and Opus 5.5 cost 0.05x the input price, not the usual 0.1x. Haiku 5.5 keeps 0.1x.
- The pricing page says cache multipliers stack with the Batch discount, so a cached prefix inside a batch request costs half the cached price.
- Claude 4.7 and later models use a tokenizer that produces roughly 30% more tokens for the same text than older models. Estimates in this repo come from the token counting endpoint per model, never from character counts.

## Prompt caching

Sources: [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing).

- **Minimum cacheable prefix: 512 tokens** on Haiku 5.5, Sonnet 5.5 and Opus 5.5. A shorter prefix marked with `cache_control` isn't cached and the API returns no error, so the only way to see it is `cache_read_input_tokens` staying at zero. The phase 0 triage prompt may fall under 512 tokens; phase 1 adds the policy extracts to the fixed part, which should clear it.
- **Caching works inside Message Batches.** The batch docs ask for identical `cache_control` blocks in every request of the batch and suggest the 1 hour cache, because a batch can take longer than 5 minutes to process. Pre-warming with `max_tokens: 0` is rejected inside a batch.

## Python SDK

Source: [anthropic on PyPI](https://pypi.org/project/anthropic/) (JSON API at `pypi.org/pypi/anthropic/json`).

- Latest release: **2.13.0**. `requires_python >=3.10`; classifiers list Python 3.10 to 3.14. The machine this repo is built on runs Python 3.14.4.
- From 2.0.0 the SDK sends API version `2026-10-21` ([migration guide](https://platform.claude.com/docs/en/api/migration-2026-10-21)). That version removes `temperature`, `top_p` and `top_k`: sending any of them returns a 400 on every model, even at the default value ([versioning](https://platform.claude.com/docs/en/api/versioning)). The triage request must not set them.

## Token counting

Source: [Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting).

- Python: `client.messages.count_tokens(model=..., system=..., messages=..., tools=...)` returns `input_tokens`.
- Free, with its own rate limit (5,000 requests per minute on the Start tier) separate from message creation.
- The count is an estimate and can differ slightly from the billed input. It ignores caching, so `make estimate` prices every input token at the full rate: a worst case, which is what it's for.

## Structured JSON output

Source: [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

- The Messages API takes a JSON schema in `output_config.format` with `type: "json_schema"`, and returns JSON matching the schema in the text content block. The old top-level `output_format` parameter is deprecated. Supported on Haiku 5.5, Sonnet 5.5 and Opus 5.5.
- The alternative, strict tool use (`strict: true` on a tool), validates tool inputs. Triage doesn't need a tool, and forced `tool_choice` returns a 400 on Sonnet 5.5 and Opus 5.5, so this repo uses `output_config.format`.
- **Overhead:** the API adds a system prompt explaining the format. The docs don't publish its size, so the token counting endpoint has to measure it with the schema in place.
- **Latency:** the first request with a new schema waits while the grammar compiles; compiled grammars stay cached for 24 hours from last use. The first case of a run is slower for this reason, and p95 latency over 30 cases should be read with that in mind.
- **Schema limits:** every object needs `additionalProperties: false`. `enum` works for strings, numbers, booleans and null. `oneOf`, `not`, `minimum`/`maximum`, `minLength`/`maxLength` and recursive schemas return a 400. The triage contract (enums and booleans) fits.
- **Caching:** changing `output_config.format` invalidates the prompt cache for that conversation thread, so the schema stays fixed within a run.

## Thinking and output limits

Sources: [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking), [Effort](https://platform.claude.com/docs/en/build-with-claude/effort), [Thinking, steering and cost](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost).

This one changes the triage design.

- Haiku 5.5 and Sonnet 5.5 both run **adaptive thinking when the `thinking` field is left out**.
- Thinking tokens are billed as output and **count toward `max_tokens`**, which caps thinking and the answer combined. With a tight `max_tokens` (cost rule 7), thinking can use up the budget and cut the JSON off.
- Haiku 5.5 accepts `thinking: {type: "disabled"}` at effort `high` or below. Its default effort is `medium`.
- Sonnet 5.5 **rejects `{type: "disabled"}` with a 400**. Its lowest setting is `thinking: {type: "between_tools"}`, accepted at effort `low`, `medium` or `high`. Its default effort is `high`.

So the thinking setting is per model and lives in configuration next to the model ID and `max_tokens`, and each results file records it. A response that stops on `max_tokens` counts as a schema failure, not a retry.

## Complaint handling rules (ACPR)

Sources: [Recommandation 2024-R-02 du 2 juillet 2024 sur le traitement des réclamations](https://acpr.banque-france.fr/fr/publications-et-statistiques/publications/recommandation-2024-r-02-du-2-juillet-2024-sur-le-traitement-des-reclamations) ([PDF](https://acpr.banque-france.fr/system/files/2024-12/20240702_Recommandation_2024-R-02.pdf)); [ACPR review of 2022-R-01](https://acpr.banque-france.fr/fr/actualites/reclamations-bilan-des-travaux-menes-par-lacpr-sur-les-dispositifs-de-traitement-des-reclamations).

- **Reference:** Recommandation 2024-R-02 of 2 July 2024. It repeals and replaces 2022-R-01 of 9 May 2022 from its publication; the ACPR says the change altered the scope of application. The ACPR page was last updated on 24 September 2026 and lists no newer text.
- **Scope:** it applies, among others, to "entreprises d'assurance, aux mutuelles ou unions de mutuelles", so a mutuelle like Mutuelle Ardoise falls under it.
- **Definition:** "Une réclamation se définit comme l'expression d'un mécontentement envers un professionnel quel que soit l'interlocuteur ou le service auprès duquel elle est formulée." And: "Une demande de service ou de prestation, d'information ou d'avis n'est pas une réclamation." This is the test for `is_complaint`. The annex of 2022-R-01 lists borderline cases (a reminder letter about a slow reimbursement is a complaint; a request for documents with no dissatisfaction isn't), and the golden set should include some of them.
- **Acknowledgement:** in writing, within **10 working days** of the written complaint being sent. It isn't needed if the written answer arrives within those 10 days.
- **Answer:** in writing, clear and argued, within the deadline the insurer committed to and in any case within **2 months** of the first written expression of dissatisfaction, unless a law sets a shorter deadline.

## Evaluation method

Source: [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

The guide asks for success criteria that are specific, measurable, achievable and relevant, usually across several dimensions (task fidelity, consistency, privacy, latency, price). For the evals themselves it gives three principles: mirror the real task distribution including edge cases, automate grading where possible, and prefer more cases with automated grading over fewer hand-graded ones. It also advises grading with a different model from the one that produced the output. This repo uses that vocabulary: success criteria, eval set, code-graded and model-graded.

## Docs site toolchain

Sources: [PyPI](https://pypi.org/) pages for each package, checked on 24 November 2026, and the notice mkdocs-material prints on every build.

- Pinned: mkdocs 1.6.1, mkdocs-material 9.8.2, pymdown-extensions 13.1.2, Markdown 3.11.3, with every transitive dependency pinned in `requirements-docs.txt`. The last three need Python 3.11 or later; the Pages workflow uses 3.14.
- mkdocs-material 9.8.2 announces on every build that Material for MkDocs reaches end of life on 5 May 2027, with Zensical named as its successor. That date falls after this engagement ends, so the site stays on Material, the same as the author's other project sites. A longer-lived site would need to move.

## Phase 0 cost estimate

Before `make estimate` exists, this is the planning number. It assumes about 1,500 input tokens per case (instructions, the format system prompt and a French complaint, new tokenizer) and prices output at the full `max_tokens` ceiling, synchronous, no cache.

| `max_tokens` | Haiku 5.5, 30 cases | Sonnet 5.5, 30 cases | Total, worst case |
|---|---|---|---|
| 300 | $0.009 | $0.18 | $0.19 |
| 512 | $0.012 | $0.24 | $0.26 |
| 1,024 | $0.020 | $0.40 | $0.42 |

The triage configuration sets `max_tokens` to 256 for Haiku 5.5 (thinking disabled) and 512 for Sonnet 5.5 (thinking `between_tools`), both at effort `medium`. That makes the planning worst case about $0.008 plus $0.24, roughly $0.25 for both models. Sonnet is about 95% of the cost at every setting. Even a full rerun at 1,024 stays under $1 against the $2 phase 0 budget. `make estimate` replaces these figures with counted input tokens before the baseline runs.

## Gaps between the brief and the sources

| Brief assumed | Source says | What changed |
|---|---|---|
| ACPR recommendation on complaint handling, no reference given; first search found 2022-R-01 | 2024-R-02 replaced 2022-R-01 in 2024 | Cite 2024-R-02. Definition and deadlines are worded as before |
| Anthropic docs at docs.claude.com | Docs now served from platform.claude.com | Links point to platform.claude.com |
| A tight `max_tokens` keeps triage cheap | Thinking is on by default and shares `max_tokens` with the answer; Sonnet 5.5 can't disable it | Thinking set per model in configuration and recorded with results |
| Prompt caching on the fixed part from phase 1 | Prefixes under 512 tokens silently don't cache | Check cache read tokens on the first phase 1 run |
| Structured output token overhead | Not published | Measure with token counting |
| A docs toolchain that lasts | Material for MkDocs reaches end of life on 5 May 2027 | Kept for this engagement, noted on the prerequisites page |
