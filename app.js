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
  setupJLPTActions();
  setupConjugationActions();
  setupSearchActions();
  setupKanjiActions();
  setupReadingActions();
  setupWeakPointsActions();
  
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
  if (view === 'tests') loadJLPTTests();
  if (view === 'conjugation') {
    // Conjugation drill - no auto-load, user selects form
    document.getElementById('conj-form-select')?.classList.remove('hidden');
    document.getElementById('conj-drill')?.classList.add('hidden');
    document.getElementById('conj-results')?.classList.add('hidden');
  }
  if (view === 'search') {
    // Search - no auto-load, wait for user input
    document.getElementById('search-input')?.focus();
  }
  if (view === 'kanji') {
    // Kanji - show selection grid
    document.getElementById('kanji-select')?.classList.remove('hidden');
    document.getElementById('kanji-practice')?.classList.add('hidden');
  }
  if (view === 'reading') {
    // Reading - show level selection
    document.getElementById('reading-levels')?.classList.remove('hidden');
    document.getElementById('reading-article')?.classList.add('hidden');
    document.getElementById('reading-results')?.classList.add('hidden');
  }
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
    const wordJp = document.getElementById('word-jp');
    if (wordJp) wordJp.textContent = 'Error loading word';
  } finally {
    hideLoading();
  }
}

function displayWord(word, progress) {
  const vocabLevel = document.getElementById('vocab-level');
  const wordJp = document.getElementById('word-jp');
  const wordReading = document.getElementById('word-reading');
  const wordMeaning = document.getElementById('word-meaning');
  const wordExplanation = document.getElementById('word-explanation');
  const wordNotes = document.getElementById('word-notes');
  const examplesContainer = document.getElementById('word-examples');
  
  if (!vocabLevel || !wordJp) return; // View not active
  
  vocabLevel.textContent = word.jlpt_level;
  vocabLevel.className = `level-badge ${word.jlpt_level.toLowerCase()}`;
  wordJp.textContent = word.word;
  if (wordReading) wordReading.textContent = word.reading;
  if (wordMeaning) wordMeaning.textContent = word.short_meaning;
  if (wordExplanation) wordExplanation.textContent = word.detailed_explanation;
  if (wordNotes) wordNotes.textContent = word.usage_notes || '';
  
  // Add TTS button to word
  wordJp.style.cursor = 'pointer';
  wordJp.title = 'Click to hear pronunciation';
  wordJp.onclick = () => playTTS(word.word);
  
  if (!examplesContainer) return;
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
    const grammarPattern = document.getElementById('grammar-pattern');
    if (!grammarPattern) return; // View may have changed
    
    if (error.message && error.message.includes('not found')) {
      grammarPattern.textContent = 'No patterns for this level yet';
      const grammarMeaning = document.getElementById('grammar-meaning');
      if (grammarMeaning) {
        const currentLevel = document.getElementById('current-level');
        grammarMeaning.textContent = 'Grammar patterns coming soon for ' + (currentLevel?.textContent || 'this level');
      }
    } else {
      grammarPattern.textContent = 'Error loading pattern';
    }
  } finally {
    hideLoading();
  }
}

function displayGrammar(pattern, progress) {
  const grammarLevel = document.getElementById('grammar-level');
  const grammarPattern = document.getElementById('grammar-pattern');
  
  if (!grammarLevel || !grammarPattern) return; // View not active
  
  grammarLevel.textContent = pattern.jlpt_level;
  grammarLevel.className = `level-badge ${pattern.jlpt_level.toLowerCase()}`;
  grammarPattern.textContent = pattern.pattern;
  
  const grammarMeaning = document.getElementById('grammar-meaning');
  const grammarConjugation = document.getElementById('grammar-conjugation');
  const grammarExplanation = document.getElementById('grammar-explanation');
  const grammarNuance = document.getElementById('grammar-nuance');
  
  if (grammarMeaning) grammarMeaning.textContent = pattern.meaning;
  if (grammarConjugation) grammarConjugation.textContent = pattern.conjugation_rules;
  if (grammarExplanation) grammarExplanation.textContent = pattern.detailed_explanation;
  if (grammarNuance) grammarNuance.textContent = pattern.nuance_notes;
  
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
  
  // Get grammar progress data (already declared above)
  const totalGrammar = progress.total_grammar_in_level || 10;
  
  // Calculate progress per level for both vocab and grammar
  const vocabProgressPerLevel = {};
  const grammarProgressPerLevel = {};
  
  levels.forEach((level, index) => {
    if (index < currentLevelIndex) {
      vocabProgressPerLevel[level] = 100;
      grammarProgressPerLevel[level] = 100;
    } else if (index === currentLevelIndex) {
      vocabProgressPerLevel[level] = Math.min(100, Math.round((vocabIndex / totalWords) * 100));
      grammarProgressPerLevel[level] = Math.min(100, Math.round((grammarIndex / totalGrammar) * 100));
    } else {
      vocabProgressPerLevel[level] = 0;
      grammarProgressPerLevel[level] = 0;
    }
  });
  
  // Add section header
  const header = document.createElement('div');
  header.className = 'progress-section-header';
  header.innerHTML = '<span class="progress-section-title">Vocabulary</span>';
  container.appendChild(header);
  
  levels.forEach(level => {
    const percent = vocabProgressPerLevel[level] || 0;
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
  
  // Add grammar section header
  const grammarHeader = document.createElement('div');
  grammarHeader.className = 'progress-section-header';
  grammarHeader.style.marginTop = '24px';
  grammarHeader.innerHTML = '<span class="progress-section-title">Grammar</span>';
  container.appendChild(grammarHeader);
  
  levels.forEach(level => {
    const percent = grammarProgressPerLevel[level] || 0;
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
      // Mark as known: Initialize SRS with quality 5 (mastered) + skip to next
      // Step 1: Initialize item in SRS if not exists
      await apiRequest('/srs/init', {
        method: 'POST',
        body: JSON.stringify({ 
          item_id: currentWord.id, 
          item_type: 'vocabulary' 
        })
      });
      
      // Step 2: Submit review with quality 5 (mastered)
      await apiRequest('/srs/review', {
        method: 'POST',
        body: JSON.stringify({
          item_id: currentWord.id,
          item_type: 'vocabulary',
          quality: 5
        })
      });
      
      // Step 3: Advance to next word
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
    
    if (!currentGrammar) {
      showError('No grammar pattern loaded');
      return;
    }
    
    showLoading();
    try {
      // Advance to next pattern
      await apiRequest(`/grammar/${currentGrammar.id}/skip`, {
        method: 'POST',
        body: JSON.stringify({ status: 'studied' })
      });
      
      await loadDailyGrammar();
    } catch (error) {
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

// ==================== CONJUGATION DRILL ====================

let currentConjSession = null;
let currentConjChallenges = [];
let currentConjIndex = 0;
let conjAnswers = [];
let conjStreak = 0;
let conjBestStreak = 0;

function setupConjugationActions() {
  // Form selection cards
  document.querySelectorAll('.conj-form-card').forEach(card => {
    card.addEventListener('click', () => {
      const form = card.dataset.form;
      startConjugationDrill(form);
    });
  });
  
  // Submit answer
  document.getElementById('conj-submit')?.addEventListener('click', submitConjAnswer);
  document.getElementById('conj-answer')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitConjAnswer();
  });
  
  // Hint button
  document.getElementById('conj-hint')?.addEventListener('click', showConjHint);
  
  // Skip button
  document.getElementById('conj-skip')?.addEventListener('click', skipConjChallenge);
  
  // Next button
  document.getElementById('conj-next')?.addEventListener('click', nextConjChallenge);
  
  // Restart button
  document.getElementById('conj-restart')?.addEventListener('click', () => {
    document.getElementById('conj-results').classList.add('hidden');
    document.getElementById('conj-form-select').classList.remove('hidden');
  });
}

async function startConjugationDrill(form) {
  showLoading();
  
  try {
    const data = await apiRequest(`/conjugation/start?form=${form}&count=10`);
    
    currentConjSession = data.data.session;
    currentConjChallenges = data.data.challenges;
    currentConjIndex = 0;
    conjAnswers = [];
    conjStreak = 0;
    conjBestStreak = 0;
    
    // Hide form selection, show drill
    document.getElementById('conj-form-select').classList.add('hidden');
    document.getElementById('conj-drill').classList.remove('hidden');
    document.getElementById('conj-results').classList.add('hidden');
    
    // Reset UI
    document.getElementById('conj-feedback').classList.add('hidden');
    document.getElementById('conj-next').classList.add('hidden');
    document.getElementById('conj-submit').classList.remove('hidden');
    document.getElementById('conj-answer').value = '';
    document.getElementById('conj-answer').classList.remove('correct', 'incorrect');
    document.getElementById('conj-answer').disabled = false;
    
    renderConjChallenge();
    
  } catch (error) {
    console.error('Failed to start conjugation drill:', error);
    showError('Failed to start drill: ' + error.message);
  } finally {
    hideLoading();
  }
}

function renderConjChallenge() {
  const challenge = currentConjChallenges[currentConjIndex];
  if (!challenge) return;
  
  // Update progress
  document.getElementById('conj-progress').textContent = `${currentConjIndex + 1} / ${currentConjChallenges.length}`;
  
  // Calculate accuracy
  const correct = conjAnswers.filter(a => a.correct).length;
  const accuracy = currentConjIndex > 0 ? Math.round((correct / currentConjIndex) * 100) : 0;
  document.getElementById('conj-accuracy').textContent = `Accuracy: ${accuracy}%`;
  
  // Update streak display
  document.getElementById('conj-streak').textContent = `🔥 ${conjStreak}`;
  
  // Display verb and target form
  document.getElementById('conj-verb').textContent = challenge.verb;
  document.getElementById('conj-target').textContent = challenge.target_form;
  
  // Reset input
  const input = document.getElementById('conj-answer');
  input.value = '';
  input.classList.remove('correct', 'incorrect');
  input.disabled = false;
  input.focus();
  
  // Hide feedback
  document.getElementById('conj-feedback').classList.add('hidden');
  document.getElementById('conj-next').classList.add('hidden');
  document.getElementById('conj-submit').classList.remove('hidden');
  document.getElementById('conj-hint').classList.remove('hidden');
  document.getElementById('conj-skip').classList.remove('hidden');
}

async function submitConjAnswer() {
  const challenge = currentConjChallenges[currentConjIndex];
  const input = document.getElementById('conj-answer');
  const answer = input.value.trim();
  
  if (!answer) return;
  
  showLoading();
  
  try {
    const data = await apiRequest('/conjugation/answer', {
      method: 'POST',
      body: JSON.stringify({
        session_id: currentConjSession.id,
        challenge_id: challenge.id,
        answer: answer
      })
    });
    
    const result = data.data;
    const isCorrect = result.correct;
    
    // Track answer
    conjAnswers.push({
      challenge: challenge,
      answer: answer,
      correct: isCorrect
    });
    
    // Update streak
    if (isCorrect) {
      conjStreak++;
      if (conjStreak > conjBestStreak) conjBestStreak = conjStreak;
    } else {
      conjStreak = 0;
    }
    
    // Update UI
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    const feedback = document.getElementById('conj-feedback');
    feedback.classList.remove('hidden', 'correct', 'incorrect');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    document.getElementById('conj-result').textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect';
    document.getElementById('conj-result').className = 'conj-result ' + (isCorrect ? 'correct' : 'incorrect');
    document.getElementById('conj-correct-answer').textContent = `Answer: ${result.correct_answer}`;
    document.getElementById('conj-explanation').textContent = result.explanation || '';
    
    // Show next button, hide submit
    document.getElementById('conj-submit').classList.add('hidden');
    document.getElementById('conj-hint').classList.add('hidden');
    document.getElementById('conj-skip').classList.add('hidden');
    document.getElementById('conj-next').classList.remove('hidden');
    
    // Play audio of correct answer if TTS available
    if (isCorrect && result.correct_answer) {
      playTTS(result.correct_answer);
    }
    
  } catch (error) {
    console.error('Failed to submit answer:', error);
    showError('Failed to check answer');
  } finally {
    hideLoading();
  }
}

function showConjHint() {
  const challenge = currentConjChallenges[currentConjIndex];
  if (challenge && challenge.hint) {
    const feedback = document.getElementById('conj-feedback');
    feedback.classList.remove('hidden');
    feedback.classList.remove('correct', 'incorrect');
    feedback.style.background = '#fffbeb';
    feedback.style.border = '1px solid #f59e0b';
    
    document.getElementById('conj-result').textContent = '💡 Hint';
    document.getElementById('conj-result').className = 'conj-result';
    document.getElementById('conj-result').style.color = '#f59e0b';
    document.getElementById('conj-correct-answer').textContent = challenge.hint;
    document.getElementById('conj-explanation').textContent = '';
  }
}

function skipConjChallenge() {
  const challenge = currentConjChallenges[currentConjIndex];
  
  // Track as incorrect
  conjAnswers.push({
    challenge: challenge,
    answer: '(skipped)',
    correct: false
  });
  
  conjStreak = 0;
  
  // Show correct answer
  const input = document.getElementById('conj-answer');
  input.disabled = true;
  
  const feedback = document.getElementById('conj-feedback');
  feedback.classList.remove('hidden', 'correct', 'incorrect');
  feedback.classList.add('incorrect');
  
  document.getElementById('conj-result').textContent = 'Skipped';
  document.getElementById('conj-result').className = 'conj-result incorrect';
  document.getElementById('conj-correct-answer').textContent = `Answer: ${challenge.correct_answer}`;
  document.getElementById('conj-explanation').textContent = challenge.explanation || '';
  
  document.getElementById('conj-submit').classList.add('hidden');
  document.getElementById('conj-hint').classList.add('hidden');
  document.getElementById('conj-skip').classList.add('hidden');
  document.getElementById('conj-next').classList.remove('hidden');
}

function nextConjChallenge() {
  currentConjIndex++;
  
  if (currentConjIndex >= currentConjChallenges.length) {
    showConjResults();
  } else {
    renderConjChallenge();
  }
}

function showConjResults() {
  document.getElementById('conj-drill').classList.add('hidden');
  document.getElementById('conj-results').classList.remove('hidden');
  
  const correct = conjAnswers.filter(a => a.correct).length;
  const total = conjAnswers.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  document.getElementById('conj-final-score').textContent = `${correct}/${total} (${accuracy}%)`;
  document.getElementById('conj-correct-count').textContent = correct;
  document.getElementById('conj-wrong-count').textContent = total - correct;
  document.getElementById('conj-streak-final').textContent = conjBestStreak;
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

// JLPT Test Functions
let currentTestSession = null;
let currentTestQuestions = [];
let currentQuestionIndex = 0;
let testAnswers = {};
let testTimerInterval = null;
let testStartTime = null;

function setupJLPTActions() {
  // Level cards
  document.querySelectorAll('.test-level-card').forEach(card => {
    card.addEventListener('click', () => {
      const level = card.dataset.level;
      startJLPTTest(level);
    });
  });
  
  // Test navigation
  document.getElementById('prev-q-btn')?.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderTestQuestion();
    }
  });
  
  document.getElementById('next-q-btn')?.addEventListener('click', () => {
    if (currentQuestionIndex < currentTestQuestions.length - 1) {
      currentQuestionIndex++;
      renderTestQuestion();
    }
  });
  
  document.getElementById('exit-test-btn')?.addEventListener('click', () => {
    if (confirm('Exit test? Your progress will be lost.')) {
      exitTest();
    }
  });
  
  document.getElementById('finish-test-btn')?.addEventListener('click', () => {
    finishTest();
  });
  
  document.getElementById('new-test-btn')?.addEventListener('click', () => {
    document.getElementById('test-results').classList.add('hidden');
    document.getElementById('test-levels').classList.remove('hidden');
  });
}

function loadJLPTTests() {
  // Show level selection by default
  document.getElementById('test-levels').classList.remove('hidden');
  document.getElementById('active-test').classList.add('hidden');
  document.getElementById('test-results').classList.add('hidden');
  
  setupJLPTActions();
}

async function startJLPTTest(level) {
  showLoading();
  
  try {
    const data = await apiRequest('/jlpt/start', {
      method: 'POST',
      body: JSON.stringify({ level, section: '' })
    });
    
    currentTestSession = data.data.session;
    currentTestQuestions = data.data.questions;
    currentQuestionIndex = 0;
    testAnswers = {};
    testStartTime = Date.now();
    
    // Hide levels, show test
    document.getElementById('test-levels').classList.add('hidden');
    document.getElementById('active-test').classList.remove('hidden');
    document.getElementById('test-results').classList.add('hidden');
    
    // Start timer
    startTestTimer();
    
    // Render first question
    renderTestQuestion();
    
  } catch (error) {
    console.error('Failed to start test:', error);
    showError('Failed to start test: ' + error.message);
  } finally {
    hideLoading();
  }
}

function renderTestQuestion() {
  const question = currentTestQuestions[currentQuestionIndex];
  if (!question) return;
  
  // Update progress
  document.getElementById('test-q-num').textContent = currentQuestionIndex + 1;
  document.getElementById('test-q-total').textContent = currentTestQuestions.length;
  
  // Update navigation buttons
  document.getElementById('prev-q-btn').disabled = currentQuestionIndex === 0;
  document.getElementById('next-q-btn').textContent = 
    currentQuestionIndex === currentTestQuestions.length - 1 ? 'Review →' : 'Next →';
  
  // Render question
  document.getElementById('test-question').textContent = question.question;
  document.getElementById('test-reading').textContent = question.question_reading || '';
  
  // Render options
  const optionsContainer = document.getElementById('test-options');
  optionsContainer.innerHTML = question.options.map((opt, idx) => `
    <div class="test-option ${testAnswers[question.id] === idx ? 'selected' : ''}" 
         data-idx="${idx}" onclick="selectTestAnswer('${question.id}', ${idx})">
      <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
      <span class="option-text">${opt}</span>
    </div>
  `).join('');
}

function selectTestAnswer(questionId, answerIdx) {
  testAnswers[questionId] = answerIdx;
  
  // Update UI
  document.querySelectorAll('.test-option').forEach((opt, idx) => {
    opt.classList.toggle('selected', idx === answerIdx);
  });
  
  // Auto-save to server
  apiRequest('/jlpt/answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: currentTestSession.id,
      question_id: questionId,
      answer_index: answerIdx
    })
  }).catch(err => console.error('Failed to save answer:', err));
}

function startTestTimer() {
  const timeLimitMinutes = 20; // Default for N5
  let remainingSeconds = timeLimitMinutes * 60;
  
  updateTimerDisplay(remainingSeconds);
  
  testTimerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay(remainingSeconds);
    
    if (remainingSeconds <= 0) {
      clearInterval(testTimerInterval);
      finishTest();
    }
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('test-timer').textContent = 
    `${mins}:${secs.toString().padStart(2, '0')}`;
}

function exitTest() {
  if (testTimerInterval) {
    clearInterval(testTimerInterval);
    testTimerInterval = null;
  }
  
  currentTestSession = null;
  currentTestQuestions = [];
  testAnswers = {};
  
  document.getElementById('active-test').classList.add('hidden');
  document.getElementById('test-levels').classList.remove('hidden');
}

async function finishTest() {
  if (testTimerInterval) {
    clearInterval(testTimerInterval);
    testTimerInterval = null;
  }
  
  showLoading();
  
  try {
    const result = await apiRequest(`/jlpt/complete/${currentTestSession.id}`, {
      method: 'POST',
      body: JSON.stringify({ answers: testAnswers })
    });
    
    const data = result.data;
    
    // Show results
    document.getElementById('active-test').classList.add('hidden');
    document.getElementById('test-results').classList.remove('hidden');
    
    // Populate results
    document.getElementById('result-score').textContent = 
      `${data.correct_count}/${data.total_questions} (${Math.round(data.percentage)}%)`;
    document.getElementById('result-passed').textContent = data.passed ? 'PASSED ✓' : 'FAILED ✗';
    document.getElementById('result-passed').className = 
      `result-passed ${data.passed ? 'passed' : 'failed'}`;
    document.getElementById('result-correct').textContent = data.correct_count;
    document.getElementById('result-wrong').textContent = data.incorrect_count;
    document.getElementById('result-time').textContent = data.time_spent;
    
    // Render review
    const reviewContainer = document.getElementById('result-review');
    if (data.review_questions && data.review_questions.length > 0) {
      reviewContainer.innerHTML = data.review_questions.map((item, idx) => `
        <div class="review-item">
          <div class="review-q-num">Q${item.question_num}</div>
          <div class="review-question">${item.question}</div>
          <div class="review-answers">
            <span class="your-answer wrong">Your: ${item.your_answer}</span>
            <span class="correct-answer">Correct: ${item.correct_answer}</span>
          </div>
          <div class="review-exp">${item.explanation}</div>
        </div>
      `).join('');
    } else {
      reviewContainer.innerHTML = '<div class="review-item">Perfect score! No mistakes to review.</div>';
    }
    
  } catch (error) {
    console.error('Failed to complete test:', error);
    showError('Failed to submit test: ' + error.message);
  } finally {
    hideLoading();
  }
}

// ==================== SEARCH FUNCTION ====================

let currentSearchType = 'vocab';
let searchDebounceTimer = null;

function setupSearchActions() {
  // Tab switching
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSearchType = tab.dataset.search;
      
      // Clear and refocus
      const input = document.getElementById('search-input');
      input.value = '';
      input.placeholder = currentSearchType === 'vocab' 
        ? 'Search Japanese, reading, or meaning...'
        : 'Search grammar pattern or meaning...';
      input.focus();
      
      // Clear results
      document.getElementById('search-results').innerHTML = 
        '<div class="search-empty">Type to search ' + (currentSearchType === 'vocab' ? 'vocabulary' : 'grammar patterns') + '</div>';
    });
  });
  
  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        document.getElementById('search-results').innerHTML = 
          '<div class="search-empty">Type at least 2 characters to search</div>';
        return;
      }
      
      searchDebounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchDebounceTimer);
        performSearch(e.target.value.trim());
      }
    });
  }
  
  // Search button
  document.getElementById('search-btn')?.addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    if (query) performSearch(query);
  });
  
  // Level filter
  document.getElementById('search-level')?.addEventListener('change', () => {
    const query = document.getElementById('search-input').value.trim();
    if (query.length >= 2) performSearch(query);
  });
}

async function performSearch(query) {
  if (query.length < 2) return;
  
  showLoading();
  
  try {
    const level = document.getElementById('search-level')?.value || '';
    const endpoint = currentSearchType === 'vocab' 
      ? `/vocab/search?q=${encodeURIComponent(query)}${level ? '&level=' + level : ''}`
      : `/grammar/search?q=${encodeURIComponent(query)}${level ? '&level=' + level : ''}`;
    
    const data = await apiRequest(endpoint);
    const results = data.data || [];
    
    renderSearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    document.getElementById('search-results').innerHTML = 
      '<div class="search-empty">Search failed. Please try again.</div>';
  } finally {
    hideLoading();
  }
}

function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  
  if (results.length === 0) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }
  
  if (currentSearchType === 'vocab') {
    container.innerHTML = results.map(item => `
      <div class="search-result-item" onclick="loadVocabDetail('${item.id}')">
        <div class="search-result-header">
          <span class="search-result-word">${item.word}</span>
          <span class="level-badge ${item.jlpt_level.toLowerCase()}">${item.jlpt_level}</span>
        </div>
        <div class="search-result-reading">${item.reading}</div>
        <div class="search-result-meaning">${item.short_meaning}</div>
      </div>
    `).join('');
  } else {
    container.innerHTML = results.map(item => `
      <div class="search-result-item" onclick="loadGrammarDetail('${item.id}')">
        <div class="search-result-header">
          <span class="level-badge ${item.jlpt_level.toLowerCase()}">${item.jlpt_level}</span>
        </div>
        <div class="search-result-pattern">${item.pattern}</div>
        <div class="search-result-meaning">${item.meaning}</div>
      </div>
    `).join('');
  }
}

async function loadVocabDetail(id) {
  showLoading();
  try {
    const data = await apiRequest(`/vocab/${id}`);
    currentWord = data.data;
    
    // Switch to vocab view and display
    switchView('vocab');
    displayWord(currentWord, {});
  } catch (error) {
    console.error('Failed to load vocab detail:', error);
    showError('Failed to load word details');
  } finally {
    hideLoading();
  }
}

async function loadGrammarDetail(id) {
  showLoading();
  try {
    const data = await apiRequest(`/grammar/${id}`);
    currentGrammar = data.data;
    
    // Switch to grammar view and display
    switchView('grammar');
    displayGrammar(currentGrammar, {});
  } catch (error) {
    console.error('Failed to load grammar detail:', error);
    showError('Failed to load pattern details');
  } finally {
    hideLoading();
  }
}

// ==================== KANJI WRITING ====================

let currentKanji = null;
let currentKanjiStroke = 0;
let kanjiCanvas = null;
let kanjiCtx = null;
let isDrawing = false;
let currentStrokePath = [];
let kanjiStrokes = [];

function setupKanjiActions() {
  // Kanji selection cards
  document.querySelectorAll('.kanji-card').forEach(card => {
    card.addEventListener('click', () => {
      const kanji = card.dataset.kanji;
      startKanjiPractice(kanji);
    });
  });
  
  // Back button
  document.getElementById('kanji-back')?.addEventListener('click', () => {
    document.getElementById('kanji-practice').classList.add('hidden');
    document.getElementById('kanji-select').classList.remove('hidden');
    stopKanjiPractice();
  });
  
  // Canvas drawing
  const canvas = document.getElementById('kanji-canvas');
  if (canvas) {
    kanjiCanvas = canvas;
    kanjiCtx = canvas.getContext('2d');
    
    // Mouse events
    canvas.addEventListener('mousedown', startKanjiDraw);
    canvas.addEventListener('mousemove', drawKanji);
    canvas.addEventListener('mouseup', endKanjiDraw);
    canvas.addEventListener('mouseleave', endKanjiDraw);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startKanjiDraw(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      drawKanji(e.touches[0]);
    });
    canvas.addEventListener('touchend', endKanjiDraw);
  }
  
  // Controls
  document.getElementById('kanji-hint')?.addEventListener('click', showKanjiHint);
  document.getElementById('kanji-clear')?.addEventListener('click', clearKanjiCanvas);
  document.getElementById('kanji-check')?.addEventListener('click', checkKanjiStroke);
  document.getElementById('kanji-next-stroke')?.addEventListener('click', nextKanjiStroke);
}

function startKanjiPractice(kanji) {
  currentKanji = kanji;
  currentKanjiStroke = 0;
  kanjiStrokes = [];
  
  // Update display
  document.getElementById('practice-kanji').textContent = kanji;
  document.getElementById('kanji-meaning').textContent = 'Loading...';
  document.getElementById('kanji-readings').textContent = '';
  
  // Show practice view
  document.getElementById('kanji-select').classList.add('hidden');
  document.getElementById('kanji-practice').classList.remove('hidden');
  document.getElementById('kanji-feedback').classList.add('hidden');
  document.getElementById('kanji-next-stroke').classList.add('hidden');
  
  // Clear canvas
  clearKanjiCanvas();
  
  // Load kanji data from API (mock for now)
  loadKanjiData(kanji);
}

async function loadKanjiData(kanji) {
  // Mock data - in production, fetch from /api/kanji/:char
  const kanjiData = {
    '日': { meaning: 'Sun, day', readings: 'にち、ひ、か', strokes: 4 },
    '月': { meaning: 'Moon, month', readings: 'げつ、つき', strokes: 4 },
    '火': { meaning: 'Fire', readings: 'か、ひ', strokes: 4 },
    '水': { meaning: 'Water', readings: 'すい、みず', strokes: 4 },
    '木': { meaning: 'Tree, wood', readings: 'もく、き', strokes: 4 },
    '金': { meaning: 'Gold, metal, money', readings: 'きん、かね', strokes: 8 }
  };
  
  const data = kanjiData[kanji] || { meaning: 'Unknown', readings: '', strokes: 4 };
  
  const kanjiMeaning = document.getElementById('kanji-meaning');
  const kanjiReadings = document.getElementById('kanji-readings');
  const kanjiTotalStrokes = document.getElementById('kanji-total-strokes');
  const kanjiStrokeNum = document.getElementById('kanji-stroke-num');
  
  if (kanjiMeaning) kanjiMeaning.textContent = data.meaning;
  if (kanjiReadings) kanjiReadings.textContent = data.readings;
  if (kanjiTotalStrokes) kanjiTotalStrokes.textContent = data.strokes;
  if (kanjiStrokeNum) kanjiStrokeNum.textContent = '1';
}

function getCanvasCoordinates(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startKanjiDraw(e) {
  if (!kanjiCtx) return;
  
  isDrawing = true;
  const coords = getCanvasCoordinates(e, kanjiCanvas);
  const x = coords.x;
  const y = coords.y;
  
  currentStrokePath = [{ x, y }];
  
  kanjiCtx.beginPath();
  kanjiCtx.moveTo(x, y);
  kanjiCtx.strokeStyle = '#1a1a1a';
  kanjiCtx.lineWidth = 3;
  kanjiCtx.lineCap = 'round';
  kanjiCtx.lineJoin = 'round';
}

function drawKanji(e) {
  if (!isDrawing || !kanjiCtx) return;
  
  const coords = getCanvasCoordinates(e, kanjiCanvas);
  const x = coords.x;
  const y = coords.y;
  
  currentStrokePath.push({ x, y });
  
  kanjiCtx.lineTo(x, y);
  kanjiCtx.stroke();
}

function endKanjiDraw() {
  if (!isDrawing) return;
  
  isDrawing = false;
  if (currentStrokePath.length > 1) {
    kanjiStrokes.push([...currentStrokePath]);
  }
}

function clearKanjiCanvas() {
  if (!kanjiCtx || !kanjiCanvas) return;
  
  kanjiCtx.clearRect(0, 0, kanjiCanvas.width, kanjiCanvas.height);
  kanjiStrokes = [];
  currentStrokePath = [];
}

function showKanjiHint() {
  // Show reference outline (simplified - just show grid)
  if (!kanjiCtx || !kanjiCanvas) return;
  
  // Draw grid lines
  kanjiCtx.strokeStyle = '#e8e8e8';
  kanjiCtx.lineWidth = 1;
  
  const w = kanjiCanvas.width;
  const h = kanjiCanvas.height;
  const midX = w / 2;
  const midY = h / 2;
  
  // Vertical and horizontal center lines
  kanjiCtx.beginPath();
  kanjiCtx.moveTo(midX, 0);
  kanjiCtx.lineTo(midX, h);
  kanjiCtx.moveTo(0, midY);
  kanjiCtx.lineTo(w, midY);
  kanjiCtx.stroke();
  
  // Diagonal lines
  kanjiCtx.beginPath();
  kanjiCtx.moveTo(0, 0);
  kanjiCtx.lineTo(w, h);
  kanjiCtx.moveTo(w, 0);
  kanjiCtx.lineTo(0, h);
  kanjiCtx.stroke();
}

function checkKanjiStroke() {
  // Simplified stroke validation
  if (kanjiStrokes.length === 0) {
    showError('Please draw a stroke first');
    return;
  }
  
  // Mock accuracy calculation
  const accuracy = Math.floor(70 + Math.random() * 25); // 70-95%
  
  const feedback = document.getElementById('kanji-feedback');
  const accuracyEl = document.getElementById('kanji-accuracy');
  const messageEl = document.getElementById('kanji-message');
  
  feedback.classList.remove('hidden');
  accuracyEl.textContent = accuracy + '%';
  
  if (accuracy >= 85) {
    accuracyEl.style.color = 'var(--success)';
    messageEl.textContent = 'Excellent! Great stroke.';
    document.getElementById('kanji-next-stroke').classList.remove('hidden');
  } else if (accuracy >= 70) {
    accuracyEl.style.color = 'var(--accent)';
    messageEl.textContent = 'Good! Try to make the lines straighter.';
    document.getElementById('kanji-next-stroke').classList.remove('hidden');
  } else {
    accuracyEl.style.color = '#e74c3c';
    messageEl.textContent = 'Keep practicing! Watch the stroke direction.';
  }
}

function nextKanjiStroke() {
  currentKanjiStroke++;
  const totalStrokes = parseInt(document.getElementById('kanji-total-strokes').textContent);
  
  if (currentKanjiStroke >= totalStrokes) {
    // Completed all strokes
    document.getElementById('kanji-message').textContent = 'Kanji complete! 🎉';
    document.getElementById('kanji-next-stroke').classList.add('hidden');
    currentKanjiStroke = 0;
  } else {
    // Next stroke
    document.getElementById('kanji-stroke-num').textContent = currentKanjiStroke + 1;
    document.getElementById('kanji-feedback').classList.add('hidden');
    document.getElementById('kanji-next-stroke').classList.add('hidden');
    clearKanjiCanvas();
  }
}

function stopKanjiPractice() {
  isDrawing = false;
  currentKanji = null;
  currentKanjiStroke = 0;
  kanjiStrokes = [];
}

// ==================== READING COMPREHENSION ====================

let currentReadingLevel = 'N3';
let currentArticle = null;
let readingAnswers = {};
let readingTimerInterval = null;
let readingStartTime = null;

function setupReadingActions() {
  // Level selection
  document.querySelectorAll('.reading-level-card').forEach(card => {
    card.addEventListener('click', () => {
      const level = card.dataset.level;
      startReadingArticle(level);
    });
  });
  
  // Back button
  document.getElementById('reading-back')?.addEventListener('click', () => {
    document.getElementById('reading-article').classList.add('hidden');
    document.getElementById('reading-results').classList.add('hidden');
    document.getElementById('reading-levels').classList.remove('hidden');
    stopReadingTimer();
  });
  
  // Submit answers
  document.getElementById('reading-submit')?.addEventListener('click', submitReadingAnswers);
  
  // Next article
  document.getElementById('reading-next')?.addEventListener('click', () => {
    document.getElementById('reading-results').classList.add('hidden');
    startReadingArticle(currentReadingLevel);
  });
}

async function startReadingArticle(level) {
  currentReadingLevel = level;
  readingAnswers = {};
  
  showLoading();
  
  try {
    // Mock article - in production, fetch from /api/reading/:level
    const article = getMockArticle(level);
    currentArticle = article;
    
    // Hide levels, show article
    document.getElementById('reading-levels').classList.add('hidden');
    document.getElementById('reading-article').classList.remove('hidden');
    document.getElementById('reading-results').classList.add('hidden');
    
    // Display article
    document.getElementById('article-title').textContent = article.title;
    
    // Make text clickable for word lookup
    const textHtml = article.text.split(/(\s+)/).map(word => {
      if (word.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
        return `<span class="word" onclick="lookupWord('${word}')">${word}</span>`;
      }
      return word;
    }).join('');
    
    document.getElementById('article-text').innerHTML = textHtml;
    
    // Display questions
    const questionsContainer = document.getElementById('reading-questions');
    questionsContainer.innerHTML = article.questions.map((q, idx) => `
      <div class="reading-question">
        <div class="reading-question-text">${idx + 1}. ${q.question}</div>
        <div class="reading-options">
          ${q.options.map((opt, optIdx) => `
            <div class="reading-option" data-question="${idx}" data-option="${optIdx}" onclick="selectReadingAnswer(${idx}, ${optIdx})">
              ${String.fromCharCode(65 + optIdx)}. ${opt}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    // Start timer
    startReadingTimer();
    readingStartTime = Date.now();
    
  } catch (error) {
    console.error('Failed to load reading article:', error);
    showError('Failed to load article');
  } finally {
    hideLoading();
  }
}

function getMockArticle(level) {
  const articles = {
    'N3': {
      title: '日本の四季',
      text: '日本には四季があります。春は桜が咲きます。夏は暑くて、花火大会があります。秋は紅葉が美しいです。冬は寒くて、雪が降ります。',
      questions: [
        {
          question: '日本の春には何が咲きますか？',
          options: ['桜', '紅葉', '雪', '花火'],
          correct: 0
        },
        {
          question: '夏に何がありますか？',
          options: ['雪', '花火大会', '紅葉', '桜'],
          correct: 1
        },
        {
          question: '秋はどうですか？',
          options: ['暑い', '寒い', '美しい', '咲く'],
          correct: 2
        }
      ]
    },
    'N2': {
      title: '働き方改革',
      text: '日本政府は働き方改革を進めています。残業時間を減らし、有給休暇を取りやすくする政策を実施しています。これにより、ワークライフバランスが改善されることが期待されています。',
      questions: [
        {
          question: '働き方改革の目的は何ですか？',
          options: ['残業を増やす', 'ワークライフバランスの改善', '給料を下げる', '休暇を減らす'],
          correct: 1
        },
        {
          question: '政府は何を実施していますか？',
          options: ['残業時間を増やす政策', '有給休暇を取りにくくする政策', '残業時間を減らす政策', '給料を下げる政策'],
          correct: 2
        }
      ]
    }
  };
  
  return articles[level] || articles['N3'];
}

// Expose to window for inline handlers
window.lookupWord = function(word) {
  // In production, show popup with definition and add to SRS
  alert(`Word: ${word}\n\nClick to add to vocabulary list (feature coming soon)`);
};

window.selectReadingAnswer = function(questionIdx, optionIdx) {
  readingAnswers[questionIdx] = optionIdx;
  
  // Update UI
  document.querySelectorAll(`.reading-option[data-question="${questionIdx}"]`).forEach(opt => {
    opt.classList.remove('selected');
  });
  const selectedOption = document.querySelector(`.reading-option[data-question="${questionIdx}"][data-option="${optionIdx}"]`);
  if (selectedOption) selectedOption.classList.add('selected');
};

function startReadingTimer() {
  let seconds = 600; // 10 minutes for N3
  if (currentReadingLevel === 'N2') seconds = 900; // 15 minutes for N2
  
  updateReadingTimer(seconds);
  
  readingTimerInterval = setInterval(() => {
    seconds--;
    updateReadingTimer(seconds);
    
    if (seconds <= 0) {
      clearInterval(readingTimerInterval);
      submitReadingAnswers();
    }
  }, 1000);
}

function updateReadingTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('reading-timer').textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function stopReadingTimer() {
  if (readingTimerInterval) {
    clearInterval(readingTimerInterval);
    readingTimerInterval = null;
  }
}

function submitReadingAnswers() {
  stopReadingTimer();
  
  const questions = currentArticle.questions;
  let correct = 0;
  
  questions.forEach((q, idx) => {
    if (readingAnswers[idx] === q.correct) {
      correct++;
    }
  });
  
  const score = Math.round((correct / questions.length) * 100);
  
  // Show results
  document.getElementById('reading-article').classList.add('hidden');
  document.getElementById('reading-results').classList.remove('hidden');
  document.getElementById('reading-score').textContent = 
    `${correct}/${questions.length} (${score}%)`;
  
  // Show review
  const reviewContainer = document.getElementById('reading-review');
  reviewContainer.innerHTML = questions.map((q, idx) => {
    const userAnswer = readingAnswers[idx];
    const isCorrect = userAnswer === q.correct;
    
    return `
      <div class="reading-question ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="reading-question-text">${idx + 1}. ${q.question}</div>
        <div>Your answer: ${userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : 'Not answered'}</div>
        <div>Correct answer: ${String.fromCharCode(65 + q.correct)}</div>
      </div>
    `;
  }).join('');
}

// ==================== WEAK POINTS DRILL ====================

function setupWeakPointsActions() {
  // This will be integrated with conjugation and other drills
  // to auto-generate focused practice sessions
}

async function startWeakPointsDrill() {
  // Analyze user's performance data
  // Find lowest accuracy areas
  // Generate targeted drill
  showLoading();
  
  try {
    // Fetch user's accuracy stats from backend
    // const stats = await apiRequest('/drill/weak-points');
    
    // For now, show mock weak points
    const weakPoints = [
      { form: '受身形', accuracy: 45, count: 20 },
      { form: '使役形', accuracy: 52, count: 15 },
      { form: '意向形', accuracy: 60, count: 12 }
    ];
    
    // Could show a modal or dedicated view with weak points
    // and button to start focused drill
    
  } catch (error) {
    console.error('Failed to load weak points:', error);
  } finally {
    hideLoading();
  }
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}