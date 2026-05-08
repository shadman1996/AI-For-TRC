# TRC Enterprise AI Help Desk — Project Summary
### For: [Manager Name] | Prepared by: Shadman Ahsan | Date: May 2026

---

## Executive Summary

The **TRC Enterprise AI Help Desk** is a locally-hosted, AI-powered internal tool being developed to streamline the daily operations of the SMSU Technology Resource Center. It consolidates multiple disconnected IT platforms (TDX ticketing, Active Directory, SCCM device management, and Juniper Mist network management) into a single, intelligent interface — guided by an AI assistant that runs entirely on campus infrastructure.

This tool is designed to help every TRC staff member — from new Help Desk workers on their first shift to experienced WAG technicians — work faster, make fewer mistakes, and know exactly what to do next.

---

## Problem Statement

Today, TRC staff must navigate **five or more separate platforms** to respond to a single ticket:

1. **TDX** — to log and manage tickets
2. **Active Directory** — to check account status, lockouts, and group memberships
3. **SCCM (Configuration Manager)** — to look up device status and history
4. **Juniper Mist** — to diagnose wireless connectivity issues
5. **A separate Knowledge Base** — to find documented solutions

This fragmentation is especially challenging for:
- **New Help Desk workers** who don't yet know which system to check or what to do next
- **Shift changes** where context about open tickets is lost
- **Escalation decisions** that rely on institutional knowledge rather than documented process

---

## Solution: TRC AI Help Desk

A unified, locally-run web application that combines all of these systems into one interface, with an AI assistant that guides staff step-by-step through ticket resolution.

### Key Principles
- **100% Local Processing** — No student or staff data is sent to cloud AI services (Google, OpenAI, etc.)
- **On-Campus Infrastructure** — All enterprise lookups (AD, SCCM) occur on the internal campus network
- **Offline-First** — The AI brain runs locally via Ollama, functioning even without internet access
- **Secure by Design** — Credentials are never stored in code; authentication uses existing Active Directory

---

## Current Capabilities (Built and Operational)

### 1. Intelligent Chat Assistant
Staff describe an issue in plain language. The AI:
- Classifies the ticket into the correct TDX service category
- Provides step-by-step resolution guidance
- Specifies exactly how to fill in the TDX ticket form (Classification, Service, Title, Responsible Group, Urgency)
- Indicates who to escalate to and why

### 2. Active Directory Integration
Staff can type `"Check AD for [username]"` and instantly see:
- Full name and display name
- Title and department
- Account lockout status

This eliminates the need to open and navigate the AD console for routine lookups.

### 3. SCCM Device Lookup
Staff can type `"Find computer [device name]"` and see:
- Last logged-in user
- IP and MAC addresses
- Operating system version
- Device status

Connects securely via the SCCM AdminService REST API over HTTPS on the internal network.

### 4. Juniper Mist WiFi Diagnostics
Staff can type `"Check Mist for [MAC address]"` and see:
- Device hostname and type
- Connected SSID
- IP address
- Authentication method (PSK, SSID, VLAN)
- Connection band and protocol

### 5. Intelligent Knowledge Base
The AI has two layers of knowledge:
- **Built-in FAQ library** — 49+ service categories based on historical ticket patterns
- **Permanent Memory** — Administrators can teach the AI new knowledge by typing `"Learn this: [information]"` or uploading files directly into the chat interface
- The AI automatically searches this memory before admitting it doesn't know something

### 6. Self-Learning File Ingestion
Administrators can drag-and-drop any CSV, TXT, or JSON file (such as a TDX KB export) directly into the chat window. The system automatically:
1. Analyzes and parses the file
2. Stores the knowledge in the local database
3. Deletes the uploaded file (no data residue)

---

## Security & Privacy Posture

| Concern | How It's Handled |
|---|---|
| **Student/staff data privacy** | No data sent to external AI providers. All processing is local. |
| **Credential storage** | No passwords stored. AD authentication uses Windows-native validation. |
| **Network data** | AD and SCCM queries stay entirely on the campus internal network. |
| **Mist API token** | Stored only in the local config file on the server; not in version control. |
| **Access control** | Role-based login system planned (Phase 2) using Active Directory group membership. |
| **Code transparency** | Full source code available in a private GitHub repository for audit. |
| **Data at rest** | The AI's learned knowledge base is stored as a plain JSON file on the local machine. |

---

## Planned Development Roadmap

### Phase 2 — Login & Role-Based Access Control (Next)
Every staff member logs in using their StarID. The system uses Active Directory to automatically assign them to one of four roles, each with appropriate permissions:

| Role | Capabilities |
|---|---|
| **Help Desk** | AI chat, ticket guidance, staff directory lookup |
| **Tech** | All above + SCCM device lookup + Mist WiFi diagnostics |
| **WAG** | All above + elevated AD query options |
| **System Admin** | All above + Knowledge Base file upload and AI configuration |

### Phase 3 — Live TDX Ticket Integration
With a TDX API token, the AI will:
- Pull open tickets assigned to the logged-in user's queue
- Analyze each ticket and suggest the next resolution step
- Auto-generate escalation notes when a ticket needs to be passed up
- Produce shift handoff summaries so incoming staff know exactly what's open

### Phase 4 — Full Operations Hub
- SLA and deadline alerts for aging tickets
- Resolution suggestions based on similar historical tickets
- Shift logs and audit trails
- Campus server deployment (multiple staff can connect from any campus PC)

---

## Technology Stack

| Component | Technology | Hosted |
|---|---|---|
| Web interface | HTML / CSS / JavaScript | Local PC |
| Backend API | Python (FastAPI) | Local PC |
| AI Engine | Ollama (`phi3:mini` model) | Local PC |
| Active Directory | Windows PowerShell (DirectoryServices) | Campus LAN |
| SCCM | AdminService REST API (HTTPS) | Campus LAN |
| Juniper Mist | REST API | Cloud (Mist platform) |
| Version Control | Git / GitHub (private repo) | GitHub |

---

## Business Value

- **Reduces onboarding time** for new Help Desk workers — the AI guides them through unfamiliar situations
- **Reduces errors** in TDX ticket classification and form completion
- **Reduces tool-switching overhead** — no more jumping between 5 platforms for one issue
- **Preserves institutional knowledge** — the AI can be taught documented procedures and will recall them indefinitely
- **Scalable** — designed to run on a campus server and serve all TRC staff simultaneously
- **Low cost** — built entirely on open-source technologies with no recurring AI licensing fees

---

## Repository & Documentation

- **GitHub:** https://github.com/shadman1996/AI-For-TRC
- **Local Path:** `OneDrive - Minnesota State\Desktop\Shadman Ahsan\TRC-AI-Assistant\`
- **Launch:** Double-click `start_ai.bat`
- **Access:** `http://localhost:8001` in any browser while the server is running

---

## Prepared By

**Shadman Ahsan**
Technology Resource Center — SMSU
