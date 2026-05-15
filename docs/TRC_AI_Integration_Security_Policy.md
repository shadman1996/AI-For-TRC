# TRC Enterprise AI Assistant
## Platform Integration, Security, & IT Policy Compliance Document

**Document Version:** 1.0  
**Date:** May 15, 2026  
**Prepared by:** ITS Graduate Assistant, Technology Resource Center (TRC)  
**Reports to:** Chief Information Officer (CIO), SMSU Information Technology Services  
**Classification:** Internal Use Only — SMSU ITS  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Platform Integrations](#platform-integrations)
   - [TeamDynamix (TDX)](#1-teamdynamix-tdx)
   - [Microsoft SCCM](#2-microsoft-sccm-system-center-configuration-manager)
   - [Active Directory (AD)](#3-active-directory-ad--starid-portal)
   - [Cisco ISE](#4-cisco-ise-identity-services-engine)
   - [Juniper Mist WiFi](#5-juniper-mist-wifi)
   - [Jamf Cloud](#6-jamf-cloud)
   - [Ollama Local AI Engine](#7-ollama-local-ai-engine)
4. [Security Architecture](#security-architecture)
5. [Data Handling & Privacy](#data-handling--privacy)
6. [SMSU IT Policy Compliance](#smsu-it-policy-compliance)
7. [Operational Safety Protocols](#operational-safety-protocols)
8. [Authorization & Sign-Off](#authorization--sign-off)

---

## Executive Summary

The **TRC Enterprise AI Assistant** is a locally-hosted, role-gated intelligence platform built to support the day-to-day operations of the Southwest Minnesota State University (SMSU) Technology Resource Center. It acts as a secure gateway between TRC staff and the university's enterprise IT platforms, enabling faster ticket resolution, real-time network diagnostics, and intelligent self-service for campus users.

All integrations are **read-first, role-gated, and encrypted at rest**. No platform credentials are stored in plain text. The system operates entirely within the SMSU campus network boundary, with no data transmitted to external cloud services except through existing, university-authorized platform APIs (TDX, Jamf Cloud).

---

## System Architecture Overview

```
[ Campus LAN Users / TRC Staff ]
            |
            v
[ TRC AI Assistant — Port 8001 ]
    - FastAPI Backend (Python)
    - SecurityGuard Middleware (Rate Limiting / Anti-Scan)
    - AES-256 Encrypted Config (config.json)
    - Role-Based Access Control (RBAC)
            |
    ┌───────┼──────────────────────┐
    v       v                      v
[TDX]  [SCCM/WMI]        [AD/StarID Portal]
[ISE]  [Mist WiFi]        [Jamf Cloud]
[Ollama AI - LOCAL]
```

**Server Stack:**
- **Backend**: Python 3.12, FastAPI, Uvicorn
- **Database**: SQLite (local, encrypted session data)
- **AI Engine**: Ollama (local model — `phi3:mini`), fully offline
- **Encryption**: Fernet AES-256 (Python `cryptography` library)

---

## Platform Integrations

---

### 1. TeamDynamix (TDX)

**Purpose:** Live ticket management, AI-assisted commenting, and service request tracking.

**Integration Method:**
- **Endpoint:** `https://services.smsu.edu/TDWebApi/api`
- **Auth Protocol:** Web Services Admin Login (`/api/auth/loginadmin`) using `BEID` + `WebServicesKey`.
- **API Calls Used:**
  - `POST /auth/loginadmin` — Authenticate and obtain a Bearer token (auto-refreshes every 60 min).
  - `POST /api/182/tickets/search` — Fetch active tickets filtered by **New (Status 1)** and **In Process (Status 2)** only.
  - `GET /api/182/tickets/{id}/feed` — Fetch the full activity feed (comments + status history) for a ticket.
  - `POST /api/182/tickets/{id}/feed` — Post an AI-assisted comment with staff attribution.
  - `POST /api/182/tickets` — Create a new service ticket.

**AI Co-Pilot Behavior:**
- When a staff member clicks "Suggest Fix," the system fetches the **last 10 feed entries** (comments, status changes) and passes them to the local AI as context.
- The AI then determines: (a) what has already been tried, (b) if we are waiting on the customer or on a technician action, and (c) drafts a professional next-step response.
- All AI-drafted comments are **held for human review** before posting. Staff must explicitly click "Post to TDX."

**Security Controls:**
- Credentials (`BEID`, `WSKey`, `iPaaS Secret`) are stored as `ENC(...)` Fernet-encrypted strings in `config.json`.
- All API calls use TLS/HTTPS.
- Bearer tokens are held **in memory only** and never written to disk.
- Token expiry is enforced at 60 minutes with automatic silent refresh.

**Worker Attribution:**
- Every comment posted through the AI is automatically signed:
  `"— Posted by [username] via TRC-AI Assistant"`
- This ensures full audit traceability in TDX. Comments can never be posted anonymously.

**SMSU Policy Alignment:**
- Only staff roles (`helpdesk`, `tech`, `wag`, `sysadmin`) can post to TDX via the AI. Guest users have no access to this module.
- The `TRChelpdesk` service account (used for read operations) is a shared, audited institutional account managed by ITS.

---

### 2. Microsoft SCCM (System Center Configuration Manager)

**Purpose:** Device inventory lookups, remote machine actions, and compliance reporting.

**Integration Method:**
- **Connection Type:** Local WMI (`root\ccm`) and SCCM REST API via campus ITSFS network share.
- **Operations Supported:**
  - Device inventory search by hostname, serial number, or MAC address.
  - Hardware profile retrieval (RAM, OS version, last seen date).
  - Triggering remote client actions (Policy Update, Discovery).

**Credential Handling:**
- The AI system does **not** store SCCM admin credentials. It relies on the **currently logged-in Windows session** of the TRC workstation for WMI access, consistent with how the existing `CheckoutTDXDevice.ps1` and `PullCurrentTDXInfo.ps1` scripts operate.
- The `TDX_API_Key` SCCM Collection Variable (used to decrypt the TDX iPaaS key) is accessed only through the SCCM client policy on managed machines. It is **never exposed in logs or stored on disk** by the AI.
- Decryption of institutional API keys follows the same AES-256 pattern defined in `PullCurrentTDXInfo.ps1` — the SCCM machine variable acts as the master passphrase.

**Safety Controls:**
- All destructive SCCM operations (e.g., remote commands) require `sysadmin` or `wag` role.
- Actions are logged to the local audit trail in `trc_ai.db`.

---

### 3. Active Directory (AD) & StarID Portal

**Purpose:** User identity resolution, department/title lookup, and StarID verification.

**Integration Method:**
- **AD Module:** PowerShell subprocess calls using `Get-ADUser` via the campus-joined workstation session. No separate AD credentials are stored.
- **StarID Portal Scraping:** Playwright-based headless browser scraper (`scraper.py`) authenticated with the `vg6340ah` StarID Admin credentials stored encrypted in `config.json`.
  - **Endpoint:** MinnState StarID Admin Portal (SSO).
  - **Data Extracted:** Full name, title, department, affiliations, StarID status.

**Security Controls:**
- StarID Admin credentials are stored as `ENC(gAAAAA...)` — Fernet AES-256 encrypted.
- The `.secret.key` master encryption key file is marked as a **hidden system file** on Windows (via `FILE_ATTRIBUTE_HIDDEN`).
- The scraper is invoked **on demand** only (when staff explicitly search for a user). It does not run in the background or cache personally identifiable information.

**Privacy Consideration:**
- User data fetched from the portal is displayed transiently in the staff session and is **not written to the database**.

---

### 4. Cisco ISE (Identity Services Engine)

**Purpose:** Network endpoint security lookups — device authentication status, VLAN assignment, and MAC-based posture checks.

**Integration Method:**
- **Endpoint:** `https://ise.smsu.edu`
- **Auth:** Basic authentication using `ise_admin` credentials, stored as `ENC(...)`.
- **API Calls:** ISE REST API (ERS) for endpoint group membership and authentication session data.

**Security Controls:**
- ISE credentials encrypted at rest with Fernet AES-256.
- All ISE lookups are **read-only**. No posture changes, no VLAN modifications, and no endpoint deletion can be performed through the AI.
- Only `tech`, `wag`, and `sysadmin` roles have access to the ISE module.

---

### 5. Juniper Mist WiFi

**Purpose:** Real-time wireless diagnostics — client connectivity, AP association, RSSI, and roaming history.

**Integration Method:**
- **API Type:** Mist REST API (Cloud).
- **Auth:** API token stored as `ENC(...)` in config (when configured).
- **Data Used:** Client lookup by MAC address or username to identify connectivity issues.

**Security Controls:**
- All Mist API requests are HTTPS-only.
- Read-only access scope. No AP configuration changes are permitted through the AI.
- Accessible to `tech`, `wag`, and `sysadmin` roles only.

---

### 6. Jamf Cloud

**Purpose:** macOS/iPad device management — enrollment status, policy compliance, and app inventory.

**Integration Method:**
- **Endpoint:** Jamf Cloud API (`https://[instance].jamfcloud.com/api`).
- **Auth:** Bearer token via Jamf Classic API (`/uapi/auth/tokens`).
- **Data Used:** Device serial number lookup, enrollment status, last check-in time.

**Security Controls:**
- Jamf credentials stored as `ENC(...)` in config.
- HTTPS-only. Read-only scope enforced.
- Accessible to `tech`, `wag`, and `sysadmin` roles only.

---

### 7. Ollama Local AI Engine

**Purpose:** The AI reasoning backbone — natural language understanding, ticket analysis, and response drafting.

**Integration Method:**
- **Type:** Fully **local, offline** AI model.
- **Endpoint:** `http://127.0.0.1:11434/api/generate` (localhost only, never exposed externally).
- **Model:** `phi3:mini` (Microsoft Phi-3 Mini — efficient, runs on CPU).

**Privacy & Data Sovereignty:**
- **No data leaves the campus network.** All prompts, ticket content, and user queries are processed entirely on the TRC workstation.
- The AI model has no internet access and no external telemetry.
- Ticket descriptions, user names, and comment history used as AI context are treated as ephemeral — they exist only for the duration of the API call and are not stored by the AI engine.

**Fallback Behavior:**
- If the Ollama engine is offline (e.g., model not running), the system degrades gracefully with a socket-check (50ms timeout) and returns a user-friendly message. No crash, no data loss.

---

## Security Architecture

### Encryption at Rest
| Secret | Storage Location | Encryption Method |
|---|---|---|
| TDX BEID | `config.json` | Fernet AES-256 `ENC(...)` |
| TDX WSKey | `config.json` | Fernet AES-256 `ENC(...)` |
| TDX iPaaS Secret | `config.json` | Fernet AES-256 `ENC(...)` |
| StarID Admin Password | `config.json` | Fernet AES-256 `ENC(...)` |
| Cisco ISE Password | `config.json` | Fernet AES-256 `ENC(...)` |
| Fernet Master Key | `.secret.key` | Hidden system file on disk |

### Encryption in Transit
- All external API calls use **TLS 1.2/1.3 (HTTPS)**.
- Internal AI calls use `localhost` only — no network exposure.

### Access Control (RBAC)
| Role | Permissions |
|---|---|
| **guest** | Chat, Directory, Wayfinding, Quick Links |
| **helpdesk** | + Tickets, TDX Form Guide |
| **tech** | + SCCM Tools, Mist WiFi, ISE, Jamf |
| **wag** | + AD & User Management |
| **sysadmin** | + Appearance Settings, full system access |

### Network Perimeter — SecurityGuard Middleware
The `SecurityGuard` class (implemented in `server.py`) protects Port 8001 on the campus LAN:
- **Rate Limiting:** Maximum 60 requests per minute per IP. Temporary 1-minute block on breach.
- **Anti-Scanning:** IPs generating more than 10 consecutive 404 errors (port/path scanning behavior) are automatically blocked for **10 minutes**.
- **Server Header Cloaking:** Server identity headers are stripped to prevent OS/framework fingerprinting.
- **All blocks are logged** with timestamp and IP for later security review.

### Session Management
- Sessions use cryptographically random UUID tokens (`secrets.token_urlsafe()`).
- Sessions expire automatically and are stored in the local SQLite database.
- No credentials are stored in session tokens — only the username, role, and expiry time.

---

## Data Handling & Privacy

| Data Type | Source | Retention | Shared Externally? |
|---|---|---|---|
| Ticket titles & descriptions | TDX Live API | In-memory only | No |
| Activity feed/comments | TDX Live API | In-memory only | No |
| User name/StarID/dept | AD / StarID Portal | In-memory only | No |
| Device serial/MAC/model | SCCM / TDX CSV | SQLite (local) | No |
| Session tokens | Generated locally | SQLite (local, expiring) | No |
| AI prompts & responses | Local Ollama | In-memory only | No |
| Audit logs | Generated locally | SQLite (local) | No |

**Key Principle:** The TRC AI Assistant is a **data conduit**, not a data store. It reads from authoritative systems and presents results in a secure interface. It does not duplicate or warehouse sensitive institutional data.

---

## SMSU IT Policy Compliance

### Alignment with SMSU ITS Policies

| Policy Area | How the AI Complies |
|---|---|
| **Acceptable Use** | System is restricted to TRC staff for IT operations. Guest access is limited to non-sensitive modules (chat, directory, wayfinding). |
| **Data Classification** | No Restricted or Confidential data is stored locally. Operational data (tickets, devices) is held in-memory during the session only. |
| **Password & Credential Management** | All credentials are encrypted using AES-256 Fernet. Plain-text passwords do not exist in any configuration file. |
| **Access Control** | RBAC enforced at every API endpoint. Role is verified on every request via session token. Unauthorized access returns HTTP 403. |
| **Audit & Accountability** | All administrative actions (ticket creation, SCCM triggers, TDX comments) are logged to the local audit database with username, role, action, and timestamp. |
| **Network Security** | The system runs on the campus LAN only. Rate limiting and anti-scanning protection are active. No external ports are opened beyond Port 8001 (campus-internal). |
| **Third-Party API Usage** | All external API usage (TDX, Jamf) is through existing university-authorized accounts and institutional credentials. No personal or shadow credentials are used. |
| **AI/Automation Policy** | All AI-generated content (comments, suggestions) requires explicit human review and approval before being posted to any institutional system. The AI cannot take autonomous action. |

### MinnState System Office Alignment
- The system uses **MinnState StarID** as the authoritative identity source for all user lookups.
- The `TRChelpdesk` TDX service account is a shared institutional account, consistent with MinnState IT shared services policies.
- No student data (FERPA-protected) is stored or processed by the AI beyond what is already accessible to TRC staff through their existing authorized access.

---

## Operational Safety Protocols

### Human-in-the-Loop (HITL) Requirement
The TRC AI is designed as a **decision support tool, not a decision-making tool**. The following actions are **always human-confirmed before execution:**
- Posting any comment to a TDX ticket.
- Triggering any SCCM remote action on a device.
- Creating a new TDX service ticket.

### Fail-Safe Degradation
If any integrated platform is unreachable, the system **never crashes**. It falls back gracefully:
- **TDX offline** → Falls back to local mock/cached ticket data. Staff see a "CACHED" badge.
- **SCCM offline** → Falls back to local TDX CSV inventory data.
- **AI engine offline** → Returns a descriptive message. All non-AI modules remain fully functional.
- **ISE/Mist offline** → Module shows "unavailable" and logs the connectivity failure.

### Key Rotation Procedure
If institutional API keys need to be rotated:
1. Run `Update-API-Key.ps1` on a managed SCCM client to generate a new encrypted blob.
2. Update `config.json` `tdx.wskey` with the new encrypted value.
3. The system will auto-decrypt on the next request using the `.secret.key` master key.
4. The `.secret.key` file should be backed up securely (e.g., in SCCM's secure variable store).

### Incident Response
If a security incident is suspected (unauthorized access, key compromise):
1. **Immediately** stop the `start_ai.bat` process.
2. Rotate all credentials listed in `config.json` through their respective admin portals (TDX Admin, Cisco ISE, Jamf).
3. Run `python security.py` to regenerate the `.secret.key` and re-encrypt all config values.
4. Review the SQLite audit log (`trc_ai.db`) for anomalous session activity.
5. Notify the SMSU CISO/CIO per standard incident response procedures.

---

## Authorization & Sign-Off

This document describes the current state of the TRC Enterprise AI Assistant as of **May 15, 2026**. The system has been built in alignment with SMSU ITS policies and is ready for operational use by authorized TRC staff.

| Role | Name | Signature | Date |
|---|---|---|---|
| ITS Graduate Assistant (Builder) | Shadman Ahsan | | 2026-05-15 |
| CIO / ITS Director | | | |
| Information Security Officer | | | |

---

*This document is intended for internal SMSU ITS use only. Questions should be directed to the TRC Graduate Assistant or the CIO office.*
