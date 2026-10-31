/**
 * OFF SCRIPT — Live Social Media Connection & Creator Memory Studio
 * Connects YouTube / Instagram by User ID / Handle, fetches actual videos,
 * generates audience gaps, and trims moments in the 9:16 Clip Studio.
 */

// ==========================================
// 1. STATE MANAGEMENT (STARTS CLEAN — NO FAKE VIDEOS)
// ==========================================

const APP_STATE = {
  theme: localStorage.getItem('offscript_theme') || 'light',
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

function init() {
  applyTheme(APP_STATE.theme);
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

function applyTheme(theme) {
  APP_STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('offscript_theme', theme);
}

function toggleTheme() {
  applyTheme(APP_STATE.theme === 'dark' ? 'light' : 'dark');
}

function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

function switchTab(tabId) {
  APP_STATE.activeTab = tabId;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Quick fill helper for testing
window.quickFillYt = function(handle) {
  dom.inputYtIdentifier.value = handle;
  handleConnect('youtube', handle);
};

// ==========================================
// 4. API CONNECTION HANDLERS
// ==========================================

async function handleConnect(platform, identifier) {
  if (!identifier || !identifier.trim()) {
    showToast('Please enter a valid channel ID or handle.');
    return;
  }

  // Set loading state
  let btn, textSpan, spinnerSpan;
  if (platform === 'youtube') {
    btn = dom.btnConnectYt;
  } else if (platform === 'instagram') {
    btn = dom.btnConnectIg;
  } else {
    btn = dom.btnFetchDirectUrl;
  }

  textSpan = btn.querySelector('.btn-text');
  spinnerSpan = btn.querySelector('.btn-spinner');
  textSpan.style.display = 'none';
  spinnerSpan.style.display = 'inline';
  btn.disabled = true;

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
    textSpan.style.display = 'inline';
    spinnerSpan.style.display = 'none';
    btn.disabled = false;
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

  if (isNew) {
    showToast(`Connected ${creator.channel_title}! ${creator.video_count} videos synced.`);
    setTimeout(() => switchTab('library'), 700);
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
  switchTab('connect');
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
      <span class="moment-btn">Cut Clip ✂️</span>
    </div>
  `).join('');
}

function loadMomentIntoStudio(timeStr, startSec, text) {
  if (!APP_STATE.selectedVideo) return;
  setupStudioForVideo(APP_STATE.selectedVideo, timeStr, startSec, text);
  switchTab('studio');
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

  showToast('Actual video loaded into 9:16 Clip Studio.');
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
          Create Short-Form Clip for this Gap →
        </button>
      </div>
    </div>
  `).join('');
}

window.openGapInStudio = function(gapId) {
  if (APP_STATE.videos.length > 0) {
    const video = APP_STATE.videos[0];
    setupStudioForVideo(video, '00:00', 0, 'Highlight answering audience question on ' + (APP_STATE.gaps.find(g => g.id === gapId)?.title || 'gap'));
    switchTab('studio');
  }
};

// ==========================================
// 8. CLIP EXPORT & ACTIONS
// ==========================================

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
  dom.themeToggle.addEventListener('click', toggleTheme);

  // Tabs
  dom.navTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  // Disconnect header button
  dom.btnDisconnectHeader.addEventListener('click', disconnectAccount);

  // Connect Buttons
  dom.btnConnectYt.addEventListener('click', () => {
    handleConnect('youtube', dom.inputYtIdentifier.value);
  });
  dom.inputYtIdentifier.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleConnect('youtube', dom.inputYtIdentifier.value);
  });

  dom.btnConnectIg.addEventListener('click', () => {
    handleConnect('instagram', dom.inputIgIdentifier.value);
  });
  dom.inputIgIdentifier.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleConnect('instagram', dom.inputIgIdentifier.value);
  });

  dom.btnFetchDirectUrl.addEventListener('click', () => {
    handleConnect('youtube', dom.inputDirectUrl.value);
  });
  dom.inputDirectUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleConnect('youtube', dom.inputDirectUrl.value);
  });

  // Library search
  dom.librarySearchInput.addEventListener('input', () => {
    dom.btnClearSearch.classList.toggle('visible', dom.librarySearchInput.value.length > 0);
    renderVideosGrid();
  });
  dom.btnClearSearch.addEventListener('click', () => {
    dom.librarySearchInput.value = '';
    dom.btnClearSearch.classList.remove('visible');
    renderVideosGrid();
  });

  // Send active video to Studio
  dom.btnSendActiveToStudio.addEventListener('click', () => {
    if (APP_STATE.selectedVideo) {
      setupStudioForVideo(APP_STATE.selectedVideo);
      switchTab('studio');
    }
  });

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

// Start
document.addEventListener('DOMContentLoaded', init);
