<h1 align="center">claude-evals-mutuelle: Claude on French insurance complaints</h1>

<p align="center">
  <b>Success criteria · Labelled French eval set · Cost per 1,000 complaints</b>: an evaluation-led pre-sales engagement for a fictional French mutual insurer<br/>
  Evals before prompts · Code graders first · Smallest model that meets the target
</p>

<p align="center">
  <a href="https://yassineteimi.github.io/claude-evals-mutuelle/"><b>📖 Read the site →</b></a>
</p>

---

> **Work in progress, phase 0 of 4. Not yet run against the Claude API.**

Mutuelle Ardoise is a fictional French mutual health insurer whose customer service director wants to know one thing before buying: can Claude sort incoming complaints and draft replies in French without missing a regulatory deadline or leaking a member's health details? This repo answers that the way a pre-sales engagement would. The success criteria come first, agreed before any prompt work, then a labelled eval set, an eval harness, a Haiku against Sonnet comparison with its cost per 1,000 complaints, and finally a deployment decision and a go or no-go. Phase 0 covers complaint triage only; reply drafting starts in phase 1.

The customer, its members, policies and complaints are all invented. [docs/simulated.md](docs/simulated.md) lists what is simulated, and [docs/findings.md](docs/findings.md) lists what I checked against Anthropic's docs and the ACPR before writing code.

## 🧭 The phases

| Phase | Adds | Status |
| --- | --- | --- |
| 0 | Discovery, success criteria, 30 labelled French complaints, triage on the Claude API, code graders, Haiku against Sonnet baseline | In progress |
| 1 | Reply drafting with retrieval over policy extracts, rubric grader checked against human labels, 150 cases, prompt caching, Batch | Not started |
| 2 | Adversarial cases, PII redaction before logging, tracing | Not started |
| 3 | Haiku, Sonnet and Opus on 150 cases through Batch, cost per 1,000 complaints, mock CRM over MCP | Not started |
| 4 | Deployment decision with EU data handling, go or no-go memo | Not started |

## 🗂️ Repository layout

```text
claude-evals-mutuelle/
├── app/        # triage: one complaint in, schema-valid JSON out
├── data/       # fictional French cases, policy extracts, the triage schema
├── evals/      # runner, code graders, cost ledger, report
├── tests/      # offline tests through a stub client, no API key
├── results/    # committed run outputs and costs.csv
└── docs/       # 📖 the published GitHub Pages site (MkDocs Material)
```

## 🚀 Quick start

The offline tests and the paid baseline arrive with the phase 0 code. For now you can build the site locally:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-docs.txt
.venv/bin/mkdocs build --strict
```

## 🔐 Secrets and spend

The phase 0 harness is in progress, and this is its design. The API key stays in a gitignored `.env`, read only by the paid targets. Tests and CI go through a stub client, so they never call the API and need no key. Every paid run is estimated first with the free token counting endpoint, then logged in `results/costs.csv`.

## 🛠️ Stack

![Claude API](https://img.shields.io/badge/Claude_API-191919?logo=anthropic&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![MkDocs Material](https://img.shields.io/badge/MkDocs_Material-526CFE?logo=materialformkdocs&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

## 📫 Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/yassine-teimi)

---
<p align="center"><sub>Independent work, not affiliated with or endorsed by Anthropic or the ACPR. Mutuelle Ardoise and everything about it are fictional.</sub></p>
