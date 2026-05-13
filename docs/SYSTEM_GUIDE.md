# 📖 TRC AI Assistant — System Guide

Welcome to the documentation for the **SMSU TRC Enterprise AI Assistant**. This platform is designed to streamline IT support workflows for student workers and full-time staff.

## 🚀 Quick Start
- **[🎤 Prompting Guide](PROMPTING.md)**: Learn how to talk to the AI to get the best results.
- **[🧩 Module Overview](MODULES.md)**: Understand what each component does and how it integrates with campus systems.
- **[🔒 Security & Roles](SECURITY.md)**: Learn about permissions, role-based access, and how to manage users.

---

## 🏗️ Architecture Overview
The system follows a **Modular Client-Server Architecture**:
- **Backend**: FastAPI (Python) serving as the orchestration layer between the UI and campus APIs (AD, SCCM, Jamf Cloud, Mist, TDX, Cisco ISE).
- **Frontend**: A modern, responsive web dashboard built with Vanilla JS and CSS for maximum portability.
- **Database**: SQLite (`trc_ai.db`) for persistent session, user, and knowledge management. No flat-file JSON stores.
- **AI Engine**: Local LLM (via Ollama) or Remote OpenAI/Azure adapters for intelligent reasoning.
- **Security Layer**: `security.py` handles AES-256 encryption/decryption of all API credentials at runtime.

## 🛠️ Management
- **Admin Panel**: Accessible via the ⚙️ icon for SysAdmins. Manage StarID permissions and see system status.
- **Configuration**: Managed via `config.json` (AES-256 encrypted values) for API endpoints and credentials.
- **HITL Governance**: All destructive remote actions require WAG Approval PIN before execution. See [Security Guide](SECURITY.md).
