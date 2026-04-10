# Remember When - Storage CLI

The persistence engine for the **Remember When** digital memory system. This Node.js application handles local file organization, automatic folder structure, and the master timeline ledger.

## 📦 Installation

Install globally to enable the `remember-when` command system-wide:

```bash
cd remember-when-cli
npm install -g .
```

## 🛠 Command Reference

### `add`
Registers a new event and optionally moves a file to the permanent local archive.
```bash
remember-when add -g "Friends" -t "photo" -s "Juan" -r "Beach day" -f "/tmp/img.jpg"
```

### `set-group-info`
Defines the purpose and participants of a group.
```bash
remember-when set-group-info -g "Friends" -d "Local hangout crew" -p "Juan, Eric, Maria"
```

### `set-daily-summary`
Adds a high-level summary of what happened during a specific day.
```bash
remember-when set-daily-summary -g "Friends" -d "2026-04-10" -s "We planned the summer trip."
```

### `inventory`
Audits the storage and highlights missing metadata or gaps in chronicles.
```bash
remember-when inventory
```

## 📂 Storage Architecture

All data is stored in your home directory: `~/.remember-when/`

### 1. `timeline.json`
The master index of all your memories.
```json
{
  "groups": {
    "Friends": {
      "info": { "description": "...", "participants": [] },
      "daily_summaries": { "2026-04-10": "..." }
    }
  },
  "entries": [
    { "id": "...", "type": "...", "summary": "...", "file": "2026-04-10/123-img.jpg" }
  ]
}
```

### 2. Daily Folders
Media files are copied to `~/.remember-when/YYYY-MM-DD/` with unique timestamps to prevent name collisions.

## 🧪 Testing
```bash
npm test
```
