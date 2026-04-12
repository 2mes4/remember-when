# Changelog - Remember When

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-04-12
### Added
- **New Storage Architecture**: Group-based folder isolation replacing flat `timeline.json`. Each group has its own folder with collections, cross collections, and rules.
- **`install` command**: Initializes `~/.remember-when/` and creates `~/Memories` symlink.
- **`inventory.json`**: Master index of all groups at storage root.
- **`collection.json`**: Per-day file holding entries and daily summary within each group.
- **`collection-index.json`**: Per-group index of all collections/days and cross collections.
- **`rules.json`**: Per-group configuration for cross collection triggers and enrichment settings.
- **Cross Collections**: `create-cross`, `add-to-cross`, `list-cross`, `show-cross` commands for thematic groupings within a group.
- **Group Rules**: `set-rule`, `list-rules` commands for automatic cross collection suggestions based on keyword/location patterns.
- **Contextual Enrichment**: `set-daily-context` command to add weather, news, and historical events to a day's collection.
- **Entry Enrichment**: `enrich-entry` command to add history, location, and type data to specific entries (especially `interest_point`).
- **Enrichment Deduplication**: `findEnrichedInterestPoint` to avoid re-enriching the same place within a group.
- **Enrichment Configuration**: Default settings in `rules.json` with `dailyContext` and `interestPoints` sections.
- **30 tests**: Comprehensive unit and E2E test coverage for all commands.

### Changed
- **BREAKING**: Storage architecture completely redesigned. Old `timeline.json` format is no longer used. Fresh start required.
- **BREAKING**: `add` command now stores entries in `<group>/<YYYY-MM-DD>/collection.json` instead of a central timeline.
- **BREAKING**: `set-group-info` now creates a full group folder structure (including `cross/` directory and `rules.json`).

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

## [1.1.8] - 2026-04-10
### Added
- Comprehensive E2E test case verifying the full workflow: archiving media, auditing inventory, and updating group context.
- Enhanced installation guide in the documentation web with specific OpenClaw channel configuration requirements (`requireMention: false`).

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
