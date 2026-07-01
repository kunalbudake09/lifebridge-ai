/* ==========================================================================
   LIFEBRIDGE AI - APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const state = {
        activeTab: 'dashboard-tab',
        sosActive: false,
        sosCountdownTimer: null,
        language: 'en',
        cprMetronomeActive: false,
        cprCount: 0,
        cprAudioContext: null,
        cprInterval: null,
        hazards: [
            { type: 'waterlogging', location: 'S.V. Road near Bandra Station', details: 'Heavy waterlogging. Flooded up to 3 feet.', time: '14:10' },
            { type: 'tree', location: 'WEH near Andheri flyover', details: 'Fallen tree blocking two lanes on highway.', time: '13:45' }
        ],
        shelters: [
            { id: 1, name: 'NDRF Transit Camp', capacity: 62, max: 200, distance: 1.2, petFriendly: true, medical: true, targetX: 680, targetY: 270 },
            { id: 2, name: 'BMC School Camp', capacity: 40, max: 150, distance: 2.5, petFriendly: false, medical: true, targetX: 560, targetY: 140 },
            { id: 3, name: 'Xavier Gymkhana Hall', capacity: 88, max: 300, distance: 0.8, petFriendly: true, medical: false, targetX: 100, targetY: 480 }
        ]
    };

    // --- LANGUAGE DICTIONARY (MOCK TRANSLATIONS) ---
    const translations = {
        en: {
            title: 'Dashboard Overview',
            subtitle: 'Real-time status updates and critical alerts',
            alert: 'Cyclone Warning: Biparjoy (Cat 4)',
            sos: 'SOS EMERGENCY',
            dashboard: 'Dashboard',
            ai: 'AI Assistant',
            shelters: 'Shelter Finder',
            roads: 'Safe Roads',
            medical: 'Medical Help',
            prep: 'Prep Kit'
        },
        mr: {
            title: 'डॅशबोर्ड विहंगावलोकन',
            subtitle: 'रिअल-टाइम अपडेट आणि गंभीर इशारे',
            alert: 'चक्रीवादळ इशारा: बिपरजॉय (श्रेणी ४)',
            sos: 'तातडीची मदत (SOS)',
            dashboard: 'डॅशबोर्ड',
            ai: 'एआय सहाय्यक',
            shelters: 'आश्रय केंद्र शोधक',
            roads: 'सुरक्षित मार्ग',
            medical: 'वैद्यकीय मदत',
            prep: 'तयारी किट'
        },
        hi: {
            title: 'डैशबोर्ड अवलोकन',
            subtitle: 'वास्तविक समय स्थिति अपडेट और महत्वपूर्ण अलर्ट',
            alert: 'चक्रवात अलर्ट: बिपरजॉय (श्रेणी 4)',
            sos: 'आपातकालीन एसओएस',
            dashboard: 'डैशबोर्ड',
            ai: 'एआई सहायक',
            shelters: 'आश्रय खोजक',
            roads: 'सुरक्षित सड़कें',
            medical: 'चिकित्सा सहायता',
            prep: 'तैयारी किट'
        }
    };

    // --- DOM ELEMENT REFERENCES ---
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const headerAlertText = document.getElementById('header-alert-text');
    const sosTriggerBtn = document.getElementById('sos-trigger-btn');
    const languageToggle = document.getElementById('language-toggle');

    // Tab buttons
    const navDashboard = document.getElementById('nav-dashboard');
    const navAi = document.getElementById('nav-ai');
    const navShelters = document.getElementById('nav-shelters');
    const navRoads = document.getElementById('nav-roads');
    const navMedical = document.getElementById('nav-medical');
    const navPrep = document.getElementById('nav-prep');

    // --- TAB ROUTING ---
    function switchTab(targetTabId) {
        state.activeTab = targetTabId;

        // Toggle active pane
        tabPanes.forEach(pane => {
            if (pane.id === targetTabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Toggle active sidebar link
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetTabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update header details based on active tab
        updateHeaderInfo(targetTabId);

        // Scroll to top
        document.querySelector('.main-content').scrollTop = 0;
    }

    function updateHeaderInfo(tabId) {
        const lang = state.language;
        if (tabId === 'dashboard-tab') {
            pageTitle.textContent = translations[lang].title;
            pageSubtitle.textContent = translations[lang].subtitle;
        } else if (tabId === 'ai-tab') {
            pageTitle.textContent = translations[lang].ai;
            pageSubtitle.textContent = 'Talk to our AI agent for emergency survival instructions';
        } else if (tabId === 'shelters-tab') {
            pageTitle.textContent = translations[lang].shelters;
            pageSubtitle.textContent = 'Find real-time shelter vacancies and resources near you';
            renderShelters();
        } else if (tabId === 'roads-tab') {
            pageTitle.textContent = translations[lang].roads;
            pageSubtitle.textContent = 'View safe navigation routes and report hazards in your area';
        } else if (tabId === 'medical-tab') {
            pageTitle.textContent = translations[lang].medical;
            pageSubtitle.textContent = 'Emergency hotlines, dispatcher dispatcher, and CPR compressor guide';
        } else if (tabId === 'prep-tab') {
            pageTitle.textContent = translations[lang].prep;
            pageSubtitle.textContent = 'Disaster preparedness supply list and offline resource vault';
            updatePrepChecklistProgress();
        }
    }

    // Bind navigation buttons
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchTab(target);
        });
    });


    // --- MULTI-LANGUAGE TOGGLE ---
    languageToggle.addEventListener('change', (e) => {
        state.language = e.target.value;
        const lang = state.language;
        
        // Update header warning text
        headerAlertText.textContent = translations[lang].alert;
        sosTriggerBtn.querySelector('span').textContent = translations[lang].sos;
        
        // Update navigation links
        navDashboard.querySelector('span').textContent = translations[lang].dashboard;
        navAi.querySelector('span').textContent = translations[lang].ai;
        navShelters.querySelector('span').textContent = translations[lang].shelters;
        navRoads.querySelector('span').textContent = translations[lang].roads;
        navMedical.querySelector('span').textContent = translations[lang].medical;
        navPrep.querySelector('span').textContent = translations[lang].prep;

        // Refresh current header texts
        updateHeaderInfo(state.activeTab);
    });


    // --- SOS DISPATCH SEQUENCE ---
    const sosActivePanel = document.getElementById('sos-active-panel');
    const sosCancelBtn = document.getElementById('sos-cancel-btn');
    const sosTimer = document.getElementById('sos-timer');
    const feedAlertsList = document.getElementById('feed-alerts-list');

    sosTriggerBtn.addEventListener('click', triggerSOSSignal);
    sosCancelBtn.addEventListener('click', cancelSOSSignal);

    function triggerSOSSignal() {
        if (state.sosActive) return;
        
        state.sosActive = true;
        sosActivePanel.classList.remove('hidden');
        sosTriggerBtn.classList.add('hidden'); // hide main header trigger or pulse it
        
        // Switch to dashboard tab to display SOS
        switchTab('dashboard-tab');

        // Start countdown
        let totalSeconds = 299; // 4 mins 59 secs
        sosTimer.textContent = '04:59';
        
        state.sosCountdownTimer = setInterval(() => {
            totalSeconds--;
            if (totalSeconds <= 0) {
                clearInterval(state.sosCountdownTimer);
                sosTimer.textContent = 'DISPATCHED';
            } else {
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                sosTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);

        // Add to live alert feed
        addLiveFeedAlert('[CITIZEN SOS]', 'Emergency distress beacon triggered at current location coordinates. Search & Rescue notified.', 'danger-level');
    }

    function cancelSOSSignal() {
        if (!state.sosActive) return;
        
        state.sosActive = false;
        clearInterval(state.sosCountdownTimer);
        sosActivePanel.classList.add('hidden');
        sosTriggerBtn.classList.remove('hidden');
        
        addLiveFeedAlert('[SOS CANCELLED]', 'Citizen emergency signal broadcast was manually cancelled by the user.', 'info-level');
    }

    function addLiveFeedAlert(tag, text, cssClass) {
        const timeNow = new Date().toTimeString().slice(0, 5);
        const item = document.createElement('div');
        item.className = `feed-item ${cssClass}`;
        item.innerHTML = `
            <span class="time font-mono">${timeNow}</span>
            <div class="feed-body">
                <strong>${tag}</strong> ${text}
            </div>
        `;
        feedAlertsList.insertBefore(item, feedAlertsList.firstChild);
    }


    // --- AI DISASTER ASSISTANT ---
    const chatForm = document.getElementById('chat-form');
    const chatUserInput = document.getElementById('chat-user-input');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const toggleKeyPanel = document.getElementById('toggle-key-panel');
    const keyPanel = document.getElementById('gemini-key-panel');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const clearKeyBtn = document.getElementById('clear-key-btn');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const quickPromptBtns = document.querySelectorAll('.prompt-card-btn');

    // Retrieve API Key if exists
    if (localStorage.getItem('gemini_api_key')) {
        geminiApiKeyInput.value = localStorage.getItem('gemini_api_key');
    }

    toggleKeyPanel.addEventListener('click', () => {
        keyPanel.classList.toggle('hidden');
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = geminiApiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            alert('Gemini API key saved in local storage.');
            keyPanel.classList.add('hidden');
        }
    });

    clearKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('gemini_api_key');
        geminiApiKeyInput.value = '';
        alert('Gemini API key cleared.');
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserMessage(chatUserInput.value.trim());
        chatUserInput.value = '';
    });

    quickPromptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            handleUserMessage(query);
        });
    });

    function handleUserMessage(message) {
        if (!message) return;

        // Render User Message
        appendMessage('user-message', message);
        
        // Render Bot Loading indicator
        const loadingId = appendLoadingIndicator();
        
        // Call either Gemini API or Fallback Simulator
        const apiKey = localStorage.getItem('gemini_api_key');
        if (apiKey) {
            queryGeminiAPI(message, apiKey, loadingId);
        } else {
            setTimeout(() => {
                queryMockAI(message, loadingId);
            }, 1000);
        }
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const timeNow = new Date().toTimeString().slice(0, 5);
        
        msgDiv.innerHTML = `
            <div class="msg-bubble">${formatTextToHTML(text)}</div>
            <span class="msg-time font-mono">${timeNow}</span>
        `;
        
        chatMessagesContainer.appendChild(msgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function appendLoadingIndicator() {
        const id = 'bot-load-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="msg-bubble font-mono">Thinking...</div>
        `;
        chatMessagesContainer.appendChild(msgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        return id;
    }

    function removeLoadingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    function formatTextToHTML(text) {
        // Simple markdown bullet points and newline replacer
        let formatted = text.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/^\*\s(.*)/gm, '<li>$1</li>');
        if (formatted.includes('<li>')) {
            // wrap adjacent list elements
            formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
        }
        return formatted;
    }

    // API Call
    async function queryGeminiAPI(prompt, apiKey, loadingId) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `You are LifeBridge AI, an emergency response assistant. The user is in a disaster region. Provide concise, direct, step-by-step, actionable safety guidance. Keep formatting clear with bullet points. User asks: ${prompt}`
                }]
            }]
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('API Key invalid or rate limited');
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            removeLoadingIndicator(loadingId);
            appendMessage('bot-message', textResponse);
        } catch (error) {
            console.error(error);
            removeLoadingIndicator(loadingId);
            appendMessage('bot-message', `❌ **Gemini API Error:** ${error.message}. Reverting to local simulation database.`);
            // Run mock query as fallback
            queryMockAI(prompt, null);
        }
    }

    // Local simulated QA
    function queryMockAI(prompt, loadingId) {
        if (loadingId) removeLoadingIndicator(loadingId);
        
        const lowerPrompt = prompt.toLowerCase();
        let reply = "";

        if (lowerPrompt.includes('shelter')) {
            reply = `**Nearest Emergency Shelters:**\n\n` +
                    `1. **NDRF Transit Camp** (1.2 miles away)\n` +
                    `   * Status: Open (62% Capacity)\n` +
                    `   * Features: Pet-friendly, Medical services, Power backup.\n` +
                    `   * Location: Sector 5, Bandra.\n\n` +
                    `2. **BMC School Camp** (2.5 miles away)\n` +
                    `   * Status: Open (40% Capacity)\n` +
                    `   * Features: Medical Services, Hot meals.\n\n` +
                    `*Navigate to the **Shelter Finder** tab to filter features or load active routes directly onto the Safe Roads Map.*`;
        } else if (lowerPrompt.includes('road') || lowerPrompt.includes('closed') || lowerPrompt.includes('highway')) {
            reply = `**Safe Roads Status Alert:**\n\n` +
                    `* **CLOSED**: L.B.S. Marg is heavily waterlogged. Do not attempt to cross.\n` +
                    `* **CLOSED**: Kalina connector bridge is submerged.\n` +
                    `* **SAFE**: Western Express Highway is open and safe for all travel.\n` +
                    `* **SAFE**: S.V. Road (Bandra Section) is operational.\n\n` +
                    `Please check the **Safe Roads Map** tab for live community hazard reports, waterlogging warnings, and route updates.`;
        } else if (lowerPrompt.includes('cpr') || lowerPrompt.includes('compress')) {
            reply = `**First Aid: Cardiopulmonary Resuscitation (CPR)**\n\n` +
                    `1. **Check responsiveness**: Tap the victim's shoulder and shout "Are you okay?".\n` +
                    `2. **Call 112 / 108**: Get help immediately and request assistance.\n` +
                    `3. **Start Compressions**: Push hard and fast in the center of the chest.\n` +
                    `   * Rate: **100 to 120 compressions per minute** (110 BPM).\n` +
                    `   * Depth: **2 inches** (5 cm).\n\n` +
                    `*Go to the **Medical Help** tab to use our interactive CPR Metronome which generates audio beeps and visual pulses to pace your compressions.*`;
        } else if (lowerPrompt.includes('wound') || lowerPrompt.includes('bleed') || lowerPrompt.includes('medical')) {
            reply = `**First Aid: Treating Severe Bleeding**\n\n` +
                    `1. **Apply direct pressure**: Place a clean bandage or cloth firmly over the wound.\n` +
                    `2. **Elevate**: Raise the injured limb above heart level if possible.\n` +
                    `3. **Keep pressing**: Do not remove the cloth if it gets soaked; add another layer on top and keep applying firm pressure.\n` +
                    `4. **Seek Help**: Call emergency contacts or use the Medical Support Dispatcher in the **Medical Help** tab.`;
        } else if (lowerPrompt.includes('cyclone') || lowerPrompt.includes('biparjoy') || lowerPrompt.includes('wind')) {
            reply = `**Cyclone Biparjoy Safety Instructions (Category 4):**\n\n` +
                    `1. **Stay indoors**: Do not leave your home/shelter until official authorities declare the cyclone has passed.\n` +
                    `2. **Stay away from windows**: Seek shelter in an interior windowless room (like a bathroom, closet, or hallway).\n` +
                    `3. **Turn off utilities**: Unplug major appliances and turn off gas lines to avoid fire hazards.\n` +
                    `4. **Prepare for power cuts**: Keep flashlights ready. Charge devices now.`;
        } else if (lowerPrompt.includes('pack') || lowerPrompt.includes('supplies') || lowerPrompt.includes('kit') || lowerPrompt.includes('gear')) {
            reply = `**Emergency Survival Supply Pack Essentials:**\n\n` +
                    `* **Water**: 1 gallon per person per day (3-day supply).\n` +
                    `* **Food**: Non-perishable, ready-to-eat dry items (like biscuits, roasted chana).\n` +
                    `* **First Aid**: Basic dressings, antiseptic, and a 7-day supply of prescriptions.\n` +
                    `* **Tools**: Flashlight, extra batteries, power bank, dust masks.\n` +
                    `* **Documents**: Aadhaar Card, ration card, insurance papers, cash in waterproof bag.\n\n` +
                    `Check your personal readiness index under the **Prep Kit** tab and download offline guides.`;
        } else {
            reply = `I've received your query about: "${prompt}".\n\n` +
                    `For safety guidelines, you can request details about **shelters**, **road safety**, **CPR first-aid**, or **emergency supplies**.\n\n` +
                    `*Note: You can unlock custom Gemini responses by configuring your Gemini API key in the top configuration panel.*`;
        }

        appendMessage('bot-message', reply);
    }


    // --- 3. SHELTER FINDER & MAP INTEGRATION ---
    const shelterSearch = document.getElementById('shelter-search');
    const filterPet = document.getElementById('filter-pet');
    const filterMedical = document.getElementById('filter-medical');
    const filterVacancy = document.getElementById('filter-vacancy');
    const sheltersListElement = document.getElementById('shelters-list');
    const totalSheltersCount = document.getElementById('total-shelters-count');
    const mapNavRoutePath = document.getElementById('navigation-route');

    shelterSearch.addEventListener('input', renderShelters);
    filterPet.addEventListener('change', renderShelters);
    filterMedical.addEventListener('change', renderShelters);
    filterVacancy.addEventListener('change', renderShelters);

    function renderShelters() {
        const query = shelterSearch.value.toLowerCase();
        const petReq = filterPet.checked;
        const medReq = filterMedical.checked;
        const vacReq = filterVacancy.checked;

        const filtered = state.shelters.filter(shelter => {
            const matchesSearch = shelter.name.toLowerCase().includes(query);
            const matchesPet = !petReq || shelter.petFriendly;
            const matchesMedical = !medReq || shelter.medical;
            const capPercent = (shelter.capacity / shelter.max) * 100;
            const matchesVacancy = !vacReq || (capPercent < 90);

            return matchesSearch && matchesPet && matchesMedical && matchesVacancy;
        });

        totalSheltersCount.textContent = filtered.length;
        sheltersListElement.innerHTML = '';

        if (filtered.length === 0) {
            sheltersListElement.innerHTML = `
                <div class="card span-two-cols" style="text-align: center; color: var(--color-text-muted);">
                    No shelters match your selected filters. Try loosening criteria.
                </div>
            `;
            return;
        }

        filtered.forEach(shelter => {
            const capPercent = Math.round((shelter.capacity / shelter.max) * 100);
            let barColorClass = 'fill-green';
            if (capPercent >= 85) barColorClass = 'fill-red';
            else if (capPercent >= 60) barColorClass = 'fill-orange';

            const card = document.createElement('div');
            card.className = 'card shelter-card';
            card.innerHTML = `
                <div class="shelter-card-header">
                    <div>
                        <h4>${shelter.name}</h4>
                        <small class="text-muted">Capacity: ${shelter.max} max capacity</small>
                    </div>
                    <span class="shelter-dist font-mono">${shelter.distance} miles</span>
                </div>
                
                <div class="capacity-tracker">
                    <div class="capacity-label">
                        <span>Occupancy</span>
                        <strong>${capPercent}% Full</strong>
                    </div>
                    <div class="capacity-bar">
                        <div class="capacity-bar-fill ${barColorClass}" style="width: ${capPercent}%;"></div>
                    </div>
                </div>
                
                <div class="shelter-amenities">
                    <span class="amenity-badge">${shelter.petFriendly ? '🐾 Pet Friendly' : '🚫 No Pets'}</span>
                    <span class="amenity-badge">${shelter.medical ? '⚕️ Medical Aid' : '⚠️ Shelter Only'}</span>
                    <span class="amenity-badge">🍲 Meals Included</span>
                </div>
                
                <button class="btn btn-cyan btn-block get-route-btn" data-shelter-id="${shelter.id}">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="margin-right: 4px;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon></svg>
                    <span>Visualize Route on Map</span>
                </button>
            `;
            
            // Add event listener to the visualizer button
            card.querySelector('.get-route-btn').addEventListener('click', () => {
                visualizeShelterRoute(shelter);
            });

            sheltersListElement.appendChild(card);
        });
    }

    function visualizeShelterRoute(shelter) {
        // Toggle Map tab active
        switchTab('roads-tab');

        // Draw nav route path dynamically on SVG
        // Let's modify navigation-route d attribute based on shelter
        // User pin coordinates: 400, 350
        // Shelter coords: shelter.targetX, shelter.targetY
        
        let pathD = `M 400,350 L 400,${shelter.targetY} L ${shelter.targetX},${shelter.targetY}`;
        if (shelter.id === 3) {
            // Civic center
            pathD = `M 400,350 L 400,480 L 100,480`;
        } else if (shelter.id === 2) {
            // East ward
            pathD = `M 400,350 L 600,350 L 600,180 L 560,180 L 560,140`;
        } else if (shelter.id === 1) {
            // Central Gym
            pathD = `M 400,350 L 600,350 L 600,300 L 680,300 L 680,270`;
        }

        mapNavRoutePath.setAttribute('d', pathD);
        mapNavRoutePath.classList.remove('hidden');

        // Flash target shelter node
        const node = document.getElementById(`node-shelter-${shelter.id}`);
        if (node) {
            const circle = node.querySelector('circle');
            circle.classList.add('pulse-node');
            setTimeout(() => {
                circle.classList.remove('pulse-node');
            }, 6000);
        }

        addLiveFeedAlert('[ROUTE CALCULATION]', `Safe escape route generated to ${shelter.name} avoiding closed waterlogged intersections.`, 'info-level');
    }


    // --- 4. SAFE ROADS & HAZARD REPORTER ---
    const hazardForm = document.getElementById('hazard-form');
    const hazardType = document.getElementById('hazard-type');
    const hazardLocation = document.getElementById('hazard-location');
    const hazardDetails = document.getElementById('hazard-details');
    const liveHazardReportsList = document.getElementById('live-hazard-reports');
    const dynamicHazardsGroup = document.getElementById('dynamic-hazards-group');

    hazardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = hazardType.value;
        const loc = hazardLocation.value.trim();
        const details = hazardDetails.value.trim() || 'No additional details provided.';
        const timeNow = new Date().toTimeString().slice(0, 5);

        const newReport = { type, location: loc, details, time: timeNow };
        state.hazards.unshift(newReport);

        // Reset form
        hazardLocation.value = '';
        hazardDetails.value = '';

        // Refresh reports lists
        renderHazardReports();
        
        // Add marker to map
        addHazardMarkerToMap(newReport);

        // Update dashboard Stats count for "Road Blocks Reported"
        const countText = document.querySelector('.orange-icon').nextElementSibling.querySelector('h3');
        const currentVal = parseInt(countText.textContent);
        countText.textContent = currentVal + 1;

        addLiveFeedAlert(`[HAZARD LOGGED: ${type.toUpperCase()}]`, `Community reported ${type} at ${loc}. Route marked hazardous.`, 'warning-level');
    });

    function renderHazardReports() {
        liveHazardReportsList.innerHTML = '';
        state.hazards.forEach(hazard => {
            const card = document.createElement('div');
            card.className = 'report-card';
            
            let emoji = '⚠️';
            if (hazard.type === 'waterlogging') emoji = '🌊';
            else if (hazard.type === 'blocked') emoji = '🚧';
            else if (hazard.type === 'tree') emoji = '🌳';
            else if (hazard.type === 'wire') emoji = '⚡';

            card.innerHTML = `
                <div class="report-card-header">
                    <span class="report-tag ${hazard.type}">${emoji} ${hazard.type}</span>
                    <span class="font-mono text-muted">${hazard.time}</span>
                </div>
                <p><strong>Loc:</strong> ${hazard.location}</p>
                <p style="font-size:0.75rem;">${hazard.details}</p>
            `;
            liveHazardReportsList.appendChild(card);
        });
    }

    function addHazardMarkerToMap(hazard) {
        // Map viewport is 800 x 600
        // Generate random coordinates centering around roads
        // Safe streets grid zones:
        // Highway A: Y=300, X=[100 to 700]
        // River Road B: X=200, Y=[150 to 500]
        // Sector Road C: X=600, Y=[200 to 500]
        // Let's place it at a pseudo-random location
        
        let x = Math.floor(Math.random() * 500) + 150;
        let y = Math.floor(Math.random() * 300) + 150;

        // Snapping coords slightly if street keywords present
        const loc = hazard.location.toLowerCase();
        if (loc.includes('highway') || loc.includes('a1')) {
            y = 300;
        } else if (loc.includes('river') || loc.includes('road b')) {
            x = 200;
        } else if (loc.includes('sector') || loc.includes('road c')) {
            x = 600;
        }

        // SVG group creation
        const ns = "http://www.w3.org/2000/svg";
        const group = document.createElementNS(ns, "g");
        group.setAttribute("transform", `translate(${x}, ${y})`);
        group.setAttribute("class", "hazard-icon-marker");

        // Warning Triangle
        const polygon = document.createElementNS(ns, "polygon");
        polygon.setAttribute("points", "0,-10 10,8 -10,8");
        polygon.setAttribute("fill", "#ffab00");
        polygon.setAttribute("stroke", "#fff");
        polygon.setAttribute("stroke-width", "1");

        // Text
        const text = document.createElementNS(ns, "text");
        text.setAttribute("y", "18");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#ffab00");
        text.setAttribute("font-family", "Outfit");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("font-size", "7px");
        
        let label = 'Hazard';
        if (hazard.type === 'waterlogging') label = 'Flooding';
        else if (hazard.type === 'blocked') label = 'Block';
        else if (hazard.type === 'tree') label = 'Tree';
        else if (hazard.type === 'wire') label = 'Wire';
        text.textContent = label;

        group.appendChild(polygon);
        group.appendChild(text);
        dynamicHazardsGroup.appendChild(group);

        // Animate marker insertion
        group.style.opacity = 0;
        let opacity = 0;
        const animation = setInterval(() => {
            opacity += 0.1;
            group.style.opacity = opacity;
            if (opacity >= 1) clearInterval(animation);
        }, 30);
    }

    // Render initial pre-configured reports
    renderHazardReports();
    state.hazards.forEach(hazard => addHazardMarkerToMap(hazard));


    // --- 5. MEDICAL HELP & CPR METRONOME ---
    const medicalDispatchForm = document.getElementById('medical-dispatch-form');
    const medicalDetailsInput = document.getElementById('medical-details');
    const medicalDispatchStatus = document.getElementById('medical-dispatch-status');

    medicalDispatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const severity = medicalDispatchForm.querySelector('input[name="severity"]:checked').value;
        const details = medicalDetailsInput.value.trim();
        
        // Show simulated loading and success state
        medicalDispatchStatus.className = `dispatch-status-alert ${severity}`;
        medicalDispatchStatus.innerHTML = `
            <strong>DISPATCHING RESCUE...</strong><br>
            Emergency medical dispatcher has received your coordinates.<br>
            Estimated arrival time: <strong>4-8 mins</strong>. Stay calm.
        `;
        medicalDispatchStatus.classList.remove('hidden');

        // Add to live alert feed
        addLiveFeedAlert(`[MEDICAL DISPATCH: ${severity.toUpperCase()}]`, `Ambulance/Aid team dispatched for: "${details}".`, 'danger-level');

        // Reset details field
        medicalDetailsInput.value = '';
    });

    // CPR Audio Metronome
    const cprPulser = document.getElementById('cpr-pulser');
    const cprText = document.getElementById('cpr-text');
    const cprStartBtn = document.getElementById('cpr-start-btn');
    const cprStopBtn = document.getElementById('cpr-stop-btn');
    const cprCountDisplay = document.getElementById('cpr-count-display');

    cprStartBtn.addEventListener('click', startCprMetronome);
    cprStopBtn.addEventListener('click', stopCprMetronome);

    function startCprMetronome() {
        if (state.cprMetronomeActive) return;

        state.cprMetronomeActive = true;
        state.cprCount = 0;
        cprCountDisplay.textContent = 'Compressions: 00';
        
        cprStartBtn.classList.add('hidden');
        cprStopBtn.classList.remove('hidden');

        // Initialize Web Audio context (must be initialized on user interaction)
        if (!state.cprAudioContext) {
            state.cprAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 110 BPM means 110 compressions per 60 seconds = 1 compression every 545.45 milliseconds
        const intervalMs = (60 / 110) * 1000; 

        state.cprInterval = setInterval(() => {
            playMetronomeClick();
            triggerCprVisualPulse();
        }, intervalMs);
    }

    function stopCprMetronome() {
        if (!state.cprMetronomeActive) return;

        state.cprMetronomeActive = false;
        clearInterval(state.cprInterval);
        
        cprStartBtn.classList.remove('hidden');
        cprStopBtn.classList.add('hidden');
        
        cprPulser.classList.remove('beat-active');
        cprText.textContent = 'PUSH';
    }

    function playMetronomeClick() {
        if (!state.cprAudioContext) return;
        
        const audioCtx = state.cprAudioContext;
        
        // Create Oscillator Node
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Setup sound (high pitch beep)
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); // 800 Hz pitch
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08); // Quick decay

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08); // 80ms beep duration
    }

    function triggerCprVisualPulse() {
        state.cprCount++;
        cprCountDisplay.textContent = `Compressions: ${String(state.cprCount).padStart(2, '0')}`;
        
        // Toggle text and class to trigger CSS animation
        cprText.textContent = 'PUSH';
        cprPulser.classList.add('beat-active');
        
        // Remove active state shortly after to allow re-trigger on next cycle
        setTimeout(() => {
            cprPulser.classList.remove('beat-active');
        }, 150);
    }


    // --- 6. PREP KIT CHECKLIST & PERSISTENCE ---
    const prepItemChks = document.querySelectorAll('.prep-item-chk');
    const prepProgressFill = document.getElementById('prep-progress-fill');
    const prepProgressText = document.getElementById('prep-progress-text');

    // Retrieve saved checklist states
    prepItemChks.forEach((chk, idx) => {
        const savedVal = localStorage.getItem(`prep_chk_${idx}`);
        if (savedVal === 'true') {
            chk.checked = true;
        }

        chk.addEventListener('change', () => {
            localStorage.setItem(`prep_chk_${idx}`, chk.checked);
            updatePrepChecklistProgress();
        });
    });

    function updatePrepChecklistProgress() {
        let totalWeight = 0;
        let completedWeight = 0;

        prepItemChks.forEach(chk => {
            const weight = parseInt(chk.getAttribute('data-weight'));
            totalWeight += weight;
            if (chk.checked) {
                completedWeight += weight;
            }
        });

        const progressPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
        
        prepProgressFill.style.width = `${progressPercent}%`;
        prepProgressText.textContent = `${progressPercent}%`;

        // Update dashboard Quick Stats panel progress if active
        const dashboardRatingText = document.querySelector('.yellow-icon')?.nextElementSibling?.querySelector('h3');
        if (dashboardRatingText) {
            dashboardRatingText.textContent = `${progressPercent}%`;
        }
    }

    // Run once on load to update bar
    updatePrepChecklistProgress();


    // --- OFFLINE RESOURCE VAULT DOWNLOADER ---
    const downloadManualBtn = document.getElementById('download-manual');
    const downloadSheltersBtn = document.getElementById('download-shelters');
    const downloadCardBtn = document.getElementById('download-card');

    downloadManualBtn.addEventListener('click', () => triggerVirtualDownload('safety-manual'));
    downloadSheltersBtn.addEventListener('click', () => triggerVirtualDownload('shelters'));
    downloadCardBtn.addEventListener('click', () => triggerVirtualDownload('info-card'));

    function triggerVirtualDownload(fileType) {
        let content = "";
        let filename = "";

        if (fileType === 'safety-manual') {
            filename = "LifeBridge_Safety_Manual.txt";
            content = 
`=========================================
LIFEBRIDGE AI - EMERGENCY SAFETY MANUAL
=========================================
DISASTER PREPARATION GUIDE & CHECKLISTS

1. CYCLONE LANDFALL SAFETY
- Stay indoors away from glass panels.
- Disconnect power supply main switch.
- Remain in an interior windowless room.
- Listen to radio alerts. Do not go out during the eye of the storm.

2. FLOOD EVACUATION PLAN
- Evacuate immediately if local sirens ring or levels rise.
- Avoid walking or driving through water currents (Turn Around, Don't Drown).
- Turn off gas lines and electrical breakers.
- Head to the highest possible elevated shelter.

3. FIRST-AID GUIDE: DEEP WOUNDS
- Apply direct pressure immediately with clean cloth.
- Elevate wound above heart.
- Bind tightly, but do not cut off circulation.
- Seek nearest rescue point immediately.

4. HEALTH CARE HELPLINE
- Emergency Contacts: 112 / 108
- Disaster Response (NDRF): 1078
`;
        } else if (fileType === 'shelters') {
            filename = "LifeBridge_Shelters_Offline.json";
            content = JSON.stringify(state.shelters, null, 2);
        } else if (fileType === 'info-card') {
            filename = "LifeBridge_Emergency_Info_Card.txt";
            
            // Build custom card based on state/checklist
            const prepPercent = prepProgressText.textContent;
            filename = "Emergency_Contact_Card.txt";
            content = 
`=========================================
EMERGENCY IDENTITY & PREP STATUS CARD
=========================================
Holder: Citizen User
Current Base: Sector 4 Coast Ward
Active Prep Kit Status: ${prepPercent} Completed

-----------------------------------------
CRITICAL RESCUE SERVICES HOTLINES:
- Medical Emergency: 112 / 108
- National Disaster Force (NDRF): 1078
- Police Control Room: 100
- Fire Brigade: 101

-----------------------------------------
NEAREST EMERGENCY SHELTERS DIRECTORY:
- NDRF Transit Camp: Sector 5, Bandra (Dist: 1.2 mi)
- BMC School Camp: Sector 1, Kurla (Dist: 2.5 mi)
- Xavier Gymkhana Hall: Sector 3, Marine Drive (Dist: 0.8 mi)
=========================================`;
        }

        // Create Blob and trigger download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

});
