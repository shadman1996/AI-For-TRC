# 🛠️ Integration Architectures & Data Pipelines
**TRC Enterprise AI Assistant — SMSU**  
*Technical Architecture Reference Guide*

This document provides a detailed breakdown of how each integration module in the TRC AI Assistant queries, pulls, and parses data from Southwest Minnesota State University's (SMSU) live IT systems.

---

```mermaid
graph TD
    User([Help Desk Staff]) -->|Queries Name / StarID| Chat[app.js - Chat Interface]
    Chat -->|API Call| Server[server.py - FastAPI Backend]
    
    subgraph Enterprise Authentication
        Server -->|In-Memory AES Decrypt| Sec[security.py - Fernet AES-128]
    end
    
    subgraph Live Network Queries (Powershell & REST APIs)
        Server -->|LDAP Filter & AD Session| AD[Active Directory - DirectoryServices]
        Server -->|Windows SSO Auth| SCCM[SCCM AdminService - sccmpss.smsu.edu]
        Server -->|Bearer Token Auth| TDX[TeamDynamix REST - services.smsu.edu]
        Server -->|Browser Emulation| StarID[StarID Admin Scraper - scraper.py]
        Server -->|Mist Token API| Mist[Juniper Mist Cloud API - api.mist.com]
        Server -->|Basic Auth / ERS API| ISE[Cisco ISE API - ise.smsu.edu]
        Server -->|REST API| Jamf[Jamf Cloud API - smsu.jamfcloud.com]
    end

    AD -->|User Metadata| Server
    SCCM -->|Device Inventory| Server
    TDX -->|Tickets & Timelines| Server
    StarID -->|TechID & ISRS History| Server
    Mist -->|WiFi RSSI & AP Locations| Server
    ISE -->|Switch Port & Posture| Server
    Jamf -->|macOS/iOS Telemetry| Server
    
    Server -->|Unified JSON Payload| Chat
```

---

## 1. 🗂️ Active Directory (AD) Module

### Data Pipeline & Query Mechanism
Unlike traditional integrations that store separate service account passwords, the AD module leverages **Workstation Session Binding**. Because the workstation running the assistant is joined to the `minnstate.edu` domain, the FastAPI backend delegates lookup permissions directly to the active Windows session.

*   **Endpoint**: `/api/ad/{query}`
*   **Search Type**: LDAP Flexible Name & StarID Filter.
*   **Mechanism**:
    1. The query string is parsed into individual words.
    2. If the search contains multiple words (e.g., `Shadman Ahsan`), it creates a conjunctive display name search: `(&(displayname=*Shadman*)(displayname=*Ahsan*))`.
    3. It combines this DisplayName check with a prefix match on StarID (`samaccountname`) and an email substring match (`mail`), wrapping it in an OR (`|`) LDAP filter:
        ```ldap
        (&(objectClass=user)(|(samaccountname=query*)(&(displayname=*word1*)(displayname=*word2*))(mail=*query*)))
        ```
    4. The backend spawns a PowerShell subprocess calling the .NET `DirectoryServices.DirectorySearcher` object to execute the LDAP query over the network.
    5. Attributes requested: `samaccountname` (StarID), `displayname`, `title`, `department`, `lockouttime`, `physicaldeliveryofficename` (Office), `mail` (Email), and `telephonenumber`.

### Account Management Operations (HITL Gated)
*   **Actions**: Unlock Account, Enable/Disable User, Password Reset.
*   **Execution**: Spawns PowerShell cmdlets like `Unlock-ADAccount` or `Set-ADAccountPassword` using standard domain administration delegation rules.
*   **Gate**: Enforces a strict Human-In-The-Loop (HITL) WAG PIN authorization code overlay prior to calling the powershell subprocess.

---

## 2. 💻 SCCM Module (System Center Configuration Manager)

### Data Pipeline & Query Mechanism
SCCM telemetry is queried through the official **SCCM AdminService OData API** hosted internally. 

*   **Endpoints**: 
    *   `/api/sccm/pc/{device_name}` (Device Metadata Lookup)
    *   `/api/sccm/user/{username}` (User Device Mapping)
*   **Mechanism**:
    1. **Technician SSO Auth**: The Python backend triggers a PowerShell subprocess that targets the internal endpoint:
       `https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System`
    2. In the PowerShell script, it sets `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12` and issues `Invoke-RestMethod` using the `-UseDefaultCredentials` flag.
    3. The SCCM server authenticates the call automatically using the active technician's Kerberos ticket (Windows SSO).
    4. **Filtering**:
        *   For device lookup, it filters by Name: `?$filter=Name eq '{device_name}'`.
        *   For user mapping, it filters by LastLogonUserName: `?$filter=LastLogonUserName eq '{username}'`.
    5. The AdminService returns JSON objects containing the computer's network details, operating system version, active IP list, hardware model, and its unique SCCM `ItemKey` (Resource ID).

### MAC Address Resolution Pipeline
When resolving dynamic client device telemetry from Cisco ISE or Mist, the system resolves MAC addresses back to physical computer names by making a two-stage WMI OData request:
1. Queries `SMS_G_System_NETWORK_ADAPTER_CONFIGURATION` filtering by MAC.
2. Cross-references the resulting `ResourceID` back to `SMS_R_System` to pull the active PC name.

---

## 3. 🎫 TeamDynamix (TDX) Ticket Module

### Data Pipeline & Query Mechanism
TeamDynamix integration queries the cloud-hosted REST API to display ticketing boards and timelines.

*   **Endpoints**: `/api/tdx/tickets`, `/api/tdx/ticket/{id}`, `/api/tdx/ticket/{id}/comment`
*   **Target URI**: `https://services.smsu.edu/TDWebApi/api/`
*   **Authentication Flow**:
    1. **Administrative Feed/Offline Sync**: Uses credentials stored in `config.json` encrypted with AES-128 via `security.py`. Decrypted strictly in-memory during runtime startup.
    2. **Technician Context Execution**: When a technician signs into the web application, their password is dynamically linked in-memory. The backend hits the TDX auth gateway at:
       `/auth/loginadmin` (passing the username and session-decrypted password).
    3. TDX returns a temporary **Bearer Token** which the backend uses to authenticate all subsequent actions specifically under the technician's AD permissions.
*   **Retrieval Details**:
    *   **Ticket Search**: Fetches the active ticket list using `POST /tickets/search` filtering only for status class IDs `New` (1), `In Process` (2), `On Hold` (3), and `Requested` (7).
    *   **Timeline Timeline**: Hits `/tickets/{id}/feed` to pull the latest comments, assignee changes, and status logs.
    *   **Co-Pilot Generation**: Sends the description and raw timeline comments to the local Ollama LLM to build a structured engineering brief (Current State, Action Items, Escalation Path, Reply Draft).

---

## 4. 🔍 StarID Portal Deep Search

### Data Pipeline & Query Mechanism
Because some administrative attributes (e.g., Minnesota State TechID, Library Barcode, complete active/historical academic enrollment registrations) are stored within the MnSCU StarID Administrator Portal rather than standard campus AD, the system uses browser automation to scrape the portal.

*   **Endpoint**: `/api/portal/scrape/{starid}`
*   **Mechanism**:
    1. Spawns a headless **Playwright** browser session (`scraper.py`).
    2. Reads the encrypted StarID admin credentials from `config.json` (decrypted strictly in-memory at runtime).
    3. Emulates user input to navigate to the MnSCU/Minnesota State StarID Admin Portal login interface.
    4. Authenticates, solves any state authorization headers, and searches for the target StarID.
    5. Navigates to the user's detailed metadata page and parses the structural HTML table.
    6. Extracts specialized fields: TechID, Library Barcodes, Password Expiry Date, Secondary Notification Emails, ISRS Student/Staff Affiliation lists, and active course registration codes.
    7. Returns the data transiently. **Crucial Privacy Gating**: None of this detailed profile metadata is written to the database; it exists solely in-memory inside the active WebSocket or HTTP response and vanishes upon tab closure.

---

## 5. 📡 Juniper Mist Wireless Module

### Data Pipeline & Query Mechanism
Used to locate active Wi-Fi clients on campus and evaluate signal health.

*   **Endpoint**: `/api/mist/{mac_address}`
*   **Target URI**: `https://api.mist.com/api/v1/orgs/{org_id}/clients/search?mac={mac}`
*   **Authentication**: Bearer token decrypted from configuration.
*   **Mechanism**:
    1. Performs a `GET` request passing `Authorization: Token [MistToken]`.
    2. Pulls real-time wireless metrics:
        *   `last_hostname`: Active client computer name.
        *   `last_ssid`: Connected network (e.g., `SMSU-Secure`, `SMSU-Guest`).
        *   `last_ip`: Currently allocated IPv4 address.
        *   `last_device` / `last_os`: Hardware type and client operating system signature.
        *   `ap_id` / `ap_name`: The specific physical Access Point the device is associated with.
        *   `rssi`: Active signal strength (dBm) to diagnose connectivity loss.
        *   `band`: Wireless band (`2.4GHz` or `5GHz`).

---

## 🛡️ 6. Cisco ISE Module

### Data Pipeline & Query Mechanism
Diagnoses network policy and posture (VLAN allocations, wired security posture).

*   **Endpoint**: `/api/ise/{mac_address}`
*   **Target URI**: `https://ise.smsu.edu:8905/ers/config/`
*   **Authentication**: Basic authentication header using AES-128 decrypted credentials.
*   **Mechanism**:
    1. Hits `/endpoint?filter=mac.EQ.{mac_address}` to retrieve the internal ISE Endpoint ID.
    2. Hits `/endpoint/{endpoint_id}` to resolve full profiling details.
    3. Queries `/session/mac/{mac_address}` to fetch live authentication states.
    4. Returns active network switch IP address, physical switch port interface, VLAN assignment ID, and overall endpoint posture evaluation (Compliant / Non-Compliant).

---

## 🍎 7. Jamf Cloud Module

### Data Pipeline & Query Mechanism
Used for auditing Apple mobile assets (MacBooks, iPads) bypassing standard Windows SCCM queries.

*   **Endpoint**: `/api/sccm/mac/{mac_address}` (with fallback automatic routing to Jamf)
*   **Target URI**: `https://smsu.jamfcloud.com/JSSResource/`
*   **Authentication**: Uses Jamf API credentials decrypted dynamically at runtime to obtain a Bearer Token.
*   **Mechanism**:
    1. If the Unified Trace Engine detects an Apple device pattern or does not find a MAC in SCCM, it targets the Jamf API.
    2. Queries `/computers/macaddress/{mac_address}` or `/mobiledevices/macaddress/{mac_address}`.
    3. Parses returning XML/JSON fields to pull: Device Name, Serial Number, OS Version, Last Check-in timestamp, and the registered staff/student owner.

---

## 🧠 8. Unified Connectivity Trace Engine

### The Cross-Module Correlation Loop
The `/api/trace/{query}` endpoint is the system's "coordination brain." It connects independent database models into a single end-to-end topological map:

```text
AD USER LOOKUP 
   └── (Retrieve StarID) 
        ├──> query_ad() ➔ Email, Department, Lockout State
        │
        └──> query_sccm_user() ➔ Match LastLogonUserName ➔ PC Name (e.g. JSNZR33)
              └──> query_sccm_pc() ➔ Retrieve active MAC Address & IP
                    │
                    ├──> query_ise() ➔ Pass MAC ➔ Switch IP, Physical Port, VLAN ID
                    │
                    └──> query_mist() ➔ Pass MAC ➔ AP Name, SSIDs, live RSSI Signal (dBm)
```

This pipeline allows a technician to type a single name (like `"Shadman Ahsan"`) and see that they are:
1. Logged into PC **`JSNZR33`**
2. Active on IP **`10.140.12.85`**
3. Authenticated securely on **`VLAN 105`**
4. Connected to **Switch `10.10.4.12` Port `Gi1/0/23`**
5. Roaming on AP **`AP-TRC-01`** with an RSSI of **`-54 dBm`**.
