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
- **Premium Glassmorphic UI**: High-fidelity interface with animated background meshes, frosted-glass effects, and dynamic telemetry visualizations.
- **Full Mobile Responsiveness**: A complete mobile-first design with slide-out navigation and adaptive grid layouts for smartphones and tablets.
- **Productivity Shortcuts**: Instant global access via `Ctrl + K` (Focus AI Command Bar) and `Ctrl + 1-9` (Module Navigation).
- **Session Intelligence**: Real-time active session duration tracking and automated permission synchronization on every login.
- **Unified Connectivity Graph**: "Everything is Connected." The AI engine automatically traverses Active Directory, TDX, SCCM, Jamf Cloud, and Cisco ISE to build full relationship maps (User ➔ Device ➔ Network IP ➔ Physical Switch/AP).
- **Intelligent Orchestration**: Automatically detects user intent (AD lookup, SCCM/Jamf search, WiFi status, KB search, Entity Trace).
- **Deep Search**: Headless scraping of the StarID Admin Portal for extended user profiles.
- **Remote Actions**: Trigger SCCM policy syncs, update scans, and device restarts directly from chat, with built-in Apple device management via Jamf.
- **Modular Permissions**: Granular role-based access for Help Desk, Tech, WAG, and SysAdmin staff.
- **Knowledge Ingestion**: Drag-and-drop documentation into the AI's brain for instant learning.
- **Premium Customization Suite**: Personalize appearance using curated themes (Cyberpunk, Nordic, Amethyst, Dracula), Font Typography (Inter, Outfit, Roboto Mono, Playfair), and Glassmorphic Intensity levels.
- **Integration API Gateway (Webhook)**: Built-in `POST /api/integration/query` programmatic endpoint to let external messaging bots (MS Teams, Discord, Slack) or autonomous frameworks (like OpenClaw) query your local knowledge bases and records instantly.

## 🛠️ Tech Stack
- **Backend**: Python (FastAPI, Playwright, SQLAlchemy)
- **Frontend**: HTML5, Vanilla CSS, Javascript (Custom cache-busting, local storage persistence)
- **Database**: SQLite (Session management, Role assignments, automated indexing, self-healing startup migrations)
- **AI**: Local LLM Integration (Ollama) + Custom Reasoning Adapters
- **Autonomous Orchestration Connection**: Built-in compatibility with **OpenClaw (Antigravity)** agent workflows for autonomous multi-turn engineering and local data manipulation.

## 🔒 Security
The platform is designed with enterprise security in mind:
- **Zero-Plaintext Secrets**: All API keys, AD passwords, and integration tokens in `config.json` are AES-128 encrypted via a machine-bound `security.py` manager.
- **Zero-Trust UI**: All sensitive actions (Remote Restarts, Deep Searches) are restricted to authorized AD roles.
- **Local-First**: Sensitive data remains within the campus network.
- **Human-in-the-Loop Governance**: This is the ultimate IT support AI, but **NO CHANGES** may be made to the system architecture or configurations without explicit, documented approval from **Wag**. Additionally, all destructive remote actions (AD Unlocks, PC Restarts) enforce a **WAG Approval PIN Modal** before executing.

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
