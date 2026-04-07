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
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showMainScreen();
  } else {
    showAuthScreen();
  }
  
  setupAuthTabs();
  setupForms();
  setupNavigation();
  setupActions();
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
  
  const examplesContainer = document.getElementById('word-examples');
  examplesContainer.innerHTML = '';
  
  if (word.example_sentences && word.example_sentences.length > 0) {
    word.example_sentences.forEach(example => {
      const item = document.createElement('div');
      item.className = 'example-item';
      item.innerHTML = `
        <div class="example-jp">${example}</div>
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
    document.getElementById('grammar-pattern').textContent = 'Error loading pattern';
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
  
  // Examples
  const examplesContainer = document.getElementById('grammar-examples');
  examplesContainer.innerHTML = '';
  
  if (pattern.usage_examples && pattern.usage_examples.length > 0) {
    pattern.usage_examples.forEach(example => {
      const item = document.createElement('div');
      item.className = 'example-item';
      item.innerHTML = `
        <div class="example-jp">${example.japanese}</div>
        <div class="example-reading">${example.reading}</div>
        <div class="example-meaning">${example.meaning}</div>
        <div class="example-context">${example.context}</div>
        ${example.alternative ? `<div class="example-alt">Alt: ${example.alternative}</div>` : ''}
      `;
      
      // Toggle reading on click
      item.addEventListener('click', () => {
        item.classList.toggle('show-reading');
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
  
  document.getElementById('vocab-learned').textContent = progress.words_learned || 0;
  document.getElementById('grammar-learned').textContent = progress.grammar_learned || 0;
  document.getElementById('streak-days').textContent = progress.streak_days || 0;
  document.getElementById('current-level').textContent = progress.current_level || 'N5';
  
  // Level progress bars - calculate from current indices vs totals
  const container = document.getElementById('level-progress-bars');
  container.innerHTML = '';
  
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const currentLevel = progress.current_level || 'N5';
  const vocabIndex = progress.current_vocab_index || 0;
  const totalWords = progress.total_words_in_level || 50;
  
  // Simple progress: N5 = current position, others = 0 or 100 if passed
  const progressPerLevel = {};
  levels.forEach(level => {
    if (level === currentLevel) {
      progressPerLevel[level] = Math.round((vocabIndex / totalWords) * 100);
    } else if (levels.indexOf(level) < levels.indexOf(currentLevel)) {
      progressPerLevel[level] = 100; // Completed
    } else {
      progressPerLevel[level] = 0; // Not started
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
  showAuthScreen();
}

function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}