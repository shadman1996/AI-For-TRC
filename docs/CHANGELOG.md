# Changelog: TRC Enterprise AI Assistant

All notable changes to this project will be documented in this file.

## [3.4.0] - 2026-05-13 (Current)
### Added
- **Unified Trace API (Everything is Connected)**: The AI now features a "global brain" capable of linking AD, TDX, SCCM, Jamf, ISE, and Mist. Technicians can instantly map users to their primary devices, current IP addresses, and physical network switch/AP locations.
- **Jamf Cloud Integration**: Added support for Apple Device Management. iPads and MacBooks are now seamlessly routed through the Jamf Cloud API for telemetry and reporting.
- **Human-In-The-Loop (HITL) WAG Approval**: All destructive remote actions (AD Unlocks, PC Restarts) now enforce a strict WAG Approval PIN modal, ensuring the AI cannot execute high-privilege changes without documented human authorization.
- **Encrypted Configuration Engine**: Implemented `security.py` to achieve zero-plaintext secrets. All API keys, tokens, and passwords in `config.json` are now AES-256 encrypted and decrypted securely in memory at runtime.
- **Hardened Authentication**: Replaced legacy master passwords with strict Active Directory role-validation for all non-emergency access.
- **Premium Connectivity UI**: Designed new glassmorphic Trace Cards and Unified Profile views to beautifully visualize cross-platform entity links.
- **Flat-File Migration & Cleanup**: Purged all legacy JSON data stores (`roles.json`, `kb.json`, `directory.json`) in favor of the optimized `trc_ai.db` SQLite engine.

## [3.3.0] - 2026-05-13
### Added
- **Cisco Identity Services Engine (ISE) Integration**: Launched a brand-new "Cisco ISE Security" module for network security diagnostics. Technicians can query endpoint sessions, view dynamic VLAN allocations, trace switch IPs and ports, and trigger Change of Authorization (CoA) actions to Quarantine or Restore devices instantly.
- **Admin Console Launcher**: Embedded a quick-link directly in the view header to easily jump to the live Cisco ISE admin dashboard (`https://ise.smsu.edu/admin/`).

## [3.2.0] - 2026-05-13
### Added
- **Premium Appearance & Personalization Suite**: Complete visual redesign adding customizable high-density typography (fonts like Outfit, Inter, Playfair), adjustable Glassmorphism intensities (Frosted, Translucent, solid), and flexible Chat Bubble Framing shapes.
- **Active Directory Account Operations**: Brand-new operations panel inside AD & User Management allowing direct StarID lookups, account status toggles, lockouts checks, password resets, and account unlocking.
- **Live Security & Admin Audit Logs**: Added real-time scrolling administrative logs tracking all security and role-access actions with microsecond precision.
- **Programmatic API Integration Gateway**: New `/api/integration/query` REST webhook enabling local OpenClaw agents and university notification bots to query the TRC KB, tickets, and directories.
- **Scrollability Enhancements**: Optimized css layouts making the appearance and configuration panels fully scrollable on all desktop and mobile displays.

## [3.1.0] - 2026-05-11
### Added
- **Granular Module Permissions**: Added module-level checkbox controls in the Admin Panel for highly customizable user access.
- **Network Map Viewer**: Enhanced PDF map renderer to handle file paths over the local network and added a reliable "Open in New Tab" fallback mechanism.
- **Resilient Authentication**: Upgraded AD authentication fallback logic with graceful timeouts and clear offline error messages.

## [3.0.0] - 2026-05-10
### Added
- **SQLite Migration**: Moved from flat JSON files to a robust SQLite database to support concurrent users and high-scale campus deployment.
- **Network Deployment Toolkit**: Added `setup_firewall.bat` for one-click network accessibility.
- **Deployment Dashboard**: New Admin Panel section showing the "Live LAN URL" for staff access.
- **Network Discovery**: Backend now automatically detects the host machine's LAN IP for easier deployment.

## [2.3.0] - 2026-05-08
### Added
- **Campus Wayfinding**: Integrated PDF floor plans for all major SMSU buildings.
- **AI Walking Directions**: Interactive, step-by-step guidance from TRC to any room on campus.
- **Staff Directory Integration**: AI can now look up office locations and provide directions directly from search results.

## [2.2.0] - 2026-05-07
### Added
- **Modular Architecture**: Switched to a "Car" model where AI engines (Ollama, OpenAI) and modules can be hot-swapped.
- **Granular Permissions**: Role-based access now controls specific sidebar modules (Chat, Tickets, Maps).

## [2.1.0] - 2026-05-06
### Added
- **Admin Panel**: Dedicated UI for managing user roles and permissions.
- **Role-Based Access Control**: Implemented Help Desk, Tech, WAG, and SysAdmin roles via StarID.

## [2.0.0] - 2026-05-04
### Added
- **Self-Learning Ingestion**: AI can now "learn" from CSV, TXT, and JSON files via drag-and-drop.
- **Permanent Memory**: Added "Learn this:" command to save specific technical knowledge to a local database.

## [1.3.0] - 2026-05-01
### Added
- **Juniper Mist Integration**: Real-time WiFi client diagnostics via MAC address lookup.

## [1.2.0] - 2026-04-28
### Added
- **SCCM Integration**: Device hardware and software lookup via AdminService API.

## [1.1.0] - 2026-04-25
### Added
- **Active Directory Integration**: StarID lookup for account status and lockout checks.

## [1.0.0] - 2026-04-20
### Added
- **Initial Release**: Basic Chat Assistant with TDX classification logic and 49 service categories.
- **Form Guidance**: Step-by-step instructions for filling out TDX ticket fields.
