// State management
let currentView = 'chat';
let isAIReady = false;
let directoryData = [];
let lastMatchedFaq = null;
let qaState = null; // Tracks active QA sessions
let learnedKeywords = JSON.parse(localStorage.getItem('learnedKeywords')) || {};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  renderFAQGrid();
  renderFilters();
  renderFormGuide();
  renderLinks();
  await loadDirectoryData();
  checkOllamaStatus();
});

async function loadDirectoryData() {
  if (typeof DIRECTORY_DATA !== 'undefined' && DIRECTORY_DATA.faculty) {
    directoryData = DIRECTORY_DATA.faculty;
  }
}

// Navigation
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(`view-${viewId}`).classList.add('active');
  document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
}

// ----- CHAT & AI LOGIC -----
async function checkOllamaStatus() {
  const statusDot = document.getElementById('aiStatus');
  const statusText = document.getElementById('aiStatusText');
  
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags');
    if (res.ok) {
      statusDot.className = 'status-dot online';
      statusText.innerText = 'AI Ready (Local)';
      isAIReady = true;
      // We could also check if phi3:mini is installed and trigger a pull if not,
      // but for simplicity we assume it's there or we fallback.
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
  } else if (lastMatchedFaq) {
    // Context-aware fallback: assume they are continuing the previous topic
    appendMessage(`Got it! Since we're still talking about **${lastMatchedFaq.service}**, make sure to add that detail ("*${text}*") into the TDX ticket **Description** field so the assigned team has all the context.`, 'ai');
  } else {
    initiateQA(text);
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
    appendMessage("I'm completely stumped on this one! Could you rephrase the issue with different words?", 'ai');
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
  
  // AD Check Intent
  if (lower.includes("check ad") || lower.includes("is locked") || lower.includes("active directory") || lower.includes("ad account")) {
    const words = lower.split(" ");
    let username = words[words.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
    
    // Extract name safely
    const forIndex = words.findIndex(w => w === 'for');
    if (forIndex !== -1 && forIndex < words.length - 1) {
      username = words[forIndex + 1].replace(/[^a-zA-Z0-9-]/g, '');
    }
    
    if (username.length < 3) return false;
    
    appendMessage(`🤖 Connecting to Active Directory for user: **${username}**...`, 'ai');
    
    try {
      const res = await fetch(`http://localhost:8000/api/ad/${username}`);
      const data = await res.json();
      
      if (data.status === "success") {
        let html = `**Active Directory Results:**<br>`;
        html += `• **Name:** ${data.data.DisplayName || 'N/A'}<br>`;
        html += `• **Title:** ${data.data.Title || 'N/A'}<br>`;
        html += `• **Department:** ${data.data.Department || 'N/A'}<br>`;
        html += `• **Account Locked:** ${data.data.IsLocked ? '<span style="color:#ef4444;font-weight:bold;">⚠️ YES</span>' : '<span style="color:#22c55e;font-weight:bold;">✅ NO</span>'}<br>`;
        appendMessage(html, 'ai');
      } else {
        appendMessage(`AD Query Failed: ${data.message}`, 'ai');
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
      const res = await fetch(`http://localhost:8000/api/sccm/${device}`);
      const data = await res.json();
      appendMessage(`**SCCM Status:** ${data.message}`, 'ai');
    } catch (e) { appendMessage("Error connecting to Python backend server.", 'ai'); }
    return true;
  }
  
  // Mist Check Intent
  if (lower.includes("check mist") || lower.includes("wifi status")) {
    const words = lower.split(" ");
    const mac = words[words.length - 1];
    appendMessage(`🤖 Querying Juniper Mist for client: **${mac}**...`, 'ai');
    try {
      const res = await fetch(`http://localhost:8000/api/mist/${mac}`);
      const data = await res.json();
      appendMessage(`**Mist Status:** ${data.message}`, 'ai');
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
        links: ["https://www.smsu.edu/directory/index.html"]
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
  
  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini', // Assuming we pulled this model
        prompt: prompt,
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const predictedCategory = data.response.trim();
      
      // Find the matching FAQ
      const match = FAQ_DATA.find(f => f.service.toLowerCase() === predictedCategory.toLowerCase());
      return match || getKeywordPrediction(text); // fallback if model hallucinates
    }
  } catch (err) {
    console.error("Ollama error:", err);
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
  let html = '';
  
  TDX_FORM_FIELDS.forEach(field => {
    html += `
      <div class="form-field-card">
        <h3>${field.field} ${field.required ? '<span class="required">(Required)</span>' : '<span class="optional">(Optional)</span>'}</h3>
        <p>${field.description}</p>
        <div class="tip">💡 <strong>Tip:</strong> ${field.tip}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
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
      html += `
        <a href="${link.url}" target="_blank" class="link-card">
          <div class="link-icon">${link.icon}</div>
          <div>
            <div class="link-name">${link.name}</div>
            <div class="link-url">${link.url === '—' ? 'Link not provided' : link.url}</div>
          </div>
        </a>
      `;
    });
    
    html += `</div></div>`;
  });
  
  container.innerHTML = html;
}
