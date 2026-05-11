# TRC Enterprise AI Help Desk Assistant

An AI-powered, locally-hosted internal tool designed for the SMSU Technology Resource Center (TRC). It consolidates TDX, AD, SCCM, and Juniper Mist diagnostics into a single intelligent interface.

## 🚀 Key Features

- **Intelligent Chat**: Get TDX ticket classifications and step-by-step resolution guidance.
- **Enterprise Lookups**: Real-time queries for Active Directory, SCCM, and Juniper Mist clients.
- **Self-Learning KB**: Drag-and-drop CSV/JSON documentation to teach the AI new institutional knowledge.
- **Campus Wayfinding**: Interactive walking directions and PDF floor plans for campus buildings.
- **SLA Monitoring**: AI-driven urgency detection and automated notifications for critical tickets.
- **Role-Based Access**: Granular permissions for Help Desk, Tech, WAG, and Admin staff.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python (FastAPI, Uvicorn)
- **Database**: SQLite (Concurrent enterprise-ready storage)
- **AI Engine**: Ollama (Running `phi3:mini` locally)
- **Integrations**: PowerShell (AD/SCCM), REST APIs (Mist)

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
