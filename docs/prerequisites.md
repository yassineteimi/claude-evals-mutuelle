# Prerequisites

What you need depends on what you want to do. Reading the site needs nothing. Building the site needs Python. Only a paid run needs an API key.

| To | You need | Status |
|---|---|---|
| Read the site and the repo | A browser | Works now |
| Build this site locally | Python 3.11 or later (`mkdocs-material` 9.8.2 requires it), git | Works now, steps below |
| Run the offline tests | Python 3.11 or later, `make`. No API key: tests go through a stub client | Arrives with the phase 0 code |
| Run the paid baseline | The above, plus an Anthropic API key in a gitignored `.env` | Arrives with the phase 0 code. Each paid run is estimated first with `make estimate`, which counts tokens for free |

The site is written and tested on macOS with zsh, so the commands use `python3`, never a bare `python`.

## Build the site locally

Clone the repo and install the pinned docs dependencies into a virtual environment kept inside the repo (`.venv/` is gitignored):

```{ .sh .terminal }
$ git clone https://github.com/yassineteimi/claude-evals-mutuelle.git
$ cd claude-evals-mutuelle
$ python3 -m venv .venv
$ .venv/bin/pip install -r requirements-docs.txt
```

Build in strict mode. Strict mode turns broken links and missing pages into errors, and the deploy workflow runs the same command:

```{ .sh .terminal }
$ .venv/bin/mkdocs build --strict
```

```text title="Expected output (after a notice from Material for MkDocs about its end of life)"
INFO    -  Cleaning site directory
INFO    -  Building documentation to directory: .../claude-evals-mutuelle/site
INFO    -  Documentation built in 0.17 seconds
```

To read the site in a browser while you edit, run the dev server and open <http://127.0.0.1:8000/claude-evals-mutuelle/>. It keeps running in that terminal until you stop it with Ctrl+C:

```{ .sh .terminal }
$ .venv/bin/mkdocs serve
```

## Versions

| Tool | Version | Checked |
|---|---|---|
| mkdocs | 1.6.1 | PyPI, 2026-11-24 |
| mkdocs-material | 9.8.2 | PyPI, 2026-11-24 |
| pymdown-extensions | 13.1.2 | PyPI, 2026-11-24 |
| Markdown | 3.11.3 | PyPI, 2026-11-24 |
| `anthropic` Python SDK | 2.13.0 | PyPI, 2026-11-24, see [findings](findings.md#python-sdk) |

`requirements-docs.txt` pins these and every package they pull in.

!!! note "A finding from the build"
    Material for MkDocs prints a notice on every build: it reaches end of life on 5 May 2027, with critical fixes until then, and its team points to Zensical as the successor. That date is after this project ends, so the site stays on MkDocs Material for consistency with the author's other sites.
