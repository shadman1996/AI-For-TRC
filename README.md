# 🐎 TRC Enterprise AI Assistant
**SMSU Technology Resource Center — Intelligent Help Desk Platform**

An AI-powered orchestration platform designed to streamline IT support at Southwest Minnesota State University. This assistant integrates campus-wide systems (AD, SCCM, Mist, StarID Admin) into a unified, secure chat interface.

## 📖 Documentation
Detailed guides are available in the [docs/](docs/SYSTEM_GUIDE.md) directory:
- [🎙️ Prompting Guide](docs/PROMPTING.md)
- [🧩 Module Documentation](docs/MODULES.md)
- [🔒 Security & RBAC](docs/SECURITY.md)
- [🛠️ System Guide](docs/SYSTEM_GUIDE.md)

## 🚀 Core Features
- **Intelligent Orchestration**: Automatically detects user intent (AD lookup, SCCM search, WiFi status, KB search).
- **Deep Search**: Headless scraping of the StarID Admin Portal for extended user profiles.
- **Remote Actions**: Trigger SCCM policy syncs and update scans directly from chat.
- **Modular Permissions**: Granular role-based access for Help Desk, Tech, WAG, and SysAdmin staff.
- **Knowledge Ingestion**: Drag-and-drop documentation into the AI's brain for instant learning.

## 🛠️ Tech Stack
- **Backend**: Python (FastAPI, Playwright, SQLAlchemy)
- **Frontend**: HTML5, Vanilla CSS, Javascript
- **Database**: SQLite (Session management, Role assignments)
- **AI**: Local LLM Integration (Ollama) + Custom Reasoning Adapters

## 🔒 Security
The platform is designed with enterprise security in mind:
- **Zero-Trust UI**: All sensitive actions (Remote Restarts, Deep Searches) are restricted to authorized roles.
- **Local-First**: Sensitive data remains within the campus network.
- **Credential Isolation**: All API keys and portal passwords are encrypted/stored in `config.json`.

## 💻 Installation & Setup

### Prerequisites
1. [Python 3.10+](https://www.python.org/)
2. [Ollama](https://ollama.com/) (installed and running)
3. Windows environment with PowerShell access (for AD/SCCM lookups)

### Local Launch
1. Clone the repository.
2. Ensure Ollama is running (`ollama serve`).
3. Run the application:
   ```bash
   start_ai.bat
   ```
4. Access via browser: `http://localhost:8001`

## 🌐 Network Deployment (Live Mode)

To make the assistant available to other TRC staff on the campus network:

1. **Firewall**: Run `setup_firewall.bat` as Administrator to open Port 8001.
2. **Launch**: Start the server using `start_ai.bat`.
3. **Connect**: Colleagues can connect using your LAN IP (e.g., `http://10.x.x.x:8001`).
   - Find your Live URL in the **Admin Panel > Deployment Dashboard**.

### 🏢 Future Production Deployment (SMSU Server)
Currently, the application is designed to run locally on a primary PC with network sharing. A planned future update involves migrating the `FastAPI` server and `Ollama` engine to a dedicated **SMSU Server**.
- **Why?** Moving to a central university server will allow the use of larger, more powerful LLM models (e.g., Llama 3 8B or 70B) for significantly faster inference times and smarter reasoning, without stressing local student worker PCs.
- **Impact:** The frontend will remain identical, but `config.json` will be updated to point the API endpoints to the central server.

## 📄 Documentation

- [Project Summary](TRC_AI_Project_Summary.md): Detailed business value and roadmap.
- [Changelog](CHANGELOG.md): History of all major changes from v1.0 to today.

## ⚖️ License
Internal Use Only — SMSU Technology Resource Center.
