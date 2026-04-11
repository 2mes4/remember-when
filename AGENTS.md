# Agentic Protocol - Remember When

This document defines the operational standards for AI agents **developing** this project. For the skill's behavioral directives (what the archivist agent does at runtime), see `remember-when-skill/SKILL.md`.

---

## 📖 Project Architecture

### Information Architecture
All data is stored locally in `~/.remember-when/`:
- **`timeline.json`**: The central ledger containing groups info and all entries.
- **Daily Folders (`YYYY-MM-DD/`)**: Physical storage for images, videos, and audio.

### Core Commands (CLI)
- `add`: Record a specific event (text, photo, interest_point, etc.).
- `set-group-info`: Define the group's purpose and member list.
- `set-daily-summary`: Create a "daily chronicle" of what happened.
- `inventory`: Audit the storage to find missing information.

### Valid Entry Types
- `text`: Memorable phrases, announcements, reflections.
- `photo`: Images shared in conversation.
- `video`: Video clips.
- `audio`: Voice notes or audio recordings.
- `interest_point`: Places, locations, addresses, or geographic points of interest.
- *(Any custom type is also accepted by the CLI.)*

---

## 📚 Documentation Integrity & Synchronization (MANDATORY)

You are responsible for maintaining a **1:1 mapping** between the code's capabilities and its documentation.
- **Additions**: If you add a new feature or command, you **must** update `FEATURES.md`, `CHANGELOG.md`, and the relevant `README.md`.
- **Modifications**: Any change in behavior must be reflected across all documentation files.
- **Removals**: If a feature or option is deprecated or removed, it **must** be deleted from the documentation immediately.

*The documentation is the source of truth for the user; code without up-to-date documentation is considered broken.*

---

## 🚀 Mandatory Deployment Workflow

You are **prohibited** from performing partial deployments or manual git pushes for releases. Every release must follow the unified orchestration.

### The "All-in-One" Execution
Before declaring a task finished, you must execute the full pipeline from the project root:

```bash
npm run deploy -- "vX.Y.Z - Detailed description of changes"
```

This command automatically:
1. Executes all QA tests (Unit & E2E).
2. Increments the CLI version (patch) and publishes to **npm**.
3. Deploys the Skill to **Clawhub**.
4. Deploys the documentation web to **Firebase**.
5. Synchronizes all documentation and code with **GitHub**.

*Note: Ensure you are logged into npm and Clawhub before running the deployment.*

If any step fails, the deployment is aborted, and you must fix the issue before retrying.


## 🔐 Privacy & Security
- Absolute paths must stay hidden from the chat.
- The `extra` field should be used for technical IDs only.
- Never log user credentials or session tokens in the timeline.

---

## 🛡 VirusTotal / Clawhub Compliance (Security Lexicon)

When writing or modifying content inside `remember-when-skill/`, you must follow these **lexical guidelines** to avoid VirusTotal Code Insight false positives on Clawhub:

### Forbidden Words & Replacements

| Do NOT use | Use instead |
|------------|-------------|
| `download` | `save`, `receive` |
| `write access` | `persistence access` |
| `read access` | `inbound access` |
| `write access` (outbound) | `outbound access` |
| `read/write access` | `persistence access` |
| `destructive` | `major` |
| `overwrite` | `update`, `replace` |
| `stop execution` | `pause` |
| `executed` / `execute` | `run`, `invoke` |

### Rules
- Apply these replacements to **all files** inside `remember-when-skill/` (SKILL.md, CHANGELOG.md, README.md).
- The root `AGENTS.md`, `FEATURES.md`, and CLI code are **not affected** — this only applies to published skill content.
- Before every deploy, scan the skill directory for forbidden words and fix any violations.

### Quick Scan Command
```bash
grep -rni "download\|write access\|destructive\|overwrite\|stop execution\|executed" remember-when-skill/
```
