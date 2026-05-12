# 🔒 Security & Access Control

The TRC AI Assistant uses a **Role-Based Access Control (RBAC)** system combined with **Modular Permissions** to ensure that sensitive tools are only accessible to authorized staff.

## 👥 Roles
1. **Help Desk (Student Workers)**:
    - Access to Chat, KB, and Wayfinding.
    - Read-only access to AD and SCCM.
    - No access to StarID Portal Scraper or Remote Actions.
2. **Tech (Full-time Staff)**:
    - All Help Desk features.
    - Access to Remote SCCM actions.
    - Access to Deep Search (Scraper).
3. **WAG (Wireless Admin Group)**:
    - Access to detailed Juniper Mist metrics.
    - All Tech-level features.
4. **SysAdmin**:
    - Full system access.
    - Access to the **Admin Panel** to manage users and system configuration.

## 🧩 Modular Permissions
Permissions are granular. In the **Admin Panel**, a SysAdmin can assign specific modules to any StarID:
- `chat`: The main AI interface.
- `directory`: AD search.
- `sccm`: Device lookup.
- `faq`: Knowledge Base.
- `tickets`: TDX integration.
- `wayfinding`: Maps and directions.
- `mist`: Wireless troubleshooting.
- `settings`: Admin panel access.

## 🛡️ Implementation Details
- **Backend Gating**: Every API request in `server.py` is checked against the user's session token and assigned permissions.
- **Frontend Masking**: UI elements (like Remote Action buttons) are hidden or disabled if the user lacks the necessary role.
- **Secure Config**: Credentials for external APIs (SCCM, Mist, Scraper) are stored in `config.json` and are never exposed to the client.
