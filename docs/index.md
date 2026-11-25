# Evaluating Claude on French insurance complaints

!!! warning "Work in progress, phase 0 of 4. Not yet run against the Claude API."
    The customer, its members, policies and complaints are all invented. [What is simulated](simulated.md) lists each one. No number on this site is a measured result unless its table names the run date, the model IDs, the prompt version and the cost.

Mutuelle Ardoise is a fictional French mutual health insurer. Its customer service director wants one answer before buying: can Claude sort incoming complaints and draft replies in French without missing a regulatory deadline or leaking a member's health details?

This site answers that the way a pre-sales engagement would. The success criteria come first, agreed before any prompt work. Then come a labelled eval set, an eval harness, a comparison of `claude-haiku-5-5` and `claude-sonnet-5-5` with a cost per 1,000 complaints, and finally a deployment decision and a go or no-go.

## Where it stands

| Phase | Adds | Status |
|---|---|---|
| 0 | Discovery note, success criteria, 30 labelled French complaints, triage on the Claude API, code graders, a Haiku against Sonnet baseline | In progress |
| 1 | Reply drafting with retrieval over policy extracts, a rubric grader checked against human labels, 150 cases, prompt caching, Batch for full runs | Not started |
| 2 | Adversarial cases (prompt injection inside complaints, off-topic messages, health details), PII redaction before logging, tracing | Not started |
| 3 | Haiku, Sonnet and Opus compared once on the 150 cases through Batch, cost per 1,000 complaints, a mock CRM over MCP | Not started |
| 4 | Deployment decision (Claude API, Amazon Bedrock or Google Vertex AI) with EU data handling, a go or no-go memo | Not started |

## Why evals come before prompts

The customer's question has a yes or no answer, and a prompt tuned without a fixed eval set can't give one: every change looks like an improvement on the three examples you happen to try. So this repo follows Anthropic's guide [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests). Targets are written down and approved first. A labelled set is built to match the real mix of complaints, edge cases included. Grading is automated wherever a code check can decide. Each model is then judged against the targets rather than against the other model. Triage starts on the smallest model, and Sonnet has to earn its higher price.

## Pages

- [Discovery](engagement/00-discovery.md): the customer, the decision they need to make, and the constraints that rule options out.
- [Success criteria](engagement/01-success-criteria.md): the triage targets and the labelling guide, approved before any prompt work.
- [Prerequisites](prerequisites.md): what you need to read, test, run or build this repo.
- [Architecture](architecture.md): the phase 0 design and the target design it grows into.
- [Phase 0: triage](phases/phase-0-triage.md): the triage contract, how a complaint is told apart from a request, and the request design.
- [Evaluation](evaluation.md): the eval method, the eval set, grading, and how cost per 1,000 complaints is worked out.
- [Findings](findings.md): what was checked against Anthropic's docs and the ACPR before any code, with links.
- [Decisions](adr/README.md): one record per real choice, with the alternatives that lost.
