# 🧩 System Modules

The TRC AI Assistant is built as a modular platform. Each module handles a specific enterprise integration or feature set.

## 1. 🛡️ Active Directory (AD) Module
- **Purpose**: Core staff/student directory lookup.
- **Integration**: Interfaces with the local Active Directory domain via PowerShell `Get-ADUser`.
- **Capabilities**: Displays Name, Title, Department, Email, and Account Status (Locked/Unlocked).

## 2. 💻 SCCM (MECM) Module
- **Purpose**: Device inventory and remote management.
- **Integration**: Uses the **SCCM AdminService REST API** (`https://sccmpss.smsu.edu/AdminService/`).
- **Features**: 
    - Device hardware/OS lookup.
    - Remote actions (Policy Sync, Update Scans).
    - ResourceID tracking for precise management.
    - **Robust Two-Step MAC Lookup Pipeline**: Resolves strict OData multi-value filter blocks on `MACAddresses` arrays by first mapping colons/hyphens MAC formats to a scalar `ResourceID` on `SMS_G_System_NETWORK_ADAPTER_CONFIGURATION`, then querying detailed device specifications in `SMS_R_System` using that `ResourceId` directly.

## 🏇 3. StarID Portal Scraper
- **Purpose**: Real-time "Deep Search" for StarID details.
- **Integration**: Playwright-based headless browser scraper for `starid.minnstate.edu/admin`.
- **Data Points**: TechID, Library Barcodes, ISRS Affiliation history, Password Expiry.

## 📡 4. Juniper Mist (WiFi)
- **Purpose**: Troubleshooting campus wireless connectivity.
- **Integration**: REST API connection to the Mist Cloud dashboard.
- **Data Points**: RSSI signal strength, AP connection history, OS type, Authentication status.
- **Auto-Fallback**: If a query MAC address is not registered in the active SCCM server, the system automatically runs a live Mist WiFi lookup to locate active personal or unmanaged devices on the campus network.

## 📖 5. Knowledge Base (KB) / FAQ
- **Purpose**: Local documentation retrieval.
- **Storage**: `kb.json` file.
- **AI Integration**: Uses fuzzy matching and LLM-based retrieval to find the most relevant IT procedures.

## 🎫 6. TDX Ticket Briefing
- **Purpose**: Assisting student workers with ticket classification.
- **Integration**: Connects to the TeamDynamix API.
- **AI Logic**: Automatically generates a "Briefing" for active tickets, matching them with relevant KB articles and suggesting the correct TDX form.

## 🧠 7. Prompt Enrichment & Augmented Context Layer
- **Purpose**: Fully bridge and cross-connect campus rooms, networks, staff directories, and devices for zero-hallucination AI chat.
- **Pipeline**: Scans conversational queries in real-time before passing them to the local model to inject highly accurate, localized facts:
    - **IP Subnets**: Automatically detects IP formats; maps `10.5.x.x` private subnets to the internal SMSU workstation grid and `137.192.x.x` blocks to the official public campus network.
    - **Room & Directory mapping**: Resolves physical room codes (e.g. `SC 219`); performs a database join on the local Web Directory registry to list active staff in that office.
    - **Network Ports**: Intercepts physical patching/jack requests (e.g., ethernet drop activations) to feed the correct ITS Network Operations patching procedures into the context.

