# Remember When - Monorepo

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Project: 2mes4](https://img.shields.io/badge/Project-2mes4-orange.svg)](https://2mes4.com)

**Remember When** is an intelligent, privacy-first "Digital Memory" system. It bridges the gap between ephemeral instant messaging (WhatsApp, Telegram) and permanent local storage by combining an **AI Agent (OpenClaw)** with a dedicated **Storage CLI**.

## 🏗 Architecture

The system follows a decoupled architecture where intelligence and persistence are separated:

```text
[ Instant Messaging ] -> [ OpenClaw Agent ] -> [ Remember-When CLI ] -> [ Local Disk ]
      (Source)             (Processing)           (Persistence)          (Data Storage)
```

- **Intelligence Layer (`/remember-when-skill`)**: An OpenClaw Skill that instructs agents to act as archivists, synthesizing conversations and media.
- **Persistence Layer (`/remember-when-cli`)**: A Node.js CLI that manages the physical storage, folder organization, and the master `timeline.json`.
- **Documentation Layer (`/remember-when-web`)**: A multi-language documentation portal deployed on Firebase.

## 🚀 Getting Started

### 1. Global Persistence (CLI)
Install the storage engine on the machine where your agent or local environment runs:
```bash
cd remember-when-cli
npm install -g .
```

### 2. AI Archivist (OpenClaw Skill)
Integrate the archivist logic into your OpenClaw agent automatically:
```bash
npx skills add https://github.com/2mes4/remember-when --skill remember-when-skill
```

### 3. Verification
Run the inventory command to ensure the storage system is initialized:
```bash
remember-when inventory
```

## 📂 Project Structure

| Directory | Purpose | Tech Stack |
|-----------|---------|------------|
| `remember-when-cli` | Persistence engine & storage management | Node.js, Commander, Jest |
| `remember-when-skill` | AI instructions and tool-calling logic | OpenClaw / Markdown |
| `remember-when-web` | Public documentation and install guide | HTML5, CSS3, Vanilla JS |

## 🛡 Privacy & Philosophy
Unlike cloud-based solutions, **Remember When** stores all data in your local `~/.remember-when/` directory. Your memories, photos, and group chronicles never leave your infrastructure unless you explicitly move them.

## 📄 License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
