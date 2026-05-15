# 🔒 Security & Access Control
**Document Version:** 2.0 | Updated: May 15, 2026

The TRC AI Assistant uses **Role-Based Access Control (RBAC)**, **AES-256 Encryption at Rest**, a mandatory **Human-In-The-Loop (HITL) Approval Gate**, and an active **SecurityGuard Middleware** to ensure all institutional integrations are accessed securely and only by authorized staff.

---

## 👥 Roles & Module Access

| Role | Accessible Modules |
|---|---|
| **Guest** | Chat, Directory, Wayfinding, Quick Links |
| **Help Desk** | + Tickets (TDX), TDX Form Guide |
| **Tech** | + SCCM Tools, Mist WiFi, Cisco ISE, Jamf Cloud |
| **WAG** | + AD & User Management |
| **SysAdmin** | + Appearance Settings, full Admin Panel |

---

## 🔐 Credential Encryption
All institutional credentials stored in `config.json` use **Fernet AES-256 encryption** via `security.py`. No plain-text secrets exist anywhere in the codebase.

| Secret | Status |
|---|---|
| TDX BEID | `ENC(...)` encrypted |
| TDX Web Services Key | `ENC(...)` encrypted |
| TDX iPaaS Secret | `ENC(...)` encrypted |
| StarID Admin Password | `ENC(...)` encrypted |
| Cisco ISE Password | `ENC(...)` encrypted |

The master decryption key is stored in `.secret.key` — a **hidden system file** on the server. Credentials are decrypted **in memory only** at runtime and never written to disk in plain text.

---

## 🛡️ SecurityGuard Middleware (Network Protection)
The `SecurityGuard` class is active on **Port 8001** and provides perimeter defense against LAN threats:
- **Rate Limiting**: Maximum 60 requests/minute per IP. Excess triggers a 1-minute temporary block.
- **Anti-Scanning**: IPs generating 10+ consecutive 404 errors (port/path scanning behavior, e.g., Nmap) are auto-blocked for **10 minutes**.
- **Server Cloaking**: FastAPI identity headers are stripped to prevent framework fingerprinting.
- **All blocks are logged** with IP and timestamp for security review.

---

## 🔄 Human-In-The-Loop (HITL) Governance
All **destructive or high-privilege actions** are blocked until a WAG leader explicitly approves. This applies to:
- AD Account Unlocks / Enable / Disable
- AD Password Resets
- SCCM Force Reboots and remote actions
- **TDX Comment Posting**: AI-drafted responses must be reviewed and explicitly submitted by the logged-in staff member. The AI cannot post to TDX autonomously.

Every approved action is written to the local **audit log** in `trc_ai.db` with username, role, action type, and timestamp.

---

## 🧩 Worker Attribution
Every comment posted to TDX via the AI is automatically signed:
> `— Posted by [username] via TRC-AI Assistant`

This ensures full audit traceability. Anonymous posting is not possible.

---

## 🛠️ Implementation Details
- **Backend Gating**: Every API endpoint in `server.py` validates the session token and role before executing.
- **Frontend Masking**: UI elements for restricted modules are hidden or disabled based on the logged-in role.
- **Zero Plain-Text Secrets**: All API credentials are AES-256 encrypted in `config.json` and never exposed to the client browser.
- **SQLite Session Management**: Sessions stored in `trc_ai.db` with expiring tokens. No flat JSON files.
- **Bearer Token Lifecycle**: TDX Bearer tokens are held in memory only, auto-refreshed every 60 minutes, and never written to disk.

---

## 🔑 Key Rotation Procedure
If any credential needs to be rotated:
1. Update the plain-text value in the relevant admin portal (TDX Admin, Cisco ISE, Jamf).
2. Run `python security.py` with the new value to generate a new `ENC(...)` string.
3. Paste the new `ENC(...)` string into `config.json`.
4. Restart the server via `start_ai.bat`. No code changes required.

---

## 🚨 Incident Response
If a security incident is suspected:
1. **Stop** `start_ai.bat` immediately.
2. **Rotate** all credentials in `config.json` through their respective admin portals.
3. **Re-encrypt**: Run `python security.py` to regenerate the `.secret.key`.
4. **Audit**: Review `trc_ai.db` for anomalous session entries.
5. **Notify**: Contact the SMSU CISO/CIO per standard incident response procedures.

> **Reference:** For full details, see [`TRC_AI_Integration_Security_Policy.md`](TRC_AI_Integration_Security_Policy.md)
