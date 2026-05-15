# TRC Enterprise AI Help Desk — Project Summary
### For: [Kingstrom, Jason] | Prepared by: Shadman Ahsan | Date: May 2026

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
- **Ticket Context Handoff (v3.6.0)**: The "Ask AI About This" button passes the full ticket context (ID, requestor, priority, service, description, and activity feed) directly to the AI, bypassing intent detectors so the assistant can provide a comprehensive action plan.

### 2. Active Directory Integration
Staff can type `"Check AD for [username]"` and instantly see:
- Full name and display name
- Title and department
- Account lockout status

This eliminates the need to open and navigate the AD console for routine lookups.

### 3. SCCM & Jamf Device Lookup & Remote Management
Staff can type `"Find computer [device name]"` and instantly see:
- **Enriched Telemetry**: Last logged-in user, Serial Number, OS Version, and IP Address.
- **Cross-Platform Support**: Automatically routes Windows devices to **SCCM** and Apple devices (iPads, MacBooks) to **Jamf Cloud**.
- **Advanced Actions**: Trigger Policy Sync, Scan for Updates, or perform a **Force Reboot** directly from the dashboard.
- **Integrated Control**: Launch Remote Desktop (RDP) or Remote Assistance (MSRA) sessions with one click.

Connects securely via SCCM AdminService REST API and Jamf Cloud API over HTTPS.

### 4. Juniper Mist WiFi Diagnostics
### 5. Unified Connectivity Trace Engine
The AI assistant performs deep, cross-platform resolution across the entire infrastructure stack:
- **"Everything is Connected" API**: The system maps `AD ➔ TDX ➔ SCCM/Jamf ➔ ISE ➔ Mist` in a single query.
- **Identity Correlation**: Resolves Asset Tags to specific Owners and Departments via TDX.
- **Location Intelligence**: Maps MAC addresses to specific **Access Points** (WiFi) or **Switch Ports** (Wired) via Mist/ISE.
- **Visual Trace Cards**: Generates premium, glassmorphic UI components connecting a user to their devices, network location, and live signal strength.

### 6. Intelligent Knowledge Base
The AI has two layers of knowledge:
- **Built-in FAQ library** — 49+ service categories based on historical ticket patterns.
- **Permanent Memory** — Administrators can teach the AI new knowledge by typing `"Learn this: [information]"` or uploading files directly into the chat interface.
- The AI automatically searches this memory before admitting it doesn't know something.

### 6. Self-Learning File Ingestion
Administrators can drag-and-drop any CSV, TXT, or JSON file (such as a TDX KB export) directly into the chat window. The system automatically:
1. Analyzes and parses the file
2. Stores the knowledge in the local database
3. Deletes the uploaded file (no data residue)

### 7. Secure Login & Role-Based Access Control
Staff log in via StarID. The system assigns one of four roles with granular permissions:
- **Help Desk**: Chat, ticket guidance, directory lookup.
- **Tech**: Above + SCCM, Jamf & Mist diagnostics.
- **WAG**: Above + elevated AD options.
- **System Admin**: Full access + Admin Panel.

### 8. Human-In-The-Loop (HITL) Governance
All destructive or high-privilege remote actions (e.g., AD Password Resets, SCCM Restarts, AD Unlocks) are gate-kept by a strict **WAG Approval** modal. The AI orchestrates the action but requires an explicit authorization PIN from WAG leadership before modifying production systems.

### 9. Premium SysAdmin Command Center (v3.5.0)
The administrative modules have been fully redesigned with a **Premium Glassmorphic UI**:
- **High-Density Dashboards**: Real-time infrastructure telemetry (AD/ISE/SCCM distribution) and live **Sparkline Charts** for AI Engine load and DB throughput.
- **Session Intelligence**: Real-time **Active Session Timer** and initial-based user avatars.
- **Full Mobile Support**: A complete mobile-first responsive architecture for on-the-go management.
- **Professional Aesthetics**: Clean, profile-style cards for users and devices with visual signal bars and status pills.
- **Action-Oriented Design**: Administrative buttons are seamlessly docked for immediate operational response.

### 10. Network Deployment Toolkit
Administrators can now deploy the tool across the campus LAN with one click:
- **Auto-Discovery**: The system automatically detects the server's network IP address.
- **Firewall Setup**: Includes a `setup_firewall.bat` script to securely open the port for WAG and Help Desk staff.
- **Deployment Dashboard**: Shows the "Live URL" directly in the Admin Panel for easy sharing.

### 11. Interactive AI Step-by-Step Wayfinding (v3.6.0)
The AI is no longer just a digital directory; it is a physical campus guide:
- **Multi-Phase Routing**: Generates precise, step-by-step walking instructions between any two campus locations (e.g., BA 200 to ST 269).
- **Synchronized Map Overlays**: As the user follows the AI's guidance, the interface automatically switches to the correct building floor plan PDF for the current navigation phase.
- **Elevation Intelligence**: Intelligently handles transitions between levels (stairs, elevators, skyways) and renders a path-aware ASCII 3D voxel projection of the route.
- **Smart Target Detection**: Searching for room codes in the Campus Directory instantly offers to generate a custom wayfinding route.

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
| **Data at rest** | The AI's learned knowledge base and user roles are stored in a **SQLite database** on the local machine for high-concurrency access. |

---

## Planned Development Roadmap

### Phase 3 — Live TDX Ticket Workflow ✅ (Completed v3.6.0)
The AI now provides full ticket workflow support:
- **Live Ticket Queues**: Pulls active tickets assigned to the logged-in user or their group.
- **Feed-Aware AI Briefings**: Analyzes ticket activity feeds (comments, status changes) to produce structured briefings with Current State, Tech Action Items, Escalation Path, and Closing Notes.
- **Smart Triage Fallback**: When the AI engine is offline, automatically matches tickets against the FAQ library for actionable procedures and escalation contacts.
- **Shift Handoffs**: Produces automated reports for incoming staff so no context is lost.

### Phase 4 — Live TDX API Integration (Next Priority)
Connect to the real TeamDynamix REST API for bidirectional ticket management:
- **Real-Time Ticket Sync**: Replace mock ticket data with live API feeds using the TDX Web API (`/api/tickets` endpoints), pulling assigned tickets, requestor details, and full comment feeds in real-time.
- **Bidirectional Updates**: Allow techs to post comments, update ticket status (New → In Process → Resolved), and reassign responsible groups — all from within the TRC AI interface without switching to the TDX web portal.
- **AI-Drafted Responses**: Auto-generate professional customer-facing responses and internal notes based on the AI's analysis of the ticket history. Techs review and approve before posting.
- **Smart Ticket Creation**: Pre-populate new TDX ticket forms with AI-suggested Classification, Service, Responsible Group, Urgency, and a drafted description — reducing ticket creation time by 80%.
- **Attachment Pipeline**: Support viewing and adding attachments (screenshots, logs) directly from the ticket detail view.

### Phase 5 — Dedicated SMSU Server Deployment & AI Upgrade
Migrate from student worker PCs to a production-grade campus server:
- **Centralized Server Hosting**: Deploy the backend and AI models to a dedicated SMSU ITS server (Linux VM or Windows Server) with a static campus IP, ensuring 24/7 uptime independent of individual workstations.
- **Upgraded AI Models**: Move from `phi3:mini` (3.8B parameters) to larger, more capable models like `Llama 3.1 8B` or `Mistral 7B`, significantly improving the accuracy and depth of AI responses for complex IT troubleshooting.
- **GPU Acceleration**: Leverage a server-grade GPU (NVIDIA T4/A10) for sub-second AI response times, eliminating the latency that currently limits briefing generation.
- **HTTPS & Domain**: Configure SSL certificates and a campus subdomain (e.g., `trc-ai.smsu.edu`) for secure, professional access from any campus device.
- **Automated Startup & Health Checks**: System service configuration with auto-restart on failure, daily database backups, and Prometheus/Grafana monitoring for uptime tracking.
- **Active Directory SSO**: Replace the current StarID login with full Windows Integrated Authentication (Kerberos/NTLM) for seamless single sign-on — no separate password entry needed.

### Phase 6 — Analytics, Reporting & SLA Intelligence
Transform operational data into actionable leadership insights:
- **Executive Dashboard**: Real-time KPI panels for WAG leadership showing ticket volume trends, average resolution times, SLA compliance rates, and team workload distribution.
- **SLA Monitoring & Alerts**: Automated alerts when tickets approach or breach SLA deadlines (e.g., 24-hour response, 72-hour resolution). Color-coded urgency indicators in the ticket list.
- **AI Performance Analytics**: Track how often AI briefings are used, retry rates, FAQ match accuracy, and which ticket categories benefit most from AI-assisted triage.
- **Staff Performance Reports**: Per-tech metrics on tickets handled, average time-to-resolution, and escalation rates — designed for coaching, not surveillance.
- **Trend Detection**: AI identifies recurring issue patterns (e.g., "D2L login issues spike every semester start") and proactively suggests KB articles or staffing adjustments.
- **Exportable Reports**: One-click PDF/CSV export of weekly, monthly, and semester reports for ITS leadership and budget justification.

### Phase 7 — MinnState System Expansion & Multi-Campus Vision
Scale the platform beyond SMSU to serve the broader Minnesota State system:
- **Multi-Tenant Architecture**: Refactor the backend to support multiple campuses, each with their own AD domain, TDX instance, SCCM environment, and KB — all managed from a single deployment.
- **Shared Knowledge Network**: Create a federated KB where solutions discovered at one campus are surfaced as suggestions at others (e.g., a D2L fix found at SMSU appears for techs at Southwest Tech).
- **Centralized Training Corpus**: Pool anonymized ticket resolution patterns across campuses to train a system-wide AI model that improves accuracy for all institutions.
- **MinnState ServiceDesk Integration**: Bridge local TRC operations with the centralized MinnState ServiceDesk for seamless tier-2/tier-3 escalation workflows.
- **Open-Source Community Model**: Package the TRC AI framework as a deployable solution that other MinnState institutions can adopt and customize for their own help desk operations.
- **Mobile App (PWA)**: Progressive Web App support for on-the-go ticket management, enabling techs to receive AI briefings and update tickets from their phones during office visits and equipment deployments.
---

## Technology Stack

| Component | Technology | Hosted |
|---|---|---|
| Web interface | HTML / CSS / JavaScript | Local PC |
| Backend API | Python (FastAPI) | Local PC |
| Database | SQLite | Local PC |
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
