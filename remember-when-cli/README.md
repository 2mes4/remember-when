# Remember When - Storage CLI

The persistence engine for the **Remember When** digital memory system. This Node.js CLI handles local file organization, group-based storage, cross collections, contextual enrichment, and inventory auditing.

## 📦 Installation

Install globally to enable the `remember-when` command system-wide:

```bash
npm install -g remember-when-cli
```

Then initialize storage:

```bash
remember-when install
```

This creates `~/.remember-when/` and a `~/Memories` symlink.

## 🛠 Command Reference

### `install`
Initializes the storage root and creates the `~/Memories` symlink.
```bash
remember-when install
```

### `add`
Registers a new entry and optionally copies a file to the group's daily collection.
```bash
remember-when add -g "Friends" -t "photo" -s "Juan" -r "Beach day" -f "/tmp/img.jpg"
```

### `set-group-info`
Creates or updates a group with description and participants.
```bash
remember-when set-group-info -g "Friends" -d "Local hangout crew" -p "Juan, Eric, Maria"
```

### `set-daily-summary`
Adds a high-level summary of what happened during a specific day.
```bash
remember-when set-daily-summary -g "Friends" -d "2026-04-10" -s "We planned the summer trip."
```

### `set-daily-context`
Adds contextual information (weather, news, historical events) to a day.
```bash
remember-when set-daily-context -g "Friends" -d "2026-04-10" --weather "28C sunny" --news "Local festival" --historical-events "April 10: First subway opened"
```

### `enrich-entry`
Adds enrichment data (history, location, type) to a specific entry.
```bash
remember-when enrich-entry -g "Friends" --date 2026-04-10 --entry-id abc123 --history "Built in 1923" --enrich-type "Monument" --location "Barcelona"
```

### `inventory`
Audits all groups, collections, and missing information.
```bash
remember-when inventory
```

### `create-cross`
Creates a cross collection within a group.
```bash
remember-when create-cross -g "Friends" -n "summer-trip" --display-name "Summer Trip 2026" -d "All summer trip moments"
```

### `add-to-cross`
Adds an entry reference to a cross collection.
```bash
remember-when add-to-cross -g "Friends" -c "summer-trip" --date 2026-04-10 --entry-id abc123
```

### `list-cross`
Lists all cross collections in a group.
```bash
remember-when list-cross -g "Friends"
```

### `show-cross`
Shows the resolved entries of a cross collection.
```bash
remember-when show-cross -g "Friends" -c "summer-trip"
```

### `set-rule`
Adds a rule for automatic cross collection suggestions.
```bash
remember-when set-rule -g "Friends" --trigger keyword --pattern "viatge|viaje|trip" --action suggest-cross --cross-collection trips
```

### `list-rules`
Lists all rules for a group.
```bash
remember-when list-rules -g "Friends"
```

## 📂 Storage Architecture

All data is stored in `~/.remember-when/` (symlinked as `~/Memories`):

```
~/.remember-when/
├── inventory.json                         (master index of all groups)
├── <Group-Name>/
│   ├── collection-index.json              (index of collections/days + cross refs)
│   ├── rules.json                         (rules + enrichment config)
│   ├── <YYYY-MM-DD>/
│   │   ├── collection.json                (entries + daily summary + daily context)
│   │   └── <files>                        (physical media files)
│   └── cross/
│       └── <slug>.json                    (cross collection references)
```

### Groups are fully isolated
Data from one group never mixes with another.

## 🧪 Testing
```bash
npm test
```
