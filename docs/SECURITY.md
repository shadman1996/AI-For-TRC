# 🔒 Security & Access Control

The TRC AI Assistant uses a **Role-Based Access Control (RBAC)** system combined with **Modular Permissions** and a mandatory **Human-In-The-Loop (HITL) Approval Gate** to ensure sensitive tools are only accessible to authorized staff.

## 👥 Roles
1. **Help Desk (Student Workers)**:
    - Access to Chat, KB, and Wayfinding.
    - Read-only access to AD and SCCM.
    - No access to StarID Portal Scraper or Remote Actions.
2. **Tech (Full-time Staff)**:
    - All Help Desk features.
    - Access to Remote SCCM actions.
    - Access to Deep Search (Scraper) and Jamf device data.
3. **WAG (Wireless Admin Group)**:
    - Access to detailed Juniper Mist metrics.
    - All Tech-level features.
    - **Authorization Principal**: WAG leaders hold the HITL Approval PIN that gates all destructive remote operations.
4. **SysAdmin**:
    - Full system access.
    - Access to the **Admin Panel** to manage users, system configuration, and audit logs.

## 🔒 Human-In-The-Loop (HITL) Governance
All destructive or high-privilege actions are **blocked** until a WAG leader enters the authorization PIN in the approval modal. This applies to:
- AD Account Unlocks
- AD Account Enable/Disable
- AD Password Resets
- SCCM Force Reboots

No AI action can bypass this gate. Every approved action is written to the audit log.

## 🧩 Modular Permissions
Permissions are granular. In the **Admin Panel**, a SysAdmin can assign specific modules to any StarID:
- `chat`: The main AI interface.
- `directory`: AD search.
- `sccm`: Windows device lookup (SCCM) and Apple device lookup (Jamf).
- `faq`: Knowledge Base.
- `tickets`: TDX integration.
- `wayfinding`: Maps and directions.
- `mist`: Wireless troubleshooting.
- `settings`: Admin panel access.

## 🛡️ Implementation Details
- **Backend Gating**: Every API request in `server.py` is checked against the user's session token and assigned permissions.
- **Frontend Masking**: UI elements (like Remote Action buttons) are hidden or disabled if the user lacks the necessary role.
- **Zero-Plaintext Secrets**: All API credentials (SCCM, Mist, Jamf, Scraper) are AES-256 encrypted in `config.json` via `security.py` and **never** exposed to the client.
- **SQLite Session Management**: Sessions are stored in `trc_ai.db` — no flat JSON files.
