let SYSTEM_MODULES = [];
let USER_MODULES = JSON.parse(localStorage.getItem('trc_modules')) || [];
let currentView = 'chat';
let userCurrentLocation = "the Technology Resource Center (TRC) in Bellows Academic (BA)";

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await fetchConfig();
  renderFAQGrid();
  renderFilters();
  renderFormGuide();
  renderLinks();
  await loadDirectoryData();
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
  
  // Try AI first, fallback to keyword matching
  let matchedFaq = null;
  
  // Check Enterprise Tools First
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
  
  if (text.toLowerCase().includes("i am in front of") || text.toLowerCase().includes("i am at")) {
    const loc = text.replace(/i am in front of/i, '').replace(/i am at/i, '').trim();
    userCurrentLocation = loc;
    appendMessage(`📍 Got it! I'll remember that you are currently at **${loc}**. Where can I help you get to?`, 'ai');
    removeTyping(typingId);
    return;
  }

  if (isAIReady) {
    matchedFaq = await getAIPrediction(text);
  }
  
  if (!matchedFaq) {
    matchedFaq = getKeywordPrediction(text);
  }
  
  removeTyping(typingId);
  
  if (matchedFaq) {
    lastMatchedFaq = matchedFaq;
    renderFaqResponse(matchedFaq);
  } else {
    // Search the Custom KB / Exported KB
    try {
      appendTyping(typingId);
      const res = await fetch(`/api/kb/search?q=${encodeURIComponent(text)}`);
      const data = await res.json();
      removeTyping(typingId);
      
      if (data.status === "success" && data.data) {
        if (data.data.source === "Self-Learned") {
          appendMessage(`🧠 **From My Memory:**<br>${data.data.content}`, 'ai');
        } else {
          appendMessage(`📚 **Found in TDX KB: ${data.data.title}**<br>${data.data.content}`, 'ai');
        }
        return; // Success!
      }
    } catch (e) { removeTyping(typingId); }
    
    if (lastMatchedFaq) {
      // Context-aware fallback: assume they are continuing the previous topic
      appendMessage(`Got it! Since we're still talking about **${lastMatchedFaq.service}**, make sure to add that detail ("*${text}*") into the TDX ticket **Description** field so the assigned team has all the context.`, 'ai');
    } else {
      initiateQA(text);
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

  // Auto-Detect StarID or Search Intent (Find, Who is, Lookup)
  const starIdMatch = text.match(/\b[a-z]{2}[0-9]{4}[a-z]{2}\b/i);
  const isSearchIntent = (lower.startsWith("find ") || lower.startsWith("who is ") || lower.startsWith("lookup ") || lower.startsWith("search ")) && !lower.includes("google");
  
  if (starIdMatch || isSearchIntent || lower.includes("check ad") || lower.includes("is locked") || lower.includes("active directory") || lower.includes("ad account") || lower.includes("check starid") || lower.includes("find starid")) {
    let query = "";
    
    if (starIdMatch) {
      query = starIdMatch[0];
    } else {
      const markers = ["for", "find", "who is", "lookup", "search", "check ad", "is locked", "active directory", "ad account", "check starid", "find starid"];
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
    
    appendMessage(`🤖 Searching AD/StarID for: **${query}**...`, 'ai');
    
    try {
      const res = await fetch(`/api/ad/${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        let html = `**Found ${data.data.length} match(es):**<br><br>`;
        
        data.data.forEach((user, idx) => {
          html += `<div style="border-left: 3px solid var(--primary); padding-left: 10px; margin-bottom: 15px;">`;
          html += `• **StarID:** <span style="color:var(--primary); font-weight:bold;">${user.StarID || 'N/A'}</span><br>`;
          html += `• **Name:** ${user.DisplayName || 'N/A'}<br>`;
          html += `• **Title:** ${user.Title || 'N/A'}<br>`;
          html += `• **Dept:** ${user.Department || 'N/A'}<br>`;
          html += `• **Locked:** ${user.IsLocked ? '<span style="color:#ef4444;font-weight:bold;">⚠️ YES</span>' : '<span style="color:#22c55e;font-weight:bold;">✅ NO</span>'}<br>`;
          html += `</div>`;
        });
        
        appendMessage(html, 'ai');
      } else {
        appendMessage(`Search Failed: ${data.message}`, 'ai');
      }
    } catch (e) {
      appendMessage(`Error connecting to Enterprise API. Is the Python backend running?`, 'ai');
    }
    return true;
  }
  
  // SCCM Check Intent
  if (lower.includes("check sccm") || lower.includes("find computer")) {
    const words = lower.split(" ");
    const device = words[words.length - 1];
    appendMessage(`🤖 Querying SCCM Database for device: **${device}**...`, 'ai');
    try {
      const res = await fetch(`/api/sccm/${device}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        let html = `**SCCM Device Found:**<br>`;
        html += `• **Name:** ${data.data.Name}<br>`;
        html += `• **Last Logon:** ${data.data.LastLogonUserName || 'Unknown'}<br>`;
        html += `• **IP Addresses:** ${(data.data.IPAddresses || []).join(', ')}<br>`;
        html += `• **MAC Addresses:** ${(data.data.MACAddresses || []).join(', ')}<br>`;
        html += `• **OS:** ${data.data.OperatingSystemNameandVersion || 'Unknown'}<br>`;
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
    appendMessage(`🤖 Querying Juniper Mist for client: **${mac}**...`, 'ai');
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

  return false;
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

async function getAIPrediction(text) {
  // Construct a prompt asking the model to classify the text into one of our categories
  const categoriesList = FAQ_DATA.map(f => f.service).join(", ");
  const prompt = `You are a Help Desk Assistant. Map the following user issue to the most appropriate service category from this list: [${categoriesList}]. Issue: "${text}". ONLY output the exact name of the category from the list, nothing else.`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

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
  avatar.innerText = sender === 'user' ? '👤' : '🤖';
  
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
    <div class="msg-avatar">🤖</div>
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
    html += `<div class="escalate"><strong>👤 Escalate to:</strong> ${faq.escalate}</div>`;
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
          <h3>👤 Escalation Path</h3>
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
        <span>👤 ${ticket.requestor}</span>
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
      <div class="placeholder-icon" style="font-size:24px; animation: bounce 1s infinite;">🤖</div>
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
        <div class="kb-chip" onclick="switchView('faq'); document.getElementById('faqSearchInput').value='${res.item.q}'; searchFAQ();">
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
  
  try {
    const res = await fetch('/api/ai/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, start })
    });
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
  event.currentTarget.classList.add('active');
  
  const placeholder = document.getElementById('mapPlaceholder');
  const viewer = document.getElementById('pdfViewer');
  
  placeholder.classList.add('hidden');
  viewer.classList.remove('hidden');
  viewer.src = map.url;
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

function addNotification(title, message, level = 'info') {
  const notif = {
    id: Date.now(),
    title,
    message,
    level,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  };
  
  notifications.unshift(notif);
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
    <div class="notif-item ${n.level} ${n.read ? 'read' : 'unread'}" onclick="markAsRead(${n.id})">
      <h4>${n.title}</h4>
      <p>${n.message}</p>
      <div style="font-size: 10px; color: var(--text2); margin-top: 4px;">${n.time}</div>
    </div>
  `).join('');
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
    const res = await fetch('/api/ai/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    
    input.value = '';
    
    if (data.ai_suggestion) {
      appendMessage(`🤖 **AI Suggestion:** ${data.ai_suggestion}`, 'ai');
    }

    if (data.intent === 'sccm_lookup') {
      switchView('sccm');
      document.getElementById('sccmSearchInput').value = data.params.query;
      searchSCCM();
    } else if (data.intent === 'directory_search') {
      switchView('directory');
      document.getElementById('dirSearchInput').value = data.params.query;
      searchDirectory();
    } else if (data.intent === 'kb_search') {
      switchView('faq');
      document.getElementById('faqSearchInput').value = data.params.query;
      searchFAQ();
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

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (data.status === 'success') {
      renderAdminList(data.roles);
    }
  } catch (e) { console.error("Failed to load admin users", e); }
}

function renderAdminList(roles) {
  const container = document.getElementById('adminUserList');
  let html = '';
  const entries = Object.entries(roles);
  
  entries.forEach(([user, data]) => {
    const roleName = typeof data === 'string' ? data : (data.role || 'unknown');
    html += `
      <div class="admin-user-item">
        <div class="admin-user-info">
          <span class="admin-user-id">${user}</span>
          <span class="admin-user-role">${roleName.toUpperCase()}</span>
        </div>
        <button onclick="deleteUser('${user}')" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:16px;">✕</button>
      </div>
    `;
  });
  
  // Add a summary counter
  const summaryHtml = `<p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Total Managed Users: ${entries.length}</p>`;
  container.innerHTML = summaryHtml + (html || '<p style="font-size:12px; color:var(--text2);">No custom roles defined yet.</p>');
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
  if (!username) return;
  
  try {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role })
    });
    document.getElementById('newUserId').value = '';
    loadAdminUsers();
    appendMessage(`👤 User **${username}** assigned to role **${role.toUpperCase()}**.`, 'ai');
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
