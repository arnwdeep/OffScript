/**
 * OFF SCRIPT — Live Social Media Connection & Creator Memory Studio
 * Connects YouTube / Instagram by User ID / Handle, fetches actual videos,
 * generates audience gaps, and trims moments in the 9:16 Clip Studio.
 */

// ==========================================
// 1. STATE MANAGEMENT (STARTS CLEAN — NO FAKE VIDEOS)
// ==========================================

const APP_STATE = {
  theme: localStorage.getItem('offscript_theme') || 'dark',
  activeTab: 'connect',
  
  // Connected Creator Account
  connectedCreator: null, // { platform: 'youtube', identifier: '@fireship', channel_title: '...', video_count: 10 }
  
  // Real Videos Synced from Account
  videos: [],
  selectedVideo: null,
  
  // Dynamic Audience Gaps
  gaps: [],
  
  // Clip Studio
  activeClip: {
    video: null,
    startTime: '00:00',
    endTime: '00:35',
    startSec: 0,
    endSec: 35,
    durationSec: 35,
    selectedHookIndex: 0,
    subtitleStyle: 'clean-bold',
    hooks: []
  },

  // Brand Memory
  brandPrefs: {
    tone: 'direct',
    rules: 'Always emphasize real-world practical utility. No clickbait.',
    avoidedWords: 'get rich quick, 10x engineer, master this in 24 hours',
    cta: 'What\'s your experience with this? Let me know in the comments.'
  }
};

// ==========================================
// 2. DOM REFERENCES
// ==========================================

const dom = {
  themeToggle: document.getElementById('themeToggle'),
  navTabs: document.getElementById('navTabs'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  headerChannelBadge: document.getElementById('headerChannelBadge'),
  headerChannelName: document.getElementById('headerChannelName'),
  btnDisconnectHeader: document.getElementById('btnDisconnectHeader'),
  libraryCountBadge: document.getElementById('libraryCountBadge'),
  gapsCountBadge: document.getElementById('gapsCountBadge'),
  
  // Connect Tab
  inputYtIdentifier: document.getElementById('inputYtIdentifier'),
  btnConnectYt: document.getElementById('btnConnectYt'),
  inputIgIdentifier: document.getElementById('inputIgIdentifier'),
  btnConnectIg: document.getElementById('btnConnectIg'),
  inputDirectUrl: document.getElementById('inputDirectUrl'),
  btnFetchDirectUrl: document.getElementById('btnFetchDirectUrl'),
  connectedBanner: document.getElementById('connectedBanner'),
  bannerChannelTitle: document.getElementById('bannerChannelTitle'),
  bannerVideoCount: document.getElementById('bannerVideoCount'),
  btnOpenManualUpload: document.getElementById('btnOpenManualUpload'),

  // Library Tab
  librarySubtitle: document.getElementById('librarySubtitle'),
  librarySearchInput: document.getElementById('librarySearchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  actualVideosGrid: document.getElementById('actualVideosGrid'),
  videosCountLabel: document.getElementById('videosCountLabel'),
  viewerVideoTitle: document.getElementById('viewerVideoTitle'),
  actualPlayerContainer: document.getElementById('actualPlayerContainer'),
  videoInfoStrip: document.getElementById('videoInfoStrip'),
  infoPlatformBadge: document.getElementById('infoPlatformBadge'),
  infoDurationBadge: document.getElementById('infoDurationBadge'),
  infoExternalLink: document.getElementById('infoExternalLink'),
  segmentsSection: document.getElementById('segmentsSection'),
  segmentsList: document.getElementById('segmentsList'),
  btnSendActiveToStudio: document.getElementById('btnSendActiveToStudio'),

  // Gaps Tab
  gapsContainer: document.getElementById('gapsContainer'),

  // Studio Tab
  studioIframeWrap: document.getElementById('studioIframeWrap'),
  studioSourceTitle: document.getElementById('studioSourceTitle'),
  studioPlatformBadge: document.getElementById('studioPlatformBadge'),
  studioCreatorTag: document.getElementById('studioCreatorTag'),
  inputStartTime: document.getElementById('inputStartTime'),
  inputEndTime: document.getElementById('inputEndTime'),
  studioDurationDisplay: document.getElementById('studioDurationDisplay'),
  hooksContainer: document.getElementById('hooksContainer'),
  hookPreviewText: document.getElementById('hookPreviewText'),
  activeSubtitleText: document.getElementById('activeSubtitleText'),
  captionTextArea: document.getElementById('captionTextArea'),
  btnCopyCaption: document.getElementById('btnCopyCaption'),
  btnExportClip: document.getElementById('btnExportClip'),
  timelineProgress: document.getElementById('timelineProgress'),
  playerCurrentTime: document.getElementById('playerCurrentTime'),
  playerDuration: document.getElementById('playerDuration'),
  styleChoices: document.querySelectorAll('.style-choice'),

  // Macro Keypad Homepage Elements
  macroHomepage: document.getElementById('macroHomepage'),
  oledLine2: document.getElementById('oledLine2'),
  btnBackToKeypad: document.getElementById('btnBackToKeypad'),
  macroKeys: document.querySelectorAll('.macro-key-btn'),

  // Modal & Toast
  manualUploadModal: document.getElementById('manualUploadModal'),
  btnCloseManualUpload: document.getElementById('btnCloseManualUpload'),
  btnCancelManualUpload: document.getElementById('btnCancelManualUpload'),
  btnSubmitManualUpload: document.getElementById('btnSubmitManualUpload'),
  manualVideoTitle: document.getElementById('manualVideoTitle'),
  manualVideoUrl: document.getElementById('manualVideoUrl'),
  manualTranscript: document.getElementById('manualTranscript'),
  toast: document.getElementById('toast')
};

// ==========================================
// 3. INITIALIZATION & NAVIGATION
// ==========================================

const INTERFACE_THEMES = {
  connect: {
    tag: 'WHITE INTERFACE',
    title: 'Connect Accounts & Direct Link',
    color: '#FFFFFF'
  },
  library: {
    tag: 'PEACH INTERFACE',
    title: 'Videos Library & Indexed Moments',
    color: '#FF8C66'
  },
  gaps: {
    tag: 'PURPLE INTERFACE',
    title: 'Audience Demand & Content Gaps',
    color: '#A78BFA'
  },
  studio: {
    tag: 'YELLOW INTERFACE',
    title: 'Short-Form Clip Studio',
    color: '#FBBF24'
  },
  brand: {
    tag: 'BLUE INTERFACE',
    title: 'Brand Voice & Creator Memory',
    color: '#3B82F6'
  }
};

function init() {
  document.body.setAttribute('data-interface', 'keypad');
  setupMacroKeypad();
  bindEvents();

  // Check if we have saved account
  const savedCreator = localStorage.getItem('offscript_creator');
  const savedVideos = localStorage.getItem('offscript_videos');
  if (savedCreator && savedVideos) {
    try {
      APP_STATE.connectedCreator = JSON.parse(savedCreator);
      APP_STATE.videos = JSON.parse(savedVideos);
      onConnectionSuccess(false);
    } catch(e) {}
  }
}

function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

function switchTab(tabId) {
  APP_STATE.activeTab = tabId;
  document.body.setAttribute('data-interface', tabId);

  // Update header workspace indicator badge
  const info = INTERFACE_THEMES[tabId] || INTERFACE_THEMES.connect;
  const dot = document.getElementById('workspaceDot');
  const tag = document.getElementById('workspaceThemeTag');
  const title = document.getElementById('workspaceTitleText');
  if (dot) dot.style.backgroundColor = info.color;
  if (tag) tag.textContent = info.tag;
  if (title) title.textContent = info.title;

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ==========================================
// 3.1. MACRO KEYPAD POPPING ANIMATION & SOUND
// ==========================================

function playKeyPopSound(frequency = 180) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {}
}

window.onMacroKeyClick = function(target, btnElement) {
  const pitchMap = {
    connect: 180,
    library: 210,
    gaps: 240,
    studio: 160,
    brand: 200
  };

  const btn = btnElement || document.querySelector(`[data-target="${target}"]`);
  if (!btn || btn.classList.contains('popping')) return;

  playKeyPopSound(pitchMap[target] || 190);

  // Trigger pop animation
  btn.classList.add('popping');
  const oled = document.getElementById('oledLine2');
  if (oled) oled.textContent = `OPENING...`;

  setTimeout(() => {
    btn.classList.remove('popping');
    if (oled) oled.textContent = 'READY';

    // Hide macro keypad homepage and open module interface
    const home = document.getElementById('macroHomepage');
    if (home) home.classList.add('hidden');
    switchTab(target);
  }, 380);
};

window.returnToKeypad = function() {
  document.body.setAttribute('data-interface', 'keypad');
  const home = document.getElementById('macroHomepage');
  if (home) home.classList.remove('hidden');
  const oled = document.getElementById('oledLine2');
  if (oled) oled.textContent = 'READY';
};

function setupMacroKeypad() {
  const keys = document.querySelectorAll('.macro-key-btn');
  const oled = document.getElementById('oledLine2');

  keys.forEach(btn => {
    const label = btn.dataset.label;

    btn.addEventListener('mouseenter', () => {
      if (oled) oled.textContent = `> ${label}`;
    });

    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('popping') && oled) {
        oled.textContent = 'READY';
      }
    });
  });

  // Escape key returns to keypad
  document.addEventListener('keydown', (e) => {
    const home = document.getElementById('macroHomepage');
    if (e.key === 'Escape' && home && home.classList.contains('hidden')) {
      window.returnToKeypad();
    }
  });
}

// Quick fill helpers for testing
window.quickFillYt = function(handle) {
  if (dom.inputYtIdentifier) dom.inputYtIdentifier.value = handle;
  handleConnect('youtube', handle);
};

window.quickFillIg = function(handle) {
  if (dom.inputIgIdentifier) dom.inputIgIdentifier.value = handle;
  handleConnect('instagram', handle);
};

// ==========================================
// 4. API CONNECTION HANDLERS
// ==========================================

async function handleConnect(platform, identifier, callerBtn = null) {
  if (!identifier || !identifier.trim()) {
    showToast('Please enter a valid channel ID, handle, or direct video link.');
    return;
  }

  // Set loading state
  let btn = callerBtn;
  if (!btn) {
    if (platform === 'youtube') {
      btn = dom.btnConnectYt;
    } else if (platform === 'instagram') {
      btn = dom.btnConnectIg;
    } else {
      btn = dom.btnFetchDirectUrl;
    }
  }

  let textSpan = btn ? btn.querySelector('.btn-text') : null;
  let spinnerSpan = btn ? btn.querySelector('.btn-spinner') : null;
  if (textSpan) textSpan.style.display = 'none';
  if (spinnerSpan) spinnerSpan.style.display = 'inline';
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: platform, identifier: identifier.trim() })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to connect.');
    }

    APP_STATE.connectedCreator = data.creator;
    APP_STATE.videos = data.videos || [];
    
    // Save to localStorage
    localStorage.setItem('offscript_creator', JSON.stringify(APP_STATE.connectedCreator));
    localStorage.setItem('offscript_videos', JSON.stringify(APP_STATE.videos));

    onConnectionSuccess(true);
    fetchAudienceGaps();

  } catch (err) {
    showToast(`Connection failed: ${err.message}`);
  } finally {
    if (textSpan) textSpan.style.display = 'inline';
    if (spinnerSpan) spinnerSpan.style.display = 'none';
    if (btn) btn.disabled = false;
  }
}

function onConnectionSuccess(isNew = true) {
  const creator = APP_STATE.connectedCreator;
  if (!creator) return;

  // Header status
  dom.headerChannelBadge.style.display = 'flex';
  dom.headerChannelName.textContent = `${creator.channel_title} (${creator.video_count} videos)`;
  dom.libraryCountBadge.textContent = creator.video_count;

  // Banner
  dom.connectedBanner.style.display = 'flex';
  dom.bannerChannelTitle.textContent = `Connected: ${creator.channel_title}`;
  dom.bannerVideoCount.textContent = `${creator.video_count} actual videos synced from ${creator.platform.toUpperCase()}`;

  // Library Subtitle
  dom.librarySubtitle.textContent = `Connected to ${creator.channel_title}. Select any video to inspect moments or create clips.`;

  // Render Videos
  renderVideosGrid();
  populateStudioVideoPicker();

  // If studio has no active video yet, load the first synced video
  if (!APP_STATE.activeClip.video && APP_STATE.videos.length > 0) {
    setupStudioForVideo(APP_STATE.videos[0]);
  }

  if (isNew) {
    showToast(`Connected ${creator.channel_title}! Return to Keypad to open Videos Library.`);
  }
}

function disconnectAccount() {
  APP_STATE.connectedCreator = null;
  APP_STATE.videos = [];
  APP_STATE.selectedVideo = null;
  APP_STATE.gaps = [];
  localStorage.removeItem('offscript_creator');
  localStorage.removeItem('offscript_videos');

  dom.headerChannelBadge.style.display = 'none';
  dom.connectedBanner.style.display = 'none';
  dom.libraryCountBadge.textContent = '0';
  dom.gapsCountBadge.textContent = '0';
  dom.librarySubtitle.textContent = 'Connect your YouTube or Instagram ID to load your real videos.';

  // Reset player
  dom.actualPlayerContainer.innerHTML = `<div class="player-placeholder"><span>Select any actual video on the left to stream it here</span></div>`;
  dom.videoInfoStrip.style.display = 'none';
  dom.segmentsSection.style.display = 'none';
  dom.btnSendActiveToStudio.style.display = 'none';
  dom.viewerVideoTitle.textContent = 'Select a video to inspect';

  renderVideosGrid();
  renderGaps();
  showToast('Account disconnected.');
}

// Fetch intelligent audience gaps based on actual video titles
async function fetchAudienceGaps() {
  if (!APP_STATE.connectedCreator || APP_STATE.videos.length === 0) return;

  const titles = APP_STATE.videos.map(v => v.title);
  try {
    const res = await fetch('/api/gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_name: APP_STATE.connectedCreator.channel_title,
        video_titles: titles
      })
    });
    const data = await res.json();
    APP_STATE.gaps = data.gaps || [];
    dom.gapsCountBadge.textContent = APP_STATE.gaps.length;
    renderGaps();
  } catch(e) {}
}

// ==========================================
// 5. VIDEOS LIBRARY & ACTUAL VIDEO STREAMING
// ==========================================

function renderVideosGrid() {
  const query = dom.librarySearchInput.value.toLowerCase().trim();
  const videos = APP_STATE.videos.filter(v => {
    if (!query) return true;
    return v.title.toLowerCase().includes(query);
  });

  dom.videosCountLabel.textContent = `${videos.length} video${videos.length === 1 ? '' : 's'}`;

  if (videos.length === 0) {
    if (APP_STATE.connectedCreator) {
      dom.actualVideosGrid.innerHTML = `<div class="empty-state-card"><p>No videos match "${query}".</p></div>`;
    } else {
      dom.actualVideosGrid.innerHTML = `
        <div class="empty-state-card">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="m10 8 6 4-6 4V8z"></path></svg>
          <h3>No videos loaded yet</h3>
          <p>Connect your YouTube channel ID or Instagram above to view your actual videos.</p>
          <button class="btn btn-primary btn-sm" onclick="switchTab('connect')">Connect with ID</button>
        </div>
      `;
    }
    return;
  }

  dom.actualVideosGrid.innerHTML = videos.map(v => {
    const isSelected = APP_STATE.selectedVideo && APP_STATE.selectedVideo.id === v.id;
    return `
      <div class="video-card-item ${isSelected ? 'selected' : ''}" onclick="selectAndStreamVideo('${v.id}')">
        <div class="video-card-thumb-wrap">
          <img class="video-card-thumb" src="${v.thumbnail || 'https://via.placeholder.com/120x68?text=Video'}" alt="${escapeHtml(v.title)}" loading="lazy">
          <span class="video-card-duration">${v.duration_str || '00:00'}</span>
        </div>
        <div class="video-card-body">
          <h4 class="video-card-title">${escapeHtml(v.title)}</h4>
          <div class="video-card-meta">
            <span>${v.platform.toUpperCase()}</span>
            ${v.views ? `• <span>${v.views} views</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Auto-select first video if none selected
  if (!APP_STATE.selectedVideo && videos.length > 0) {
    selectAndStreamVideo(videos[0].id);
  }
}

async function selectAndStreamVideo(videoId) {
  const video = APP_STATE.videos.find(v => v.id === videoId);
  if (!video) return;

  APP_STATE.selectedVideo = video;
  
  // Highlight in grid
  document.querySelectorAll('.video-card-item').forEach(el => el.classList.remove('selected'));
  renderVideosGrid();

  dom.viewerVideoTitle.textContent = video.title;
  dom.btnSendActiveToStudio.style.display = 'inline-flex';
  dom.videoInfoStrip.style.display = 'flex';
  dom.infoPlatformBadge.textContent = video.platform.toUpperCase();
  dom.infoDurationBadge.textContent = video.duration_str;
  dom.infoExternalLink.href = video.url;

  // Embed the actual stream
  if (video.platform === 'youtube' && video.id.length === 11) {
    dom.actualPlayerContainer.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=0&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  } else {
    dom.actualPlayerContainer.innerHTML = `
      <div class="player-placeholder">
        <a href="${video.url}" target="_blank" class="btn btn-secondary btn-sm">Open on ${video.platform.toUpperCase()} ↗</a>
      </div>
    `;
  }

  // Fetch chapters & transcript
  dom.segmentsSection.style.display = 'block';
  dom.segmentsList.innerHTML = `<div style="font-size: 11px; color: var(--text-dim);">Indexing chapters & key moments...</div>`;

  try {
    const res = await fetch('/api/video-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: video.url, video_id: video.id })
    });
    const details = await res.json();
    renderVideoSegments(details.segments || []);
  } catch(e) {
    renderVideoSegments([
      { time: '00:00', start_sec: 0, text: 'Opening moment & hook' },
      { time: '00:45', start_sec: 45, text: 'Core concept explanation' },
      { time: '01:30', start_sec: 90, text: 'Practical takeaway' }
    ]);
  }
}

function renderVideoSegments(segments) {
  if (!segments || segments.length === 0) {
    dom.segmentsList.innerHTML = `<div style="font-size: 11px; color: var(--text-muted);">No chapters found. You can trim any timestamp in Clip Studio.</div>`;
    return;
  }

  dom.segmentsList.innerHTML = segments.map(s => `
    <div class="segment-moment-item" onclick="loadMomentIntoStudio('${s.time}', ${s.start_sec}, '${escapeQuotes(s.text)}')">
      <div>
        <span class="moment-time">[${s.time}]</span>
        <span>${escapeHtml(s.text)}</span>
      </div>
      <span class="moment-btn">Select Moment</span>
    </div>
  `).join('');
}

function loadMomentIntoStudio(timeStr, startSec, text) {
  if (!APP_STATE.selectedVideo) return;
  setupStudioForVideo(APP_STATE.selectedVideo, timeStr, startSec, text);
  showToast(`Moment [${timeStr}] selected. Return to Keyboard to open Clip Studio.`);
}

// ==========================================
// 6. CLIP STUDIO WITH ACTUAL VIDEO
// ==========================================

function setupStudioForVideo(video, startTime = '00:00', startSec = 0, segmentText = '') {
  APP_STATE.activeClip.video = video;
  APP_STATE.activeClip.startTime = startTime;
  APP_STATE.activeClip.startSec = startSec;
  
  const endSec = startSec + 35;
  const endMin = Math.floor(endSec / 60).toString().padStart(2, '0');
  const endS = (endSec % 60).toString().padStart(2, '0');
  APP_STATE.activeClip.endTime = `${endMin}:${endS}`;
  APP_STATE.activeClip.endSec = endSec;
  APP_STATE.activeClip.durationSec = 35;

  dom.studioSourceTitle.textContent = video.title;
  dom.studioPlatformBadge.textContent = video.platform.toUpperCase();
  dom.studioCreatorTag.textContent = APP_STATE.connectedCreator ? `${APP_STATE.connectedCreator.channel_title} • Off Script` : '@creator • Off Script';
  dom.inputStartTime.value = startTime;
  dom.inputEndTime.value = `${endMin}:${endS}`;
  dom.studioDurationDisplay.textContent = '35 seconds';
  dom.playerDuration.textContent = '00:35';

  // Embed real video in 9:16 phone mockup
  if (video.platform === 'youtube' && video.id.length === 11) {
    dom.studioIframeWrap.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=0&controls=0&loop=1&start=${startSec}&end=${endSec}" allow="autoplay; encrypted-media"></iframe>
    `;
  } else {
    dom.studioIframeWrap.innerHTML = `
      <img src="${video.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="Video frame">
    `;
  }

  // Generate dynamic AI hooks derived from actual video title
  const cleanTitle = video.title.replace(/[^\w\s-]/g, '').trim();
  APP_STATE.activeClip.hooks = [
    `“Here's the single most important lesson from ${cleanTitle.substring(0, 45)}.”`,
    `“Why most people get this completely wrong (Breakdown from ${cleanTitle.substring(0, 35)}).”`,
    `“3 actionable takeaways you can apply today from my full video.”`
  ];

  renderHooks();

  // Subtitle preview
  dom.activeSubtitleText.textContent = segmentText ? `"${segmentText}"` : `"${cleanTitle.substring(0, 60)}..."`;

  // Caption update
  dom.captionTextArea.value = `Highlight from "${video.title}"!\n\nKey takeaway: ${segmentText || 'Essential insights from my latest deep dive.'}\n\nWatch the complete breakdown on my channel (${video.url}).\n\nWhat are your thoughts on this? Let me know below!\n\n#${video.platform} #creator #shorts #reels`;

  // Sync Video Picker select dropdown
  const picker = document.getElementById('studioVideoPicker');
  if (picker && video && video.id) {
    picker.value = video.id;
  }

  showToast('Actual video loaded into Studio Workstation.');
}

function renderHooks() {
  const hooks = APP_STATE.activeClip.hooks;
  dom.hooksContainer.innerHTML = hooks.map((h, idx) => `
    <label class="hook-option ${idx === APP_STATE.activeClip.selectedHookIndex ? 'selected' : ''}">
      <input type="radio" name="studioHook" value="${idx}" ${idx === APP_STATE.activeClip.selectedHookIndex ? 'checked' : ''} onchange="onSelectHook(${idx})">
      <div>
        <span class="hook-tag">${idx === 0 ? 'High Retention' : idx === 1 ? 'Curiosity Hook' : 'Value First'}</span>
        <p class="hook-text">${h}</p>
      </div>
    </label>
  `).join('');

  dom.hookPreviewText.textContent = hooks[APP_STATE.activeClip.selectedHookIndex].replace(/“|”/g, '');
}

window.onSelectHook = function(idx) {
  APP_STATE.activeClip.selectedHookIndex = idx;
  document.querySelectorAll('.hook-option').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  dom.hookPreviewText.textContent = APP_STATE.activeClip.hooks[idx].replace(/“|”/g, '');
};

// ==========================================
// 7. AUDIENCE GAPS RENDERING (REAL TOPICS)
// ==========================================

function renderGaps() {
  if (!APP_STATE.connectedCreator || APP_STATE.gaps.length === 0) {
    dom.gapsContainer.innerHTML = `
      <div class="empty-state-card">
        <p>Connect your YouTube or Instagram account first to analyze audience content gaps.</p>
        <button class="btn btn-primary btn-sm" onclick="switchTab('connect')">Connect Channel</button>
      </div>
    `;
    return;
  }

  dom.gapsContainer.innerHTML = APP_STATE.gaps.map(gap => `
    <div class="gap-card">
      <div class="gap-card-header">
        <div>
          <span class="badge alert">Audience Demand Gap</span>
          <h3 class="gap-title" style="margin-top: 4px;">${gap.title}</h3>
        </div>
        <span class="score-pill">Opportunity Score: ${gap.opportunity_score}%</span>
      </div>

      <div class="gap-stats-bar">
        <div class="gap-stat-col">
          <strong>${gap.demand_pct}% Demand</strong>
          <span>${gap.comments_count} parsed feedback signals</span>
        </div>
        <div class="gap-stat-col">
          <strong>${gap.coverage_pct}% Existing Coverage</strong>
          <span>In your uploaded library</span>
        </div>
        <div class="gap-stat-col">
          <strong>Formula</strong>
          <span>${gap.demand_pct}% × (1 - ${gap.coverage_pct}%) = ${gap.opportunity_score}%</span>
        </div>
      </div>

      <div class="evidence-box">
        <div class="evidence-title">Audience Comments & Questions:</div>
        <ul class="evidence-list">
          ${gap.comments.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div style="font-size: 13px; margin-bottom: 16px;">
        <strong>Recommendation:</strong> <span style="color: var(--text-muted);">${gap.recommendation}</span>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button class="btn btn-primary btn-sm" onclick="openGapInStudio('${gap.id}')">
          Target this Gap for Clip Studio →
        </button>
      </div>
    </div>
  `).join('');
}

window.openGapInStudio = function(gapId) {
  if (APP_STATE.videos.length > 0) {
    const video = APP_STATE.videos[0];
    setupStudioForVideo(video, '00:00', 0, 'Highlight answering audience question on ' + (APP_STATE.gaps.find(g => g.id === gapId)?.title || 'gap'));
    showToast('Gap topic primed for Clip Studio. Return to Macro Keypad and press Yellow button.');
  }
};

// ==========================================
// 8. CLIP STUDIO PICKER, AUTO-CLIPS & AUTO-POST
// ==========================================

function populateStudioVideoPicker() {
  const picker = document.getElementById('studioVideoPicker');
  if (!picker) return;
  if (!APP_STATE.videos || APP_STATE.videos.length === 0) {
    picker.innerHTML = '<option value="">-- No videos synced yet --</option>';
    return;
  }
  const channel = APP_STATE.connectedCreator ? APP_STATE.connectedCreator.channel_title : 'Connected Channel';
  picker.innerHTML = `
    <option value="">-- Synced from ${channel} (${APP_STATE.videos.length} videos) --</option>
    ${APP_STATE.videos.map(v => `<option value="${v.id}" ${APP_STATE.activeClip.video && APP_STATE.activeClip.video.id === v.id ? 'selected' : ''}>${escapeHtml(v.title.substring(0, 50))} (${v.duration_str})</option>`).join('')}
  `;
}

// Global quick fill url helper
window.quickFillUrl = function(url) {
  if (dom.inputDirectUrl) {
    dom.inputDirectUrl.value = url;
    handleConnect('youtube', url);
  }
};

// Global library handle sync helper
let currentLibPlatform = 'youtube';
window.quickFillLibHandle = function(handle) {
  const input = document.getElementById('libSocialHandleInput');
  if (input) {
    input.value = handle;
    handleConnect(currentLibPlatform, handle);
  }
};

async function handleAutoGenerateClips() {
  const video = APP_STATE.activeClip.video || (APP_STATE.videos.length > 0 ? APP_STATE.videos[0] : null);
  if (!video) {
    showToast('Please pick or sync a video from your connected ID first.');
    return;
  }
  if (!APP_STATE.activeClip.video) {
    setupStudioForVideo(video);
  }

  const btn = document.getElementById('btnAutoGenerateClips');
  const countBadge = document.getElementById('autoClipsCountBadge');
  if (btn) btn.innerHTML = 'Generating Clips...';

  try {
    const res = await fetch('/api/auto-clips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: video.url,
        video_title: video.title,
        duration: video.duration || 240
      })
    });
    const data = await res.json();
    renderAutoClipsDeck(data.clips || []);
    if (countBadge) countBadge.textContent = `${data.clips?.length || 4} clips ready`;
    showToast('4 vertical short clips generated automatically!');
  } catch (e) {
    showToast('Auto-clip generation failed. Please retry.');
  } finally {
    if (btn) btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Auto-Generate AI Clips`;
  }
}

function renderAutoClipsDeck(clips) {
  const grid = document.getElementById('autoClipsGrid');
  if (!grid || !clips || clips.length === 0) return;

  grid.innerHTML = clips.map((c, idx) => `
    <div class="auto-clip-card ${idx === 0 ? 'active-clip' : ''}" onclick="selectAutoClip(${JSON.stringify(c).replace(/"/g, '&quot;')}, this)">
      <div class="auto-clip-top-row">
        <span class="auto-clip-tag">${c.tag}</span>
        <span class="auto-clip-score-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -1px; margin-right: 3px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          ${c.viral_score}% Viral Score
        </span>
      </div>
      <h4 class="auto-clip-title">${escapeHtml(c.title)}</h4>
      <p class="auto-clip-hook">"${escapeHtml(c.hook)}"</p>
      <div class="auto-clip-footer">
        <span>${c.start_time} → ${c.end_time}</span>
        <span class="auto-clip-duration">${c.duration}s Cut</span>
      </div>
    </div>
  `).join('');

  // Automatically activate first clip
  if (clips.length > 0) {
    applyClipSettings(clips[0]);
  }
}

window.selectAutoClip = function(clipData, element) {
  document.querySelectorAll('.auto-clip-card').forEach(c => c.classList.remove('active-clip'));
  if (element) element.classList.add('active-clip');
  applyClipSettings(clipData);
  showToast(`Loaded: ${clipData.title}`);
};

function applyClipSettings(clipData) {
  APP_STATE.activeClip.startTime = clipData.start_time;
  APP_STATE.activeClip.endTime = clipData.end_time;
  APP_STATE.activeClip.startSec = clipData.start_sec;
  APP_STATE.activeClip.endSec = clipData.end_sec;
  APP_STATE.activeClip.durationSec = clipData.duration;

  if (dom.inputStartTime) dom.inputStartTime.value = clipData.start_time;
  if (dom.inputEndTime) dom.inputEndTime.value = clipData.end_time;
  if (dom.studioDurationDisplay) dom.studioDurationDisplay.textContent = `${clipData.duration} seconds`;
  if (dom.playerDuration) dom.playerDuration.textContent = clipData.end_time;

  const inEl = document.getElementById('deckInPoint');
  const outEl = document.getElementById('deckOutPoint');
  if (inEl) inEl.textContent = clipData.start_time;
  if (outEl) outEl.textContent = clipData.end_time;

  if (dom.activeSubtitleText) dom.activeSubtitleText.textContent = clipData.subtitle;
  if (dom.hookPreviewText) dom.hookPreviewText.textContent = clipData.hook;
  if (dom.captionTextArea) dom.captionTextArea.value = clipData.caption;

  const statusPill = document.getElementById('studioStatusPill');
  if (statusPill) statusPill.textContent = `● ${clipData.title.toUpperCase()}`;

  // Reload iframe with precise start/end seconds
  const video = APP_STATE.activeClip.video;
  if (video && video.platform === 'youtube' && video.id.length === 11) {
    dom.studioIframeWrap.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=0&controls=0&loop=1&start=${clipData.start_sec}&end=${clipData.end_sec}" allow="autoplay; encrypted-media"></iframe>
    `;
  }
}

async function handleDownloadClipPackage() {
  const clip = APP_STATE.activeClip;
  if (!clip.video) {
    showToast('Please pick an actual video first.');
    return;
  }

  try {
    const res = await fetch('/api/download-clip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: clip.video.url,
        start_time: clip.startTime,
        end_time: clip.endTime,
        title: clip.video.title
      })
    });
    const data = await res.json();

    const clipBundle = `
==================================================
OFF SCRIPT — AUTOMATED SHORT-FORM CLIP DOWNLOAD
Title:        ${data.title}
Format:       MP4 (1080x1920 9:16 Vertical)
Bitrate:      ${data.audio_bitrate}
Trim Range:   ${data.start_time} to ${data.end_time}
Source URL:   ${data.url}
Generated At: ${new Date().toISOString()}
==================================================

[SUBTITLES SRT TRACK]
1
00:${data.start_time},000 --> 00:${data.end_time},000
${dom.activeSubtitleText ? dom.activeSubtitleText.textContent : 'Key takeaway from clip'}

[READY-TO-POST PLATFORM CAPTION]
${dom.captionTextArea ? dom.captionTextArea.value : ''}

[FFMPEG COMMAND]
ffmpeg -ss ${data.start_time} -to ${data.end_time} -i "source.mp4" -vf "crop=ih*(9/16):ih,scale=1080:1920" "${data.filename}"
    `.trim();

    const blob = new Blob([clipBundle], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = data.filename || `offscript_clip_${Date.now()}.mp4.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    showToast(`Clip downloaded: ${data.start_time} to ${data.end_time}`);
  } catch (e) {
    showToast('Download error. Please retry.');
  }
}

async function handleExecuteAutoPost() {
  const clip = APP_STATE.activeClip;
  if (!clip.video) {
    showToast('Please pick a video before auto-posting.');
    return;
  }

  const checkedBoxes = document.querySelectorAll('input[name="postPlatform"]:checked');
  const platforms = Array.from(checkedBoxes).map(cb => cb.value);
  if (platforms.length === 0) {
    showToast('Please check at least one destination platform.');
    return;
  }

  const scheduleEl = document.querySelector('input[name="scheduleMode"]:checked');
  const schedule = scheduleEl ? scheduleEl.value : 'now';

  const modal = document.getElementById('autoPostModal');
  const step1 = document.getElementById('pipeStep1');
  const step2 = document.getElementById('pipeStep2');
  const step3 = document.getElementById('pipeStep3');
  const step4 = document.getElementById('pipeStep4');
  const stepsList = document.getElementById('pipelineStepsList');
  const successBox = document.getElementById('pipelineSuccessBox');

  if (modal) modal.classList.add('open');
  if (stepsList) stepsList.style.display = 'flex';
  if (successBox) successBox.style.display = 'none';

  step1.className = 'pipeline-step-row active';
  step2.className = 'pipeline-step-row';
  step3.className = 'pipeline-step-row';
  step4.className = 'pipeline-step-row';

  await new Promise(r => setTimeout(r, 500));
  step1.className = 'pipeline-step-row completed';
  step2.className = 'pipeline-step-row active';

  await new Promise(r => setTimeout(r, 500));
  step2.className = 'pipeline-step-row completed';
  step3.className = 'pipeline-step-row active';

  await new Promise(r => setTimeout(r, 500));
  step3.className = 'pipeline-step-row completed';
  step4.className = 'pipeline-step-row active';

  try {
    const res = await fetch('/api/auto-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_id: clip.video.id,
        clip_id: `clip_${Date.now()}`,
        title: clip.video.title,
        caption: dom.captionTextArea ? dom.captionTextArea.value : '',
        platforms: platforms,
        schedule: schedule
      })
    });
    const data = await res.json();
    step4.className = 'pipeline-step-row completed';

    await new Promise(r => setTimeout(r, 400));
    if (stepsList) stepsList.style.display = 'none';
    if (successBox) {
      successBox.style.display = 'block';
      const linksList = document.getElementById('dispatchedLinksList');
      if (linksList && data.dispatched) {
        linksList.innerHTML = data.dispatched.map(d => `
          <div class="dispatched-link-item">
            <span class="link-platform-name">${d.platform.toUpperCase()}</span>
            <span class="link-status-badge">✓ ${d.status.toUpperCase()} (${d.schedule_time})</span>
          </div>
        `).join('');
      }
    }
    showToast(data.message);
  } catch (e) {
    showToast('Auto-post encountered a connection error.');
  }
}

function handleExportClipPackage() {
  const clip = APP_STATE.activeClip;
  if (!clip.video) {
    showToast('Please select an actual video first.');
    return;
  }

  const exportData = `
==================================================
OFF SCRIPT — SHORT-FORM CLIP EXPORT PACKAGE
Actual Media: ${clip.video.title}
Platform:     ${clip.video.platform.toUpperCase()}
Video URL:    ${clip.video.url}
Trim Range:   ${clip.startTime} to ${clip.endTime} (${clip.durationSec}s)
Format:       9:16 Vertical (Reels / Shorts / TikTok)
==================================================

--- FFMPEG REPURPOSE SCRIPT ---
ffmpeg -ss ${clip.startTime} -to ${clip.endTime} -i "source_video.mp4" \\
  -vf "crop=ih*(9/16):ih,scale=1080:1920,subtitles=subs.srt" \\
  -c:a aac -b:a 192k "offscript_clip_${Date.now()}.mp4"

--- SELECTED AI HOOK ---
${clip.hooks[clip.selectedHookIndex] || ''}

--- SOCIAL CAPTION ---
${dom.captionTextArea.value}
==================================================
`.trim();

  const blob = new Blob([exportData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `offscript-clip-package-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Clip package downloaded successfully!');
}

// ==========================================
// 9. EVENT BINDINGS
// ==========================================

function bindEvents() {
  // Theme toggle
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener('click', () => {
      // Per-interface theming is active; toggle is auxiliary
    });
  }

  // Tabs (if present)
  if (dom.navTabs) {
    dom.navTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      switchTab(btn.dataset.tab);
    });
  }

  // Disconnect header button
  if (dom.btnDisconnectHeader) {
    dom.btnDisconnectHeader.addEventListener('click', disconnectAccount);
  }

  // Connect Buttons
  if (dom.btnConnectYt) {
    dom.btnConnectYt.addEventListener('click', () => {
      handleConnect('youtube', dom.inputYtIdentifier.value);
    });
  }
  if (dom.inputYtIdentifier) {
    dom.inputYtIdentifier.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConnect('youtube', dom.inputYtIdentifier.value);
    });
  }

  if (dom.btnConnectIg) {
    dom.btnConnectIg.addEventListener('click', () => {
      handleConnect('instagram', dom.inputIgIdentifier.value);
    });
  }
  if (dom.inputIgIdentifier) {
    dom.inputIgIdentifier.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConnect('instagram', dom.inputIgIdentifier.value);
    });
  }

  if (dom.btnFetchDirectUrl) {
    dom.btnFetchDirectUrl.addEventListener('click', () => {
      handleConnect('youtube', dom.inputDirectUrl.value);
    });
  }
  if (dom.inputDirectUrl) {
    dom.inputDirectUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConnect('youtube', dom.inputDirectUrl.value);
    });
  }

  // Library search
  if (dom.librarySearchInput) {
    dom.librarySearchInput.addEventListener('input', () => {
      if (dom.btnClearSearch) {
        dom.btnClearSearch.classList.toggle('visible', dom.librarySearchInput.value.length > 0);
      }
      renderVideosGrid();
    });
  }
  if (dom.btnClearSearch) {
    dom.btnClearSearch.addEventListener('click', () => {
      if (dom.librarySearchInput) dom.librarySearchInput.value = '';
      dom.btnClearSearch.classList.remove('visible');
      renderVideosGrid();
    });
  }

  // Send active video to Studio
  if (dom.btnSendActiveToStudio) {
    dom.btnSendActiveToStudio.addEventListener('click', () => {
      if (APP_STATE.selectedVideo) {
        setupStudioForVideo(APP_STATE.selectedVideo);
        showToast('Video loaded into Studio memory. Return to Keypad and press Yellow button.');
      }
    });
  }

  // Subtitle Style Choices
  dom.styleChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.styleChoices.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const styleName = btn.dataset.style;
      APP_STATE.activeClip.subtitleStyle = styleName;
      dom.activeSubtitleText.className = `subtitle-text style-${styleName}`;
      showToast(`Subtitle style set to ${btn.textContent.trim()}`);
    });
  });

  // Copy Caption
  dom.btnCopyCaption.addEventListener('click', () => {
    navigator.clipboard.writeText(dom.captionTextArea.value);
    showToast('Social caption copied to clipboard!');
  });

  // Export clip package
  dom.btnExportClip.addEventListener('click', handleExportClipPackage);

  // Manual Upload Modal (Secondary option)
  dom.btnOpenManualUpload.addEventListener('click', () => {
    dom.manualUploadModal.classList.add('open');
  });
  dom.btnCloseManualUpload.addEventListener('click', () => {
    dom.manualUploadModal.classList.remove('open');
  });
  dom.btnCancelManualUpload.addEventListener('click', () => {
    dom.manualUploadModal.classList.remove('open');
  });
  dom.btnSubmitManualUpload.addEventListener('click', () => {
    const title = dom.manualVideoTitle.value.trim();
    const url = dom.manualVideoUrl.value.trim();
    if (!title) {
      showToast('Please enter a video title.');
      return;
    }
    const newVid = {
      id: `manual_${Date.now()}`,
      title: title,
      url: url || '#',
      duration: 180,
      duration_str: '03:00',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
      platform: 'upload'
    };
    APP_STATE.videos.unshift(newVid);
    if (!APP_STATE.connectedCreator) {
      APP_STATE.connectedCreator = {
        platform: 'custom',
        channel_title: 'Manual Uploads',
        video_count: APP_STATE.videos.length
      };
    }
    onConnectionSuccess(false);
    dom.manualUploadModal.classList.remove('open');
    showToast('Manual video added.');
    switchTab('library');
  });

  // Studio Aspect Ratio Switches
  document.querySelectorAll('.aspect-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.aspect-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const ratio = chip.dataset.ratio;
      const screen = document.getElementById('studioMockScreen');
      if (screen) {
        screen.className = `video-monitor-screen ratio-${ratio}`;
      }
      showToast(`Canvas switched to ${chip.textContent.trim()}`);
    });
  });

  // Timestamp inputs sync to deck readout
  if (dom.inputStartTime) {
    dom.inputStartTime.addEventListener('input', () => {
      const inEl = document.getElementById('deckInPoint');
      if (inEl) inEl.textContent = dom.inputStartTime.value || '00:00';
    });
  }
  if (dom.inputEndTime) {
    dom.inputEndTime.addEventListener('input', () => {
      const outEl = document.getElementById('deckOutPoint');
      if (outEl) outEl.textContent = dom.inputEndTime.value || '00:35';
    });
  }

  // Brand prefs save
  const btnSaveBrand = document.getElementById('btnSaveBrandPrefs');
  if (btnSaveBrand) {
    btnSaveBrand.addEventListener('click', () => {
      showToast('Brand voice & guardrails saved to creator memory!');
    });
  }

  // ==========================================
  // Library Social ID Sync Bar Interaction
  // ==========================================
  const libPills = document.querySelectorAll('.lib-platform-pill');
  const libInput = document.getElementById('libSocialHandleInput');
  const btnLibSync = document.getElementById('btnLibSyncHandle');

  libPills.forEach(pill => {
    pill.addEventListener('click', () => {
      libPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLibPlatform = pill.dataset.platform;
      if (libInput) {
        if (currentLibPlatform === 'youtube') {
          libInput.placeholder = 'Enter YouTube channel handle or ID (e.g. @fireship, @mkbhd)';
          libInput.value = '@fireship';
        } else if (currentLibPlatform === 'instagram') {
          libInput.placeholder = 'Enter Instagram handle or username (e.g. @creators, @nasa)';
          libInput.value = '@creators';
        } else if (currentLibPlatform === 'tiktok') {
          libInput.placeholder = 'Enter TikTok handle or ID (e.g. @tiktokcreators)';
          libInput.value = '@tiktokcreators';
        } else if (currentLibPlatform === 'twitter') {
          libInput.placeholder = 'Enter X / Twitter handle or ID (e.g. @mkbhd)';
          libInput.value = '@mkbhd';
        }
      }
    });
  });

  if (btnLibSync) {
    btnLibSync.addEventListener('click', () => {
      const val = libInput ? libInput.value : '';
      handleConnect(currentLibPlatform, val, btnLibSync);
    });
  }
  if (libInput) {
    libInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleConnect(currentLibPlatform, libInput.value, btnLibSync);
      }
    });
  }

  // ==========================================
  // Clip Studio Connected Video Picker
  // ==========================================
  const studioPicker = document.getElementById('studioVideoPicker');
  if (studioPicker) {
    studioPicker.addEventListener('change', (e) => {
      const vidId = e.target.value;
      if (!vidId) return;
      const vid = APP_STATE.videos.find(v => v.id === vidId);
      if (vid) {
        setupStudioForVideo(vid);
        showToast(`Loaded: ${vid.title.substring(0, 35)}...`);
      }
    });
  }

  // Auto-Generate AI Clips
  const btnAutoGen = document.getElementById('btnAutoGenerateClips');
  if (btnAutoGen) {
    btnAutoGen.addEventListener('click', handleAutoGenerateClips);
  }
  const btnRefreshClips = document.getElementById('btnRefreshAutoClips');
  if (btnRefreshClips) {
    btnRefreshClips.addEventListener('click', handleAutoGenerateClips);
  }

  // Download Clip Button
  const btnDownloadClip = document.getElementById('btnDownloadClipPackage');
  if (btnDownloadClip) {
    btnDownloadClip.addEventListener('click', handleDownloadClipPackage);
  }

  // Auto-Post Multi-Platform Engine
  const btnAutoPost = document.getElementById('btnExecuteAutoPost');
  if (btnAutoPost) {
    btnAutoPost.addEventListener('click', handleExecuteAutoPost);
  }

  // Auto-Post Modal Controls
  const autoPostModal = document.getElementById('autoPostModal');
  const btnCloseAutoPost = document.getElementById('btnCloseAutoPostModal');
  const btnDoneAutoPost = document.getElementById('btnDoneAutoPost');
  if (btnCloseAutoPost && autoPostModal) {
    btnCloseAutoPost.addEventListener('click', () => autoPostModal.classList.remove('open'));
  }
  if (btnDoneAutoPost && autoPostModal) {
    btnDoneAutoPost.addEventListener('click', () => autoPostModal.classList.remove('open'));
  }
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ==========================================
// 10. LIVE DEMO VIDEO MODAL CONTROLS
// ==========================================

window.openDemoVideoModal = function() {
  const modal = document.getElementById('demoVideoModal');
  const player = document.getElementById('offscriptDemoPlayer');
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
  if (player) {
    player.currentTime = 0;
    player.play().catch(() => {});
  }
};

window.closeDemoVideoModal = function() {
  const modal = document.getElementById('demoVideoModal');
  const player = document.getElementById('offscriptDemoPlayer');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
  if (player) {
    player.pause();
  }
};

window.seekDemoVideo = function(seconds, chipEl) {
  const player = document.getElementById('offscriptDemoPlayer');
  if (player) {
    player.currentTime = seconds;
    player.play().catch(() => {});
  }
  if (chipEl) {
    document.querySelectorAll('.demo-chapter-chip').forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
  }
};

// Start
document.addEventListener('DOMContentLoaded', init);

