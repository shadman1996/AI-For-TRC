# 🧩 System Modules

The TRC AI Assistant is built as a modular platform. Each module handles a specific enterprise integration or feature set.

## 1. 🛡️ Active Directory (AD) Module
- **Purpose**: Core staff/student directory lookup.
- **Integration**: Interfaces with the local Active Directory domain via PowerShell `Get-ADUser`.
- **Capabilities**: Displays Name, Title, Department, Email, and Account Status (Locked/Unlocked).
- **Admin Actions**: WAG and SysAdmin roles can Unlock accounts, Enable/Disable accounts, and Reset passwords — all gated by the **HITL WAG Approval Modal**.

## 2. 💻 SCCM (MECM) Module
- **Purpose**: Device inventory and remote management for Windows endpoints.
- **Integration**: Uses the **SCCM AdminService REST API** (`https://sccmpss.smsu.edu/AdminService/`).
- **Features**: 
    - Device hardware/OS lookup.
    - Remote actions: Policy Sync, Update Scan, Software Eval, Force Reboot — all HITL-gated.
    - ResourceID tracking for precise management.
    - **Robust Two-Step MAC Lookup Pipeline**: Resolves strict OData multi-value filter blocks on `MACAddresses` arrays by mapping to `SMS_G_System_NETWORK_ADAPTER_CONFIGURATION`, then querying `SMS_R_System`.

## 3. 🍎 Jamf Cloud Module
- **Purpose**: Apple device management (iPads, MacBooks, iPhones) for campus hardware.
- **Integration**: Connects to `smsu.jamfcloud.com` via Jamf API with stored credentials.
- **Auto-Routing**: The Unified Trace Engine automatically routes Apple device queries to Jamf instead of SCCM based on device name or OS context.
- **Data Points**: Device Name, Serial Number, OS Version, Last Check-in, Assigned User.

## 4. 🏇 StarID Portal Scraper
- **Purpose**: Real-time "Deep Search" for StarID details.
- **Integration**: Playwright-based headless browser scraper for `starid.minnstate.edu/admin`.
- **Data Points**: TechID, Library Barcodes, ISRS Affiliation history, Password Expiry.

## 5. 📡 Juniper Mist (WiFi)
- **Purpose**: Troubleshooting campus wireless connectivity.
- **Integration**: REST API connection to the Mist Cloud dashboard.
- **Data Points**: RSSI signal strength, AP connection history, OS type, Authentication status.
- **Auto-Fallback**: If a MAC address is not found in SCCM, the system automatically performs a live Mist WiFi lookup.

## 6. 🔒 Human-In-The-Loop (HITL) Governance Module
- **Purpose**: Prevent unauthorized destructive actions — no remote changes without WAG approval.
- **Mechanism**: All high-privilege operations (AD Unlock, AD Disable, PC Reboot, Password Reset) trigger a **WAG Approval Modal** requiring a secure PIN before the API call executes.
- **Audit Trail**: Every approved action is logged in the in-memory `ADMIN_AUDIT_LOGS` and visible in the SysAdmin panel.

## 7. 📖 Knowledge Base (KB) / FAQ
- **Purpose**: Local documentation retrieval.
- **Storage**: `trc_ai.db` SQLite database (migrated from legacy `kb.json`).
- **AI Integration**: Uses fuzzy matching and LLM-based retrieval to find the most relevant IT procedures.

## 8. 🎫 TDX Ticket Briefing
- **Purpose**: Assisting student workers with ticket classification.
- **Integration**: Connects to the TeamDynamix API.
- **AI Logic**: Automatically generates a "Briefing" for active tickets, matching them with relevant KB articles and suggesting the correct TDX form.

## 9. 🧠 Prompt Enrichment & Augmented Context Layer
- **Purpose**: Fully bridge and cross-connect campus rooms, networks, staff directories, and devices for zero-hallucination AI chat.
- **Pipeline**: Scans conversational queries in real-time before passing them to the local model to inject highly accurate, localized facts:
    - **IP Subnets**: Automatically detects IP formats; maps `10.5.x.x` subnets to internal workstations and `137.192.x.x` to the public campus network.
    - **Room & Directory mapping**: Resolves physical room codes (e.g. `SC 219`); joins the local Web Directory to list active staff in that office.
    - **Network Ports**: Intercepts ethernet drop/patching requests to feed the correct ITS Network Operations procedures into the context.
