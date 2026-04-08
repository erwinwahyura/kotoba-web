// Kotoba Web App - 言葉
const API_URL = 'https://kotoba.erwarx.com/api';

// State
let token = localStorage.getItem('kotoba_token');
let currentView = 'vocab';
let currentWord = null;
let currentGrammar = null;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupAuthTabs();
  setupForms();
  setupNavigation();
  setupActions();
  setupSRSActions();
  setupComparisonActions();
  
  if (token) {
    // Validate token by making a test request
    try {
      await apiRequest('/auth/me');
      showMainScreen();
    } catch (error) {
      console.log('Token invalid, showing login');
      token = null;
      localStorage.removeItem('kotoba_token');
      showAuthScreen();
      showAuthError('Session expired. Please login again.');
    }
  } else {
    showAuthScreen();
  }
});

// Auth
function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      if (tab.dataset.tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    });
  });
}

function setupForms() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    await handleLogin(email, password);
  });
  
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    await handleRegister(name, email, password);
  });
}

async function handleLogin(email, password) {
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    token = data.data.token;
    localStorage.setItem('kotoba_token', token);
    showMainScreen();
    loadDailyVocab();
  } catch (error) {
    showAuthError(error.message);
  } finally {
    hideLoading();
  }
}

async function handleRegister(name, email, password) {
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Auto-login after registration
    await handleLogin(email, password);
  } catch (error) {
    showAuthError(error.message);
  } finally {
    hideLoading();
  }
}

function showAuthError(message) {
  document.getElementById('auth-error').textContent = message;
}

function showAuthScreen() {
  authScreen.classList.add('active');
  mainScreen.classList.remove('active');
  hideLoading(); // Ensure loading is hidden when showing auth
}

function showMainScreen() {
  authScreen.classList.remove('active');
  mainScreen.classList.add('active');
  
  // Initialize vocab view on first load
  switchView('vocab');
}

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
  
  document.getElementById('logout-btn').addEventListener('click', logout);
}

// SRS State
let currentReviewQueue = [];
let currentReviewIndex = 0;
let currentReviewItem = null;

function switchView(view) {
  currentView = view;
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  // Update views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });
  document.getElementById(`${view}-view`).classList.add('active');
  
  // Load data
  if (view === 'vocab') loadDailyVocab();
  if (view === 'grammar') loadDailyGrammar();
  if (view === 'srs') loadSRSQueue();
  if (view === 'compare') loadComparisonPairs();
  if (view === 'progress') loadProgress();
}

// API Calls
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    const data = await response.json();
    throw new Error(data.message || 'Request failed');
  }
  
  return response.json();
}

// Vocabulary
async function loadDailyVocab() {
  showLoading();
  
  try {
    const data = await apiRequest('/vocab/daily');
    currentWord = data.data.vocabulary;
    displayWord(currentWord, data.data.progress);
  } catch (error) {
    console.error('Failed to load vocab:', error);
    document.getElementById('word-jp').textContent = 'Error loading word';
  } finally {
    hideLoading();
  }
}

function displayWord(word, progress) {
  document.getElementById('vocab-level').textContent = word.jlpt_level;
  document.getElementById('vocab-level').className = `level-badge ${word.jlpt_level.toLowerCase()}`;
  document.getElementById('word-jp').textContent = word.word;
  document.getElementById('word-reading').textContent = word.reading;
  document.getElementById('word-meaning').textContent = word.short_meaning;
  document.getElementById('word-explanation').textContent = word.detailed_explanation;
  document.getElementById('word-notes').textContent = word.usage_notes || '';
  
  // Add TTS button to word
  const wordJp = document.getElementById('word-jp');
  wordJp.style.cursor = 'pointer';
  wordJp.title = 'Click to hear pronunciation';
  wordJp.onclick = () => playTTS(word.word);
  
  const examplesContainer = document.getElementById('word-examples');
  examplesContainer.innerHTML = '';
  
  if (word.example_sentences && word.example_sentences.length > 0) {
    word.example_sentences.forEach(example => {
      const item = document.createElement('div');
      item.className = 'example-item';
      item.innerHTML = `
        <div class="example-jp">${example}</div>
        <button class="tts-play-btn" onclick="event.stopPropagation(); playTTS('${example.replace(/'/g, "\\'")}')">▶</button>
      `;
      examplesContainer.appendChild(item);
    });
  }
}

// Grammar
async function loadDailyGrammar() {
  showLoading();
  
  try {
    const data = await apiRequest('/grammar/daily');
    currentGrammar = data.data.pattern;
    displayGrammar(data.data.pattern, data.data.progress);
  } catch (error) {
    console.error('Failed to load grammar:', error);
    // Check if it's "not found" error (no patterns for this level)
    if (error.message && error.message.includes('not found')) {
      document.getElementById('grammar-pattern').textContent = 'No patterns for this level yet';
      document.getElementById('grammar-meaning').textContent = 'Grammar patterns coming soon for ' + document.getElementById('current-level').textContent;
    } else {
      document.getElementById('grammar-pattern').textContent = 'Error loading pattern';
    }
  } finally {
    hideLoading();
  }
}

function displayGrammar(pattern, progress) {
  document.getElementById('grammar-level').textContent = pattern.jlpt_level;
  document.getElementById('grammar-level').className = `level-badge ${pattern.jlpt_level.toLowerCase()}`;
  document.getElementById('grammar-pattern').textContent = pattern.pattern;
  document.getElementById('grammar-meaning').textContent = pattern.meaning;
  document.getElementById('grammar-conjugation').textContent = pattern.conjugation_rules;
  document.getElementById('grammar-explanation').textContent = pattern.detailed_explanation;
  document.getElementById('grammar-nuance').textContent = pattern.nuance_notes;
  
  // Add TTS button to pattern
  const grammarPattern = document.getElementById('grammar-pattern');
  grammarPattern.style.cursor = 'pointer';
  grammarPattern.title = 'Click to hear pronunciation';
  grammarPattern.onclick = () => playTTS(pattern.pattern.replace(/〜/g, ''));
  
  // Examples
  const examplesContainer = document.getElementById('grammar-examples');
  examplesContainer.innerHTML = '';
  
  if (pattern.usage_examples && pattern.usage_examples.length > 0) {
    pattern.usage_examples.forEach(example => {
      const item = document.createElement('div');
      item.className = 'example-item';
      const japanese = example.japanese.replace(/'/g, "\\'");
      item.innerHTML = `
        <div class="example-jp">${example.japanese}</div>
        <div class="example-reading">${example.reading}</div>
        <div class="example-meaning">${example.meaning}</div>
        <div class="example-context">${example.context}</div>
        ${example.alternative ? `<div class="example-alt">Alt: ${example.alternative}</div>` : ''}
        <button class="tts-play-btn" onclick="event.stopPropagation(); playTTS('${japanese}')">▶</button>
      `;
      
      // Toggle reading on click
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.tts-play-btn')) {
          item.classList.toggle('show-reading');
        }
      });
      
      examplesContainer.appendChild(item);
    });
  }
  
  // Common Mistakes
  const mistakesSection = document.querySelector('.mistakes-section');
  if (pattern.common_mistakes) {
    document.getElementById('grammar-mistakes').textContent = pattern.common_mistakes;
    mistakesSection.classList.remove('hidden');
  } else {
    mistakesSection.classList.add('hidden');
  }
  
  // Related Patterns
  const relatedSection = document.getElementById('grammar-related-section');
  const relatedContainer = document.getElementById('grammar-related');
  relatedContainer.innerHTML = '';
  
  if (pattern.related_patterns && pattern.related_patterns.length > 0) {
    pattern.related_patterns.forEach(related => {
      const item = document.createElement('div');
      item.className = 'related-item';
      item.innerHTML = `
        <div class="related-pattern">${related.pattern}</div>
        <div class="related-relationship">${related.relationship}</div>
        <div class="related-difference">${related.key_difference}</div>
      `;
      relatedContainer.appendChild(item);
    });
    relatedSection.classList.remove('hidden');
  } else {
    relatedSection.classList.add('hidden');
  }
}

// Progress
async function loadProgress() {
  showLoading();
  
  try {
    const [progress, stats] = await Promise.all([
      apiRequest('/progress'),
      apiRequest('/progress/stats')
    ]);
    
    displayProgress(progress.data, stats.data);
  } catch (error) {
    console.error('Failed to load progress:', error);
  } finally {
    hideLoading();
  }
}

function displayProgress(progressData, statsData) {
  // Handle nested data structure: API returns { data: { progress: {...} } }
  const progress = progressData.progress || progressData;
  const stats = statsData || {};
  
  // Get values from progress response
  const vocabLearned = progress.words_learned || 0;
  const grammarLearned = progress.grammar_learned || 0;
  const streakDays = progress.streak_days || 0;
  const currentLevel = progress.current_level || 'N5';
  const vocabIndex = progress.current_vocab_index || 0;
  const grammarIndex = progress.current_grammar_index || 0;
  const totalWords = progress.total_words_in_level || 50;
  
  document.getElementById('vocab-learned').textContent = vocabLearned;
  document.getElementById('grammar-learned').textContent = grammarLearned;
  document.getElementById('streak-days').textContent = streakDays;
  document.getElementById('current-level').textContent = currentLevel;
  
  // Level progress bars - calculate from current indices vs totals
  const container = document.getElementById('level-progress-bars');
  if (!container) return;
  
  container.innerHTML = '';
  
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const currentLevelIndex = levels.indexOf(currentLevel);
  
  // Calculate progress per level
  const progressPerLevel = {};
  levels.forEach((level, index) => {
    if (index < currentLevelIndex) {
      progressPerLevel[level] = 100; // Completed previous levels
    } else if (index === currentLevelIndex) {
      // Current level - calculate % from vocab index
      progressPerLevel[level] = Math.min(100, Math.round((vocabIndex / totalWords) * 100));
    } else {
      progressPerLevel[level] = 0; // Future levels
    }
  });
  
  levels.forEach(level => {
    const percent = progressPerLevel[level] || 0;
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.innerHTML = `
      <div class="progress-header">
        <span>${level}</span>
        <span>${percent}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${level.toLowerCase()}" style="width: ${percent}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Actions
function setupActions() {
  // Vocab actions
  document.getElementById('skip-word-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentWord) {
      showError('No word loaded. Please wait.');
      return;
    }
    
    showLoading();
    try {
      // Advance to next word
      await apiRequest(`/vocab/${currentWord.id}/skip`, {
        method: 'POST',
        body: JSON.stringify({ status: 'known' })
      });
      
      await loadDailyVocab();
    } catch (error) {
      console.error('Error:', error);
      showError('Failed: ' + (error.message || 'Unknown error'));
    } finally {
      hideLoading();
    }
  });
  
  document.getElementById('next-word-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentWord) {
      showError('No word loaded. Please wait.');
      return;
    }
    
    showLoading();
    try {
      await apiRequest(`/vocab/${currentWord.id}/skip`, {
        method: 'POST',
        body: JSON.stringify({ status: 'skipped' })
      });
      await loadDailyVocab();
    } catch (error) {
      console.error('Error:', error);
      showError('Failed: ' + (error.message || 'Unknown error'));
    } finally {
      hideLoading();
    }
  });
  
  // Grammar actions
  document.getElementById('prev-grammar-btn').addEventListener('click', (e) => {
    e.preventDefault();
    // Navigate through grammar patterns
    if (!currentGrammar) return;
    alert('Previous pattern - coming soon!');
  });
  
  document.getElementById('next-grammar-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    alert('GRAMMAR: Button clicked!');
    if (!currentGrammar) {
      alert('GRAMMAR ERROR: No current pattern loaded');
      return;
    }
    
    alert(`GRAMMAR: Will skip pattern ID: ${currentGrammar.id}`);
    
    showLoading();
    try {
      // Advance to next pattern
      alert(`GRAMMAR: Calling /grammar/${currentGrammar.id}/skip`);
      const result = await apiRequest(`/grammar/${currentGrammar.id}/skip`, {
        method: 'POST',
        body: JSON.stringify({ status: 'studied' })
      });
      
      alert(`GRAMMAR: Skip OK! Next pattern: ${result.data?.pattern?.pattern || 'unknown'}`);
      await loadDailyGrammar();
      alert('GRAMMAR: Done!');
    } catch (error) {
      alert(`GRAMMAR ERROR: ${error.message}`);
      console.error('Failed to save grammar progress:', error);
      showError('Failed: ' + (error.message || 'Unknown error'));
    } finally {
      hideLoading();
    }
  });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Utilities
function logout() {
  token = null;
  localStorage.removeItem('kotoba_token');
  hideLoading(); // Clear any loading state
  showAuthScreen();
}

function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

// SRS Functions
async function loadSRSQueue() {
  showLoading();
  
  try {
    // Get review queue
    const queueData = await apiRequest('/srs/queue?limit=20');
    currentReviewQueue = queueData.data || [];
    currentReviewIndex = 0;
    
    // Get stats
    const statsData = await apiRequest('/srs/stats');
    const stats = statsData.data || {};
    
    // Update stats display
    document.getElementById('srs-due-today').textContent = stats.due_count || 0;
    document.getElementById('srs-new').textContent = stats.new_count || 0;
    document.getElementById('srs-mastered').textContent = stats.mastered_count || 0;
    document.getElementById('review-count').textContent = `${currentReviewQueue.length} due`;
    
    // Show first item or empty state
    if (currentReviewQueue.length > 0) {
      showReviewItem(0);
    } else {
      showReviewEmpty();
    }
  } catch (error) {
    console.error('Failed to load SRS queue:', error);
    showReviewEmpty();
  } finally {
    hideLoading();
  }
}

function showReviewEmpty() {
  document.getElementById('review-empty').classList.remove('hidden');
  document.getElementById('review-item').classList.add('hidden');
}

function showReviewItem(index) {
  if (index >= currentReviewQueue.length) {
    showReviewEmpty();
    return;
  }
  
  currentReviewIndex = index;
  currentReviewItem = currentReviewQueue[index];
  
  // Hide empty, show item
  document.getElementById('review-empty').classList.add('hidden');
  document.getElementById('review-item').classList.remove('hidden');
  
  // Reset card state (front side)
  document.getElementById('review-back').classList.add('hidden');
  document.getElementById('review-actions-front').classList.remove('hidden');
  document.getElementById('review-actions-back').classList.add('hidden');
  
  // Set content
  const item = currentReviewItem;
  const isVocab = item.item_type === 'vocabulary';
  
  document.getElementById('review-type').textContent = isVocab ? 'Vocabulary' : 'Grammar';
  
  if (isVocab) {
    document.getElementById('review-front').textContent = item.word || item.front;
  } else {
    document.getElementById('review-front').textContent = item.pattern || item.front;
  }
  
  // Back side content (hidden initially)
  if (isVocab) {
    document.getElementById('review-reading').textContent = item.reading || '';
    document.getElementById('review-meaning').textContent = item.meaning || item.short_meaning || '';
  } else {
    document.getElementById('review-reading').textContent = '';
    document.getElementById('review-meaning').textContent = item.meaning || '';
  }
  
  // Update counter
  document.getElementById('review-count').textContent = `${currentReviewQueue.length - index} remaining`;
}

function showReviewAnswer() {
  document.getElementById('review-back').classList.remove('hidden');
  document.getElementById('review-actions-front').classList.add('hidden');
  document.getElementById('review-actions-back').classList.remove('hidden');
}

async function submitReview(quality) {
  if (!currentReviewItem) return;
  
  showLoading();
  
  try {
    await apiRequest('/srs/review', {
      method: 'POST',
      body: JSON.stringify({
        item_id: currentReviewItem.id,
        item_type: currentReviewItem.item_type,
        quality: quality
      })
    });
    
    // Move to next item
    currentReviewIndex++;
    if (currentReviewIndex < currentReviewQueue.length) {
      showReviewItem(currentReviewIndex);
    } else {
      // Queue complete, refresh stats
      await loadSRSQueue();
    }
  } catch (error) {
    console.error('Failed to submit review:', error);
    showError('Failed to save review');
  } finally {
    hideLoading();
  }
}

// SRS Event Listeners
function setupSRSActions() {
  // Show answer button
  document.getElementById('show-answer-btn')?.addEventListener('click', () => {
    showReviewAnswer();
  });
  
  // Quality buttons
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const quality = parseInt(btn.dataset.quality);
      submitReview(quality);
    });
  });
}

// Grammar Comparison Functions
let comparisonPairs = [];
let currentCompareLevel = 'N4';

function setupComparisonActions() {
  // Compare button from grammar view
  document.getElementById('compare-grammar-btn')?.addEventListener('click', () => {
    switchView('compare');
  });
  
  // Back button in detail view
  document.getElementById('back-to-pairs')?.addEventListener('click', () => {
    showComparisonList();
  });
}

async function loadComparisonPairs() {
  showLoading();
  
  try {
    const data = await apiRequest(`/grammar/compare/pairs?level=${currentCompareLevel}`);
    comparisonPairs = data.data.pairs || [];
    
    document.getElementById('compare-level').textContent = currentCompareLevel;
    renderComparisonPairs();
  } catch (error) {
    console.error('Failed to load comparison pairs:', error);
    document.getElementById('compare-pairs-list').innerHTML = 
      '<div class="compare-pair-card">Error loading comparison pairs</div>';
  } finally {
    hideLoading();
  }
}

function renderComparisonPairs() {
  const container = document.getElementById('compare-pairs-list');
  
  if (comparisonPairs.length === 0) {
    container.innerHTML = '<div class="compare-pair-card">No comparison pairs available yet</div>';
    return;
  }
  
  container.innerHTML = comparisonPairs.map((pair, index) => `
    <div class="compare-pair-card" data-index="${index}">
      <div class="compare-pair-header">${pair.name}</div>
      <div class="compare-pair-desc">${pair.description || 'Compare these patterns'}</div>
    </div>
  `).join('');
  
  // Add click handlers
  container.querySelectorAll('.compare-pair-card').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      loadComparisonDetail(comparisonPairs[index]);
    });
  });
}

async function loadComparisonDetail(pair) {
  showLoading();
  
  try {
    // Fetch detailed comparison
    const data = await apiRequest(`/grammar/compare/detail?a=${pair.pattern_a.id}&b=${pair.pattern_b.id}`);
    const comparison = data.data;
    
    // Hide list, show detail
    document.getElementById('compare-pairs-list').classList.add('hidden');
    document.getElementById('compare-detail').classList.remove('hidden');
    
    // Render patterns
    document.getElementById('compare-pattern-a').textContent = comparison.pattern_a.pattern;
    document.getElementById('compare-meaning-a').textContent = comparison.pattern_a.meaning;
    document.getElementById('compare-pattern-b').textContent = comparison.pattern_b.pattern;
    document.getElementById('compare-meaning-b').textContent = comparison.pattern_b.meaning;
    
    // Render differences
    const diffContainer = document.getElementById('compare-differences');
    if (comparison.key_differences && comparison.key_differences.length > 0) {
      diffContainer.innerHTML = comparison.key_differences.map(diff => `
        <div class="compare-difference">
          <div class="compare-difference-aspect">${diff.aspect.replace('_', ' ')}</div>
          <div class="compare-difference-content">
            <div class="compare-difference-a">${diff.pattern_a}</div>
            <div class="compare-difference-b">${diff.pattern_b}</div>
          </div>
          ${diff.example_a ? `
            <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-2);">
              <div>A: ${diff.example_a}</div>
              <div>B: ${diff.example_b}</div>
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      diffContainer.innerHTML = '<div class="compare-difference">No detailed comparison available</div>';
    }
    
    // Render boundaries
    const boundaryContainer = document.getElementById('compare-boundaries');
    if (comparison.usage_boundaries && comparison.usage_boundaries.length > 0) {
      boundaryContainer.innerHTML = comparison.usage_boundaries.map(b => `
        <div class="compare-boundary">
          <span class="compare-boundary-marker">${b.use_pattern}</span>
          <div>
            <div class="compare-boundary-text">${b.situation}</div>
            <div class="compare-boundary-exp">${b.explanation}</div>
          </div>
        </div>
      `).join('');
    } else {
      boundaryContainer.innerHTML = '<div class="compare-boundary">Review pattern examples for usage guidance</div>';
    }
    
    // Render errors
    const errorContainer = document.getElementById('compare-errors');
    if (comparison.common_errors && comparison.common_errors.length > 0) {
      errorContainer.innerHTML = comparison.common_errors.map(e => `
        <div class="compare-error">
          <div class="compare-error-text">❌ ${e.error}</div>
          <div class="compare-error-correction">✓ ${e.correction}</div>
          <div class="compare-error-exp">${e.explanation}</div>
        </div>
      `).join('');
    } else {
      errorContainer.innerHTML = '<div class="compare-error">No common errors recorded</div>';
    }
    
  } catch (error) {
    console.error('Failed to load comparison detail:', error);
    showError('Failed to load comparison detail');
  } finally {
    hideLoading();
  }
}

function showComparisonList() {
  document.getElementById('compare-detail').classList.add('hidden');
  document.getElementById('compare-pairs-list').classList.remove('hidden');
}

// TTS Audio Functions
let currentAudio = null;
let ttsCache = new Map(); // Client-side cache for audio URLs

async function playTTS(text, voiceId = '') {
  if (!text) return;
  
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  // Check client cache first
  const cacheKey = text + (voiceId || '');
  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey);
    playAudioUrl(cached.audio_url);
    return;
  }
  
  showLoading();
  
  try {
    const response = await apiRequest('/tts/generate', {
      method: 'POST',
      body: JSON.stringify({ text, voice_id: voiceId })
    });
    
    const audioData = response.data;
    
    // Cache the result
    ttsCache.set(cacheKey, audioData);
    
    // Play the audio
    playAudioUrl(audioData.audio_url);
    
  } catch (error) {
    console.error('Failed to generate TTS:', error);
    showError('Failed to play audio');
    // Fallback to browser TTS
    fallbackBrowserTTS(text);
  } finally {
    hideLoading();
  }
}

function playAudioUrl(url) {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  currentAudio = new Audio(fullUrl);
  currentAudio.play().catch(err => {
    console.error('Audio playback failed:', err);
    showError('Audio playback failed');
  });
}

function fallbackBrowserTTS(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8; // Slightly slower for learning
    speechSynthesis.speak(utterance);
  } else {
    showError('Text-to-speech not supported');
  }
}

function stopTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

// Add TTS play button to examples
function addTTSButtonsToExamples() {
  // Add click handlers to example items for TTS
  document.querySelectorAll('.example-item').forEach(item => {
    const japaneseText = item.querySelector('.example-jp')?.textContent;
    if (japaneseText) {
      // Add play button if not present
      if (!item.querySelector('.tts-play-btn')) {
        const playBtn = document.createElement('button');
        playBtn.className = 'tts-play-btn';
        playBtn.innerHTML = '▶';
        playBtn.title = 'Play audio';
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playTTS(japaneseText);
        });
        item.appendChild(playBtn);
      }
    }
  });
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}