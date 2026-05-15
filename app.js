let SYSTEM_MODULES = [];
let USER_MODULES = JSON.parse(localStorage.getItem('trc_modules')) || [];
let currentUser = null;
let currentView = 'chat';
let lastViewedTicket = null; // Global for retry logic
let userCurrentLocation = '';
let pendingWayfindingTarget = '';

// ----- THEME & AVATAR MANAGEMENT -----
function applyAppearanceClasses() {
  const theme = localStorage.getItem('trc_theme') || 'default';
  const font = localStorage.getItem('trc_font') || 'inter';
  const glass = localStorage.getItem('trc_glass') || 'medium';
  const bubble = localStorage.getItem('trc_bubble') || 'rounded';
  
  document.body.className = `theme-${theme} font-${font} glass-${glass} bubble-${bubble}`;
}

function setTheme(theme) {
  localStorage.setItem('trc_theme', theme);
  applyAppearanceClasses();
  
  // Update UI state in settings view (filtering out other configurations)
  document.querySelectorAll('.theme-grid .theme-option:not(.avatar-option):not(.font-option):not(.glass-option):not(.bubble-option)').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${theme}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast(`Theme updated to ${theme}`, 'success');
}

function setFont(font) {
  localStorage.setItem('trc_font', font);
  applyAppearanceClasses();
  
  document.querySelectorAll('.font-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${font}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast(`Font style updated to ${font}`, 'success');
}

function setGlass(glass) {
  localStorage.setItem('trc_glass', glass);
  applyAppearanceClasses();
  
  document.querySelectorAll('.glass-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${glass}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast("Glassmorphism intensity adjusted!", "success");
}

function setBubbleStyle(bubble) {
  localStorage.setItem('trc_bubble', bubble);
  applyAppearanceClasses();
  
  document.querySelectorAll('.bubble-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${bubble}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast("Chat Bubble frame updated!", "success");
}

function setAvatar(avatarStr) {
  localStorage.setItem('trc_avatar', avatarStr);
  const headerAvatar = document.getElementById('headerUserAvatar');
  if (headerAvatar) headerAvatar.innerText = avatarStr;
  
  // Update active state in selector
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${avatarStr}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast("Profile Avatar updated!", "success");
}

// Initialize theme and appearance variables
applyAppearanceClasses();

const savedAvatar = localStorage.getItem('trc_avatar') || '🤠';
document.addEventListener('DOMContentLoaded', () => {
  const headerAvatar = document.getElementById('headerUserAvatar');
  if (headerAvatar) headerAvatar.innerText = savedAvatar;
  
  // Select active states in selectors on startup
  const savedTheme = localStorage.getItem('trc_theme') || 'default';
  const savedFont = localStorage.getItem('trc_font') || 'inter';
  const savedGlass = localStorage.getItem('trc_glass') || 'medium';
  const savedBubble = localStorage.getItem('trc_bubble') || 'rounded';

  document.querySelectorAll('.theme-grid .theme-option:not(.avatar-option):not(.font-option):not(.glass-option):not(.bubble-option)').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${savedTheme}'`)) {
      opt.classList.add('active');
    }
  });
  
  document.querySelectorAll('.font-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${savedFont}'`)) {
      opt.classList.add('active');
    }
  });
  
  document.querySelectorAll('.glass-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${savedGlass}'`)) {
      opt.classList.add('active');
    }
  });
  
  document.querySelectorAll('.bubble-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${savedBubble}'`)) {
      opt.classList.add('active');
    }
  });

  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${savedAvatar}'`)) {
      opt.classList.add('active');
    }
  });
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await fetchConfig();
  renderFAQGrid();
  renderFilters();
  renderFormGuide();
  renderLinks();
  await loadDirectoryData();
  await loadTickets(); 
  await loadSystemConfig(); // Load integration settings
  renderMapList(allFloorPlans);
  checkOllamaStatus();
  initNotifications();
  if (USER_MODULES.length > 0) renderSidebar();
  fetchDeploymentInfo();
  startHeartbeat();
  startTelemetry();
  await checkSession();

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+K to focus AI Command Bar
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('globalAiCommandInput');
      if (input) input.focus();
    }
    
    // Ctrl + 1-9 to switch modules
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      const navButtons = document.querySelectorAll('.nav-btn');
      if (navButtons[index]) {
        navButtons[index].click();
      }
    }
  });

  // File drag and drop upload
  const chatContainer = document.querySelector('.chat-container');
  const dropZone = document.getElementById('dropZone');
  if (chatContainer && dropZone) {
    chatContainer.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.remove('hidden');
    });
    
    chatContainer.addEventListener('dragleave', e => {
      e.preventDefault();
      if (e.relatedTarget === null || !chatContainer.contains(e.relatedTarget)) {
        dropZone.classList.add('hidden');
      }
    });
    
    chatContainer.addEventListener('drop', async e => {
      e.preventDefault();
      dropZone.classList.add('hidden');
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        appendMessage(`🧠 Uploading and analyzing ${file.name}...`, 'ai');
        
        const formData = new FormData();
        formData.append("file", file);
        
        try {
          const token = currentUser ? currentUser.token : '';
          const res = await fetch(`/api/kb/upload?token=${token}`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.status === "success") {
            appendMessage(`✅ **File Analyzed!** ${data.message}`, 'ai');
            showToast(`Knowledge Ingested: ${file.name}`, 'success');
            addNotification("File Ingested", `Successfully learned from ${file.name}`, 'info');
          } else {
            appendMessage(`Failed: ${data.message}`, 'ai');
            showToast("Ingestion Failed", "error");
          }
        } catch (err) {
          appendMessage(`Upload Error: Backend might be down.`, 'ai');
          showToast("Backend connection lost", "error");
        }
      }
    });
  }
});

async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.status === 'success') {
      SYSTEM_MODULES = data.config.modules;
    }
  } catch (e) { console.error("Failed to load system config"); }
}

let notifications = JSON.parse(localStorage.getItem('trc_notifications')) || [];

async function loadDirectoryData() {
  if (typeof DIRECTORY_DATA !== 'undefined' && DIRECTORY_DATA.faculty) {
    directoryData = DIRECTORY_DATA.faculty;
  }
}

// Navigation
function toggleSidebar(open) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  
  if (open) {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  } else {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }
}

async function switchView(viewId) {
  if (viewId === currentView) {
    if (window.innerWidth <= 1024) toggleSidebar(false);
    return;
  }
  
  if (viewId !== 'login' && !USER_MODULES.includes(viewId)) {
    console.warn("Access Denied for module:", viewId);
    showToast(`Access Denied: Module '${viewId}' not enabled for your role`, "error");
    return;
  }

  currentView = viewId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');
  
  const targetBtn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
  if (targetBtn) targetBtn.classList.add('active');

  if (window.innerWidth <= 1024) toggleSidebar(false);

  // Sequential loading to prevent browser connection jams
  if (viewId === 'tickets') {
    await loadTickets();
  }
  if (viewId === 'wayfinding') {
    await loadFloorPlans();
  }
  if (viewId === 'settings') {
    await fetchDeploymentInfo();
  }
  if (viewId === 'ad') {
    await fetchDeploymentInfo();
    await loadAuditLogs();
    await loadSysAdminGlimpse();
  }
}

function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  
  const groups = [
    { title: 'Core Interface', ids: ['chat', 'tickets', 'directory', 'wayfinding'] },
    { title: 'Admin Systems', ids: ['sccm', 'ad', 'mist', 'ise', 'jamf'] },
    { title: 'Information', ids: ['form', 'links', 'settings'] }
  ];

  let html = '';
  
  groups.forEach(group => {
    // Check if user has at least one module in this group
    const hasGroup = group.ids.some(id => USER_MODULES.includes(id));
    if (hasGroup) {
      html += `<div class="nav-group-title">${group.title}</div>`;
      group.ids.forEach(id => {
        if (USER_MODULES.includes(id)) {
          const mod = SYSTEM_MODULES.find(m => m.id === id) || { 
            id: id, 
            name: id.toUpperCase(), 
            icon: '⚙️' 
          };
          html += `
            <button class="nav-btn ${currentView === mod.id ? 'active' : ''}" data-view="${mod.id}" onclick="switchView('${mod.id}')">
              <span>${mod.icon}</span> ${mod.name}
            </button>
          `;
        }
      });
    }
  });
  
  nav.innerHTML = html;
}

// ----- CHAT & AI LOGIC -----
async function checkOllamaStatus() {
  const statusDot = document.getElementById('aiStatus');
  const statusText = document.getElementById('aiStatusText');
  
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.status === 'success') {
      statusDot.className = 'status-dot online';
      statusText.innerText = 'AI Ready (Network)';
      isAIReady = true;
    } else {
      setFallbackStatus();
    }
  } catch (err) {
    setFallbackStatus();
  }
}

function setFallbackStatus() {
  const statusDot = document.getElementById('aiStatus');
  const statusText = document.getElementById('aiStatusText');
  statusDot.className = 'status-dot offline';
  statusText.innerText = 'AI Offline (Keyword Mode)';
  isAIReady = false;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const inputEl = document.getElementById('userInput');
  const text = inputEl.value.trim();
  if (!text) return;
  
  appendMessage(text, 'user');
  inputEl.value = '';
  const typingId = 'typing-' + Date.now();
  console.log("DEBUG: sendMessage triggered with text:", text);
  appendTyping(typingId);
  
  // Intercept starting location reply if we have a pending target
  if (pendingWayfindingTarget) {
    removeTyping(typingId);
    userCurrentLocation = text.trim().toUpperCase();
    const target = pendingWayfindingTarget;
    pendingWayfindingTarget = '';
    getDirections(target, userCurrentLocation);
    return;
  }

  // --- FAST LOCAL INTENT DETECTION (runs FIRST, no AI call needed) ---
  const lower = text.toLowerCase();
  
  // Combined: "I am at BA285 how do I go to CH104"
  const combinedMatch = lower.match(/(?:i.?m at|i am at|i am in front of)\s+([a-z]{2,3}\s*\d{0,4})\s*[,.]?\s*(?:how\s+(?:do\s+i|can\s+i|to)\s+(?:go|get|walk|navigate)\s+to|take\s+me\s+to|directions?\s+to|go\s+to|walk\s+to)\s+(.+)/i);
  if (combinedMatch) {
    userCurrentLocation = combinedMatch[1].trim().toUpperCase();
    const target = combinedMatch[2].trim().replace(/[?.!]+$/, '').toUpperCase();
    removeTyping(typingId);
    getDirections(target, userCurrentLocation);
    return;
  }

  // Location setting only: "i am at BA285"
  const locMatch = lower.match(/(?:i am at|i'm at|im at|i am in front of|i'm in front of|im in front of)\s+([a-z]{2,3}\s*\d{0,4}[a-z]?\s*)$/i);
  if (locMatch) {
    userCurrentLocation = locMatch[1].trim().toUpperCase();
    removeTyping(typingId);
    appendMessage(`📍 Got it! I'll remember you're at **${userCurrentLocation}**. Where do you need to go?`, 'ai');
    return;
  }

  // Directions: "how do i go to CH104", "directions to BA", "take me to SM200"
  const dirPatterns = [
    /(?:how\s+(?:do\s+i|can\s+i|to)\s+(?:go|get|walk|navigate)\s+(?:to|from))\s+(.+)/i,
    /(?:directions?\s+(?:to|from))\s+(.+)/i,
    /(?:take\s+me\s+to)\s+(.+)/i,
    /(?:where\s+is)\s+([a-z]{2,3}\s*\d{2,4})/i,
    /(?:go\s+to)\s+(.+)/i,
    /(?:navigate\s+to)\s+(.+)/i,
    /(?:walk\s+to)\s+(.+)/i,
    /(?:from\s+)([a-z]{2,3}\s*\d{2,4})\s+(?:to)\s+([a-z]{2,3}\s*\d{2,4})/i,
  ];
  for (const pat of dirPatterns) {
    const m = text.match(pat);
    if (m) {
      removeTyping(typingId);
      if (m[2]) {
        userCurrentLocation = m[1].trim().toUpperCase();
        getDirections(m[2].trim().toUpperCase(), userCurrentLocation);
      } else {
        let target = m[1].trim();
        const fromSplit = target.match(/(.+?)\s+from\s+(.+)/i);
        if (fromSplit) {
          target = fromSplit[1].trim();
          userCurrentLocation = fromSplit[2].trim().toUpperCase();
        }
        getDirections(target.toUpperCase(), userCurrentLocation);
      }
      return;
    }
  }

  // Room code correction (e.g. user just types "BA285" after a directions query)
  const roomCodeMatch = text.match(/^([a-z]{2,3})\s*(\d{2,4})$/i);
  if (roomCodeMatch) {
    const lastAI = chatHistory.filter(h => h.role === 'assistant').slice(-1)[0];
    const lastUser = chatHistory.filter(h => h.role === 'user').slice(-2, -1)[0];
    const recentContext = (lastAI?.content || '') + ' ' + (lastUser?.content || '');
    if (/direction|go to|walk|navigate|where|from|route|Calculating/i.test(recentContext)) {
      removeTyping(typingId);
      userCurrentLocation = text.trim().toUpperCase();
      const targetMatch = recentContext.match(/(?:to|go to|get to|directions? to)\s+([a-z]{2,3}\s*\d{2,4})/i);
      if (targetMatch) {
        appendMessage(`📍 Updated! Starting from **${userCurrentLocation}** instead.`, 'ai');
        getDirections(targetMatch[1].trim().toUpperCase(), userCurrentLocation);
      } else {
        appendMessage(`📍 Got it, you're at **${userCurrentLocation}**. Where do you need to go?`, 'ai');
      }
      return;
    }
  }

  // Track history for conversational context
  chatHistory.push({ role: 'user', content: text });
  if (chatHistory.length > 8) chatHistory.shift();

  // Check Enterprise Tools (AD, SCCM, Mist, etc.)
  const handledByTool = await checkEnterpriseTools(text);
  if (handledByTool) {
    removeTyping(typingId);
    return;
  }
  
  console.log("DEBUG: Intent detection complete. Proceeding to AI Prediction...");
  
  let matchedFaq = await getAIPrediction(text);
  
  if (!matchedFaq) {
    matchedFaq = getKeywordPrediction(text);
  }
  
  removeTyping(typingId);
  
  if (matchedFaq) {
    lastMatchedFaq = matchedFaq;
    renderFaqResponse(matchedFaq);
  } else {
    // No FAQ match — still keep talking!
    removeTyping(typingId);
    
    // Quick KB check (non-blocking, short timeout)
    let kbFound = false;
    try {
      const kbController = new AbortController();
      const kbTimeout = setTimeout(() => kbController.abort(), 3000);
      const res = await fetch(`/api/kb/search?q=${encodeURIComponent(text)}`, { signal: kbController.signal });
      clearTimeout(kbTimeout);
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        kbFound = true;
        if (data.data.source === "Self-Learned") {
          appendMessage(`🧠 **From My Memory:**<br>${data.data.content}`, 'ai');
        } else {
          appendMessage(`📚 **Found in TDX KB: ${data.data.title}**<br>${data.data.content}`, 'ai');
        }
      }
    } catch (e) { /* KB unavailable — that's fine, move on */ }
    
    if (!kbFound) {
      // Go straight to AI stream — it shows "Let me think about that..." immediately
      await streamAIResponse(text, typingId);
    }
  }
}

function initiateQA(originalText) {
  // Find potential weak matches
  const words = originalText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  let scores = [];
  
  for (const faq of FAQ_DATA) {
    let score = 0;
    const allKeywords = [...faq.keywords, ...(learnedKeywords[faq.id] || [])];
    
    for (const w of words) {
      if (allKeywords.some(kw => kw.includes(w) || w.includes(kw))) {
        score++;
      }
    }
    if (score > 0) scores.push({ faq, score });
  }
  
  scores.sort((a, b) => b.score - a.score);
  const topMatches = scores.slice(0, 3).map(s => s.faq);
  
  if (topMatches.length > 0) {
    qaState = { originalText, options: topMatches };
    let html = `I'm not exactly sure what you mean. Did you mean one of these? Reply with the number:<br><br>`;
    topMatches.forEach((match, idx) => {
      html += `**${idx + 1}.** ${match.service}<br>`;
    });
    html += `**0.** None of these (Cancel)`;
    appendMessage(html, 'ai');
  } else {
    appendMessage("I'm completely stumped on this one! My local knowledge base doesn't have an answer.", 'ai');
    
    // Proactive Web Search Button
    const chatContainer = document.getElementById('chatMessages');
    const btn = document.createElement('button');
    btn.className = 'ai-cmd-btn';
    btn.style.marginTop = '10px';
    btn.innerHTML = `🌐 Search Google for "${originalText}"`;
    btn.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(originalText)}`, '_blank');
    chatContainer.lastElementChild.querySelector('.msg-bubble').appendChild(btn);
  }
}

function handleQA(text) {
  const num = parseInt(text.trim());
  if (isNaN(num) || num < 0 || num > qaState.options.length) {
    appendMessage("Please reply with a valid number from the options above, or 0 to cancel.", 'ai');
    return;
  }
  
  if (num === 0) {
    appendMessage("Okay, let's start over. Could you describe the issue differently?", 'ai');
    qaState = null;
    return;
  }
  
  const chosenFaq = qaState.options[num - 1];
  
  // Self-learning: Save the user's original text as a new keyword for this FAQ!
  if (!learnedKeywords[chosenFaq.id]) {
    learnedKeywords[chosenFaq.id] = [];
  }
  learnedKeywords[chosenFaq.id].push(qaState.originalText.toLowerCase());
  localStorage.setItem('learnedKeywords', JSON.stringify(learnedKeywords));
  
  appendMessage(`Got it! I've learned that "*${qaState.originalText}*" means **${chosenFaq.service}**. Here is what to do:`, 'ai');
  lastMatchedFaq = chosenFaq;
  renderFaqResponse(chosenFaq);
  qaState = null;
}

// ----- SYSTEM MAINTENANCE & DIAGNOSTICS -----
function clearLocalCache() {
  if (confirm("⚠️ Emergency Reset: This will clear all local settings, saved modules, and session data. You will be logged out. Continue?")) {
    localStorage.clear();
    sessionStorage.clear();
    showToast("Cache cleared. Reloading...", "info");
    setTimeout(() => location.reload(), 1500);
  }
}

async function flushServerSessions() {
  if (!confirm("⚠️ Are you sure? This will force-logout EVERYONE currently using the system.")) return;
  
  try {
    const token = currentUser ? currentUser.token : '';
    const res = await fetch(`/api/admin/clear-sessions?token=${token}`, { method: 'POST' });
    const data = await res.json();
    if (data.status === 'success') {
      showToast("All server sessions flushed!", "success");
      setTimeout(() => location.reload(), 1000);
    } else {
      showToast(data.message || "Failed to flush sessions", "error");
    }
  } catch (e) {
    showToast("Connection error", "error");
  }
}

async function startHeartbeat() {
  // Initial check
  checkOllamaStatus();
  
  // Regular interval check
  setInterval(async () => {
    try {
      // Use the config endpoint as a lightweight health check
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        const statusDot = document.getElementById('aiStatus');
        const statusText = document.getElementById('aiStatusText');
        if (statusDot && statusText) {
          statusDot.className = 'status-dot online';
          statusText.innerText = 'AI Ready (Network)';
          isAIReady = true;
        }
      } else {
        setFallbackStatus();
      }
    } catch (e) {
      setFallbackStatus();
    }
  }, 30000); // Every 30 seconds
}

async function checkEnterpriseTools(text) {
  const lower = text.toLowerCase();
  
  // Self-Learning Intent
  if (lower.startsWith("learn this:") || lower.startsWith("remember this:")) {
    const content = text.replace(/^learn this:/i, '').replace(/^remember this:/i, '').trim();
    if (content.length < 3) return false;
    
    appendMessage(`🧠 Saving to permanent memory...`, 'ai');
    try {
      const token = currentUser ? currentUser.token : '';
      const res = await fetch(`/api/kb/learn?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      const data = await res.json();
      if (data.status === "success") {
        appendMessage(`✅ **Learned!** I will remember this for next time.`, 'ai');
      } else {
        appendMessage(`Failed to learn: ${data.message}`, 'ai');
      }
    } catch (e) { appendMessage("Error connecting to Python backend server.", 'ai'); }
    return true;
  }
  
  // Web Search Intent
  if (lower.startsWith("search google") || lower.startsWith("google ") || lower.startsWith("look up online") || lower.startsWith("search web")) {
    const clean_q = lower.replace("search google", "").replace("google", "").replace("look up online", "").replace("search web", "").trim();
    appendMessage(`🌐 **Web Search Mode Activated**<br>Searching for: *${clean_q}*`, 'ai');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(clean_q)}`, '_blank');
    showToast("Opening Google Search...", "info");
    return true;
  }

  // Unified Trace Intent (Who is connected to, Where is, Trace, Connection status)
  const isTraceIntent = lower.includes("connected to") || lower.includes("where is") || lower.startsWith("trace ") || lower.includes("connection status") || lower.includes("link between");
  
  if (isTraceIntent) {
    let query = text.replace(/connected to|where is|trace|connection status|link between/gi, "").trim();
    if (query.length > 2) {
      appendMessage(`🔗 **Analyzing Unified Connectivity Graph for:** *${query}*...`, 'ai');
      try {
        const token = currentUser ? currentUser.token : '';
        const res = await fetch(`/api/trace/${encodeURIComponent(query)}?token=${token}`);
        const data = await res.json();
        if (data.status === "success") {
          renderTraceResponse(data.data);
        } else {
          appendMessage(`Trace failed: ${data.message}`, 'ai');
        }
      } catch (e) { appendMessage("Error connecting to connectivity engine.", 'ai'); }
      return true;
    }
  }

  // Auto-Detect StarID or Search Intent (Find, Who is, Lookup, Deep Search)
  const starIdMatch = text.match(/\b[a-z]{2}[0-9]{4}[a-z]{2}\b/i);
  const isDeepSearch = lower.startsWith("deep search") || lower.startsWith("scrape") || lower.includes("portal search");
  const isSearchIntent = (lower.startsWith("find ") || lower.startsWith("who is ") || lower.startsWith("lookup ") || lower.startsWith("search ")) && !lower.includes("google");
  
  if (starIdMatch || isSearchIntent || isDeepSearch || lower.includes("check ad") || lower.includes("is locked") || lower.includes("active directory") || lower.includes("ad account") || lower.includes("check starid") || lower.includes("find starid")) {
    let query = "";
    
    if (starIdMatch) {
      query = starIdMatch[0];
    } else {
      const markers = ["deep search", "scrape", "portal search", "for", "find", "who is", "lookup", "search", "check ad", "is locked", "active directory", "ad account", "check starid", "find starid"];
      let bestMarkerIndex = -1;
      for (const marker of markers) {
        const idx = lower.indexOf(marker);
        if (idx !== -1 && idx + marker.length > bestMarkerIndex) {
          bestMarkerIndex = idx + marker.length;
        }
      }
      query = text.substring(bestMarkerIndex).trim().replace(/[^a-zA-Z0-9\s.-]/g, '');
    }
    
    if (query.length < 2) return false;
    
    if (isDeepSearch && query.length === 8) {
      scrapePortal(query);
      return true;
    }

    appendMessage(`🐴 Searching AD/StarID for: **${query}**...`, 'ai');
    
    try {
      const adController = new AbortController();
      const adTimeout = setTimeout(() => adController.abort(), 10000);
      const res = await fetch(`/api/ad/${encodeURIComponent(query)}`, { signal: adController.signal });
      clearTimeout(adTimeout);
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        let html = `**Found ${data.data.length} match(es):**<br><br>`;
        
        data.data.forEach((user, idx) => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding: 8px 0; gap: 15px;">
              <div>
                👤 <strong style="color:var(--text);">${user.DisplayName || 'Unknown'}</strong> 
                <span style="opacity:0.6; font-size:11px; margin-left:5px;">(${user.StarID || 'N/A'})</span>
              </div>
              ${user.StarID ? `
                <button class="btn-small" onclick="event.stopPropagation(); showUnifiedProfile('${user.StarID}', '${user.DisplayName ? user.DisplayName.replace(/'/g, "\\'") : 'User'}')" style="font-size:10.5px; padding: 4px 10px; background:var(--accent); border-radius:4px; font-weight:600; border:none; color:white; cursor:pointer; display:flex; align-items:center; gap:4px;">
                  🔍 Profile
                </button>
              ` : ''}
            </div>
          `;
        });
        
        appendMessage(html, 'ai');
      } else {
        appendMessage(`Search Failed: ${data.message}`, 'ai');
      }
    } catch (e) {
      appendMessage(`⚠️ AD lookup timed out or failed. The network may be slow. Try again in a moment, or use the **AD Management** tab directly.`, 'ai');
    }
    return true;
  }
  
  // SCCM Check Intent
  if (lower.includes("check sccm") || lower.includes("find computer") || lower.includes("find pc") || lower.includes("find this pc")) {
    const words = lower.split(" ");
    const device = words[words.length - 1];
    appendMessage(`🐴 Querying SCCM Database for device: **${device}**...`, 'ai');
    try {
      const res = await fetch(`/api/sccm/${device}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        let html = `<div class="sccm-card">`;
        html += `<div style="font-weight:700; color:var(--accent); margin-bottom:10px;">💻 SCCM Device Found</div>`;
        html += `• **Name:** ${data.data.Name}<br>`;
        html += `• **Resource ID:** ${data.data.ResourceID || 'N/A'}<br>`;
        html += `• **Last Logon:** ${data.data.LastLogonUserName || 'Unknown'}<br>`;
        html += `• **IP Addresses:** ${(data.data.IPAddresses || []).join(', ')}<br>`;
        html += `• **OS:** ${data.data.OperatingSystemNameandVersion || 'Unknown'}<br>`;
        
        if (currentUser && currentUser.role !== 'helpdesk' && data.data.ResourceID) {
            html += `<div class="remote-actions-bar" style="margin-top:15px; display:flex; flex-wrap:wrap; gap:8px;">`;
            html += `<button class="btn-small" onclick="triggerRemoteAction('${data.data.ResourceID}', 'sync_policy', this)">🔄 Sync Policy</button>`;
            html += `<button class="btn-small" onclick="triggerRemoteAction('${data.data.ResourceID}', 'scan_updates', this)">🔍 Scan Updates</button>`;
            html += `<button class="btn-small" onclick="triggerRemoteAction('${data.data.ResourceID}', 'eval_updates', this)">📊 Eval Updates</button>`;
            html += `<button class="btn-small btn-danger" onclick="triggerRemoteAction('${data.data.ResourceID}', 'restart', this)">🔌 Restart</button>`;
            html += `</div>`;
        }
        html += `</div>`;
        appendMessage(html, 'ai');
      } else {
        appendMessage(`SCCM Query Failed: ${data.message}`, 'ai');
      }
    } catch (e) { appendMessage("Error connecting to Python backend server.", 'ai'); }
    return true;
  }
  
  // Mist Check Intent
  if (lower.includes("check mist") || lower.includes("wifi status")) {
    const words = lower.split(" ");
    const mac = words[words.length - 1];
    appendMessage(`🐴 Querying Juniper Mist for client: **${mac}**...`, 'ai');
    try {
      const res = await fetch(`/api/mist/${mac}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        let html = `**Juniper Mist Client Found:**<br>`;
        html += `• **MAC:** ${data.data.MAC}<br>`;
        html += `• **Hostname/Device:** ${data.data.Hostname || 'Unknown'} (${data.data.Device || 'Unknown'})<br>`;
        html += `• **SSID:** ${data.data.SSID || 'Unknown'}<br>`;
        html += `• **IP Address:** ${data.data.IP || 'Unknown'}<br>`;
        html += `• **OS:** ${data.data.OS || 'Unknown'}<br>`;
        html += `• **Auth/PSK:** ${data.data.PSK_Name || 'Unknown'}<br>`;
        html += `• **Connection:** Band ${data.data.Band}, Protocol ${data.data.Protocol}<br>`;
        appendMessage(html, 'ai');
      } else {
        appendMessage(`Mist Query Failed: ${data.message}`, 'ai');
      }
    } catch (e) { appendMessage("Error connecting to Python backend server.", 'ai'); }
    return true;
  }

  // Portal Scraper Intent (Manual)
  if (lower.includes("scrape starid") || lower.includes("portal search")) {
    const starid = text.split(' ').pop().toLowerCase();
    if (starid && starid.length === 8) {
       scrapePortal(starid);
       return true;
    }
  }

  return false;
}

/**
 * Headless Web Scraper for MinnState StarID Admin Portal
 * @param {string} starid 
 */
async function triggerRemoteAction(resourceId, actionType, btn) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "⏳ Sending...";
    
    try {
        const res = await fetch('/api/remote/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resource_id: resourceId, action_type: actionType })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast(`Action ${actionType} triggered!`, 'success');
            btn.innerHTML = "✅ Sent";
            btn.style.background = "var(--green)";
        } else {
            showToast(data.message, 'error');
            btn.innerHTML = "❌ Failed";
            btn.style.background = "var(--red)";
        }
    } catch (e) {
        showToast("Error connecting to server", 'error');
        btn.innerHTML = "❌ Error";
    }
    
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.background = "";
    }, 3000);
}

async function scrapePortal(starid) {
  appendMessage(`🐎 Logging into StarID Admin to fetch details for **${starid}**...<br><span style="font-size:11px; opacity:0.8;">(This takes ~15 seconds using headless browser)</span>`, 'ai');
  try {
    const res = await fetch(`/api/scrape/starid/${starid}`);
    const data = await res.json();
    if (data.status === 'success') {
      const u = data.data[0];
      let html = `<div class="deep-search-card">`;
      html += `<div class="card-header">🏇 Mustang Portal Deep Search</div>`;
      html += `<div class="card-body">`;
      html += `<div class="user-main">`;
      html += `<div class="user-name">${u.Name}</div>`;
      html += `<div class="user-starid">${u.StarID}</div>`;
      html += `</div>`;
      
      html += `<div class="detail-grid">`;
      html += `<div class="detail-item"><span class="label">Email:</span> <span class="val">${u.Email}</span></div>`;
      html += `<div class="detail-item"><span class="label">Status:</span> <span class="val status-${u.ActivationStatus.toLowerCase()}">${u.ActivationStatus}</span></div>`;
      html += `<div class="detail-item"><span class="label">Password Expires:</span> <span class="val">${u.PasswordExpires}</span></div>`;
      html += `<div class="detail-item"><span class="label">TechID:</span> <span class="val">${u.TechID}</span></div>`;
      html += `<div class="detail-item"><span class="label">Library Barcode:</span> <span class="val">${u.LibraryBarcode}</span></div>`;
      if (u.Title !== "N/A") html += `<div class="detail-item"><span class="label">Title:</span> <span class="val">${u.Title}</span></div>`;
      if (u.Department !== "N/A") html += `<div class="detail-item"><span class="label">Dept:</span> <span class="val">${u.Department}</span></div>`;
      html += `</div>`;
      
      html += `<div class="affiliation-box">`;
      html += `<div class="label">Affiliations:</div>`;
      html += `<div class="val">${u.Affiliations}</div>`;
      html += `</div>`;
      
      html += `<div class="card-footer">Verified via MinnState StarID Admin Portal • ${new Date().toLocaleTimeString()}</div>`;
      html += `</div></div>`;
      appendMessage(html, 'ai');
    } else {
      appendMessage(`❌ **Portal Search Failed**<br>${data.message}`, 'ai');
    }
  } catch (e) {
    appendMessage(`❌ **Connection Error**<br>Could not reach the scraping engine.`, 'ai');
  }
}

// ----- DIRECTORY TAB LOGIC -----
async function searchDirectoryTab() {
  const input = document.getElementById('dirSearchInput');
  const rawQuery = input.value.trim();
  if (!rawQuery) return;

  // 1. Clean the query - Strip natural language prefixes (find, search, who is, etc.)
  let cleanQuery = rawQuery.replace(/^(find|search|lookup|who is|show me|get|is)\s+/i, '').trim();
  
  const resultsEl = document.getElementById('directoryResults');
  
  // 2. Smart intent detection: redirect non-name queries to AI chat
  const queryLower = cleanQuery.toLowerCase();
  const navKeywords = ['go to', 'where is', 'directions', 'how to get', 'how do i get', 'navigate', 'library', 'building', 'office', 'room', 'parking', 'help me', 'i want', 'i need', 'what is', 'how do', 'can you', 'tell me'];
  const isNavQuery = navKeywords.some(kw => queryLower.includes(kw));
  const wordCount = cleanQuery.split(/\s+/).length;
  const isRoomCode = /^[a-zA-Z]{2,3}\d{1,4}$/.test(cleanQuery);
  
  if (isNavQuery || wordCount > 5 || isRoomCode) {
    resultsEl.innerHTML = `
      <div class="ticket-placeholder" style="max-width: 500px; margin: 0 auto; text-align: center;">
        <div class="placeholder-icon" style="font-size: 48px; margin-bottom: 12px;">🗺️</div>
        <h3 style="color: var(--accent2); font-size: 18px; margin-bottom: 8px;">Campus Wayfinding Target Detected</h3>
        <p style="color: var(--text2); font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
          <strong>"${cleanQuery.toUpperCase()}"</strong> corresponds to a campus location query rather than a directory profile.<br>Let's map out an interactive step-by-step visual map route!
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn-primary" style="background: var(--accent2); border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
            onclick="launchCustomWayfindingRoute('${cleanQuery.toUpperCase()}')">
            🧭 Generate Step-by-Step AI Map Route
          </button>
          <button class="btn-small" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 12px; cursor: pointer;"
            onclick="switchView('chat'); document.getElementById('userInput').value='${cleanQuery.replace(/'/g, "\\'")}'; sendMessage();">
            💬 Ask AI Assistant in Chat
          </button>
        </div>
      </div>`;
    return;
  }

  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Searching Campus Directory...</h3></div>';

  try {
    const res = await fetch(`/api/ad/${encodeURIComponent(cleanQuery)}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      renderDirectoryResults(data.data, data.source);
    } else {
      resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ ${data.message}</h3></div>`;
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to server</h3></div>';
  }
}

function renderDirectoryResults(users, source = 'Active Directory') {
  const container = document.getElementById('directoryResults');
  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <span style="font-size:12px; color:var(--text2); opacity:0.7;">Source: ${source}</span>
      <span class="badge" style="background:rgba(99,102,241,0.15); color:var(--accent); font-size:10px; padding:4px 8px; border-radius:12px;">Found ${users.length} Account(s)</span>
    </div>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: var(--text2); display: flex; align-items: center; gap: 8px;">
      <span>💡</span>
      <span><strong>Directory Auditing Tip:</strong> If an account shows unassigned details, click <strong>Unified Profile</strong> to run a live MinnState StarID Admin check & retrieve real-time registration, activation status, library barcodes, and live IT telemetry.</span>
    </div>
  `;
  html += `<div class="directory-grid">`;
  
  users.forEach(user => {
    const lockedClass = user.IsLocked ? 'locked' : 'unlocked';
    const displayTitle = (user.Title && user.Title !== 'N/A') ? user.Title : `<span style="opacity:0.5; font-style:italic; font-size:11px;">Standard AD Account</span>`;
    const displayDept = (user.Department && user.Department !== 'N/A') ? user.Department : `<span style="opacity:0.5; font-style:italic; font-size:11px;">General User</span>`;
    
    // Setup headshot picture with fallback
    let avatarHtml = `<div class="dir-avatar">${user.DisplayName ? user.DisplayName[0] : '👤'}</div>`;
    if (user.Headshot) {
      avatarHtml = `
        <div class="dir-avatar" style="background: url('https://www.smsu.edu/directory/${user.Headshot}') center/cover no-repeat; border-radius: 50%;"></div>
      `;
    }

    html += `
      <div class="directory-card ${user.IsLocked ? 'card-locked' : ''}">
        <div class="dir-card-header">
          ${avatarHtml}
          <div class="dir-main-info">
            <div class="dir-name">${user.DisplayName}</div>
            <div class="dir-starid">${user.StarID}</div>
          </div>
          <div class="dir-status ${lockedClass}">${user.IsLocked ? 'Locked' : 'Active'}</div>
        </div>
        <div class="dir-body">
          <div class="dir-item"><strong>Title:</strong> ${displayTitle}</div>
          <div class="dir-item"><strong>Department:</strong> ${displayDept}</div>
          ${user.Office ? `<div class="dir-item" style="display:flex; justify-content:space-between; align-items:center;"><span><strong>Room Number:</strong> 🚪 ${user.Office}</span><span onclick="event.stopPropagation(); copyToClipboard('${user.Office}', this)" style="cursor:pointer; opacity:0.5;">📋</span></div>` : ''}
          ${user.Email ? `<div class="dir-item" style="display:flex; justify-content:space-between; align-items:center;"><span><strong>Email:</strong> 📧 ${user.Email}</span><span onclick="event.stopPropagation(); copyToClipboard('${user.Email}', this)" style="cursor:pointer; opacity:0.5;">📋</span></div>` : ''}
          ${user.Phone ? `<div class="dir-item" style="display:flex; justify-content:space-between; align-items:center;"><span><strong>Phone:</strong> 📞 ${user.Phone}</span><span onclick="event.stopPropagation(); copyToClipboard('${user.Phone}', this)" style="cursor:pointer; opacity:0.5;">📋</span></div>` : ''}
        </div>
        <div class="dir-actions">
           <button class="btn-small" onclick="event.stopPropagation(); copyToClipboard('${user.StarID}', this)">📋 Copy StarID</button>
           <button class="btn-small" onclick="event.stopPropagation(); showUnifiedProfile('${user.StarID}', '${user.DisplayName ? user.DisplayName.replace(/'/g, "\\'") : 'User'}')">🔍 Unified Profile</button>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

// ----- SCCM TAB LOGIC -----
async function searchSCCMTab() {
  const input = document.getElementById('sccmSearchInput');
  const rawQuery = input.value.trim();
  if (!rawQuery) return;

  const resultsEl = document.getElementById('sccmResults');
  
  // 1. Clean the query
  let cleanQuery = rawQuery.replace(/^(find|search|lookup|get|where is|his|her|device|pc|computer|machine)\s+/gi, '')
                           .replace(/\s+(his|her|device|pc|computer|machine|find|lookup)$/gi, '').trim();

  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Analyzing device query...</h3></div>';

  // 2. Smart pattern recognition
  const isMac = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/.test(cleanQuery) || 
                /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/.test(cleanQuery) || 
                /^[0-9A-Fa-f]{12}$/.test(cleanQuery);

  const isStarID = /^[a-z]{2}\d{4}[a-z]{2}$/i.test(cleanQuery);
  const wordCount = cleanQuery.split(/\s+/).length;

  // 3. Handle Name-to-Device resolution (if query is multi-word or doesn't look like a PC/MAC)
  if (!isMac && !isStarID && (wordCount > 1 || !/^[A-Z0-9-]{4,}$/i.test(cleanQuery))) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>🔍 Resolving user identity for device mapping...</h3></div>';
    try {
      // First, find the user's StarID from AD
      const adRes = await fetch(`/api/ad/${encodeURIComponent(cleanQuery)}?token=${currentUser.token}`);
      const adData = await adRes.json();
      
      if (adData.status === 'success' && adData.data.length > 0) {
        const user = adData.data[0];
        const starid = user.StarID || user.samaccountname;
        resultsEl.innerHTML = `<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Found User: ${user.DisplayName}.<br>Searching for assigned devices...</h3></div>`;
        
        // Now search SCCM using the resolved StarID
        const sccmRes = await fetch(`/api/sccm/pc/${starid}?token=${currentUser.token}`);
        const sccmData = await sccmRes.json();
        if (sccmData.status === 'success' && sccmData.data.length > 0) {
          renderSCCMResults(sccmData.data);
          return;
        }
      }
    } catch (err) {
      console.warn("Identity resolution failed, falling back to direct SCCM query.");
    }
  }

  // 4. Fallback to direct SCCM/MAC/Mist query
  const endpoint = isMac ? `/api/sccm/mac/${encodeURIComponent(cleanQuery)}` : `/api/sccm/pc/${encodeURIComponent(cleanQuery)}`;

  try {
    const res = await fetch(`${endpoint}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.data.length > 0) {
      renderSCCMResults(data.data);
    } else {
      if (isMac) {
        resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>🔍 MAC not in SCCM. Scanning Juniper Mist WiFi...</h3></div>';
        try {
          const mistRes = await fetch(`/api/mist/${encodeURIComponent(cleanQuery)}`);
          const mistData = await mistRes.json();
          if (mistData.status === 'success') {
            const client = mistData.data;
            resultsEl.innerHTML = `
              <div style="background: rgba(79, 70, 229, 0.1); border: 1px solid #4f46e5; padding: 12px 16px; border-radius: 8px; margin-bottom: 15px; font-size: 13.5px; line-height: 1.45; animation: slideIn 0.3s ease-out;">
                ℹ️ <strong>Device unmanaged by SCCM:</strong> The MAC address <code>${query}</code> is not registered as an SCCM managed workstation. However, we found an active WiFi session on <strong>Juniper Mist</strong>:
              </div>
              <div class="directory-grid">
                <div class="directory-card" style="border-color: #4f46e5; background: rgba(79, 70, 229, 0.02);">
                  <div class="dir-card-header" style="border-bottom: 1px solid rgba(79, 70, 229, 0.15);">
                    <div class="dir-avatar" style="background:#4f46e5; color:#fff;">📶</div>
                    <div class="dir-main-info">
                      <div class="dir-name" style="color:#fff;">${client.Hostname || 'Wireless Client'}</div>
                      <div class="dir-starid">${client.MAC || query}</div>
                    </div>
                    <div class="dir-status unlocked" style="background: rgba(34, 197, 94, 0.15); color: #22c55e;">Connected</div>
                  </div>
                  <div class="dir-body" style="padding-top:12px;">
                    <div class="dir-item"><strong>Access Point (AP):</strong> ${client.Device || 'N/A'}</div>
                    <div class="dir-item"><strong>SSID:</strong> ${client.SSID || 'N/A'}</div>
                    <div class="dir-item"><strong>IP Address:</strong> ${client.IP || 'N/A'}</div>
                    <div class="dir-item"><strong>Device OS:</strong> ${client.OS || 'N/A'}</div>
                    <div class="dir-item"><strong>Network Band:</strong> ${client.Band || 'N/A'} (${client.Protocol || 'N/A'})</div>
                  </div>
                </div>
              </div>
            `;
          } else {
            resultsEl.innerHTML = `
              <div class="ticket-placeholder">
                <h3>❌ Device not found in SCCM or WiFi</h3>
                <p style="margin-top:6px; font-size:12.5px; opacity:0.75;">The MAC <strong>${query}</strong> is not in SCCM or active on the wireless network.</p>
              </div>
            `;
          }
        } catch (mistErr) {
          console.error("Mist fallback failed:", mistErr);
        }
      } else {
        resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ ${data.message}</h3></div>`;
      }
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to server</h3></div>';
  }
}

function renderSCCMResults(pcs) {
  const container = document.getElementById('sccmResults');
  if (!pcs || pcs.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No PCs found matching this query</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  pcs.forEach(pc => {
    const isOnline = pc.Status === 'Online';
    const statusClass = isOnline ? 'online' : 'offline';
    
    html += `
      <div class="premium-module-card" style="min-width: 380px;">
        <div class="pm-header">
          <div class="pm-avatar" style="background:var(--accent2);">💻</div>
          <div class="pm-title-area">
            <div class="pm-name">${pc.PCName}</div>
            <div class="pm-sub">${pc.User || 'System Managed'}</div>
          </div>
          <div class="pm-status-pill ${statusClass}">${pc.Status}</div>
        </div>
        <div class="pm-body" style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="pm-info-block">
             <div class="pm-info-row"><span class="pm-label">🖥️ OS</span><span class="pm-value">${pc.Model}</span></div>
             <div class="pm-info-row"><span class="pm-label">🏭 Maker</span><span class="pm-value">${pc.Manufacturer || 'N/A'}</span></div>
             <div class="pm-info-row"><span class="pm-label">🆔 Serial</span><span class="pm-value">${pc.SerialNumber || 'N/A'}</span></div>
          </div>
          <div class="pm-info-block">
             <div class="pm-info-row"><span class="pm-label">🕒 Seen</span><span class="pm-value">${pc.LastSeen}</span></div>
             <div class="pm-info-row"><span class="pm-label">🌐 IP</span><span class="pm-value">${pc.IPAddress}</span></div>
             <div class="pm-info-row"><span class="pm-label">📦 Client</span><span class="pm-value">${pc.ClientVersion || 'N/A'}</span></div>
             <div class="pm-info-row"><span class="pm-label">🏰 Site</span><span class="pm-value">${pc.ADSite || 'N/A'}</span></div>
          </div>
        </div>
        <div class="pm-action-bar" style="flex-wrap: wrap;">
          <button class="pm-btn primary" onclick="triggerRemoteAction('${pc.ResourceID}', 'sync_policy', this)" title="Sync Policy">🔄 Sync</button>
          <button class="pm-btn secondary" onclick="triggerRemoteAction('${pc.ResourceID}', 'scan_updates', this)" title="Scan Updates">🔍 Scan</button>
          <button class="pm-btn secondary" onclick="triggerRemoteAction('${pc.ResourceID}', 'eval_updates', this)" title="Eval Updates">🚀 Eval</button>
          <button class="pm-btn secondary" onclick="window.open('rdp://${pc.PCName}')" title="Remote Desktop">🖥️ RDP</button>
          <button class="pm-btn secondary" onclick="window.open('ms-ra:ms-assistance?requestee=${pc.PCName}')" title="Remote Assistance">🤝 MSRA</button>
          <button class="pm-btn danger" onclick="triggerRemoteAction('${pc.ResourceID}', 'reboot', this)" title="Force Reboot">♻️ Reboot</button>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

// ----- MIST TAB LOGIC -----
async function searchMistTab() {
  const input = document.getElementById('mistSearchInput');
  const query = input.value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('mistResults');
  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Querying Mist Cloud API...</h3></div>';

  try {
    const res = await fetch(`/api/mist/${query}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      renderMistResults(data.data);
    } else {
      resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ ${data.message}</h3></div>`;
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to server</h3></div>';
  }
}

// ----- JAMF TAB LOGIC -----
async function searchJamfTab() {
  const input = document.getElementById('jamfSearchInput');
  const query = input.value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('jamfResults');
  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Querying Jamf Cloud Inventory...</h3></div>';

  try {
    const res = await fetch(`/api/jamf/${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.status === 'success' && data.data) {
      renderJamfResults(data.data);
    } else {
      resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ No Apple devices found matching "${query}"</h3></div>`;
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to Jamf Cloud</h3></div>';
  }
}

function renderJamfResults(devices) {
  const container = document.getElementById('jamfResults');
  if (!devices || devices.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No Apple devices found</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  devices.forEach(dev => {
    const isMac = dev.Model.toLowerCase().includes('mac');
    const icon = isMac ? '💻' : '📱';
    
    html += `
      <div class="premium-module-card">
        <div class="pm-header">
          <div class="pm-avatar" style="background:#ef4444;">${icon}</div>
          <div class="pm-title-area">
            <div class="pm-name">${dev.Name}</div>
            <div class="pm-sub">${dev.User || 'Assigned Student/Staff'}</div>
          </div>
          <div class="pm-status-pill online">Managed</div>
        </div>
        <div class="pm-body">
          <div class="pm-info-block">
             <div class="pm-info-row"><span class="pm-label">🛠️ Model</span><span class="pm-value">${dev.Model}</span></div>
             <div class="pm-info-row"><span class="pm-label">🖥️ OS Version</span><span class="pm-value">${dev.OSVersion}</span></div>
             <div class="pm-info-row"><span class="pm-label">🌐 IP Address</span><span class="pm-value">${dev.IPAddress}</span></div>
             <div class="pm-info-row"><span class="pm-label">🕒 Last Contact</span><span class="pm-value">${dev.LastContact}</span></div>
          </div>
        </div>
        <div class="pm-action-bar">
          <button class="pm-btn primary" onclick="window.open('https://smsu.jamfcloud.com/')" style="background:#ef4444;">🍎 Open in Jamf</button>
          <button class="pm-btn secondary" onclick="showToast('Remote Lock initiated via HITL', 'warning')">🔒 Remote Lock</button>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}


function renderDirectoryResults(results) {
  const container = document.getElementById('directoryResults');
  if (!results || results.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No matches found in the directory</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  results.forEach(person => {
    const avatarColor = person.Source.includes('StarID') ? '#3b82f6' : '#6366f1';
    const initials = person.FullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    html += `
      <div class="premium-module-card">
        <div class="pm-header">
          <div class="pm-avatar" style="background:${avatarColor};">${initials}</div>
          <div class="pm-title-area">
            <div class="pm-name">${person.FullName}</div>
            <div class="pm-sub">${person.Title || 'Staff Member'}</div>
          </div>
          <div class="pm-status-pill online">ACTIVE</div>
        </div>
        <div class="pm-body">
          <div class="pm-info-row">
            <span class="pm-label">🆔 StarID</span>
            <span class="pm-value">${person.StarID}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">🏢 Dept</span>
            <span class="pm-value">${person.Department || 'N/A'}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">📍 Location</span>
            <span class="pm-value">${person.Location} - ${person.Room}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">📧 Email</span>
            <span class="pm-value">${person.PrimaryEmail}</span>
          </div>
        </div>
        <div class="pm-action-bar">
          <button class="pm-btn secondary" onclick="openUnifiedProfile('${person.StarID}')">👤 View Profile</button>
          <button class="pm-btn primary" onclick="copyToClipboard('${person.PrimaryEmail}')">📋 Copy Email</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderMistResults(clients) {
  const container = document.getElementById('mistResults');
  if (!clients || clients.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No clients found for this MAC</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  clients.forEach(client => {
    // Calculate signal bar color
    const rssi = parseInt(client.rssi);
    let signalColor = '#ef4444'; // Red
    if (rssi > -60) signalColor = '#10b981'; // Green
    else if (rssi > -80) signalColor = '#f59e0b'; // Orange
    
    html += `
      <div class="premium-module-card">
        <div class="pm-header">
          <div class="pm-avatar" style="background:#4f46e5;">📶</div>
          <div class="pm-title-area">
            <div class="pm-name">${client.hostname || 'Mobile Client'}</div>
            <div class="pm-sub">${client.mac}</div>
          </div>
          <div class="pm-status-pill online">CONNECTED</div>
        </div>
        <div class="pm-body">
          <div class="pm-info-row">
            <span class="pm-label">📍 Access Point</span>
            <span class="pm-value">${client.ap_name || 'Campus WiFi'}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">📡 SSID</span>
            <span class="pm-value">${client.ssid || 'SMSU-Secure'}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">📶 Signal (RSSI)</span>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="pm-value">${client.rssi} dBm</span>
              <div class="signal-bar-container">
                <div class="signal-fill" style="width:${Math.max(10, 100 + rssi)}%; background:${signalColor};"></div>
              </div>
            </div>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">🌐 IP Address</span>
            <span class="pm-value">${client.ip || 'N/A'}</span>
          </div>
        </div>
        <div class="pm-action-bar">
          <button class="pm-btn secondary" onclick="copyToClipboard('${client.mac}')">📋 Copy MAC</button>
          <button class="pm-btn primary" onclick="showToast('Initiating connection trace...', 'success')">🔭 Trace Link</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// ----- CISCO ISE TAB LOGIC -----
async function searchIseTab() {
  const input = document.getElementById('iseSearchInput');
  const query = input.value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('iseResults');
  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">🛡️</div><h3>Querying Cisco Identity Services Engine (ISE)...</h3></div>';

  try {
    const res = await fetch(`/api/ise/${query}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      renderIseResults(data.data);
    } else {
      resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ ${data.message}</h3></div>`;
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to Cisco ISE Security services</h3></div>';
  }
}

function renderIseResults(sessions) {
  const container = document.getElementById('iseResults');
  if (!sessions || sessions.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No active network sessions found for this client</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  sessions.forEach(session => {
    const isQuarantined = session.status.toLowerCase() === 'quarantined';
    const statusClass = isQuarantined ? 'offline' : 'online';
    
    html += `
      <div class="premium-module-card" style="${isQuarantined ? 'border-color:var(--red);' : ''}">
        <div class="pm-header">
          <div class="pm-avatar" style="background:${isQuarantined ? 'var(--red)' : 'var(--accent)'};">🛡️</div>
          <div class="pm-title-area">
            <div class="pm-name">${session.username || 'Dynamic Endpoint'}</div>
            <div class="pm-sub">${session.mac}</div>
          </div>
          <div class="pm-status-pill ${statusClass}">${session.status}</div>
        </div>
        <div class="pm-body">
          <div class="pm-info-row">
            <span class="pm-label">🛡️ Policy</span>
            <span class="pm-value" style="color:var(--accent2);">${session.policy}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">🔌 VLAN</span>
            <span class="pm-value">${session.vlan}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">🏷️ Profile</span>
            <span class="pm-value">${session.profile}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">🔗 Access Point</span>
            <span class="pm-value">${session.ap || 'Wired Link'}</span>
          </div>
          <div class="pm-info-row">
            <span class="pm-label">📍 Switch / Port</span>
            <span class="pm-value">${session.switch_ip} : ${session.switch_port}</span>
          </div>
        </div>
        <div class="pm-action-bar">
          <button class="pm-btn primary" onclick="triggerIseAction('${session.mac}', '${session.username}', 'reauthorize')">⚡ Restore CoA</button>
          <button class="pm-btn danger" onclick="triggerIseAction('${session.mac}', '${session.username}', 'quarantine')">🛡️ Quarantine</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

async function triggerIseAction(mac, username, actionType) {
  if (!currentUser) {
    showToast("Session expired, please login", "error");
    return;
  }
  
  const resultsEl = document.getElementById('iseResults');
  resultsEl.innerHTML = `<div class="ticket-placeholder"><div class="placeholder-icon rotating">🛡️</div><h3>Dispatching Change of Authorization (CoA) to Cisco ISE...</h3></div>`;

  try {
    const res = await fetch(`/api/admin/ise/${actionType}?token=${currentUser.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mac: mac, username: username })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast(data.message, "success");
      // Refresh lookup
      const searchInput = document.getElementById('iseSearchInput');
      if (searchInput) {
        searchInput.value = mac;
        searchIseTab();
      }
    } else {
      showToast(data.message || "Operation failed", "error");
      searchIseTab();
    }
  } catch (e) {
    showToast("Network error executing security enforcement", "error");
    searchIseTab();
  }
}

function getKeywordPrediction(text) {
  const lowerText = text.toLowerCase();
  
  // Real Directory Lookup Logic
  const isDirectoryQuery = lowerText.includes('who') || lowerText.includes('where') || lowerText.includes('room') || lowerText.includes('directory') || lowerText.includes('sit');
  
  if (isDirectoryQuery && directoryData.length > 0) {
    // Check if they are asking about a room (e.g. "b224" or "CH 216")
    const words = lowerText.split(/\s+/);
    let matchedPerson = null;
    let isRoomQuery = false;
    
// Global variable for directory data (used in chat intent detection)
    // Look for room match
    for (const person of directoryData) {
      if (person.office) {
        const officeLower = person.office.toLowerCase().replace(/\s+/g, '');
        // Check if any word in the text matches the office
        if (words.some(w => officeLower.includes(w.replace(/\s+/g, '')) && w.length > 2)) {
          matchedPerson = person;
          isRoomQuery = true;
          break;
        }
      }
    }
    
    // If not a room, look for exact name match to prevent false positives with common words
    if (!matchedPerson) {
      for (const person of directoryData) {
        if (person.fullName && person.firstName && person.lastName) {
          const first = person.firstName.toLowerCase();
          const last = person.lastName.toLowerCase();
          const full = person.fullName.toLowerCase();
          
          if (lowerText.includes(full) || (lowerText.includes(first) && lowerText.includes(last))) {
            matchedPerson = person;
            break;
          }
        }
      }
    }
    
    if (matchedPerson) {
      return {
        service: "Staff Directory Result",
        count: "N/A",
        category: "Information",
        info: [
          `**Name:** ${matchedPerson.fullName}`,
          `**Title:** ${matchedPerson.title}`,
          `**Department:** ${matchedPerson.departments.join(', ')}`,
          `**Office Room:** ${matchedPerson.office || 'Not listed'}`,
          `**Phone:** ${matchedPerson.phone || 'Not listed'}`,
          `**Email:** ${matchedPerson.email}`
        ],
        steps: ["This information is pulled live from the SMSU directory.", "Directory requests do not require a TDX ticket unless the user is requesting an office move or name change."],
        form: { Classification:"N/A", Service:"N/A", Urgency:"N/A", RespGroup:"N/A", Title:"N/A" },
        escalate: null,
        links: ["https://www.smsu.edu/directory/index.html"],
        office: matchedPerson.office
      };
    }
  }
  
  let bestMatch = null;
  let maxScore = 0;
  const learnedKeywords = JSON.parse(localStorage.getItem('trc_learned_keywords')) || {};
  
  for (const faq of FAQ_DATA) {
    let score = 0;
    // Combine hardcoded keywords with any learned keywords from localStorage
    const allKeywords = [...faq.keywords, ...(learnedKeywords[faq.id] || [])];
    
    for (const kw of allKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        // Boost exact learned phrase matches heavily
        score += (learnedKeywords[faq.id] && learnedKeywords[faq.id].includes(kw)) ? 5 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }
  
  return maxScore > 0 ? bestMatch : null;
}

let chatHistory = [];

async function streamAIResponse(query, typingId) {
  console.log("DEBUG: Entering streamAIResponse...");
  const container = document.getElementById('chatMessages');
  
  // IMMEDIATELY show a message — never leave user staring at dots
  removeTyping(typingId);
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg ai';
  msgDiv.innerHTML = `
    <div class="msg-avatar">🐴</div>
    <div class="msg-bubble" id="streaming-${typingId}" style="opacity:0.7; font-style:italic;">Let me think about that...</div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  const bubble = document.getElementById(`streaming-${typingId}`);
  
  try {
    const payload = { 
      prompt: query, 
      history: chatHistory,
      token: currentUser ? currentUser.token : null
    };
    const controller = new AbortController();
    const streamTimeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    // As soon as first byte arrives, switch to normal style
    bubble.style.opacity = '1';
    bubble.style.fontStyle = 'normal';
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      text += chunk;
      bubble.innerHTML = text.replace(/\n/g, '<br>');
      container.scrollTop = container.scrollHeight;
    }
    clearTimeout(streamTimeout);
    
    if (!text.trim()) {
      bubble.innerHTML = "I didn't get a response. Could you rephrase your question? For example:<br>• What specific issue are you seeing?<br>• Which device or service is affected?";
    }
    
    // Check if the AI response suggests a specific category we know about
    const lowerText = text.toLowerCase();
    const match = FAQ_DATA.find(f => lowerText.includes(f.service.toLowerCase()));
    if (match) {
        bubble.innerHTML += `<br><br><button class="ai-cmd-btn" onclick="renderFaqResponse(${JSON.stringify(match).replace(/"/g, '&quot;')})">📖 View Official Procedure: ${match.service}</button>`;
    }
    
    // Add AI response to history
    chatHistory.push({ role: 'assistant', content: text });
    if (chatHistory.length > 8) chatHistory.shift();
    
  } catch (err) {
    // NEVER get stuck — always give a helpful response
    bubble.style.opacity = '1';
    bubble.style.fontStyle = 'normal';
    bubble.innerHTML = `I'm having trouble connecting to the AI engine right now, but I can still help!<br><br>
      <strong>💡 Try one of these:</strong><br>
      • "Student can't log in" → I'll find the right procedure<br>
      • "How do I get to CH104" → Instant directions<br>
      • "Check AD for ab1234cd" → Account lookup<br><br>
      <button class="ai-cmd-btn" onclick="switchView('faq')">📚 Browse All Procedures</button>
      <button class="ai-cmd-btn" onclick="switchView('wayfinding')">🗺️ Campus Maps</button>`;
  }
}

async function getAIPrediction(text) {
  // Construct a prompt asking the model to classify the text into one of our categories
  const categoriesList = FAQ_DATA.map(f => f.service).join(", ");
  const prompt = `You are a Help Desk Assistant. Map the following user issue to the most appropriate service category from this list: [${categoriesList}]. Issue: "${text}". ONLY output the exact name of the category from the list, nothing else.`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s max — don't block the user

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ 
        prompt,
        token: currentUser ? currentUser.token : null
      })
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const predictedCategory = data.response.trim();
      
      const match = FAQ_DATA.find(f => f.service.toLowerCase() === predictedCategory.toLowerCase());
      return match || getKeywordPrediction(text);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("AI Prediction timed out or failed, falling back to keywords.");
  }
  return null;
}

function appendMessage(text, sender) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.innerText = sender === 'user' ? (localStorage.getItem('trc_avatar') || '🤠') : '🐴';
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTyping(id) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ai`;
  msgDiv.id = id;
  
  msgDiv.innerHTML = `
    <div class="msg-avatar">🐴</div>
    <div class="msg-bubble typing">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function renderFaqResponse(faq) {
  let html = `<span class="category-tag">${faq.service}</span><br><br>`;
  html += `<strong>📋 Info to Gather:</strong><br>`;
  faq.info.forEach(i => html += `• ${i}<br>`);
  
  html += `<br><strong>🔧 Steps to Resolve:</strong><br>`;
  faq.steps.forEach(s => html += `<div class="step">${s}</div>`);
  
  html += `<br><strong>📋 TDX Form Setup:</strong><br>`;
  html += `<div class="field-row"><span class="field-label">Classification:</span><span class="field-val">${faq.form.Classification}</span></div>`;
  html += `<div class="field-row"><span class="field-label">Service:</span><span class="field-val">${faq.form.Service}</span></div>`;
  html += `<div class="field-row"><span class="field-label">Title format:</span><span class="field-val">${faq.form.Title}</span></div>`;
  html += `<div class="field-row"><span class="field-label">Responsible:</span><span class="field-val">${faq.form.RespGroup}</span></div>`;
  
  if (faq.escalate) {
    html += `<div class="escalate"><strong>🤠 Escalate to:</strong> ${faq.escalate}</div>`;
  }
  
  // Add Troubleshooting Web Links
  if (faq.service !== "Staff Directory Result") {
    html += `<br><div style="font-size: 13px; color: var(--text-muted); margin-top: 10px;">
      <strong>🔍 Need deeper troubleshooting?</strong><br>
      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <a href="https://services.smsu.edu/TDClient/180/Portal/KB/Search?SearchText=${encodeURIComponent(faq.service)}" target="_blank" style="padding: 4px 10px; background: rgba(30, 161, 242, 0.1); color: var(--primary); border: 1px solid var(--primary); border-radius: 4px; text-decoration: none;">Search SMSU KB</a>
        <a href="https://www.google.com/search?q=troubleshoot+${encodeURIComponent(faq.service.replace(/\(.*\)/, ''))}" target="_blank" style="padding: 4px 10px; background: rgba(255, 255, 255, 0.05); color: #ccc; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; text-decoration: none;">Search Web</a>
      </div>
    </div>`;
  }
  
  if (faq.office) {
    html += `<br><button class="ai-cmd-btn" style="width:100%; margin-top:10px;" onclick="getDirections('${faq.office}')">🧭 Get Walking Directions</button>`;
  }
  
  appendMessage(html, 'ai');
}

// ----- FAQ LIBRARY LOGIC -----
function renderFilters() {
  const container = document.getElementById('faqFilters');
  const categories = [...new Set(FAQ_DATA.map(f => f.category))].sort();
  
  let html = `<button class="filter-chip active" onclick="filterCategory('All', this)">All</button>`;
  categories.forEach(cat => {
    html += `<button class="filter-chip" onclick="filterCategory('${cat}', this)">${cat}</button>`;
  });
  container.innerHTML = html;
}

let currentFilterCat = 'All';

function filterCategory(cat, btnEl) {
  currentFilterCat = cat;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  filterFAQ();
}

function filterFAQ() {
  const query = document.getElementById('faqSearch').value.toLowerCase();
  
  const filtered = FAQ_DATA.filter(faq => {
    const matchCat = currentFilterCat === 'All' || faq.category === currentFilterCat;
    const matchQuery = faq.service.toLowerCase().includes(query) || faq.keywords.some(k => k.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });
  
  renderFAQGrid(filtered);
}

function renderFAQGrid(data = FAQ_DATA) {
  const container = document.getElementById('faqGrid');
  container.innerHTML = '';
  
  data.forEach(faq => {
    const card = document.createElement('div');
    card.className = 'faq-card';
    card.onclick = () => openModal(faq);
    
    card.innerHTML = `
      <div class="faq-card-header">
        <div class="faq-card-title">${faq.service}</div>
        <div class="faq-card-count">${faq.count} tickets</div>
      </div>
      <div class="faq-card-cat">${faq.category}</div>
      <div class="faq-card-preview">Steps: ${faq.steps[0]}...</div>
    `;
    container.appendChild(card);
  });
}

function openModal(faq) {
  const modalHtml = `
    <div class="faq-modal-overlay" id="faqModal" onclick="closeModal(event)">
      <div class="faq-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal(null, true)">Close</button>
        <div class="faq-card-cat">${faq.category}</div>
        <h2>${faq.service}</h2>
        <div class="meta">Based on ${faq.count} resolved tickets</div>
        
        <div class="faq-section">
          <h3>📋 Info to Gather</h3>
          <ul>
            ${faq.info.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
        
        <div class="faq-section">
          <h3>🔧 Resolution Steps</h3>
          <ul>
            ${faq.steps.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        
        <div class="faq-section">
          <h3>📝 TDX Ticket Details</h3>
          <table class="form-fields-table">
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Classification</td><td>${faq.form.Classification}</td></tr>
            <tr><td>Service</td><td>${faq.form.Service}</td></tr>
            <tr><td>Ticket Title</td><td>${faq.form.Title}</td></tr>
            <tr><td>Responsible Group</td><td>${faq.form.RespGroup}</td></tr>
            <tr><td>Urgency</td><td>${faq.form.Urgency}</td></tr>
          </table>
        </div>
        
        ${faq.escalate ? `
        <div class="faq-section">
          <h3>🤠 Escalation Path</h3>
          <div style="background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b; padding: 10px 14px; font-size: 13px;">
            ${faq.escalate}
          </div>
        </div>` : ''}
        
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeModal(e, force) {
  if (force || e.target.id === 'faqModal') {
    const modal = document.getElementById('faqModal');
    if (modal) modal.remove();
  }
}

// ----- FORM GUIDE LOGIC -----
function renderFormGuide() {
  const container = document.getElementById('formGuide');
  let html = '<h2>New Ticket Fields</h2>';
  
  TDX_FORM_FIELDS.forEach(field => {
    html += `
      <div class="form-field-card">
        <h3>${field.field} ${field.required ? '<span class="required">(Required)</span>' : '<span class="optional">(Optional)</span>'}</h3>
        <p>${field.description}</p>
        <div class="tip">💡 <strong>Tip:</strong> ${field.tip}</div>
      </div>
    `;
  });

  html += '<h2 style="margin-top:40px;">Searching & Filtering Tickets</h2>';
  TDX_SEARCH_FIELDS.forEach(field => {
    html += `
      <div class="form-field-card" style="border-left: 4px solid var(--accent2);">
        <h3>${field.field}</h3>
        <p>${field.description}</p>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ----- TICKETS LOGIC -----
let activeTickets = [];

async function suggestTdxComment(ticketId) {
  const ticket = activeTickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const area = document.getElementById(`aiCommentArea-${ticketId}`);
  const textarea = document.getElementById(`aiDraftComment-${ticketId}`);
  
  area.classList.remove('hidden');
  textarea.value = "Generating draft fix...";
  textarea.disabled = true;

  try {
    const prompt = `Based on this ticket description: "${ticket.description}", suggest a professional technical comment/fix to post for the user. Include any relevant TRC procedures if applicable. Output ONLY the comment body, no other text.`;
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, token: currentUser ? currentUser.token : null })
    });
    const data = await res.json();
    textarea.value = data.response.trim();
  } catch (e) {
    textarea.value = "Failed to generate suggestion. Please write your comment manually.";
  } finally {
    textarea.disabled = false;
  }
}

function copyTdxComment(ticketId) {
  const textarea = document.getElementById(`aiDraftComment-${ticketId}`);
  const comment = textarea.value.trim();
  if (!comment) {
    showToast("Nothing to copy", "error");
    return;
  }

  // 1. Try modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(comment).then(() => {
      showToast("Suggestion copied! Paste it manually in TDX.", "success");
      highlightTdxLink(ticketId);
    }).catch(err => useLegacyCopy(textarea, ticketId));
  } else {
    // 2. Fallback for non-secure contexts (HTTP)
    useLegacyCopy(textarea, ticketId);
  }
}

function useLegacyCopy(textarea, ticketId) {
  try {
    textarea.select();
    const successful = document.execCommand('copy');
    if (successful) {
      showToast("Copied via fallback! Paste in TDX.", "success");
      highlightTdxLink(ticketId);
    } else {
      showToast("Please press Ctrl+C to copy.", "warning");
    }
  } catch (err) {
    showToast("Please select and copy manually.", "error");
  }
}

function highlightTdxLink(ticketId) {
  const tdxLink = document.querySelector(`a[href*="TicketID=${ticketId}"]`);
  if (tdxLink) {
    tdxLink.style.boxShadow = "0 0 15px var(--accent)";
    setTimeout(() => tdxLink.style.boxShadow = "none", 3000);
  }
}

async function loadTicketFeed(ticketId) {
  const feedList = document.getElementById(`ticketFeedList-${ticketId}`);
  feedList.innerHTML = '<div style="font-size:12px; color:var(--text2);">⏳ Loading live feed...</div>';

  try {
    const res = await fetch(`/api/tdx/tickets/${ticketId}/feed`);
    const data = await res.json();
    if (data.status === 'success') {
      feedList.innerHTML = '';
      data.data.forEach(entry => {
        const div = document.createElement('div');
        div.style.background = 'rgba(255,255,255,0.02)';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.border = '1px solid rgba(255,255,255,0.05)';
        
        const dateStr = new Date(entry.date).toLocaleString();
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <strong style="font-size:11px; color:var(--accent);">${entry.author}</strong>
            <span style="font-size:10px; color:var(--text2); opacity:0.6;">${dateStr}</span>
          </div>
          <div style="font-size:12px; line-height:1.4;">${entry.text}</div>
        `;
        feedList.appendChild(div);
      });
      if (data.data.length === 0) {
         feedList.innerHTML = '<p style="font-size:12px; color:var(--text2);">No activity recorded in feed yet.</p>';
      }
    }
  } catch (e) {
    feedList.innerHTML = '<p style="font-size:12px; color:var(--red);">Failed to sync feed.</p>';
  }
}

async function loadTickets() {
  const listEl = document.getElementById('ticketsList');
  listEl.innerHTML = '<div class="ticket-placeholder" style="height:auto; padding:40px;"><div class="placeholder-icon" style="font-size:32px;">⏳</div><p>Fetching tickets...</p></div>';
  
  try {
    const res = await fetch(`/api/tdx/tickets?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      activeTickets = data.data;
      renderTicketList(activeTickets);
    }
  } catch (e) {
    listEl.innerHTML = '<p style="padding:20px; color:var(--red);">Failed to load tickets. Is the server running?</p>';
  }
}

function renderTicketList(tickets) {
  const container = document.getElementById('ticketsList');
  container.innerHTML = '';
  
  tickets.forEach(ticket => {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.id = `ticket-card-${ticket.id}`;
    card.onclick = () => showTicketDetail(ticket.id);
    
    const statusClass = ticket.status.toLowerCase().includes('process') ? 'status-process' : 'status-new';
    const priorityClass = ticket.priority.toLowerCase() === 'high' ? 'priority-high' : '';
    const sourceBadge = ticket.source === 'LIVE' ? '<span class="badge-live">LIVE</span>' : '';
    
    card.innerHTML = `
      <div class="ticket-card-header">
        <span class="ticket-id">#${ticket.id} ${sourceBadge}</span>
        <span class="ticket-status ${statusClass}">${ticket.status}</span>
      </div>
      <div class="ticket-card-title">${ticket.title}</div>
      <div class="ticket-card-meta">
        <span>🤠 ${ticket.requestor}</span>
        <span class="${priorityClass}">🚩 ${ticket.priority}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

async function showTicketDetail(id) {
  const ticket = activeTickets.find(t => t.id === id);
  if (!ticket) return;
  
  // Update active state in list
  document.querySelectorAll('.ticket-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`ticket-card-${id}`).classList.add('active');
  lastViewedTicket = ticket;
  
  // Parse requestor StarID if present
  const reqStarIdMatch = (ticket.requestor || '').match(/[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{2}/);
  const reqStarId = reqStarIdMatch ? reqStarIdMatch[0] : '';
  
  const statusClass = ticket.status.toLowerCase().includes('process') ? 'status-process' : 'status-new';
  const createdDate = ticket.created ? new Date(ticket.created).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  
  const detailEl = document.getElementById('ticketDetail');
  detailEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <div class="detail-title" style="margin-bottom:4px;">${ticket.title}</div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <span style="font-size:12px; color:var(--text2);">#${ticket.id}</span>
          <span class="ticket-status ${statusClass}" style="font-size:11px;">${ticket.status}</span>
          <span style="font-size:12px;" class="${ticket.priority === 'High' ? 'priority-high' : ''}">🚩 ${ticket.priority}</span>
          <span style="font-size:12px; color:var(--text2);">📅 ${createdDate}</span>
        </div>
      </div>
      <a href="https://services.smsu.edu/TDNext/Apps/181/Tickets/TicketDet?TicketID=${ticket.id}" 
         target="_blank" 
         style="background:var(--accent); color:#fff; text-decoration:none; padding:6px 14px; font-size:11px; border-radius:6px; display:flex; align-items:center; gap:6px; white-space:nowrap;">
         🌐 View in TDX
      </a>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; padding:12px;">
        <div style="font-size:10px; text-transform:uppercase; color:var(--text2); margin-bottom:6px; letter-spacing:0.5px;">Requestor</div>
        <div style="font-size:14px; font-weight:600; color:var(--text);">👤 ${ticket.requestor}</div>
        ${reqStarId ? `<div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn-small" style="font-size:10px; padding:3px 8px;" onclick="showUnifiedProfile('${reqStarId}', '${(ticket.requestor || '').replace(/'/g, "\\\\'")}')">🔍 Profile</button>
          <button class="btn-small" style="font-size:10px; padding:3px 8px;" onclick="copyToClipboard('${reqStarId}')">📋 ${reqStarId}</button>
        </div>` : ''}
      </div>
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; padding:12px;">
        <div style="font-size:10px; text-transform:uppercase; color:var(--text2); margin-bottom:6px; letter-spacing:0.5px;">Service</div>
        <div style="font-size:13px; font-weight:600; color:var(--accent2);">⚙️ ${ticket.service}</div>
      </div>
    </div>
    
    <details style="margin-bottom:16px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:8px;">
      <summary style="padding:12px 16px; cursor:pointer; font-size:12px; font-weight:600; color:var(--text2);">📝 Original Description</summary>
      <div style="padding:0 16px 14px 16px; font-size:13px; line-height:1.6; color:var(--text);">${ticket.description}</div>
    </details>
    
    <div id="aiBriefingContainer" class="briefing-card" style="border-left:3px solid var(--accent);">
      <div class="placeholder-icon" style="font-size:24px; animation: bounce 1s infinite;">🐴</div>
      <p style="text-align:center; font-size:12px; color:var(--text2);">AI is generating your tech briefing...</p>
    </div>
    
    <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
      <button class="btn-small" style="background:var(--accent); border:none; color:#fff;" onclick="askAIAboutTicket()">💬 Ask AI About This</button>
      <button class="btn-small" style="background:var(--accent2); border:none; color:#fff;" onclick="suggestTdxComment('${ticket.id}')">🤖 Suggest Fix & Comment</button>
      <a href="https://services.smsu.edu/TDNext/Apps/181/Tickets/TicketDet?TicketID=${ticket.id}" target="_blank" class="btn-small" style="text-decoration:none; color:var(--text);">📝 Open in TDX Next</a>
      ${reqStarId ? `<button class="btn-small" onclick="switchView('chat'); document.getElementById('userInput').value='find ${reqStarId}'; sendMessage();">🔎 Lookup ${reqStarId}</button>` : ''}
      <button class="btn-small" onclick="loadTicketFeed('${ticket.id}')">🔄 Refresh Feed</button>
    </div>

    <!-- AI Comment Suggestion Area -->
    <div id="aiCommentArea-${ticket.id}" class="hidden" style="margin-top:20px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:15px; animation: slideIn 0.3s ease-out;">
      <div style="font-size:11px; color:var(--accent2); margin-bottom:10px; font-weight:700;">🤖 AI SUGGESTED COMMENT</div>
      <textarea id="aiDraftComment-${ticket.id}" style="width:100%; height:120px; background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:8px; color:#fff; padding:10px; font-family:inherit; font-size:13px; resize:vertical;"></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
        <span style="font-size:10px; color:var(--text2); opacity:0.6;">* Don't forget to add your name to the comment in TDX</span>
        <div style="display:flex; gap:8px;">
          <button class="btn-small" style="background:transparent; border:1px solid var(--border);" onclick="this.parentElement.parentElement.parentElement.classList.add('hidden')">Cancel</button>
          <button class="btn-small" style="background:var(--accent2); border:none; color:#fff;" onclick="copyTdxComment('${ticket.id}')">📋 Copy for Manual Posting</button>
        </div>
      </div>
    </div>
    
    <div id="ticketFeedContainer-${ticket.id}" style="margin-top:20px;">
       <h4 style="font-size: 11px; color: var(--text2); text-transform:uppercase; letter-spacing:1px;">Activity Feed</h4>
       <div id="ticketFeedList-${ticket.id}" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
          <p style="font-size:12px; color:var(--text2); font-style:italic;">Click "Refresh Feed" to pull live comments...</p>
       </div>
    </div>
    
    <div id="kbSuggestionsContainer" class="kb-suggestions hidden">
      <h4 style="font-size: 11px; color: var(--accent2); margin-top: 20px;">AI Recommended Procedures</h4>
      <div id="kbSuggestionList" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;"></div>
    </div>
  `;
  
  generateAIBriefing(ticket);
  matchKnowledgeBase(ticket);
}

async function matchKnowledgeBase(ticket) {
  try {
    const res = await fetch(`/api/kb/search?q=${encodeURIComponent(ticket.title)}&token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.results.length > 0) {
      const container = document.getElementById('kbSuggestionsContainer');
      const list = document.getElementById('kbSuggestionList');
      container.classList.remove('hidden');
      list.innerHTML = data.results.slice(0, 3).map(res => `
        <div class="kb-chip" onclick="switchView('faq'); document.getElementById('faqSearchInput').value='${res.item.q}'; filterFAQ();">
          📖 ${res.item.q}
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function generateAIBriefing(ticket, retryCount = 0) {
  const container = document.getElementById('aiBriefingContainer');
  if (!container) return;
  
  container.innerHTML = `<div class="loading-briefing"><span class="spinner"></span> 🐴 AI is analyzing ticket history...</div>`;
  
  // Build feed timeline for AI context
  let feedContext = 'No activity feed available.';
  if (ticket.feed && ticket.feed.length > 0) {
    feedContext = ticket.feed.map(f => {
      const d = new Date(f.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `[${d}] ${f.author} (${f.type}): ${f.text}`;
    }).join('\n');
  }
  
  const prompt = `You are a Senior IT Tech at SMSU TRC. Analyze this ticket's FULL HISTORY and brief the incoming tech on what's happening.

  Ticket #${ticket.id}: ${ticket.title}
  Status: ${ticket.status} | Priority: ${ticket.priority} | Service: ${ticket.service}
  Requestor: ${ticket.requestor}
  Description: ${ticket.description}
  
  === TICKET FEED (Activity Timeline) ===
  ${feedContext}
  === END FEED ===
  
  Format your response EXACTLY like this:
  CURRENT STATE: [What is the current status of this ticket based on the feed? What has been done so far? Who was the last person to act?]
  TECH ACTION: [What should the tech picking this up do RIGHT NOW? Be specific.]
  ESCALATION: [Who should be contacted if it can't be resolved? Any specific person mentioned in the feed?]
  CLOSING NOTES: [What info should be included when updating/closing this ticket?]`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for deep analysis
    
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        token: currentUser ? currentUser.token : null
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      const text = data.response;
      
      // If AI returned an offline/error message, fall through to smart fallback
      if (text.includes("AI engine is offline") || text.includes("AI Engine error") || text.includes("AI connection dropped")) {
        throw new Error("ai_offline");
      }

      // Basic parser for our new format
      const stateMatch = text.match(/CURRENT STATE:(.*?)(?=TECH ACTION:|$)/si);
      const actionMatch = text.match(/TECH ACTION:(.*?)(?=ESCALATION:|$)/si);
      const escMatch = text.match(/ESCALATION:(.*?)(?=CLOSING NOTES:|$)/si);
      const closingMatch = text.match(/CLOSING NOTES:(.*?)$/si);

      const currentState = stateMatch ? stateMatch[1].trim() : "See ticket feed for current status.";
      const techAction = actionMatch ? actionMatch[1].trim() : "Review the ticket description and follow standard procedures.";
      const escalation = escMatch ? escMatch[1].trim() : "Escalate to the responsible group listed in TDX.";
      const closingNotes = closingMatch ? closingMatch[1].trim() : "Document resolution steps and verify with requestor.";
      
      // Build feed timeline HTML
      let feedTimelineHtml = '';
      if (ticket.feed && ticket.feed.length > 0) {
        feedTimelineHtml = `
          <details style="margin-top:14px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:8px;" open>
            <summary style="padding:10px 14px; cursor:pointer; font-size:11px; font-weight:600; color:var(--text2);">📜 Activity Feed (${ticket.feed.length} entries)</summary>
            <div style="padding:0 14px 12px 14px; max-height:250px; overflow-y:auto;">
              ${ticket.feed.map(f => {
                const d = new Date(f.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                const icon = f.type === 'status' ? '🔄' : '💬';
                const color = f.type === 'status' ? 'var(--accent2)' : 'var(--text)';
                return `<div style="display:flex; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px;">
                  <span style="min-width:16px;">${icon}</span>
                  <div>
                    <span style="font-weight:600; color:${color};">${f.author}</span>
                    <span style="opacity:0.5; margin-left:6px;">${d}</span>
                    <div style="margin-top:2px; color:var(--text2); line-height:1.4;">${f.text}</div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </details>`;
      }
      
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <span style="background:rgba(34,197,94,0.15); color:#22c55e; padding:3px 10px; border-radius:12px; font-size:10px; font-weight:600;">AI BRIEFING</span>
        </div>
        <div class="briefing-section">
          <h4>📍 Current State</h4>
          <p>${currentState.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="briefing-section" style="background:rgba(99,102,241,0.05); border-radius:8px; padding:12px; margin:8px 0;">
          <h4 style="color:var(--accent);">🔧 What You Need To Do Now</h4>
          <p>${techAction.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
          <div class="briefing-section">
            <h4>⚠️ Escalation</h4>
            <p style="font-size:12px;">${escalation.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="briefing-section">
            <h4>📋 Closing Notes</h4>
            <p style="font-size:12px;">${closingNotes.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        ${feedTimelineHtml}
        </div>
      `;
    } else {
      throw new Error("server_error");
    }
  } catch (e) {
    console.error("Briefing Error:", e);
    lastViewedTicket = ticket; // Save for retry
    
    // --- SMART STATIC FALLBACK: Match ticket to FAQ_DATA for actionable triage ---
    let fallbackHtml = '';
    const serviceLower = (ticket.service || '').toLowerCase();
    const titleLower = (ticket.title || '').toLowerCase();
    const descLower = (ticket.description || '').toLowerCase();
    const combinedText = `${serviceLower} ${titleLower} ${descLower}`;
    
    // Score each FAQ by keyword match against the ticket
    let bestMatch = null;
    let bestScore = 0;
    
    if (typeof FAQ_DATA !== 'undefined') {
      for (const faq of FAQ_DATA) {
        let score = 0;
        // Direct service name match (strongest signal)
        if (serviceLower.includes(faq.service.toLowerCase()) || faq.service.toLowerCase().includes(serviceLower)) {
          score += 10;
        }
        // Keyword scanning
        for (const kw of faq.keywords) {
          if (combinedText.includes(kw.toLowerCase())) {
            score += 2;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestMatch = faq;
        }
      }
    }
    
    if (bestMatch && bestScore >= 2) {
      // We have a solid FAQ match — show a real, useful briefing
      const stepsHtml = bestMatch.steps.map((s, i) => `<div style="display:flex; gap:8px; margin-bottom:6px;"><span style="color:var(--accent); font-weight:700; min-width:18px;">${i+1}.</span><span>${s}</span></div>`).join('');
      const infoHtml = bestMatch.info.map(i => `<div style="margin-bottom:4px;">• ${i}</div>`).join('');
      
      // Build feed timeline for fallback view too
      let fallbackFeedHtml = '';
      if (ticket.feed && ticket.feed.length > 0) {
        const lastEntry = ticket.feed[ticket.feed.length - 1];
        const lastDate = new Date(lastEntry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        
        fallbackFeedHtml = `
        <div class="briefing-section" style="margin-top:12px; background:rgba(34,197,94,0.05); border-radius:8px; padding:12px;">
          <h4>📍 Last Activity</h4>
          <p style="font-size:13px;"><strong>${lastEntry.author}</strong> <span style="opacity:0.6;">(${lastDate})</span>: ${lastEntry.text}</p>
        </div>
        <details style="margin-top:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:8px;">
          <summary style="padding:10px 14px; cursor:pointer; font-size:11px; font-weight:600; color:var(--text2);">📜 Full Activity Feed (${ticket.feed.length} entries)</summary>
          <div style="padding:0 14px 12px 14px; max-height:200px; overflow-y:auto;">
            ${ticket.feed.map(f => {
              const d = new Date(f.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
              const icon = f.type === 'status' ? '🔄' : '💬';
              return `<div style="display:flex; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:11px;">
                <span>${icon}</span>
                <div><strong>${f.author}</strong> <span style="opacity:0.5;">${d}</span><br>${f.text}</div>
              </div>`;
            }).join('')}
          </div>
        </details>`;
      }
      fallbackHtml = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <span style="background:rgba(99,102,241,0.15); color:var(--accent); padding:3px 10px; border-radius:12px; font-size:10px; font-weight:600;">SMART TRIAGE</span>
          <span style="font-size:11px; color:var(--text2); opacity:0.7;">Matched from ${bestMatch.count} resolved tickets</span>
        </div>
        
        <div class="briefing-section">
          <h4>📋 Matched Procedure: ${bestMatch.service}</h4>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px;">Category: <strong>${bestMatch.category}</strong></p>
        </div>
        
        <div class="briefing-section">
          <h4>🔍 Info to Gather</h4>
          <div style="font-size:13px; line-height:1.6;">${infoHtml}</div>
        </div>
        
        <div class="briefing-section">
          <h4>🔧 Resolution Steps</h4>
          <div style="font-size:13px; line-height:1.6;">${stepsHtml}</div>
        </div>
        
        <div class="briefing-section" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
          <div><strong>Classification:</strong> ${bestMatch.form.Classification}</div>
          <div><strong>Service:</strong> ${bestMatch.form.Service}</div>
          <div><strong>Resp. Group:</strong> ${bestMatch.form.RespGroup}</div>
          <div><strong>Urgency:</strong> ${bestMatch.form.Urgency}</div>
        </div>
        
        ${bestMatch.escalate ? `
        <div style="background:rgba(245,158,11,0.1); border-left:3px solid #f59e0b; padding:8px 12px; margin-top:10px; font-size:12px; border-radius:0 6px 6px 0;">
          <strong>⚠️ Escalation:</strong> ${bestMatch.escalate}
        </div>` : ''}
        
        ${fallbackFeedHtml}
        
        <div style="display:flex; gap:8px; margin-top:14px;">
          <button class="btn-small" style="background:rgba(255,255,255,0.1); border:1px solid var(--border);" onclick='generateAIBriefing(lastViewedTicket)'>
            🔄 Retry AI Analysis
          </button>
          <button class="btn-small" style="background:var(--accent); border:none; color:#fff;" onclick="askAIAboutTicket()">
            💬 Ask AI About This
          </button>
        </div>
      `;
    } else {
      // No FAQ match — show a clean generic fallback with ticket context
      fallbackHtml = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:3px 10px; border-radius:12px; font-size:10px; font-weight:600;">MANUAL TRIAGE</span>
        </div>
        
        <div class="briefing-section">
          <h4>📋 Ticket Summary</h4>
          <p style="font-size:13px;"><strong>Service:</strong> ${ticket.service}</p>
          <p style="font-size:13px;"><strong>Priority:</strong> ${ticket.priority}</p>
          <p style="font-size:13px; margin-top:8px;">${ticket.description}</p>
        </div>
        
        <div class="briefing-section">
          <h4>🔧 Recommended Actions</h4>
          <div style="font-size:13px; line-height:1.7;">
            <div>1. Verify the requestor's identity and contact info</div>
            <div>2. Check the <strong>FAQ Library</strong> for "${ticket.service}" procedures</div>
            <div>3. Search for related tickets in TeamDynamix</div>
            <div>4. If unresolved, escalate to the appropriate responsible group</div>
          </div>
        </div>
        
        <div style="display:flex; gap:8px; margin-top:14px;">
          <button class="btn-small" style="background:rgba(255,255,255,0.1); border:1px solid var(--border);" onclick='generateAIBriefing(lastViewedTicket)'>
            🔄 Retry AI Analysis
          </button>
          <button class="btn-small" style="background:var(--accent); border:none; color:#fff;" onclick="askAIAboutTicket()">
            💬 Ask AI About This
          </button>
        </div>
      `;
    }
    
    container.innerHTML = fallbackHtml;
  }
}

/**
 * Sends the full ticket context to the AI chat so the assistant can provide
 * actionable guidance: user lookups, specific resolution steps, escalation paths.
 * Bypasses sendMessage() to avoid triggering StarID/SCCM intent detectors.
 */
function askAIAboutTicket() {
  const ticket = lastViewedTicket;
  if (!ticket) {
    showToast("No ticket selected", "error");
    return;
  }
  
  // Build a rich, context-packed prompt the AI can act on
  const contextPrompt = [
    `I'm working on Ticket #${ticket.id}: "${ticket.title}".`,
    `Requestor: ${ticket.requestor} | Priority: ${ticket.priority} | Service: ${ticket.service}`,
    `Description: ${ticket.description}`,
    ``,
    `As my AI assistant, please:`,
    `1. Look up the requestor's StarID/account info if available`,
    `2. Tell me exactly what steps I should take to resolve this`,
    `3. Who should I escalate to if I can't fix it myself?`,
    `4. What info should I include when updating or closing this ticket?`
  ].join('\n');
  
  // Switch to chat and show the user's prompt
  switchView('chat');
  appendMessage(contextPrompt, 'user');
  
  // Add to history for context
  chatHistory.push({ role: 'user', content: contextPrompt });
  if (chatHistory.length > 8) chatHistory.shift();
  
  // Go DIRECTLY to the AI stream — skip all intent detectors (StarID, SCCM, etc.)
  const typingId = 'typing-ticket-' + Date.now();
  streamAIResponse(contextPrompt, typingId);
}

function generateHandoffReport() {
  if (activeTickets.length === 0) return;
  
  let report = `TRC SHIFT HANDOFF REPORT - ${new Date().toLocaleString()}\n`;
  report += `==================================================\n\n`;
  
  activeTickets.forEach(t => {
    report += `[#${t.id}] ${t.title}\n`;
    report += `Status: ${t.status} | Priority: ${t.priority}\n`;
    report += `Requestor: ${t.requestor}\n`;
    report += `Brief: ${t.description.substring(0, 100)}...\n`;
    report += `--------------------------------------------------\n`;
  });
  
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `handoff_report_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  
  appendMessage("📑 **Handoff Report Generated!** I've prepared a summary of all active tickets for the next shift.", 'ai');
}

// ----- WAYFINDING LOGIC -----
let allFloorPlans = [];

async function loadFloorPlans() {
  const container = document.getElementById('mapList');
  container.innerHTML = '<p style="padding:20px; color:var(--text2);">Loading maps...</p>';
  
  try {
    const res = await fetch(`/api/wayfinding/list?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      allFloorPlans = data.data;
      renderMapList(allFloorPlans);
    }
  } catch (e) {
    container.innerHTML = '<p style="padding:20px; color:var(--red);">Error loading floor plans.</p>';
  }
}

function renderMapList(maps) {
  const container = document.getElementById('mapList');
  container.innerHTML = '';
  
  maps.forEach(map => {
    const div = document.createElement('div');
    div.className = 'map-item';
    div.onclick = () => showMap(map);
    div.innerHTML = `
      <div style="flex: 1;">
        <div class="map-name">${map.floor} Floor - ${map.building}</div>
        <div class="map-meta">${map.file}</div>
      </div>
      <button class="dir-btn" onclick="event.stopPropagation(); getDirections('${map.floor} Floor ${map.building}')">🧭</button>
    `;
    container.appendChild(div);
  });
}

async function getDirections(target, start = userCurrentLocation) {
  if (!start) {
    pendingWayfindingTarget = target;
    switchView('chat');
    appendMessage(`🚶 **Let's map that out!** Where are you starting from right now? (e.g., *BA 224*, *Student Center*, *SM 105*, or *TRC Help Desk*)`, 'ai');
    return;
  }
  showToast(`AI Calculating path...`, 'info');
  switchView('chat');
  
  const typingId = 'typing-dir-' + Date.now();
  appendTyping(typingId);
  
  // Add to chat history so corrections work
  chatHistory.push({ role: 'assistant', content: `Calculating directions from ${start} to ${target}` });
  if (chatHistory.length > 8) chatHistory.shift();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const res = await fetch('/api/ai/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, start }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    removeTyping(typingId);
    
    if (data.status === 'success') {
      const steps = data.directions.split('|||').filter(s => s.trim().length > 0);
      let currentStepIdx = 0;
      
      const renderStep = (idx) => {
        const stepHtml = `
          <div class="wayfinding-bubble">
            <div style="font-weight:bold; color:var(--accent2); margin-bottom:8px;">📍 Step ${idx + 1} of ${steps.length}</div>
            <p>${steps[idx]}</p>
            ${idx < steps.length - 1 ? 
              `<button class="ai-cmd-btn" style="margin-top:10px; width:100%;" onclick="this.parentElement.innerHTML='✅ Done: '+this.previousElementSibling.innerText; window.nextWayfindingStep(${idx + 1})">Next Step ➡️</button>` : 
              `<div style="color:var(--green); font-weight:bold; margin-top:10px;">🚩 You have arrived at ${target}!</div>`}
          </div>
        `;
        appendMessage(stepHtml, 'ai');
      };
      
      window.nextWayfindingStep = renderStep;
      appendMessage(`🚶 **Let's go!** I've mapped out the route from **${start}** to **${target}**. I'll guide you step-by-step.`, 'ai');
      renderStep(0);
      
    }
  } catch (e) {
    removeTyping(typingId);
    appendMessage("Sorry, I couldn't generate directions right now.", 'ai');
  }
}

// ----- PREMIUM INTERACTIVE STEP-BY-STEP WAYFINDING ASSISTANT -----
let currentRouteStepsArray = [];
let currentRouteStepIndex = 0;
let currentRouteBuildings = [];
let currentRouteTargetHint = '';

function toggleWayfindingSidebarMode(mode) {
  const panelRoute = document.getElementById('sidePanelRoute');
  const panelBrowse = document.getElementById('sidePanelBrowse');
  const tabRoute = document.getElementById('tabRouteMode');
  const tabBrowse = document.getElementById('tabBrowseMode');
  
  if (!panelRoute || !panelBrowse) return;
  
  if (mode === 'route') {
    panelRoute.style.display = 'flex';
    panelBrowse.style.display = 'none';
    if (tabRoute) { tabRoute.style.background = 'var(--accent2)'; tabRoute.style.color = '#fff'; }
    if (tabBrowse) { tabBrowse.style.background = 'transparent'; tabBrowse.style.color = 'var(--text2)'; }
    
    if (currentRouteStepsArray.length > 0) {
      const ph = document.getElementById('mapPlaceholder');
      if (ph) ph.classList.add('hidden');
      const vc = document.getElementById('pdfViewerContainer');
      if (vc) vc.classList.add('hidden');
      const rv = document.getElementById('aiRouteViewerContainer');
      if (rv) rv.classList.remove('hidden');
    }
  } else {
    panelRoute.style.display = 'none';
    panelBrowse.style.display = 'flex';
    if (tabBrowse) { tabBrowse.style.background = 'var(--accent2)'; tabBrowse.style.color = '#fff'; }
    if (tabRoute) { tabRoute.style.background = 'transparent'; tabRoute.style.color = 'var(--text2)'; }
    
    if (allFloorPlans.length === 0) {
      fetch('/api/wayfinding/list').then(r => r.json()).then(d => {
        if(d.status === 'success') {
          allFloorPlans = d.data;
          renderMapList(allFloorPlans);
        }
      }).catch(e=>{});
    } else {
      renderMapList(allFloorPlans);
    }
  }
}

function launchCustomWayfindingRoute(target) {
  switchView('wayfinding');
  toggleWayfindingSidebarMode('route');
  const targetInput = document.getElementById('routeTargetInput');
  if (targetInput) {
    targetInput.value = target;
    triggerRouteCalculation();
  }
}

async function triggerRouteCalculation() {
  const startVal = document.getElementById('routeStartInput').value.trim() || 'BA 200';
  const targetVal = document.getElementById('routeTargetInput').value.trim();
  
  if (!targetVal) {
    showToast("Please enter a destination room/building code", "warning");
    return;
  }
  
  // Reveal interactive preview container and hide base placeholders
  document.getElementById('mapPlaceholder').classList.add('hidden');
  document.getElementById('pdfViewerContainer').classList.add('hidden');
  const routeViewer = document.getElementById('aiRouteViewerContainer');
  if (routeViewer) routeViewer.classList.remove('hidden');
  
  const stepCard = document.getElementById('activeStepCard');
  if (stepCard) stepCard.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><span class="rotating">⏳</span> AI Calculating multi-elevation step-by-step route map...</div>`;
  const mapLbl = document.getElementById('overlayMapLabel');
  if (mapLbl) mapLbl.innerText = 'Calculating...';
  
  try {
    const res = await fetch('/api/ai/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: targetVal, start: startVal })
    });
    const data = await res.json();
    
    if (data.status === 'success') {
      // Split directions array
      currentRouteStepsArray = data.directions.split('|||').filter(s => s.trim().length > 0);
      currentRouteBuildings = data.buildings || [];
      currentRouteTargetHint = data.map_hint || '';
      currentRouteStepIndex = 0;
      
      // Auto update header
      const titleEl = document.getElementById('routeHeaderTitle');
      if (titleEl) titleEl.innerText = `Route: ${startVal.toUpperCase()} ➡️ ${targetVal.toUpperCase()}`;
      const subtitleEl = document.getElementById('routeHeaderSubtitle');
      if (subtitleEl) subtitleEl.innerText = `Total Navigation Phases: ${currentRouteStepsArray.length}`;
      
      // Ensure floor plans are preloaded if empty
      if (allFloorPlans.length === 0) {
        try {
          const fpRes = await fetch('/api/wayfinding/list');
          const fpData = await fpRes.json();
          if (fpData.status === 'success') {
            allFloorPlans = fpData.data;
            renderMapList(allFloorPlans);
          }
        } catch(e){}
      }
      
      renderActiveRouteStep();
    } else {
      if (stepCard) stepCard.innerHTML = `❌ Error calculating route parameters.`;
    }
  } catch (e) {
    if (stepCard) stepCard.innerHTML = `❌ Connection timeout communicating with routing engine.`;
  }
}

function renderActiveRouteStep() {
  if (currentRouteStepsArray.length === 0) return;
  const idx = currentRouteStepIndex;
  const total = currentRouteStepsArray.length;
  const stepText = currentRouteStepsArray[idx];
  
  const stepCard = document.getElementById('activeStepCard');
  if (!stepCard) return;
  
  // Build interactive layout for the step
  let html = `<div style="font-weight: 700; color: var(--accent2); margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                📍 Step ${idx + 1} of ${total}
              </div>`;
              
  // If it's the ASCII 3D Map representation at the end, render properly
  if (stepText.includes('<pre') || stepText.includes('HYPER-VOXEL')) {
    html += stepText;
  } else {
    html += `<div style="font-size: 15px; font-weight: 500; color: #fff;">${stepText}</div>`;
  }
  
  // Navigation indicators
  if (idx === total - 1) {
    html += `<div style="color: var(--green); font-weight: 700; font-size: 12px; margin-top: 10px;">🚩 Route Completed!</div>`;
  }
  
  stepCard.innerHTML = html;
  
  // Update button constraints
  const btnPrev = document.getElementById('btnPrevStep');
  if (btnPrev) btnPrev.disabled = (idx === 0);
  const btnNext = document.getElementById('btnNextStep');
  if (btnNext) {
    btnNext.disabled = (idx === total - 1);
    if (idx === total - 1) {
      btnNext.innerText = '✅ Arrived';
    } else {
      btnNext.innerText = 'Next Step ➡️';
    }
  }
  
  // Very clever dynamic mapping: determine which building/floor PDF corresponds to this specific walking stage!
  let targetBuildingCode = 'BA';
  let targetFloorStr = 'First';
  
  const textUpper = stepText.toUpperCase();
  const bldgCodes = ['BA', 'CH', 'SM', 'SS', 'CC', 'PE', 'REC', 'IL', 'FA', 'FH', 'SC', 'ST', 'RA', 'LIB'];
  for (const bc of bldgCodes) {
    if (textUpper.includes(`(${bc})`) || textUpper.includes(` ${bc} `) || textUpper.includes(` ${bc}`) || textUpper.startsWith(bc)) {
      targetBuildingCode = bc;
      break;
    }
  }
  
  if (currentRouteBuildings.length > 0) {
    const propIdx = Math.min(Math.floor((idx / total) * currentRouteBuildings.length), currentRouteBuildings.length - 1);
    targetBuildingCode = currentRouteBuildings[propIdx].toUpperCase();
  }
  
  if (textUpper.includes('FLOOR 2') || textUpper.includes('SECOND') || textUpper.includes('2ND')) {
    targetFloorStr = 'Second';
  } else if (textUpper.includes('FLOOR 3') || textUpper.includes('THIRD') || textUpper.includes('3RD')) {
    targetFloorStr = 'Third';
  } else if (textUpper.includes('FLOOR 4') || textUpper.includes('FOURTH') || textUpper.includes('4TH')) {
    targetFloorStr = 'Fourth';
  } else {
    // Check if there is a room number like BA200, BA 200, ST269, etc.
    const roomMatch = textUpper.match(/[A-Z]{2,3}\s*(\d{3,4})/);
    if (roomMatch) {
      const firstDigit = roomMatch[1].charAt(0);
      if (firstDigit === '2') targetFloorStr = 'Second';
      else if (firstDigit === '3') targetFloorStr = 'Third';
      else if (firstDigit === '4') targetFloorStr = 'Fourth';
      else targetFloorStr = 'First';
    } else {
      targetFloorStr = 'First';
    }
  }
  
  let bestMap = null;
  if (allFloorPlans.length > 0) {
    bestMap = allFloorPlans.find(m => m.building.toUpperCase() === targetBuildingCode && m.floor.toUpperCase() === targetFloorStr.toUpperCase());
    if (!bestMap) bestMap = allFloorPlans.find(m => m.building.toUpperCase() === targetBuildingCode);
    if (!bestMap) bestMap = allFloorPlans[0];
  }
  
  const frame = document.getElementById('routePdfFrame');
  const label = document.getElementById('overlayMapLabel');
  
  if (bestMap) {
    if (label) label.innerText = `${bestMap.building} - ${bestMap.floor} Floor Plan`;
    if (frame && frame.src !== window.location.origin + bestMap.url && frame.src !== bestMap.url) {
      frame.src = bestMap.url;
    }
  } else {
    if (label) label.innerText = `Campus Overview (${targetBuildingCode})`;
    const fallbackUrl = `/floorplans/${targetFloorStr}Floor${targetBuildingCode}Plans.pdf`;
    if (frame && !frame.src.includes(fallbackUrl)) {
      frame.src = fallbackUrl;
    }
  }
}

function nextRouteStep() {
  if (currentRouteStepIndex < currentRouteStepsArray.length - 1) {
    currentRouteStepIndex++;
    renderActiveRouteStep();
  }
}

function prevRouteStep() {
  if (currentRouteStepIndex > 0) {
    currentRouteStepIndex--;
    renderActiveRouteStep();
  }
}

function adminAdUnlock() {
  const target = document.getElementById('adDetailStarID').innerText;
  if(!target) return;
  
  requestWagApproval(`AD Unlock for account ${target}`, async () => {
    try {
      const res = await fetch('/api/ad/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target, action: 'unlock', token: currentUser.token })
      });
      const data = await res.json();
      showToast(data.message, data.status);
      adminAdLookup(); // Refresh details
    } catch (e) { showToast("Network error connecting to backend.", "error"); }
  });
}

function adminAdToggleStatus(enable) {
  const target = document.getElementById('adDetailStarID').innerText;
  if(!target) return;
  const action = enable ? 'enable' : 'disable';
  
  requestWagApproval(`AD Account ${enable ? 'Enable' : 'Disable'} for ${target}`, async () => {
    try {
      const res = await fetch('/api/ad/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target, action: action, token: currentUser.token })
      });
      const data = await res.json();
      showToast(data.message, data.status);
      adminAdLookup(); // Refresh
    } catch (e) { showToast("Network error connecting to backend.", "error"); }
  });
}

function adminAdResetPassword() {
  const target = document.getElementById('adDetailStarID').innerText;
  const tempPw = document.getElementById('adResetTempPw').value.trim();
  if(!target || !tempPw) {
    showToast("Please enter a temporary password", "warning");
    return;
  }
  
  requestWagApproval(`AD Password Reset for ${target}`, async () => {
    try {
      const res = await fetch('/api/ad/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target, action: 'reset_pw', params: { new_password: tempPw }, token: currentUser.token })
      });
      const data = await res.json();
      if(data.status === "success") {
        showToast("Password reset successfully!", "success");
        document.getElementById('adResetTempPw').value = '';
      } else {
        showToast("Failed to reset password: " + data.message, "error");
      }
    } catch (e) { showToast("Network error connecting to backend.", "error"); }
  });
}

function filterMaps() {
  const q = document.getElementById('mapSearchInput').value.toLowerCase();
  const filtered = allFloorPlans.filter(m => 
    m.building.toLowerCase().includes(q) || 
    m.floor.toLowerCase().includes(q) || 
    m.file.toLowerCase().includes(q)
  );
  renderMapList(filtered);
}

function showMap(map) {
  document.querySelectorAll('.map-item').forEach(i => i.classList.remove('active'));
  // Find the clicked item (brute force for mock)
  if (event) {
    event.currentTarget.classList.add('active');
  }
  
  const placeholder = document.getElementById('mapPlaceholder');
  const viewerContainer = document.getElementById('pdfViewerContainer');
  const viewer = document.getElementById('pdfViewer');
  const title = document.getElementById('currentMapName');
  const btn = document.getElementById('btnOpenMapNewTab');
  
  placeholder.classList.add('hidden');
  viewerContainer.classList.remove('hidden');
  
  title.innerText = `${map.building} - ${map.floor} Floor`;
  viewer.src = map.url;
  btn.onclick = () => window.open(map.url, '_blank');
}

// ----- LINKS LOGIC -----
function renderLinks() {
  const container = document.getElementById('linksGrid');
  let html = '';
  
  // Group by category
  const categories = [...new Set(QUICK_LINKS.map(l => l.category))].sort();
  
  categories.forEach(cat => {
    html += `<div class="links-section"><div class="links-section-title">${cat}</div><div class="links-wrapper">`;
    
    const catLinks = QUICK_LINKS.filter(l => l.category === cat);
    catLinks.forEach(link => {
      const isFileLink = link.url.startsWith('file://');
      html += `
        <div class="link-card-wrapper">
          <a href="${link.url}" ${isFileLink ? 'onclick="return false;"' : 'target="_blank"'} class="link-card">
            <div class="link-icon">${link.icon}</div>
            <div style="flex: 1; min-width: 0;">
              <div class="link-name">${link.name}</div>
              <div class="link-url">${link.url === '—' ? 'Link not provided' : link.url}</div>
            </div>
          </a>
          ${isFileLink ? `<button class="copy-path-btn" onclick="copyPath('${link.url.replace('file://', '\\\\').replace(/\//g, '\\')}', this)" title="Copy Network Path">📋 Copy</button>` : ''}
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  container.innerHTML = html;
}

function copyPath(path, btn) {
  navigator.clipboard.writeText(path).then(() => {
    const originalText = btn.innerText;
    btn.innerText = "✅ Copied!";
    btn.style.background = "var(--green)";
    showToast("Path copied to clipboard", "success");
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "";
    }, 2000);
  });
}

function copyToClipboard(text, btn) {
  const originalText = btn.innerText;
  
  const onSuccess = () => {
    btn.innerText = "✅ Copied!";
    btn.classList.add('success');
    showToast("Copied to clipboard", "success");
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('success');
    }, 2000);
  };

  // 1. Try modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopyText(text, onSuccess));
  } else {
    // 2. Use legacy fallback
    fallbackCopyText(text, onSuccess);
  }
}

function fallbackCopyText(text, callback) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Ensure it's not visible
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful && callback) callback();
    else showToast("Please select and copy manually", "warning");
  } catch (err) {
    showToast("Failed to copy", "error");
  }
}

async function fetchDeploymentInfo() {
  const urlEl = document.getElementById('deploymentUrl');
  if (!urlEl) return;
  
  try {
    const res = await fetch('/api/deployment/info');
    const data = await res.json();
    if (data.status === 'success') {
      urlEl.innerText = data.url;
    }
  } catch (e) {
    urlEl.innerText = "Error detecting network IP";
  }
}

// ----- NOTIFICATION SYSTEM LOGIC -----
function initNotifications() {
  renderNotifications();
  // Start SLA Monitoring
  setInterval(checkSLAs, 30000); // Check every 30 seconds
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function addNotification(title, message, level = 'info', action = null) {
  const id = Date.now();
  notifications.unshift({
    id, title, message, level, action,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  
  if (notifications.length > 20) notifications.pop(); // Keep last 20
  
  saveNotifications();
  renderNotifications();
  
  if (level === 'critical' || level === 'warning') {
    showToast(`${title}: ${message}`, level);
  }
}

function renderNotifications() {
  const listEl = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (unreadCount > 0) {
    badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  
  if (notifications.length === 0) {
    listEl.innerHTML = '<div class="notif-empty">No new notifications</div>';
    return;
  }
  
  listEl.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.level} ${n.read ? 'read' : 'unread'}" onclick="handleNotifClick(${n.id})">
      <h4>${n.title}</h4>
      <p>${n.message}</p>
      <div style="font-size: 10px; color: var(--text2); margin-top: 4px;">${n.time}</div>
    </div>
  `).join('');
}

function handleNotifClick(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    
    // Close the menu
    document.getElementById('notifMenu').classList.add('hidden');

    if (notif.action) {
      switchView(notif.action);
    } else if (notif.title.includes('#')) {
        // Auto-detect ticket notification and switch to tickets view
        const match = notif.title.match(/#(\d+)/) || notif.message.match(/#(\d+)/);
        if (match) {
            const ticketId = parseInt(match[1]);
            switchView('tickets');
            setTimeout(() => showTicketDetail(ticketId), 100);
        }
    }
    
    saveNotifications();
    renderNotifications();
  }
}

function markAsRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveNotifications();
    renderNotifications();
  }
}

function clearNotifications() {
  notifications = [];
  saveNotifications();
  renderNotifications();
}

function toggleNotifMenu() {
  document.getElementById('notifMenu').classList.toggle('hidden');
  // Mark all as read when opening menu
  notifications.forEach(n => n.read = true);
  saveNotifications();
  renderNotifications();
}

function saveNotifications() {
  localStorage.setItem('trc_notifications', JSON.stringify(notifications));
}

async function checkSLAs() {
  if (activeTickets.length === 0) return;
  
  for (const ticket of activeTickets) {
    // 1. Static Rule check
    if (ticket.priority === 'High' && ticket.status === 'New') {
      if (!notifications.some(n => n.title.includes(ticket.id))) {
        addNotification("SLA ALERT", `Ticket #${ticket.id} is HIGH priority and still NEW!`, 'critical');
      }
    }
    
    // 2. AI-Driven Sentiment check (Proactive)
    if (ticket.status === 'New' && !notifications.some(n => n.title.includes(`AI-${ticket.id}`))) {
      try {
        const res = await fetch('/api/ai/analyze-urgency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ticket.description + " " + ticket.title })
        });
        const data = await res.json();
        if (data.status === 'success' && data.is_urgent) {
          addNotification(`🚨 AI URGENCY: #${ticket.id}`, `Hidden urgency detected: "${ticket.title}"`, 'critical');
        }
      } catch (e) {}
    }
  }
}

async function executeGlobalAICommand() {
  await executeAICommand('globalAiCommandInput');
}

function quickAction(text) {
  const input = document.getElementById('userInput');
  if (!input) return;
  input.value = text;
  sendMessage();
}

async function executeAICommand(inputId = 'aiCommandInput') {
  const input = document.getElementById(inputId);
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  
  showToast("AI Orchestrating...", "info");
  
  try {
    // Add user message to history
    chatHistory.push({ role: 'user', content: query });
    if (chatHistory.length > 6) chatHistory.shift();

    const res = await fetch('/api/ai/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history: chatHistory })
    });
    const data = await res.json();
    
    input.value = '';
    
    if (data.ai_suggestion) {
      appendMessage(`🐴 **AI Suggestion:** ${data.ai_suggestion}`, 'ai');
    }

    if (data.intent === 'sccm_lookup') {
      switchView('sccm');
      document.getElementById('sccmSearchInput').value = data.params.query;
      searchSCCMTab();
    } else if (data.intent === 'directory_search') {
      switchView('directory');
      document.getElementById('dirSearchInput').value = data.params.query;
      searchDirectoryTab();
    } else if (data.intent === 'kb_search') {
      switchView('faq');
      document.getElementById('faqSearchInput').value = data.params.query;
      filterFAQ();
    } else if (data.intent === 'portal_scrape') {
      switchView('chat');
      scrapePortal(data.params.query);
    } else if (data.intent === 'map_lookup') {
      switchView('wayfinding');
      document.getElementById('mapSearchInput').value = data.params.query;
      filterMaps();
      showToast(`AI Suggested Map: ${data.params.query}`, 'info');
    } else if (data.intent === 'get_directions') {
      getDirections(data.params.target, data.params.start || userCurrentLocation);
    } else if (data.intent === 'web_search') {
      appendMessage(`🌐 **Web Search Mode Activated**<br>Searching for: *${data.params.query}*`, 'ai');
      window.open(`https://www.google.com/search?q=${encodeURIComponent(data.params.query)}`, '_blank');
      showToast("Opening Google Search...", "info");
    } else if (data.intent === 'clarify') {
      appendMessage(`🤔 **I need a bit more detail.** Could you please clarify your request? (e.g., Which building? What specific error code are you seeing?)`, 'ai');
      switchView('chat');
      document.getElementById('userInput').focus();
    } else if (data.intent === 'smart_clarify') {
      appendMessage(`🔐 **I'd love to help you with that!** But I need to know which service you are referring to.<br><br>Are you asking about:<br>• **StarID** Password?<br>• **Email/O365** Password?<br>• **WiFi/Eduroam** Password?<br>• **D2L** Access?`, 'ai');
      switchView('chat');
      document.getElementById('userInput').focus();
    } else {
      switchView('chat');
      document.getElementById('userInput').value = query;
      sendMessage();
    }
  } catch (e) {
    showToast("Command failed", "error");
  }
}

function handleCommandKey(e) {
  if (e.key === 'Enter') executeAICommand();
}

// ----- AUTHENTICATION LOGIC -----

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPass');
  const toggleIcon = document.getElementById('togglePass');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    toggleIcon.innerText = '🙈';
  } else {
    passInput.type = 'password';
    toggleIcon.innerText = '👁️';
  }
}

async function loadSystemConfig() {
  try {
    const res = await fetch('/api/admin/get-config');
    const data = await res.json();
    if (data.status === 'success') {
      const conf = data.data;
      if (conf.tdx_appid) document.getElementById('conf_tdx_appid').value = conf.tdx_appid;
      if (conf.tdx_token) document.getElementById('conf_tdx_token').value = conf.tdx_token;
      if (conf.sccm_url) document.getElementById('conf_sccm_url').value = conf.sccm_url;
      if (conf.mist_org) document.getElementById('conf_mist_org').value = conf.mist_org;
      if (conf.mist_token) document.getElementById('conf_mist_token').value = conf.mist_token;
      if (conf.ai_url) document.getElementById('conf_ai_url').value = conf.ai_url;
      if (conf.jamf_url) document.getElementById('conf_jamf_url').value = conf.jamf_url;
      if (conf.jamf_token) document.getElementById('conf_jamf_token').value = conf.jamf_token;
    }
  } catch (e) {}
}

async function saveSystemConfig() {
  const payload = {
    tdx_appid: document.getElementById('conf_tdx_appid').value,
    tdx_token: document.getElementById('conf_tdx_token').value,
    sccm_url: document.getElementById('conf_sccm_url').value,
    mist_org: document.getElementById('conf_mist_org').value,
    mist_token: document.getElementById('conf_mist_token').value,
    ai_url: document.getElementById('conf_ai_url').value,
    jamf_url: document.getElementById('conf_jamf_url').value,
    jamf_token: document.getElementById('conf_jamf_token').value
  };

  try {
    const res = await fetch(`/api/admin/save-config?token=${currentUser.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast("System Integrations Saved!", "success");
      // Reload tickets to see if new config works
      loadTickets();
    }
  } catch (e) {
    showToast("Failed to save config", "error");
  }
}

async function triggerRemoteAction(resourceId, actionType, btnEl) {
  const originalText = btnEl.innerText;
  
  requestWagApproval(`SCCM Action: ${actionType} on Resource ${resourceId}`, async () => {
    btnEl.innerText = "⏳ Executing...";
    btnEl.disabled = true;
    
    try {
      const res = await fetch('/api/sccm/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: resourceId,
          action: actionType,
          token: currentUser ? currentUser.token : null
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        btnEl.innerText = "✅ Success";
        btnEl.style.background = "var(--green)";
        btnEl.style.color = "white";
        appendMessage(`🐴 Remote action **${actionType}** was successfully triggered for SCCM Resource **${resourceId}**.`, 'ai');
      } else {
        btnEl.innerText = "❌ Failed";
        showToast(data.message || "Failed to trigger action", "error");
      }
    } catch (e) {
      btnEl.innerText = "❌ Error";
      showToast("Network error triggering action", "error");
    } finally {
      setTimeout(() => {
        btnEl.innerText = originalText;
        btnEl.disabled = false;
        btnEl.style.background = "";
        btnEl.style.color = "";
      }, 3000);
    }
  });
}

let pendingApprovalTask = null;

function requestWagApproval(title, task) {
  pendingApprovalTask = task;
  const modal = document.getElementById('approvalModal');
  const titleEl = document.getElementById('approvalTitle');
  const pinInput = document.getElementById('approvalPin');
  const errorDiv = document.getElementById('approvalError');
  
  if (modal) {
    titleEl.innerText = title;
    pinInput.value = '';
    errorDiv.innerText = '';
    modal.classList.remove('hidden');
    setTimeout(() => pinInput.focus(), 100);
  }
}

function closeApprovalModal() {
  const modal = document.getElementById('approvalModal');
  if (modal) modal.classList.add('hidden');
  pendingApprovalTask = null;
}

async function submitWagApproval() {
  const pinInput = document.getElementById('approvalPin');
  const errorDiv = document.getElementById('approvalError');
  const btn = document.getElementById('approvalSubmitBtn');
  const pin = pinInput.value.trim();
  
  if (!pin) {
    errorDiv.innerText = "Please enter the 4-digit PIN.";
    return;
  }
  
  btn.disabled = true;
  btn.innerText = "Verifying...";
  
  try {
    const res = await fetch('/api/auth/verify_pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin })
    });
    const data = await res.json();
    
    if (data.status === 'success') {
      closeApprovalModal();
      if (pendingApprovalTask) {
        await pendingApprovalTask();
      }
    } else {
      errorDiv.innerText = "Invalid WAG PIN. Access Denied.";
      pinInput.value = '';
      pinInput.focus();
    }
  } catch (e) {
    errorDiv.innerText = "Network error verifying PIN.";
  } finally {
    btn.disabled = false;
    btn.innerText = "Authorize Action";
  }
}

async function performLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const btn = document.getElementById('loginBtn');
  const errorDiv = document.getElementById('loginError');
  
  if (!user || !pass) {
    errorDiv.innerText = "Please enter both StarID and Password.";
    return;
  }
  
  btn.disabled = true;
  btn.innerText = "Signing in...";
  errorDiv.innerText = "";
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    
    const data = await res.json();
    if (data.status === "success") {
      currentUser = {
        token: data.token,
        role: data.role,
        username: data.username
      };
      USER_MODULES = data.modules || [];
      localStorage.setItem('trc_session', JSON.stringify(currentUser));
      localStorage.setItem('trc_modules', JSON.stringify(USER_MODULES));
      localStorage.setItem('trc_login_time', Date.now().toString());
      document.getElementById('loginOverlay').classList.add('hidden');
      const appDiv = document.querySelector('.app');
      if (appDiv) appDiv.style.display = 'flex';
      updateProfileUI();
      renderSidebar();
      switchView(USER_MODULES[0] || 'chat');
      appendMessage(`✅ **Welcome, ${data.username}!** Your modules are loaded. How can I help you?`, 'ai');
    } else {
      errorDiv.innerText = data.message || "Login failed.";
    }
  } catch (e) {
    errorDiv.innerText = "Error connecting to Auth server.";
  } finally {
    btn.disabled = false;
    btn.innerText = "Sign In";
  }
}

async function checkSession() {
  const session = localStorage.getItem('trc_session');
  if (session) {
    currentUser = JSON.parse(session);
    // Refresh modules from server to avoid stale localStorage
    try {
      const res = await fetch('/api/auth/me?token=' + currentUser.token);
      const data = await res.json();
      if (data.status === "success") {
        USER_MODULES = data.data.modules || [];
        localStorage.setItem('trc_modules', JSON.stringify(USER_MODULES));
        
        // Update user object if roles changed
        if (data.data.role !== currentUser.role) {
            currentUser.role = data.data.role;
            localStorage.setItem('trc_session', JSON.stringify(currentUser));
        }
      } else {
        // Session expired or invalid
        performLogout();
        return;
      }
    } catch (e) {
      // Offline fallback
      USER_MODULES = JSON.parse(localStorage.getItem('trc_modules')) || [];
    }

    document.getElementById('loginOverlay').classList.add('hidden');
    const appDiv = document.querySelector('.app');
    if (appDiv) appDiv.style.display = 'flex';
    updateProfileUI();
    renderSidebar();
    startSessionTimer();
    
    console.log("Session verified. Modules:", USER_MODULES);
    
    // Switch to first allowed view if current is login or empty
    if (currentView === 'login' || !currentView) {
        switchView(USER_MODULES[0] || 'chat');
    }
  }
}

// Handle Enter key for login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !document.getElementById('loginOverlay').classList.contains('hidden')) {
    performLogin();
  }
});

window.addEventListener('load', checkSession);

// ----- NEW AUTH & ADMIN LOGIC -----

function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('hidden');
}

function performLogout() {
  localStorage.removeItem('trc_session');
  currentUser = null;
  location.reload(); // Hard reset to login screen
}

async function updateProfileUI() {
  if (!currentUser) return;
  document.getElementById('headerUserName').innerText = currentUser.username;
  document.getElementById('headerUserRole').innerText = currentUser.role.toUpperCase();
  
  // Dynamic Initials for Avatar
  const avatarEl = document.getElementById('headerUserAvatar');
  if (avatarEl && currentUser.username) {
    const initials = currentUser.username.substring(0, 2).toUpperCase();
    avatarEl.innerText = initials;
  }
  
  // Show admin button if sysadmin
  if (currentUser.role === 'sysadmin' || currentUser.role === 'wag') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    loadAdminUsers();
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }
  
  startSessionTimer();
}

let sessionTimerInterval = null;
function startSessionTimer() {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
  const loginTime = parseInt(localStorage.getItem('trc_login_time')) || Date.now();
  const timerEl = document.getElementById('sessionTimer');
  
  function updateTimer() {
    const now = Date.now();
    const diff = now - loginTime;
    const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    if (timerEl) timerEl.innerText = `${hrs}:${mins}:${secs}`;
  }
  
  updateTimer();
  sessionTimerInterval = setInterval(updateTimer, 1000);
}

let SYS_CONFIG = null;

async function loadAdminUsers() {
  if (!currentUser) return;
  try {
    if (!SYS_CONFIG) {
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      if (configData.status === 'success') {
        SYS_CONFIG = configData.config;
      }
    }
    const res = await fetch(`/api/admin/users?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      renderAdminList(data.roles);
      updateModuleCheckboxes(); // Initialize checkboxes for the default role selected
    }
  } catch (e) { console.error("Failed to load admin users", e); }
}

function renderAdminList(roles) {
  const container = document.getElementById('adminUserList');
  let html = '';
  const entries = Object.entries(roles);
  
  entries.forEach(([user, data]) => {
    const roleName = typeof data === 'string' ? data : (data.role || 'unknown');
    const modules = data.modules ? data.modules.join(', ') : 'Default';
    html += `
      <div class="admin-user-item">
        <div class="admin-user-info">
          <span class="admin-user-id">${user}</span>
          <span class="admin-user-role">${roleName.toUpperCase()}</span>
          <div style="font-size: 10px; color: var(--text2); margin-top: 4px;">Modules: ${modules}</div>
        </div>
        <button onclick="editUser('${user}', '${roleName}', '${data.modules ? data.modules.join(',') : ''}')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:16px; margin-right: 10px;">✏️</button>
        <button onclick="deleteUser('${user}')" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:16px;">✕</button>
      </div>
    `;
  });
  
  // Add a summary counter
  const summaryHtml = `<p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Total Managed Users: ${entries.length}</p>`;
  container.innerHTML = summaryHtml + (html || '<p style="font-size:12px; color:var(--text2);">No custom roles defined yet.</p>');
}

function updateModuleCheckboxes(selectedModules = null) {
  if (!SYS_CONFIG || !SYS_CONFIG.modules) return;
  
  const container = document.getElementById('moduleCheckboxes');
  const role = document.getElementById('newUserRole').value;
  
  let checkedModules = [];
  if (selectedModules) {
    checkedModules = selectedModules.split(',').filter(m => m);
  } else if (SYS_CONFIG.default_module_permissions && SYS_CONFIG.default_module_permissions[role]) {
    checkedModules = SYS_CONFIG.default_module_permissions[role];
  }
  
  container.innerHTML = SYS_CONFIG.modules.map(mod => `
    <label style="display: flex; align-items: center; gap: 5px; font-size: 12px; cursor: pointer;">
      <input type="checkbox" class="admin-module-cb" value="${mod.id}" ${checkedModules.includes(mod.id) ? 'checked' : ''} />
      ${mod.icon} ${mod.name}
    </label>
  `).join('');
}

function editUser(user, role, modules) {
  document.getElementById('newUserId').value = user;
  document.getElementById('newUserRole').value = role;
  updateModuleCheckboxes(modules);
}

async function deleteUser(username) {
  if (!confirm(`Are you sure you want to remove permissions for ${username}?`)) return;
  
  try {
    const res = await fetch(`/api/admin/users/${username}?token=${currentUser.token}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.status === 'success') {
      loadAdminUsers();
      appendMessage(`🗑️ Permissions removed for **${username}**.`, 'ai');
    }
  } catch (e) { alert("Failed to delete user"); }
}

async function adminSearchCampus() {
  const query = document.getElementById('adminCampusSearchInput').value.trim();
  if (!query) return;
  const container = document.getElementById('adminCampusSearchResults');
  container.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.6;">🔍 Searching institutional records...</div>`;
  
  try {
    const res = await fetch(`/api/admin/search-campus?q=${encodeURIComponent(query)}&token=${currentUser.token}`);
    const data = await res.json();
    
    if (data.status === "success" && data.data) {
      const { users, assets, locations } = data.data;
      if (users.length === 0 && assets.length === 0 && locations.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.6;">❌ No matching records found.</div>`;
        return;
      }
      
      let html = "";
      
      if (users && users.length > 0) {
        html += `<div style="margin-top:10px; font-size:11px; font-weight:700; opacity:0.5; padding:0 10px; text-transform:uppercase;">👤 People</div>`;
        users.forEach(user => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="font-weight:600; color:var(--text);">${user.FullName || 'Unknown'}</div>
                <div style="font-size:11px; opacity:0.6;">${user.StarID || 'No StarID'} - ${user.Title || 'No Title'}</div>
              </div>
              <button class="btn-small" onclick="selectUserForAdmin('${user.StarID}')" style="background:var(--accent2); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Select</button>
            </div>
          `;
        });
      }

      if (assets && assets.length > 0) {
        html += `<div style="margin-top:15px; font-size:11px; font-weight:700; opacity:0.5; padding:0 10px; text-transform:uppercase;">💻 Assets</div>`;
        assets.forEach(asset => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="font-weight:600; color:var(--accent2);">[${asset.Tag}] ${asset.Name || 'Device'}</div>
                <div style="font-size:11px; opacity:0.6;">${asset.ProductModel} • ${asset.Status}</div>
              </div>
              <button class="btn-small" onclick="selectAssetForAdmin('${asset.Tag}')" style="background:var(--accent); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Trace</button>
            </div>
          `;
        });
      }

      if (locations && locations.length > 0) {
        html += `<div style="margin-top:15px; font-size:11px; font-weight:700; opacity:0.5; padding:0 10px; text-transform:uppercase;">📍 Locations</div>`;
        locations.forEach(loc => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="font-weight:600; color:var(--text);">${loc.Name}</div>
                <div style="font-size:11px; opacity:0.6;">${loc.Description || 'Campus Room'}</div>
              </div>
              <button class="btn-small" onclick="selectLocationForAdmin('${loc.Name}')" style="background:rgba(255,255,255,0.1); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Map</button>
            </div>
          `;
        });
      }
      container.innerHTML = html;
    } else {
      container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--red);">Error: ${data.message}</div>`;
    }
  } catch (e) { container.innerHTML = "Error connecting to server."; }
}

function selectUserForAdmin(starid) {
  if (!starid) return;
  document.getElementById('newUserId').value = starid;
  document.getElementById('newUserId').focus();
  showToast(`Selected ${starid}. Assign a role below.`, 'info');
}

async function adminAddUser() {
  const username = document.getElementById('newUserId').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  const checkboxes = document.querySelectorAll('.admin-module-cb');
  const modules = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  
  if (!username) return;
  
  try {
    await fetch(`/api/admin/users?token=${currentUser.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role, modules })
    });
    document.getElementById('newUserId').value = '';
    loadAdminUsers();
    appendMessage(`🤠 User **${username}** assigned to role **${role.toUpperCase()}** with custom modules.`, 'ai');
  } catch (e) { alert("Failed to update user"); }
}

// Close menu if clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile')) {
    document.getElementById('userMenu').classList.add('hidden');
  }
  if (!e.target.closest('.notification-wrapper')) {
    document.getElementById('notifMenu').classList.add('hidden');
  }
});

// --- UNIFIED PROFILE LOGIC ---
async function showUnifiedProfile(starId, name) {
  let modal = document.getElementById('unifiedProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'unifiedProfileModal';
    modal.className = 'unified-profile-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content glass-card" style="width: 1200px; max-width: 98vw; height: 850px; max-height: 95vh; display: flex; flex-direction: column; border-radius: 20px; overflow: hidden; padding: 30px; position: relative; animation: modalFadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);">
      <div class="unified-header" style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:20px; margin-bottom:20px;">
        <div>
          <h2 style="margin:0; font-size:26px; font-weight:800; background: linear-gradient(135deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display:flex; align-items:center; gap:12px;">
            👤 Unified Profile 
          </h2>
          <div style="font-size:14px; color:var(--text2); margin-top:4px;">Institutional Metadata & Live Telemetry for <strong>${starId}</strong></div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          ${(currentUser.role === 'tech' || currentUser.role === 'sysadmin' || currentUser.role === 'wag') ? 
            `<button class="btn-small" onclick="scrapePortal('${starId}')" style="background:var(--accent); color:white; border:none; padding:8px 15px; border-radius:8px; font-weight:600; cursor:pointer;">🏇 Deep Search</button>` : ''}
          <button class="close-btn" onclick="closeUnifiedProfile()" style="background:var(--bg3); border:none; color:var(--text); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;">✕</button>
        </div>
      </div>
      <div style="flex:1; overflow-y:auto; padding-right:10px; display:flex; flex-direction:column; gap:20px;">
        <div id="prof-identity">
          <div class="ticket-placeholder" style="height:100px;"><div class="placeholder-icon rotating">⏳</div></div>
        </div>
        <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px;">
          <div class="profile-section" id="prof-portal">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
              <span style="font-size:20px;">🔍</span>
              <h3 style="margin:0; font-size:16px; color:var(--accent2);">StarID Portal Details</h3>
            </div>
            <div class="prof-loading">Fetching from MinnState StarID Admin...</div>
          </div>
          <div class="profile-section" id="prof-sccm">
             <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
              <span style="font-size:20px;">💻</span>
              <h3 style="margin:0; font-size:16px; color:var(--accent2);">SCCM Assets & Usage</h3>
            </div>
            <div class="prof-loading">Scanning Workstation Inventory...</div>
          </div>
          <div class="profile-section" id="prof-tdx">
             <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
              <span style="font-size:20px;">🎫</span>
              <h3 style="margin:0; font-size:16px; color:var(--accent2);">Support History (TDX)</h3>
            </div>
            <div class="prof-loading">Querying TeamDynamix...</div>
          </div>
          <div class="profile-section" id="prof-mist">
             <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
              <span style="font-size:20px;">📶</span>
              <h3 style="margin:0; font-size:16px; color:var(--accent2);">WiFi Connectivity</h3>
            </div>
            <div class="prof-loading">Checking Juniper Mist Cloud...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('active');

  fetchDirectoryDetails(starId);
  fetchPortalDetails(starId);
  fetchUserSCCM(starId);
  fetchUserTDX(starId, name);
}

async function fetchDirectoryDetails(starId) {
  const container = document.getElementById('prof-identity');
  try {
    const res = await fetch(`/api/ad/${starId}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const u = data.data[0];
      
      // Update header avatar image and title dynamically if headshot is present
      if (u.Headshot) {
        const headerTitle = document.querySelector('.unified-header h2');
        if (headerTitle) {
          headerTitle.innerHTML = `
            <div style="width: 32px; height: 32px; background: url('https://www.smsu.edu/directory/${u.Headshot}') center/cover no-repeat; border-radius: 50%; border: 1.5px solid var(--accent); display:inline-block; vertical-align:middle; margin-right:6px;"></div>
            <span style="vertical-align:middle;">Unified Profile</span>
            <span style="opacity:0.5; font-weight:400; font-size:15px; margin-left:5px; vertical-align:middle;">(${starId})</span>
          `;
        }
      }
      
      container.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border: 1.5px solid var(--accent); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; animation: slideIn 0.3s ease-out;">
          <div style="display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;">
            <div style="width: 50px; height: 50px; background: ${u.Headshot ? `url('https://www.smsu.edu/directory/${u.Headshot}') center/cover no-repeat` : 'var(--accent)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 1.5px solid var(--accent2); color: #fff;">
              ${u.Headshot ? '' : '👤'}
            </div>
            <div style="flex:1;">
              <h4 style="font-size:17px; font-weight:700; color:#fff; margin:0 0 3px 0;">${u.DisplayName || 'N/A'}</h4>
              <div style="font-size:13.5px; color:var(--accent2); font-weight:600;">👔 ${u.Title || 'Student / Staff'}</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size:13.5px; line-height:1.4;">
            <div>💼 <strong>Department:</strong> <span style="color:#fff;">${u.Department || 'N/A'}</span></div>
            <div>🚪 <strong>Office Location:</strong> <span style="color:#fff; font-weight:600;">🚪 ${u.Office || 'N/A'}</span></div>
            <div>📧 <strong>Official Email:</strong> <span style="color:#fff;"><a href="mailto:${u.Email || (starId + '@smsu.edu')}" style="color:var(--accent2); text-decoration:none;">${u.Email || (starId + '@smsu.edu')}</a></span></div>
            <div>📞 <strong>Phone Number:</strong> <span style="color:#fff;">${u.Phone || 'N/A'}</span></div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align:center; color:var(--text2); font-size:13px;">General identity details not found in Directory.</div>`;
    }
  } catch (e) {
    container.innerHTML = `<div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align:center; color:var(--text2); font-size:13px;">Error loading general directory details.</div>`;
  }
}

function closeUnifiedProfile() {
  document.getElementById('unifiedProfileModal').classList.remove('active');
}


async function fetchPortalDetails(starId) {
  const container = document.getElementById('prof-portal');
  try {
    const res = await fetch(`/api/scrape/starid/${starId}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const u = data.data[0];
      
      // Update headshot in modal header dynamically if available
      if (u.Headshot) {
        const headerTitle = document.querySelector('.unified-header h2');
        if (headerTitle) {
          headerTitle.innerHTML = `
            <div style="width: 32px; height: 32px; background: url('https://www.smsu.edu/directory/${u.Headshot}') center/cover no-repeat; border-radius: 50%; border: 1.5px solid var(--accent);"></div>
            <span>${u.Name || 'User'}</span>
            <span style="opacity:0.5; font-weight:400; font-size:15px; margin-left:5px;">(${u.StarID})</span>
          `;
        }
      }

      container.innerHTML = `
        <h3>🔍 StarID Portal Details <span class="prof-badge">${u.Source === 'StarID Admin (Cached)' ? 'Cached' : 'Live'}</span></h3>
        <div class="prof-data-item"><strong>StarID:</strong> <span>${u.StarID}</span></div>
        <div class="prof-data-item"><strong>First Name:</strong> <span>${u.FirstName || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Informal Name:</strong> <span>${u.InformalName || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Middle Name:</strong> <span>${u.MiddleName || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Last Name:</strong> <span>${u.LastName || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Activation Status:</strong> <span style="color:var(--green); font-weight:700;">${u.ActivationStatus || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Lock Status:</strong> <span>${u.LockStatus || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Decommissioned:</strong> <span>${u.Decommissioned || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Password Expires:</strong> <span>📅 ${u.PasswordExpires || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Notification Email:</strong> <span>📧 ${u.NotificationEmail || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Email List:</strong> <span style="font-size:11px; opacity:0.85; word-break:break-all;">${u.EmailList || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>TechID List:</strong> <span style="color:var(--accent2); font-weight:600;">${u.TechID || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Library Barcodes:</strong> <span>${u.LibraryBarcode || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>State Employee Number:</strong> <span>${u.StateEmployeeNumber || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Designation:</strong> <span>${u.Title || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Department:</strong> <span>${u.Department || 'N/A'}</span></div>
        <div class="prof-data-item"><strong>Office/Room:</strong> <span style="font-weight:600; color:var(--accent2);">🚪 ${u.Office || u.Room || 'N/A'}</span></div>
        
        <div style="font-size:11.5px; color:var(--text2); margin-top:12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; line-height:1.45;">
          <strong>ISRS Affiliation List:</strong><br>
          <span style="font-family:monospace; opacity:0.8; font-size:10.5px; display:block; margin-top:3px; word-break:break-all;">${u.Affiliations || 'N/A'}</span>
        </div>
        
        <div style="font-size:11.5px; color:var(--text2); margin-top:8px; line-height:1.45;">
          <strong>Extra Affiliation List:</strong><br>
          <span style="font-family:monospace; opacity:0.8; font-size:10.5px; display:block; margin-top:3px; word-break:break-all;">${u.ExtraAffiliationList || 'N/A'}</span>
        </div>
        
        <div style="font-size:11.5px; color:var(--text2); margin-top:8px; line-height:1.45;">
          <strong>Cohort List:</strong><br>
          <span style="font-family:monospace; opacity:0.8; font-size:10.5px; display:block; margin-top:3px; word-break:break-all;">${u.CohortList || 'N/A'}</span>
        </div>
      `;
    } else { container.innerHTML = `<h3>🔍 StarID Portal Details</h3><div class="prof-empty">No portal details found</div>`; }
  } catch (e) { container.innerHTML = `<h3>🔍 StarID Portal Details</h3><div class="prof-empty">Error connecting to scraper</div>`; }
}

async function fetchUserSCCM(starId) {
  const container = document.getElementById('prof-sccm');
  try {
    const res = await fetch(`/api/sccm/user/${starId}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.data.length > 0) {
      let html = `<h3>💻 SCCM Assets & Usage <span class="prof-badge">${data.data.length} Devices</span></h3>`;
      data.data.forEach(pc => {
        html += `
          <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05);">
            <div class="prof-data-item"><strong>PC Name:</strong> <span style="color:var(--accent); font-weight:700;">${pc.PCName}</span></div>
            <div class="prof-data-item"><strong>Model:</strong> <span>${pc.Model}</span></div>
            <div class="prof-data-item"><strong>Status:</strong> <span style="color:${pc.Status==='Online'?'var(--green)':'var(--text2)'};">${pc.Status}</span></div>
          </div>
        `;
        if (pc.PCName) fetchUserMist(pc.PCName);
      });
      container.innerHTML = html;
    } else { container.innerHTML = `<h3>💻 SCCM Assets & Usage</h3><div class="prof-empty">No devices found in SCCM</div>`; }
  } catch (e) { container.innerHTML = `<h3>💻 SCCM Assets & Usage</h3><div class="prof-empty">Error querying SCCM</div>`; }
}

async function fetchUserTDX(starId, name) {
  const container = document.getElementById('prof-tdx');
  try {
    const res = await fetch(`/api/tdx/tickets?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      const userTickets = data.data.filter(t => t.requestor.toLowerCase().includes(starId.toLowerCase()) || name.toLowerCase().includes(t.requestor.toLowerCase()));
      if (userTickets.length > 0) {
        let html = `<h3>🎫 Support History (TDX) <span class="prof-badge">${userTickets.length} Total</span></h3>`;
        userTickets.forEach(t => {
          html += `
            <div style="margin-bottom:10px; font-size:12px;">
              <div style="font-weight:700; color:var(--text);">${t.title}</div>
              <div style="display:flex; justify-content:space-between; opacity:0.7;">
                <span>ID: ${t.id}</span>
                <span style="color:var(--accent2);">${t.status}</span>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
      } else { container.innerHTML = `<h3>🎫 Support History (TDX)</h3><div class="prof-empty">No recent tickets found</div>`; }
    }
  } catch (e) { container.innerHTML = `<h3>🎫 Support History (TDX)</h3><div class="prof-empty">Error connecting to TDX</div>`; }
}

async function fetchUserMist(search) {
  const container = document.getElementById('prof-mist');
  try {
    const res = await fetch(`/api/mist/${search}?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success' && data.data.length > 0) {
      const c = data.data[0];
      container.innerHTML = `
        <h3>📶 WiFi Connectivity <span class="prof-badge">Online</span></h3>
        <div class="prof-data-item"><strong>Connected to:</strong> <span>${c.ap_name}</span></div>
        <div class="prof-data-item"><strong>SSID:</strong> <span>${c.ssid}</span></div>
        <div class="prof-data-item"><strong>Signal:</strong> <span style="color:${c.rssi > -60 ? 'var(--green)' : 'var(--yellow)'};">${c.rssi} dBm</span></div>
      `;
    } else { container.innerHTML = `<h3>📶 WiFi Connectivity</h3><div class="prof-empty">No active WiFi session found</div>`; }
  } catch (e) {}
}

// ----- NEW AD & AUDIT LOG SERVICES -----
async function loadAuditLogs() {
  const container = document.getElementById('adminAuditLogBody');
  if (!container) return;
  if (!currentUser) return;
  
  try {
    const res = await fetch(`/api/admin/audit-logs?token=${currentUser.token}`);
    const data = await res.json();
    if (data.status === 'success') {
      let html = '';
      if (data.data.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text2);">No audit records found</td></tr>';
      } else {
        data.data.forEach(log => {
          html += `
            <tr>
              <td style="padding:10px 15px; color:var(--text2); font-family:monospace; font-size:12px;">${log.timestamp}</td>
              <td style="padding:10px 15px; font-weight:600; color:var(--accent2); font-size:12px;">${log.user}</td>
              <td style="padding:10px 15px; font-weight:700; color:var(--accent); font-size:11px; text-transform:uppercase;">${log.platform || 'System'}</td>
              <td style="padding:10px 15px; font-weight:700; color:#fff; font-size:12px;">${log.action}</td>
              <td style="padding:10px 15px; color:var(--green); font-weight:600; font-size:12px;">${log.target}</td>
            </tr>
          `;
        });
      }
      container.innerHTML = html;
    }
  } catch (e) {
    console.error("Failed to load audit logs", e);
  }
}

let platformChart = null;
let vitalsChart = null;
async function loadSysAdminGlimpse() {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`/api/admin/system-glimpse?token=${currentUser.token}`);
    const data = await res.json();
    
    if (data.status === 'success') {
      const g = data.data;
      
      // Update Vitals
      const aiStatusEl = document.getElementById('glimpseAiStatus');
      if (aiStatusEl) {
        aiStatusEl.innerText = g.vitals.ai_status.split(' ')[0]; // Just ONLINE/OFFLINE
        aiStatusEl.parentElement.style.opacity = g.vitals.ai_status.includes('ONLINE') ? '1' : '0.6';
      }
      
      const sessionsEl = document.getElementById('glimpseSessions');
      if (sessionsEl) sessionsEl.innerText = g.vitals.active_sessions;
      
      const actionsEl = document.getElementById('glimpseTotalActions');
      if (actionsEl) actionsEl.innerText = g.vitals.total_actions;

      // Update Platform Health Pulse
      if (g.health) {
        Object.entries(g.health).forEach(([id, status]) => {
          const chip = document.getElementById(`pulse-${id}`);
          if (chip) {
            const span = chip.querySelector('span');
            span.innerText = status;
            chip.className = `pulse-chip ${status === 'ONLINE' ? 'online' : 'offline'}`;
          }
        });
      }

      // --- Platform Distribution Chart ---
      const ctxP = document.getElementById('platformChart').getContext('2d');
      if (platformChart) platformChart.destroy();
      platformChart = new Chart(ctxP, {
        type: 'doughnut',
        data: {
          labels: ['AD', 'ISE', 'SCCM', 'Jamf'],
          datasets: [{
            data: [
              g.platforms.ad, 
              g.platforms.ise, 
              g.platforms.sccm, 
              g.platforms.jamf
            ],
            backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
            borderWidth: 0,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } } }
          },
          cutout: '70%'
        }
      });

      // --- Infrastructure Vitals Chart ---
      const ctxV = document.getElementById('vitalsChart').getContext('2d');
      if (vitalsChart) vitalsChart.destroy();
      vitalsChart = new Chart(ctxV, {
        type: 'bar',
        data: {
          labels: ['Knowledge Items', 'Cached Tickets'],
          datasets: [{
            label: 'Density',
            data: [g.vitals.kb_density, g.vitals.ticket_density],
            backgroundColor: ['#10b981', '#7c3aed'],
            borderRadius: 10,
            barThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  } catch (e) {
    console.error("Failed to load SysAdmin Glimpse", e);
  }
}

let activeAdTargetStarID = '';

async function adminAdLookup() {
  const input = document.getElementById('adTargetStarID');
  const adBox = document.getElementById('adDetailsBox');
  if (!input || !adBox) return;
  
  const starid = input.value.trim();
  if (!starid) {
    showToast("Please enter a valid StarID to look up", "warning");
    return;
  }
  
  try {
    const res = await fetch(`/api/ad/${starid}`);
    const resData = await res.json();
    if (resData.status === 'success' && resData.data.length > 0) {
      const user = resData.data[0];
      activeAdTargetStarID = user.StarID;
      
      document.getElementById('adDetailStarID').innerText = user.StarID;
      
      const statusBadge = document.getElementById('adDetailStatus');
      if (user.IsLocked) {
        statusBadge.innerText = 'LOCKED OUT';
        statusBadge.className = 'status-badge offline';
        statusBadge.style.background = 'rgba(239,68,68,0.15)';
        statusBadge.style.color = 'var(--red)';
      } else {
        statusBadge.innerText = 'ACTIVE / RECOVERY';
        statusBadge.className = 'status-badge online';
        statusBadge.style.background = 'rgba(34,197,94,0.15)';
        statusBadge.style.color = 'var(--green)';
      }
      
      adBox.classList.remove('hidden');
      showToast(`AD records found for ${user.StarID}`, "success");
    } else {
      adBox.classList.add('hidden');
      showToast(`No AD records found matching: ${starid}`, "error");
    }
  } catch (e) {
    adBox.classList.add('hidden');
    showToast("Error querying Active Directory", "error");
  }
}

async function adminAdUnlock() {
  if (!activeAdTargetStarID) return;
  try {
    const res = await fetch(`/api/admin/ad/unlock?token=${currentUser.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ starid: activeAdTargetStarID })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast(data.message, "success");
      loadAuditLogs();
      adminAdLookup(); // Refresh status
    } else {
      showToast(data.message || "Failed to unlock account", "error");
    }
  } catch (e) {
    showToast("Network error unlocking account", "error");
  }
}

async function adminAdToggleStatus(enabled) {
  if (!activeAdTargetStarID) return;
  try {
    const res = await fetch(`/api/admin/ad/toggle-status?token=${currentUser.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ starid: activeAdTargetStarID, enabled: enabled })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast(data.message, "success");
      loadAuditLogs();
      adminAdLookup(); // Refresh status
    } else {
      showToast(data.message || "Failed to update status", "error");
    }
  } catch (e) {
    showToast("Network error updating status", "error");
  }
}

async function adminAdResetPassword() {
  if (!activeAdTargetStarID) return;
  const pwInput = document.getElementById('adResetTempPw');
  if (!pwInput) return;
  
  const tempPw = pwInput.value.trim();
  if (!tempPw) {
    showToast("Please enter a temporary password first", "warning");
    return;
  }
  
  try {
    const res = await fetch(`/api/admin/ad/reset-password?token=${currentUser.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ starid: activeAdTargetStarID, temp_password: tempPw })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showToast(data.message, "success");
      pwInput.value = ''; // Reset input
      loadAuditLogs();
    } else {
      showToast(data.message || "Failed to reset password", "error");
    }
  } catch (e) {
    showToast("Network error resetting password", "error");
  }
}
async function showUnifiedProfile(query, displayName) {
  appendMessage(`🔍 **Building Unified Profile for ${displayName}...**`, 'ai');
  try {
    const token = currentUser ? currentUser.token : '';
    const res = await fetch(`/api/trace/${encodeURIComponent(query)}?token=${token}`);
    const data = await res.json();
    if (data.status === "success") {
      renderTraceResponse(data.data, true);
    } else {
      showToast("Profile build failed", "error");
    }
  } catch (e) { showToast("Backend connection lost", "error"); }
}

function renderTraceResponse(data, isProfile = false) {
  let html = `<div class="trace-card">`;
  html += `<div style="font-weight:700; color:var(--accent2); margin-bottom:12px; font-size:14px;">🔗 ${isProfile ? 'Unified Entity Profile' : 'Connectivity Trace Result'}</div>`;
  
  // USER SECTION
  if (data.user) {
    html += `
      <div class="trace-section">
        <div class="trace-label">👤 PERSON</div>
        <div class="trace-val"><strong>${data.user.DisplayName || 'Unknown'}</strong> (${data.user.StarID || 'N/A'})</div>
        <div class="trace-sub">${data.user.Title || 'N/A'} • ${data.user.Department || 'N/A'}</div>
        <div class="trace-sub">📍 Office: ${data.user.Office || 'N/A'}</div>
      </div>
    `;
  }

  // DEVICE SECTION
  if (data.devices && data.devices.length > 0) {
    const d = data.devices[0];
    html += `
      <div class="trace-section">
        <div class="trace-label">💻 PRIMARY DEVICE</div>
        <div class="trace-val"><strong>${d.PCName || d.Tag || 'Unknown'}</strong> (${d.ProductModel || d.Model || 'Unknown'})</div>
        <div class="trace-sub">Serial: ${d.SerialNumber || 'N/A'} • OS: ${d.OperatingSystemNameandVersion || d.Model || 'N/A'}</div>
        <div class="trace-sub">🌐 IP: ${d.IPAddress || 'N/A'} • Last User: ${d.User || 'N/A'}</div>
      </div>
    `;
  }

  // NETWORK SECTION
  if (data.network) {
    const n = data.network;
    html += `
      <div class="trace-section">
        <div class="trace-label">📶 NETWORK CONNECTION</div>
        <div class="trace-val"><span class="status-pill ${n.status === 'Authorized' ? 'status-process' : 'status-new'}">${n.status || 'Active'}</span> ${n.vlan || 'N/A'}</div>
        <div class="trace-sub">Connected via AP: <strong>${n.ap || 'Unknown'}</strong></div>
        <div class="trace-sub">Switch: ${n.switch_ip || 'N/A'} Port ${n.switch_port || 'N/A'}</div>
      </div>
    `;
  }

  // LOCATION LINK
  if (data.location && data.location.room) {
     html += `<button class="ai-cmd-btn" style="width:100%; margin-top:10px;" onclick="getDirections('${data.location.room}')">🧭 Navigate to this Room (${data.location.room})</button>`;
  }

  html += `</div>`;
  appendMessage(html, 'ai');
}

// --- TELEMETRY & SPARKLINE ANIMATION ---
function startTelemetry() {
  setInterval(() => {
    // Simulate AI load based on activity
    const aiLoad = Math.floor(Math.random() * 15) + (isAIReady ? 5 : 0);
    updateSparkline('aiSparkline', aiLoad, 30);
    document.getElementById('aiSparkVal').innerText = `${aiLoad}%`;
    
    // Simulate DB throughput
    const dbLoad = Math.floor(Math.random() * 50) + 10;
    updateSparkline('dbSparkline', dbLoad / 2, 50);
    document.getElementById('dbSparkVal').innerText = `${dbLoad}/s`;
  }, 2000);
}

function updateSparkline(containerId, value, max) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const height = Math.min((value / max) * 100, 100);
  const bar = document.createElement('div');
  bar.className = 'sparkline-bar';
  bar.style.height = `${height}%`;
  
  container.appendChild(bar);
  if (container.children.length > 15) {
    container.removeChild(container.firstChild);
  }
}
