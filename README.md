# HackHub Save Editor

[![Latest Release](https://img.shields.io/github/v/release/VoIcanis/hackhub-save-editor?style=for-the-badge)](https://github.com/VoIcanis/hackhub-save-editor/releases/latest) ![License](https://img.shields.io/github/license/VoIcanis/hackhub-save-editor?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=for-the-badge&logo=tauri&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Mantine](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white)

---

A cross-platform (untested 🤞) desktop application for viewing, editing, and exporting save files from HackHub. Built with **Tauri**, **React**, and **TypeScript**, with a modern UI powered by **Mantine**.

## Features

- **Load & Parse** - Open HackHub save files (`.hhsav`) and view their contents
- **Edit Data** - Modify game data directly in the editor
- **Export Files** - Save your changes as `.hhsav` or `.json`
- **Dark Mode** - Modern dark-themed UI with syntax-highlighted code blocks
- **JSON Syntax Highlighting** - Code blocks with language highlighting via highlight.js

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Mantine v8.3
- **Desktop**: Tauri v2
- **Code Highlighting**: highlight.js with Mantine code-highlight
- **Icons**: Tabler Icons
- **Backend**: Rust (Tauri Commands)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+) *tested against 24.13*
- [Rust](https://www.rust-lang.org/tools/install)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/VoIcanis/hackhub-save-editor.git
   cd hhsv
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run tauri dev
   ```

### Building

Create a production build:
```bash
npm run tauri build
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

This project is licensed under the **CC0 1.0 Universal** License - see the [LICENSE](https://github.com/VoIcanis/hackhub-save-editor/blob/main/LICENSE) file for details.
