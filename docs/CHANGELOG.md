# Changelog: TRC Enterprise AI Assistant

All notable changes to this project will be documented in this file.

## [4.4.0] - 2026-05-27
### Added
- **Active Directory SSO & Normalisation**: Auto-authenticates domain workstation principals (`System.Security.Principal.WindowsIdentity`) via `/api/auth/sso` and provisions localized session directories.
- **TDX Lockout Protection Shield**: Intercepts initial TDX credential failures and blocks subsequent active requests inside an in-memory session blocklist (`FAILED_TDX_LOGINS`), shielding StarIDs from university-wide Active Directory lockouts.
- **Fuzzy StarID & Technician Lookups**: Fuzzy-resolves administrative samaccountnames (`wagahsan` ➔ `Shadman Ahsan`) and normalizes StarIDs to `@minnstate.edu` to map accounts with authorized TDX licensed technician emails (`vg6340ah@minnstate.edu`), unlocking live ticketing sync.
- **Human-in-the-Loop Code Patch Lab**: Added a frosted glassmorphic card `#patchLabCard` to apply and revert optimizations on the fly. Includes high-contrast color diff parsing, safe `replace_last` localized file modification, dynamic double-occurrence checks (`content.count(replacement_code) >= 2`) to solve configuration dictionary collisions, rolling backups (`server.py.bak`), and strict FastAPI syntax compilation guards (`py_compile`).
- **Remote PowerShell Script Runner**: Added `#remoteRunnerCard` terminal console interface to remotely execute `.ps1` administrative tasks on domain-joined PCs. Integrates fast WSMan connection pinging (`Test-WSMan`), remote execution coping (`Invoke-Command -FilePath`), secure WAG PIN verification modal approvals (`2026`), and audit logging.

## [4.3.0] - 2026-05-26
### Added
- **RAG-Powered Shift Handoff Report**: The "Shift Handoff Report" button now fetches similar historical cases from the 5,477-ticket archive for each active ticket. The downloaded report includes a `SIMILAR HISTORICAL CASES` section per ticket showing which technician resolved similar issues, the department, and resolution time.
- **Smart Urgency Detection**: Replaced the keyword-only mock urgency analyzer (`/api/ai/analyze-urgency`) with a real intelligence engine that scores urgency (0-100) using three signal layers: critical/high-priority keyword detection, historical resolution speed analysis (tickets resolved in <4h historically indicate urgency), and classification type matching (Incidents score higher than Service Requests). Returns a structured `score`, `level` (Low/Medium/High/Critical), and `reasons` array.
- **Resolution Time Prediction (ETA Badges)**: Each ticket card in the queue now displays an `⏱️ ~Xh (N cases)` badge showing predicted resolution time. The backend `/api/tdx/tickets/predict-resolution` endpoint calculates this by matching the ticket's service category or title keywords against historical averages, returning `avg_hours`, `fastest_hours`, `slowest_hours`, and `sample_size`.
- **Proactive Duplicate Detection**: When a technician opens a ticket detail view, the system automatically checks for near-duplicate historical tickets using strict AND keyword matching via `/api/history/duplicates`. If matches exceed 40% confidence, a glassmorphic `⚠️ Similar Historical Cases Found` alert card renders showing the historical ticket ID, resolving technician, resolution time, and confidence percentage.
- **Web Search Integration (DuckDuckGo)**: Replaced the stub `/api/ai/web-search` endpoint (which only returned a Google link) with a real DuckDuckGo Instant Answer API integration. Returns structured results including `summary`, `source`, `source_url`, and up to 5 `related` topics. Falls back gracefully to a Google search link if DuckDuckGo returns no results.

## [4.2.0] - 2026-05-20
### Added
- **Historical Ticket RAG Engine (5,477 Cases)**: Rewrote and activated the `search_history()` function to perform intelligent multi-keyword weighted SQL queries against the `tickets_historical` table. Keywords are extracted, stop-words filtered, and matches are scored with a weighted priority system (title match = 3×, service match = 2×, classification match = 1×). Returns the top 3 most relevant historical cases ranked by relevance score and resolution speed.
- **Core Chat RAG Integration**: The main AI Chat Assistant (`enrich_ai_prompt`) now automatically searches the 5,477-case historical ticket archive on every prompt. Similar past cases — including the responsible technician, department, service category, and SLA status — are injected as real-time background context, enabling the AI to reference proven resolutions and routing patterns.
- **TDX Ticket Co-Pilot RAG Integration**: The Technician Co-Pilot (`/api/tdx/tickets/{ticket_id}/suggest`) now queries the historical archive using the active ticket's title. Matched historical cases are injected as a `SIMILAR HISTORICAL CASES & RESOLUTIONS` block into the AI prompt, enabling the co-pilot to suggest proven resolutions, identify which team or technician typically handles similar issues, and detect common patterns from past incidents.

### Fixed
- **Critical: `search_history` Table Name Bug** — Corrected the historical ticket lookup from the non-existent table `historical_tickets` to the actual table `tickets_historical`, which was causing a silent 500 crash and forced the function to be commented out.
- **Critical: `search_history` Column Name Bug** — Corrected department column access from `m['dept']` (non-existent) to `m['acct_dept']`, preventing `KeyError` crashes when formatting results.

## [4.1.1] - 2026-05-20
### Fixed
- **Generic Search Interception & Cache Busting**: Busted the browser cache by updating `app.js` to `v=4.1.1` in `index.html`. Resolved a critical issue where generic search commands (such as clicking `"Find PC by StarID"` or typing generic instructions) bypassed local UI checks, sent raw query strings to the Active Directory endpoint, and triggered failed lookup errors or timeouts. The system now intercepts these queries with the Mustang (`🐴`) mascot and prompts the user to supply the actual target identifier first.

## [4.1.0] - 2026-05-20
### Changed
- **AES Cryptographic Key Length Audit**: Conducted an in-depth cryptographic audit of the symmetric credential encryption layer in `security.py`. Updated all system architecture guides, security policies, and UI text descriptions to accurately reflect that the `Fernet` encryption engine uses robust **AES-128-CBC** for encryption at rest (paired with HMAC-SHA256 authentication derived from a 256-bit base64-encoded master key).

## [4.0.0] - 2026-05-19 (Current)
### Added
- **High-Density Mobile Responsiveness & Viewport Fit**: Hardened the entire application layout to fit strictly within any screen size (height 100vh) without vertical body scroll or horizontal window overflows. Main sidebar collapses into a slide-out hamburger overlay.
- **Scrollable Results Containers**: Added flex scroll wrappers (`overflow-y: auto`) to Directory, SCCM, Mist, Cisco ISE, and Jamf search list elements to prevent lists from breaking viewport bounds on mobile.
- **Indoor Vector Wayfinding Integration**: Updated Google Maps embeds to target high-zoom level vector view (`z=19`) for live indoor room, hallway, and annotation wayfinding across Southwest Minnesota State University (SMSU).
- **Secure Ephemeral Dynamic Ticket Session Auth**: Implemented a secure dynamic credential mapping system that links a logged-in technician's Active Directory (AD) password securely in-memory under their random session token (no local plain-text file storage). The backend dynamically requests a user-level token from TeamDynamix `services.smsu.edu` to query and sync tickets strictly on their behalf.
- **Intelligent Status Class Filtering**: Hardened `/api/tdx/tickets` to perform ticket search requests specifying active status class IDs (`New`, `In Process`, `On Hold`, and `Requested`). Completed/closed classes (`Resolved`, `Closed`, `Cancelled`) are bypassed at the API layer.
- **Premium Glassmorphic Status Filter Bar**: Added an elegant, click-to-toggle horizontal glassmorphic filter row containing custom indicator lights and micro-animations for filtering across `New`, `Open`, `In Process`, `On Hold`, and `Waiting for Customer Response` states.
- **Vibrant Status Indicator Badging**: Aligned all ticketing list card badges and ticket details elements to dynamically style themselves with status-matching backgrounds and border colors.
- **Robust Client-Side Cache**: Transitioned the frontend ticketing engine to maintain an `allCachedTickets` array, performing ultra-fast local filter evaluations on filter pill clicks without incurring additional network latency or round-trips.
- **Google Maps Outdoor/Indoor Integration**: Integrated dynamic Google Maps Satellite/Hybrid views directly into the Campus Wayfinding module. Users can toggle between high-fidelity indoor PDF floor plans and outdoor satellite navigation maps centered precisely on target buildings (Bellows Academic, Student Center, etc.). In step-by-step route planning, the Google Map frame automatically updates to center on the active building of each walking step.

### Changed
- **Mock Fallback Data Alignment**: Updated `MOCK_TICKETS` statuses in `server.py` to reflect actual active categories (`New`, `Open`, `In Process`, `On Hold`, `Waiting for Customer Response`) to prevent them from being hidden by active-only ticketing rules.

## [3.6.0] - 2026-05-14
### Added
- **Premium Interactive Step-by-Step Wayfinding Assistant**: Fully redesigned the Campus Wayfinding dashboard module. Users can map customizable multi-elevation navigation routes (e.g., BA 200 to ST 269) with step-by-step instructions. The assistant dynamically maps each physical traversal stage to the correct campus floor plan PDF, automatically switching interactive map views as users follow along.
- **Wayfinding Clean Layout Redesign**: Reorganized the Wayfinding sidebar controls into an elegant Mode Switcher tab system (AI Route Planner vs Browse PDFs) to remove visual clutter and cognitive load. The map display features floating translucent indicators and interactive phase controllers.
- **Dynamic ASCII Hyper-Voxel Map Projections**: Fully upgraded the `draw_3d_route` generation logic to parse physical paths and building codes dynamically. Rather than rendering static text boxes, the elevation view aligns start markers (`📍`) and destination flags (`🚩`) exactly on the calculated levels.
- **Smart Wayfinding Target Detection**: Searching for specific room codes (like `st269` or `ch128`) in the Campus Directory instantly intercepts the directory query failure and renders an elegant Wayfinding redirection card to launch custom step-by-step route planning.
- **Feed-Aware AI Ticket Briefings**: The AI briefing now ingests the full ticket activity feed (comments, status changes) and produces a structured tech briefing with four sections: 📍 **Current State**, 🔧 **Tech Action Items**, ⚠️ **Escalation Path**, and 📋 **Closing Notes**. This gives incoming techs an instant understanding of where a ticket stands and what to do next.
- **Activity Feed Timeline**: Ticket detail view now renders a scrollable, color-coded feed timeline showing all comments and status changes — who said what, when, with visual distinction between status changes (🔄) and comments (💬).
- **Redesigned Ticket Detail View**: New layout with status card header, requestor info with one-click StarID profile lookup, collapsible description, service badge, and quick action buttons (Ask AI, Update in TDX, Lookup StarID).
- **Smart Triage Fallback (Offline AI)**: When the AI engine is unavailable, the briefing now intelligently matches the ticket's service/keywords against the FAQ_DATA library and displays matched procedures, resolution steps, TDX form classification, escalation contacts, and the activity feed — instead of a generic "AI Briefing Unavailable" error.
- **Ask AI About This (Direct Stream)**: The "Ask AI About This" button now sends the full ticket context (ID, requestor, priority, service, description) directly to the AI stream endpoint, bypassing frontend intent detectors (StarID/SCCM/Directory) that were intercepting the message.
- **P Drive Access Intelligence**: Added a high-priority Knowledge Base rule for "P Drive" and "Network Drive" access requests. The AI now automatically identifies these requests and provides the direct TeamDynamix request form URL alongside mapping instructions for shared network storage.
- **Mock Ticket Feed Data**: Added realistic comment/status change histories to the first 5 mock tickets for development and demo purposes (D2L, ISRS, Computer Replacement, AC Maintenance, Device Deployment).

### Fixed
- **Wayfinding Floor Inference**: Fixed an issue where room codes (e.g., BA 200) would default to the 1st floor map even if the room was on the 2nd floor. The system now intelligently parses room prefixes to select the correct elevation map.
- **Critical: `UnboundLocalError: room_code`** — Fixed a crash in `enrich_ai_prompt()` where `room_code` and `bld` were referenced inside the `device_match` block but only defined in the `room_match` block. Searching for a person's name (e.g., "michelle beach") would trigger the device regex and crash the `/api/ai/stream` endpoint with a 500 error.
- **Server Error Handling (`/api/ai/generate`)** — Wrapped the generate endpoint in try-except so unhandled exceptions in `enrich_ai_prompt()` return a graceful JSON response instead of a raw 500 error.
- **Server Error Handling (`/api/ai/stream`)** — Added try-except around `enrich_ai_prompt()` in the stream endpoint with fallback to raw prompt, preventing 500 crashes.
- **AI Briefing Timeout** — Added a 12-second `AbortController` timeout to the briefing fetch call to prevent indefinite hangs.
- **Password Visibility Toggle** — Implemented `togglePasswordVisibility()` in `app.js` to fix the non-functional show/hide password button on the login screen.

## [3.5.1] - 2026-05-13
### Added
- **Executive Manager Reporting (Phase 4 Prototype)**: Launched the "Platform Connectivity Pulse" in the AD Dashboard, providing real-time health monitoring for SCCM, Jamf, ISE, Mist, and TDX.
- **AI Briefing Resiliency**: Implemented a robust briefing system with automated loading states, retry capabilities, and intelligent manual triage fallbacks when the local AI engine is under high load.
- **Standardized Navigation Layout**: Optimized the Top Bar to align with industry-standard dashboard formats (User Profile and Notifications strictly right-aligned).
- **Relocated Alert System**: Moved system toast notifications to the top-right corner for better visibility and reduced obstruction of core UI elements.
- **Horizontal Scroll Suppression**: Enforced strict `overflow-x: hidden` rules across the sidebar and navigation groups to ensure a stable, vertical-only mobile and desktop experience.
- **Bug Fix: Variable Shadowing**: Resolved a critical duplicate declaration issue in `app.js` that threatened session state stability.

## [3.5.0] - 2026-05-13

## [3.4.0] - 2026-05-13
### Added
- **Unified Trace API (Everything is Connected)**: The AI now features a "global brain" capable of linking AD, TDX, SCCM, Jamf, ISE, and Mist. Technicians can instantly map users to their primary devices, current IP addresses, and physical network switch/AP locations.
- **Jamf Cloud Integration**: Added support for Apple Device Management. iPads and MacBooks are now seamlessly routed through the Jamf Cloud API for telemetry and reporting.
- **Human-In-The-Loop (HITL) WAG Approval**: All destructive remote actions (AD Unlocks, PC Restarts) now enforce a strict WAG Approval PIN modal, ensuring the AI cannot execute high-privilege changes without documented human authorization.
- **Encrypted Configuration Engine**: Implemented `security.py` to achieve zero-plaintext secrets. All API keys, tokens, and passwords in `config.json` are now AES-128-CBC encrypted (via Fernet) and decrypted securely in memory at runtime.
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
