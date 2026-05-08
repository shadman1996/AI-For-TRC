const FAQ_DATA = [
  {
    id: 1, service: "Printing Support", count: 982, category: "Printing",
    keywords: ["print","printer","printing","offline","paper","jam","toner","papercut","marco","queue","stuck"],
    info: ["Requestor name and StarID","Room/building where printer is located","Printer name or ID (on label)","Error message shown","Is it one person or everyone affected?"],
    steps: ["Check PaperCut admin for printer status","Verify printer is online in PaperCut","Check for paper jams or toner issues","Restart print spooler if needed","If Marco device, submit Marco service request"],
    form: { Classification:"Service Request", Service:"Printing Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"[Printer Issue] - [Location]" },
    escalate: "Jason Harvey — if hardware replacement needed; Marco portal for device issues",
    links: ["http://papercut.smsu.edu:9191/admin","https://ei.marconet.com/Gateway/Login"]
  },
  {
    id: 2, service: "General Technical Support", count: 585, category: "General",
    keywords: ["help","broken","not working","issue","problem","slow","crash","error","computer","laptop","desktop","monitor","keyboard","mouse","cable","screen"],
    info: ["Requestor name and StarID","Device type and location","Error message or screenshot","When did it start?","Has anything changed recently?"],
    steps: ["Remote into device via SCCM if needed","Check device in JAMF (Mac) or SCCM (Windows)","Run basic diagnostics","Document steps taken","Escalate if hardware failure"],
    form: { Classification:"Incident", Service:"General Technical Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"[Device Issue] - [Requestor] - [Location]" },
    escalate: "TRC team — most general issues handled internally",
    links: ["https://remoteconnect.smsu.edu","https://sccmpss.smsu.edu/helpdesk"]
  },
  {
    id: 3, service: "Multi-Factor Authentication (MFA) Reset", count: 523, category: "Accounts",
    keywords: ["mfa","multi factor","authenticator","two factor","2fa","authentication","phone","code","microsoft authenticator","reset mfa","new phone","lost phone"],
    info: ["Requestor full name and StarID","Employee or student?","Verify identity (ask security question or check ID)","New phone or lost phone?"],
    steps: ["Verify identity before ANY reset","Go to Azure AD / MFA admin portal","Remove existing MFA methods","Guide user to re-enroll MFA on new device","Confirm access restored"],
    form: { Classification:"Service Request", Service:"Multi-Factor Authentication (MFA) Reset", Urgency:"High", RespGroup:"IT - Technology Resource Center (TRC)", Title:"MFA Reset - [Requestor Name]" },
    escalate: "Jason Kingstrom — primary owner of MFA resets",
    links: ["https://starid.minnstate.edu/admin/"]
  },
  {
    id: 4, service: "Microsoft 365 (Office) Support", count: 484, category: "Software",
    keywords: ["office","microsoft 365","word","excel","powerpoint","outlook","teams","onedrive","sharepoint","m365","license","activation","install office"],
    info: ["Requestor name and StarID","Which Office app has the issue?","Error message","Device type (Windows/Mac)","Is Office installed or browser-based?"],
    steps: ["Verify M365 license in admin center","Check if user needs A5 license","Guide through sign-in or reinstall if needed","For activation issues check license assignment"],
    form: { Classification:"Incident", Service:"Microsoft 365 (Office) Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"M365 Issue - [App] - [Requestor]" },
    escalate: "TRC handles most M365 issues",
    links: ["https://hub.selfservice.systems.state.mn.us/"]
  },
  {
    id: 5, service: "Campus Network", count: 302, category: "Network",
    keywords: ["wifi","wireless","network","internet","connection","ethernet","wired","no internet","can't connect","slow internet","vlan","ip","network access"],
    info: ["Requestor name","Location/room","Device type","Wired or wireless?","Error message or IP address","Is it one device or all devices?"],
    steps: ["Check Mist dashboard for AP status","Check ISE for device registration","Verify VLAN assignment using VLAN-IP spreadsheet","Check physical cable/port if wired","Restart AP if needed from Mist"],
    form: { Classification:"Incident", Service:"Campus Network", Urgency:"High", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Network Issue - [Location] - [Wired/Wireless]" },
    escalate: "Kelly Schuerman — network infrastructure issues",
    links: ["https://manage.mist.com/","https://ise01.smsu.edu/admin/login.jsp"]
  },
  {
    id: 6, service: "Classroom Technical Support", count: 282, category: "Classroom",
    keywords: ["classroom","projector","display","screen","hdmi","audio","sound","podium","smartboard","airtame","av","presentation","room","lecture"],
    info: ["Room number and building","What equipment isn't working?","Is class in session?","Error on screen?","Has it worked before?"],
    steps: ["Check AV equipment power","Test HDMI/cable connections","Check Airtame connection if wireless display","Reboot podium computer if needed","Contact Cory if full AV failure"],
    form: { Classification:"Incident", Service:"Classroom Technical Support", Urgency:"High", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Classroom AV Issue - [Room]" },
    escalate: "Cory Klumper — classroom technical support owner; Soren Rothstein for Airtame",
    links: []
  },
  {
    id: 7, service: "Disabled/Locked Account Request", count: 168, category: "Accounts",
    keywords: ["locked","disabled","account locked","can't login","locked out","account disabled","password expired","login failed","unlock","starid","password assistance","reset password","change password"],
    info: ["Requestor full name and StarID","Employee or student?","When did it lock?","Number of failed attempts?","Has password expired?"],
    steps: ["Look up account in StarID Admin","Check AD for lockout reason","Unlock account in AD if locked","Reset password if expired","Verify user can log in after unlock"],
    form: { Classification:"Service Request", Service:"Disabled/Locked Account Request", Urgency:"High", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Account Locked - [Requestor Name] - [StarID]" },
    escalate: "TRC handles — escalate to Jason Harvey if AD issue",
    links: ["https://starid.minnstate.edu/admin/","https://remoteconnect.smsu.edu"]
  },
  {
    id: 8, service: "D2L Brightspace Support", count: 229, category: "Learning",
    keywords: ["d2l","brightspace","course","class","online","learning","lms","quiz","grade","content","enroll","student access","d2l not working"],
    info: ["Requestor name and StarID","Course name and number","What specifically isn't working?","Student or instructor?","Error message?"],
    steps: ["Check MinnState D2L support KB","Verify user enrollment in course","Check D2L Brightspace status page","Submit to MinnState ServiceDesk if system-wide"],
    form: { Classification:"Incident", Service:"Learning Management System (D2L Brightspace) Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"D2L Issue - [Course] - [Requestor]" },
    escalate: "Ben Nwachukwu — D2L support owner",
    links: ["https://servicedesk.minnstate.edu/TDClient/30/Portal/KB/?CategoryID=14","https://status.learn.minnstate.edu/"]
  },
  {
    id: 9, service: "Information Security Incident Report", count: 222, category: "Security",
    keywords: ["phishing","hack","virus","malware","ransomware","suspicious email","security","breach","scam","password stolen","suspicious","infected","spam"],
    info: ["Who reported it?","What happened exactly?","Device involved?","Email forwarded?","Time of incident?","Did user click any links?"],
    steps: ["Isolate device from network if malware suspected","Document all details immediately","Forward suspicious email as attachment","Escalate to IT Security team immediately","File formal incident report in TDX"],
    form: { Classification:"Incident", Service:"Information Security Incident Report", Urgency:"Critical", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Security Incident - [Type] - [Date]" },
    escalate: "IT-Security team — IMMEDIATELY for any breach/malware",
    links: []
  },
  {
    id: 10, service: "Employee Onboarding", count: 71, category: "HR/Access",
    keywords: ["new employee","onboard","onboarding","new hire","new staff","new faculty","setup account","create account","new user","wag account"],
    info: ["Full legal name","Start date","Department","Position title","Supervisor name","Email needed?","Office location","Equipment needed?"],
    steps: ["Set up AD account","Create WAG account (ONLY if TRC/ITS worker)","Assign M365 A5 license","Add to Teams and relevant groups","Set up JAMF if Mac user","Set up MFA","Provide StarID to user","Create TDX onboarding ticket checklist"],
    form: { Classification:"Service Request", Service:"Employee Onboarding", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Employee Onboarding - [Name] - [Start Date]" },
    escalate: "TRC handles full onboarding workflow",
    links: ["https://starid.minnstate.edu/admin/","https://smsu.jamfcloud.com/"]
  },
  {
    id: 11, service: "Employee Offboarding", count: 43, category: "HR/Access",
    keywords: ["offboard","offboarding","leaving","resignation","termination","last day","departing","employee leaving","remove access"],
    info: ["Employee full name and StarID","Last working day","Department","Equipment to return?","Shared mailbox/drive access to transfer?"],
    steps: ["Disable AD account on last day","Remove M365 license","Remove from all groups","Collect equipment","Transfer shared mailbox if needed","Document in TDX"],
    form: { Classification:"Service Request", Service:"Employee Offboarding", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Employee Offboarding - [Name] - [Last Day]" },
    escalate: "TRC handles; coordinate with HR",
    links: []
  },
  {
    id: 12, service: "Software Installation Request", count: 41, category: "Software",
    keywords: ["install","software","application","app","program","download","spss","adobe","autocad","software request","install on computer"],
    info: ["Requestor name and StarID","Software name and version","Device name/location","Is it university-owned?","Business justification?","License available?"],
    steps: ["Verify software is approved/licensed","Check if available in Software Center (SCCM)","Deploy via SCCM if available","Manual install if not in SCCM","Document in TDX"],
    form: { Classification:"Service Request", Service:"Software Installation Request for University-owned devices", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Software Install - [Software Name] - [Device]" },
    escalate: "TRC handles standard installs",
    links: ["https://remoteconnect.smsu.edu"]
  },
  {
    id: 13, service: "Shared Drive Access and Support", count: 140, category: "Access",
    keywords: ["shared drive","network drive","shared folder","mapped drive","drive access","can't access drive","itsfs","sccmpss","network share","file share"],
    info: ["Requestor name and StarID","Which shared drive/folder?","What access is needed (read/write)?","Supervisor approval?","Department?"],
    steps: ["Verify requestor's identity and role","Get supervisor approval if needed","Add user to appropriate AD group","Map drive for user","Test access"],
    form: { Classification:"Service Request", Service:"Shared Drive Access and Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Shared Drive Access - [Drive Name] - [Requestor]" },
    escalate: "Jason Harvey — shared drive permissions",
    links: ["https://remoteconnect.smsu.edu"]
  },
  {
    id: 14, service: "BitLocker Recovery", count: 24, category: "Security",
    keywords: ["bitlocker","encryption","recovery key","locked drive","bitlocker key","encrypted","can't boot","blue screen bitlocker"],
    info: ["Device name/serial number","User's name and StarID","Location of device","Is device booting to BitLocker screen?"],
    steps: ["Look up BitLocker recovery key in SCCM/Bitlocker portal","Provide recovery key to user","Verify device boots successfully","Document in TDX"],
    form: { Classification:"Incident", Service:"BitLocker Recovery", Urgency:"High", RespGroup:"IT - Technology Resource Center (TRC)", Title:"BitLocker Recovery - [Device] - [Location]" },
    escalate: "TRC handles — SCCM admin access needed",
    links: ["https://sccmpss.smsu.edu/helpdesk"]
  },
  {
    id: 15, service: "Zoom Support", count: 48, category: "Conferencing",
    keywords: ["zoom","meeting","video call","conference","zoom not working","camera","microphone","zoom phone","webinar","virtual meeting"],
    info: ["Requestor name and StarID","Zoom issue type (app/phone/room)","Error message?","Device type?","Is it one user or all?"],
    steps: ["Check Zoom account status","Verify Zoom license assigned","Test audio/video settings","Check for app updates","For Zoom phone — check Scott Haken"],
    form: { Classification:"Incident", Service:"Zoom", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Zoom Issue - [Type] - [Requestor]" },
    escalate: "Ben Nwachukwu — Zoom; Scott Haken — Zoom Phone System",
    links: []
  },
  {
    id: 16, service: "Shared Mailbox Request", count: 37, category: "Email",
    keywords: ["shared mailbox","shared email","group email","club email","department email","new mailbox","create mailbox","shared inbox"],
    info: ["Mailbox name requested","Purpose/department","Who needs access?","Supervisor or department head approval?"],
    steps: ["Get approval from supervisor","Create shared mailbox in M365 admin","Add members with appropriate permissions","Test access","Document in TDX"],
    form: { Classification:"Service Request", Service:"Shared Mailbox Request", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Shared Mailbox Request - [Mailbox Name]" },
    escalate: "Tim Beske — shared mailbox owner",
    links: []
  },
  {
    id: 17, service: "Event Credential Request", count: 37, category: "Network",
    keywords: ["event wifi","guest wifi","temp wifi","temporary wifi","visitor wifi","conference wifi","event access","vendor wifi","guest network"],
    info: ["Event name and date","Location/room","Number of devices/people?","Contact person for event","Duration needed"],
    steps: ["Create event credentials in ISE","Set duration/expiry for credentials","Provide credentials to event organizer","Test connectivity","Remove after event"],
    form: { Classification:"Service Request", Service:"Event Credential Request", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Event WiFi - [Event Name] - [Date]" },
    escalate: "Kelly Schuerman — event credentials",
    links: ["https://ise01.smsu.edu/admin/login.jsp"]
  },
  {
    id: 18, service: "VPN Request", count: 17, category: "Network",
    keywords: ["vpn","remote access","cisco anyconnect","remote desktop","work from home","off campus access","vpn access","rdp"],
    info: ["Requestor name and StarID","Business justification for VPN","Department","Supervisor approval?","Device type?"],
    steps: ["Verify business need for VPN","Get supervisor approval","Add user to VPN AD group","Install Cisco AnyConnect if needed","Test VPN connection"],
    form: { Classification:"Service Request", Service:"Virtual Private Network (VPN)", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"VPN Access Request - [Requestor]" },
    escalate: "Kelly Schuerman — VPN access",
    links: []
  },
  {
    id: 19, service: "Name Change", count: 12, category: "Accounts",
    keywords: ["name change","legal name","new name","update name","email change","name update","preferred name","last name change"],
    info: ["Current full name and StarID","New legal name","Legal documentation?","Department","New email address needed?"],
    steps: ["Verify legal name change documentation","Update name in AD","Update email/display name in M365","Update in StarID system","Notify relevant departments"],
    form: { Classification:"Service Request", Service:"Name Change", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Name Change - [Old Name] to [New Name]" },
    escalate: "TRC handles — coordinate with HR and Registrar",
    links: ["https://starid.minnstate.edu/admin/"]
  },
  {
    id: 20, service: "D2L Course Combine", count: 16, category: "Learning",
    keywords: ["combine course","merge course","d2l combine","course merge","cross list","section combine","d2l sections"],
    info: ["Instructor name and StarID","Course codes to combine","Which section should be primary?","Semester?","Are there existing students in either section?"],
    steps: ["Verify instructor request","Identify primary course shell","Submit combine request to D2L admin","Confirm students see combined course","Notify instructor when complete"],
    form: { Classification:"Service Request", Service:"D2L Course Combine", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"D2L Course Combine - [Course Code] - [Semester]" },
    escalate: "Ben Nwachukwu — D2L course combines",
    links: []
  },
  {
    id: 21, service: "Temporary Login Request", count: 15, category: "Accounts",
    keywords: ["temp login","temporary account","guest account","temp credentials","event login","temp access","visitor account"],
    info: ["Event or purpose name","Date and duration needed","Number of accounts?","Location/room?","Requestor/supervisor?"],
    steps: ["Create temporary AD accounts","Set expiry date","Document credentials securely","Provide to event organizer","Ensure accounts disabled after event"],
    form: { Classification:"Service Request", Service:"Temporary Login Request", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Temp Login - [Event] - [Date]" },
    escalate: "Tim Beske — temporary login requests",
    links: []
  },
  {
    id: 22, service: "Airtame Support", count: 11, category: "Classroom",
    keywords: ["airtame","wireless display","screen mirror","cast","airplay","presentation wireless","display not working","airtame offline"],
    info: ["Room/location","Airtame device ID if visible","What's showing on screen?","Is it showing as offline?","Has it worked before?"],
    steps: ["Check Airtame dashboard for device status","Reboot Airtame device","Check network connectivity","Update Airtame firmware if needed","Contact Soren for hardware replacement"],
    form: { Classification:"Incident", Service:"Airtame", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Airtame Issue - [Room]" },
    escalate: "Soren Rothstein — Airtame support",
    links: []
  },
  {
    id: 23, service: "Perceptive Content / ImageNow", count: 4, category: "Software",
    keywords: ["perceptive","imagenow","ecm","imaging","document management","perceptive content","imagenow login"],
    info: ["Requestor name and StarID","Type of access needed?","Error message?","Department?"],
    steps: ["Check user access in Perceptive Content","Verify VPN if accessing remotely","Contact Soren for access provisioning","Test login after fix"],
    form: { Classification:"Service Request", Service:"Perceptive Content/ImageNow Request", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Perceptive Content Issue - [Requestor]" },
    escalate: "Soren Rothstein — Perceptive Content",
    links: ["https://ecm.mnsu.edu/experience/#login"]
  },
  {
    id: 24, service: "Equipment Checkout", count: 39, category: "Equipment",
    keywords: ["checkout","borrow","laptop checkout","equipment loan","loaner","borrow laptop","check out laptop","alc laptop"],
    info: ["Requestor name and StarID","Equipment needed","Duration of checkout","Purpose/event","Return date"],
    steps: ["Check equipment availability in asset management","Record checkout in TDX","Label equipment with borrower info","Note any existing damage","Set return reminder"],
    form: { Classification:"Service Request", Service:"Request IT Equipment for Check Out", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Equipment Checkout - [Item] - [Requestor]" },
    escalate: "TRC handles all equipment checkouts",
    links: []
  },
  {
    id: 25, service: "Jamf / Mac Support", count: 0, category: "Device Management",
    keywords: ["mac","macbook","apple","jamf","ios","ipad","macos","mac not working","jamf enrollment","mac setup"],
    info: ["Mac user name","Device tag/serial","Specific issue","Is it enrolled in Jamf?"],
    steps: ["Verify Jamf enrollment","Check policies in Jamf Pro","Re-enroll if necessary","Push required software","Troubleshoot macOS issue locally"],
    form: { Classification:"Incident", Service:"Jamf / Mac Support", Urgency:"Medium", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Mac/Jamf Issue - [User]" },
    escalate: "Escalate to Mac admin if Jamf policy issue",
    links: ["https://smsu.jamfcloud.com/"]
  },
  {
    id: 26, service: "Mobile Email Setup / Sync", count: 125, category: "Email",
    keywords: ["phone","email","mail","sync","iphone","android","mobile","outlook app","apple mail","not getting mail","can't get email"],
    info: ["Device type (iPhone or Android)?","Using Outlook app or native mail app?","Are they getting an MFA prompt?","Has their StarID password recently changed?"],
    steps: ["Remove existing SMSU email account from the phone","Ensure they know their StarID password","Download the official Microsoft Outlook app (recommended)","Sign in with StarID@minnstate.edu and password","Approve the MFA prompt","Verify email begins syncing"],
    form: { Classification:"Incident", Service:"Microsoft 365 (Office) Support", Urgency:"Low", RespGroup:"IT - Technology Resource Center (TRC)", Title:"Mobile Email Sync - [User]" },
    escalate: null,
    links: ["https://mysignins.microsoft.com/security-info"]
  }
];

const QUICK_LINKS = [
  { name:"Staff Directory", url:"https://www.smsu.edu/directory/index.html", icon:"📖", category:"Identity" },
  { name:"IT Tickets (TDX)", url:"https://services.smsu.edu/TDNext", icon:"🎫", category:"Ticketing" },
  { name:"TDX Work Management", url:"https://services.smsu.edu/TDWorkManagement/", icon:"📊", category:"Ticketing" },
  { name:"StarID Admin", url:"https://starid.minnstate.edu/admin/", icon:"🔐", category:"Identity" },
  { name:"MinnState ServiceDesk", url:"https://servicedesk.minnstate.edu/", icon:"🖥️", category:"Ticketing" },
  { name:"PaperCut Admin", url:"http://papercut.smsu.edu:9191/admin", icon:"🖨️", category:"Printing" },
  { name:"PaperCut User", url:"http://papercut.smsu.edu:9191/user", icon:"🖨️", category:"Printing" },
  { name:"Marco Service", url:"https://ei.marconet.com/Gateway/Login?ReturnUrl=%2f", icon:"🖨️", category:"Printing" },
  { name:"Jamf Pro", url:"https://smsu.jamfcloud.com/", icon:"🍎", category:"Device Mgmt" },
  { name:"Mist (WiFi)", url:"https://manage.mist.com/", icon:"📡", category:"Network" },
  { name:"ISE (Network Access)", url:"https://ise01.smsu.edu/admin/login.jsp", icon:"🌐", category:"Network" },
  { name:"SCCM / BitLocker", url:"https://sccmpss.smsu.edu/helpdesk", icon:"🔑", category:"Device Mgmt" },
  { name:"Remote Connect", url:"https://remoteconnect.smsu.edu", icon:"💻", category:"Device Mgmt" },
  { name:"D2L Support KB", url:"https://servicedesk.minnstate.edu/TDClient/30/Portal/KB/?CategoryID=14", icon:"📚", category:"Learning" },
  { name:"D2L Status", url:"https://status.learn.minnstate.edu/", icon:"📊", category:"Learning" },
  { name:"ALMA Library", url:"https://mnpals-smsu.alma.exlibrisgroup.com/SAML", icon:"📖", category:"Library" },
  { name:"Perceptive Content", url:"https://ecm.mnsu.edu/experience/#login", icon:"📄", category:"Software" },
  { name:"MoveIt Securely", url:"https://securefileshare.minnstate.edu/", icon:"📁", category:"File Sharing" },
  { name:"MinnState Employee Hub", url:"https://hub.selfservice.systems.state.mn.us/", icon:"👤", category:"Identity" },
  { name:"Knowledge Base", url:"https://services.smsu.edu/TDClient/180/Portal/KB/?CategoryID=789", icon:"📚", category:"Ticketing" },
  { name:"TRC Network Drive", url:"file://itsfs/TRC", icon:"📂", category:"File Sharing" }
];

const TDX_FORM_FIELDS = [
  { field:"Classification", required:true, description:"Is this a break/fix (Incident) or a new request (Service Request)?", tip:"Use 'Incident' for things that are broken or not working. Use 'Service Request' for new access, installs, or setups." },
  { field:"Service", required:true, description:"The specific IT service category this ticket belongs to.", tip:"Start typing keywords and select from the dropdown. This routes the ticket to the right team." },
  { field:"Type", required:false, description:"Always defaults to 'Information Technology / Default ticket type for all IT services/offerings'.", tip:"Leave as default unless instructed otherwise." },
  { field:"Requestor", required:true, description:"The person who is experiencing the issue or making the request.", tip:"Search by name or StarID. The requestor is NOT always the person submitting the ticket." },
  { field:"Notify Requestor", required:false, description:"Check this to auto-email the requestor when the ticket is updated.", tip:"Usually keep checked so the requestor knows their ticket is being worked on." },
  { field:"Acct/Dept", required:false, description:"The department or account the requestor belongs to.", tip:"This helps route tickets and track which departments have the most issues." },
  { field:"Ticket Title", required:true, description:"A clear, short summary of the issue.", tip:"Format: [Issue Type] - [Requestor Name or Location]. Example: 'MFA Reset - John Smith' or 'Printer Offline - BA 201'" },
  { field:"Description", required:true, description:"Full details of the issue including what happened, when, and steps already tried.", tip:"Be thorough — include error messages, device info, and what the user already tried. Future techs will read this." },
  { field:"Attachment", required:false, description:"Screenshots, error photos, or relevant files.", tip:"Always attach screenshots of error messages — it speeds up resolution significantly." },
  { field:"Knowledge Base Article", required:false, description:"Link to a relevant KB article that helps resolve this issue.", tip:"Search the KB and attach the article if one matches. Helps document resolution steps." },
  { field:"Urgency", required:false, description:"How urgent is this issue to the requestor?", tip:"High = class/work completely blocked. Medium = workaround exists. Low = minor inconvenience." },
  { field:"Priority", required:false, description:"Calculated from Urgency + Impact. Defaults to Medium.", tip:"Don't override unless supervisor directs." },
  { field:"Responsible Group", required:true, description:"Which IT group handles this ticket.", tip:"Default is 'IT - Technology Resource Center (TRC)'. Change only if escalating to Security, D2L team, etc." },
  { field:"Source", required:false, description:"How did the ticket come in? (Phone, email, walk-in, portal?)", tip:"Track this — it helps ITS understand how people contact support." },
  { field:"Status", required:true, description:"Current state of the ticket.", tip:"New → In Process → Resolved → Closed. Always update status as you work the ticket." },
  { field:"Location", required:false, description:"Physical location where the issue is occurring.", tip:"Always add for hardware/classroom/printer issues. Room number + building." },
  { field:"Asset/CI", required:false, description:"The specific device or asset involved.", tip:"Search by device name or serial number. Link the asset so inventory stays accurate." }
];


const DIRECTORY_DATA = 
{
"faculty": [
                                                                                                                                                                                                            {
                    "prefix": "Dr.",
                    "firstName": "Cindy",
                    "lastName" : "Aamlid",
                    "fullName" : "Cindy Aamlid",
                    "departments" : ["Sociology Program", "Social Science Department"],
                    "title" : "Professor of Sociology",
                    "phone" : "(507) 537-7284",
                    "email" : "cindy.aamlid@smsu.edu",
                    "office" : "CH 216",
                                            "link" : "profiles/cindy-aamlid.html",
                    "headshot" : "_images/cindy-aamlid.jpg",
                    "folderOrder" : 6429591
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Vickie",
                    "lastName" : "Abel",
                    "fullName" : "Vickie Abel",
                    "departments" : ["Accessibility Services", "Deeann Griebel Student Success Center"],
                    "title" : "Coordinator of Accessibility Services",
                    "phone" : "(507) 537-6492",
                    "email" : "vickie.abel@smsu.edu",
                    "office" : "IL 220",
                                            "link" : "profiles/vickie-abel.html",
                    "headshot" : "_images/vickie-abel.jpg",
                    "folderOrder" : 12859182
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Yemi",
                    "lastName" : "Adelakun",
                    "fullName" : "Yemi Adelakun",
                    "departments" : ["Information Technology Services"],
                    "title" : "Operations Specialist - ITS2",
                    "phone" : "(507) 537-7297",
                    "email" : "yemi.adelakun@smsu.edu",
                    "office" : "BA 177",
                                            "link" : "profiles/yemi-adelakun.html",
                    "headshot" : "",
                    "folderOrder" : 19288773
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jorun",
                    "lastName" : "Johnson",
                    "fullName" : "Jorun Johnson",
                    "departments" : ["Mustang Zone", "Mustang Card"],
                    "title" : "Office & Administrative Specialist, Principal",
                    "phone" : "(507) 537-6573",
                    "email" : "jorun.johnson@smsu.edu",
                    "office" : "FH 121",
                                            "link" : "profiles/jorun-johnson.html",
                    "headshot" : "_images/jorun-ahmann.jpg",
                    "folderOrder" : 25718364
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Ellie",
                    "lastName" : "Ahmann",
                    "fullName" : "Ellie Ahmann",
                    "departments" : ["College Now"],
                    "title" : "Assistant Director of College Now and PSEO",
                    "phone" : "(507) 537-6138",
                    "email" : "ellie.ahmann@smsu.edu",
                    "office" : "BA 266",
                                            "link" : "profiles/ellie-ahmann.html",
                    "headshot" : "",
                    "folderOrder" : 32147955
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Frankie",
                    "lastName" : "Albitz",
                    "fullName" : "Frankie Albitz",
                    "departments" : ["Education Program", "Physical Education Program", "School of Education"],
                    "title" : "Professor of Physical Education",
                    "phone" : "(507) 537-7690",
                    "email" : "frankie.albitz@smsu.edu",
                    "office" : "PE 233",
                                            "link" : "profiles/frankie-albitz.html",
                    "headshot" : "_images/frankie-albitz.jpg",
                    "folderOrder" : 38577546
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Michael",
                    "lastName" : "Albright",
                    "fullName" : "Michael Albright",
                    "departments" : ["Writing Center", "English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Associate Professor of English",
                    "phone" : "(507) 537-6692",
                    "email" : "michael.albright@smsu.edu",
                    "office" : "BA 224",
                                            "link" : "profiles/michael-albright.html",
                    "headshot" : "_images/michael-albright.jpg",
                    "folderOrder" : 45007137
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Charles",
                    "lastName" : "Alexander",
                    "fullName" : "Charles Alexander",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Football Coach",
                    "phone" : "(507) 537-7271",
                    "email" : "charles.alexander@smsu.edu",
                    "office" : "FH 306",
                                            "link" : "profiles/charles-alexander.html",
                    "headshot" : "_images/charles-alexander.jpg",
                    "folderOrder" : 51436728
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Adam",
                    "lastName" : "Alford",
                    "fullName" : "Adam Alford",
                    "departments" : ["School of Agriculture", "Agronomy Program", "Department of Agriculture, Culinology and Hospitality Management"],
                    "title" : "Associate Professor of Agronomy",
                    "phone" : "(507) 537-6082",
                    "email" : "adam.alford@smsu.edu",
                    "office" : "ST 155",
                                            "link" : "profiles/adam-alford.html",
                    "headshot" : "_images/adam-alford.jpg",
                    "folderOrder" : 57866319
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Marta",
                    "lastName" : "Almeyda",
                    "fullName" : "Marta Almeyda",
                    "departments" : ["North Star Mutual School of Business", "Center of Innovation and Entrepreneurship", "Department of Business Innovation & Strategy", "Marketing Program"],
                    "title" : "Professor of Marketing",
                    "phone" : "(507) 537-6458",
                    "email" : "marta.almeyda@smsu.edu",
                    "office" : "ST 203A",
                                            "link" : "profiles/marta-almeyda.html",
                    "headshot" : "_images/marta-almeyda.jpg",
                    "folderOrder" : 64295910
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Anthony",
                    "lastName" : "Amato",
                    "fullName" : "Anthony Amato",
                    "departments" : ["Social Science Department"],
                    "title" : "Professor of Social Science",
                    "phone" : "(507) 537-6117",
                    "email" : "anthony.amato@smsu.edu",
                    "office" : "CH 203",
                                            "link" : "profiles/anthony-amato.html",
                    "headshot" : "_images/anthony-amato.jpg",
                    "folderOrder" : 70725501
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Benjamin",
                    "lastName" : "Anderson",
                    "fullName" : "Benjamin Anderson",
                    "departments" : ["Psychology Program", "Social Science Department"],
                    "title" : "Professor of Psychology",
                    "phone" : "(507) 537-6475",
                    "email" : "benjamin.anderson1@smsu.edu",
                    "office" : "CH 127D",
                                            "link" : "profiles/benjamin-anderson1.html",
                    "headshot" : "_images/benjamin-anderson1.jpg",
                    "folderOrder" : 77155092
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Molli",
                    "lastName" : "Anderson",
                    "fullName" : "Molli Anderson",
                    "departments" : ["Registration and Records"],
                    "title" : "Transfer Specialist",
                    "phone" : "(507) 537-6128",
                    "email" : "molli.anderson@smsu.edu",
                    "office" : "IL 148",
                                            "link" : "profiles/molli-anderson.html",
                    "headshot" : "_images/molli-anderson.jpg",
                    "folderOrder" : 83584683
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Alyssa",
                    "lastName" : "Anderson",
                    "fullName" : "Alyssa Anderson",
                    "departments" : ["Department of Science", "Undergraduate Research", "Biology Program"],
                    "title" : "Associate Professor of Biology \/ Department Chair",
                    "phone" : "(507) 537-6443",
                    "email" : "alyssa.anderson@smsu.edu",
                    "office" : "SM 170",
                                            "link" : "profiles/alyssa-anderson.html",
                    "headshot" : "_images/alyssa-anderson.jpg",
                    "folderOrder" : 90014274
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Samantha",
                    "lastName" : "Antony",
                    "fullName" : "Samantha Antony",
                    "departments" : ["TRiO Upward Bound"],
                    "title" : "Academic Coordinator for Trio Upward Bound",
                    "phone" : "(507) 537-7518",
                    "email" : "samantha.antony@smsu.edu",
                    "office" : "BA 113",
                                            "link" : "profiles/samantha-antony.html",
                    "headshot" : "_images/samantha-antony.jpg",
                    "folderOrder" : 96443865
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Bridget",
                    "lastName" : "Arkell",
                    "fullName" : "Bridget Arkell",
                    "departments" : ["Financial Aid"],
                    "title" : "Assistant Director of Financial Aid",
                    "phone" : "(507) 537-7361",
                    "email" : "bridget.arkell@smsu.edu",
                    "office" : "IL 145",
                                            "link" : "profiles/bridget-arkell.html",
                    "headshot" : "",
                    "folderOrder" : 102873456
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Tetta",
                    "lastName" : "Askeland",
                    "fullName" : "Tetta Askeland",
                    "departments" : ["Entertainment and Theatre Arts Program", "Fine Arts and Communication, Department of"],
                    "title" : "Assistant Professor of Theatre",
                    "phone" : "(507) 537-6434",
                    "email" : "tetta.askeland@smsu.edu",
                    "office" : "FA 219",
                                            "link" : "profiles/tetta-askeland.html",
                    "headshot" : "_images/tetta-askeland.jpg",
                    "folderOrder" : 109303047
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Nan",
                    "lastName" : "Askeland",
                    "fullName" : "Nan Askeland",
                    "departments" : ["Social Work Program", "Social Science Department"],
                    "title" : "Director of Field Education",
                    "phone" : "(507) 537-6543",
                    "email" : "nancy.askeland@smsu.edu",
                    "office" : "CH 101C",
                                            "link" : "profiles/nancy-askeland.html",
                    "headshot" : "",
                    "folderOrder" : 115732638
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Dawn",
                    "lastName" : "Bahn",
                    "fullName" : "Dawn Bahn",
                    "departments" : ["History Program", "Social Science Department", "Psychology Program", "Justice Administration & Criminal Justice Program"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6224",
                    "email" : "dawn.bahn@smsu.edu",
                    "office" : "CH 129",
                                            "link" : "profiles/dawn-bahn.html",
                    "headshot" : "_images/dawn-bahn.jpg",
                    "folderOrder" : 122162229
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Lori",
                    "lastName" : "Baker",
                    "fullName" : "Lori Baker",
                    "departments" : ["Dean, College of Arts, Letters and Sciences"],
                    "title" : "Dean of the College of Arts, Letters, and Sciences",
                    "phone" : "(507) 537-6251",
                    "email" : "lori.baker@smsu.edu",
                    "office" : "BA 262",
                                            "link" : "profiles/lori-baker.html",
                    "headshot" : "",
                    "folderOrder" : 128591820
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "George",
                    "lastName" : "Bass",
                    "fullName" : "George Bass",
                    "departments" : ["Business Services"],
                    "title" : "Director of Business Services",
                    "phone" : "(507) 537-7470",
                    "email" : "george.bass@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/george-bass.html",
                    "headshot" : "_images/george-bass.jpg",
                    "folderOrder" : 135021411
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Becky",
                    "lastName" : "Bastian-Bock",
                    "fullName" : "Becky Bastian-Bock",
                    "departments" : ["Biology Program", "Department of Science"],
                    "title" : "College Lab Assistant 1 - Natural Science Option",
                    "phone" : "(507) 537-6598",
                    "email" : "becky.bock@smsu.edu",
                    "office" : "SM 136",
                                            "link" : "profiles/becky-bock.html",
                    "headshot" : "",
                    "folderOrder" : 141451002
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Dan",
                    "lastName" : "Baun",
                    "fullName" : "Dan Baun",
                    "departments" : ["Center of Learning and Teaching (COLT)", "Chief Information Officer", "Information Technology Services", "SHOT"],
                    "title" : "CIO",
                    "phone" : "(507) 537-6978",
                    "email" : "dan.baun@smsu.edu",
                    "office" : "BA 178",
                                            "link" : "profiles/dan-baun.html",
                    "headshot" : "_images/dan-baun.jpg",
                    "folderOrder" : 147880593
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Glenn",
                    "lastName" : "Bayerkohler",
                    "fullName" : "Glenn Bayerkohler",
                    "departments" : ["Accounting Program", "North Star Mutual School of Business", "Department of Business Innovation & Strategy"],
                    "title" : "Professor of Accounting",
                    "phone" : "(507) 537-7393",
                    "email" : "glenn.bayerkohler@smsu.edu",
                    "office" : "ST 105A",
                                            "link" : "profiles/glenn-bayerkohler.html",
                    "headshot" : "",
                    "folderOrder" : 154310184
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Toni",
                    "lastName" : "Beebout-Bladholm",
                    "fullName" : "Toni Beebout-Bladholm",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-6810",
                    "email" : "toni.beebout-bladholm@smsu.edu",
                    "office" : "IL 233",
                                            "link" : "profiles/toni-beebout-bladholm.html",
                    "headshot" : "_images/toni-beebout-bladholm.jpg",
                    "folderOrder" : 160739775
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Lori",
                    "lastName" : "Bell",
                    "fullName" : "Lori Bell",
                    "departments" : ["Registration and Records"],
                    "title" : "Customer Service Specialist Int",
                    "phone" : "(507) 537-6206",
                    "email" : "lori.bell@smsu.edu",
                    "office" : "IL 148",
                                            "link" : "profiles/lori-bell.html",
                    "headshot" : "_images/lori-bell.jpg",
                    "folderOrder" : 167169366
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Amanda",
                    "lastName" : "Bemer",
                    "fullName" : "Amanda Bemer",
                    "departments" : ["Department of English, Philosophy, Spanish and Humanities", "English Program"],
                    "title" : "Professor of English \/ Department Chair",
                    "phone" : "(507) 537-7159",
                    "email" : "amanda.bemer@smsu.edu",
                    "office" : "BA 206",
                                            "link" : "profiles/amanda-bemer.html",
                    "headshot" : "_images/amanda-bemer.jpg",
                    "folderOrder" : 173598957
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Grayson",
                    "lastName" : "Benedict",
                    "fullName" : "Grayson Benedict",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Trainer",
                    "phone" : "(507) 537-7459",
                    "email" : "grayson.benedict@smsu.edu",
                    "office" : "BA",
                                            "link" : "profiles/grayson-benedict.html",
                    "headshot" : "_images/grayson-benedict.jpg",
                    "folderOrder" : 180028548
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jacob",
                    "lastName" : "Benson",
                    "fullName" : "Jacob Benson",
                    "departments" : ["Admission"],
                    "title" : "Admission Counselor",
                    "phone" : "(507) 537-6909",
                    "email" : "jacob.benson.2@smsu.edu",
                    "office" : "SC 219",
                                            "link" : "profiles/jacob-benson-2.html",
                    "headshot" : "_images/jacob-benson-2.jpg",
                    "folderOrder" : 186458139
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jessica",
                    "lastName" : "Bentley",
                    "fullName" : "Jessica Bentley",
                    "departments" : ["Residence Life"],
                    "title" : "Director of Residence Life",
                    "phone" : "(507) 537-6136",
                    "email" : "jessica.bentley@smsu.edu",
                    "office" : "HC4 103",
                                            "link" : "profiles/jessica-bentley.html",
                    "headshot" : "",
                    "folderOrder" : 192887730
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Tim",
                    "lastName" : "Beske",
                    "fullName" : "Tim Beske",
                    "departments" : ["Information Technology Services"],
                    "title" : "Information Tech Specialist 3",
                    "phone" : "(507) 537-6967",
                    "email" : "tim.beske@smsu.edu",
                    "office" : "BA 182C",
                                            "link" : "profiles/tim-beske.html",
                    "headshot" : "",
                    "folderOrder" : 199317321
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Bradley",
                    "lastName" : "Besse",
                    "fullName" : "Bradley Besse",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "brad.besse@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/brad-besse.html",
                    "headshot" : "_images/brad-besse.jpg",
                    "folderOrder" : 205746912
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Donald",
                    "lastName" : "Bethune",
                    "fullName" : "Donald Bethune",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Building Services Supervisor",
                    "phone" : "(507) 537-7279",
                    "email" : "don.bethune@smsu.edu",
                    "office" : "ST 152",
                                            "link" : "profiles/don-bethune.html",
                    "headshot" : "",
                    "folderOrder" : 212176503
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Morgan",
                    "lastName" : "Betker",
                    "fullName" : "Morgan Betker",
                    "departments" : ["Exercise Science Program", "Department of Science"],
                    "title" : "Associate Professor of Exercise Science",
                    "phone" : "(507) 537-6178",
                    "email" : "morgan.betker@smsu.edu",
                    "office" : "SM 178",
                                            "link" : "profiles/morgan-betker.html",
                    "headshot" : "_images/morgan-betker.jpg",
                    "folderOrder" : 218606094
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Noelle",
                    "lastName" : "Beyer",
                    "fullName" : "Noelle Beyer",
                    "departments" : ["Chemistry Program", "Department of Science"],
                    "title" : "Associate Professor of Chemistry",
                    "phone" : "(507) 537-6144",
                    "email" : "noelle.beyer@smsu.edu",
                    "office" : "SM 244",
                                            "link" : "profiles/noelle-beyer.html",
                    "headshot" : "",
                    "folderOrder" : 225035685
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brenda",
                    "lastName" : "Bierschenk",
                    "fullName" : "Brenda Bierschenk",
                    "departments" : ["Business Services"],
                    "title" : "Cashier",
                    "phone" : "(507) 537-7117",
                    "email" : "brenda.bierschenk@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/brenda-bierschenk.html",
                    "headshot" : "",
                    "folderOrder" : 231465276
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brad",
                    "lastName" : "Bigler",
                    "fullName" : "Brad Bigler",
                    "departments" : ["Athletics"],
                    "title" : "Head Men's Basketball Coach",
                    "phone" : "(507) 537-7128",
                    "email" : "brad.bigler@smsu.edu",
                    "office" : "FH 326",
                                            "link" : "profiles/brad-bigler.html",
                    "headshot" : "_images/brad-bigler.jpg",
                    "folderOrder" : 237894867
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Charles",
                    "lastName" : "Bingen",
                    "fullName" : "Charles Bingen",
                    "departments" : ["Mathematics Program", "Department of Mathematics and Computer Science"],
                    "title" : "Instructor, Math - add'l GEN",
                    "phone" : "(507) 537-6599",
                    "email" : "charles.bingen@smsu.edu",
                    "office" : "SM 266",
                                            "link" : "profiles/charles-bingen.html",
                    "headshot" : "",
                    "folderOrder" : 244324458
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Tyler",
                    "lastName" : "Boddy",
                    "fullName" : "Tyler Boddy",
                    "departments" : ["Intramurals", "Athletics"],
                    "title" : "Head Volleyball Coach\/Instructor",
                    "phone" : "(507) 537-7383",
                    "email" : "tyler.boddy@smsu.edu",
                    "office" : "FH 301",
                                            "link" : "profiles/tyler-boddy.html",
                    "headshot" : "_images/tyler-boddy.jpg",
                    "folderOrder" : 250754049
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Natasha",
                    "lastName" : "Boe",
                    "fullName" : "Natasha Boe",
                    "departments" : ["Financial Aid"],
                    "title" : "Director of Financial Aid",
                    "phone" : "(507) 537-6448",
                    "email" : "natasha.boe@smsu.edu",
                    "office" : "IL 145",
                                            "link" : "profiles/natasha-boe.html",
                    "headshot" : "",
                    "folderOrder" : 257183640
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kris",
                    "lastName" : "Boedigheimer",
                    "fullName" : "Kris Boedigheimer",
                    "departments" : ["Small Business Development Center-Regional Office", "Center of Innovation and Entrepreneurship"],
                    "title" : "Small Business Development Center Associate Director",
                    "phone" : "(507) 537-7386",
                    "email" : "kris.boedigheimer@smsu.edu",
                    "office" : "ST 211",
                                            "link" : "profiles/kris-boedigheimer.html",
                    "headshot" : "",
                    "folderOrder" : 263613231
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Abbie",
                    "lastName" : "Boelter",
                    "fullName" : "Abbie Boelter",
                    "departments" : ["Residence Life"],
                    "title" : "Customer Service Specialist, Principal",
                    "phone" : "(507) 537-6851",
                    "email" : "abbie.boelter.2@smsu.edu",
                    "office" : "HC4 101",
                                            "link" : "profiles/abbie-boelter-2.html",
                    "headshot" : "_images/abbie-boelter-2.jpg",
                    "folderOrder" : 270042822
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Bailey",
                    "lastName" : "Bouman",
                    "fullName" : "Bailey Bouman",
                    "departments" : ["Athletics", "Education Program", "School of Education"],
                    "title" : "Head Women's Softball Coach\/Assist Prof",
                    "phone" : "(507) 537-7096",
                    "email" : "bailey.bouman@smsu.edu",
                    "office" : "FH 310",
                                            "link" : "profiles/bailey-bouman.html",
                    "headshot" : "_images/bailey-bouman.jpg",
                    "folderOrder" : 276472413
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kirsten",
                    "lastName" : "Brichler",
                    "fullName" : "Kirsten Brichler",
                    "departments" : ["Department of Science", "Biology Program"],
                    "title" : "Greenhouse Manager",
                    "phone" : "(507) 537-6159",
                    "email" : "kirsten.brichler@smsu.edu",
                    "office" : "SM 174",
                                            "link" : "profiles/kirsten-brichler.html",
                    "headshot" : "_images/kirsten-brichler.jpg",
                    "folderOrder" : 282902004
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Jay",
                    "lastName" : "Brown",
                    "fullName" : "Jay Brown",
                    "departments" : ["Chemistry Program", "Department of Science"],
                    "title" : "Professor of Chemistry",
                    "phone" : "(507) 537-6558",
                    "email" : "jay.brown@smsu.edu",
                    "office" : "SM 232",
                                            "link" : "profiles/jay-brown.html",
                    "headshot" : "",
                    "folderOrder" : 289331595
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mattie",
                    "lastName" : "Hennen",
                    "fullName" : "Mattie Hennen",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Trainer",
                    "phone" : "(507) 537-6252",
                    "email" : "mattie.brown@smsu.edu",
                    "office" : "BA 124",
                                            "link" : "profiles/mattie-brown.html",
                    "headshot" : "_images/mattie-brown.jpg",
                    "folderOrder" : 360057096
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Levi",
                    "lastName" : "Bullerman",
                    "fullName" : "Levi Bullerman",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Football Coach\/Athletic Adminstration",
                    "phone" : "(507) 537-6143",
                    "email" : "levi.bullerman@smsu.edu",
                    "office" : "FH 305",
                                            "link" : "profiles/levi-bullerman.html",
                    "headshot" : "_images/levi-bullerman.jpg",
                    "folderOrder" : 295761186
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Timothy",
                    "lastName" : "Buysse",
                    "fullName" : "Timothy Buysse",
                    "departments" : ["College Now"],
                    "title" : "Faculty Advisor for College Now",
                    "phone" : "(507) 537-6021",
                    "email" : "tim.buysse@smsu.edu",
                    "office" : "BA 107",
                                            "link" : "profiles/tim-buysse.html",
                    "headshot" : "",
                    "folderOrder" : 302190777
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Rustin",
                    "lastName" : "Buysse",
                    "fullName" : "Rustin Buysse",
                    "departments" : ["Foundation"],
                    "title" : "Director of Development",
                    "phone" : "(507) 537-6876",
                    "email" : "rustin.buysse@smsu.edu",
                    "office" : "FH 220",
                                            "link" : "profiles/rustin-buysse.html",
                    "headshot" : "_images/rustin-buysse-2.jpg",
                    "folderOrder" : 308620368
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Hillary",
                    "lastName" : "Buysse",
                    "fullName" : "Hillary Buysse",
                    "departments" : ["Admission"],
                    "title" : "Campus Visit Coordinator",
                    "phone" : "(507) 537-6286",
                    "email" : "hillary.buysse@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/hillary-buysse.html",
                    "headshot" : "_images/hillary-buysse.jpg",
                    "folderOrder" : 315049959
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Christopher",
                    "lastName" : "Cauwels",
                    "fullName" : "Christopher Cauwels",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "christopher.cauwels@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/christopher-cauwels.html",
                    "headshot" : "",
                    "folderOrder" : 321479550
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Yuanyi",
                    "lastName" : "Chen",
                    "fullName" : "Yuanyi Chen",
                    "departments" : ["Fine Arts and Communication, Department of", "Communication Studies Program"],
                    "title" : "Assistant Professor of Communication Studies",
                    "phone" : "(507) 537-6567",
                    "email" : "yuanyi.chen@smsu.edu",
                    "office" : "CH 115",
                                            "link" : "profiles/yuanyi-chen.html",
                    "headshot" : "",
                    "folderOrder" : 327909141
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Trevor",
                    "lastName" : "Christopherson",
                    "fullName" : "Trevor Christopherson",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Refrigeration Mechanic",
                    "phone" : "(507) 537-7803",
                    "email" : "trevor.christopherson@smsu.edu",
                    "office" : "BA 104AC",
                                            "link" : "profiles/trevor-christopherson.html",
                    "headshot" : "",
                    "folderOrder" : 334338732
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Kenneth",
                    "lastName" : "Chukwuba",
                    "fullName" : "Kenneth Chukwuba",
                    "departments" : ["North Star Mutual School of Business", "Management Program", "Department of Business Innovation & Strategy"],
                    "title" : "Professor Business Management",
                    "phone" : "(507) 537-6211",
                    "email" : "kenneth.chukwuba@smsu.edu",
                    "office" : "ST 203D",
                                            "link" : "profiles/kenneth-chukwuba.html",
                    "headshot" : "",
                    "folderOrder" : 340768323
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Kris",
                    "lastName" : "Cleveland",
                    "fullName" : "Kris Cleveland",
                    "departments" : ["Exercise Science Program", "Department of Science", "SMSU Wellness Workgroup"],
                    "title" : "Associate Professor of Exercise Science",
                    "phone" : "(507) 537-7233",
                    "email" : "kris.cleveland@smsu.edu",
                    "office" : "PE 220",
                                            "link" : "profiles/kris-cleveland.html",
                    "headshot" : "_images/kris-cleveland.jpg",
                    "folderOrder" : 347197914
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Gustavo",
                    "lastName" : "Condezo",
                    "fullName" : "Gustavo Condezo",
                    "departments" : ["Admission"],
                    "title" : "Associate Director of Admission and Transfer Recruitment Coordinator",
                    "phone" : "(507) 537-6179",
                    "email" : "gustavo.condezo@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/gustavo-condezo.html",
                    "headshot" : "_images/gustavo-condezo.jpg",
                    "folderOrder" : 353627505
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Sandy",
                    "lastName" : "Craner",
                    "fullName" : "Sandy Craner",
                    "departments" : ["Department of Science", "Biology Program"],
                    "title" : "Professor of Biology",
                    "phone" : "(507) 537-6175",
                    "email" : "sandy.craner@smsu.edu",
                    "office" : "SM 275",
                                            "link" : "profiles/sandy-craner.html",
                    "headshot" : "",
                    "folderOrder" : 366486687
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Zachary",
                    "lastName" : "Cunha",
                    "fullName" : "Zachary Cunha",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Football Coach",
                    "phone" : "(507) 537-6574",
                    "email" : "zachary.cunha@smsu.edu",
                    "office" : "FH 305",
                                            "link" : "profiles/zachary-cunha.html",
                    "headshot" : "",
                    "folderOrder" : 372916278
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Uma",
                    "lastName" : "Czech",
                    "fullName" : "Uma Czech",
                    "departments" : ["Admission"],
                    "title" : "Admissions Counselor",
                    "phone" : "(507) 537-7467",
                    "email" : "uma.czech@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/uma-czech.html",
                    "headshot" : "_images/uma-czech.jpg",
                    "folderOrder" : 379345869
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Cori Ann",
                    "lastName" : "Dahlager",
                    "fullName" : "Cori Ann Dahlager",
                    "departments" : ["Graduate Studies, School of", "Education: Graduate Program", "Education Graduate Program - Special Ed.", "Graduate Admissions"],
                    "title" : "Director of the School of Graduate Studies",
                    "phone" : "(507) 537-6819",
                    "email" : "coriann.dahlager@smsu.edu",
                    "office" : "BA 265",
                                            "link" : "profiles/coriann-dahlager.html",
                    "headshot" : "",
                    "folderOrder" : 385775460
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Pat",
                    "lastName" : "Daniels",
                    "fullName" : "Pat Daniels",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Building Maintenance Supervisor",
                    "phone" : "(507) 537-6455",
                    "email" : "pat.daniels@smsu.edu",
                    "office" : "BA 103AC",
                                            "link" : "profiles/pat-daniels.html",
                    "headshot" : "",
                    "folderOrder" : 392205051
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mary Ellen",
                    "lastName" : "Daniloff-Merrill",
                    "fullName" : "Mary Ellen Daniloff-Merrill",
                    "departments" : ["English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Professor of English",
                    "phone" : "(507) 537-6239",
                    "email" : "mary.daniloff-merrill@smsu.edu",
                    "office" : "BA 210",
                                            "link" : "profiles/mary-daniloff-merrill.html",
                    "headshot" : "",
                    "folderOrder" : 398634642
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Steve",
                    "lastName" : "Davis",
                    "fullName" : "Steve Davis",
                    "departments" : ["Department of Agriculture, Culinology and Hospitality Management", "Agribusiness Management Program", "School of Agriculture"],
                    "title" : "Professor of Agribusiness Mgmt\/Economics",
                    "phone" : "(507) 537-7122",
                    "email" : "steve.davis@smsu.edu",
                    "office" : "ST 259",
                                            "link" : "profiles/steve-davis.html",
                    "headshot" : "_images/steve-davis.jpg",
                    "folderOrder" : 405064233
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Carol",
                    "lastName" : "DeSmet",
                    "fullName" : "Carol DeSmet",
                    "departments" : ["McFarland Library"],
                    "title" : "Library Technician",
                    "phone" : "(507) 537-6158",
                    "email" : "carol.desmet@smsu.edu",
                    "office" : "BA 283",
                                            "link" : "profiles/carol-desmet.html",
                    "headshot" : "",
                    "folderOrder" : 411493824
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Stephanie",
                    "lastName" : "DeVos",
                    "fullName" : "Stephanie DeVos",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Director of Advising, Recruitment and Retention for the School of Educ",
                    "phone" : "(507) 537-7215",
                    "email" : "stephanie.devos@smsu.edu",
                    "office" : "IL 155",
                                            "link" : "profiles/stephanie-devos.html",
                    "headshot" : "_images/stephanie-devos.jpg",
                    "folderOrder" : 417923415
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Emilie",
                    "lastName" : "DeWitte",
                    "fullName" : "Emilie DeWitte",
                    "departments" : ["Admission"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6287",
                    "email" : "emilie.dewitte@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/emilie-dewitte.html",
                    "headshot" : "",
                    "folderOrder" : 424353006
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Eric",
                    "lastName" : "Doise",
                    "fullName" : "Eric Doise",
                    "departments" : ["Honors Program", "English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Associate Professor of English; Honors Program Director",
                    "phone" : "(507) 537-7521",
                    "email" : "eric.doise@smsu.edu",
                    "office" : "BA 212",
                                            "link" : "profiles/eric-doise.html",
                    "headshot" : "_images/eric-doise.jpg",
                    "folderOrder" : 430782597
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Taylor",
                    "lastName" : "Doyle",
                    "fullName" : "Taylor Doyle",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "taylor.doyle@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/taylor-doyle.html",
                    "headshot" : "",
                    "folderOrder" : 437212188
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Dustin",
                    "lastName" : "Drake",
                    "fullName" : "Dustin Drake",
                    "departments" : ["Facilities & Physical Plant", "Residence Life"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "dustin.drake@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/dustin-drake.html",
                    "headshot" : "",
                    "folderOrder" : 443641779
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Maryjane",
                    "lastName" : "Dunn",
                    "fullName" : "Maryjane Dunn",
                    "departments" : ["Department of English, Philosophy, Spanish and Humanities", "Foreign Languages Program"],
                    "title" : "Assistant Professor of Spanish",
                    "phone" : "(507) 537-7283",
                    "email" : "maryjane.dunn@smsu.edu",
                    "office" : "BA 225",
                                            "link" : "profiles/maryjane-dunn.html",
                    "headshot" : "_images/maryjane-dunn.jpg",
                    "folderOrder" : 450071370
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Shawna",
                    "lastName" : "Ehlenbach",
                    "fullName" : "Shawna Ehlenbach",
                    "departments" : ["Mental Health Counseling Center"],
                    "title" : "Psychologist 2",
                    "phone" : "(507) 537-7150",
                    "email" : "shawna.ehlenbach@smsu.edu",
                    "office" : "BA 156",
                                            "link" : "profiles/shawna-ehlenbach.html",
                    "headshot" : "_images/shawna-ehlenbach.jpg",
                    "folderOrder" : 456500961
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Angela",
                    "lastName" : "Eickhoff",
                    "fullName" : "Angela Eickhoff",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "angela.eickhoff@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/angela-eickhoff.html",
                    "headshot" : "_images/angela-eickhoff.jpg",
                    "folderOrder" : 462930552
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Lori",
                    "lastName" : "Engebretson",
                    "fullName" : "Lori Engebretson",
                    "departments" : ["Mental Health Counseling Center", "Career Services"],
                    "title" : "Customer Service Specialist Sr",
                    "phone" : "(507) 537-6221",
                    "email" : "lori.engebretson@smsu.edu",
                    "office" : "BA 156",
                                            "link" : "profiles/lori-engebretson.html",
                    "headshot" : "_images/lori-engebretson.jpg",
                    "folderOrder" : 469360143
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "John",
                    "lastName" : "Engstrom",
                    "fullName" : "John Engstrom",
                    "departments" : ["School of Education", "Education Program", "Graduate Learning Community"],
                    "title" : "Associate Professor of Education",
                    "phone" : "(507) 537-7115",
                    "email" : "john.engstrom@smsu.edu",
                    "office" : "IL 155",
                                            "link" : "profiles/john-engstrom.html",
                    "headshot" : "",
                    "folderOrder" : 475789734
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Taner",
                    "lastName" : "Erdogan",
                    "fullName" : "Taner Erdogan",
                    "departments" : ["Department of Science", "Exercise Science Program"],
                    "title" : "Assistant Professor of Exercise Science",
                    "phone" : "(507) 537-6233",
                    "email" : "taner.erdogan@smsu.edu",
                    "office" : "PE 226",
                                            "link" : "profiles/taner-erdogan.html",
                    "headshot" : "_images/taner-ergodan.jpg",
                    "folderOrder" : 482219325
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Timothy",
                    "lastName" : "Farrell",
                    "fullName" : "Timothy Farrell",
                    "departments" : ["Facilities & Physical Plant", "Residence Life"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "timothy.farrell@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/timothy-farrell.html",
                    "headshot" : "",
                    "folderOrder" : 488648916
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Christine",
                    "lastName" : "Fischer",
                    "fullName" : "Christine Fischer",
                    "departments" : ["Small Business Development Center-Regional Office", "Center of Innovation and Entrepreneurship"],
                    "title" : "Director of SBDC",
                    "phone" : "(507) 537-7386",
                    "email" : "christine.fischer@smsu.edu",
                    "office" : "ST 213",
                                            "link" : "profiles/christine-fischer.html",
                    "headshot" : "",
                    "folderOrder" : 495078507
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Shelby",
                    "lastName" : "Flint",
                    "fullName" : "Shelby Flint",
                    "departments" : ["Biology Program", "Department of Science"],
                    "title" : "Assistant Professor of Biology",
                    "phone" : "(507) 537-6642",
                    "email" : "shelby.flint@smsu.edu",
                    "office" : "SM 164",
                                            "link" : "profiles/shelby-flint.html",
                    "headshot" : "_images/shelby-flint.jpg",
                    "folderOrder" : 501508098
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Thomas",
                    "lastName" : "Flynn",
                    "fullName" : "Thomas Flynn",
                    "departments" : ["McFarland Library"],
                    "title" : "Access Services Librarian\/Assistant Professor",
                    "phone" : "(507) 537-6788",
                    "email" : "thomas.flynn.2@smsu.edu",
                    "office" : "BA 303",
                                            "link" : "profiles/thomas-flynn-2.html",
                    "headshot" : "_images/thomas-flynn-2.jpg",
                    "folderOrder" : 507937689
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Mark",
                    "lastName" : "Fokken",
                    "fullName" : "Mark Fokken",
                    "departments" : ["Communication Studies Program", "Fine Arts and Communication, Department of"],
                    "title" : "Associate Professor of Communication Studies",
                    "phone" : "(507) 537-7370",
                    "email" : "mark.fokken@smsu.edu",
                    "office" : "CH 114",
                                            "link" : "profiles/mark-fokken.html",
                    "headshot" : "_images/mark-fokken.jpg",
                    "folderOrder" : 514367280
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "BC",
                    "lastName" : "Franson",
                    "fullName" : "BC Franson",
                    "departments" : ["Social Science Department", "Justice Administration & Criminal Justice Program"],
                    "title" : "Associate Professor of Justice Administration",
                    "phone" : "(507) 537-6083",
                    "email" : "bc.franson@smsu.edu",
                    "office" : "CH 131A",
                                            "link" : "profiles/bc-franson.html",
                    "headshot" : "_images/bc-franson.jpg",
                    "folderOrder" : 520796871
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Paul",
                    "lastName" : "Freeburg",
                    "fullName" : "Paul Freeburg",
                    "departments" : ["Foundation"],
                    "title" : "Accounting Officer Senior",
                    "phone" : "(507) 537-7427",
                    "email" : "paul.freeburg@smsu.edu",
                    "office" : "FH 227",
                                            "link" : "profiles/paul-freeburg.html",
                    "headshot" : "_images/paul-freeburg.jpg",
                    "folderOrder" : 527226462
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Brett",
                    "lastName" : "Gaul",
                    "fullName" : "Brett Gaul",
                    "departments" : ["Philosophy Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Professor of Philosophy",
                    "phone" : "(507) 537-7141",
                    "email" : "brett.gaul@smsu.edu",
                    "office" : "BA 104",
                                            "link" : "profiles/brett-gaul.html",
                    "headshot" : "_images/brett-gaul.jpg",
                    "folderOrder" : 533656053
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Hanna",
                    "lastName" : "Geistfeld",
                    "fullName" : "Hanna Geistfeld",
                    "departments" : ["Swimming Pool", "Athletics"],
                    "title" : "Assistant Women's Basketball Coach",
                    "phone" : "(507) 537-6684",
                    "email" : "hanna.geistfeld@smsu.edu",
                    "office" : "RA 117",
                                            "link" : "profiles/hanna-geistfeld.html",
                    "headshot" : "_images/hanna-geistfeld.jpg",
                    "folderOrder" : 540085644
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brian",
                    "lastName" : "Gelster",
                    "fullName" : "Brian Gelster",
                    "departments" : ["Business Services"],
                    "title" : "Buyer 2",
                    "phone" : "(507) 537-7510",
                    "email" : "brian.gelster@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/brian-gelster.html",
                    "headshot" : "_images/brian-gelster.jpg",
                    "folderOrder" : 546515235
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "John",
                    "lastName" : "Ginocchio",
                    "fullName" : "John Ginocchio",
                    "departments" : ["Fine Arts and Communication, Department of", "Music Program"],
                    "title" : "Professor of Music \/ Department Chair",
                    "phone" : "(507) 537-7209",
                    "email" : "john.ginocchio@smsu.edu",
                    "office" : "FA 124",
                                            "link" : "profiles/john-ginocchio.html",
                    "headshot" : "_images/john-ginocchio.jpg",
                    "folderOrder" : 552944826
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Pam",
                    "lastName" : "Gladis",
                    "fullName" : "Pam Gladis",
                    "departments" : ["McFarland Library", "History Center"],
                    "title" : "Professor of Library",
                    "phone" : "(507) 537-6813",
                    "email" : "pam.gladis@smsu.edu",
                    "office" : "BA 512",
                                            "link" : "profiles/pam-gladis.html",
                    "headshot" : "_images/pam-gladis.jpg",
                    "folderOrder" : 559374417
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jody",
                    "lastName" : "Gladis",
                    "fullName" : "Jody Gladis",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "jody.gladis@smsu.edu",
                    "office" : "BA",
                                            "link" : "profiles/jody-gladis.html",
                    "headshot" : "",
                    "folderOrder" : 565804008
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Clayson",
                    "lastName" : "Glasgow",
                    "fullName" : "Clayson Glasgow",
                    "departments" : ["Athletics"],
                    "title" : "Head Women's Soccer Coach\/Instructor",
                    "phone" : "(507) 537-6648",
                    "email" : "clayson.glasgow@smsu.edu",
                    "office" : "FH 318",
                                            "link" : "profiles/clayson-glasgow.html",
                    "headshot" : "",
                    "folderOrder" : 572233599
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jenifer",
                    "lastName" : "Goblish",
                    "fullName" : "Jenifer Goblish",
                    "departments" : ["Fine Arts and Communication, Department of", "Communication Studies Program"],
                    "title" : "Assistant Professor of Communication Studies",
                    "phone" : "(507) 537-6002",
                    "email" : "jenifer.goblish@smsu.edu",
                    "office" : "CH 117",
                                            "link" : "profiles/jenifer-goblish.html",
                    "headshot" : "_images/jenifer-goblish.jpg",
                    "folderOrder" : 578663190
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Devin",
                    "lastName" : "Gorter",
                    "fullName" : "Devin Gorter",
                    "departments" : ["Athletics"],
                    "title" : "Associate Athletic Director for External Affairs",
                    "phone" : "(507) 537-6453",
                    "email" : "devin.gorter@smsu.edu",
                    "office" : "FH 325",
                                            "link" : "profiles/devin-gorter.html",
                    "headshot" : "_images/devin-gorter.jpg",
                    "folderOrder" : 585092781
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jorge",
                    "lastName" : "Grajeda",
                    "fullName" : "Jorge Grajeda",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Painter",
                    "phone" : "(507) 537-7106",
                    "email" : "jorge.grajeda@smsu.edu",
                    "office" : "MT",
                                            "link" : "profiles/jorge-grajeda.html",
                    "headshot" : "",
                    "folderOrder" : 591522372
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Tony",
                    "lastName" : "Greenfield",
                    "fullName" : "Tony Greenfield",
                    "departments" : ["Department of Science", "Biology Program"],
                    "title" : "Professor of Biology",
                    "phone" : "(507) 537-7291",
                    "email" : "tony.greenfield@smsu.edu",
                    "office" : "SM 131",
                                            "link" : "profiles/tony-greenfield.html",
                    "headshot" : "_images/tony-greenfield.jpg",
                    "folderOrder" : 597951963
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Marsha",
                    "lastName" : "Grimes-Rose",
                    "fullName" : "Marsha Grimes-Rose",
                    "departments" : ["Center of Innovation and Entrepreneurship", "Management Program", "Department of Business Innovation & Strategy", "North Star Mutual School of Business"],
                    "title" : "Assistant Professor of Management, Supply Chain",
                    "phone" : "(507) 537-7430",
                    "email" : "marsha.rose@smsu.edu",
                    "office" : "ST 208",
                                            "link" : "profiles/marsha-rose.html",
                    "headshot" : "_images/marsha-rose.jpg",
                    "folderOrder" : 604381554
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Maddy",
                    "lastName" : "Groff",
                    "fullName" : "Maddy Groff",
                    "departments" : ["Communications and Marketing"],
                    "title" : "Information Officer 3",
                    "phone" : "(507) 537-6903",
                    "email" : "maddy.groff@smsu.edu",
                    "office" : "FH 017",
                                            "link" : "profiles/maddy-groff.html",
                    "headshot" : "_images/maddy-groff.jpg",
                    "folderOrder" : 610811145
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Karen",
                    "lastName" : "Gruhot",
                    "fullName" : "Karen Gruhot",
                    "departments" : ["Department of Agriculture, Culinology and Hospitality Management", "School of Agriculture", "Department of Business Innovation & Strategy", "North Star Mutual School of Business"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6223",
                    "email" : "karen.gruhot@smsu.edu",
                    "office" : "ST 201",
                                            "link" : "profiles/karen-gruhot.html",
                    "headshot" : "_images/karen-gruhot.jpg",
                    "folderOrder" : 617240736
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "James",
                    "lastName" : "Guerrant",
                    "fullName" : "James Guerrant",
                    "departments" : ["Social Science Department", "Social Work Program"],
                    "title" : "Assistant Professor",
                    "phone" : "(507) 537-7251",
                    "email" : "james.guerrant@smsu.edu",
                    "office" : "CH 111",
                                            "link" : "profiles/james-guerrant.html",
                    "headshot" : "_images/james-guerrant.jpg",
                    "folderOrder" : 623670327
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mary",
                    "lastName" : "Haberman",
                    "fullName" : "Mary Haberman",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Success Coach",
                    "phone" : "(507) 537-6690",
                    "email" : "mary.haberman@smsu.edu",
                    "office" : "IL 223",
                                            "link" : "profiles/mary-haberman.html",
                    "headshot" : "_images/mary-haberman.jpg",
                    "folderOrder" : 630099918
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Tracy",
                    "lastName" : "Hadler",
                    "fullName" : "Tracy Hadler",
                    "departments" : ["Nursing: RN to BSN Program", "Department of Nursing"],
                    "title" : "Assistant Professor \/ Director of Nursing",
                    "phone" : "(507) 537-6644",
                    "email" : "tracy.hadler@smsu.edu",
                    "office" : "SM 159",
                                            "link" : "profiles/tracy-hadler.html",
                    "headshot" : "",
                    "folderOrder" : 636529509
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Scott",
                    "lastName" : "Haken",
                    "fullName" : "Scott Haken",
                    "departments" : ["Information Technology Services", "SHOT"],
                    "title" : "Information Tech Specialist 2",
                    "phone" : "(507) 537-6271",
                    "email" : "scott.haken@smsu.edu",
                    "office" : "BA 179",
                                            "link" : "profiles/scott-haken.html",
                    "headshot" : "",
                    "folderOrder" : 642959100
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Alma",
                    "lastName" : "Hale",
                    "fullName" : "Alma Hale",
                    "departments" : ["Fine Arts and Communication, Department of", "Art & Design Program"],
                    "title" : "Professor of Art",
                    "phone" : "(507) 537-6298",
                    "email" : "alma.hale@smsu.edu",
                    "office" : "FA 229",
                                            "link" : "profiles/alma-hale.html",
                    "headshot" : "_images/alma-hale.jpg",
                    "folderOrder" : 649388691
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Alexander",
                    "lastName" : "Harsh",
                    "fullName" : "Alexander Harsh",
                    "departments" : ["Department of Mathematics and Computer Science", "Mathematics Program"],
                    "title" : "Assistant Professor\/Instructor of Mathematics",
                    "phone" : "(507) 537-7353",
                    "email" : "alexander.harsh@smsu.edu",
                    "office" : "SM 223",
                                            "link" : "profiles/alexander-harsh.html",
                    "headshot" : "_images/alexander-harsh.jpg",
                    "folderOrder" : 655818282
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jason",
                    "lastName" : "Harvey",
                    "fullName" : "Jason Harvey",
                    "departments" : ["Information Technology Services"],
                    "title" : "Information Tech Specialist 3",
                    "phone" : "(507) 537-6244",
                    "email" : "jason.harvey@smsu.edu",
                    "office" : "BA 182",
                                            "link" : "profiles/jason-harvey.html",
                    "headshot" : "",
                    "folderOrder" : 662247873
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Shawn",
                    "lastName" : "Hedman",
                    "fullName" : "Shawn Hedman",
                    "departments" : ["Center of Learning and Teaching (COLT)", "Information Technology Services"],
                    "title" : "Director of Academic\/Administrative Computer Serv",
                    "phone" : "(507) 537-6292",
                    "email" : "shawn.hedman@smsu.edu",
                    "office" : "BA 162",
                                            "link" : "profiles/shawn-hedman.html",
                    "headshot" : "",
                    "folderOrder" : 675107055
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mostafa",
                    "lastName" : "Hegazy",
                    "fullName" : "Mostafa Hegazy",
                    "departments" : ["Department of Science", "Exercise Science Program"],
                    "title" : "Associate Professor of Exercise Science",
                    "phone" : "(507) 537-6243",
                    "email" : "mostafa.hegazy@smsu.edu",
                    "office" : "PE 227",
                                            "link" : "profiles/mostafa-hegazy.html",
                    "headshot" : "_images/mostafa-hegazy.jpg",
                    "folderOrder" : 681536646
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jessica",
                    "lastName" : "Hennen",
                    "fullName" : "Jessica Hennen",
                    "departments" : ["English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Assistant Professor of English",
                    "phone" : "(507) 537-7475",
                    "email" : "jessica.hennen@smsu.edu",
                    "office" : "BA 211",
                                            "link" : "profiles/jessica-hennen.html",
                    "headshot" : "_images/jessica-hennen.jpg",
                    "folderOrder" : 687966237
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mike",
                    "lastName" : "Hofstetter",
                    "fullName" : "Mike Hofstetter",
                    "departments" : ["History Program", "Social Science Department"],
                    "title" : "Professor of History",
                    "phone" : "(507) 537-6130",
                    "email" : "mike.hofstetter@smsu.edu",
                    "office" : "CH 214",
                                            "link" : "profiles/mike-hofstetter.html",
                    "headshot" : "",
                    "folderOrder" : 694395828
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mu-wan",
                    "lastName" : "Huang",
                    "fullName" : "Mu-wan Huang",
                    "departments" : ["Department of Mathematics and Computer Science", "Mathematics Program"],
                    "title" : "Associate Professor of Mathematics",
                    "phone" : "(507) 537-7314",
                    "email" : "mu-wan.huang@smsu.edu",
                    "office" : "SM 219",
                                            "link" : "profiles/mu-wan-huang.html",
                    "headshot" : "",
                    "folderOrder" : 700825419
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Joyce",
                    "lastName" : "Hwang",
                    "fullName" : "Joyce Hwang",
                    "departments" : ["Department of Agriculture, Culinology and Hospitality Management", "Culinology Program", "Hospitality Management Program", "School of Agriculture"],
                    "title" : "Assoc Prof of Hospitality Management",
                    "phone" : "(507) 537-6462",
                    "email" : "joyce.hwang@smsu.edu",
                    "office" : "IL 113",
                                            "link" : "profiles/joyce-hwang.html",
                    "headshot" : "_images/joyce-hwang.jpg",
                    "folderOrder" : 707255010
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jeremy",
                    "lastName" : "Ische",
                    "fullName" : "Jeremy Ische",
                    "departments" : ["Athletics"],
                    "title" : "Head Baseball Coach",
                    "phone" : "(507) 537-6269",
                    "email" : "jeremy.ische.2@smsu.edu",
                    "office" : "FH 320",
                                            "link" : "profiles/jeremy-ische-2.html",
                    "headshot" : "",
                    "folderOrder" : 713684601
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jenna",
                    "lastName" : "Jackson",
                    "fullName" : "Jenna Jackson",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Trainer",
                    "phone" : "(507) 537-6433",
                    "email" : "jenna.edwards@smsu.edu",
                    "office" : "BA 127",
                                            "link" : "profiles/jenna-edwards.html",
                    "headshot" : "",
                    "folderOrder" : 720114192
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Chayse",
                    "lastName" : "Jackson",
                    "fullName" : "Chayse Jackson",
                    "departments" : ["Athletics"],
                    "title" : "Head Wrestling Coach\/Assistant Professor",
                    "phone" : "(507) 537-6214",
                    "email" : "chayse.jackson@smsu.edu",
                    "office" : "BA 120",
                                            "link" : "profiles/chayse-jackson.html",
                    "headshot" : "",
                    "folderOrder" : 726543783
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Paige",
                    "lastName" : "Janka",
                    "fullName" : "Paige Janka",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Trainer",
                    "phone" : "(507) 537-6659",
                    "email" : "paige.janka.2@smsu.edu",
                    "office" : "BA 126",
                                            "link" : "profiles/paige-janka-2.html",
                    "headshot" : "_images/paige-janka-2.jpg",
                    "folderOrder" : 732973374
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kayla",
                    "lastName" : "Jelen",
                    "fullName" : "Kayla Jelen",
                    "departments" : ["School of Education", "Education Program"],
                    "title" : "Clinical Experience Coordinator\/Student Teacher Supervisor",
                    "phone" : "(507) 537-7287",
                    "email" : "kayla.jelen@smsu.edu",
                    "office" : "IL 151",
                                            "link" : "profiles/kayla-jelen.html",
                    "headshot" : "",
                    "folderOrder" : 739402965
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jeff",
                    "lastName" : "Jennings",
                    "fullName" : "Jeff Jennings",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Grounds & Roads Maintenance Supervisor",
                    "phone" : "(507) 537-7323",
                    "email" : "jeff.jennings@smsu.edu",
                    "office" : "MT",
                                            "link" : "profiles/jeff-jennings.html",
                    "headshot" : "",
                    "folderOrder" : 745832556
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Laurie",
                    "lastName" : "Johansen",
                    "fullName" : "Laurie Johansen",
                    "departments" : ["Department of Nursing", "Nursing: RN to BSN Program"],
                    "title" : "Professor of Nursing",
                    "phone" : "(507) 537-7590",
                    "email" : "laurie.johansen@smsu.edu",
                    "office" : "SM 160",
                                            "link" : "profiles/laurie-johansen.html",
                    "headshot" : "",
                    "folderOrder" : 752262147
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Sang",
                    "lastName" : "Jung",
                    "fullName" : "Sang Jung",
                    "departments" : ["School of Agriculture", "Department of Agriculture, Culinology and Hospitality Management", "Agribusiness Management Program", "Agricultural Solutions"],
                    "title" : "Assoc Prof of Ag Mgmt",
                    "phone" : "(507) 537-6030",
                    "email" : "sang.jung@smsu.edu",
                    "office" : "ST 157",
                                            "link" : "profiles/sang-jung.html",
                    "headshot" : "_images/sang-jung.jpg",
                    "folderOrder" : 758691738
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Dan",
                    "lastName" : "Kaiser",
                    "fullName" : "Dan Kaiser",
                    "departments" : ["Department of Mathematics and Computer Science", "Mathematics Program", "Computer Science Program"],
                    "title" : "Professor of Computer Science \/ Department Chair",
                    "phone" : "(507) 537-6163",
                    "email" : "dan.kaiser@smsu.edu",
                    "office" : "SM 263",
                                            "link" : "profiles/dan-kaiser.html",
                    "headshot" : "",
                    "folderOrder" : 765121329
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Anna",
                    "lastName" : "Kamrath",
                    "fullName" : "Anna Kamrath",
                    "departments" : ["Data Management and Institutional Research"],
                    "title" : "Management Analyst 2",
                    "phone" : "(507) 537-7596",
                    "email" : "anna.kamrath@smsu.edu",
                    "office" : "BA 245",
                                            "link" : "profiles/anna-kamrath.html",
                    "headshot" : "",
                    "folderOrder" : 771550920
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Bradley",
                    "lastName" : "Kaufer",
                    "fullName" : "Bradley Kaufer",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Trainer",
                    "phone" : "(507) 537-7219",
                    "email" : "bradley.kaufer@smsu.edu",
                    "office" : "BA 124",
                                            "link" : "profiles/bradley-kaufer.html",
                    "headshot" : "",
                    "folderOrder" : 777980511
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Deb",
                    "lastName" : "Kerkaert",
                    "fullName" : "Deb Kerkaert",
                    "departments" : ["Vice President for Finance and Administration"],
                    "title" : "VP for Finance & Administration",
                    "phone" : "(507) 537-6093",
                    "email" : "deb.kerkaert@smsu.edu",
                    "office" : "FH 215",
                                            "link" : "profiles/deb-kerkaert.html",
                    "headshot" : "_images/deb-kerkaert.jpg",
                    "folderOrder" : 784410102
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Stephen",
                    "lastName" : "Kingsbury",
                    "fullName" : "Stephen Kingsbury",
                    "departments" : ["Music Program", "Fine Arts and Communication, Department of"],
                    "title" : "Professor of Music",
                    "phone" : "(507) 537-7247",
                    "email" : "stephen.kingsbury@smsu.edu",
                    "office" : "FA 123",
                                            "link" : "profiles/stephen-kingsbury.html",
                    "headshot" : "_images/stephen-kingsbury.jpg",
                    "folderOrder" : 790839693
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Maria",
                    "lastName" : "Kingsbury",
                    "fullName" : "Maria Kingsbury",
                    "departments" : ["Women's Center", "Center of Learning and Teaching (COLT)", "McFarland Library"],
                    "title" : "Professor of Library",
                    "phone" : "(507) 537-6165",
                    "email" : "maria.kingsbury@smsu.edu",
                    "office" : "BA 304",
                                            "link" : "profiles/maria-kingsbury.html",
                    "headshot" : "",
                    "folderOrder" : 797269284
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Amber",
                    "lastName" : "Kinner-Alahakoon",
                    "fullName" : "Amber Kinner-Alahakoon",
                    "departments" : ["Social Science Department", "Social Work Program"],
                    "title" : "Assistant Professor of Social Work",
                    "phone" : "(507) 537-7444",
                    "email" : "amber.kinner-alahakoon@smsu.edu",
                    "office" : "CH 105A",
                                            "link" : "profiles/amber-kinner-alahakoon.html",
                    "headshot" : "_images/amber-kinner-alahakoon.jpg",
                    "folderOrder" : 803698875
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Cory",
                    "lastName" : "Klumper",
                    "fullName" : "Cory Klumper",
                    "departments" : ["Information Technology Services"],
                    "title" : "Multi-Media Technology Specialist",
                    "phone" : "(507) 537-7221",
                    "email" : "cory.klumper.2@smsu.edu",
                    "office" : "BA 137",
                                            "link" : "profiles/cory-klumper-2.html",
                    "headshot" : "_images/cory-klumper-2.jpg",
                    "folderOrder" : 816558057
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Laura",
                    "lastName" : "Koenig",
                    "fullName" : "Laura Koenig",
                    "departments" : ["Psychology Program", "Social Science Department"],
                    "title" : "Associate Professor of Psychology",
                    "phone" : "(507) 537-7315",
                    "email" : "laura.koenig@smsu.edu",
                    "office" : "CH 127C",
                                            "link" : "profiles/laura-koenig.html",
                    "headshot" : "_images/laura-koenig.jpg",
                    "folderOrder" : 822987648
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kala",
                    "lastName" : "Kopitski",
                    "fullName" : "Kala Kopitski",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Director of Assessment, Accreditation & Licensure",
                    "phone" : "(507) 537-6681",
                    "email" : "kala.kopitski@smsu.edu",
                    "office" : "IL 154",
                                            "link" : "profiles/kala-kopitski.html",
                    "headshot" : "_images/kala-kopitski.jpg",
                    "folderOrder" : 829417239
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Kristin",
                    "lastName" : "Kovar",
                    "fullName" : "Kristin Kovar",
                    "departments" : ["School of Agriculture", "Department of Agriculture, Culinology and Hospitality Management", "Agricultural Communications and Leadership", "Agricultural Education"],
                    "title" : "Associate Professor of Agricultural Education",
                    "phone" : "(507) 537-6441",
                    "email" : "kristin.kovar@smsu.edu",
                    "office" : "ST 159",
                                            "link" : "profiles/kristin-kovar.html",
                    "headshot" : "_images/kristin-kovar.jpg",
                    "folderOrder" : 835846830
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Rachel",
                    "lastName" : "Krall",
                    "fullName" : "Rachel Krall",
                    "departments" : ["Graduate Studies, School of"],
                    "title" : "Office & Administrative Specialist, Int.",
                    "phone" : "(507) 537-6186",
                    "email" : "rachel.krall@smsu.edu",
                    "office" : "OFF",
                                            "link" : "profiles/rachel-krall.html",
                    "headshot" : "_images/rachel-krall.jpg",
                    "folderOrder" : 842276421
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Joseph",
                    "lastName" : "Krogman",
                    "fullName" : "Joseph Krogman",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Building Services Manager",
                    "phone" : "(507) 537-6177",
                    "email" : "joe.krogman@smsu.edu",
                    "office" : "ST 269",
                                            "link" : "profiles/joe-krogman.html",
                    "headshot" : "_images/joe-krogman.jpg",
                    "folderOrder" : 848706012
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Taylor",
                    "lastName" : "Krogman",
                    "fullName" : "Taylor Krogman",
                    "departments" : ["TRiO Upward Bound"],
                    "title" : "Associate Director for TRIO Upward Bound",
                    "phone" : "",
                    "email" : "taylor.krogman@smsu.edu",
                    "office" : "OFF \/ BA 116 (Summer)",
                                            "link" : "profiles/taylor-krogman.html",
                    "headshot" : "",
                    "folderOrder" : 855135603
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brittany",
                    "lastName" : "Krull",
                    "fullName" : "Brittany Krull",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Director of Student Success",
                    "phone" : "(507) 537-7290",
                    "email" : "brittany.krull@smsu.edu",
                    "office" : "IL 224B",
                                            "link" : "profiles/brittany-krull.html",
                    "headshot" : "_images/brittany-krull.jpg",
                    "folderOrder" : 861565194
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Hannah",
                    "lastName" : "Abel",
                    "fullName" : "Hannah Abel",
                    "departments" : ["Foundation"],
                    "title" : "Director of Alumni Relations and Outreach",
                    "phone" : "(507) 537-6820",
                    "email" : "hannah.abel@smsu.edu",
                    "office" : "Elizabeth Lockwood SMSU Alumni & Visitor Center",
                                            "link" : "profiles/hannah-abel.html",
                    "headshot" : "_images/hannah-kuno.jpg",
                    "folderOrder" : 867994785
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Michael",
                    "lastName" : "Kurowski",
                    "fullName" : "Michael Kurowski",
                    "departments" : ["Center for International Education"],
                    "title" : "Assistant Director, Center for International Education",
                    "phone" : "(507) 537-7436",
                    "email" : "michael.kurowski@smsu.edu",
                    "office" : "SC 238",
                                            "link" : "profiles/michael-kurowski.html",
                    "headshot" : "_images/michael-kurowski.jpg",
                    "folderOrder" : 874424376
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Josh",
                    "lastName" : "Kuusisto",
                    "fullName" : "Josh Kuusisto",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Track & Field Coach - Throws",
                    "phone" : "(507) 537-6262",
                    "email" : "josh.kuusisto@smsu.edu",
                    "office" : "PE 230",
                                            "link" : "profiles/josh-kuusisto.html",
                    "headshot" : "_images/josh-kuusisto.jpg",
                    "folderOrder" : 880853967
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Dennis",
                    "lastName" : "Lamb",
                    "fullName" : "Dennis Lamb",
                    "departments" : ["Education Program", "Graduate Learning Community", "School of Education"],
                    "title" : "Professor of Education",
                    "phone" : "(507) 537-7115",
                    "email" : "dennis.lamb@smsu.edu",
                    "office" : "IL 158",
                                            "link" : "profiles/dennis-lamb.html",
                    "headshot" : "",
                    "folderOrder" : 887283558
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Ann",
                    "lastName" : "Lanners",
                    "fullName" : "Ann Lanners",
                    "departments" : ["Information Technology Services"],
                    "title" : "Information Technology Specialist 3",
                    "phone" : "(507) 537-6479",
                    "email" : "ann.lanners@smsu.edu",
                    "office" : "BA 139",
                                            "link" : "profiles/ann-lanners.html",
                    "headshot" : "_images/ann-lanners.jpg",
                    "folderOrder" : 893713149
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jane",
                    "lastName" : "Larsen",
                    "fullName" : "Jane Larsen",
                    "departments" : ["Financial Aid"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6281",
                    "email" : "jane.larsen@smsu.edu",
                    "office" : "IL 145",
                                            "link" : "profiles/jane-larsen.html",
                    "headshot" : "",
                    "folderOrder" : 900142740
                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jefferson",
                    "lastName" : "Lee IV",
                    "fullName" : "Jefferson Lee IV",
                    "departments" : ["Residence Life", "Barnes and Noble Campus Bookstore", "Dean of Students", "Campus Dining and Catering", "Access Opportunity Success", "Child Care Center", "Mental Health Counseling Center", "Career Services", "Student Center", "Health Services"],
                    "title" : "Dean of Students",
                    "phone" : "(507) 537-7285",
                    "email" : "jay.lee@smsu.edu",
                    "office" : "FH 217",
                                            "link" : "profiles/jay-lee.html",
                    "headshot" : "_images/jay-lee.jpg",
                    "folderOrder" : 913001922
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brian",
                    "lastName" : "Lensing",
                    "fullName" : "Brian Lensing",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Plant Maintenance Engineer",
                    "phone" : "(507) 537-7803",
                    "email" : "brian.lensing@smsu.edu",
                    "office" : "BA 104AC",
                                            "link" : "profiles/brian-lensing.html",
                    "headshot" : "_images/brian-lensing.jpg",
                    "folderOrder" : 919431513
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jamie",
                    "lastName" : "Leonard",
                    "fullName" : "Jamie Leonard",
                    "departments" : ["Center for International Education"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-7222",
                    "email" : "jamie.leonard@smsu.edu",
                    "office" : "SC 237",
                                            "link" : "profiles/jamie-leonard.html",
                    "headshot" : "_images/jamie-leonard.jpg",
                    "folderOrder" : 925861104
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Nicole",
                    "lastName" : "Lewis",
                    "fullName" : "Nicole Lewis",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Success Coach",
                    "phone" : "(507) 537-6360",
                    "email" : "nicole.lewis@smsu.edu",
                    "office" : "IL 224C",
                                            "link" : "profiles/nicole-lewis.html",
                    "headshot" : "_images/nicole-lewis.jpg",
                    "folderOrder" : 932290695
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Robert",
                    "lastName" : "Lewis",
                    "fullName" : "Robert Lewis",
                    "departments" : ["Student Center", "Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "robert.lewis@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/robert-lewis.html",
                    "headshot" : "",
                    "folderOrder" : 938720286
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Holly",
                    "lastName" : "Lichtsinn",
                    "fullName" : "Holly Lichtsinn",
                    "departments" : ["Business Services"],
                    "title" : "Account Clerk Senior",
                    "phone" : "(507) 537-6905",
                    "email" : "holly.lichtsinn@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/holly-lichtsinn.html",
                    "headshot" : "",
                    "folderOrder" : 945149877
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Yumi",
                    "lastName" : "Lim",
                    "fullName" : "Yumi Lim",
                    "departments" : ["Culinology Program", "Department of Agriculture, Culinology and Hospitality Management", "Hospitality Management Program", "School of Agriculture"],
                    "title" : "Associate Professor of Hospitality Management",
                    "phone" : "(507) 537-6442",
                    "email" : "yumi.lim@smsu.edu",
                    "office" : "IL 114",
                                            "link" : "profiles/yumi-lim.html",
                    "headshot" : "_images/yumi-lim.jpg",
                    "folderOrder" : 951579468
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kelly",
                    "lastName" : "Loft",
                    "fullName" : "Kelly Loft",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Athletic Director \/ Communications & Marketing",
                    "phone" : "(507) 537-7177",
                    "email" : "kelly.loft@smsu.edu",
                    "office" : "FH 321",
                                            "link" : "profiles/kelly-loft.html",
                    "headshot" : "_images/kelly-loft.jpg",
                    "folderOrder" : 958009059
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Lee",
                    "lastName" : "Louwagie",
                    "fullName" : "Lee Louwagie",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Plant Maintenance Engineer",
                    "phone" : "(507) 537-7803",
                    "email" : "lee.louwagie@smsu.edu",
                    "office" : "BA 104AC",
                                            "link" : "profiles/lee-louwagie.html",
                    "headshot" : "",
                    "folderOrder" : 964438650
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Spencer",
                    "lastName" : "Louwagie",
                    "fullName" : "Spencer Louwagie",
                    "departments" : ["Information Technology Services", "Athletics"],
                    "title" : "Esports Coach",
                    "phone" : "(507) 537-6424",
                    "email" : "spencer.louwagie@smsu.edu",
                    "office" : "BA 176",
                                            "link" : "profiles/spencer-louwagie.html",
                    "headshot" : "_images/spencer-louwagie.jpg",
                    "folderOrder" : 970868241
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Lisa",
                    "lastName" : "Lucas",
                    "fullName" : "Lisa Lucas",
                    "departments" : ["English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Assistant Professor of English",
                    "phone" : "(507) 537-6172",
                    "email" : "lisa.lucas@smsu.edu",
                    "office" : "BA 108",
                                            "link" : "profiles/lisa-lucas.html",
                    "headshot" : "_images/lisa-lucas.jpg",
                    "folderOrder" : 977297832
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Shushuang",
                    "lastName" : "Man",
                    "fullName" : "Shushuang Man",
                    "departments" : ["Department of Mathematics and Computer Science", "Computer Science Program"],
                    "title" : "Professor of Computer Science",
                    "phone" : "(507) 537-6168",
                    "email" : "shushuang.man@smsu.edu",
                    "office" : "SM 268",
                                            "link" : "profiles/shushuang-man.html",
                    "headshot" : "",
                    "folderOrder" : 983727423
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Alan",
                    "lastName" : "Matzner",
                    "fullName" : "Alan Matzner",
                    "departments" : ["Data Management and Institutional Research"],
                    "title" : "Dir of Inst Research & Reporting",
                    "phone" : "(507) 537-6010",
                    "email" : "alan.matzner@smsu.edu",
                    "office" : "BA 243",
                                            "link" : "profiles/alan-matzner.html",
                    "headshot" : "",
                    "folderOrder" : 990157014
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Taylor",
                    "lastName" : "McKittrick",
                    "fullName" : "Taylor McKittrick",
                    "departments" : ["Admission"],
                    "title" : "Assistant Director of Admission and Visit Experience Coordinator",
                    "phone" : "(507) 537-7324",
                    "email" : "taylor.mckittrick@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/taylor-mckittrick.html",
                    "headshot" : "_images/taylor-mckittrick.jpg",
                    "folderOrder" : 996586605
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Jay",
                    "lastName" : "Meiners",
                    "fullName" : "Jay Meiners",
                    "departments" : ["School of Education"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-7030",
                    "email" : "jay.meiners2@smsu.edu",
                    "office" : "IL 159",
                                            "link" : "profiles/jay-meiners2.html",
                    "headshot" : "_images/jay-meiners2.jpg",
                    "folderOrder" : 1003016196
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jessica",
                    "lastName" : "Mensink",
                    "fullName" : "Jessica Mensink",
                    "departments" : ["College Now"],
                    "title" : "Director of Concurrent Enrollment",
                    "phone" : "(507) 537-6390",
                    "email" : "jessica.mensink@smsu.edu",
                    "office" : "BA 264",
                                            "link" : "profiles/jessica-mensink.html",
                    "headshot" : "_images/jessica-mensink.jpg",
                    "folderOrder" : 1009445787
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Christopher",
                    "lastName" : "Metz",
                    "fullName" : "Christopher Metz",
                    "departments" : ["Fine Arts and Communication, Department of", "Communication Studies Program", "Center of Learning and Teaching (COLT)"],
                    "title" : "Assistant Professor of Communication Studies",
                    "phone" : "(507) 537-6197",
                    "email" : "christopher.metz@smsu.edu",
                    "office" : "BA 173",
                                            "link" : "profiles/christopher-metz.html",
                    "headshot" : "",
                    "folderOrder" : 1015875378
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "April",
                    "lastName" : "Miles",
                    "fullName" : "April Miles",
                    "departments" : ["Facilities & Physical Plant", "Duplicating Services", "Post Office"],
                    "title" : "Central Svcs Admin Spec Prin",
                    "phone" : "(507) 537-6347",
                    "email" : "april.miles@smsu.edu",
                    "office" : "BA 175",
                                            "link" : "profiles/april-miles.html",
                    "headshot" : "",
                    "folderOrder" : 1022304969
                }
                                                                                                                                                                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Monica",
                    "lastName" : "Miller",
                    "fullName" : "Monica Miller",
                    "departments" : ["Physics Program", "Environmental Science Program", "Mathematics Program", "Computer Science Program", "Biology Program", "Chemistry Program", "Department of Science", "Exercise Science Program"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6178",
                    "email" : "monica.miller@smsu.edu",
                    "office" : "SM 178",
                                            "link" : "profiles/monica-miller.html",
                    "headshot" : "",
                    "folderOrder" : 1028734560
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Allison",
                    "lastName" : "Monson",
                    "fullName" : "Allison Monson",
                    "departments" : ["Physical Education Program", "Athletics"],
                    "title" : "Assoc Dir of Athletics\/Compl\/Dir of Stud Ath\/Sr Wm's Administrator",
                    "phone" : "(507) 537-7133",
                    "email" : "allison.monson@smsu.edu",
                    "office" : "FH 321",
                                            "link" : "profiles/allison-monson.html",
                    "headshot" : "_images/allison-monson.jpg",
                    "folderOrder" : 1035164151
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Heather",
                    "lastName" : "Moreland",
                    "fullName" : "Heather Moreland",
                    "departments" : ["Mathematics Program", "Department of Mathematics and Computer Science"],
                    "title" : "Professor of Mathematics",
                    "phone" : "(507) 537-6102",
                    "email" : "heather.moreland@smsu.edu",
                    "office" : "SM 217",
                                            "link" : "profiles/heather-moreland.html",
                    "headshot" : "",
                    "folderOrder" : 1041593742
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kourosh",
                    "lastName" : "Mortezapour",
                    "fullName" : "Kourosh Mortezapour",
                    "departments" : ["Department of Mathematics and Computer Science", "Computer Science Program"],
                    "title" : "Professor of Computer Science",
                    "phone" : "(507) 537-6101",
                    "email" : "k.mortezapour@smsu.edu",
                    "office" : "SM 264",
                                            "link" : "profiles/k-mortezapour.html",
                    "headshot" : "",
                    "folderOrder" : 1048023333
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jim",
                    "lastName" : "Mortland",
                    "fullName" : "Jim Mortland",
                    "departments" : ["Business Services"],
                    "title" : "Account Clerk Senior",
                    "phone" : "(507) 537-6190",
                    "email" : "jim.mortland@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/jim-mortland.html",
                    "headshot" : "",
                    "folderOrder" : 1054452924
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mary",
                    "lastName" : "Mortland",
                    "fullName" : "Mary Mortland",
                    "departments" : ["Business Services"],
                    "title" : "Accounting Officer, Int",
                    "phone" : "(507) 537-6193",
                    "email" : "mary.mortland@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/mary-mortland.html",
                    "headshot" : "",
                    "folderOrder" : 1060882515
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "May Lee",
                    "lastName" : "Moua-Vue",
                    "fullName" : "May Lee Moua-Vue",
                    "departments" : ["Center for International Education"],
                    "title" : "Director of International Student Services and Global Studies",
                    "phone" : "(507) 537-6499",
                    "email" : "maylee.moua-vue@smsu.edu",
                    "office" : "SC 236",
                                            "link" : "profiles/maylee-moua-vue.html",
                    "headshot" : "_images/maylee-moua-vue.jpg",
                    "folderOrder" : 1067312106
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Soma",
                    "lastName" : "Mukherjee",
                    "fullName" : "Soma Mukherjee",
                    "departments" : ["School of Agriculture", "Department of Agriculture, Culinology and Hospitality Management", "Culinology Program", "Hospitality Management Program"],
                    "title" : "Assistant Professor of Culinology",
                    "phone" : "(507) 537-7214",
                    "email" : "soma.mukherjee@smsu.edu",
                    "office" : "IL 111",
                                            "link" : "profiles/soma-mukherjee.html",
                    "headshot" : "_images/soma-mukherjee.jpg",
                    "folderOrder" : 1073741697
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Stacie",
                    "lastName" : "Mulso",
                    "fullName" : "Stacie Mulso",
                    "departments" : ["Communications and Marketing"],
                    "title" : "Information Officer 3",
                    "phone" : "(507) 537-7093",
                    "email" : "stacie.mulso@smsu.edu",
                    "office" : "FH 018",
                                            "link" : "profiles/stacie-mulso.html",
                    "headshot" : "_images/stacie-mulso.jpg",
                    "folderOrder" : 1080171288
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mike",
                    "lastName" : "Munford",
                    "fullName" : "Mike Munford",
                    "departments" : ["University Public Safety"],
                    "title" : "Director of Public Safety",
                    "phone" : "(507) 537-7858",
                    "email" : "mike.munford@smsu.edu",
                    "office" : "FH 116",
                                            "link" : "profiles/mike-munford.html",
                    "headshot" : "_images/mike-munford.jpg",
                    "folderOrder" : 1086600879
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Ken",
                    "lastName" : "Murphy",
                    "fullName" : "Ken Murphy",
                    "departments" : ["Planetarium", "Department of Science", "Physics Program"],
                    "title" : "Professor of Physics\/Planetarium Director",
                    "phone" : "(507) 537-6173",
                    "email" : "ken.murphy@smsu.edu",
                    "office" : "SM 273",
                                            "link" : "profiles/ken-murphy.html",
                    "headshot" : "",
                    "folderOrder" : 1093030470
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kirk",
                    "lastName" : "Nauman",
                    "fullName" : "Kirk Nauman",
                    "departments" : ["Athletics"],
                    "title" : "Head Cross Country\/Track & Field Coach\/Asst Prof",
                    "phone" : "(507) 537-6595",
                    "email" : "kirk.nauman@smsu.edu",
                    "office" : "PE 232",
                                            "link" : "profiles/kirk-nauman.html",
                    "headshot" : "_images/kirk-nauman.jpg",
                    "folderOrder" : 1099460061
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Shari",
                    "lastName" : "Neal",
                    "fullName" : "Shari Neal",
                    "departments" : ["McFarland Library"],
                    "title" : "Library Technician \/ Archives & Acquisitions Technician",
                    "phone" : "(507) 537-7232",
                    "email" : "shari.neal@smsu.edu",
                    "office" : "BA 538",
                                            "link" : "profiles/shari-neal.html",
                    "headshot" : "_images/shari-neal.jpg",
                    "folderOrder" : 1105889652
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Amy",
                    "lastName" : "Nemitz",
                    "fullName" : "Amy Nemitz",
                    "departments" : ["TRiO Upward Bound"],
                    "title" : "Director of TRIO Upward Bound",
                    "phone" : "(507) 537-7376",
                    "email" : "amy.nemitz@smsu.edu",
                    "office" : "BA 115",
                                            "link" : "profiles/amy-nemitz.html",
                    "headshot" : "_images/amy-nemitz.jpg",
                    "folderOrder" : 1112319243
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kantina",
                    "lastName" : "Neyens",
                    "fullName" : "Kantina Neyens",
                    "departments" : ["Health Services"],
                    "title" : "LPN",
                    "phone" : "(507) 537-7202",
                    "email" : "kantina.neyens@smsu.edu",
                    "office" : "BA",
                                            "link" : "profiles/kantina-neyens.html",
                    "headshot" : "_images/kantina-neyens.jpg",
                    "folderOrder" : 1118748834
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Kandy",
                    "lastName" : "Noles Stevens",
                    "fullName" : "Kandy Noles Stevens",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Associate Professor of Education \/ College Now",
                    "phone" : "(507) 537-6546",
                    "email" : "kandy.nolesstevens@smsu.edu",
                    "office" : "IL 229",
                                            "link" : "profiles/kandy-nolesstevens.html",
                    "headshot" : "_images/kandy-nolesstevens.jpg",
                    "folderOrder" : 1125178425
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Tony",
                    "lastName" : "Nubile",
                    "fullName" : "Tony Nubile",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Director of Facilities",
                    "phone" : "(507) 537-7328",
                    "email" : "tony.nubile@smsu.edu",
                    "office" : "MT 104",
                                            "link" : "profiles/tony-nubile.html",
                    "headshot" : "_images/tony-nubile.jpg",
                    "folderOrder" : 1131608016
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Melisa",
                    "lastName" : "Nubile",
                    "fullName" : "Melisa Nubile",
                    "departments" : ["Business Services"],
                    "title" : "Accounts Payable & Receivable Supervisor",
                    "phone" : "(507) 537-6658",
                    "email" : "melisa.nubile@smsu.edu",
                    "office" : "IL",
                                            "link" : "profiles/melisa-nubile.html",
                    "headshot" : "",
                    "folderOrder" : 1138037607
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Ben",
                    "lastName" : "Nwachukwu",
                    "fullName" : "Ben Nwachukwu",
                    "departments" : ["Center of Learning and Teaching (COLT)", "Information Technology Services"],
                    "title" : "Information Tech Specialist 3",
                    "phone" : "(507) 537-6261",
                    "email" : "ben.nwachukwu2@smsu.edu",
                    "office" : "BA 500",
                                            "link" : "profiles/ben-nwachukwu2.html",
                    "headshot" : "_images/ben-nwachukwu2.jpg",
                    "folderOrder" : 1144467198
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Christine",
                    "lastName" : "Olson",
                    "fullName" : "Christine Olson",
                    "departments" : ["Psychology Program", "Social Science Department"],
                    "title" : "Professor of Psychology",
                    "phone" : "(507) 537-7248",
                    "email" : "christine.olson@smsu.edu",
                    "office" : "OFF",
                                            "link" : "profiles/christine-olson.html",
                    "headshot" : "",
                    "folderOrder" : 1150896789
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Marcy",
                    "lastName" : "Olson",
                    "fullName" : "Marcy Olson",
                    "departments" : ["Communications and Marketing"],
                    "title" : "Senior Director of Communication & Marketing",
                    "phone" : "(507) 537-7374",
                    "email" : "marcy.olson@smsu.edu",
                    "office" : "FH 020",
                                            "link" : "profiles/marcy-olson.html",
                    "headshot" : "_images/marcy-olson.jpg",
                    "folderOrder" : 1163755971
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Raphael",
                    "lastName" : "Onyeaghala",
                    "fullName" : "Raphael Onyeaghala",
                    "departments" : ["North Star Mutual School of Business", "Dean, College of Business, Education and Professional Studies", "Online Learning & Transfer Partnerships, Office of", "Provost\/Vice President for Academic and Student Affairs"],
                    "title" : "Dean of Business, Education, Grad & Prof Studies",
                    "phone" : "(507) 537-6251",
                    "email" : "raphael.onyeaghala@smsu.edu",
                    "office" : "BA 263",
                                            "link" : "profiles/raphael-onyeaghala.html",
                    "headshot" : "_images/raphael-onyeaghala.jpg",
                    "folderOrder" : 1170185562
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Laura",
                    "lastName" : "O'Rourke",
                    "fullName" : "Laura O'Rourke",
                    "departments" : ["Human Resources", "Affirmative Action"],
                    "title" : "Campus Human Resources Officer",
                    "phone" : "(507) 537-7500",
                    "email" : "laura.orourke@smsu.edu",
                    "office" : "BA 257",
                                            "link" : "profiles/laura-orourke.html",
                    "headshot" : "_images/laura-orourke.jpg",
                    "folderOrder" : 1176615153
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Rebecca",
                    "lastName" : "Panka",
                    "fullName" : "Rebecca Panka",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Director of Clinical Experiences in Education",
                    "phone" : "(507) 537-7059",
                    "email" : "rebecca.panka@smsu.edu",
                    "office" : "IL 152",
                                            "link" : "profiles/rebecca-panka.html",
                    "headshot" : "_images/rebecca-panka.jpg",
                    "folderOrder" : 1189474335
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Douglas",
                    "lastName" : "Patterson",
                    "fullName" : "Douglas Patterson",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Football Coach",
                    "phone" : "(507) 537-6655",
                    "email" : "douglas.patterson@smsu.edu",
                    "office" : "FH 315",
                                            "link" : "profiles/douglas-patterson.html",
                    "headshot" : "",
                    "folderOrder" : 1195903926
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Devyn",
                    "lastName" : "Payne",
                    "fullName" : "Devyn Payne",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "devyn.payne@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/devyn-payne.html",
                    "headshot" : "",
                    "folderOrder" : 1202333517
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jon",
                    "lastName" : "Payne",
                    "fullName" : "Jon Payne",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "jon.payne@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/jon-payne.html",
                    "headshot" : "",
                    "folderOrder" : 1208763108
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Sebaztian",
                    "lastName" : "Payne",
                    "fullName" : "Sebaztian Payne",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "sebaztian.payne@smsu.edu",
                    "office" : "BA",
                                            "link" : "profiles/sebaztian-payne.html",
                    "headshot" : "",
                    "folderOrder" : 1215192699
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kristi",
                    "lastName" : "Petersen",
                    "fullName" : "Kristi Petersen",
                    "departments" : ["McFarland Library"],
                    "title" : "Library Technician \/ Collection Management Technician",
                    "phone" : "(507) 537-6162",
                    "email" : "kristi.petersen@smsu.edu",
                    "office" : "BA 540",
                                            "link" : "profiles/kristi-petersen.html",
                    "headshot" : "_images/kristi-petersen.jpg",
                    "folderOrder" : 1221622290
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Scott",
                    "lastName" : "Peterson",
                    "fullName" : "Scott Peterson",
                    "departments" : ["Social Science Department", "Psychology Program"],
                    "title" : "Professor of Psychology",
                    "phone" : "(507) 537-6482",
                    "email" : "scott.peterson@smsu.edu",
                    "office" : "CH 127E",
                                            "link" : "profiles/scott-peterson.html",
                    "headshot" : "",
                    "folderOrder" : 1228051881
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Donna",
                    "lastName" : "Pettit",
                    "fullName" : "Donna Pettit",
                    "departments" : ["School of Education", "Special Education Program", "Education Program"],
                    "title" : "Assistant Professor of Special Education",
                    "phone" : "(507) 537-6149",
                    "email" : "donna.pettit@smsu.edu",
                    "office" : "IL 239",
                                            "link" : "profiles/donna-pettit.html",
                    "headshot" : "_images/donna-pettit.jpg",
                    "folderOrder" : 1234481472
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Nathan",
                    "lastName" : "Polfliet",
                    "fullName" : "Nathan Polfliet",
                    "departments" : ["University Advancement", "Foundation", "MARL Program"],
                    "title" : "Associate Vice President of Advancement",
                    "phone" : "(507) 537-6285",
                    "email" : "nathan.polfliet@smsu.edu",
                    "office" : "FH 221",
                                            "link" : "profiles/nathan-polfliet.html",
                    "headshot" : "_images/nathan-polfliet.jpg",
                    "folderOrder" : 1240911063
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Christine",
                    "lastName" : "Quisley",
                    "fullName" : "Christine Quisley",
                    "departments" : ["School of Education", "Education Program"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-6212",
                    "email" : "christine.quisley@smsu.edu",
                    "office" : "IL 232",
                                            "link" : "profiles/christine-quisley.html",
                    "headshot" : "_images/christine-quisley.jpg",
                    "folderOrder" : 1247340654
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Lon",
                    "lastName" : "Richardson",
                    "fullName" : "Lon Richardson",
                    "departments" : ["Graduate Learning Community", "Education Program", "School of Education"],
                    "title" : "Professor of Education",
                    "phone" : "(507) 537-7115",
                    "email" : "lon.richardson@smsu.edu",
                    "office" : "IL 154",
                                            "link" : "profiles/lon-richardson.html",
                    "headshot" : "",
                    "folderOrder" : 1260199836
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Heather",
                    "lastName" : "Rickgarn",
                    "fullName" : "Heather Rickgarn",
                    "departments" : ["Management Program", "North Star Mutual School of Business", "Department of Business Innovation & Strategy"],
                    "title" : "Associate Professor of Management",
                    "phone" : "(507) 537-6284",
                    "email" : "heather.rickgarn@smsu.edu",
                    "office" : "ST 255",
                                            "link" : "profiles/heather-rickgarn.html",
                    "headshot" : "_images/heather-rickgarn.jpg",
                    "folderOrder" : 1266629427
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "John",
                    "lastName" : "Rickgarn",
                    "fullName" : "John Rickgarn",
                    "departments" : ["Department of Business Innovation & Strategy", "Management Program", "Marketing Program", "North Star Mutual School of Business"],
                    "title" : "Assistant Professor of Marketing",
                    "phone" : "(507) 537-7286",
                    "email" : "john.rickgarn.2@smsu.edu",
                    "office" : "ST 201B",
                                            "link" : "profiles/john-rickgarn-2.html",
                    "headshot" : "_images/john-rickgarn-2.jpg",
                    "folderOrder" : 1273059018
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Daniel",
                    "lastName" : "Rieppel",
                    "fullName" : "Daniel Rieppel",
                    "departments" : ["Music Program", "Fine Arts and Communication, Department of"],
                    "title" : "Professor of Music",
                    "phone" : "(507) 537-7139",
                    "email" : "daniel.rieppel@smsu.edu",
                    "office" : "FA 130",
                                            "link" : "profiles/daniel-rieppel.html",
                    "headshot" : "_images/daniel-rieppel.jpg",
                    "folderOrder" : 1279488609
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mitchell",
                    "lastName" : "Riibe",
                    "fullName" : "Mitchell Riibe",
                    "departments" : ["Communications and Marketing"],
                    "title" : "Information Officer 3",
                    "phone" : "(507) 537-7587",
                    "email" : "mitchell.riibe.2@smsu.edu",
                    "office" : "FH 14",
                                            "link" : "profiles/mitchell-riibe-2.html",
                    "headshot" : "_images/mitchell-riibe-2.jpg",
                    "folderOrder" : 1285918200
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Mary",
                    "lastName" : "Risacher",
                    "fullName" : "Mary Risacher",
                    "departments" : ["School of Education", "Education Program"],
                    "title" : "Associate Professor of Education",
                    "phone" : "(507) 537-6274",
                    "email" : "mary.risacher@smsu.edu",
                    "office" : "IL 163",
                                            "link" : "profiles/mary-risacher.html",
                    "headshot" : "",
                    "folderOrder" : 1292347791
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Lindsay",
                    "lastName" : "Pelz",
                    "fullName" : "Lindsay Pelz",
                    "departments" : ["Department of Nursing", "Nursing: RN to BSN Program"],
                    "title" : "Associate Professor of Nursing \/ Department Chair",
                    "phone" : "(507) 537-7385",
                    "email" : "lindsay.pelz@smsu.edu",
                    "office" : "SM 205A",
                                            "link" : "profiles/lindsay-pelz.html",
                    "headshot" : "_images/lindsay-pelz.jpg",
                    "folderOrder" : 1298777382
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Liz",
                    "lastName" : "Roy",
                    "fullName" : "Liz Roy",
                    "departments" : ["Business Services"],
                    "title" : "Accounting Officer - Intermediate",
                    "phone" : "(507) 537-6012",
                    "email" : "liz.roy@smsu.edu",
                    "office" : "IL 139",
                                            "link" : "profiles/liz-roy.html",
                    "headshot" : "",
                    "folderOrder" : 1305206973
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Caitlyn",
                    "lastName" : "Sanow-Minett",
                    "fullName" : "Caitlyn Sanow-Minett",
                    "departments" : ["McFarland Library"],
                    "title" : "Library Technician \/ Circulation Supervisor",
                    "phone" : "(507) 537-6688",
                    "email" : "caitlyn.sanow-minett@smsu.edu",
                    "office" : "BA 283",
                                            "link" : "profiles/caitlyn-sanow-2.html",
                    "headshot" : "",
                    "folderOrder" : 1311636564
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jeet",
                    "lastName" : "Sausen",
                    "fullName" : "Jeet Sausen",
                    "departments" : ["Mustang Pathway"],
                    "title" : "Associate Director of the Mustang Pathway Program",
                    "phone" : "(507) 537-6257",
                    "email" : "jeet.sausen@smsu.edu",
                    "office" : "SC 231",
                                            "link" : "profiles/jeet-sausen.html",
                    "headshot" : "_images/jeet-sausen.jpg",
                    "folderOrder" : 1318066155
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Bradley",
                    "lastName" : "Schloesser",
                    "fullName" : "Bradley Schloesser",
                    "departments" : ["Dean, College of Business, Education and Professional Studies", "MARL Program"],
                    "title" : "Executive Director of MARL",
                    "phone" : "(507) 537-7488",
                    "email" : "brad.schloesser@smsu.edu",
                    "office" : "ST 213",
                                            "link" : "profiles/brad-schloesser.html",
                    "headshot" : "",
                    "folderOrder" : 1324495746
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Nadine",
                    "lastName" : "Schmidt",
                    "fullName" : "Nadine Schmidt",
                    "departments" : ["Entertainment and Theatre Arts Program", "Fine Arts and Communication, Department of"],
                    "title" : "Professor of Theatre",
                    "phone" : "(507) 537-7011",
                    "email" : "nadine.schmidt@smsu.edu",
                    "office" : "FA 218",
                                            "link" : "profiles/nadine-schmidt.html",
                    "headshot" : "_images/nadine-schmidt.jpg",
                    "folderOrder" : 1330925337
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Amy",
                    "lastName" : "Schmiesing",
                    "fullName" : "Amy Schmiesing",
                    "departments" : ["Athletics"],
                    "title" : "Head Athletic Trainer",
                    "phone" : "(507) 537-7206",
                    "email" : "amy.schmiesing@smsu.edu",
                    "office" : "BA 130B",
                                            "link" : "profiles/amy-schmiesing.html",
                    "headshot" : "",
                    "folderOrder" : 1337354928
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Sarah",
                    "lastName" : "Schmuhl-Jerve",
                    "fullName" : "Sarah Schmuhl-Jerve",
                    "departments" : ["Registration and Records"],
                    "title" : "Credential Evaluator",
                    "phone" : "(507) 537-7381",
                    "email" : "sarah.schmuhl@smsu.edu",
                    "office" : "IL 147",
                                            "link" : "profiles/sarah-schmuhl.html",
                    "headshot" : "",
                    "folderOrder" : 1343784519
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Melissa",
                    "lastName" : "Scholten",
                    "fullName" : "Melissa Scholten",
                    "departments" : ["Career Services", "Center for Civic & Community Engagement"],
                    "title" : "Director of Career Services",
                    "phone" : "(507) 537-6017",
                    "email" : "melissa.scholten@smsu.edu",
                    "office" : "BA 156",
                                            "link" : "profiles/melissa-scholten.html",
                    "headshot" : "",
                    "folderOrder" : 1350214110
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Julie",
                    "lastName" : "Schreier",
                    "fullName" : "Julie Schreier",
                    "departments" : ["Financial Aid", "Business Services"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6444",
                    "email" : "julie.schreier@smsu.edu",
                    "office" : "IL 145",
                                            "link" : "profiles/julie-schreier.html",
                    "headshot" : "",
                    "folderOrder" : 1356643701
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Tory",
                    "lastName" : "Schreurs",
                    "fullName" : "Tory Schreurs",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Electrician, Master of Record",
                    "phone" : "(507) 537-6188",
                    "email" : "tory.schreurs@smsu.edu",
                    "office" : "BA 103AC",
                                            "link" : "profiles/tory-schreurs.html",
                    "headshot" : "_images/tory-schreurs.jpg",
                    "folderOrder" : 1363073292
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Tim",
                    "lastName" : "Schrunk",
                    "fullName" : "Tim Schrunk",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Assistant Director of Facilities & Physical Plant",
                    "phone" : "(507) 537-7478",
                    "email" : "tim.schrunk@smsu.edu",
                    "office" : "BA 104AC",
                                            "link" : "profiles/tim-schrunk.html",
                    "headshot" : "",
                    "folderOrder" : 1369502883
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kelly",
                    "lastName" : "Schuerman",
                    "fullName" : "Kelly Schuerman",
                    "departments" : ["SHOT", "Information Technology Services"],
                    "title" : "Information Tech Specialist 4",
                    "phone" : "(507) 537-6579",
                    "email" : "kelly.schuerman@smsu.edu",
                    "office" : "BA 182B",
                                            "link" : "profiles/kelly-schuerman.html",
                    "headshot" : "",
                    "folderOrder" : 1375932474
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Sami",
                    "lastName" : "Shahin",
                    "fullName" : "Sami Shahin",
                    "departments" : ["Mathematics Program"],
                    "title" : "Professor of Mathematics",
                    "phone" : "(507) 537-6247",
                    "email" : "sami.shahin@smsu.edu",
                    "office" : "SM 225",
                                            "link" : "profiles/sami-shahin.html",
                    "headshot" : "_images/sami-shahin.jpg",
                    "folderOrder" : 1382362065
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Amanda",
                    "lastName" : "Sieling",
                    "fullName" : "Amanda Sieling",
                    "departments" : ["Justice Administration & Criminal Justice Program", "Social Science Department"],
                    "title" : "Associate Professor of Justice Administration",
                    "phone" : "(507) 537-6240",
                    "email" : "amanda.sieling@smsu.edu",
                    "office" : "CH 131B",
                                            "link" : "profiles/amanda-sieling.html",
                    "headshot" : "_images/amanda-sieling.jpg",
                    "folderOrder" : 1388791656
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Cathryn",
                    "lastName" : "Sleiter",
                    "fullName" : "Cathryn Sleiter",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "cathryn.sleiter@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/cathryn-sleiter.html",
                    "headshot" : "",
                    "folderOrder" : 1395221247
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "James",
                    "lastName" : "Smalley",
                    "fullName" : "James Smalley",
                    "departments" : ["Social Science Department", "Social Work Program"],
                    "title" : "Associate Professor of Social Work",
                    "phone" : "(507) 537-6142",
                    "email" : "james.smalley@smsu.edu",
                    "office" : "CH 101D",
                                            "link" : "profiles/james-smalley.html",
                    "headshot" : "_images/james-smalley.jpg",
                    "folderOrder" : 1401650838
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Neil",
                    "lastName" : "Smith",
                    "fullName" : "Neil Smith",
                    "departments" : ["Department of English, Philosophy, Spanish and Humanities", "English Program"],
                    "title" : "Professor of English",
                    "phone" : "(507) 537-7295",
                    "email" : "anthony.smith@smsu.edu",
                    "office" : "BA 216",
                                            "link" : "profiles/anthony-smith.html",
                    "headshot" : "_images/anthony-smith.jpg",
                    "folderOrder" : 1408080429
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Zakary",
                    "lastName" : "Snell",
                    "fullName" : "Zakary Snell",
                    "departments" : ["Athletics", "Swimming Pool"],
                    "title" : "Director of Strength and Conditioning",
                    "phone" : "(507) 537-7455",
                    "email" : "zakary.snell@smsu.edu",
                    "office" : "RA 129",
                                            "link" : "profiles/zakary-snell.html",
                    "headshot" : "_images/zakary-snell.jpg",
                    "folderOrder" : 1414510020
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Matthew",
                    "lastName" : "Speakman",
                    "fullName" : "Matthew Speakman",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Building Services Supervisor",
                    "phone" : "(507) 537-7107",
                    "email" : "matthew.speakman@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/matthew-speakman.html",
                    "headshot" : "",
                    "folderOrder" : 1420939611
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Michele",
                    "lastName" : "Sterner",
                    "fullName" : "Michele Sterner",
                    "departments" : ["Indigenous Nations and Dakota Studies Program", "Access Opportunity Success"],
                    "title" : "Associate Director of Access Opportunity Success",
                    "phone" : "(507) 537-7382",
                    "email" : "michele.sterner@smsu.edu",
                    "office" : "CE",
                                            "link" : "profiles/michele-sterner.html",
                    "headshot" : "",
                    "folderOrder" : 1427369202
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Beth",
                    "lastName" : "Steuck",
                    "fullName" : "Beth Steuck",
                    "departments" : ["Fine Arts and Communication, Department of", "Music Program"],
                    "title" : "Studio Accompanist",
                    "phone" : "(507) 537-6968",
                    "email" : "beth.steuck@smsu.edu",
                    "office" : "FA 120",
                                            "link" : "profiles/beth-steuck.html",
                    "headshot" : "",
                    "folderOrder" : 1433798793
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Marilyn",
                    "lastName" : "Strate",
                    "fullName" : "Marilyn Strate",
                    "departments" : ["Education Program", "School of Education", "Physical Education Program"],
                    "title" : "Associate Professor of Physical Education",
                    "phone" : "(507) 537-7176",
                    "email" : "marilyn.strate@smsu.edu",
                    "office" : "PE 228",
                                            "link" : "profiles/marilyn-strate.html",
                    "headshot" : "",
                    "folderOrder" : 1440228384
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "David",
                    "lastName" : "Sturrock",
                    "fullName" : "David Sturrock",
                    "departments" : ["Political Science Program", "Social Science Department"],
                    "title" : "Prof of Political Science",
                    "phone" : "(507) 537-6078",
                    "email" : "david.sturrock@smsu.edu",
                    "office" : "CH 107B",
                                            "link" : "profiles/david-sturrock.html",
                    "headshot" : "",
                    "folderOrder" : 1446657975
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Theresa",
                    "lastName" : "Sumerfelt",
                    "fullName" : "Theresa Sumerfelt",
                    "departments" : ["Athletics"],
                    "title" : "Athletic Administrative Assistant",
                    "phone" : "(507) 537-7271",
                    "email" : "theresa.sumerfelt@smsu.edu",
                    "office" : "FH 312",
                                            "link" : "profiles/theresa-sumerfelt.html",
                    "headshot" : "_images/theresa-sumerfelt.jpg",
                    "folderOrder" : 1453087566
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jennifer",
                    "lastName" : "Swanson",
                    "fullName" : "Jennifer Swanson",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-7115",
                    "email" : "jennifer.swanson@smsu.edu",
                    "office" : "IL 229",
                                            "link" : "profiles/jennifer-swanson.html",
                    "headshot" : "_images/jennifer-swanson.jpg",
                    "folderOrder" : 1459517157
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "LeAnne",
                    "lastName" : "Syring",
                    "fullName" : "LeAnne Syring",
                    "departments" : ["School of Education", "Special Education Program", "Education Program"],
                    "title" : "Professor of Special Education \/ Coordinator of Special Education Programs",
                    "phone" : "(507) 537-6449",
                    "email" : "leanne.syring1@smsu.edu",
                    "office" : "IL 238",
                                            "link" : "profiles/leanne-syring1.html",
                    "headshot" : "_images/leanne-syring.jpg",
                    "folderOrder" : 1465946748
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Maureen",
                    "lastName" : "Szerlip",
                    "fullName" : "Maureen Szerlip",
                    "departments" : ["Dean, College of Arts, Letters and Sciences", "Scheduling and Event Planning", "Dean, College of Business, Education and Professional Studies"],
                    "title" : "Assistant to the Deans",
                    "phone" : "(507) 537-6873",
                    "email" : "maureen.szerlip@smsu.edu",
                    "office" : "BA 260",
                                            "link" : "profiles/maureen-szerlip.html",
                    "headshot" : "_images/maureen-szerlip.jpg",
                    "folderOrder" : 1472376339
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Sheila",
                    "lastName" : "Tabaka",
                    "fullName" : "Sheila Tabaka",
                    "departments" : ["Fine Arts and Communication, Department of", "Entertainment and Theatre Arts Program"],
                    "title" : "Professor of Theatre",
                    "phone" : "(507) 537-6273",
                    "email" : "sheila.tabaka@smsu.edu",
                    "office" : "FA 216",
                                            "link" : "profiles/sheila-tabaka.html",
                    "headshot" : "_images/sheila-tabaka.jpg",
                    "folderOrder" : 1478805930
                }
                                                                                                                                                                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "LeeAnn",
                    "lastName" : "Teig",
                    "fullName" : "LeeAnn Teig",
                    "departments" : ["Honors Program", "Department of English, Philosophy, Spanish and Humanities", "Department of Nursing", "Nursing: RN to BSN Program", "English Program"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-7155",
                    "email" : "leeann.teig@smsu.edu",
                    "office" : "BA 221",
                                            "link" : "profiles/leeann-teig.html",
                    "headshot" : "",
                    "folderOrder" : 1485235521
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Will",
                    "lastName" : "Thomas",
                    "fullName" : "Will Thomas",
                    "departments" : ["North Star Mutual School of Business", "Accounting Program", "Department of Business Innovation & Strategy"],
                    "title" : "Professor of Accounting",
                    "phone" : "(507) 537-7392",
                    "email" : "will.thomas@smsu.edu",
                    "office" : "ST 101A",
                                            "link" : "profiles/will-thomas.html",
                    "headshot" : "",
                    "folderOrder" : 1491665112
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Marilee",
                    "lastName" : "Thomas",
                    "fullName" : "Marilee Thomas",
                    "departments" : ["Dean, College of Arts, Letters and Sciences", "Dean, College of Business, Education and Professional Studies"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "(507) 537-6251",
                    "email" : "marilee.thomas@smsu.edu",
                    "office" : "BA 268",
                                            "link" : "profiles/marilee-thomas.html",
                    "headshot" : "",
                    "folderOrder" : 1498094703
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Ruthe",
                    "lastName" : "Thompson",
                    "fullName" : "Ruthe Thompson",
                    "departments" : ["Department of English, Philosophy, Spanish and Humanities", "English Program"],
                    "title" : "Professor of English",
                    "phone" : "(507) 537-7174",
                    "email" : "ruthe.thompson@smsu.edu",
                    "office" : "BA 105",
                                            "link" : "profiles/ruthe-thompson.html",
                    "headshot" : "",
                    "folderOrder" : 1504524294
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Edward",
                    "lastName" : "Thooft",
                    "fullName" : "Edward Thooft",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Plumber - Master in Charge",
                    "phone" : "(507) 537-7106",
                    "email" : "edward.thooft@smsu.edu",
                    "office" : "BA 104AC",
                                            "link" : "profiles/edward-thooft.html",
                    "headshot" : "",
                    "folderOrder" : 1510953885
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Joyce",
                    "lastName" : "Robinson",
                    "fullName" : "Joyce Robinson",
                    "departments" : ["University Public Safety"],
                    "title" : "Violence Prevention & Education Coordinator\/Deputy Title IX Coordinator\/Investigator",
                    "phone" : "(507) 537-7241",
                    "email" : "joyce.robinson@smsu.edu",
                    "office" : "FH 120",
                                            "link" : "profiles/joyce-robinson.html",
                    "headshot" : "_images/joyce-robinson.jpg",
                    "folderOrder" : 1517383476
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Benjamin",
                    "lastName" : "Tokheim",
                    "fullName" : "Benjamin Tokheim",
                    "departments" : ["Department of Science", "Chemistry Program"],
                    "title" : "Assistant Professor of Chemistry",
                    "phone" : "(507) 537-6901",
                    "email" : "benjamin.tokheim@smsu.edu",
                    "office" : "SM 283",
                                            "link" : "profiles/benjamin-tokheim.html",
                    "headshot" : "_images/benjamin-tokheim.jpg",
                    "folderOrder" : 1523813067
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Gerald",
                    "lastName" : "Toland",
                    "fullName" : "Gerald Toland",
                    "departments" : ["Agriculture - Bachelor of Applied Science", "School of Agriculture", "Agribusiness Management Program", "Department of Agriculture, Culinology and Hospitality Management"],
                    "title" : "Professor of Economics \/ Department Chair",
                    "phone" : "(507) 537-7317",
                    "email" : "gerald.toland@smsu.edu",
                    "office" : "ST 101B",
                                            "link" : "profiles/gerald-toland.html",
                    "headshot" : "_images/gerald-toland.jpg",
                    "folderOrder" : 1530242658
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Steven",
                    "lastName" : "Tykwinski",
                    "fullName" : "Steven Tykwinski",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "steven.tykwinski@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/steven-tykwinski.html",
                    "headshot" : "",
                    "folderOrder" : 1536672249
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Renee",
                    "lastName" : "Ullom",
                    "fullName" : "Renee Ullom",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-7246",
                    "email" : "renee.ullom@smsu.edu",
                    "office" : "IL 242",
                                            "link" : "profiles/renee-ullom.html",
                    "headshot" : "_images/renee-ullom.jpg",
                    "folderOrder" : 1543101840
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Scott",
                    "lastName" : "Underwood",
                    "fullName" : "Scott Underwood",
                    "departments" : ["Athletics"],
                    "title" : "Head Football Coach",
                    "phone" : "(507) 537-6699",
                    "email" : "scott.underwood@smsu.edu",
                    "office" : "FH 317",
                                            "link" : "profiles/scott-underwood.html",
                    "headshot" : "_images/scott-underwood.jpg",
                    "folderOrder" : 1549531431
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Matthew",
                    "lastName" : "Vahlsing",
                    "fullName" : "Matthew Vahlsing",
                    "departments" : ["Facilities & Physical Plant", "Residence Life"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "matthew.vahlsing@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/matthew-vahlsing.html",
                    "headshot" : "",
                    "folderOrder" : 1555961022
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Mariah",
                    "lastName" : "Van Asperen",
                    "fullName" : "Mariah Van Asperen",
                    "departments" : ["Intramurals", "Athletics"],
                    "title" : "Assistant Women's Volleyball Coach\/Intramural Director\/Instructor",
                    "phone" : "(507) 537-6696",
                    "email" : "mariah.vanasperen@smsu.edu",
                    "office" : "FH",
                                            "link" : "profiles/mariah-vanasperen.html",
                    "headshot" : "",
                    "folderOrder" : 1562390613
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Ruth",
                    "lastName" : "Van Heukelom",
                    "fullName" : "Ruth Van Heukelom",
                    "departments" : ["Department of Nursing", "Nursing: RN to BSN Program"],
                    "title" : "Assistant Professor",
                    "phone" : "(319) 541-0652",
                    "email" : "ruth.vanheukelom@smsu.edu",
                    "office" : "OFF",
                                            "link" : "profiles/ruth-vanheukelom.html",
                    "headshot" : "",
                    "folderOrder" : 1568820204
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Daren",
                    "lastName" : "Van Keulen",
                    "fullName" : "Daren Van Keulen",
                    "departments" : ["Facilities & Physical Plant", "Residence Life"],
                    "title" : "Groundskeeper",
                    "phone" : "(507) 537-7106",
                    "email" : "daren.vankeulen@smsu.edu",
                    "office" : "MT",
                                            "link" : "profiles/daren-vankeulen.html",
                    "headshot" : "",
                    "folderOrder" : 1575249795
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jackie",
                    "lastName" : "Van Overbeke",
                    "fullName" : "Jackie Van Overbeke",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "jackie.vanoverbeke@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/jackie-vanoverbeke.html",
                    "headshot" : "_images/jackie-vanoverbeke.jpg",
                    "folderOrder" : 1581679386
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Cory",
                    "lastName" : "VanDeVere",
                    "fullName" : "Cory VanDeVere",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "Groundskeeper",
                    "phone" : "(507) 537-7106",
                    "email" : "cory.vandevere@smsu.edu",
                    "office" : "MT",
                                            "link" : "profiles/cory-vandevere.html",
                    "headshot" : "",
                    "folderOrder" : 1588108977
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Debbie",
                    "lastName" : "VanOverbeke",
                    "fullName" : "Debbie VanOverbeke",
                    "departments" : ["Education Program", "Education Graduate Program - Special Ed.", "School of Education"],
                    "title" : "Professor of Education",
                    "phone" : "(507) 537-7120",
                    "email" : "debbie.vanoverbeke@smsu.edu",
                    "office" : "IL 237",
                                            "link" : "profiles/debbie-vanoverbeke.html",
                    "headshot" : "_images/debbie-vanoverbeke.jpg",
                    "folderOrder" : 1594538568
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Elliot",
                    "lastName" : "Vaughan",
                    "fullName" : "Elliot Vaughan",
                    "departments" : ["Department of Science", "GIS Center", "Environmental Science Program"],
                    "title" : "Assistant Professor of Environmental Science",
                    "phone" : "(507) 537-6189",
                    "email" : "elliot.vaughan@smsu.edu",
                    "office" : "SM 171",
                                            "link" : "profiles/elliot-vaughan.html",
                    "headshot" : "_images/elliot-vaughan.jpg",
                    "folderOrder" : 1600968159
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Janel",
                    "lastName" : "Venekamp",
                    "fullName" : "Janel Venekamp",
                    "departments" : ["Human Resources"],
                    "title" : "Human Resources Technician 2",
                    "phone" : "(507) 537-6208",
                    "email" : "janel.venekamp@smsu.edu",
                    "office" : "BA 269",
                                            "link" : "profiles/janel-venekamp.html",
                    "headshot" : "_images/janel-venekamp.jpg",
                    "folderOrder" : 1607397750
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Sonya",
                    "lastName" : "Vierstraete",
                    "fullName" : "Sonya Vierstraete",
                    "departments" : ["School of Education", "Education Program"],
                    "title" : "Professor of Education \/ Department Chair",
                    "phone" : "(507) 537-7254",
                    "email" : "sonya.vierstraete@smsu.edu",
                    "office" : "IL 235",
                                            "link" : "profiles/sonya-vierstraete.html",
                    "headshot" : "_images/sonya-vierstraete.jpg",
                    "folderOrder" : 1613827341
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Emily",
                    "lastName" : "Vos",
                    "fullName" : "Emily Vos",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Success Coach",
                    "phone" : "(507) 537-6478",
                    "email" : "emily.vos@smsu.edu",
                    "office" : "IL 225",
                                            "link" : "profiles/emily-vos.html",
                    "headshot" : "_images/emily-vos.jpg",
                    "folderOrder" : 1620256932
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Marly",
                    "lastName" : "Wagner",
                    "fullName" : "Marly Wagner",
                    "departments" : ["TRiO Upward Bound"],
                    "title" : "Associate Director of Trio Upward Bound",
                    "phone" : "(507) 537-7372",
                    "email" : "marly.wagner@smsu.edu",
                    "office" : "BA 114",
                                            "link" : "profiles/marly-wagner.html",
                    "headshot" : "_images/marly-wagner.jpg",
                    "folderOrder" : 1626686523
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Charlotte",
                    "lastName" : "Wahle",
                    "fullName" : "Charlotte Wahle",
                    "departments" : ["Admission"],
                    "title" : "Director of Admission",
                    "phone" : "(507) 537-7207",
                    "email" : "charlotte.wahle@smsu.edu",
                    "office" : "SC 227",
                                            "link" : "profiles/charlotte-wahle.html",
                    "headshot" : "_images/charlotte-wahle.jpg",
                    "folderOrder" : 1633116114
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Marty",
                    "lastName" : "Wahle",
                    "fullName" : "Marty Wahle",
                    "departments" : ["Education Program", "Swimming Pool", "School of Education", "Athletics"],
                    "title" : "Head Women's Swimming and Diving Coach\/Assistant Professor",
                    "phone" : "(507) 537-7097",
                    "email" : "marty.wahle@smsu.edu",
                    "office" : "PE 229",
                                            "link" : "profiles/marty-wahle.html",
                    "headshot" : "",
                    "folderOrder" : 1639545705
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Benjamin",
                    "lastName" : "Walker",
                    "fullName" : "Benjamin Walker",
                    "departments" : ["Fine Arts and Communication, Department of", "Communication Studies Program"],
                    "title" : "Professor of Communication Studies",
                    "phone" : "(507) 537-6126",
                    "email" : "benjamin.walker@smsu.edu",
                    "office" : "CH 116",
                                            "link" : "profiles/benjamin-walker.html",
                    "headshot" : "_images/ben-walker.jpg",
                    "folderOrder" : 1645975296
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "",
                    "firstName": "Julie",
                    "lastName" : "Walker",
                    "fullName" : "Julie Walker",
                    "departments" : ["LGBTQ Center", "Women's Center", "Fine Arts and Communication, Department of", "Communication Studies Program"],
                    "title" : "Associate Professor of Communication Studies",
                    "phone" : "(507) 537-6393",
                    "email" : "julie.walker@smsu.edu",
                    "office" : "CH 119",
                                            "link" : "profiles/julie-walker.html",
                    "headshot" : "",
                    "folderOrder" : 1652404887
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Ross",
                    "lastName" : "Wastvedt",
                    "fullName" : "Ross Wastvedt",
                    "departments" : ["Provost\/Vice President for Academic and Student Affairs"],
                    "title" : "Provost\/Vice President for Academic and Student Affairs",
                    "phone" : "(507) 537-6246",
                    "email" : "ross.wastvedt@smsu.edu",
                    "office" : "FH 214",
                                            "link" : "profiles/ross-wastvedt.html",
                    "headshot" : "_images/ross-wastvedt.jpg",
                    "folderOrder" : 1658834478
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Tom",
                    "lastName" : "Webb",
                    "fullName" : "Tom Webb",
                    "departments" : ["Education Program", "School of Education", "Athletics"],
                    "title" : "Head Women's Basketball Coach",
                    "phone" : "(507) 537-6035",
                    "email" : "tom.webb@smsu.edu",
                    "office" : "FH 327",
                                            "link" : "profiles/tom-webb.html",
                    "headshot" : "_images/tom-webb.jpg",
                    "folderOrder" : 1665264069
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Ross",
                    "lastName" : "Webskowski",
                    "fullName" : "Ross Webskowski",
                    "departments" : ["Athletics"],
                    "title" : "Associate Director of Athletics, Finance and Operations\/Head Wm's Golf Coach",
                    "phone" : "(507) 537-7220",
                    "email" : "ross.webskowski@smsu.edu",
                    "office" : "FH 311",
                                            "link" : "profiles/ross-webskowski.html",
                    "headshot" : "",
                    "folderOrder" : 1671693660
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Anne",
                    "lastName" : "Wedler",
                    "fullName" : "Anne Wedler",
                    "departments" : ["William Whipple Gallery", "Fine Arts and Communication, Department of", "Art & Design Program"],
                    "title" : "Assistant Professor of Art",
                    "phone" : "(507) 537-7080",
                    "email" : "anne.wedler@smsu.edu",
                    "office" : "BA 144",
                                            "link" : "profiles/anne-wedler.html",
                    "headshot" : "",
                    "folderOrder" : 1678123251
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Christy",
                    "lastName" : "Westfield",
                    "fullName" : "Christy Westfield",
                    "departments" : ["Data Management and Institutional Research"],
                    "title" : "Database\/Programmer Analyst",
                    "phone" : "(507) 537-7178",
                    "email" : "christy.westfield@smsu.edu",
                    "office" : "BA 244",
                                            "link" : "profiles/christy-westfield.html",
                    "headshot" : "",
                    "folderOrder" : 1684552842
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Eric",
                    "lastName" : "White",
                    "fullName" : "Eric White",
                    "departments" : ["Registration and Records"],
                    "title" : "Registrar\/School Certifying Official",
                    "phone" : "(507) 537-6206",
                    "email" : "eric.white@smsu.edu",
                    "office" : "IL 148",
                                            "link" : "profiles/eric-white.html",
                    "headshot" : "_images/eric-white.jpg",
                    "folderOrder" : 1690982433
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mara",
                    "lastName" : "Wiggins",
                    "fullName" : "Mara Wiggins",
                    "departments" : ["McFarland Library"],
                    "title" : "Professor of Library \/ Department Chair",
                    "phone" : "(507) 537-6134",
                    "email" : "mara.wiggins@smsu.edu",
                    "office" : "BA 537",
                                            "link" : "profiles/mara-wiggins.html",
                    "headshot" : "_images/mara-wiggins.jpg",
                    "folderOrder" : 1697412024
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Wije",
                    "lastName" : "Wijesiri",
                    "fullName" : "Wije Wijesiri",
                    "departments" : ["Department of Mathematics and Computer Science", "Mathematics Program"],
                    "title" : "Professor of Math",
                    "phone" : "(507) 537-6456",
                    "email" : "wije.wijesiri@smsu.edu",
                    "office" : "SM 218",
                                            "link" : "profiles/wije-wijesiri.html",
                    "headshot" : "",
                    "folderOrder" : 1703841615
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Cedric",
                    "lastName" : "Williams",
                    "fullName" : "Cedric Williams",
                    "departments" : ["Admission"],
                    "title" : "Admissions Counselor",
                    "phone" : "(507) 537-7438",
                    "email" : "cedric.williams@smsu.edu",
                    "office" : "SC 217",
                                            "link" : "profiles/cedric-williams.html",
                    "headshot" : "_images/cedric-williams.jpg",
                    "folderOrder" : 1710271206
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Tom",
                    "lastName" : "Williford",
                    "fullName" : "Tom Williford",
                    "departments" : ["History Program", "Social Science Department"],
                    "title" : "Professor of History \/ Department Chair",
                    "phone" : "(507) 537-7108",
                    "email" : "tom.williford@smsu.edu",
                    "office" : "CH 129B",
                                            "link" : "profiles/tom-williford.html",
                    "headshot" : "_images/tom-williford.jpg",
                    "folderOrder" : 1716700797
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Judy",
                    "lastName" : "Wilson",
                    "fullName" : "Judy Wilson",
                    "departments" : ["English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Professor of English",
                    "phone" : "(507) 537-7692",
                    "email" : "judy.wilson@smsu.edu",
                    "office" : "BA 204",
                                            "link" : "profiles/judy-wilson.html",
                    "headshot" : "",
                    "folderOrder" : 1723130388
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Lori",
                    "lastName" : "Wynia",
                    "fullName" : "Lori Wynia",
                    "departments" : ["Center of Learning and Teaching (COLT)", "Online Learning & Transfer Partnerships, Office of"],
                    "title" : "Director of Online Learning & Transfer Partnerships",
                    "phone" : "(507) 537-7424",
                    "email" : "lori.wynia@smsu.edu",
                    "office" : "BA 266",
                                            "link" : "profiles/lori-wynia.html",
                    "headshot" : "_images/lori-wynia.jpg",
                    "folderOrder" : 1729559979
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "Dr.",
                    "firstName": "Tanya",
                    "lastName" : "Yerigan",
                    "fullName" : "Tanya Yerigan",
                    "departments" : ["Education Program", "School of Education", "Graduate Learning Community"],
                    "title" : "Professor of Education",
                    "phone" : "(507) 537-7115",
                    "email" : "tanya.yerigan@smsu.edu",
                    "office" : "IL 156",
                                            "link" : "profiles/tanya-yerigan.html",
                    "headshot" : "_images/tanya-yerigan1.jpg",
                    "folderOrder" : 1735989570
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Mary",
                    "lastName" : "Zabel",
                    "fullName" : "Mary Zabel",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7107",
                    "email" : "mary.zabel@smsu.edu",
                    "office" : "CC",
                                            "link" : "profiles/mary-zabel.html",
                    "headshot" : "",
                    "folderOrder" : 1742419161
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Matthew",
                    "lastName" : "Zabka",
                    "fullName" : "Matthew Zabka",
                    "departments" : ["Mathematics Program", "Department of Mathematics and Computer Science"],
                    "title" : "Associate Professor of Mathematics",
                    "phone" : "(507) 537-6056",
                    "email" : "matthew.zabka@smsu.edu",
                    "office" : "SM 227",
                                            "link" : "profiles/matthew-zabka.html",
                    "headshot" : "",
                    "folderOrder" : 1748848752
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Luke",
                    "lastName" : "Bailey",
                    "fullName" : "Luke Bailey",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "luke.bailey@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/luke-bailey.html",
                    "headshot" : "",
                    "folderOrder" : 1755278343
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jerry",
                    "lastName" : "Westrom",
                    "fullName" : "Jerry Westrom",
                    "departments" : ["Residence Life"],
                    "title" : "Assistant Director of Residence Life",
                    "phone" : "",
                    "email" : "jerry.westrom@smsu.edu",
                    "office" : "HC4 105",
                                            "link" : "profiles/jerry-westrom.html",
                    "headshot" : "",
                    "folderOrder" : 1761707934
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Oluleye",
                    "lastName" : "Babatunde",
                    "fullName" : "Oluleye Babatunde",
                    "departments" : ["Computer Science Program", "Department of Mathematics and Computer Science"],
                    "title" : "Assistant Professor of Computer Science",
                    "phone" : "(507) 537-6323",
                    "email" : "oluleye.babatunde@smsu.edu",
                    "office" : "SM 270",
                                            "link" : "profiles/oluleye-babatunde.html",
                    "headshot" : "_images/oluleye-babatunde.jpg",
                    "folderOrder" : 1768137525
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Michela",
                    "lastName" : "Carattini",
                    "fullName" : "Michela Carattini",
                    "departments" : ["Education Program", "Special Education Program"],
                    "title" : "Assistant Professor of Special Education",
                    "phone" : "(507) 537-6906",
                    "email" : "michela.carattini@smsu.edu",
                    "office" : "IL 240",
                                            "link" : "profiles/michela-carattini.html",
                    "headshot" : "_images/michela-carattini.jpg",
                    "folderOrder" : 1774567116
                }
                                                                                                                                                                                                                                                                            ,                 {
                    "prefix": "Dr.",
                    "firstName": "Hui-Heng (Mark)",
                    "lastName" : "Cheng",
                    "fullName" : "Hui-Heng (Mark) Cheng",
                    "departments" : ["Accounting Program", "Finance Program", "North Star Mutual School of Business", "Department of Business Innovation & Strategy"],
                    "title" : "Assistant Professor of Accounting-Finance",
                    "phone" : "(507) 537-7492",
                    "email" : "hui-heng.cheng@smsu.edu",
                    "office" : "ST 207",
                                            "link" : "profiles/hui-heng-cheng.html",
                    "headshot" : "_images/hui-heng-cheng.jpg",
                    "folderOrder" : 1780996707
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Allen",
                    "lastName" : "Deutz",
                    "fullName" : "Allen Deutz",
                    "departments" : ["School of Agriculture", "Agribusiness Management Program", "Department of Agriculture, Culinology and Hospitality Management"],
                    "title" : "Assistant Professor of Economics & Agribusiness",
                    "phone" : "(507) 537-7211",
                    "email" : "allen.deutz.2@smsu.edu",
                    "office" : "ST 261",
                                            "link" : "profiles/allen-deutz-2.html",
                    "headshot" : "",
                    "folderOrder" : 1787426298
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Tarik",
                    "lastName" : "Dobbs",
                    "fullName" : "Tarik Dobbs",
                    "departments" : ["Department of English, Philosophy, Spanish and Humanities", "English Program"],
                    "title" : "Assistant Professor of English",
                    "phone" : "(507) 537-7121",
                    "email" : "tarik.dobbs@smsu.edu",
                    "office" : "BA 217",
                                            "link" : "profiles/tarik-dobbs.html",
                    "headshot" : "",
                    "folderOrder" : 1793855889
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Bailey",
                    "lastName" : "Johnson",
                    "fullName" : "Bailey Johnson",
                    "departments" : ["Human Resources"],
                    "title" : "Human Resources Specialist 2",
                    "phone" : "(507) 537-6596",
                    "email" : "bailey.johnson.2@smsu.edu",
                    "office" : "BA 271",
                                            "link" : "profiles/bailey-johnson-2.html",
                    "headshot" : "_images/bailey-johnson-2.jpg",
                    "folderOrder" : 1800285480
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Bridget",
                    "lastName" : "Kelly",
                    "fullName" : "Bridget Kelly",
                    "departments" : ["Environmental Science Program", "Department of Science"],
                    "title" : "Assistant Professor of Science\/Environmental Science",
                    "phone" : "(507) 537-7268",
                    "email" : "bridget.kelly@smsu.edu",
                    "office" : "SM 118",
                                            "link" : "profiles/bridget-kelly.html",
                    "headshot" : "",
                    "folderOrder" : 1806715071
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Laura",
                    "lastName" : "Mueller-Anderson",
                    "fullName" : "Laura Mueller-Anderson",
                    "departments" : ["Social Work Program", "Social Science Department"],
                    "title" : "Assistant Professor of Social Work",
                    "phone" : "(507) 537-7576",
                    "email" : "laura.mueller-anderson@smsu.edu",
                    "office" : "CH 101B",
                                            "link" : "profiles/laura-mueller-anderson.html",
                    "headshot" : "",
                    "folderOrder" : 1813144662
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Taleen",
                    "lastName" : "Nalabandian",
                    "fullName" : "Taleen Nalabandian",
                    "departments" : ["Social Science Department", "Psychology Program"],
                    "title" : "Assistant Professor of Psychology",
                    "phone" : "(507) 537-6361",
                    "email" : "taleen.nalabandian@smsu.edu",
                    "office" : "CH 127B",
                                            "link" : "profiles/taleen-nalabandian.html",
                    "headshot" : "",
                    "folderOrder" : 1819574253
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Bamidele",
                    "lastName" : "Odubote",
                    "fullName" : "Bamidele Odubote",
                    "departments" : ["Social Science Department", "Sociology Program"],
                    "title" : "Assistant Professor of Sociology",
                    "phone" : "(507) 537-6540",
                    "email" : "bamidele.odubote@smsu.edu",
                    "office" : "CH 215",
                                            "link" : "profiles/bamidele-odubote.html",
                    "headshot" : "_images/bamidele-odubote.jpg",
                    "folderOrder" : 1826003844
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Motunrayo",
                    "lastName" : "Ogunrinbokun",
                    "fullName" : "Motunrayo Ogunrinbokun",
                    "departments" : ["English Program", "Department of English, Philosophy, Spanish and Humanities"],
                    "title" : "Assistant Professor of English",
                    "phone" : "(507) 537-6293",
                    "email" : "motunrayo.ogunrinbokun@smsu.edu",
                    "office" : "BA 205",
                                            "link" : "profiles/motunrayo-ogunrinbokun.html",
                    "headshot" : "",
                    "folderOrder" : 1832433435
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Kelly",
                    "lastName" : "Thelen",
                    "fullName" : "Kelly Thelen",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-6483",
                    "email" : "kelly.thelen.2@smsu.edu",
                    "office" : "IL 231",
                                            "link" : "profiles/kelly-thelen-2.html",
                    "headshot" : "_images/kelly-thelen-2.jpg",
                    "folderOrder" : 1838863026
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Julia",
                    "lastName" : "Ugorji",
                    "fullName" : "Julia Ugorji",
                    "departments" : ["Department of Nursing", "Nursing: RN to BSN Program"],
                    "title" : "Assistant Professor of Nursing",
                    "phone" : "(507) 537-6350",
                    "email" : "julia.ugorji.2@smsu.edu",
                    "office" : "SM 161",
                                            "link" : "profiles/julia-ugorji-2.html",
                    "headshot" : "",
                    "folderOrder" : 1845292617
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Michael",
                    "lastName" : "Van Drehle",
                    "fullName" : "Michael Van Drehle",
                    "departments" : ["Management Program", "Department of Business Innovation & Strategy", "North Star Mutual School of Business"],
                    "title" : "Assistant Professor of Management",
                    "phone" : "(507) 537-6297",
                    "email" : "michael.vandrehle@smsu.edu",
                    "office" : "ST 215",
                                            "link" : "profiles/michael-vandrehle.html",
                    "headshot" : "_images/michael-vandrehle.jpg",
                    "folderOrder" : 1851722208
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Annamalai",
                    "lastName" : "Alagappan",
                    "fullName" : "Annamalai Alagappan",
                    "departments" : ["Department of Mathematics and Computer Science", "Computer Science Program"],
                    "title" : "Associate Professor of Computer Science ",
                    "phone" : "(507) 537-6288",
                    "email" : "annamalai.alagappan@smsu.edu",
                    "office" : "SM 267",
                                            "link" : "profiles/annamalai-alagappan.html",
                    "headshot" : "_images/annamalai-alagappan.jpg",
                    "folderOrder" : 1858151799
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Quinn",
                    "lastName" : "Bullard",
                    "fullName" : "Quinn Bullard",
                    "departments" : ["University Public Safety"],
                    "title" : "Associate Director of Public Safety",
                    "phone" : "(507) 537-6693",
                    "email" : "quinn.bullard.2@smsu.edu",
                    "office" : "FH 107",
                                            "link" : "profiles/quinn-bullard-2.html",
                    "headshot" : "",
                    "folderOrder" : 1864581390
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Alex",
                    "lastName" : "Dequaine",
                    "fullName" : "Alex Dequaine",
                    "departments" : ["University Public Safety"],
                    "title" : "Campus Security Officer",
                    "phone" : "(507) 537-7380",
                    "email" : "alex.dequaine.2@smsu.edu",
                    "office" : "FH 112",
                                            "link" : "profiles/alex-dequaine-2.html",
                    "headshot" : "_images/alex-dequaine-2.jpg",
                    "folderOrder" : 1871010981
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Carlie",
                    "lastName" : "Timm",
                    "fullName" : "Carlie Timm",
                    "departments" : ["Social Work Program", "Social Science Department"],
                    "title" : "Assistant Professor of Social Work",
                    "phone" : "(507) 537-7047",
                    "email" : "carlie.timm@smsu.edu",
                    "office" : "CH 101A",
                                            "link" : "profiles/carlie-timm.html",
                    "headshot" : "_images/carlie-timm.jpg",
                    "folderOrder" : 1877440572
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Anders",
                    "lastName" : "Rydholm",
                    "fullName" : "Anders Rydholm",
                    "departments" : ["Communications and Marketing", "Web Office"],
                    "title" : "Web Designer",
                    "phone" : "(507) 537-6345",
                    "email" : "anders.rydholm@smsu.edu",
                    "office" : "FH 15",
                                            "link" : "profiles/anders-rydholm.html",
                    "headshot" : "_images/anders-rydholm.jpg",
                    "folderOrder" : 1883870163
                }
                                                                                                                                                                                                                                        ,                 {
                    "prefix": "",
                    "firstName": "Denise",
                    "lastName" : "Gochenouer",
                    "fullName" : "Denise Gochenouer",
                    "departments" : ["North Star Mutual School of Business", "Marketing Program", "Department of Business Innovation & Strategy"],
                    "title" : "Professor of Marketing \/ Department Chair",
                    "phone" : "(507) 537-6194",
                    "email" : "denise.gochenouer@smsu.edu",
                    "office" : "ST 203C",
                                            "link" : "profiles/denise-gochenouer.html",
                    "headshot" : "_images/denise-gochenouer.jpg",
                    "folderOrder" : 1890299754
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Abygail",
                    "lastName" : "Goldtrap",
                    "fullName" : "Abygail Goldtrap",
                    "departments" : ["Online Learning & Transfer Partnerships, Office of"],
                    "title" : "Online Learning Coordinator",
                    "phone" : "(507) 537-7276",
                    "email" : "abygail.goldtrap@smsu.edu",
                    "office" : "BA 249",
                                            "link" : "profiles/abygail-goldtrap.html",
                    "headshot" : "_images/abygail-goldtrap.jpg",
                    "folderOrder" : 1896729345
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Eryn",
                    "lastName" : "Ische",
                    "fullName" : "Eryn Ische",
                    "departments" : ["Information Technology Services"],
                    "title" : "Instructional Technology Specialist",
                    "phone" : "(507) 537-6582",
                    "email" : "eryn.ische@smsu.edu",
                    "office" : "OFF ",
                                            "link" : "profiles/eryn-ische.html",
                    "headshot" : "_images/eryn-ische.jpg",
                    "folderOrder" : 1903158936
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Justin",
                    "lastName" : "Guggisberg",
                    "fullName" : "Justin Guggisberg",
                    "departments" : ["Veterans Resource Center"],
                    "title" : "Regional Veterans Service Coordinator",
                    "phone" : "(507) 537-7213",
                    "email" : "justin.guggisberg@smsu.edu",
                    "office" : "BA 140",
                                            "link" : "profiles/justin-guggisberg.html",
                    "headshot" : "",
                    "folderOrder" : 1909588527
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Sarah",
                    "lastName" : "Brown",
                    "fullName" : "Sarah Brown",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Coordinator of Academic Support & New Student Engagement",
                    "phone" : "(507) 537-7216",
                    "email" : "sarah.brown@smsu.edu",
                    "office" : "IL 224D",
                                            "link" : "profiles/sarah-brown.html",
                    "headshot" : "_images/sarah-brown.jpg",
                    "folderOrder" : 1916018118
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Zoe",
                    "lastName" : "Hess",
                    "fullName" : "Zoe Hess",
                    "departments" : ["Social Science Department", "Psychology Program"],
                    "title" : "Psychology Instructor",
                    "phone" : "(507) 537-7585",
                    "email" : "zoe.hess.2@smsu.edu",
                    "office" : "BA 143",
                                            "link" : "profiles/zoe-hess.html",
                    "headshot" : "",
                    "folderOrder" : 1922447709
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Clayton",
                    "lastName" : "Peterson",
                    "fullName" : "Clayton Peterson",
                    "departments" : ["Facilities & Physical Plant"],
                    "title" : "General Maintenance Worker",
                    "phone" : "(507) 537-7205",
                    "email" : "clayton.peterson@smsu.edu",
                    "office" : "BA 209",
                                            "link" : "profiles/clayton-peterson.html",
                    "headshot" : "",
                    "folderOrder" : 1928877300
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jamie",
                    "lastName" : "Struck",
                    "fullName" : "Jamie Struck",
                    "departments" : ["Fine Arts and Communication, Department of"],
                    "title" : "Office & Administrative Specialist, Sr.",
                    "phone" : "507-537-7212",
                    "email" : "jamie.struck@smsu.edu",
                    "office" : "FA 207",
                                            "link" : "profiles/jamie-struck.html",
                    "headshot" : "",
                    "folderOrder" : 1935306891
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Elizabeth",
                    "lastName" : "Fladhammer",
                    "fullName" : "Elizabeth Fladhammer",
                    "departments" : ["McFarland Library"],
                    "title" : "Library Technician \/ Interlibrary Loan Technician",
                    "phone" : "(507) 537-6158",
                    "email" : "liz.fladhammer@smsu.edu",
                    "office" : "BA 299A",
                                            "link" : "profiles/elizabeth-fladhammer.html",
                    "headshot" : "",
                    "folderOrder" : 1941736482
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Soren",
                    "lastName" : "Rothstein",
                    "fullName" : "Soren Rothstein",
                    "departments" : ["Information Technology Services"],
                    "title" : "Information Technology Specialist 1",
                    "phone" : "(507) 537-7288",
                    "email" : "soren.rothstein@smsu.edu",
                    "office" : "BA 176",
                                            "link" : "profiles/soren-rothstein.html",
                    "headshot" : "_images/soren-rothstein.jpg",
                    "folderOrder" : 1948166073
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Josh",
                    "lastName" : "Cox",
                    "fullName" : "Josh Cox",
                    "departments" : ["Financial Aid"],
                    "title" : "Assistant Director of Financial Aid",
                    "phone" : "507-537-6426",
                    "email" : "joshua.cox@smsu.edu",
                    "office" : "IL 145B",
                                            "link" : "profiles/josh-cox.html",
                    "headshot" : "",
                    "folderOrder" : 1954595664
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "David",
                    "lastName" : "Jones",
                    "fullName" : "David Jones",
                    "departments" : ["President's Office"],
                    "title" : "President",
                    "phone" : "(507) 537-6272",
                    "email" : "david.jones@smsu.edu",
                    "office" : "FH 209",
                                            "link" : "profiles/david-jones.html",
                    "headshot" : "_images/david-jones.jpg",
                    "folderOrder" : 1961025255
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kyle",
                    "lastName" : "Luedtke",
                    "fullName" : "Kyle Luedtke",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Men's Basketball Coach",
                    "phone" : "",
                    "email" : "kyle.luedtke@smsu.edu",
                    "office" : "",
                                            "link" : "profiles/kyle-luedtke.html",
                    "headshot" : "",
                    "folderOrder" : 1967454846
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Michael",
                    "lastName" : "Dunn",
                    "fullName" : "Michael Dunn",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Track & Field Coach",
                    "phone" : "(507) 537-7255",
                    "email" : "michael.dunn@smsu.edu",
                    "office" : "PE 231",
                                            "link" : "profiles/michael-dunn.html",
                    "headshot" : "_images/headshot.png",
                    "folderOrder" : 1973884437
                }
                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Vacant",
                    "lastName" : "Position",
                    "fullName" : "Vacant Position",
                    "departments" : [""],
                    "title" : "Assistant Director Student Activities",
                    "phone" : "",
                    "email" : "",
                    "office" : "",
                                            "link" : "profiles/position-vacancy.html",
                    "headshot" : "_images/headshot.png",
                    "folderOrder" : 1980314028
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "David",
                    "lastName" : "Juarez",
                    "fullName" : "David Juarez",
                    "departments" : ["Athletics"],
                    "title" : "Assistant Women's Soccer Coach",
                    "phone" : "(507) 537-6561",
                    "email" : "david.juarez@smsu.edu",
                    "office" : "FH 301",
                                            "link" : "profiles/david-juarez.html",
                    "headshot" : "",
                    "folderOrder" : 1993173210
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Shawn",
                    "lastName" : "Carlson",
                    "fullName" : "Shawn Carlson",
                    "departments" : ["Psychology Program", "Social Science Department"],
                    "title" : "Assistant Professor of Psychology",
                    "phone" : "(507) 537-6256",
                    "email" : "shawn.carlson@smsu.edu",
                    "office" : "CH 127A",
                                            "link" : "profiles/shawn-carlson.html",
                    "headshot" : "",
                    "folderOrder" : 1999602801
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Lori",
                    "lastName" : "Matthys",
                    "fullName" : "Lori Matthys",
                    "departments" : ["Registration and Records"],
                    "title" : "Registration Specialist",
                    "phone" : "507-537-6469",
                    "email" : "lori.matthys@smsu.edu",
                    "office" : "IL 148",
                                            "link" : "profiles/lori-matthys.html",
                    "headshot" : "",
                    "folderOrder" : 2006032392
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Joshua",
                    "lastName" : "Hill",
                    "fullName" : "Joshua Hill",
                    "departments" : ["Education Program"],
                    "title" : "Assistant Professor of Education",
                    "phone" : "(507) 537-7173",
                    "email" : "joshua.hill@smsu.edu",
                    "office" : "IL 162",
                                            "link" : "profiles/joshua-hill.html",
                    "headshot" : "_images/joshua-hill.jpg",
                    "folderOrder" : 2012461983
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Anna",
                    "lastName" : "Hesse",
                    "fullName" : "Anna Hesse",
                    "departments" : ["Education Program"],
                    "title" : "Assistant Professor of Special Education",
                    "phone" : "(507) 537-6801",
                    "email" : "anna.hesse.2@smsu.edu",
                    "office" : "IL 241",
                                            "link" : "profiles/anna-hesse.html",
                    "headshot" : "_images/anna-hesse-2.jpg",
                    "folderOrder" : 2018891574
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Brooke",
                    "lastName" : "Tader",
                    "fullName" : "Brooke Tader",
                    "departments" : ["Biology Program", "Department of Science"],
                    "title" : "Assistant Professor of Biology",
                    "phone" : "(507) 537-7293",
                    "email" : "brooke.tader@smsu.edu",
                    "office" : "SM 132",
                                            "link" : "profiles/brooke-tader.html",
                    "headshot" : "_images/brooke-tader.jpg",
                    "folderOrder" : 2025321165
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Madeleine",
                    "lastName" : "Schense",
                    "fullName" : "Madeleine Schense",
                    "departments" : ["McFarland Library"],
                    "title" : "Outreach Services Librarian",
                    "phone" : "(507) 537-6471",
                    "email" : "madeleine.schense@smsu.edu",
                    "office" : "BA 539",
                                            "link" : "profiles/madeleine-schense.html",
                    "headshot" : "",
                    "folderOrder" : 2031750756
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Denitsa",
                    "lastName" : "Girard",
                    "fullName" : "Denitsa Girard",
                    "departments" : ["Human Resources"],
                    "title" : "Human Resources Business Partner",
                    "phone" : "(507) 537-6431",
                    "email" : "denitsa.girard@smsu.edu",
                    "office" : "BA 271",
                                            "link" : "profiles/denitsa-girard.html",
                    "headshot" : "_images/denitsa-dobreva-2.jpg",
                    "folderOrder" : 2038180347
                }
                                                                                                                                                                ,                 {
                    "prefix": "Dr.",
                    "firstName": "Morgen",
                    "lastName" : "Nations",
                    "fullName" : "Morgen Nations",
                    "departments" : ["Finance Program"],
                    "title" : "Assistant Professor of Finance",
                    "phone" : "(507) 537-6695",
                    "email" : "morgen.nations@smsu.edu",
                    "office" : "ST 103",
                                            "link" : "profiles/morgen-nations.html",
                    "headshot" : "",
                    "folderOrder" : 2044609938
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jason",
                    "lastName" : "Eden",
                    "fullName" : "Jason Eden",
                    "departments" : ["Social Science Department", "History Program"],
                    "title" : "Professor of History",
                    "phone" : "(507) 537-6322",
                    "email" : "jason.eden@smsu.edu",
                    "office" : "CH 213",
                                            "link" : "profiles/jason-eden.html",
                    "headshot" : "",
                    "folderOrder" : 2051039529
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Aniket",
                    "lastName" : "Naik",
                    "fullName" : "Aniket Naik",
                    "departments" : ["Department of Business Innovation & Strategy", "Accounting Program"],
                    "title" : "Assistant Professor of Accounting",
                    "phone" : "(507) 537-6258",
                    "email" : "aniket.naik@smsu.edu",
                    "office" : "ST 153",
                                            "link" : "profiles/aniket-naik.html",
                    "headshot" : "",
                    "folderOrder" : 2057469120
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Travis",
                    "lastName" : "Whipple",
                    "fullName" : "Travis Whipple",
                    "departments" : ["Athletics"],
                    "title" : "VP of Athletics",
                    "phone" : "(507) 537-6421",
                    "email" : "Travis.Whipple@smsu.edu",
                    "office" : "FH 323",
                                            "link" : "profiles/travis-whipple.html",
                    "headshot" : "_images/travis-whipple.jpg",
                    "folderOrder" : 2063898711
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Michael",
                    "lastName" : "Van Keulen",
                    "fullName" : "Michael Van Keulen",
                    "departments" : ["Deeann Griebel Student Success Center"],
                    "title" : "Associate Director of Student Success",
                    "phone" : "(507) 537-6430",
                    "email" : "michael.vankeulen@smsu.edu",
                    "office" : "IL 224E",
                                            "link" : "profiles/michael-vankeulen.html",
                    "headshot" : "_images/michael-vankeulen.jpg",
                    "folderOrder" : 2070328302
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Shoua",
                    "lastName" : "Yang",
                    "fullName" : "Shoua Yang",
                    "departments" : ["Social Science Department", "Political Science Program"],
                    "title" : "Professor of Political Science",
                    "phone" : "(507) 537-6640",
                    "email" : "shoua.yang@smsu.edu",
                    "office" : "CH 107A",
                                            "link" : "profiles/shoua-yang.html",
                    "headshot" : "_images/shoua-yang.jpg",
                    "folderOrder" : 2076757893
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "Dr.",
                    "firstName": "Phillip",
                    "lastName" : "Roundtree",
                    "fullName" : "Phillip Roundtree",
                    "departments" : ["Social Science Department", "Social Work Program"],
                    "title" : "Assistant Professor of Social Work",
                    "phone" : "(507) 537-7014",
                    "email" : "phillip.roundtree@smsu.edu",
                    "office" : "OFF ",
                                            "link" : "profiles/phillip-roundtree.html",
                    "headshot" : "",
                    "folderOrder" : 2083187484
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Brent",
                    "lastName" : "Lamfers",
                    "fullName" : "Brent Lamfers",
                    "departments" : ["Data Management and Institutional Research"],
                    "title" : "Information Technology Specialist 2 - Data Systems",
                    "phone" : "(507) 537-7183",
                    "email" : "brent.lamfers@smsu.edu",
                    "office" : "BA 248",
                                            "link" : "profiles/brent-lamfers.html",
                    "headshot" : "",
                    "folderOrder" : 2089617075
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "John",
                    "lastName" : "Sterner",
                    "fullName" : "John Sterner",
                    "departments" : ["Fine Arts and Communication, Department of", "Art & Design Program"],
                    "title" : "Assistant Professor of Art",
                    "phone" : "(507) 537-7217",
                    "email" : "john.sterner@smsu.edu",
                    "office" : "BA 101B",
                                            "link" : "profiles/john-sterner.html",
                    "headshot" : "_images/john-sterner.jpg",
                    "folderOrder" : 2096046666
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Jalonta",
                    "lastName" : "Jackson-Glasco",
                    "fullName" : "Jalonta Jackson-Glasco",
                    "departments" : ["Social Work Program", "Social Science Department"],
                    "title" : "Assistant Professor of Social Work",
                    "phone" : "(507) 537-7356",
                    "email" : "jalonta.jackson-glasco@smsu.edu",
                    "office" : "OFF",
                                            "link" : "profiles/jalonta-jackson-glasco.html",
                    "headshot" : "",
                    "folderOrder" : 2102476257
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Lauren",
                    "lastName" : "Mellenthin",
                    "fullName" : "Lauren Mellenthin",
                    "departments" : ["Education Program", "School of Education"],
                    "title" : "Administrative Assistant to the Office of Placement & Licensure",
                    "phone" : "(507) 537-6370",
                    "email" : "lauren.mellenthin@smsu.edu",
                    "office" : "IL 150A",
                                            "link" : "profiles/lauren-mellenthin.html",
                    "headshot" : "_images/lauren-mellenthin.jpg",
                    "folderOrder" : 2108905848
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Reid",
                    "lastName" : "Perry",
                    "fullName" : "Reid Perry",
                    "departments" : ["Department of Science", "Exercise Science Program"],
                    "title" : "Assistant Professor of Exercise Science",
                    "phone" : "(507) 537-6178",
                    "email" : "reid.perry@nhcc.edu",
                    "office" : "OFF",
                                            "link" : "profiles/reid-perry.html",
                    "headshot" : "",
                    "folderOrder" : 2115335439
                }
                                                                                                                                                                                                    ,                 {
                    "prefix": "",
                    "firstName": "Sean",
                    "lastName" : "Howk",
                    "fullName" : "Sean Howk",
                    "departments" : ["Athletics", "Scheduling and Event Planning"],
                    "title" : "Assistant Athletic Director for Event Operations & Ticketing",
                    "phone" : "(507) 537-7224",
                    "email" : "sean.howk@smsu.edu",
                    "office" : "FH 308B",
                                            "link" : "profiles/sean-howk.html",
                    "headshot" : "",
                    "folderOrder" : 2121765030
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jason",
                    "lastName" : "Kingstrom",
                    "fullName" : "Jason Kingstrom",
                    "departments" : ["Information Technology Services"],
                    "title" : "TRC Manager",
                    "phone" : "(507) 537-6437",
                    "email" : "jason.kingstrom@smsu.edu",
                    "office" : "BA 289",
                                            "link" : "profiles/jason-kingstrom.html",
                    "headshot" : "",
                    "folderOrder" : 2128194621
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Kim",
                    "lastName" : "Guenther",
                    "fullName" : "Kim Guenther",
                    "departments" : ["Foundation"],
                    "title" : "Assistant Director of Development",
                    "phone" : "(507) 537-6818",
                    "email" : "kim.guenther@smsu.edu",
                    "office" : "FH 220",
                                            "link" : "profiles/kim-guenther.html",
                    "headshot" : "",
                    "folderOrder" : 2134624212
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Leslie",
                    "lastName" : "Hart",
                    "fullName" : "Leslie Hart",
                    "departments" : ["President's Office"],
                    "title" : "Executive Assistant to the President and Provost",
                    "phone" : "( 507) 537-6396",
                    "email" : "leslie.hart@smsu.edu",
                    "office" : "FH 209",
                                            "link" : "profiles/leslie-hart.html",
                    "headshot" : "",
                    "folderOrder" : 2141053803
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Lizzy",
                    "lastName" : "Reiss",
                    "fullName" : "Lizzy Reiss",
                    "departments" : ["Foundation"],
                    "title" : "Accounting Officer",
                    "phone" : "(507) 537-6468",
                    "email" : "lizzy.reiss@smsu.edu",
                    "office" : "FH 228",
                                            "link" : "profiles/lizzy-reiss.html",
                    "headshot" : "",
                    "folderOrder" : 2144268725
                }
                                                                                                                                                                ,                 {
                    "prefix": "",
                    "firstName": "Jeffrey",
                    "lastName" : "Bell",
                    "fullName" : "Jeffrey Bell",
                    "departments" : ["Exercise Science Program"],
                    "title" : "Professor of Exercise Science",
                    "phone" : "(507) 537-6427",
                    "email" : "jeffrey.bell@smsu.edu",
                    "office" : "PE 225",
                                            "link" : "profiles/jeffrey-bell.html",
                    "headshot" : "",
                    "folderOrder" : 2145876186
                }
                        ],
"departments": {
                                                                        "Academic Affairs": {
                "name": "Academic Affairs",
                "page": "",
                "location": {
                    "line1": "FH 214",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6246",
                            "url": "tel:+5075376246",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "academicaffairs@smsu.edu",
                            "url": "mailto:academicaffairs@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/academicaffairs/",
                            "url": "https://www.smsu.edu/administration/academicaffairs/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Access Opportunity Success": {
                "name": "Access Opportunity Success",
                "page": "accessopportunitysuccess.html",
                "location": {
                    "line1": "Commons East",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6169",
                            "url": "tel:+5075376169",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6027",
                            "url": "tel:+5075376027",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "aos@smsu.edu",
                            "url": "mailto:aos@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/accessopportunitysuccess/",
                            "url": "https://www.smsu.edu/campuslife/accessopportunitysuccess/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Accessibility Services": {
                "name": "Accessibility Services",
                "page": "accessibility.html",
                "location": {
                    "line1": "IL 220",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "Office: (507) 537-6492",
                            "url": "tel:+5075376492",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "Fax: (507) 537-6216",
                            "url": "tel:+5075376216",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "accessibilityservices@smsu.edu",
                            "url": "mailto:accessibilityservices@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/accessibility/",
                            "url": "https://www.smsu.edu/accessibility/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Accounting Program": {
                "name": "Accounting Program",
                "page": "accounting.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/accounting/",
                            "url": "https://www.smsu.edu/academics/programs/accounting/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Admission": {
                "name": "Admission",
                "page": "admission.html",
                "location": {
                    "line1": "SC 217",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6286",
                            "url": "tel:+5075376286",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "admission@smsu.edu",
                            "url": "mailto:admission@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/admission/",
                            "url": "https://www.smsu.edu/admission/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Affirmative Action": {
                "name": "Affirmative Action",
                "page": "affirmativeaction.html",
                "location": {
                    "line1": "BA 269",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7500",
                            "url": "tel:+5075377500",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6812",
                            "url": "tel:+5075376812",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "affirmativeaction@smsu.edu",
                            "url": "mailto:affirmativeaction@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/affirmativeaction/",
                            "url": "https://www.smsu.edu/administration/affirmativeaction/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Agribusiness Management Program": {
                "name": "Agribusiness Management Program",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/agribusinessmanagement/",
                            "url": "https://www.smsu.edu/academics/programs/agribusinessmanagement/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Agricultural Communications and Leadership": {
                "name": "Agricultural Communications and Leadership",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/agcommunicationsandleadership/",
                            "url": "https://www.smsu.edu/academics/programs/agcommunicationsandleadership/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Agricultural Education": {
                "name": "Agricultural Education",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/ageducation/",
                            "url": "https://www.smsu.edu/academics/programs/ageducation/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Agricultural Solutions": {
                "name": "Agricultural Solutions",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/agsolutions/",
                            "url": "https://www.smsu.edu/academics/programs/agsolutions/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Agronomy Program": {
                "name": "Agronomy Program",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/agronomy/",
                            "url": "https://www.smsu.edu/academics/programs/agronomy/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Anthropology Program": {
                "name": "Anthropology Program",
                "page": "",
                "location": {
                    "line1": "SS 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/anthropology/",
                            "url": "https://www.smsu.edu/academics/programs/anthropology/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Barnes and Noble Campus Bookstore": {
                "name": "Barnes and Noble Campus Bookstore",
                "page": "bookstore.html",
                "location": {
                    "line1": "SC 101",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 337-1450",
                            "url": "tel:+5073371450",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 337-0352",
                            "url": "tel:+5073370352",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "tplante@bncollege.com",
                            "url": "mailto:tplante@bncollege.com",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "https://smsu.bncollege.com/",
                            "url": "https://smsu.bncollege.com/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Biology Program": {
                "name": "Biology Program",
                "page": "biology.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/biology/",
                            "url": "https://www.smsu.edu/academics/programs/biology/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Business Graduate Program": {
                "name": "Business Graduate Program",
                "page": "business.html",
                "location": {
                    "line1": "ST 203C",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6194",
                            "url": "tel:+5075376194",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduatebusiness@smsu.edu",
                            "url": "mailto:graduatebusiness@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/graduatestudies/",
                            "url": "https://www.smsu.edu/graduatestudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Business Services": {
                "name": "Business Services",
                "page": "businessservices.html",
                "location": {
                    "line1": "IL 139",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7117",
                            "url": "tel:+5075377117",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "business.services@smsu.edu",
                            "url": "mailto:business.services@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/businessservices/",
                            "url": "https://www.smsu.edu/administration/businessservices/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Campus Dining and Catering": {
                "name": "Campus Dining and Catering",
                "page": "",
                "location": {
                    "line1": "SC 143",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7524",
                            "url": "tel:+5075377524",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 532-6872",
                            "url": "tel:+5075326872",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "catering@smsu.edu",
                            "url": "mailto:catering@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "http://www.dineoncampus.com/southwest/",
                            "url": "http://www.dineoncampus.com/southwest/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Campus Religious Center": {
                "name": "Campus Religious Center",
                "page": "campusreligiouscenter.html",
                "location": {
                    "line1": "1418 Birch Street Marshall, MN",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 532-5731",
                            "url": "tel:+5075325731",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "crc@smsu.edu",
                            "url": "mailto:crc@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/campusreligiouscenter/",
                            "url": "https://www.smsu.edu/campuslife/campusreligiouscenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Career Services": {
                "name": "Career Services",
                "page": "careerservices.html",
                "location": {
                    "line1": "BA 156",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6221",
                            "url": "tel:+5075376221",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-7979",
                            "url": "tel:+5075377979",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "careers@smsu.edu",
                            "url": "mailto:careers@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/careerservices/",
                            "url": "https://www.smsu.edu/campuslife/careerservices/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Center for International Education": {
                "name": "Center for International Education",
                "page": "centerforinternationaleducation.html",
                "location": {
                    "line1": "SC 237",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6018",
                            "url": "tel:+5075376018",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "cie@smsu.edu",
                            "url": "mailto:cie@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/centerforinternationaleducation/",
                            "url": "https://www.smsu.edu/campuslife/centerforinternationaleducation/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Center of Innovation and Entrepreneurship": {
                "name": "Center of Innovation and Entrepreneurship",
                "page": "innovationentrepreneurship.html",
                "location": {
                    "line1": "ST 201-203",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "ciesw@smsu.edu",
                            "url": "mailto:ciesw@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/innovationentrepreneurship/",
                            "url": "https://www.smsu.edu/academics/innovationentrepreneurship/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Chemistry Program": {
                "name": "Chemistry Program",
                "page": "chemistry.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/chemistry/",
                            "url": "https://www.smsu.edu/academics/programs/chemistry/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Chief Information Officer": {
                "name": "Chief Information Officer",
                "page": "cio.html",
                "location": {
                    "line1": "BA 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6978",
                            "url": "tel:+5075376978",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "cio@smsu.edu",
                            "url": "mailto:cio@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/cio/",
                            "url": "https://www.smsu.edu/administration/cio/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Child Care Center": {
                "name": "Child Care Center",
                "page": "childcare.html",
                "location": {
                    "line1": "1502 Birch Street Marshall",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6014",
                            "url": "tel:+5075376014",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "karidahl46@hotmail.com",
                            "url": "mailto:karidahl46@hotmail.com",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/childcare/",
                            "url": "https://www.smsu.edu/campuslife/childcare/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "College Now": {
                "name": "College Now",
                "page": "collegenow.html",
                "location": {
                    "line1": "BA 268",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6708",
                            "url": "tel:+5075376708",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "collegenow@smsu.edu",
                            "url": "mailto:collegenow@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/collegenow/",
                            "url": "https://www.smsu.edu/academics/collegenow/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Committee on Institutional Assessment": {
                "name": "Committee on Institutional Assessment",
                "page": "",
                "location": {
                    "line1": "ST 159",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6441",
                            "url": "tel:+5075376441",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "assessment@smsu.edu",
                            "url": "mailto:assessment@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/committees/cia/",
                            "url": "https://www.smsu.edu/administration/committees/cia/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Communication Studies Program": {
                "name": "Communication Studies Program",
                "page": "communicationstudies.html",
                "location": {
                    "line1": "FA 207",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7103",
                            "url": "tel:+5075377103",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fineartscommunications@smsu.edu",
                            "url": "mailto:fineartscommunications@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/communicationstudies/",
                            "url": "https://www.smsu.edu/academics/programs/communicationstudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Communications and Marketing": {
                "name": "Communications and Marketing",
                "page": "communicationsmarketing.html",
                "location": {
                    "line1": "FH Basement",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6255",
                            "url": "tel:+5075376255",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "communications@smsu.edu",
                            "url": "mailto:communications@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/communicationsmarketing/",
                            "url": "https://www.smsu.edu/administration/communicationsmarketing/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Computer Science Program": {
                "name": "Computer Science Program",
                "page": "computerscience.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mathcs@smsu.edu",
                            "url": "mailto:mathcs@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/computerscience/",
                            "url": "https://www.smsu.edu/academics/programs/computerscience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Credentialing Education Courses": {
                "name": "Credentialing Education Courses",
                "page": "credentialingeducationcourses.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 420-0620",
                            "url": "tel:+5074200620",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "patricia.linehan@smsu.edu",
                            "url": "mailto:patricia.linehan@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/credentialingeducationcourses/",
                            "url": "https://www.smsu.edu/academics/programs/credentialingeducationcourses/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Criminal Justice Program": {
                "name": "Criminal Justice Program",
                "page": "",
                "location": {
                    "line1": "SS 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "credentialing@smsu.edu",
                            "url": "mailto:credentialing@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/justiceadministration/",
                            "url": "https://www.smsu.edu/academics/programs/justiceadministration/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Culinology Program": {
                "name": "Culinology Program",
                "page": "culinology.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6462",
                            "url": "tel:+5075376462",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "culinology@smsu.edu",
                            "url": "mailto:culinology@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/culinology/",
                            "url": "https://www.smsu.edu/academics/programs/culinology/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Data Management and Institutional Research": {
                "name": "Data Management and Institutional Research",
                "page": "datamanagementinstitutionalresearch.html",
                "location": {
                    "line1": "BA 243",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6010",
                            "url": "tel:+5075376010",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/datamanagementinstitutionalresearch/",
                            "url": "https://www.smsu.edu/administration/datamanagementinstitutionalresearch/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Dean of Students": {
                "name": "Dean of Students",
                "page": "deanofstudents.html",
                "location": {
                    "line1": "HC4 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6136",
                            "url": "tel:+5075376136",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "deanofstudents@smsu.edu",
                            "url": "mailto:deanofstudents@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/deanofstudents/",
                            "url": "https://www.smsu.edu/administration/deanofstudents/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Dean, College of Arts, Letters and Sciences": {
                "name": "Dean, College of Arts, Letters and Sciences",
                "page": "firstyearexperience.html",
                "location": {
                    "line1": "BA 268",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6251",
                            "url": "tel:+5075376251",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6472",
                            "url": "tel:+5075376472",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "deansoffice@smsu.edu",
                            "url": "mailto:deansoffice@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/academicdeans/",
                            "url": "https://www.smsu.edu/administration/academicdeans/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Dean, College of Business, Education and Professional Studies": {
                "name": "Dean, College of Business, Education and Professional Studies",
                "page": "",
                "location": {
                    "line1": "BA 268",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6251",
                            "url": "tel:+5075376251",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6472",
                            "url": "tel:+5075376472",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "deansoffice@smsu.edu",
                            "url": "mailto:deansoffice@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/academicdeans/",
                            "url": "https://www.smsu.edu/administration/academicdeans/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Deeann Griebel Student Success Center": {
                "name": "Deeann Griebel Student Success Center",
                "page": "dgssc.html",
                "location": {
                    "line1": "IL 224",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6484",
                            "url": "tel:+5075376484",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "success@smsu.edu",
                            "url": "mailto:success@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/dgssc/",
                            "url": "https://www.smsu.edu/campuslife/dgssc/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of Agriculture, Culinology and Hospitality Management": {
                "name": "Department of Agriculture, Culinology and Hospitality Management",
                "page": "agricultureculinologyandhospitalitymanagement.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/agricultureculinologyandhospitalitymanagement/",
                            "url": "https://www.smsu.edu/academics/departments/agricultureculinologyandhospitalitymanagement/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of English, Philosophy, Spanish and Humanities": {
                "name": "Department of English, Philosophy, Spanish and Humanities",
                "page": "englishphilosophyspanishandhumanities.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7155",
                            "url": "tel:+5075377155",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "epshdept@smsu.edu",
                            "url": "mailto:epshdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/englishphilosophyspanishandhumanities/",
                            "url": "https://www.smsu.edu/academics/departments/englishphilosophyspanishandhumanities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of Mathematics and Computer Science": {
                "name": "Department of Mathematics and Computer Science",
                "page": "mathematicscomputerscience.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mathcs@smsu.edu",
                            "url": "mailto:mathcs@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/mathematicscomputerscience/",
                            "url": "https://www.smsu.edu/academics/departments/mathematicscomputerscience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of Nursing": {
                "name": "Department of Nursing",
                "page": "nursing.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7591",
                            "url": "tel:+5075377591",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "nursingdept@smsu.edu",
                            "url": "mailto:nursingdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/nursing/",
                            "url": "https://www.smsu.edu/academics/departments/nursing/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of Science": {
                "name": "Department of Science",
                "page": "science.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/science/",
                            "url": "https://www.smsu.edu/academics/departments/science/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Duplicating Services": {
                "name": "Duplicating Services",
                "page": "duplicatingservices.html",
                "location": {
                    "line1": "BA 175",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6347",
                            "url": "tel:+5075376347",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "duplicatingservices@smsu.edu",
                            "url": "mailto:duplicatingservices@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/facilities/duplicatingservices/",
                            "url": "https://www.smsu.edu/administration/facilities/duplicatingservices/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Education Graduate Program - Special Ed.": {
                "name": "Education Graduate Program - Special Ed.",
                "page": "",
                "location": {
                    "line1": "IL 237",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7120",
                            "url": "tel:+5075377120",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduateeducation@smsu.edu",
                            "url": "mailto:graduateeducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/graduatestudies/",
                            "url": "https://www.smsu.edu/graduatestudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Education Program": {
                "name": "Education Program",
                "page": "",
                "location": {
                    "line1": "IL 229",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7115",
                            "url": "tel:+5075377115",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6153",
                            "url": "tel:+5075376153",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "smsueducation@smsu.edu",
                            "url": "mailto:smsueducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/education/",
                            "url": "https://www.smsu.edu/academics/programs/education/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Educational Opportunity Program": {
                "name": "Educational Opportunity Program",
                "page": "",
                "location": {
                    "line1": "BA 239",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6423",
                            "url": "tel:+5075376423",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "civicengagement@smsu.edu",
                            "url": "mailto:civicengagement@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/firstyearexperience/",
                            "url": "https://www.smsu.edu/administration/firstyearexperience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "English Program": {
                "name": "English Program",
                "page": "english.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7155",
                            "url": "tel:+5075377155",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "epshdept@smsu.edu",
                            "url": "mailto:epshdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/english/",
                            "url": "https://www.smsu.edu/academics/programs/english/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Enrollment Management and Student Success": {
                "name": "Enrollment Management and Student Success",
                "page": "enrollmentmanagementandstudentsuccess.html",
                "location": {
                    "line1": "SC 227",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6645",
                            "url": "tel:+5075376645",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "enrollment@smsu.edu",
                            "url": "mailto:enrollment@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/enrollmentmanagementandstudentsuccess/",
                            "url": "https://www.smsu.edu/administration/enrollmentmanagementandstudentsuccess/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Environmental Science Program": {
                "name": "Environmental Science Program",
                "page": "environmentalscience.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/environmentalscience/",
                            "url": "https://www.smsu.edu/academics/programs/environmentalscience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Exercise Science Program": {
                "name": "Exercise Science Program",
                "page": "exercisescience.html",
                "location": {
                    "line1": "PE 214",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/exercisescience/",
                            "url": "https://www.smsu.edu/academics/programs/exercisescience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Finance Program": {
                "name": "Finance Program",
                "page": "",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/finance/",
                            "url": "https://www.smsu.edu/academics/programs/finance/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Financial Aid": {
                "name": "Financial Aid",
                "page": "financialaid.html",
                "location": {
                    "line1": "IL 145",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6281",
                            "url": "tel:+5075376281",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6275",
                            "url": "tel:+5075376275",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "financialaid@smsu.edu",
                            "url": "mailto:financialaid@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/financialaid/",
                            "url": "https://www.smsu.edu/campuslife/financialaid/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Fitness Center": {
                "name": "Fitness Center",
                "page": "fitnessfacilities.html",
                "location": {
                    "line1": "R/A 129",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7311",
                            "url": "tel:+5075377311",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fitnesscenter@smsu.edu",
                            "url": "mailto:fitnesscenter@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/fitnessfacilities/",
                            "url": "https://www.smsu.edu/campuslife/fitnessfacilities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Foreign Languages Program": {
                "name": "Foreign Languages Program",
                "page": "foreignlanguages.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7155",
                            "url": "tel:+5075377155",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "epshdept@smsu.edu",
                            "url": "mailto:epshdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/foreignlanguages/",
                            "url": "https://www.smsu.edu/academics/programs/foreignlanguages/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Foundation": {
                "name": "Foundation",
                "page": "foundation.html",
                "location": {
                    "line1": "FH 225",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6266",
                            "url": "tel:+5075376266",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "foundation@smsu.edu",
                            "url": "mailto:foundation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/foundation/",
                            "url": "https://www.smsu.edu/foundation/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "GIS Center": {
                "name": "GIS Center",
                "page": "geographicinformationsystems.html",
                "location": {
                    "line1": "SM 208",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6189",
                            "url": "tel:+5075376189",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "gis@smsu.edu",
                            "url": "mailto:gis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/geographicinformationsystems/",
                            "url": "https://www.smsu.edu/campuslife/geographicinformationsystems/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "GOLD College": {
                "name": "GOLD College",
                "page": "goldcollege.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6646",
                            "url": "tel:+5075376646",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "goldcollege@smsu.edu",
                            "url": "mailto:goldcollege@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/goldcollege/",
                            "url": "https://www.smsu.edu/academics/goldcollege/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Graduate Admissions": {
                "name": "Graduate Admissions",
                "page": "graduate.html",
                "location": {
                    "line1": "BA 265",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6819",
                            "url": "tel:+5075376819",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduatestudies@smsu.edu",
                            "url": "mailto:graduatestudies@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/admission/graduate/",
                            "url": "https://www.smsu.edu/admission/graduate/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Graduate Learning Community": {
                "name": "Graduate Learning Community",
                "page": "learningcommunity.html",
                "location": {
                    "line1": "BA 527",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7115",
                            "url": "tel:+5075377115",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduatelc@smsu.edu",
                            "url": "mailto:graduatelc@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/learningcommunity/",
                            "url": "https://www.smsu.edu/campuslife/learningcommunity/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Greenhouse": {
                "name": "Greenhouse",
                "page": "greenhouse.html",
                "location": {
                    "line1": "SM 183",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/attractions/greenhouse/",
                            "url": "https://www.smsu.edu/campuslife/attractions/greenhouse/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Health Services": {
                "name": "Health Services",
                "page": "healthservices.html",
                "location": {
                    "line1": "BA 158",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7202",
                            "url": "tel:+5075377202",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-7259",
                            "url": "tel:+5075377259",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "healthservices@smsu.edu",
                            "url": "mailto:healthservices@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/healthservices/",
                            "url": "https://www.smsu.edu/campuslife/healthservices/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "History Center": {
                "name": "History Center",
                "page": "historycenter.html",
                "location": {
                    "line1": "BA 512",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7373",
                            "url": "tel:+5075377373",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "archives@smsu.edu",
                            "url": "mailto:archives@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/attractions/historycenter/",
                            "url": "https://www.smsu.edu/campuslife/attractions/historycenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "History Program": {
                "name": "History Program",
                "page": "history.html",
                "location": {
                    "line1": "SS 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/history/",
                            "url": "https://www.smsu.edu/academics/programs/history/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Honors Program": {
                "name": "Honors Program",
                "page": "honors.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7521",
                            "url": "tel:+5075377521",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "honorsprogram@smsu.edu",
                            "url": "mailto:honorsprogram@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/honors/",
                            "url": "https://www.smsu.edu/academics/programs/honors/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Hospitality Management Program": {
                "name": "Hospitality Management Program",
                "page": "hospitality.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "hospitality@smsu.edu",
                            "url": "mailto:hospitality@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/hospitality/",
                            "url": "https://www.smsu.edu/academics/programs/hospitality/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Human Resources": {
                "name": "Human Resources",
                "page": "humanresources.html",
                "location": {
                    "line1": "BA 269",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6208",
                            "url": "tel:+5075376208",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "hr@smsu.edu",
                            "url": "mailto:hr@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/humanresources/",
                            "url": "https://www.smsu.edu/administration/humanresources/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Humanities Program": {
                "name": "Humanities Program",
                "page": "humanities.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7155",
                            "url": "tel:+5075377155",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "epshdept@smsu.edu",
                            "url": "mailto:epshdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/humanities/",
                            "url": "https://www.smsu.edu/academics/programs/humanities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Indigenous Nations and Dakota Studies Program": {
                "name": "Indigenous Nations and Dakota Studies Program",
                "page": "indigenousnationsanddakotastudies.html",
                "location": {
                    "line1": "SS 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/indigenousnationsanddakotastudies/",
                            "url": "https://www.smsu.edu/academics/programs/indigenousnationsanddakotastudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Information Technology Services": {
                "name": "Information Technology Services",
                "page": "informationtechnologyservices.html",
                "location": {
                    "line1": "TRC Helpdesk, BA 284",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6111",
                            "url": "tel:+5075376111",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "trchelpdesk@smsu.edu",
                            "url": "mailto:trchelpdesk@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/informationtechnologyservices/",
                            "url": "https://www.smsu.edu/informationtechnologyservices/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Interdisciplinary Studies Program": {
                "name": "Interdisciplinary Studies Program",
                "page": "interdisciplinarystudies.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "deansoffice@smsu.edu",
                            "url": "mailto:deansoffice@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/interdisciplinarystudies/",
                            "url": "https://www.smsu.edu/academics/programs/interdisciplinarystudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Intramurals": {
                "name": "Intramurals",
                "page": "",
                "location": {
                    "line1": "R/A 118",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7383",
                            "url": "tel:+5075377383",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "julia.peniata@smsu.edu",
                            "url": "mailto:julia.peniata@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "http://smsumustangs.com/sports/2014/2/6/AD_0206145648.aspx",
                            "url": "http://smsumustangs.com/sports/2014/2/6/AD_0206145648.aspx",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "LGBTQ Center": {
                "name": "LGBTQ Center",
                "page": "lgbtqcenter.html",
                "location": {
                    "line1": "BA 237",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6294",
                            "url": "tel:+5075376294",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "lgbtqcenter@smsu.edu",
                            "url": "mailto:lgbtqcenter@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/lgbtqcenter/",
                            "url": "https://www.smsu.edu/campuslife/lgbtqcenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Management Program": {
                "name": "Management Program",
                "page": "management.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/management/",
                            "url": "https://www.smsu.edu/academics/programs/management/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Marketing Program": {
                "name": "Marketing Program",
                "page": "marketing.html",
                "location": {
                    "line1": "ST 203A",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/marketing/",
                            "url": "https://www.smsu.edu/academics/programs/marketing/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "MARL Program": {
                "name": "MARL Program",
                "page": "marl.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6255",
                            "url": "tel:+5075376255",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "marl@smsu.edu",
                            "url": "mailto:marl@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/marl/",
                            "url": "https://www.smsu.edu/marl/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Mathematics Program": {
                "name": "Mathematics Program",
                "page": "mathematics.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mathcs@smsu.edu",
                            "url": "mailto:mathcs@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/mathematics/",
                            "url": "https://www.smsu.edu/academics/programs/mathematics/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Mental Health Counseling Center": {
                "name": "Mental Health Counseling Center",
                "page": "mentalhealthcounselingcenter.html",
                "location": {
                    "line1": "BA 156",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7150",
                            "url": "tel:+5075377150",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-7979",
                            "url": "tel:+5075377979",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mentalhealth@smsu.edu",
                            "url": "mailto:mentalhealth@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/mentalhealthcounselingcenter/",
                            "url": "https://www.smsu.edu/campuslife/mentalhealthcounselingcenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Music Program": {
                "name": "Music Program",
                "page": "music.html",
                "location": {
                    "line1": "FA 207",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7103",
                            "url": "tel:+5075377103",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fineartscommunications@smsu.edu",
                            "url": "mailto:fineartscommunications@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/music/",
                            "url": "https://www.smsu.edu/academics/programs/music/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Mustang Card": {
                "name": "Mustang Card",
                "page": "mustangcard.html",
                "location": {
                    "line1": "FH 121",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7330",
                            "url": "tel:+5075377330",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6809",
                            "url": "tel:+5075376809",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mustangcard@smsu.edu",
                            "url": "mailto:mustangcard@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/mustangcard/",
                            "url": "https://www.smsu.edu/mustangcard/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Mustang Pathway": {
                "name": "Mustang Pathway",
                "page": "mustangpathways.html",
                "location": {
                    "line1": "Commons East 109B",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6257",
                            "url": "tel:+5075376257",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mustangpathway@smsu.edu",
                            "url": "mailto:mustangpathway@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/mustangpathway/",
                            "url": "https://www.smsu.edu/campuslife/mustangpathway/index.html",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Mustang Zone": {
                "name": "Mustang Zone",
                "page": "",
                "location": {
                    "line1": "FH 118",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6553",
                            "url": "tel:+5075376553",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6809",
                            "url": "tel:+5075376809",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "thecenters@smsu.edu",
                            "url": "mailto:thecenters@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/studentcenter/",
                            "url": "https://www.smsu.edu/campuslife/studentcenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "North Star Mutual School of Business": {
                "name": "North Star Mutual School of Business",
                "page": "business.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/schools/business/",
                            "url": "https://www.smsu.edu/academics/schools/business/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Philosophy Program": {
                "name": "Philosophy Program",
                "page": "philosophy.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7155",
                            "url": "tel:+5075377155",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "epshdept@smsu.edu",
                            "url": "mailto:epshdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/philosophy/",
                            "url": "https://www.smsu.edu/academics/programs/philosophy/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Physical Education Program": {
                "name": "Physical Education Program",
                "page": "physicaleducation.html",
                "location": {
                    "line1": "IL 229",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7115",
                            "url": "tel:+5075377115",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6153",
                            "url": "tel:+5075376153",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "smsueducation@smsu.edu",
                            "url": "mailto:smsueducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/physicaleducation/",
                            "url": "https://www.smsu.edu/academics/programs/physicaleducation/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Physics Program": {
                "name": "Physics Program",
                "page": "physics.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/physics/",
                            "url": "https://www.smsu.edu/academics/programs/physics/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Planetarium": {
                "name": "Planetarium",
                "page": "planetarium.html",
                "location": {
                    "line1": "SM 108",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6173",
                            "url": "tel:+5075376173",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "planetarium@smsu.edu",
                            "url": "mailto:planetarium@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/attractions/planetarium/",
                            "url": "https://www.smsu.edu/campuslife/attractions/planetarium/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Political Science Program": {
                "name": "Political Science Program",
                "page": "",
                "location": {
                    "line1": "CH 129",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/politicalscience/",
                            "url": "https://www.smsu.edu/academics/programs/politicalscience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Post Office": {
                "name": "Post Office",
                "page": "postoffice.html",
                "location": {
                    "line1": "BA 175",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6347",
                            "url": "tel:+5075376347",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "duplicatingservices@smsu.edu",
                            "url": "mailto:duplicatingservices@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/facilities/postoffice/",
                            "url": "https://www.smsu.edu/administration/facilities/postoffice/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Psychology Program": {
                "name": "Psychology Program",
                "page": "psychology.html",
                "location": {
                    "line1": "CH 127",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/psychology/",
                            "url": "https://www.smsu.edu/academics/programs/psychology/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Registration and Records": {
                "name": "Registration and Records",
                "page": "registrationrecords.html",
                "location": {
                    "line1": "IL 148",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6206",
                            "url": "tel:+5075376206",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6420",
                            "url": "tel:+5075376420",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "registration@smsu.edu",
                            "url": "mailto:registration@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/registrationrecords/",
                            "url": "https://www.smsu.edu/campuslife/registrationrecords/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Residence Life": {
                "name": "Residence Life",
                "page": "residencelife.html",
                "location": {
                    "line1": "HC4 101",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6136",
                            "url": "tel:+5075376136",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "reslife@smsu.edu",
                            "url": "mailto:reslife@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/residencelife/",
                            "url": "https://www.smsu.edu/campuslife/residencelife/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Scheduling and Event Planning": {
                "name": "Scheduling and Event Planning",
                "page": "scheduling.html",
                "location": {
                    "line1": "FH 118",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7110",
                            "url": "tel:+5075377110",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "scheduling@smsu.edu",
                            "url": "mailto:scheduling@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/scheduling/",
                            "url": "https://www.smsu.edu/administration/scheduling/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "School of Agriculture": {
                "name": "School of Agriculture",
                "page": "agriculture.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "agriculture@smsu.edu",
                            "url": "mailto:agriculture@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/schools/agriculture/",
                            "url": "https://www.smsu.edu/academics/schools/agriculture/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "School of Education": {
                "name": "School of Education",
                "page": "education.html",
                "location": {
                    "line1": "IL 229",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7115",
                            "url": "tel:+5075377115",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6153",
                            "url": "tel:+5075376153",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "smsueducation@smsu.edu",
                            "url": "mailto:smsueducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/schools/education/",
                            "url": "https://www.smsu.edu/academics/schools/education/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "SHOT": {
                "name": "SHOT",
                "page": "shot.html",
                "location": {
                    "line1": "BA 177",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6984",
                            "url": "tel:+5075376984",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "shothelpdesk@smsu.edu",
                            "url": "mailto:shothelpdesk@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "https://shot.smsu.edu/",
                            "url": "https://shot.smsu.edu/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Small Business Development Center-Regional Office": {
                "name": "Small Business Development Center-Regional Office",
                "page": "sbdc.html",
                "location": {
                    "line1": "ST 211A",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7386",
                            "url": "tel:+5075377386",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "sbdc@smsu.edu",
                            "url": "mailto:sbdc@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/sbdc/",
                            "url": "https://www.smsu.edu/sbdc/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "SMSU Restaurant": {
                "name": "SMSU Restaurant",
                "page": "restaurant.html",
                "location": {
                    "line1": "IL 116",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/restaurant/",
                            "url": "https://www.smsu.edu/campuslife/restaurant/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "SMSU Wellness Workgroup": {
                "name": "SMSU Wellness Workgroup",
                "page": "wellnessworkgroup.html",
                "location": {
                    "line1": "PE 220",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7233",
                            "url": "tel:+5075377233",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "wellness@smsu.edu",
                            "url": "mailto:wellness@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/wellnessworkgroup/",
                            "url": "https://www.smsu.edu/campuslife/wellnessworkgroup/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "SMSUFA": {
                "name": "SMSUFA",
                "page": "smsufa.html",
                "location": {
                    "line1": "SM 213",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6145",
                            "url": "tel:+5075376145",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "facultyassociation@smsu.edu",
                            "url": "mailto:facultyassociation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/smsufa/",
                            "url": "https://www.smsu.edu/administration/smsufa/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Social Science Department": {
                "name": "Social Science Department",
                "page": "socialscience.html",
                "location": {
                    "line1": "CH 129",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/socialscience/",
                            "url": "https://www.smsu.edu/academics/departments/socialscience/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Social Work Program": {
                "name": "Social Work Program",
                "page": "socialwork.html",
                "location": {
                    "line1": "CH 101",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/socialwork/",
                            "url": "https://www.smsu.edu/academics/programs/socialwork/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Sociology Program": {
                "name": "Sociology Program",
                "page": "sociology.html",
                "location": {
                    "line1": "SS 103",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/sociology/",
                            "url": "https://www.smsu.edu/academics/programs/sociology/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Southwest Marketing Advisory Center": {
                "name": "Southwest Marketing Advisory Center",
                "page": "smac.html",
                "location": {
                    "line1": "ST 203",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7102",
                            "url": "tel:+5075377102",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "smac@smsu.edu",
                            "url": "mailto:smac@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/smac/",
                            "url": "https://www.smsu.edu/smac/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Special Education Program": {
                "name": "Special Education Program",
                "page": "specialeducation.html",
                "location": {
                    "line1": "IL 238",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6449",
                            "url": "tel:+5075376449",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "specialeducation@smsu.edu",
                            "url": "mailto:specialeducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/specialeducation/",
                            "url": "https://www.smsu.edu/academics/programs/specialeducation/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Student Activities": {
                "name": "Student Activities",
                "page": "studentactivities.html",
                "location": {
                    "line1": "SC 229",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6394",
                            "url": "tel:+5075376394",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "smsu.sac@smsu.edu",
                            "url": "mailto:smsu.sac@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/studentactivities/",
                            "url": "https://www.smsu.edu/campuslife/studentactivities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Student Center": {
                "name": "Student Center",
                "page": "studentcenter.html",
                "location": {
                    "line1": "SC 225",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6552",
                            "url": "tel:+5075376552",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "thecenters@smsu.edu",
                            "url": "mailto:thecenters@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/studentcenter/",
                            "url": "https://www.smsu.edu/campuslife/studentcenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Student Conduct": {
                "name": "Student Conduct",
                "page": "studentconduct.html",
                "location": {
                    "line1": "SC 234",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6471",
                            "url": "tel:+5075376471",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "studentconduct@smsu.edu",
                            "url": "mailto:studentconduct@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/studentconduct/",
                            "url": "https://www.smsu.edu/campuslife/studentconduct/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Student Government": {
                "name": "Student Government",
                "page": "studentgovernment.html",
                "location": {
                    "line1": "SC 231/232",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6140",
                            "url": "tel:+5075376140",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "studentgovernment@smsu.edu",
                            "url": "mailto:studentgovernment@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/studentgovernment/",
                            "url": "https://www.smsu.edu/campuslife/studentgovernment/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Study Abroad": {
                "name": "Study Abroad",
                "page": "studyabroad.html",
                "location": {
                    "line1": "SC 237",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6018",
                            "url": "tel:+5075376018",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "cie@smsu.edu",
                            "url": "mailto:cie@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/centerforinternationaleducation/studyabroad/",
                            "url": "https://www.smsu.edu/campuslife/centerforinternationaleducation/studyabroad/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Summer Term": {
                "name": "Summer Term",
                "page": "summerterm.html",
                "location": {
                    "line1": "IL 148",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6206",
                            "url": "tel:+5075376206",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6420",
                            "url": "tel:+5075376420",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "registration@smsu.edu",
                            "url": "mailto:registration@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/summerterm/",
                            "url": "https://www.smsu.edu/academics/summerterm/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Swimming Pool": {
                "name": "Swimming Pool",
                "page": "",
                "location": {
                    "line1": "PE 152",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6561",
                            "url": "tel:+5075376561",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "swimmingpool@smsu.edu",
                            "url": "mailto:swimmingpool@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/fitnessfacilities/",
                            "url": "https://www.smsu.edu/campuslife/fitnessfacilities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Entertainment and Theatre Arts Program": {
                "name": "Entertainment and Theatre Arts Program",
                "page": "theatrearts.html",
                "location": {
                    "line1": "FA 207",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7103",
                            "url": "tel:+5075377103",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fineartscommunications@smsu.edu",
                            "url": "mailto:fineartscommunications@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/theatrearts/",
                            "url": "https://www.smsu.edu/academics/programs/theatrearts/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "TRiO Upward Bound": {
                "name": "TRiO Upward Bound",
                "page": "trio.html",
                "location": {
                    "line1": "IL 161",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7376",
                            "url": "tel:+5075377376",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6022",
                            "url": "tel:+5075376022",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "upwardbound@smsu.edu",
                            "url": "mailto:upwardbound@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/trio/",
                            "url": "https://www.smsu.edu/academics/trio/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Undergraduate Research": {
                "name": "Undergraduate Research",
                "page": "undergraduateresearch.html",
                "location": {
                    "line1": "SM 178",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6178",
                            "url": "tel:+5075376178",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/undergraduateresearch/",
                            "url": "https://www.smsu.edu/undergraduateresearch/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "University Advancement": {
                "name": "University Advancement",
                "page": "advancement.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6266",
                            "url": "tel:+5075376266",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "advancement@smsu.edu",
                            "url": "mailto:advancement@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/advancement/",
                            "url": "https://www.smsu.edu/administration/advancement/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "University Public Safety": {
                "name": "University Public Safety",
                "page": "publicsafety.html",
                "location": {
                    "line1": "Founders Hall 108 First Floor",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7252",
                            "url": "tel:+5075377252",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "mike.munford@smsu.edu",
                            "url": "mailto:mike.munford@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/publicsafety/",
                            "url": "https://www.smsu.edu/campuslife/publicsafety/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Veterans Resource Center": {
                "name": "Veterans Resource Center",
                "page": "veterans.html",
                "location": {
                    "line1": "BA 140",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7213",
                            "url": "tel:+5075377213",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "vetscenter@smsu.edu",
                            "url": "mailto:vetscenter@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/veterans/",
                            "url": "https://www.smsu.edu/campuslife/veterans/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Vice President for Finance and Administration": {
                "name": "Vice President for Finance and Administration",
                "page": "vpfinanceadmin.html",
                "location": {
                    "line1": "FH 215",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6093",
                            "url": "tel:+5075376093",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "finance.admin@smsu.edu",
                            "url": "mailto:finance.admin@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/vpfinanceadmin/",
                            "url": "https://www.smsu.edu/administration/vpfinanceadmin/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Web Office": {
                "name": "Web Office",
                "page": "weboffice.html",
                "location": {
                    "line1": "FH 15",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6345",
                            "url": "tel:+5075376345",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "webmaster@smsu.edu",
                            "url": "mailto:webmaster@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/weboffice/",
                            "url": "https://www.smsu.edu/administration/weboffice/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "William Whipple Gallery": {
                "name": "William Whipple Gallery",
                "page": "gallery.html",
                "location": {
                    "line1": "BA 144",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7080",
                            "url": "tel:+5075377080",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "artgallery@smsu.edu",
                            "url": "mailto:artgallery@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/attractions/gallery/",
                            "url": "https://www.smsu.edu/campuslife/attractions/gallery/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Writing Center": {
                "name": "Writing Center",
                "page": "writingcenter.html",
                "location": {
                    "line1": "BA 527",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7294",
                            "url": "tel:+5075377294",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "writingcenter@smsu.edu",
                            "url": "mailto:writingcenter@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/writingcenter/",
                            "url": "https://www.smsu.edu/campuslife/writingcenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Art &amp; Design Program": {
                "name": "Art &amp; Design Program",
                "page": "art.html",
                "location": {
                    "line1": "FA 207",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7103",
                            "url": "tel:+5075377103",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fineartscommunication@smsu.edu",
                            "url": "mailto:fineartscommunication@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/art/",
                            "url": "https://www.smsu.edu/academics/programs/art/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Center for Civic &amp; Community Engagement": {
                "name": "Center for Civic &amp; Community Engagement",
                "page": "civicengagement.html",
                "location": {
                    "line1": "BA 161",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6423",
                            "url": "tel:+5075376423",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-7979",
                            "url": "tel:+5075377979",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "civic.engagement@smsu.edu",
                            "url": "mailto:civic.engagement@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/civicengagement/",
                            "url": "https://www.smsu.edu/campuslife/civicengagement/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Department of Business Innovation &amp; Strategy": {
                "name": "Department of Business Innovation &amp; Strategy",
                "page": "bis.html",
                "location": {
                    "line1": "ST 201",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6223",
                            "url": "tel:+5075376223",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6227",
                            "url": "tel:+5075376227",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "bis@smsu.edu",
                            "url": "mailto:bis@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/bis/",
                            "url": "https://www.smsu.edu/academics/departments/bis/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Education: Graduate Program": {
                "name": "Education: Graduate Program",
                "page": "",
                "location": {
                    "line1": "IL 237",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7120",
                            "url": "tel:+5075377120",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduateeducation@smsu.edu",
                            "url": "mailto:graduateeducation@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/graduatestudies/",
                            "url": "https://www.smsu.edu/graduatestudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Facilities &amp; Physical Plant": {
                "name": "Facilities &amp; Physical Plant",
                "page": "facilities.html",
                "location": {
                    "line1": "MT Bldg",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7106",
                            "url": "tel:+5075377106",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "physicalplant@smsu.edu",
                            "url": "mailto:physicalplant@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/facilities/",
                            "url": "https://www.smsu.edu/administration/facilities/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Justice Administration &amp; Criminal Justice Program": {
                "name": "Justice Administration &amp; Criminal Justice Program",
                "page": "justiceadministration.html",
                "location": {
                    "line1": "CH 131",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6224",
                            "url": "tel:+5075376224",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "socialscience@smsu.edu",
                            "url": "mailto:socialscience@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/justiceadministration/",
                            "url": "https://www.smsu.edu/academics/programs/justiceadministration/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "McFarland Library": {
                "name": "McFarland Library",
                "page": "library.html",
                "location": {
                    "line1": "BA 299",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7278",
                            "url": "tel:+5075377278",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6200",
                            "url": "tel:+5075376200",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "askref@smsu.edu",
                            "url": "mailto:askref@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/library/",
                            "url": "https://www.smsu.edu/library/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Nursing: RN to BSN Program": {
                "name": "Nursing: RN to BSN Program",
                "page": "nursingrntobsn.html",
                "location": {
                    "line1": "BA 221",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7591",
                            "url": "tel:+5075377591",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6815",
                            "url": "tel:+5075376815",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "nursingdept@smsu.edu",
                            "url": "mailto:nursingdept@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/nursingrntobsn/",
                            "url": "https://www.smsu.edu/academics/programs/nursingrntobsn/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "President&apos;s Office": {
                "name": "President&apos;s Office",
                "page": "president.html",
                "location": {
                    "line1": "FH 209",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6272",
                            "url": "tel:+5075376272",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6241",
                            "url": "tel:+5075376241",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "president@smsu.edu",
                            "url": "mailto:president@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/president/",
                            "url": "https://www.smsu.edu/administration/president/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Provost/Vice President for Academic and Student Affairs": {
                "name": "Provost/Vice President for Academic and Student Affairs",
                "page": "academicaffairs.html",
                "location": {
                    "line1": "FH 214",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6246",
                            "url": "tel:+5075376246",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6241",
                            "url": "tel:+5075376241",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "provost@smsu.edu",
                            "url": "mailto:provost@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/provost/",
                            "url": "https://www.smsu.edu/administration/provost/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Women&apos;s Center": {
                "name": "Women&apos;s Center",
                "page": "womenscenter.html",
                "location": {
                    "line1": "BA 246",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6294",
                            "url": "tel:+5075376294",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "womenscenter@smsu.edu",
                            "url": "mailto:womenscenter@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/womenscenter/",
                            "url": "https://www.smsu.edu/campuslife/womenscenter/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Women&apos;s Studies Program": {
                "name": "Women&apos;s Studies Program",
                "page": "womensstudies.html",
                "location": {
                    "line1": "CH 119",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6393",
                            "url": "tel:+5075376393",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "womensstudies@smsu.edu",
                            "url": "mailto:womensstudies@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/programs/womensstudies/",
                            "url": "https://www.smsu.edu/academics/programs/womensstudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "": {
                "name": "",
                "page": "",
                "location": {
                    "line1": "1430 E. College Dr. Marshall, MN 56258",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6266",
                            "url": "tel:+5075376266",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "alumni@smsu.edu",
                            "url": "mailto:alumni@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/alumni/",
                            "url": "https://www.smsu.edu/alumni/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Athletics": {
                "name": "Athletics",
                "page": "athletics.html",
                "location": {
                    "line1": "",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7271",
                            "url": "tel:+5075377271",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "athletics@smsu.edu",
                            "url": "mailto:athletics@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "https://smsumustangs.com",
                            "url": "https://smsumustangs.com",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Diversity &amp; Inclusion, Office of": {
                "name": "Diversity &amp; Inclusion, Office of",
                "page": "diversityinclusion.html",
                "location": {
                    "line1": "CE",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6169",
                            "url": "tel:+5075376169",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "diversity@smsu.edu",
                            "url": "mailto:diversity@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/diversityinclusion/",
                            "url": "https://www.smsu.edu/administration/diversityinclusion/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Fine Arts and Communication, Department of": {
                "name": "Fine Arts and Communication, Department of",
                "page": "fineartsandcommunication.html",
                "location": {
                    "line1": "FA 207",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7103",
                            "url": "tel:+5075377103",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "fineartscommunications@smsu.edu",
                            "url": "mailto:fineartscommunications@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/departments/fineartsandcommunication/",
                            "url": "https://www.smsu.edu/academics/departments/fineartsandcommunication/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Graduate Studies, School of": {
                "name": "Graduate Studies, School of",
                "page": "graduatestudies.html",
                "location": {
                    "line1": "BA 245",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6819",
                            "url": "tel:+5075376819",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "graduatestudies@smsu.edu",
                            "url": "mailto:graduatestudies@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/graduatestudies/",
                            "url": "https://www.smsu.edu/graduatestudies/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Online Learning &amp; Transfer Partnerships, Office of": {
                "name": "Online Learning &amp; Transfer Partnerships, Office of",
                "page": "onlinelearning.html",
                "location": {
                    "line1": "BA 268",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6251",
                            "url": "tel:+5075376251",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "onlinelearning@smsu.edu",
                            "url": "mailto:onlinelearning@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/academics/onlinelearning/",
                            "url": "https://www.smsu.edu/academics/onlinelearning/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Provost/Vice President for Academic and Student Affairs": {
                "name": "Academic Deans/Academic Affairs",
                "page": "",
                "location": {
                    "line1": "BA 268",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6251",
                            "url": "tel:+5075376251",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "(507) 537-6472",
                            "url": "tel:+5075376472",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "deansoffice@smsu.edu",
                            "url": "mailto:deansoffice@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/administration/academicdeans/",
                            "url": "https://www.smsu.edu/administration/academicdeans/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "": {
                "name": "",
                "page": "",
                "location": {
                    "line1": "SS",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-7046",
                            "url": "tel:+5075377046",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "see.moua-leske@marshall.k12.mn.us",
                            "url": "mailto:see.moua-leske@marshall.k12.mn.us",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "https://www.southwestabe.org/",
                            "url": "https://www.southwestabe.org/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "": {
                "name": "",
                "page": "auri.html",
                "location": {
                    "line1": "ST 107",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(218) 281-7600",
                            "url": "tel:+2182817600",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "leischens@auri.org",
                            "url": "mailto:leischens@auri.org",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "https://auri.org/",
                            "url": "https://auri.org/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "New Horizons Crisis Center SMSU Outreach Office": {
                "name": "New Horizons Crisis Center SMSU Outreach Office",
                "page": "newhorizons.html",
                "location": {
                    "line1": "349 W Main St Suite 3",
                    "line2": "",
                    "city": "Marshall",
                    "state": "MN",
                    "postalCode": "56258"
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 532-5764",
                            "url": "tel:+5075325764",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "newhorizonscrisiscenter.org",
                            "url": "https://www.newhorizonscrisiscenter.org/",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Natural History Museum": {
                "name": "Natural History Museum",
                "page": "naturalhistorymuseum.html",
                "location": {
                    "line1": "SM 107",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "(507) 537-6151",
                            "url": "tel:+5075376151",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "science@smsu.edu",
                            "url": "mailto:science@smsu.edu",
                            "target": "_self"
                        },                                                                                                                                             {
                            "title": "/campuslife/attractions/naturalhistorymuseum/",
                            "url": "https://www.smsu.edu/campuslife/attractions/naturalhistorymuseum/index.html",
                            "target": "_parent"
                        }                                    ]
            }
                                                                ,            "Center of Learning and Teaching": {
                "name": "Center of Learning and Teaching",
                "page": "centeroflearningandteaching.html",
                "location": {
                    "line1": "BA 509, McFarland Library 5th Floor",
                    "line2": "",
                    "city": "",
                    "state": "",
                    "postalCode": ""
                },
                "links": [
                                                                                                                                            {
                            "title": "/colt/",
                            "url": "https://www.smsu.edu/colt/index.html",
                            "target": "_parent"
                        }                                    ]
            }
                }
}
;
