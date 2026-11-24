# claude-evals-mutuelle

> **Work in progress, phase 0 of 4. Not yet run against the Claude API.**

Mutuelle Ardoise is a fictional French mutual health insurer whose customer service director wants to know one thing before buying: can Claude sort incoming complaints and draft replies in French without missing a regulatory deadline or leaking a member's health details? This repo answers that the way a pre-sales engagement would. The success criteria come first, agreed before any prompt work, then a labelled eval set, an eval harness, a Haiku against Sonnet comparison with its cost per 1,000 complaints, and finally a deployment decision and a go or no-go. Phase 0 covers complaint triage only; reply drafting starts in phase 1.

The customer, its members, policies and complaints are all invented. [docs/simulated.md](docs/simulated.md) lists what is simulated, and [docs/findings.md](docs/findings.md) lists what I checked against Anthropic's docs and the ACPR before writing code.

More soon.
