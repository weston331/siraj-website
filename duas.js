/**
 * Duas Library - Interactive Prayer/Supplication Browser
 * Loads prayers_data.json and renders a filterable, paginated, searchable gallery.
 * Clicking any prayer navigates to its dedicated page (prayer.html?id=...).
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────
  // Config
  // ────────────────────────────────────────────────
  const CARDS_PER_PAGE = 9;

  // Icons per category name
  const CATEGORY_ICONS = {
    'أدعية الأيام': 'calendar_month',
    'الأدعية المشهورة': 'auto_stories',
    'مناجاة خمسة عشر': 'favorite',
    'تعقيبات الصلاة': 'self_improvement',
    'أدعية ساعات اليوم': 'schedule',
    'فهرس أعمال أشهر السنة': 'event_note',
    'الملحق الأول': 'book_2',
    'الملحق الثاني': 'book_2',
    'حكم نهج البلاغة': 'menu_book',
    'default': 'mosque'
  };

  // ────────────────────────────────────────────────
  // State
  // ────────────────────────────────────────────────
  let allCategories = [];
  let filteredPrayers = [];
  let currentCategory = 'all';
  let currentPage = 1;
  let searchQuery = '';

  // ────────────────────────────────────────────────
  // DOM refs
  // ────────────────────────────────────────────────
  const tabsEl = document.getElementById('duas-tabs');
  const gridEl = document.getElementById('duas-grid');
  const paginationEl = document.getElementById('duas-pagination');
  const searchEl = document.getElementById('duas-search');
  const clearBtn = document.getElementById('duas-search-clear');
  const countLabel = document.getElementById('duas-count-label');

  // ────────────────────────────────────────────────
  // Load Data
  // ────────────────────────────────────────────────
  function loadData() {
    if (window.PRAYERS_DATA && Array.isArray(window.PRAYERS_DATA) && window.PRAYERS_DATA.length > 0) {
      allCategories = window.PRAYERS_DATA;
      init();
      return;
    }

    fetch('prayers_data.json?v=2.0')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load prayers_data.json');
        return res.json();
      })
      .then(function (data) {
        allCategories = data;
        init();
      })
      .catch(function (err) {
        if (window.PRAYERS_DATA && Array.isArray(window.PRAYERS_DATA) && window.PRAYERS_DATA.length > 0) {
          allCategories = window.PRAYERS_DATA;
          init();
          return;
        }
        if (gridEl) {
          gridEl.innerHTML = '<div class="duas-no-results"><span class="material-symbols-rounded">error</span><p>تعذّر تحميل الأدعية. الرجاء المحاولة لاحقاً.</p></div>';
        }
        console.warn('Duas library fallback:', err);
      });
  }

  // ────────────────────────────────────────────────
  // Init
  // ────────────────────────────────────────────────
  function init() {
    buildTabs();
    applyFilters();
    bindEvents();
  }

  // ────────────────────────────────────────────────
  // Build category tabs
  // ────────────────────────────────────────────────
  function buildTabs() {
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    const totalPrayers = allCategories.reduce(function (acc, c) { return acc + c.count; }, 0);

    const allTab = createTab('all', 'الكل', totalPrayers, true);
    tabsEl.appendChild(allTab);

    allCategories.forEach(function (cat) {
      const tab = createTab(cat.name, cat.name, cat.count, false);
      tabsEl.appendChild(tab);
    });
  }

  function createTab(value, label, count, isActive) {
    const btn = document.createElement('button');
    btn.className = 'duas-tab' + (isActive ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('data-category', value);
    btn.innerHTML =
      '<span class="duas-tab-count">' + count + '</span>' + label;
    btn.addEventListener('click', function () {
      currentCategory = value;
      currentPage = 1;
      tabsEl.querySelectorAll('.duas-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      applyFilters();
    });
    return btn;
  }

  // ────────────────────────────────────────────────
  // Filter & search
  // ────────────────────────────────────────────────
  function applyFilters() {
    const allPrayers = [];
    allCategories.forEach(function (cat) {
      cat.prayers.forEach(function (p) {
        allPrayers.push(Object.assign({}, p, { category: cat.name }));
      });
    });

    filteredPrayers = allPrayers.filter(function (p) {
      const matchCat = currentCategory === 'all' || p.category === currentCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.text && p.text.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    updateCountLabel();
    renderGrid();
    renderPagination();
  }

  function updateCountLabel() {
    if (!countLabel) return;
    const total = filteredPrayers.length;
    if (searchQuery) {
      countLabel.textContent = 'نتائج البحث: ' + total + ' نتيجة';
    } else if (currentCategory === 'all') {
      countLabel.textContent = 'إجمالي الأدعية والحِكم: ' + total + ' في ' + allCategories.length + ' أقسام';
    } else {
      countLabel.textContent = 'قسم "' + currentCategory + '": ' + total + ' دعاء';
    }
  }

  // ────────────────────────────────────────────────
  // Render grid
  // ────────────────────────────────────────────────
  function renderGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    if (filteredPrayers.length === 0) {
      gridEl.innerHTML =
        '<div class="duas-no-results">' +
        '<span class="material-symbols-rounded">search_off</span>' +
        '<p>لا توجد نتائج للبحث عن "' + escapeHtml(searchQuery) + '"</p>' +
        '</div>';
      return;
    }

    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = Math.min(start + CARDS_PER_PAGE, filteredPrayers.length);
    const pagePrayers = filteredPrayers.slice(start, end);

    pagePrayers.forEach(function (prayer, index) {
      const card = buildCard(prayer, index);
      gridEl.appendChild(card);
    });

    // Animate cards in smoothly
    requestAnimationFrame(function () {
      gridEl.querySelectorAll('.dua-card').forEach(function (card, i) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(14px)';
        setTimeout(function () {
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 45);
      });
    });
  }

  function buildCard(prayer, index) {
    const icon = CATEGORY_ICONS[prayer.category] || CATEGORY_ICONS['default'];
    const preview = (prayer.text || '').replace(/\n/g, ' ').slice(0, 150);

    const card = document.createElement('a');
    card.className = 'dua-card';
    card.href = 'prayer.html?id=' + encodeURIComponent(prayer.id);
    card.setAttribute('aria-label', 'فتح صفحة: ' + prayer.title);
    card.innerHTML =
      '<div class="dua-card-header">' +
        '<div class="dua-card-icon">' +
          '<span class="material-symbols-rounded">' + icon + '</span>' +
        '</div>' +
        '<div class="dua-card-meta">' +
          '<div class="dua-card-category">' + escapeHtml(prayer.category) + '</div>' +
          '<h3 class="dua-card-title">' + escapeHtml(prayer.title) + '</h3>' +
        '</div>' +
      '</div>' +
      '<p class="dua-card-preview">' + escapeHtml(preview) + (preview.length < (prayer.text || '').length ? '...' : '') + '</p>' +
      '<div class="dua-card-footer">' +
        '<span class="dua-card-read-btn">' +
          'قراءة في صفحة خاصة' +
          '<span class="material-symbols-rounded">arrow_back_ios</span>' +
        '</span>' +
      '</div>';

    return card;
  }

  // ────────────────────────────────────────────────
  // Pagination
  // ────────────────────────────────────────────────
  function renderPagination() {
    if (!paginationEl) return;
    paginationEl.innerHTML = '';
    const totalPages = Math.ceil(filteredPrayers.length / CARDS_PER_PAGE);
    if (totalPages <= 1) return;

    // Prev
    const prevBtn = makePageBtn('‹', currentPage === 1);
    prevBtn.setAttribute('aria-label', 'الصفحة السابقة');
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) { currentPage--; renderGrid(); renderPagination(); scrollToSection(); }
    });
    paginationEl.appendChild(prevBtn);

    // Pages
    const range = getPageRange(currentPage, totalPages);
    range.forEach(function (pg) {
      if (pg === '…') {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '…';
        ellipsis.style.cssText = 'color:var(--on-surface-variant);padding:0 4px;line-height:40px;';
        paginationEl.appendChild(ellipsis);
        return;
      }
      const btn = makePageBtn(pg, false);
      if (pg === currentPage) btn.classList.add('active');
      btn.addEventListener('click', function () {
        currentPage = pg;
        renderGrid();
        renderPagination();
        scrollToSection();
      });
      paginationEl.appendChild(btn);
    });

    // Next
    const nextBtn = makePageBtn('›', currentPage === totalPages);
    nextBtn.setAttribute('aria-label', 'الصفحة التالية');
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) { currentPage++; renderGrid(); renderPagination(); scrollToSection(); }
    });
    paginationEl.appendChild(nextBtn);
  }

  function makePageBtn(label, disabled) {
    const btn = document.createElement('button');
    btn.className = 'duas-page-btn';
    btn.textContent = label;
    btn.disabled = disabled;
    return btn;
  }

  function getPageRange(current, total) {
    if (total <= 7) {
      const arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr;
    }
    const range = [1];
    if (current > 3) range.push('…');
    for (var p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) range.push(p);
    if (current < total - 2) range.push('…');
    range.push(total);
    return range;
  }

  function scrollToSection() {
    const section = document.getElementById('duas');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ────────────────────────────────────────────────
  // Bind events
  // ────────────────────────────────────────────────
  function bindEvents() {
    if (!searchEl) return;
    var searchTimeout;
    searchEl.addEventListener('input', function () {
      searchQuery = searchEl.value;
      if (clearBtn) clearBtn.classList.toggle('visible', searchQuery.length > 0);
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        currentPage = 1;
        applyFilters();
      }, 250);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchEl.value = '';
        searchQuery = '';
        clearBtn.classList.remove('visible');
        currentPage = 1;
        applyFilters();
        searchEl.focus();
      });
    }
  }

  // ────────────────────────────────────────────────
  // Utility
  // ────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ────────────────────────────────────────────────
  // Bootstrap
  // ────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }

})();
