# TRC Enterprise AI Help Desk — Project Summary
### Prepared by: Shadman Ahsan | For: Jason Kingstrom (CIO) | Date: May 2026 | Version: 4.0 (Production)

---

## Executive Summary

The **TRC Enterprise AI Help Desk** is a locally-hosted, AI-powered internal tool built to streamline the daily operations of the SMSU Technology Resource Center. It consolidates multiple disconnected IT platforms — TDX ticketing, Active Directory, SCCM device management, Cisco ISE, Juniper Mist, and Jamf Cloud — into a single, secure, intelligent interface guided by an AI assistant that runs entirely on campus infrastructure.

This tool helps every TRC staff member — from new Help Desk workers on their first shift to experienced WAG technicians — work faster, make fewer mistakes, and know exactly what to do next.

**Current Status: 🟢 PRODUCTION READY** — Live TDX API integration complete. System hardened with institutional-grade security. Ready for CIO demonstration.

---

## Strategic Mission & User Role

This project was developed by the **ITS Graduate Assistant** at Southwest Minnesota State University as a core part of their position responsibilities:

- **Optimize TRC Operations**: Handling day-to-day incoming requests and procedural documentation.
- **Support Student Workers**: Creating employment plans and providing automated training for new Help Desk staff.
- **Assist Leadership (CIO)**: Planning and deploying new services and training clients across campus.
- **Maintain Institutional Agility**: Keeping labs operational and updating ITS web resources with live, accurate data.

---

## Problem Statement

Today, TRC staff must navigate **five or more separate platforms** to respond to a single ticket:

1. **TDX** — to log and manage tickets
2. **Active Directory** — to check account status, lockouts, and group memberships
3. **SCCM** — to look up device status and history
4. **Juniper Mist** — to diagnose wireless connectivity issues
5. **A separate Knowledge Base** — to find documented solutions

This fragmentation is especially challenging for new Help Desk workers, during shift changes where context is lost, and for escalation decisions that rely on institutional knowledge rather than documented process.

---

## Solution: TRC AI Help Desk

A unified, locally-run web application combining all campus systems into one interface, with an AI assistant that guides staff through ticket resolution step by step.

### Key Principles
- **100% Local AI Processing** — No student or staff data is sent to cloud AI services.
- **On-Campus Infrastructure** — All enterprise lookups (AD, SCCM, TDX) occur on the internal campus network.
- **Offline-First** — The AI brain runs locally via Ollama (`phi3:mini`), functioning even without internet.
- **Secure by Design** — All credentials are AES-256 encrypted. No plain-text secrets anywhere.
- **Human-in-the-Loop** — The AI advises and drafts; humans approve and execute.

---

## Current Capabilities (v4.0 — Production)

### 1. Intelligent Chat Assistant
Staff describe an issue in plain language. The AI classifies the ticket, provides step-by-step resolution guidance, specifies TDX form fields (Classification, Service, Responsible Group, Urgency), and indicates escalation paths. The "Ask AI About This" button passes the full ticket context directly to the AI for a comprehensive action plan.

### 2. Live TDX Ticket Co-Pilot ✅ (Phase 4 Complete)
- **Live API Sync**: Directly connected to `https://services.smsu.edu/TDWebApi/api` via the institutional `loginadmin` auth protocol.
- **Focused Queue**: Displays only **New** and **In Process** tickets — no resolved ticket noise.
- **Feed-Aware AI**: Before suggesting a fix, the AI reads the **last 10 comments and status changes** to understand what's already been tried and determine the next step.
- **One-Click Commenting**: AI drafts professional responses. Staff review and post with one click.
- **Worker Attribution**: Every comment is signed `— Posted by [username] via TRC-AI Assistant` for full TDX audit traceability.
- **Live/Cached Badges**: Ticket cards show "🟢 LIVE" when connected to the API, "📦 CACHED" on fallback.

### 3. Active Directory Integration
Staff can look up any user by StarID or name and instantly see full name, title, department, and account lockout status. WAG and SysAdmin roles can unlock accounts, enable/disable accounts, and reset passwords — all gated by HITL approval.

### 4. SCCM & Jamf Device Management
Lookup any device by name, serial number, or MAC address. Automatically routes Windows devices to SCCM and Apple devices to Jamf. Trigger remote actions (Policy Sync, Force Reboot) directly from the dashboard — all HITL-gated.

### 5. StarID Portal Deep Search
Playwright-based headless browser integration with the MinnState StarID Admin Portal. Retrieves TechID, library barcodes, ISRS affiliation history, and password expiry on demand.

### 6. Cisco ISE & Juniper Mist Diagnostics
Read-only network lookups: ISE provides VLAN assignment and endpoint posture; Mist provides AP association, RSSI, and roaming history. The Unified Trace Engine automatically chains these lookups in a single query.

### 7. Role-Based Access Control (RBAC)
Five roles (Guest, Help Desk, Tech, WAG, SysAdmin) with granular per-module permissions. All roles are enforced at both the API layer (`server.py`) and the UI layer.

### 8. Security Hardening
- **SecurityGuard Middleware**: Rate limiting (60 req/min), anti-scanning (auto-block after 10x 404s), server header cloaking.
- **AES-256 Encryption**: All institutional credentials encrypted with Fernet. Stored as `ENC(...)` in `config.json`.
- **Hidden Key File**: Master encryption key is a hidden system file (`.secret.key`) on the server.
- **Session Management**: Cryptographically random session tokens, stored in SQLite with expiry.

### 9. Intelligent Knowledge Base
49+ service categories built from historical ticket patterns. Admins can teach the AI new knowledge via chat (`"Learn this: [info]"`) or drag-and-drop file uploads (CSV, TXT, JSON).

### 10. Interactive Wayfinding
Step-by-step campus navigation with synchronized floor plan overlays, elevation intelligence, and ASCII route projection.

### 11. Network Deployment Toolkit
Auto-detects server LAN IP. `setup_firewall.bat` opens Port 8001. Admin Panel displays the live URL for sharing with coworkers.

---

## Security & Privacy Posture

| Concern | How It's Handled |
|---|---|
| **AI data privacy** | Fully local Ollama model. Zero data sent to external AI providers. |
| **Credential storage** | All secrets AES-256 encrypted as `ENC(...)` in `config.json`. No plain text. |
| **Network exposure** | SecurityGuard middleware: rate limiting + anti-scanning on Port 8001. |
| **API access scope** | ISE, Mist, Jamf — read-only. TDX — write requires human confirmation. |
| **Audit trail** | All staff actions logged to `trc_ai.db` with user, role, action, timestamp. |
| **FERPA compliance** | No student data stored. All lookups are transient, in-memory only. |
| **TDX attribution** | Every AI-assisted comment signed with the posting staff member's username. |

> **Full Details:** See [`TRC_AI_Integration_Security_Policy.md`](TRC_AI_Integration_Security_Policy.md)

---

## Roadmap

### ✅ Phase 1 — Core Chat & KB (Complete)
Local AI chat with campus KB, StarID lookup, and TDX form guidance.

### ✅ Phase 2 — SCCM / AD / Mist Integration (Complete)
Device management, AD account tools, Jamf Cloud, and Cisco ISE.

### ✅ Phase 3 — TDX Ticket Briefing Engine (Complete)
Feed-aware AI briefings, smart triage fallback, activity feed timeline.

### ✅ Phase 4 — Live TDX API Integration (Complete — v4.0)
Full live REST API connection, encrypted credentials, AI Co-Pilot with feed awareness, worker attribution, SecurityGuard hardening.

### 🔜 Phase 5 — Dedicated SMSU Server Deployment
Migrate from workstation to a campus server with a static IP, upgraded AI model (Llama 3.1 8B or Mistral 7B), GPU acceleration, HTTPS/subdomain (`trc-ai.smsu.edu`), and AD SSO (Kerberos).

### 🔜 Phase 6 — Analytics & SLA Intelligence
Executive dashboards, SLA monitoring alerts, per-tech performance metrics, trend detection, and exportable reports.

### 🔜 Phase 7 — MinnState System Expansion
Multi-tenant architecture for multiple campuses, shared knowledge network, and MinnState ServiceDesk integration.

---

## Technology Stack

| Component | Technology | Location |
|---|---|---|
| Web Interface | HTML / CSS / Vanilla JS | Local PC |
| Backend API | Python 3.12 (FastAPI + Uvicorn) | Local PC — Port 8001 |
| Database | SQLite (`trc_ai.db`) | Local PC |
| AI Engine | Ollama (`phi3:mini`) | Local PC — localhost only |
| Active Directory | PowerShell `Get-ADUser` | Campus LAN |
| TDX | REST API — `services.smsu.edu` | Campus / Cloud |
| SCCM | AdminService REST API | Campus LAN |
| Cisco ISE | ERS REST API — `ise.smsu.edu` | Campus LAN |
| Juniper Mist | REST API | Mist Cloud |
| Jamf Cloud | REST API — `smsu.jamfcloud.com` | Cloud |
| StarID Portal | Playwright headless scraper | MinnState Cloud |
| Encryption | Fernet AES-256 (`cryptography` lib) | Local |
| Version Control | Git / GitHub (private repo) | GitHub |

---

## Business Value

- **Reduces onboarding time** for new Help Desk workers — the AI guides them through unfamiliar situations.
- **Reduces errors** in TDX ticket classification and form completion.
- **Eliminates tool-switching** — no more jumping between 5+ platforms for one issue.
- **Preserves institutional knowledge** — the AI can be taught procedures and recalls them indefinitely.
- **Zero recurring AI cost** — built entirely on open-source, locally-run technology.
- **Audit-ready** — every action logged, every TDX comment attributed.

---

## Repository & Access

- **GitHub:** https://github.com/shadman1996/AI-For-TRC (private)
- **Local Path:** `OneDrive - Minnesota State\Desktop\Shadman Ahsan\TRC-AI-Assistant\`
- **Launch:** Double-click `start_ai.bat`
- **Access:** `http://localhost:8001` in any browser while the server is running
- **Documentation:** `docs/` folder — see `SYSTEM_GUIDE.md` for entry point

---

## Prepared By

**Shadman Ahsan**  
ITS Graduate Assistant — Technology Resource Center  
Southwest Minnesota State University  
Reports to: Jason Kingstrom, CIO
