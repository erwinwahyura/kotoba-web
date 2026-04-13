# Kotoba Web Testing Plan & Bug Report

**Date**: 2026-04-13  
**Tester**: Messenja 🎋  
**App Version**: Current deployed version

---

## 🐛 Bugs Found

### 1. **Critical: Missing "Already Know" Button for Vocabulary**
- **Location**: `app.js` line ~380-450
- **Issue**: The "Already Know" button handler calls `/vocab/:id/skip` with `{status: 'known'}` but this doesn't increment the SRS review properly
- **Expected**: Should mark word as mastered (quality 5) AND advance to next word
- **Actual**: Only advances index, doesn't properly mark as learned in SRS
- **Fix**: Change to call SRS init + review with quality 5

### 2. **Missing "Previous Pattern" Navigation**
- **Location**: Grammar view, `prev-grammar-btn` handler
- **Issue**: Currently shows `alert('Previous pattern - coming soon!')`
- **Expected**: Navigate to previous grammar pattern in current level
- **Fix**: Implement `GET /grammar/previous` endpoint or track index locally

### 3. **Conjugation Drill UI Missing**
- **Issue**: Backend has conjugation endpoints (`/api/conjugation/*`) but frontend has no UI
- **Expected**: Tab or section for conjugation practice
- **Priority**: HIGH - This is core to Hiru's 形 (form) retention struggle

### 4. **Kanji Writing UI Missing**
- **Issue**: Backend models exist (`internal/models/kanji.go`) but no frontend
- **Expected**: Drawing canvas for stroke order practice
- **Priority**: MEDIUM - Listed as "IN PROGRESS" in HEARTBEAT.md

### 5. **TTS Audio Not Auto-Playing**
- **Issue**: Audio requires manual click, no auto-play on card reveal
- **Expected**: Optional auto-play when showing answer in SRS review
- **Fix**: Add setting for auto-play TTS

### 6. **No Dark Mode Toggle**
- **Issue**: User requested forced light mode, but no toggle exists
- **Expected**: Toggle between light/minimalist and dark mode
- **Priority**: LOW - User prefers light mode

### 7. **Progress Bar Shows Vocab Only**
- **Issue**: Progress bars only show vocabulary progress, not grammar
- **Expected**: Separate or combined progress for both vocab and grammar
- **Fix**: Add grammar progress tracking to progress view

### 8. **No Search Function**
- **Issue**: Can't search vocabulary or grammar patterns
- **Expected**: Search bar to find specific words/patterns
- **Priority**: MEDIUM - Useful for review

### 9. **Missing "Mark as Mastered" in SRS Review**
- **Issue**: Quality buttons only go up to 3 (Easy)
- **Expected**: Quality 4 or 5 for "mastered" status
- **Fix**: Add "Mastered" button or use quality 3 as mastered threshold

### 10. **No Offline Support**
- **Issue**: Service worker exists but no offline data caching
- **Expected**: Cache daily words/grammar for offline study
- **Priority**: MEDIUM - PWA should work offline

---

## ✨ Missing Features (Priority Order)

### HIGH PRIORITY (Fix Hiru's Learning Blockers)

1. **Conjugation Drill UI** ⭐⭐⭐
   - Tab: 「活」Conjugation
   - Forms: て形, ない形, た形, 丁寧形, 可能形, 受身形, 使役形, 意向形
   - Visual feedback for correct/incorrect
   - Streak counter
   - Backend already ready: `/api/conjugation/start`, `/answer`, `/progress`

2. **"Already Know" Fix** ⭐⭐⭐
   - Properly initialize SRS with quality 5
   - Actually mark as learned, not just skip

3. **Grammar Progress Tracking** ⭐⭐
   - Show grammar learned count in progress view
   - Separate progress bar for grammar patterns

### MEDIUM PRIORITY

4. **Search Function** 🔍
   - Search vocabulary by word/reading/meaning
   - Search grammar by pattern/meaning
   - Quick jump to specific content

5. **Kanji Writing Canvas** ✍️
   - Drawing area with touch/mouse support
   - Stroke order validation
   - Compare with reference

6. **Offline Mode** 📴
   - Cache daily content
   - Queue actions for when online

### LOW PRIORITY

7. **Dark Mode Toggle** 🌙
8. **Audio Auto-play Setting** 🔊
9. **Previous Pattern Navigation** ⬅️

---

## 🎯 Immediate Action Plan

### Phase 1: Fix Critical Bugs (Today)
- [ ] Fix "Already Know" button to properly mark SRS mastered
- [ ] Add grammar progress to progress view

### Phase 2: Add Conjugation UI (This Week)
- [ ] Create new tab 「活」Conjugation
- [ ] Build drill interface
- [ ] Connect to backend endpoints
- [ ] Test with Hiru

### Phase 3: Polish (Next)
- [ ] Search function
- [ ] Kanji writing canvas
- [ ] Offline support

---

## 📊 Backend Status Check

All backend endpoints verified in `main.go`:
- ✅ Auth: `/api/auth/*`
- ✅ Vocab: `/api/vocab/*`
- ✅ Grammar: `/api/grammar/*`
- ✅ Progress: `/api/progress/*`
- ✅ SRS: `/api/srs/*`
- ✅ Conjugation: `/api/conjugation/*` (READY but unused)
- ✅ TTS: `/api/tts/*`
- ✅ JLPT Tests: `/api/jlpt/*`
- ✅ Placement: `/api/placement-test/*`

**Missing Frontend UI for**: Conjugation, Kanji Writing
