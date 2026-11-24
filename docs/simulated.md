# What is simulated

Status on 24 November 2026: nothing in this repo has been run against the Claude API yet. When the phase 0 baseline runs, this page and the README status line change on the same commit, and every results table names its run date, model IDs, prompt version and cost.

| What | Real or simulated | Where it appears |
|---|---|---|
| Mutuelle Ardoise, the customer | Fictional. No real insurer, client or employer is behind it | Every doc |
| Its members and their complaints | Fictional French messages written for this repo, labelled by hand. Each data file says so in its first line | `data/cases/` |
| Its policy terms | Fictional short extracts, written to look like French mutual insurance terms | `data/policies/` |
| Complaint volumes, current process, team size | Invented for the discovery note, and labelled as invented there | `docs/engagement/` |
| Health details in complaints | Invented. No real person, no real health data | `data/cases/` |
| Model calls in the tests | A stub client returns canned answers with realistic usage fields, so tests and CI never call the API and need no key | `tests/` |
| Regulatory deadlines | Real: ACPR Recommandation 2024-R-02 (10 working days to acknowledge, 2 months to answer), see [findings.md](findings.md) | Success criteria, reply drafting from phase 1 |
| Model IDs and prices | Real, checked on the Anthropic pricing page on 24 November 2026, see [findings.md](findings.md) | Cost estimates and results |
