# 🎙️ TRC AI: Executive Prompting Guide

The TRC AI is not just a chatbot; it is a **Command-and-Control Interface** for SMSU IT operations. Use the following natural language patterns to trigger automated workflows.

---

### 🏛️ 1. Knowledge & History (Infinite Memory)
The AI has ingested **173 KB articles** and **5,475 historical tickets**.
*   **KB Search:** *"What is ISRS?"* or *"How do I install SPSS on Mac?"*
*   **Historical Analysis:** *"How do we usually handle PaperCut toner issues?"*
*   **Expert Guidance:** *"Who is the primary contact for Chemistry equipment backups?"*

---

### 💻 2. Asset & Device Control (SCCM + Mist)
*   **Locate Device:** *"Where is computer BA-LAB-01?"* or *"Locate MAC 00:11:22:33:44:55"*
*   **Remote Action:** *"Sync SCCM policy on ST-219-PC"* or *"Scan for updates on laptop LT-5521"*
*   **WiFi Telemetry:** *"Check WiFi status for my phone [MAC]"*

---

### 🧹 3. System Maintenance (Bulk Actions)
*   **Profile Cleanup:** *"Cleanup user profiles on BA-LAB-01"* (Removes accounts > 6 months old).
*   **Session Management:** *"Logoff extra users on all desktops"* (Resolves simultaneous login slowdowns campus-wide).

---

### 🎫 4. TeamDynamix Integration (Live Bridge)
*   **Create Ticket:** *"Open a ticket about the printer in the library being jammed"*
*   **User Search:** *"Show me contact info for StarID vg6340ah"*
*   **Inventory Check:** *"What is the hostname for asset tag 1765817?"*

---

### 🔒 5. Administrative Guards
*   **Role Requirements:** Control actions (Restart, Cleanup, Sync) require the **`sysadmin`** role.
*   **Audit Logging:** Every administrative command is recorded in the **`audit_trail.log`**.
*   **Session Security:** All POST requests require a valid session token propagated from the frontend.
