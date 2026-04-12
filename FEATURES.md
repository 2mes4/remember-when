# Features - Remember When

## Core Capabilities
- **Local Storage**: Everything is stored on your machine in `~/.remember-when/` (symlinked as `~/Memories`). No cloud dependencies for your data.
- **Group Isolation**: Each group has its own folder, collections, cross collections, and rules. Data never mixes between groups.
- **Daily Collections**: Automatic folder creation (`YYYY-MM-DD`) per group, with `collection.json` holding entries and daily summaries.
- **Multimedia Support**: Seamless handling of photos, videos, audio notes, and text.
- **Interest Points**: Dedicated `interest_point` type for capturing places, locations, addresses, and geographic points of interest.
- **Rich Summaries**: Agent-generated descriptions that provide context beyond simple file names.
- **Daily Chronicles**: Consolidated summaries of what happened each day in each group.
- **Inventory Audit**: Command-line tool to identify missing group info or gaps in daily chronicles.
- **Agent Autonomy**: Designed for agents to proactively fill in missing context.
- **Cross Collections**: Thematic groupings of entries across different days within the same group (e.g., "Viatge a Paris").
- **Group Rules**: Configurable triggers (keyword, location) that automatically suggest or create cross collections.
- **Contextual Enrichment**: Agent-searched complementary information (weather, history, news) stored at collection and entry level.
- **Enrichment Deduplication**: Interest points are enriched only once per group; subsequent mentions skip redundant searches.
- **Install Command**: `remember-when install` initializes storage and creates the `~/Memories` symlink.

## Behavioral Features
- **Proactive Archiving**: The agent detects valuable information (places, photos, agreements, points of interest) and offers to archive it without waiting for explicit instructions.
- **Archiving Context Buffer**: The agent remembers the last active group, so users don't need to specify the group name every time they say "archive this".
- **Interview Workflow**: Pre-flight validation ensures group context (`set-group-info`) exists before archiving. If missing, the agent asks the user for the required info.
- **Post-action Validation**: After every archival, the agent presents a summary and asks if additional metadata is needed.
- **Duplicate Prevention**: The agent validates system state via `inventory` before archiving files, preventing duplicates in the timeline.
- **Validation Questions API**: The agent has explicit permission to ask confirmation questions before bulk archiving, overwrites, or destructive operations.

## Agent Configuration
- **AGENTS.md Integration**: Context buffer configuration for seamless group-aware archiving.
- **TOOLS.md Integration**: Explicit read/write permissions for the `remember-when` CLI (`~/.remember-when/`, `/media/inbound/`, `/media/outbound/`).
- **HEARTBEAT.md Integration**: Periodic scan of `/media/inbound/` for unprocessed files, making the agent genuinely proactive.

## Documentation & UX
- **Bento Grid Design**: Modern, clean documentation web.
- **Multi-language**: Support for English, Catalan, Spanish, Portuguese, French, Chinese, Japanese, Arabic, Hindi, Malayalam, and Russian.
- **Auto-Installation**: One-line command to add skills to OpenClaw via `skills.sh`.
- **Channel Configuration Guide**: Step-by-step instructions for setting up OpenClaw channels with `requireMention: false`.

## Upcoming Features (Roadmap)
- [ ] **Semantic Search**: Search your memories using natural language.
- [ ] **Web Dashboard**: Local interface to browse the timeline visually.
- [ ] **Export Tools**: Convert daily chronicles into PDF or Markdown reports.
