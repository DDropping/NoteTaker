# NoteTaker

A desktop note-taking app built with Electron and React, inspired by Obsidian. Notes are stored as plain markdown files on your local machine.

## Features

- **Live Markdown Editor** — WYSIWYG-style editing powered by CodeMirror 6. Formatting renders inline as you type (headings, bold, italic, code, blockquotes, lists). Move your cursor to a line to see the raw markdown.
- **Daily Notes** — A daily note opens automatically on launch. Each day gets its own file (`Daily Notes/YYYY-MM-DD.md`) created from a customizable template.
- **Wiki Links** — Link between notes with `[[Note Name]]` syntax. Links render as clickable text; clicking one opens the linked note (or creates it if it doesn't exist).
- **File Tree Sidebar** — Browse all your notes and folders in a collapsible tree. Right-click items to rename, delete, or create new notes/folders.
- **Search** — Search notes by title or content from the sidebar search bar.
- **Dark / Light Theme** — Toggle between themes from the title bar. Your preference persists across sessions.
- **Auto-Save** — Notes save automatically as you type (1-second debounce). Changes also save immediately when switching files or closing the app.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)
- macOS

### Install Dependencies

```bash
npm install
```

### Run in Development

```bash
npm start
```

This launches the app with hot-reload enabled. The Electron window will open automatically.

### Build for macOS

```bash
# Package as a .app bundle
npm run package

# Build a distributable .dmg installer
npm run make
```

The packaged `.app` will be in the `out/` directory. Drag it to your `/Applications` folder to install.

## Where Notes Are Stored

All notes live in `~/NoteTaker` as plain `.md` files:

```
~/NoteTaker/
├── Daily Notes/
│   ├── 2026-02-13.md
│   └── 2026-02-14.md
├── Projects/
│   └── My Project.md
├── Ideas.md
└── .notetaker/          # App config (hidden from sidebar)
    └── config.json
```

You can open this folder in Finder from **Settings > General > Open in Finder**, or browse and edit the files with any text editor.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + N` | Create a new note |
| `Cmd + P` | Focus the search bar |
| `Cmd + ,` | Open settings |

## Daily Note Templates

Open **Settings > Daily Note Template** to customize the template used when a new daily note is created. The template supports these variables:

| Variable | Example Output |
|---|---|
| `{{date}}` | 2026-02-13 |
| `{{longDate}}` | Thursday, February 13th, 2026 |
| `{{time}}` | 14:30 |
| `{{year}}` | 2026 |
| `{{month}}` | February |
| `{{day}}` | 13 |
| `{{weekday}}` | Thursday |

### Default Template

```markdown
# {{longDate}}

## Tasks
- [ ]

## Notes


## Journal

```

## Project Structure

```
src/
├── main/                  # Electron main process
│   ├── ipc/               # IPC handlers (file, config, search)
│   └── services/          # File system, config, search, daily notes
├── preload/               # contextBridge API
├── renderer/              # React app
│   ├── components/
│   │   ├── Editor/        # CodeMirror editor + extensions
│   │   ├── Sidebar/       # File tree + search
│   │   ├── Settings/      # Settings modal + template editor
│   │   └── TitleBar/      # macOS-style title bar
│   ├── context/           # React context (app state, theme)
│   └── hooks/             # Auto-save, search
└── shared/                # IPC channels + shared types
```

## License

MIT
