# TRC Enterprise AI Help Desk — Live Demo Script
### Presenter: Shadman Ahsan | Duration: ~15 minutes
### Audience: ITS Leadership & University Administration

---

## Before the Meeting
- [ ] Server is running on `http://10.1.40.139:8001` (run `start_ai.bat`)
- [ ] Open Chrome to the login screen — do NOT log in yet
- [ ] Have a second tab ready with TDX open to a real ticket for comparison
- [ ] Close all other windows to avoid distractions
- [ ] Test the PING command works (`type PING in chat → instant response`)

---

## OPENING (1 minute)

> *"Thank you for taking the time. I've been building something over the past few weeks that I believe can significantly improve how the TRC operates — particularly for our Help Desk workers and technicians."*

> *"Right now, when a tech gets a ticket, they have to jump between five different platforms — TDX for the ticket, Active Directory for account info, SCCM for device management, Mist for WiFi diagnostics, and the knowledge base for procedures. That's a lot of context-switching, and for new Help Desk workers, it's overwhelming."*

> *"What I've built consolidates all of that into a single interface, guided by an AI assistant that runs entirely on campus — no student or staff data ever leaves our network."*

---

## DEMO SECTION 1: Login & First Impression (1 minute)

**👉 Action:** Log in with your StarID credentials

> *"The system uses Active Directory authentication — the same StarID credentials staff already use. No new accounts needed."*

**👉 Action:** Point to the sidebar, the system health indicator, and the top bar

> *"Once logged in, the tech sees their role, the AI status, and all their modules in one place. The system automatically loads the right tools based on their access level — Help Desk workers see the basics, WAG technicians see everything."*

---

## DEMO SECTION 2: AI Chat Assistant (2 minutes)

**👉 Action:** Type `"PING"` → Show instant response

> *"First — speed. The AI responds instantly to confirm it's alive. This is important because the AI runs locally on our infrastructure."*

**👉 Action:** Type `"How do I reset a student's password?"` → Let AI respond

> *"A new Help Desk worker on their first shift doesn't know the password reset process. Instead of searching through documentation or asking a colleague, they just ask the AI. It gives them the exact steps, the TDX form fields to fill in, and who to escalate to if needed."*

**👉 Action:** Type a person's name like `"michelle beach"` → Show AD lookup result

> *"The AI automatically detects when you're searching for a person. It pulls their profile from Active Directory — name, title, department, account status — without the tech needing to open a separate AD console."*

---

## DEMO SECTION 3: Ticket Briefing — The Key Feature (3 minutes)

**👉 Action:** Click **"My Tickets"** in the sidebar

> *"This is what I'm most excited about. When a tech starts their shift, they see their active ticket queue. Let me click on one."*

**👉 Action:** Click on **"Computer replacement - Shelby Flint" (#859502)**

> *"Instead of reading through 11 comments in TDX to figure out what's going on, the AI reads the entire activity feed and generates a structured briefing."*

**👉 Action:** Point to each section:

> *"📍 **Current State** — tells the tech exactly where this ticket stands right now. Tamima prepared the device, Franck set it to 'Waiting for Customer Response', and the hold expires Monday."*

> *"🔧 **What You Need To Do Now** — the tech knows their next action without guessing. In this case: wait for Shelby to come pick up the laptop."*

> *"⚠️ **Escalation** — if something goes wrong, the tech knows exactly who to contact."*

> *"📋 **Closing Notes** — when the tech resolves the ticket, they know what to document."*

**👉 Action:** Scroll down to show the **Activity Feed Timeline**

> *"And they can still see the full conversation history — who said what, when, with status changes highlighted differently from comments."*

**👉 Action:** Click **"Ask AI About This"** button → Show the AI generating a detailed response

> *"If the tech needs more guidance, they click this button and the AI gets the full ticket context — ID, requestor, description, everything — and gives them a personalized action plan."*

---

## DEMO SECTION 4: Smart Triage (When AI is Offline) (1 minute)

> *"What happens if the AI engine is busy or offline? The system doesn't just show an error. It has a Smart Triage fallback."*

**👉 Action:** Point to a ticket showing the SMART TRIAGE badge (if AI was down) or explain:

> *"It automatically matches the ticket's service category against our 49-category FAQ library and shows the matched procedure, resolution steps, TDX form classification, and escalation contact. So even without the AI, the tech always has something actionable."*

---

## DEMO SECTION 5: Directory & Device Lookup (1 minute)

**👉 Action:** Click **"Directory"** → Search for a staff member

> *"Techs can search the campus directory without leaving the tool. Name, office, department, phone — it's all right here."*

**👉 Action:** (If time allows) Show the AD Management panel

> *"WAG technicians have additional tools — they can unlock accounts, check lockout status, and manage AD accounts directly from this interface, with every action logged for audit."*

---

## DEMO SECTION 6: AI Wayfinding (2 minutes)

**👉 Action:** Click **"Directory"** → Search for `st269`

> *"The AI is more than just a digital assistant; it's a physical guide. If a student walks in asking for a room, the tech just types the room code in the Directory search. The system instantly detects it's a location and offers to generate a route."*

**👉 Action:** Click **"🗺️ Generate Step-by-Step AI Map"**

> *"The tool calculates the path from our current location to the target. Notice the sidebar — we can plan routes manually or browse every floor plan PDF on campus."*

**👉 Action:** Click **"Next Step"** through the route

> *"As the tech guides the user, the interface automatically switches to the correct floor plan PDF for the current navigation phase. It handles elevations, skyways, and tunnels, even rendering a 3D elevation map so you know exactly which floor you're on."*

---

## DEMO SECTION 7: Knowledge Base & FAQ (1 minute)

**👉 Action:** Click **"TDX Form Guide"** → Show the FAQ library

> *"The system has a built-in knowledge base covering all 49 TDX service categories. Each entry has the exact form fields, resolution steps, and escalation paths."*

**👉 Action:** Search chat for `"need access to p drive"`

> *"The AI is trained on our specific procedures. It knows that for P drive access, there is a specific TDX form and it provides the link directly to the staff member so they can help the user instantly."*

> *"And the AI can learn. Staff can drag-and-drop documentation files into the chat and the AI absorbs them into its local knowledge base. No cloud upload. Everything stays on campus."*

---

## DEMO SECTION 8: Security & Architecture (1 minute)

> *"I want to emphasize the security posture:"*

> *"**Zero cloud dependency** — The AI model runs locally via Ollama. No student data, no staff data, no ticket content ever leaves the campus network."*

> *"**Active Directory authentication** — Staff use their existing StarID. No new passwords."*

> *"**Role-based access** — Help Desk, Tech, WAG, and SysAdmin each see only what they're authorized for."*

> *"**Every administrative action is logged** — account unlocks, policy syncs, device lookups — all in an audit trail."*

---

## CLOSING & ROADMAP (2 minutes)

> *"What you're seeing today is version 3.6. The system is functional and being used by TRC staff right now. Here's what's next:"*

> *"**Phase 4** — Connect to the real TDX API so tickets sync live instead of using cached data. Techs will be able to update tickets and post comments without leaving this interface."*

> *"**Phase 5** — Move the AI to a dedicated SMSU server with a larger model. Right now it runs on a workstation — on a server with GPU acceleration, response times drop to under a second."*

> *"### **4. Unified Institutional Search (Newcomer Focus)**
*   **Action**: Go to the **Admin Dashboard** → **Campus Directory Search**.
*   **Demo**: Type a keyword like "iPad" or "BA".
*   **Showcase**: Highlight how it instantly pulls from **TDX Users**, **TDX Assets**, and **TDX Locations** simultaneously. 
*   **Voiceover**: *"As a newcomer, you don't need to know which system holds the data. One search gives you the person, their equipment, and their location instantly."*

---

### **5. Security/Service Access Request**
*   **Action**: Ask the AI: *"How do I request system access?"*
*   **Showcase**: The AI provides the direct **Security/Service Access Form** link.
*   **Voiceover**: *"We've integrated specific institutional forms directly into the AI's knowledge base, ensuring staff are always one click away from the correct request pipeline."*

---

### **6. Closing & Strategic Roadmap**

> *"I'm happy to take any questions. I can also show any specific feature in more detail if you'd like to see it."*

**Common questions to prepare for:**

| Question | Answer |
|----------|--------|
| *"What does this cost?"* | Zero recurring cost. Built entirely on open-source technologies — Python, FastAPI, Ollama, SQLite. No licensing fees. |
| *"Is student data safe?"* | Yes. The AI runs 100% locally. No data is sent to Google, OpenAI, or any external service. Everything stays on campus infrastructure. |
| *"How long did this take?"* | Development started in April 2026. Core platform was functional within 3 weeks, with ongoing refinements. |
| *"Can other departments use this?"* | The architecture is modular. It could be adapted for any department that uses TDX and Active Directory. |
| *"What if you leave?"* | The codebase is documented, version-controlled on GitHub, and designed to be maintainable. Any Python developer could continue development. |
| *"Does it replace staff?"* | No. It makes existing staff faster and more effective. A new Help Desk worker becomes productive on day one instead of week three. |

---

## Emergency Fallbacks
- **If the AI is slow**: Use the PING command to show responsiveness, explain that a server migration (Phase 5) will fix latency.
- **If login fails**: Use the Emergency WAG Bypass (`trc2026`) to get in and explain that AD authentication is the production path.
- **If a feature errors**: Show the Smart Triage fallback — it demonstrates resilience.

---

*Good luck, Shadman! You built something impressive. Own it.* 🐴
