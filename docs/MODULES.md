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

## 🏇 3. StarID Portal Scraper
- **Purpose**: Real-time "Deep Search" for StarID details.
- **Integration**: Playwright-based headless browser scraper for `starid.minnstate.edu/admin`.
- **Data Points**: TechID, Library Barcodes, ISRS Affiliation history, Password Expiry.

## 📡 4. Juniper Mist (WiFi)
- **Purpose**: Troubleshooting campus wireless connectivity.
- **Integration**: REST API connection to the Mist Cloud dashboard.
- **Data Points**: RSSI signal strength, AP connection history, OS type, Authentication status.

## 📖 5. Knowledge Base (KB) / FAQ
- **Purpose**: Local documentation retrieval.
- **Storage**: `kb.json` file.
- **AI Integration**: Uses fuzzy matching and LLM-based retrieval to find the most relevant IT procedures.

## 🎫 6. TDX Ticket Briefing
- **Purpose**: Assisting student workers with ticket classification.
- **Integration**: Connects to the TeamDynamix API.
- **AI Logic**: Automatically generates a "Briefing" for active tickets, matching them with relevant KB articles and suggesting the correct TDX form.
