# 📖 TRC AI Assistant — System Guide
**Document Version:** 2.0 | Updated: May 15, 2026 | Status: 🟢 Production Ready

Welcome to the documentation for the **SMSU TRC Enterprise AI Assistant**. This platform is a secure, locally-hosted knowledge gateway that consolidates SMSU's enterprise IT platforms into a single intelligent interface for TRC staff.

---

## 🚀 Quick Start
- **[🎤 Prompting Guide](PROMPTING.md)**: Learn how to talk to the AI for best results.
- **[🧩 Module Overview](MODULES.md)**: Understand what each component does and how it integrates with campus systems.
- **[🔒 Security & Roles](SECURITY.md)**: Permissions, role-based access, credential encryption, and incident response.
- **[📋 Integration & Policy](TRC_AI_Integration_Security_Policy.md)**: Full integration details, SMSU IT policy compliance, and CIO sign-off document.

---

## 🏗️ Architecture Overview
The system follows a **Modular Client-Server Architecture**:

```
[ Campus LAN — TRC Staff / Campus Users ]
              |
              v
   [ TRC AI Assistant — Port 8001 ]
       FastAPI (Python) Backend
       SecurityGuard Middleware
       AES-256 Encrypted Config
       Role-Based Access Control
              |
   ┌──────────┼──────────────────────┐
   v          v                      v
[TDX]     [SCCM/WMI]         [AD/StarID Portal]
[ISE]     [Mist WiFi]         [Jamf Cloud]
       [Ollama AI — LOCAL]
```

- **Backend**: Python 3.12, FastAPI, Uvicorn (Port 8001, campus LAN only)
- **Frontend**: Vanilla JS + CSS — mobile-first, no external dependencies
- **Database**: SQLite (`trc_ai.db`) for sessions, users, and KB storage
- **AI Engine**: Ollama `phi3:mini` — **fully local, no data leaves campus**
- **Security Layer**: `SecurityGuard` middleware + Fernet AES-256 encryption for all credentials

---

## 🔗 Active Platform Integrations

| Platform | Purpose | Auth Method | Role Required |
|---|---|---|---|
| **TeamDynamix (TDX)** | Ticket management + AI Co-Pilot | BEID + WSKey (`loginadmin`) | helpdesk+ |
| **Microsoft SCCM** | Windows device inventory & remote actions | WMI (local session) | tech+ |
| **Active Directory** | User identity & account management | PowerShell (domain session) | helpdesk+ |
| **StarID Portal** | Deep user lookup (affiliations, barcodes) | Playwright scraper (encrypted creds) | tech+ |
| **Cisco ISE** | Network endpoint & VLAN lookup | REST API (read-only) | tech+ |
| **Juniper Mist WiFi** | Wireless diagnostics | REST API (read-only) | tech+ |
| **Jamf Cloud** | Apple device management | Bearer token API (read-only) | tech+ |
| **Ollama (local)** | AI reasoning engine | Localhost only | all |

---

## 🎫 TDX Live Ticket Co-Pilot
The AI Co-Pilot reads **live ticket feeds** (comments + status changes) to:
1. Determine what has already been tried.
2. Identify if we are waiting on the customer or on a technician action.
3. Draft a professional response for staff to review and approve.

All TDX comments posted via the AI are signed: `— Posted by [username] via TRC-AI Assistant`

**Filter**: Only **New** and **In Process** tickets are shown — no closed-ticket noise.

---

## 🛠️ Management
- **Admin Panel**: Accessible via ⚙️ for SysAdmins. Manage user roles, permissions, and view audit logs.
- **Configuration**: `config.json` — all sensitive values stored as `ENC(...)` AES-256 encrypted strings.
- **Audit Logs**: All staff actions (ticket posts, SCCM triggers, AD changes) are logged to `trc_ai.db`.
- **HITL Governance**: Destructive actions (AD resets, SCCM reboots, TDX posts) require explicit human confirmation. The AI cannot act autonomously.

---

## 🚀 Starting the Server
Double-click **`start_ai.bat`** — the server starts on `http://localhost:8001`.

For coworker access on the campus LAN, run `setup_firewall.bat` once as Administrator to open Port 8001. The Admin Panel displays the live LAN URL for sharing.
