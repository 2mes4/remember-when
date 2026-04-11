# Changelog - Remember When

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-11
### Added
- **Proactive Archiving**: Agent detects valuable content (places, photos, agreements, points of interest) and offers to archive autonomously.
- **Archiving Context Buffer**: Agent uses last active group as default context when user says "archive this" without specifying a group.
- **Pre-flight Check (Interview Workflow)**: Agent verifies `set-group-info` exists before archiving; stops and asks if missing.
- **Post-action Validation**: Agent presents summary after every `add` and asks for optional metadata.
- **Duplicate Prevention**: Agent validates via `inventory` before archiving to avoid duplicates.
- **`interest_point` type**: New documented entry type for places, locations, addresses, and geographic points of interest.
- **Validation Questions API**: Explicit permission for the agent to ask confirmation before bulk archiving or destructive operations.
- **Agent Configuration Requirements**: Instructions for internal `AGENTS.md`, `TOOLS.md`, and `HEARTBEAT.md` configuration.
- **OpenClaw Channel Config**: Web documentation now includes `requireMention: false` setup step.
- **Multimedia Capture Workflow**: Explicit download → `add --file` → confirm pipeline.

## [1.1.6] - 2026-04-10
### Added
- Explicit Security & Privacy Statement in `SKILL.md` to reduce VirusTotal false positives.
- Triple installation method interface in documentation web (Clawhub, skills.sh, OpenClaw).
- Favicon and advanced SEO metatags.
- Japanese, Arabic, Hindi, Malayalam, and Russian translations.
- Reordered installation tabs for better user experience.

## [1.1.1] - 2026-04-10
### Added
- Multi-language support for the documentation web (EN, CA, ES, PT, FR, ZH).
- Automatic language detection based on browser settings.
- Navigation bar with links to 2mes4.com and GitHub repository.
- Support for group context information and daily summaries in the CLI.
- Inventory command to audit missing group descriptions and daily chronicles.
- Protocol for Agents (`AGENTS.md`) for autonomous digital archiving.
- Automatic installation support via `skills.sh`.

## [1.0.0] - 2026-04-10
### Added
- Initial release of `remember-when-cli`.
- Initial release of `remember-when-skill` for OpenClaw.
- Local storage architecture with daily folder organization.
- Basic `timeline.json` for memory tracking.
- Documentation web with Bento Grid design.
