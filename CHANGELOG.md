# Changelog: TRC Enterprise AI Assistant

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-05-11 (Current)
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
