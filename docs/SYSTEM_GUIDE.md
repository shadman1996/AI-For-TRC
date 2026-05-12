# 📖 TRC AI Assistant — System Guide

Welcome to the documentation for the **SMSU TRC Enterprise AI Assistant**. This platform is designed to streamline IT support workflows for student workers and full-time staff.

## 🚀 Quick Start
- **[🎙️ Prompting Guide](PROMPTING.md)**: Learn how to talk to the AI to get the best results.
- **[🧩 Module Overview](MODULES.md)**: Understand what each component does and how it integrates with campus systems.
- **[🔒 Security & Roles](SECURITY.md)**: Learn about permissions, role-based access, and how to manage users.

---

## 🏗️ Architecture Overview
The system follows a **Modular Client-Server Architecture**:
- **Backend**: FastAPI (Python) serving as the orchestration layer between the UI and campus APIs (AD, SCCM, Mist, TDX).
- **Frontend**: A modern, responsive web dashboard built with Vanilla JS and CSS for maximum portability.
- **Database**: SQLite for persistent session and user management.
- **AI Engine**: Local LLM (via Ollama) or Remote OpenAI/Azure adapters for intelligent reasoning.

## 🛠️ Management
- **Admin Panel**: Accessible via the ⚙️ icon for SysAdmins. Manage StarID permissions and see system status.
- **Configuration**: Managed via `config.json` for API endpoints and persistent credentials.
