# TRC Enterprise AI Help Desk
## Executive Presentation — May 2026

**Prepared by:** Shadman Ahsan, Technology Resource Center  
**For:** ITS  Review  
**Version:** 3.6.0 | **Status:** Production-Ready

---

## The Problem

Every day, TRC staff navigate **5+ disconnected platforms** to resolve a single IT ticket:

| Platform | Purpose | Time Lost |
|----------|---------|-----------|
| TeamDynamix (TDX) | Ticket management & tracking | Switching between tickets and tools |
| Active Directory | Account status, lockouts, password resets | Opening AD console, searching users |
| SCCM / Intune | Device inventory & remote management | Separate admin console |
| Juniper Mist | WiFi diagnostics & AP troubleshooting | Separate cloud dashboard |
| Knowledge Base | Documented IT procedures | Searching internal docs |

**Impact:**
- New Help Desk workers take **2-3 weeks** to become productive
- Shift handoffs lose critical ticket context
- Techs spend more time *finding information* than *solving problems*
- Institutional knowledge walks out the door when staff leave

---

## The Solution

A **unified, AI-powered interface** that consolidates all five platforms into a single tool — with an intelligent assistant that guides staff through every ticket.

### Core Design Principles

| Principle | Implementation |
|-----------|---------------|
| **🔒 100% Local** | AI runs on campus infrastructure. No student/staff data sent to cloud AI providers. |
| **⚡ Instant Value** | New staff are productive on Day 1, not Week 3. |
| **🧩 Modular** | Each integration (AD, SCCM, Mist) is a pluggable module. |
| **🛡️ Secure by Design** | Active Directory authentication. Role-based access. Full audit trail. |
| **💰 Zero Cost** | Built entirely on open-source: Python, FastAPI, Ollama, SQLite. |

---

## What It Does — Key Capabilities

### 1. 🤖 Intelligent Chat Assistant
Staff describe issues in plain language. The AI:
- Classifies tickets into the correct TDX service category
- Provides step-by-step resolution guidance
- Specifies exact TDX form fields (Classification, Service, Urgency)
- Identifies the correct escalation path

### 2. 🎫 Feed-Aware Ticket Briefings (v3.6.0)
When a tech clicks on a ticket, the AI **reads the entire activity feed** and generates:

| Section | Purpose |
|---------|---------|
| 📍 **Current State** | Where the ticket stands right now based on who said what |
| 🔧 **Tech Action** | What the tech should do RIGHT NOW — no guessing |
| ⚠️ **Escalation** | Who to contact if it can't be resolved |
| 📋 **Closing Notes** | What to document when closing the ticket |

**Result:** A tech picking up a 36-day-old ticket with 11 comments can understand its full status in **5 seconds** instead of **5 minutes**.

### 3. 🔍 Unified Directory & Device Intelligence
- **AD Lookups**: Search any StarID → Name, Title, Department, Account Status
- **SCCM/Jamf**: Device inventory, OS version, last user, remote actions
- **Mist WiFi**: AP connection, signal strength, authentication status
- **Cross-Platform Trace**: Map a user ➔ their devices ➔ their network location ➔ their switch port

### 4. 🧭 Interactive AI Step-by-Step Wayfinding (v3.6.0)
The AI is now a physical campus guide:
- **Multi-Phase Routing**: Generates precise instructions between any two campus rooms.
- **Synchronized Maps**: Automatically loads the correct floor plan PDF as the tech moves through the navigation stages.
- **Elevation Projection**: Visualizes 3D floor transitions (stairs/elevators) using path-aware voxel mapping.
- **Smart Interception**: Searching for room codes in the directory instantly offers wayfinding guidance.

### 5. 📚 Self-Learning Knowledge Base
- 49+ pre-built service categories from historical ticket patterns
- **Direct Link Intelligence**: Instant triaging for specific requests like "P Drive Access" with direct form links.
- Staff can teach the AI new knowledge via chat or file drag-and-drop
- AI searches local KB before every response — zero hallucination for documented procedures

### 6. 🛡️ Human-In-The-Loop Governance
All destructive actions (AD Unlock, SCCM Reboot, Password Reset) require **explicit WAG authorization** before execution. Every action is logged.

---

## Smart Triage — Works Even When AI is Offline

When the AI engine is under heavy load or temporarily offline, the system **does not fail**. It automatically:

1. Matches the ticket's service category against the 49-category FAQ library
2. Displays the matched procedure with resolution steps
3. Shows the correct TDX form fields for classification
4. Identifies the escalation contact
5. Renders the full activity feed timeline

**This ensures techs always have something actionable — no dead ends.**

---

## Security & Privacy

| Concern | How It's Handled |
|---------|-----------------|
| **Student/Staff Privacy** | AI processes everything locally. Zero data sent to external providers (Google, OpenAI, Microsoft AI). |
| **Credentials** | Active Directory authentication. No separate passwords stored. |
| **Network Data** | All AD, SCCM, and ISE queries stay on the campus internal network. |
| **Access Control** | Four-tier RBAC: Help Desk → Tech → WAG → SysAdmin. Each role sees only authorized modules. |
| **Audit Trail** | Every administrative action (unlocks, policy syncs, lookups) is logged with timestamps. |
| **Code Transparency** | Full source code in a private GitHub repository, available for institutional audit. |

---

## Impact & Value Proposition

### Quantified Benefits

| Metric | Before | After (Estimated) |
|--------|--------|-------------------|
| New staff onboarding time | 2-3 weeks | **Day 1 productivity** |
| Time to understand a ticket | 3-5 min reading TDX feed | **5 seconds** (AI briefing) |
| Platforms to check per ticket | 5 separate tools | **1 unified interface** |
| Ticket classification errors | Frequent for new staff | **Near-zero** (AI-suggested) |
| Institutional knowledge loss | Lost when staff leave | **Permanently captured in KB** |
| Recurring software costs | N/A | **$0** (open-source stack) |

### Qualitative Benefits
- **Consistency**: Every tech follows the same procedures, regardless of experience level
- **Transparency**: Leadership has visibility into operations via audit logs
- **Morale**: Staff focus on solving problems, not hunting for information
- **Scalability**: Designed to serve all TRC staff simultaneously over the campus network

---

## Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | HTML / CSS / JavaScript | Premium glassmorphic enterprise UI |
| Backend | Python (FastAPI) | Async, high-performance API server |
| Database | SQLite | Concurrent multi-user support |
| AI Engine | Ollama (`phi3:mini`) | 100% local, upgradeable to larger models |
| Authentication | Active Directory (PowerShell) | Existing campus credentials |
| Device Mgmt | SCCM AdminService + Jamf Cloud | Windows + Apple support |
| Network | Juniper Mist + Cisco ISE APIs | WiFi + wired diagnostics |
| Version Control | Git / GitHub (private) | Full change history |

---

## Development Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **1-2** | Core platform, RBAC, AD/SCCM/Mist integrations, self-learning KB | ✅ Complete |
| **3** | Feed-aware ticket briefings, smart triage, activity timeline | ✅ Complete (v3.6.0) |
| **4** | Live TDX API — real-time ticket sync, bidirectional updates | 🔜 Next |
| **5** | Dedicated SMSU server, GPU-accelerated AI, HTTPS, SSO | 📋 Planned |
| **6** | Executive analytics, SLA monitoring, trend detection | 📋 Planned |
| **7** | Multi-campus MinnState expansion, shared KB federation | 🌐 Vision |

---

## What We Need to Move Forward

| Need | Purpose | Impact |
|------|---------|--------|
| **TDX API Token** | Connect to live ticket data instead of cached snapshots | Enables Phase 4 |
| **Dedicated Server** | 24/7 uptime, larger AI model, GPU acceleration | Enables Phase 5 |
| **Static Campus IP** | Stable URL (`trc-ai.smsu.edu`) for staff access | Professional deployment |
| **Leadership Endorsement** | Institutional backing for adoption and expansion | Enables Phases 6-7 |

---

## Summary

The TRC Enterprise AI Help Desk is a **production-ready, zero-cost, fully local** platform that transforms how the Technology Resource Center operates. It eliminates the fragmentation between five disconnected platforms, makes new staff productive on their first day, and preserves institutional knowledge permanently.

Built by TRC staff, for TRC staff — running entirely on SMSU infrastructure.

---

**Shadman Ahsan**  
Technology Resource Center — Southwest Minnesota State University  
May 2026
