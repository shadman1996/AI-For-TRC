# 🧩 System Modules
**Document Version:** 2.0 | Updated: May 15, 2026

The TRC AI Assistant is built as a modular platform. Each module handles a specific enterprise integration or feature set. All credentials for external platforms are stored **AES-256 encrypted** in `config.json` and decrypted in memory at runtime only.

---

## 1. 🤖 AI Chat Assistant
- **Purpose**: Natural language IT support for all TRC staff levels.
- **Engine**: Ollama `phi3:mini` — runs **100% locally** on the TRC workstation. No data leaves campus.
- **Capabilities**: Ticket classification, step-by-step resolution guidance, TDX form guidance, escalation paths.
- **Fallback**: If Ollama is offline, the system degrades gracefully with a user-friendly message. All other modules remain functional.

---

## 2. 🎫 TDX Ticket Module (Live)
- **Purpose**: Live ticket queue management and AI-assisted commenting.
- **Integration**: TeamDynamix REST API at `https://services.smsu.edu/TDWebApi/api`
- **Auth**: `BEID` + `WebServicesKey` via `/api/auth/loginadmin`. Bearer token cached in memory (1-hour expiry, auto-refresh).
- **Ticket Filter**: Shows only **New (Status 1)** and **In Process (Status 2)** tickets — no resolved ticket clutter.
- **AI Co-Pilot**:
  - Fetches the last 10 feed entries (comments + status history) per ticket.
  - AI determines current state, what's been tried, and who/what is the next step.
  - Drafts a professional response for staff review before posting.
- **Worker Attribution**: Every posted comment is signed `— Posted by [username] via TRC-AI Assistant`.
- **Roles**: `helpdesk`, `tech`, `wag`, `sysadmin` — posting requires explicit human confirmation.

---

## 3. 💻 SCCM Module
- **Purpose**: Windows device inventory and remote management.
- **Integration**: SCCM AdminService REST API (`https://sccmpss.smsu.edu/AdminService/`) + local WMI.
- **Capabilities**: Device hardware/OS lookup, last logged-in user, serial number, IP address.
- **Remote Actions** (HITL-gated): Policy Sync, Update Scan, Software Evaluation, Force Reboot.
- **Two-Step MAC Lookup**: Resolves MAC addresses via `SMS_G_System_NETWORK_ADAPTER_CONFIGURATION` → `SMS_R_System`.
- **Roles**: Read access — `tech+`. Remote actions — `wag`, `sysadmin`.

---

## 4. 🍎 Jamf Cloud Module
- **Purpose**: Apple device management (iPads, MacBooks, iPhones).
- **Integration**: Jamf Cloud API (`smsu.jamfcloud.com`) via AES-256 encrypted Bearer token.
- **Auto-Routing**: The Unified Trace Engine automatically routes Apple device queries to Jamf instead of SCCM.
- **Data Points**: Device name, serial number, OS version, last check-in, assigned user.
- **Scope**: Read-only. No device configuration changes via the AI.
- **Roles**: `tech`, `wag`, `sysadmin`.

---

## 5. 🗂️ Active Directory (AD) Module
- **Purpose**: Staff/student identity lookup and account management.
- **Integration**: PowerShell `Get-ADUser` via the campus-joined workstation session. No separate AD credentials stored.
- **Read Capabilities**: Full name, title, department, email, account lockout status.
- **Admin Actions** (HITL-gated): Account unlock, enable/disable, password reset — require WAG Approval.
- **Roles**: Read — `helpdesk+`. Admin actions — `wag`, `sysadmin`.

---

## 6. 🔍 StarID Portal Deep Search
- **Purpose**: Real-time deep lookup for StarID details not available in standard AD.
- **Integration**: Playwright headless browser scraper (`scraper.py`) authenticated with encrypted `vg6340ah` StarID Admin credentials.
- **Data Points**: TechID, library barcodes, ISRS affiliation history, password expiry.
- **Privacy**: Data is displayed transiently and **never written to the database**.
- **Roles**: `tech`, `wag`, `sysadmin`.

---

## 7. 📡 Juniper Mist WiFi Module
- **Purpose**: Campus wireless diagnostics.
- **Integration**: Mist Cloud REST API with AES-256 encrypted API token.
- **Data Points**: Client RSSI, AP association, roaming history, OS type, authentication status.
- **Auto-Fallback**: If a MAC isn't found in SCCM, the Unified Trace Engine automatically tries Mist.
- **Scope**: Read-only. No AP configuration changes via the AI.
- **Roles**: `tech`, `wag`, `sysadmin`.

---

## 8. 🛡️ Cisco ISE Module
- **Purpose**: Network endpoint security lookups — device posture and VLAN assignment.
- **Integration**: Cisco ISE ERS REST API at `https://ise.smsu.edu` with AES-256 encrypted credentials.
- **Data Points**: Endpoint authentication status, VLAN assignment, MAC-based posture.
- **Scope**: Read-only. No VLAN changes or endpoint modifications via the AI.
- **Roles**: `tech`, `wag`, `sysadmin`.

---

## 9. 🔒 Human-In-The-Loop (HITL) Governance
- **Purpose**: Prevent unauthorized destructive actions. The AI cannot modify production systems autonomously.
- **Mechanism**: All high-privilege operations trigger a confirmation gate before the API call executes.
- **Covered Actions**: AD Unlock, AD Disable, Password Reset, SCCM Reboot, TDX comment posting.
- **Audit Trail**: Every approved action is logged in `trc_ai.db` with username, role, action, and timestamp.

---

## 10. 📖 Knowledge Base (KB)
- **Purpose**: Local IT documentation and procedure retrieval.
- **Storage**: `trc_ai.db` SQLite database (49+ service categories based on historical ticket patterns).
- **AI Integration**: Fuzzy matching + LLM-based retrieval to surface relevant IT procedures.
- **Self-Learning**: Admins can type `"Learn this: [information]"` or drag-and-drop CSV/TXT/JSON files into chat to expand the KB.

---

## 11. 🗺️ Wayfinding Module
- **Purpose**: Interactive step-by-step campus navigation.
- **Capabilities**: Multi-phase walking directions, synchronized floor plan overlays, elevation/stairway intelligence, ASCII 3D voxel route projection.
- **Roles**: Available to all users including `guest`.

---

## 12. 🧠 Unified Connectivity Trace Engine
- **Purpose**: Cross-platform entity resolution — connect a user to their devices, location, and network status in a single query.
- **Pipeline**: `AD → TDX → SCCM/Jamf → Cisco ISE → Juniper Mist`
- **Capabilities**: IP subnet mapping, MAC-to-AP resolution, room-to-staff mapping, visual trace cards.
