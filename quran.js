/**
 * Holy Quran Interactive Reader (quran.js)
 * Powered by Quran.com API v4
 * Features:
 * - Printed Mushaf page-by-page display (Pages 1 to 604)
 * - Word-by-word synchronized audio recitation with millisecond highlight
 * - Multi-reciter audio playback (Mishari Alafasy, AbdulBaset, Minshawi, Husary, etc.)
 * - Dynamic Surah headers & Bismillah banners
 * - Instant Surah & Juz drawer navigation with live search
 * - Keyboard shortcuts (ArrowLeft, ArrowRight, Space)
 * - Reading themes (Dark, Sepia, Light) and font size scaling
 * - In-memory and localStorage page caching for 0ms page turns
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────
  // Constants & Audio Base URLs
  // ────────────────────────────────────────────────
  const AUDIO_BASE_URL = 'https://verses.quran.com/';
  const WBW_AUDIO_BASE_URL = 'https://audio.qurancdn.com/';
  const TOTAL_PAGES = 604;

  // ────────────────────────────────────────────────
  // State
  // ────────────────────────────────────────────────
  let quranMetadata = null;
  let currentPage = 1;
  let currentReciterId = 7; // Default: Mishari Rashid al-Afasy
  let currentTheme = 'theme-dark';
  let currentFontSize = 28; // in px for mushaf text
  let isPlaying = false;
  let isRepeat = false;
  let autoTurnPage = true;
  let currentVerses = [];
  let currentPlayingVerseIdx = -1;
  let activeHighlightWordEl = null;
  let syncAnimationFrame = null;

  // In-memory cache for loaded pages: { [key: `p${page}_r${reciter}`]: pageData }
  const pageCache = {};

  // ────────────────────────────────────────────────
  // DOM Elements
  // ────────────────────────────────────────────────
  const pageSheet = document.getElementById('mushaf-page-sheet');
  const versesArea = document.getElementById('mushaf-verses-area');
  const loadingEl = document.getElementById('mushaf-loading');
  const errorEl = document.getElementById('mushaf-error');
  const pageContainer = document.getElementById('mushaf-page-container');

  const headerJuzTitle = document.getElementById('header-juz-title');
  const headerSurahTitle = document.getElementById('header-surah-title');
  const footerPageNumber = document.getElementById('current-page-display');
  const metaSurahName = document.getElementById('meta-surah-name');
  const metaJuzName = document.getElementById('meta-juz-name');

  const pageInput = document.getElementById('page-input');
  const pageSlider = document.getElementById('page-slider');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const btnGoPage = document.getElementById('btn-go-page');
  const btnRetryPage = document.getElementById('btn-retry-page');

  // Audio Dock Elements
  const audioDock = document.getElementById('quran-audio-dock');
  const nativeAudio = document.getElementById('quran-native-audio');
  const btnAudioPlay = document.getElementById('btn-audio-play');
  const playBtnIcon = document.getElementById('play-btn-icon');
  const btnAudioPrev = document.getElementById('btn-audio-prev');
  const btnAudioNext = document.getElementById('btn-audio-next');
  const btnAudioStop = document.getElementById('btn-audio-stop');
  const btnAudioRepeat = document.getElementById('btn-audio-repeat');
  const autoTurnToggle = document.getElementById('auto-turn-page-toggle');
  const dockReciterName = document.getElementById('dock-reciter-name');
  const dockVerseIndicator = document.getElementById('dock-verse-indicator');
  const dockTimeDisplay = document.getElementById('dock-time-display');
  const dockProgressFill = document.getElementById('dock-progress-fill');
  const dockProgressWrapper = document.getElementById('dock-progress-wrapper');

  // Reciter Selector
  const btnToggleReciter = document.getElementById('btn-toggle-reciter');
  const reciterMenu = document.getElementById('reciter-menu');
  const activeReciterNameEl = document.getElementById('active-reciter-name');

  // Theme & Font
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const btnFontDec = document.getElementById('btn-font-dec');
  const btnFontInc = document.getElementById('btn-font-inc');

  // Bookmarks
  const btnBookmark = document.getElementById('btn-bookmark');
  const bookmarkIcon = document.getElementById('bookmark-icon');
  const toastEl = document.getElementById('quran-toast');
  const toastMsg = document.getElementById('quran-toast-msg');

  // Drawer
  const btnOpenIndex = document.getElementById('btn-open-index');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerOverlay = document.getElementById('quran-drawer-overlay');
  const drawerEl = document.getElementById('quran-drawer');
  const drawerTabs = document.querySelectorAll('.drawer-tab');
  const surahsContainer = document.getElementById('surahs-list-container');
  const juzsContainer = document.getElementById('juzs-list-container');
  const bookmarksContainer = document.getElementById('bookmarks-list-container');
  const surahSearchInput = document.getElementById('surah-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const searchBoxWrapper = document.getElementById('drawer-search-box');

  // ────────────────────────────────────────────────
  // Initialization
  // ────────────────────────────────────────────────
  async function init() {
    loadPreferences();
    setupEventListeners();
    setupAudioEngine();

    try {
      const res = await fetch('quran_metadata.json');
      if (!res.ok) throw new Error('Metadata load error');
      quranMetadata = await res.json();
      populateRecitersMenu();
      populateSurahsList();
      populateJuzsList();
      renderBookmarksList();
    } catch (err) {
      console.warn('Metadata fetch fallback:', err);
    }

    // Determine initial page
    const params = new URLSearchParams(window.location.search);
    const paramPage = parseInt(params.get('page'), 10);
    if (!isNaN(paramPage) && paramPage >= 1 && paramPage <= TOTAL_PAGES) {
      currentPage = paramPage;
    } else {
      const savedPage = parseInt(localStorage.getItem('siraj_quran_page'), 10);
      if (!isNaN(savedPage) && savedPage >= 1 && savedPage <= TOTAL_PAGES) {
        currentPage = savedPage;
      }
    }

    loadPage(currentPage);
  }

  // ────────────────────────────────────────────────
  // Load Preferences
  // ────────────────────────────────────────────────
  function loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('siraj_quran_theme') || 'theme-dark';
    setTheme(savedTheme);

    // Font size
    const savedSize = parseInt(localStorage.getItem('siraj_quran_font_size'), 10);
    if (!isNaN(savedSize) && savedSize >= 20 && savedSize <= 48) {
      currentFontSize = savedSize;
    }
    applyFontSize();

    // Reciter
    const savedReciter = parseInt(localStorage.getItem('siraj_quran_reciter'), 10);
    if (!isNaN(savedReciter)) {
      currentReciterId = savedReciter;
    }

    // Auto turn page toggle
    const savedAutoTurn = localStorage.getItem('siraj_quran_auto_turn');
    if (savedAutoTurn !== null) {
      autoTurnPage = savedAutoTurn === 'true';
      if (autoTurnToggle) autoTurnToggle.checked = autoTurnPage;
    }
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove('theme-dark', 'theme-sepia', 'theme-light');
    document.body.classList.add(theme);
    localStorage.setItem('siraj_quran_theme', theme);

    if (themeIcon) {
      if (theme === 'theme-dark') themeIcon.textContent = 'dark_mode';
      else if (theme === 'theme-sepia') themeIcon.textContent = 'menu_book';
      else themeIcon.textContent = 'light_mode';
    }
  }

  function applyFontSize() {
    if (versesArea) {
      versesArea.style.fontSize = currentFontSize + 'px';
    }
    localStorage.setItem('siraj_quran_font_size', currentFontSize);
  }

  // ────────────────────────────────────────────────
  // Page Loading & Rendering
  // ────────────────────────────────────────────────
  async function loadPage(pageNumber, preservePlayback = false) {
    if (pageNumber < 1 || pageNumber > TOTAL_PAGES) return;

    currentPage = pageNumber;
    localStorage.setItem('siraj_quran_page', currentPage);

    // Update URL param smoothly
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    window.history.replaceState(null, '', url.toString());

    // Update controls
    if (pageInput) pageInput.value = currentPage;
    if (pageSlider) pageSlider.value = currentPage;
    if (footerPageNumber) footerPageNumber.textContent = toArabicNumerals(currentPage);
    updateNavButtonsState();
    checkBookmarkState();

    if (!preservePlayback && isPlaying) {
      stopAudioPlayback();
    }

    const cacheKey = `p${currentPage}_r${currentReciterId}`;

    if (pageCache[cacheKey]) {
      renderPageData(pageCache[cacheKey]);
      prefetchAdjacentPages(currentPage);
      return;
    }

    showLoadingState();

    try {
      const apiUrl = `https://api.quran.com/api/v4/verses/by_page/${currentPage}?audio=${currentReciterId}&words=true&word_fields=text_uthmani&fields=chapter_id,verse_number,verse_key,juz_number,hizb_number`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Failed to fetch page ' + currentPage);
      const data = await res.json();

      pageCache[cacheKey] = data;
      renderPageData(data);
      prefetchAdjacentPages(currentPage);
    } catch (err) {
      console.error('Error loading Quran page:', err);
      showErrorState();
    }
  }

  // Prefetch next and previous page in the background for zero-wait flipping
  function prefetchAdjacentPages(page) {
    [page + 1, page - 1].forEach((adjPage) => {
      if (adjPage >= 1 && adjPage <= TOTAL_PAGES) {
        const key = `p${adjPage}_r${currentReciterId}`;
        if (!pageCache[key]) {
          const adjUrl = `https://api.quran.com/api/v4/verses/by_page/${adjPage}?audio=${currentReciterId}&words=true&word_fields=text_uthmani&fields=chapter_id,verse_number,verse_key,juz_number,hizb_number`;
          fetch(adjUrl)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
              if (data) pageCache[key] = data;
            })
            .catch(() => {});
        }
      }
    });
  }

  function showLoadingState() {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (errorEl) errorEl.style.display = 'none';
    if (pageContainer) pageContainer.style.opacity = '0.35';
  }

  function hideLoadingState() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (pageContainer) pageContainer.style.opacity = '1';
  }

  function showErrorState() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
    if (pageContainer) pageContainer.style.opacity = '0.2';
  }

  // ────────────────────────────────────────────────
  // Render Mushaf Page Data
  // ────────────────────────────────────────────────
  function renderPageData(data) {
    hideLoadingState();

    if (!data || !data.verses || data.verses.length === 0) {
      showErrorState();
      return;
    }

    currentVerses = data.verses;
    currentPlayingVerseIdx = -1;

    // Update Header Meta (Surah name and Juz)
    const firstVerse = currentVerses[0];
    const surahId = firstVerse.chapter_id;
    const juzNum = firstVerse.juz_number;

    let surahName = 'سورة ' + surahId;
    let juzTitle = 'الجزء ' + juzNum;

    if (quranMetadata && quranMetadata.chapters && quranMetadata.chapters[surahId - 1]) {
      surahName = 'سورة ' + quranMetadata.chapters[surahId - 1].name;
    }
    if (quranMetadata && quranMetadata.juzs && quranMetadata.juzs[juzNum - 1]) {
      juzTitle = quranMetadata.juzs[juzNum - 1].name;
    }

    if (headerSurahTitle) headerSurahTitle.textContent = surahName;
    if (headerJuzTitle) headerJuzTitle.textContent = juzTitle;
    if (metaSurahName) metaSurahName.textContent = surahName;
    if (metaJuzName) metaJuzName.textContent = juzTitle;

    // Build Page HTML
    let html = '';
    let lastRenderedChapter = null;

    currentVerses.forEach((verse, vIdx) => {
      // If verse is 1 or new chapter begins on this page: render Surah Header Banner
      if (verse.verse_number === 1 || (lastRenderedChapter !== null && verse.chapter_id !== lastRenderedChapter)) {
        const chMeta = (quranMetadata && quranMetadata.chapters) ? quranMetadata.chapters[verse.chapter_id - 1] : null;
        const chName = chMeta ? chMeta.name : ('السورة ' + verse.chapter_id);
        const chPlace = chMeta ? chMeta.revelation_place : '';
        const chCount = chMeta ? chMeta.verses_count : '';

        html += `
          <div class="quran-surah-frame-banner" data-chapter-id="${verse.chapter_id}">
            <div class="surah-banner-outer">
              <div class="surah-banner-inner">
                <span class="banner-ornament">✦</span>
                <span class="banner-title">سُورَةُ ${chName}</span>
                <span class="banner-ornament">✦</span>
              </div>
              <div class="surah-banner-meta">
                <span>${chPlace}</span>
                <span class="banner-meta-dot">•</span>
                <span>${toArabicNumerals(chCount)} آيات</span>
              </div>
            </div>
          </div>
        `;

        // Render Bismillah (except Surah 1 Al-Fatihah which has Bismillah as verse 1, and Surah 9 At-Tawbah)
        if (verse.chapter_id !== 1 && verse.chapter_id !== 9) {
          html += `
            <div class="quran-bismillah-calligraphy" aria-label="بسم الله الرحمن الرحيم">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
          `;
        }
      }

      lastRenderedChapter = verse.chapter_id;

      // Verse wrapper
      html += `<span class="quran-verse-block" data-verse-key="${verse.verse_key}" data-verse-idx="${vIdx}">`;

      if (verse.words && Array.isArray(verse.words)) {
        verse.words.forEach((word) => {
          if (word.char_type_name === 'end') {
            // Verse End Sign
            html += `
              <span class="quran-verse-end" data-verse-key="${verse.verse_key}" data-verse-idx="${vIdx}" title="الآية ${verse.verse_number}">
                <span class="verse-end-circle">
                  <span class="verse-end-num">${toArabicNumerals(verse.verse_number)}</span>
                </span>
              </span>
            `;
          } else {
            // Word Token
            const wordText = word.text_uthmani || word.text || '';
            const wbwAudio = word.audio_url || '';
            html += `
              <span class="quran-word" 
                    data-verse-idx="${vIdx}" 
                    data-verse-key="${verse.verse_key}" 
                    data-pos="${word.position}" 
                    data-word-id="${word.id}" 
                    data-audio-wbw="${wbwAudio}" 
                    title="${word.translation ? word.translation.text : ''}">
                ${wordText}
              </span>
            `;
          }
        });
      }

      html += `</span> `; // End of verse block
    });

    if (versesArea) {
      versesArea.innerHTML = html;
      applyFontSize();
      attachWordClickListeners();
    }

    // Scroll to top of page canvas smoothly
    const mainCanvas = document.getElementById('quran-main-canvas');
    if (mainCanvas) mainCanvas.scrollTop = 0;
  }

  // ────────────────────────────────────────────────
  // Word Click Interaction
  // ────────────────────────────────────────────────
  function attachWordClickListeners() {
    if (!versesArea) return;
    const words = versesArea.querySelectorAll('.quran-word');
    words.forEach((w) => {
      w.addEventListener('click', (e) => {
        e.stopPropagation();
        const vIdx = parseInt(w.getAttribute('data-verse-idx'), 10);
        const pos = parseInt(w.getAttribute('data-pos'), 10);
        handleWordClick(vIdx, pos);
      });
    });

    const verseEnds = versesArea.querySelectorAll('.quran-verse-end');
    verseEnds.forEach((ve) => {
      ve.addEventListener('click', (e) => {
        e.stopPropagation();
        const vIdx = parseInt(ve.getAttribute('data-verse-idx'), 10);
        playVerseByIndex(vIdx);
      });
    });
  }

  function handleWordClick(verseIdx, wordPosition) {
    if (isNaN(verseIdx) || !currentVerses[verseIdx]) return;

    // If audio is playing this verse, seek directly to this word's start time!
    if (isPlaying && currentPlayingVerseIdx === verseIdx && nativeAudio && currentVerses[verseIdx].audio) {
      const segments = currentVerses[verseIdx].audio.segments || [];
      const match = segments.find((s) => s[1] === wordPosition);
      if (match) {
        nativeAudio.currentTime = match[2] / 1000;
        return;
      }
    }

    // Otherwise start playing this verse
    playVerseByIndex(verseIdx, wordPosition);
  }

  // ────────────────────────────────────────────────
  // Audio Engine & Synchronization
  // ────────────────────────────────────────────────
  function setupAudioEngine() {
    if (!nativeAudio) return;

    nativeAudio.addEventListener('play', () => {
      isPlaying = true;
      updatePlayButtonUI(true);
      startWordSyncLoop();
    });

    nativeAudio.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayButtonUI(false);
      stopWordSyncLoop();
    });

    nativeAudio.addEventListener('timeupdate', onAudioTimeUpdate);

    nativeAudio.addEventListener('ended', onAudioEnded);

    nativeAudio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      isPlaying = false;
      updatePlayButtonUI(false);
      stopWordSyncLoop();
      showToast('تعذر تشغيل الصوت من الخادم');
    });

    // Progress bar scrubber click
    if (dockProgressWrapper) {
      dockProgressWrapper.addEventListener('click', (e) => {
        if (!nativeAudio || !nativeAudio.duration) return;
        const rect = dockProgressWrapper.getBoundingClientRect();
        // In RTL, left is 100% and right is 0%
        const clickX = e.clientX - rect.left;
        const ratio = 1 - (clickX / rect.width);
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        nativeAudio.currentTime = clampedRatio * nativeAudio.duration;
      });
    }
  }

  function playVerseByIndex(vIdx, targetWordPos = null) {
    if (!currentVerses || vIdx < 0 || vIdx >= currentVerses.length) {
      stopAudioPlayback();
      return;
    }

    currentPlayingVerseIdx = vIdx;
    const verse = currentVerses[vIdx];

    if (!verse || !verse.audio || !verse.audio.url) {
      console.warn('No audio available for verse:', verse);
      // Advance to next verse if available
      if (vIdx + 1 < currentVerses.length) {
        playVerseByIndex(vIdx + 1);
      }
      return;
    }

    const fullAudioUrl = AUDIO_BASE_URL + verse.audio.url;
    nativeAudio.src = fullAudioUrl;
    nativeAudio.load();

    // Update Dock Meta
    updateDockMetadata(verse);

    // Play
    const playPromise = nativeAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (targetWordPos !== null && verse.audio.segments) {
            const match = verse.audio.segments.find((s) => s[1] === targetWordPos);
            if (match) {
              nativeAudio.currentTime = match[2] / 1000;
            }
          }
        })
        .catch((err) => {
          console.warn('Playback interrupted or autoplay blocked:', err);
        });
    }

    highlightActiveVerseBlock(vIdx);
  }

  function toggleAudioPlay() {
    if (!currentVerses || currentVerses.length === 0) return;

    if (isPlaying) {
      nativeAudio.pause();
    } else {
      if (currentPlayingVerseIdx >= 0 && currentPlayingVerseIdx < currentVerses.length && nativeAudio.src) {
        nativeAudio.play().catch(console.warn);
      } else {
        // Start from first verse on current page
        playVerseByIndex(0);
      }
    }
  }

  function stopAudioPlayback() {
    if (nativeAudio) {
      nativeAudio.pause();
      nativeAudio.currentTime = 0;
    }
    isPlaying = false;
    currentPlayingVerseIdx = -1;
    updatePlayButtonUI(false);
    stopWordSyncLoop();
    clearWordHighlight();
    clearVerseHighlight();

    if (dockProgressFill) dockProgressFill.style.width = '0%';
    if (dockTimeDisplay) dockTimeDisplay.textContent = '00:00 / 00:00';
  }

  function playNextVerse() {
    if (currentPlayingVerseIdx + 1 < currentVerses.length) {
      playVerseByIndex(currentPlayingVerseIdx + 1);
    } else if (autoTurnPage && currentPage < TOTAL_PAGES) {
      // Next page
      loadPage(currentPage + 1).then(() => {
        playVerseByIndex(0);
      });
    } else {
      stopAudioPlayback();
    }
  }

  function playPrevVerse() {
    if (currentPlayingVerseIdx > 0) {
      playVerseByIndex(currentPlayingVerseIdx - 1);
    } else if (currentPage > 1) {
      loadPage(currentPage - 1).then(() => {
        if (currentVerses.length > 0) {
          playVerseByIndex(currentVerses.length - 1);
        }
      });
    }
  }

  function onAudioEnded() {
    if (isRepeat && currentPlayingVerseIdx >= 0) {
      // Repeat same verse
      playVerseByIndex(currentPlayingVerseIdx);
      return;
    }

    // Advance to next verse
    playNextVerse();
  }

  function onAudioTimeUpdate() {
    if (!nativeAudio || !nativeAudio.duration) return;

    // Progress bar
    const percent = (nativeAudio.currentTime / nativeAudio.duration) * 100;
    if (dockProgressFill) dockProgressFill.style.width = `${percent}%`;

    // Time display
    const currentSec = Math.floor(nativeAudio.currentTime);
    const durationSec = Math.floor(nativeAudio.duration);
    if (dockTimeDisplay) {
      dockTimeDisplay.textContent = `${formatTime(currentSec)} / ${formatTime(durationSec)}`;
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ────────────────────────────────────────────────
  // Real-time Millisecond Word Highlighting
  // ────────────────────────────────────────────────
  function startWordSyncLoop() {
    stopWordSyncLoop();

    function step() {
      if (!isPlaying || !nativeAudio || currentPlayingVerseIdx < 0) return;

      const verse = currentVerses[currentPlayingVerseIdx];
      if (verse && verse.audio && Array.isArray(verse.audio.segments)) {
        const ms = nativeAudio.currentTime * 1000;
        const segments = verse.audio.segments;

        // segments format: [word_idx, position, start_ms, end_ms]
        let foundPosition = null;
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (ms >= seg[2] && ms <= seg[3]) {
            foundPosition = seg[1];
            break;
          }
        }

        if (foundPosition !== null) {
          applyWordHighlight(currentPlayingVerseIdx, foundPosition);
        }
      }

      syncAnimationFrame = requestAnimationFrame(step);
    }

    syncAnimationFrame = requestAnimationFrame(step);
  }

  function stopWordSyncLoop() {
    if (syncAnimationFrame) {
      cancelAnimationFrame(syncAnimationFrame);
      syncAnimationFrame = null;
    }
  }

  function applyWordHighlight(vIdx, pos) {
    if (activeHighlightWordEl && activeHighlightWordEl.getAttribute('data-pos') === String(pos) && activeHighlightWordEl.getAttribute('data-verse-idx') === String(vIdx)) {
      return; // Already highlighted
    }

    clearWordHighlight();

    if (!versesArea) return;
    const targetWord = versesArea.querySelector(`.quran-word[data-verse-idx="${vIdx}"][data-pos="${pos}"]`);
    if (targetWord) {
      targetWord.classList.add('word-highlighted');
      activeHighlightWordEl = targetWord;

      // Ensure word is in view if reader is scrollable
      scrollWordIntoViewIfNeeded(targetWord);
    }
  }

  function clearWordHighlight() {
    if (activeHighlightWordEl) {
      activeHighlightWordEl.classList.remove('word-highlighted');
      activeHighlightWordEl = null;
    }
  }

  function highlightActiveVerseBlock(vIdx) {
    clearVerseHighlight();
    if (!versesArea) return;
    const block = versesArea.querySelector(`.quran-verse-block[data-verse-idx="${vIdx}"]`);
    if (block) {
      block.classList.add('active-playing-verse');
    }
  }

  function clearVerseHighlight() {
    if (!versesArea) return;
    const prev = versesArea.querySelectorAll('.active-playing-verse');
    prev.forEach((el) => el.classList.remove('active-playing-verse'));
  }

  function scrollWordIntoViewIfNeeded(el) {
    if (!el) return;
    const canvas = document.getElementById('quran-main-canvas');
    if (!canvas) return;

    const elRect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    if (elRect.top < canvasRect.top + 60 || elRect.bottom > canvasRect.bottom - 120) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function updatePlayButtonUI(playing) {
    if (!playBtnIcon) return;
    playBtnIcon.textContent = playing ? 'pause' : 'play_arrow';
    btnAudioPlay.setAttribute('aria-label', playing ? 'إيقاف مؤقت' : 'تشغيل التلاوة');
  }

  function updateDockMetadata(verse) {
    if (!dockVerseIndicator) return;
    const surahId = verse.chapter_id;
    let surahName = 'سورة ' + surahId;
    if (quranMetadata && quranMetadata.chapters && quranMetadata.chapters[surahId - 1]) {
      surahName = 'سورة ' + quranMetadata.chapters[surahId - 1].name;
    }

    dockVerseIndicator.textContent = `الآية ${toArabicNumerals(verse.verse_number)} من ${surahName}`;

    // Active reciter name in dock
    if (quranMetadata && quranMetadata.reciters) {
      const rec = quranMetadata.reciters.find((r) => r.id === currentReciterId);
      if (rec && dockReciterName) {
        dockReciterName.textContent = rec.name;
      }
    }
  }

  // ────────────────────────────────────────────────
  // Reciter Selection
  // ────────────────────────────────────────────────
  function populateRecitersMenu() {
    if (!reciterMenu || !quranMetadata || !quranMetadata.reciters) return;

    reciterMenu.innerHTML = '';
    quranMetadata.reciters.forEach((rec) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'reciter-menu-item' + (rec.id === currentReciterId ? ' active' : '');
      item.innerHTML = `
        <span class="material-symbols-rounded item-check">${rec.id === currentReciterId ? 'check' : 'person'}</span>
        <div class="reciter-info">
          <span class="reciter-title">${rec.name}</span>
          <span class="reciter-sub">${rec.sub}</span>
        </div>
      `;
      item.addEventListener('click', () => {
        selectReciter(rec.id, rec.name);
      });
      reciterMenu.appendChild(item);
    });

    const activeRec = quranMetadata.reciters.find((r) => r.id === currentReciterId);
    if (activeRec && activeReciterNameEl) {
      activeReciterNameEl.textContent = activeRec.name.split(' ')[0] + ' ' + (activeRec.name.split(' ')[1] || '');
    }
  }

  function selectReciter(reciterId, reciterName) {
    currentReciterId = reciterId;
    localStorage.setItem('siraj_quran_reciter', currentReciterId);

    if (activeReciterNameEl) {
      activeReciterNameEl.textContent = reciterName.split(' ')[0] + ' ' + (reciterName.split(' ')[1] || '');
    }
    if (dockReciterName) {
      dockReciterName.textContent = reciterName;
    }

    populateRecitersMenu();
    closeReciterMenu();

    // Reload current page with new reciter audio
    const wasPlaying = isPlaying;
    const prevVerseIdx = currentPlayingVerseIdx;
    stopAudioPlayback();

    loadPage(currentPage).then(() => {
      if (wasPlaying && prevVerseIdx >= 0) {
        playVerseByIndex(prevVerseIdx);
      }
    });

    showToast(`تم اختيار القارئ: ${reciterName}`);
  }

  function toggleReciterMenu() {
    if (!reciterMenu) return;
    const isExpanded = btnToggleReciter.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeReciterMenu();
    } else {
      reciterMenu.classList.add('open');
      btnToggleReciter.setAttribute('aria-expanded', 'true');
    }
  }

  function closeReciterMenu() {
    if (reciterMenu) {
      reciterMenu.classList.remove('open');
      btnToggleReciter.setAttribute('aria-expanded', 'false');
    }
  }

  // ────────────────────────────────────────────────
  // Index Drawer (Surahs, Juzs, Bookmarks)
  // ────────────────────────────────────────────────
  function populateSurahsList() {
    if (!surahsContainer || !quranMetadata || !quranMetadata.chapters) return;

    let html = '';
    quranMetadata.chapters.forEach((surah) => {
      html += `
        <div class="drawer-item surah-item" data-page="${surah.start_page}" data-name="${surah.name}" data-number="${surah.id}">
          <div class="item-number-badge">${surah.id}</div>
          <div class="item-details">
            <div class="item-title-row">
              <span class="item-name">سُورَةُ ${surah.name}</span>
              <span class="item-badge ${surah.revelation_place === 'مكية' ? 'badge-makki' : 'badge-madani'}">${surah.revelation_place}</span>
            </div>
            <div class="item-sub-row">
              <span>${toArabicNumerals(surah.verses_count)} آيات</span>
              <span class="item-dot">•</span>
              <span>صفحة ${toArabicNumerals(surah.start_page)}</span>
            </div>
          </div>
          <span class="material-symbols-rounded item-arrow">chevron_left</span>
        </div>
      `;
    });

    surahsContainer.innerHTML = html;

    // Attach click
    const items = surahsContainer.querySelectorAll('.surah-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const targetPage = parseInt(item.getAttribute('data-page'), 10);
        closeIndexDrawer();
        loadPage(targetPage);
      });
    });
  }

  function populateJuzsList() {
    if (!juzsContainer || !quranMetadata || !quranMetadata.juzs) return;

    let html = '';
    quranMetadata.juzs.forEach((juz) => {
      html += `
        <div class="drawer-item juz-item" data-page="${juz.start_page}">
          <div class="item-number-badge juz-badge">${juz.juz_number}</div>
          <div class="item-details">
            <span class="item-name">${juz.name}</span>
            <div class="item-sub-row">
              <span>يبدأ من صفحة ${toArabicNumerals(juz.start_page)}</span>
            </div>
          </div>
          <span class="material-symbols-rounded item-arrow">chevron_left</span>
        </div>
      `;
    });

    juzsContainer.innerHTML = html;

    // Attach click
    const items = juzsContainer.querySelectorAll('.juz-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const targetPage = parseInt(item.getAttribute('data-page'), 10);
        closeIndexDrawer();
        loadPage(targetPage);
      });
    });
  }

  function filterSurahs(query) {
    if (!surahsContainer) return;
    const cleanQuery = query.trim().replace(/^سورة\s*/i, '');
    const items = surahsContainer.querySelectorAll('.surah-item');

    let visibleCount = 0;
    items.forEach((item) => {
      const name = item.getAttribute('data-name') || '';
      const num = item.getAttribute('data-number') || '';
      if (!cleanQuery || name.includes(cleanQuery) || num === cleanQuery) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (btnClearSearch) {
      btnClearSearch.style.display = query.length > 0 ? 'block' : 'none';
    }
  }

  function openIndexDrawer() {
    if (!drawerEl || !drawerOverlay) return;
    drawerEl.classList.add('open');
    drawerOverlay.classList.add('open');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    if (surahSearchInput) surahSearchInput.focus();
  }

  function closeIndexDrawer() {
    if (!drawerEl || !drawerOverlay) return;
    drawerEl.classList.remove('open');
    drawerOverlay.classList.remove('open');
    drawerOverlay.setAttribute('aria-hidden', 'true');
  }

  // ────────────────────────────────────────────────
  // Bookmarks Management
  // ────────────────────────────────────────────────
  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem('siraj_quran_bookmarks')) || [];
    } catch {
      return [];
    }
  }

  function saveBookmarks(arr) {
    localStorage.setItem('siraj_quran_bookmarks', JSON.stringify(arr));
    checkBookmarkState();
    renderBookmarksList();
  }

  function toggleCurrentPageBookmark() {
    const bookmarks = getBookmarks();
    const existingIdx = bookmarks.findIndex((b) => b.page === currentPage);

    if (existingIdx >= 0) {
      bookmarks.splice(existingIdx, 1);
      saveBookmarks(bookmarks);
      showToast(`تمت إزالة صفحة ${currentPage} من العلامات`);
    } else {
      // Find surah name for this page
      let surahName = 'القرآن الكريم';
      if (metaSurahName) surahName = metaSurahName.textContent;

      bookmarks.unshift({
        page: currentPage,
        surah: surahName,
        date: new Date().toLocaleDateString('ar-SA')
      });
      saveBookmarks(bookmarks);
      showToast(`تم حفظ صفحة ${currentPage} (${surahName}) في العلامات`);
    }
  }

  function checkBookmarkState() {
    if (!bookmarkIcon) return;
    const bookmarks = getBookmarks();
    const isBookmarked = bookmarks.some((b) => b.page === currentPage);
    if (isBookmarked) {
      bookmarkIcon.textContent = 'bookmark';
      btnBookmark.classList.add('bookmarked');
    } else {
      bookmarkIcon.textContent = 'bookmark_border';
      btnBookmark.classList.remove('bookmarked');
    }
  }

  function renderBookmarksList() {
    if (!bookmarksContainer) return;
    const bookmarks = getBookmarks();

    if (bookmarks.length === 0) {
      bookmarksContainer.innerHTML = `
        <div class="empty-bookmarks">
          <span class="material-symbols-rounded">bookmark_border</span>
          <p>لا توجد علامات مرجعية محفوظة بعد.</p>
          <span class="empty-sub">اضغط على زر العلامة أثناء القراءة لحفظ الصفحة للرجوع إليها لاحقاً.</span>
        </div>
      `;
      return;
    }

    let html = '';
    bookmarks.forEach((b, idx) => {
      html += `
        <div class="drawer-item bookmark-item" data-page="${b.page}">
          <span class="material-symbols-rounded bookmark-ribbon">bookmark</span>
          <div class="item-details">
            <span class="item-name">صفحة ${toArabicNumerals(b.page)} - ${b.surah}</span>
            <span class="item-sub-row">${b.date || ''}</span>
          </div>
          <button type="button" class="bookmark-delete-btn" data-delete-idx="${idx}" title="حذف العلامة" aria-label="حذف العلامة">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      `;
    });

    bookmarksContainer.innerHTML = html;

    // Attach clicks
    const items = bookmarksContainer.querySelectorAll('.bookmark-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-delete-btn')) return;
        const targetPage = parseInt(item.getAttribute('data-page'), 10);
        closeIndexDrawer();
        loadPage(targetPage);
      });
    });

    const delBtns = bookmarksContainer.querySelectorAll('.bookmark-delete-btn');
    delBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const delIdx = parseInt(btn.getAttribute('data-delete-idx'), 10);
        const bMarks = getBookmarks();
        bMarks.splice(delIdx, 1);
        saveBookmarks(bMarks);
      });
    });
  }

  // ────────────────────────────────────────────────
  // Toast Helper
  // ────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // ────────────────────────────────────────────────
  // Arabic Numerals Helper
  // ────────────────────────────────────────────────
  function toArabicNumerals(num) {
    if (num === null || num === undefined) return '';
    const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => digits[+w]);
  }

  function updateNavButtonsState() {
    if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
    if (btnNextPage) btnNextPage.disabled = currentPage >= TOTAL_PAGES;
  }

  // ────────────────────────────────────────────────
  // Event Listeners
  // ────────────────────────────────────────────────
  function setupEventListeners() {
    // Page toolbar buttons
    if (btnPrevPage) {
      btnPrevPage.addEventListener('click', () => {
        if (currentPage > 1) loadPage(currentPage - 1);
      });
    }

    if (btnNextPage) {
      btnNextPage.addEventListener('click', () => {
        if (currentPage < TOTAL_PAGES) loadPage(currentPage + 1);
      });
    }

    if (btnGoPage && pageInput) {
      btnGoPage.addEventListener('click', () => {
        const val = parseInt(pageInput.value, 10);
        if (!isNaN(val) && val >= 1 && val <= TOTAL_PAGES) {
          loadPage(val);
        } else {
          pageInput.value = currentPage;
        }
      });

      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          btnGoPage.click();
        }
      });
    }

    if (pageSlider) {
      pageSlider.addEventListener('input', () => {
        if (pageInput) pageInput.value = pageSlider.value;
      });
      pageSlider.addEventListener('change', () => {
        const val = parseInt(pageSlider.value, 10);
        if (!isNaN(val)) loadPage(val);
      });
    }

    if (btnRetryPage) {
      btnRetryPage.addEventListener('click', () => {
        loadPage(currentPage);
      });
    }

    // Audio dock controls
    if (btnAudioPlay) btnAudioPlay.addEventListener('click', toggleAudioPlay);
    if (btnAudioPrev) btnAudioPrev.addEventListener('click', playPrevVerse);
    if (btnAudioNext) btnAudioNext.addEventListener('click', playNextVerse);
    if (btnAudioStop) btnAudioStop.addEventListener('click', stopAudioPlayback);

    if (btnAudioRepeat) {
      btnAudioRepeat.addEventListener('click', () => {
        isRepeat = !isRepeat;
        btnAudioRepeat.classList.toggle('active', isRepeat);
        btnAudioRepeat.setAttribute('aria-pressed', isRepeat ? 'true' : 'false');
        showToast(isRepeat ? 'تم تفعيل تكرار الآية' : 'تم إلغاء تكرار الآية');
      });
    }

    if (autoTurnToggle) {
      autoTurnToggle.addEventListener('change', () => {
        autoTurnPage = autoTurnToggle.checked;
        localStorage.setItem('siraj_quran_auto_turn', autoTurnPage);
      });
    }

    // Reciter menu
    if (btnToggleReciter) {
      btnToggleReciter.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleReciterMenu();
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.reciter-dropdown-wrapper')) {
        closeReciterMenu();
      }
    });

    // Theme toggle
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => {
        if (currentTheme === 'theme-dark') setTheme('theme-sepia');
        else if (currentTheme === 'theme-sepia') setTheme('theme-light');
        else setTheme('theme-dark');
      });
    }

    // Font size
    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        if (currentFontSize > 20) {
          currentFontSize -= 2;
          applyFontSize();
        }
      });
    }

    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        if (currentFontSize < 48) {
          currentFontSize += 2;
          applyFontSize();
        }
      });
    }

    // Bookmark
    if (btnBookmark) {
      btnBookmark.addEventListener('click', toggleCurrentPageBookmark);
    }

    // Drawer Open / Close
    if (btnOpenIndex) btnOpenIndex.addEventListener('click', openIndexDrawer);
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeIndexDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeIndexDrawer);

    // Drawer Tabs
    drawerTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        drawerTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.drawer-panel').forEach((p) => p.classList.remove('active'));
        const panel = document.getElementById(`panel-${tabType}`);
        if (panel) panel.classList.add('active');

        if (searchBoxWrapper) {
          searchBoxWrapper.style.display = (tabType === 'surahs') ? 'flex' : 'none';
        }
      });
    });

    // Surahs Search
    if (surahSearchInput) {
      surahSearchInput.addEventListener('input', () => {
        filterSurahs(surahSearchInput.value);
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (surahSearchInput) {
          surahSearchInput.value = '';
          filterSurahs('');
          surahSearchInput.focus();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Ignore if typing inside input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        // In Arabic RTL, left arrow moves to next page
        if (currentPage < TOTAL_PAGES) loadPage(currentPage + 1);
      } else if (e.key === 'ArrowRight') {
        // Right arrow moves to previous page
        if (currentPage > 1) loadPage(currentPage - 1);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleAudioPlay();
      } else if (e.key === 'Escape') {
        closeIndexDrawer();
        closeReciterMenu();
      }
    });
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
