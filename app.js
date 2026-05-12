let SYSTEM_MODULES = [];
let USER_MODULES = JSON.parse(localStorage.getItem('trc_modules')) || [];
let currentView = 'chat';
let userCurrentLocation = "the Technology Resource Center (TRC) in Bellows Academic (BA)";

// ----- THEME & AVATAR MANAGEMENT -----
function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('trc_theme', theme);
  
  // Update UI state in settings view (filtering out avatar options)
  document.querySelectorAll('.theme-option:not(.avatar-option)').forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('onclick') && opt.getAttribute('onclick').includes(`'${theme}'`)) {
      opt.classList.add('active');
    }
  });
  
  showToast(`Theme updated to ${theme}`, 'success');
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

// Initialize theme and avatar
const savedTheme = localStorage.getItem('trc_theme') || 'default';
document.body.className = `theme-${savedTheme}`;

const savedAvatar = localStorage.getItem('trc_avatar') || '🤠';
document.addEventListener('DOMContentLoaded', () => {
  const headerAvatar = document.getElementById('headerUserAvatar');
  if (headerAvatar) headerAvatar.innerText = savedAvatar;
  
  // Select active avatar in selector
  document.querySelectorAll('.avatar-option').forEach(opt => {
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
  renderMaps();
  checkOllamaStatus();
  initNotifications();
  if (USER_MODULES.length > 0) renderSidebar();
  fetchDeploymentInfo();

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
          const res = await fetch('/api/kb/upload', {
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
function switchView(viewId) {
  if (viewId === currentView) return; // Avoid redundant switches
  
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

  if (viewId === 'tickets') {
    loadTickets();
  }
  if (viewId === 'wayfinding') {
    loadFloorPlans();
  }
  if (viewId === 'settings') {
    fetchDeploymentInfo();
  }
}

function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  let html = '';
  
  SYSTEM_MODULES.forEach(mod => {
    if (USER_MODULES.includes(mod.id)) {
      html += `
        <button class="nav-btn ${currentView === mod.id ? 'active' : ''}" data-view="${mod.id}" onclick="switchView('${mod.id}')">
          <span>${mod.icon}</span> ${mod.name}
        </button>
      `;
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
  
  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  appendTyping(typingId);
  
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
  
  if (qaState) {
    handleQA(text);
    removeTyping(typingId);
    return;
  }
  
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

async function checkEnterpriseTools(text) {
  const lower = text.toLowerCase();
  
  // Self-Learning Intent
  if (lower.startsWith("learn this:") || lower.startsWith("remember this:")) {
    const content = text.replace(/^learn this:/i, '').replace(/^remember this:/i, '').trim();
    if (content.length < 3) return false;
    
    appendMessage(`🧠 Saving to permanent memory...`, 'ai');
    try {
      const res = await fetch(`/api/kb/learn`, {
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
  if (lower.includes("check sccm") || lower.includes("find computer")) {
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
  const query = input.value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('directoryResults');
  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Searching Campus Directory...</h3></div>';

  try {
    const res = await fetch(`/api/ad/${query}`);
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
          ${user.Office ? `<div class="dir-item"><strong>Room Number:</strong> 🚪 ${user.Office}</div>` : ''}
          ${user.Email ? `<div class="dir-item"><strong>Email:</strong> 📧 ${user.Email}</div>` : ''}
          ${user.Phone ? `<div class="dir-item"><strong>Phone:</strong> 📞 ${user.Phone}</div>` : ''}
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
  const query = input.value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('sccmResults');
  resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>Scanning SCCM DB...</h3></div>';

  // Smart MAC address pattern recognition (colons, hyphens, periods, or plain hex)
  const isMac = /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/.test(query) || 
                /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/.test(query) || 
                /^[0-9A-Fa-f]{12}$/.test(query);

  const endpoint = isMac ? `/api/sccm/mac/${encodeURIComponent(query)}` : `/api/sccm/pc/${encodeURIComponent(query)}`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.status === 'success') {
      renderSCCMResults(data.data);
    } else {
      if (isMac) {
        // Fallback to query Mist WiFi
        resultsEl.innerHTML = '<div class="ticket-placeholder"><div class="placeholder-icon rotating">⏳</div><h3>🔍 MAC not in SCCM. Scanning Juniper Mist WiFi...</h3></div>';
        try {
          const mistRes = await fetch(`/api/mist/${encodeURIComponent(query)}`);
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
          resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ Device not found in SCCM</h3></div>`;
        }
      } else {
        resultsEl.innerHTML = `<div class="ticket-placeholder"><h3>❌ ${data.message}</h3></div>`;
      }
    }
  } catch (e) {
    resultsEl.innerHTML = '<div class="ticket-placeholder"><h3>❌ Error connecting to server</h3></div>';
  }
}

function renderSCCMResults(devices) {
  const container = document.getElementById('sccmResults');
  let html = `<div class="directory-grid">`;
  
  devices.forEach(pc => {
    const onlineStatus = pc.Status === 'Online' ? 'unlocked' : 'locked';
    html += `
      <div class="sccm-card">
        <div class="dir-card-header">
          <div class="dir-avatar" style="background:var(--accent2);">💻</div>
          <div class="dir-main-info">
            <div class="dir-name">${pc.PCName}</div>
            <div class="dir-starid">${pc.User || 'No User'}</div>
          </div>
          <div class="dir-status ${onlineStatus}">${pc.Status}</div>
        </div>
        <div class="dir-body">
          <div class="dir-item"><strong>Model:</strong> ${pc.Model}</div>
          <div class="dir-item"><strong>Last Seen:</strong> ${pc.LastSeen}</div>
          <div class="dir-item"><strong>IP:</strong> ${pc.IPAddress}</div>
        </div>
        <div class="remote-actions-bar" style="margin-top:10px;">
           <button class="remote-btn" onclick="triggerRemoteAction('${pc.PCName}', 'Sync Policy', this, '${pc.ResourceID}')">🔄 Sync</button>
           <button class="remote-btn" onclick="triggerRemoteAction('${pc.PCName}', 'Scan Updates', this, '${pc.ResourceID}')">🔍 Scan</button>
           <button class="remote-btn" onclick="triggerRemoteAction('${pc.PCName}', 'Evaluate Updates', this, '${pc.ResourceID}')">🚀 Eval</button>
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
    const res = await fetch(`/api/mist/${query}`);
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

function renderMistResults(clients) {
  const container = document.getElementById('mistResults');
  if (!clients || clients.length === 0) {
    container.innerHTML = '<div class="ticket-placeholder"><h3>No clients found for this MAC</h3></div>';
    return;
  }
  
  let html = `<div class="directory-grid">`;
  clients.forEach(client => {
    html += `
      <div class="directory-card">
        <div class="dir-card-header">
          <div class="dir-avatar" style="background:#4f46e5;">📶</div>
          <div class="dir-main-info">
            <div class="dir-name">${client.hostname || 'Unknown Device'}</div>
            <div class="dir-starid">${client.mac}</div>
          </div>
          <div class="dir-status unlocked">Connected</div>
        </div>
        <div class="dir-body">
          <div class="dir-item"><strong>AP Name:</strong> ${client.ap_name || 'N/A'}</div>
          <div class="dir-item"><strong>SSID:</strong> ${client.ssid || 'N/A'}</div>
          <div class="dir-item"><strong>Signal (RSSI):</strong> ${client.rssi} dBm</div>
          <div class="dir-item"><strong>IP Address:</strong> ${client.ip || 'N/A'}</div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
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
    const payload = { prompt: query, history: chatHistory };
    const controller = new AbortController();
    const streamTimeout = setTimeout(() => controller.abort(), 20000);

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
      body: JSON.stringify({ prompt })
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

async function loadTickets() {
  const listEl = document.getElementById('ticketsList');
  listEl.innerHTML = '<div class="ticket-placeholder" style="height:auto; padding:40px;"><div class="placeholder-icon" style="font-size:32px;">⏳</div><p>Fetching tickets...</p></div>';
  
  try {
    const res = await fetch('/api/tdx/tickets');
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
    
    card.innerHTML = `
      <div class="ticket-card-header">
        <span class="ticket-id">#${ticket.id}</span>
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
  
  const detailEl = document.getElementById('ticketDetail');
  detailEl.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">${ticket.title}</div>
      <div class="detail-meta">
        <span><strong>ID:</strong> #${ticket.id}</span>
        <span><strong>Requestor:</strong> ${ticket.requestor}</span>
        <span><strong>Priority:</strong> <span class="${ticket.priority === 'High' ? 'priority-high' : ''}">${ticket.priority}</span></span>
        <span><strong>Service:</strong> ${ticket.service}</span>
      </div>
    </div>
    
    <div class="briefing-section">
      <h4>Original Description</h4>
      <p style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 8px;">${ticket.description}</p>
    </div>
    
    <div id="aiBriefingContainer" class="briefing-card">
      <div class="placeholder-icon" style="font-size:24px; animation: bounce 1s infinite;">🐴</div>
      <p style="text-align:center; font-size:12px; color:var(--text2);">AI is analyzing ticket and matching Knowledge Base...</p>
    </div>
    
    <div id="kbSuggestionsContainer" class="kb-suggestions hidden">
      <h4 style="font-size: 11px; color: var(--accent2); margin-top: 20px;">AI Recommended Procedures</h4>
      <div id="kbSuggestionList" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;"></div>
    </div>
  `;
  
  // Generate AI Briefing and match KB
  generateAIBriefing(ticket);
  matchKnowledgeBase(ticket);
}

async function matchKnowledgeBase(ticket) {
  try {
    const res = await fetch(`/api/kb/search?q=${encodeURIComponent(ticket.title)}`);
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

async function generateAIBriefing(ticket) {
  const container = document.getElementById('aiBriefingContainer');
  
  const prompt = `You are a Senior IT Tech. Analyze this ticket and provide a concise briefing for a junior tech.
  Ticket Title: ${ticket.title}
  Description: ${ticket.description}
  
  Format your response EXACTLY like this:
  SUMMARY: [One sentence summary]
  STEPS: [Bullet points of what to do next]
  WARNINGS: [Any potential gotchas or things to watch out for]`;
  
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (res.ok) {
      const data = await res.json();
      const text = data.response;
      
      // Basic parser for our custom format
      const summary = text.match(/SUMMARY:(.*?)(?=STEPS:|$)/si)?.[1]?.trim() || "See description.";
      const steps = text.match(/STEPS:(.*?)(?=WARNINGS:|$)/si)?.[1]?.trim() || "Follow standard troubleshooting.";
      const warnings = text.match(/WARNINGS:(.*?)$/si)?.[1]?.trim() || "No specific warnings.";
      
      container.innerHTML = `
        <div class="briefing-section">
          <h4>AI Summary</h4>
          <p>${summary}</p>
        </div>
        <div class="briefing-section">
          <h4>Recommended Next Steps</h4>
          <p>${steps.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="briefing-section">
          <h4>Special Considerations</h4>
          <p>${warnings.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    } else {
      container.innerHTML = `<p style="color:var(--yellow);">AI Briefing unavailable. Local Ollama server returned an error.</p>`;
    }
  } catch (e) {
    container.innerHTML = `
      <div class="briefing-section">
        <h4>Manual Triage Suggestion</h4>
        <p>Could not connect to AI engine. Based on the category <strong>${ticket.service}</strong>, you should check the standard troubleshooting steps in the FAQ Library.</p>
      </div>
    `;
  }
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
    const res = await fetch('/api/wayfinding/list');
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
      const steps = data.directions.split('\n').filter(s => s.trim().length > 0);
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
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerText;
    btn.innerText = "✅ Copied!";
    btn.classList.add('success');
    showToast("Link copied to clipboard", "success");
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('success');
    }, 2000);
  });
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

async function executeAICommand() {
  const input = document.getElementById('aiCommandInput');
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
let currentUser = null;

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPass');
  const toggleBtn = document.getElementById('togglePass');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    toggleBtn.innerText = '🔒';
  } else {
    passInput.type = 'password';
    toggleBtn.innerText = '👁️';
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
    ai_url: document.getElementById('conf_ai_url').value
  };

  try {
    const res = await fetch('/api/admin/save-config', {
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
  
  // Show admin button if sysadmin
  if (currentUser.role === 'sysadmin' || currentUser.role === 'wag') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    loadAdminUsers();
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }
}

let SYS_CONFIG = null;

async function loadAdminUsers() {
  try {
    if (!SYS_CONFIG) {
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      if (configData.status === 'success') {
        SYS_CONFIG = configData.config;
      }
    }
    const res = await fetch('/api/admin/users');
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
    const res = await fetch(`/api/admin/users/${username}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.status === 'success') {
      loadAdminUsers();
      appendMessage(`🗑️ Permissions removed for **${username}**.`, 'ai');
    }
  } catch (e) { alert("Failed to delete user"); }
}

async function adminAddUser() {
  const username = document.getElementById('newUserId').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  const checkboxes = document.querySelectorAll('.admin-module-cb');
  const modules = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  
  if (!username) return;
  
  try {
    await fetch('/api/admin/users', {
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
    <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; background: var(--bg2); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; padding: 20px; box-shadow: var(--shadow);">
      <div class="unified-header" style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom:12px; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">👤 Unified Profile <span style="opacity:0.5; font-weight:400; font-size:16px;">(${starId})</span></h2>
        <button class="close-btn" onclick="closeUnifiedProfile()" style="background:none; border:none; color:var(--text2); font-size:20px; cursor:pointer; transition:color 0.2s;">✕</button>
      </div>
      <div style="flex:1; overflow-y:auto; padding-right:5px; display:flex; flex-direction:column; gap:15px;">
        <div id="prof-identity">
          <div class="prof-loading">Loading general directory details...</div>
        </div>
        <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 15px;">
          <div class="profile-section" id="prof-portal" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto;">
            <h3>🔍 StarID Portal Details</h3>
            <div class="prof-loading">Fetching full details from MinnState...</div>
          </div>
          <div class="profile-section" id="prof-sccm" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto;">
            <h3>💻 SCCM Assets & Usage</h3>
            <div class="prof-loading">Scanning SCCM database...</div>
          </div>
          <div class="profile-section" id="prof-tdx" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto;">
            <h3>🎫 Support History (TDX)</h3>
            <div class="prof-loading">Querying ticket system...</div>
          </div>
          <div class="profile-section" id="prof-mist" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto;">
            <h3>📶 WiFi Connectivity</h3>
            <div class="prof-loading">Checking Mist telemetry...</div>
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
    const res = await fetch(`/api/ad/${starId}`);
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
    const res = await fetch(`/api/scrape/starid/${starId}`);
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
        <div class="prof-data-item"><strong>Room Number:</strong> <span style="font-weight:600; color:var(--accent2);">🚪 ${u.Room || 'N/A'}</span></div>
        
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
    const res = await fetch(`/api/sccm/user/${starId}`);
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
    const res = await fetch('/api/tdx/tickets');
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
    const res = await fetch(`/api/mist/${search}`);
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
