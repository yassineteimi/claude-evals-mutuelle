# Decision records

One page per real choice, with at least two genuine alternatives. Written for an applied AI architect who wants to know why, not what.

| ADR | Decision | Phase | Status |
|---|---|---|---|
| [0001](0001-evals-before-prompt-tuning.md) | Success criteria and the eval set before any prompt work; triage starts on the smallest model that meets the target | 0 | proposed |
| 0002 | Grading replies: code graders plus a Claude rubric grader checked against human labels, against human review only | 1 | not started |
| 0003 | Keeping eval runs cheap: saved responses, a 30-case development set, prompt caching and Batch for full runs, against rerunning everything synchronously | 1 | not started |
| 0004 | Where PII redaction runs: before the model call, or only before logging and tracing | 2 | not started |
| 0005 | One model for triage and drafting, or a different model for each step | 3 | not started |
| 0006 | Deployment route for EU data handling: Claude API, Amazon Bedrock or Google Vertex AI | 4 | not started |
