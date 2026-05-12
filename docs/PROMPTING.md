# 🎙️ AI Prompting Guide

The TRC AI Assistant is designed to understand natural language. You can interact with it via the **Chat View** or the **✨ AI Command Bar**.

## 🏇 Best Practices
- **Be Specific**: Instead of "check a user", say "Who is vg6340ah?".
- **Use Identifiers**: Always provide StarIDs, Computer Names (e.g., PC-123), or MAC addresses for technical lookups.
- **Context Matters**: If you are troubleshooting a ticket, mention the ticket ID or describe the error message.

---

## 🔍 Search & Lookup Intents

### 👤 User & StarID Lookups
The AI automatically detects StarIDs and user names.
- `Find user shadman` -> Searches AD for "shadman".
- `Who is vg6340ah?` -> Pulls profile from Active Directory.
- `Who is Nicole Quaas?` -> Resolves their department, designation, and room instantly.
- `Deep search vg6340ah` -> **(Admin/Tech only)** Scrapes the MinnState StarID Portal for real-time details (TechID, Barcodes, Affiliations).

### 💻 Device & SCCM Lookups
Find hardware info, OS versions, and last logon details.
- `Check SCCM for PC-TRC-01`
- `Find computer smsu-12345`
- `Where is the last logon for PC-55?`
- `08-8F-C3-06-FD-F9 search this device` -> **(Conversational Routing)** The AI automatically extracts the MAC address out of loose sentences, redirects your tab, and executes our high-performance two-step lookup pipeline!

### 🌐 Network, IPs, & WiFi (Mist)
- `Check Mist status for 00:11:22:33:44:55`
- `Wifi status of vg6340ah's phone`
- `Is 10.5.40.18 a campus IP?` -> **(Instant Subnet Analysis)** The AI analyzes private/public subnets instantly (recognizing internal workstations and administrative networks).
- `What is the procedure for activating a network port in SC 219?` -> **(Port Patching Guide)** The AI provides official ITS Network patching steps.
- `Who is in office SC 219?` -> **(Room/Office Directory)** The AI connects rooms to directory listings in real-time.


---

## ⚙️ Management Commands (Tech/Admin Only)

### 🖥️ Remote Desktop Actions
You can trigger remote actions on computers found in SCCM.
- `Sync policy for PC-123` -> Triggers Machine Policy refresh.
- `Scan updates on PC-123` -> Forces a Windows Update scan.
- `Evaluate updates for PC-123` -> Checks compliance for deployed updates.

---

## 🗺️ Wayfinding & Campus Help
- `Where is BA 123?`
- `How do I get to the Library from BA?`
- `Find a map of the Science building.`

---

## 📖 Knowledge Base (FAQ)
- `How do I set up eduroam?`
- `Password reset instructions for StarID.`
- `What is the phone number for the Help Desk?`
