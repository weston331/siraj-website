/**
 * Dedicated Prayer Reader Logic (prayer.js)
 * Reads prayer ID from URL parameter ?id=... and renders full prayer experience
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────
  // Category Icons Mapping
  // ────────────────────────────────────────────────
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
  // DOM Elements
  // ────────────────────────────────────────────────
  const loadingEl = document.getElementById('prayer-loading-state');
  const errorEl = document.getElementById('prayer-error-state');
  const contentBox = document.getElementById('prayer-content-box');

  const breadCategory = document.getElementById('bread-category');
  const breadTitle = document.getElementById('bread-title');

  const catPill = document.getElementById('prayer-category-pill');
  const catIcon = document.getElementById('prayer-cat-icon');
  const catName = document.getElementById('prayer-cat-name');
  const heading = document.getElementById('prayer-heading');

  const virtueBox = document.getElementById('prayer-virtue-callout');
  const virtueText = document.getElementById('prayer-virtue-text');

  const fullTextEl = document.getElementById('prayer-full-text');

  const prevLink = document.getElementById('prayer-prev-link');
  const prevTitle = document.getElementById('prayer-prev-title');
  const nextLink = document.getElementById('prayer-next-link');
  const nextTitle = document.getElementById('prayer-next-title');

  const relatedGrid = document.getElementById('prayer-related-grid');
  const relatedHeading = document.getElementById('related-heading-text');

  const btnFontDec = document.getElementById('btn-font-dec');
  const btnFontInc = document.getElementById('btn-font-inc');
  const fontSizeLabel = document.getElementById('font-size-label');

  const tasbeehCounter = document.getElementById('tasbeeh-counter');
  const btnTasbeehInc = document.getElementById('btn-tasbeeh-inc');
  const btnTasbeehReset = document.getElementById('btn-tasbeeh-reset');

  const btnCopy = document.getElementById('btn-copy-prayer');
  const btnShare = document.getElementById('btn-share-prayer');
  const btnPrint = document.getElementById('btn-print-prayer');

  const toastEl = document.getElementById('prayer-toast');
  const toastMsg = document.getElementById('prayer-toast-msg');

  // ────────────────────────────────────────────────
  // State
  // ────────────────────────────────────────────────
  let currentPrayer = null;
  let currentCategoryObj = null;
  let currentFontSize = parseInt(localStorage.getItem('siraj_prayer_font_size'), 10) || 24;
  let tasbeehCount = 0;
  let toastTimer = null;

  // ────────────────────────────────────────────────
  // Initialization
  // ────────────────────────────────────────────────
  function init() {
    setupFontSize();
    setupTasbeeh();
    setupActions();

    const params = new URLSearchParams(window.location.search);
    const prayerId = parseInt(params.get('id'), 10);

    if (isNaN(prayerId)) {
      showError();
      return;
    }

    if (window.PRAYERS_DATA && Array.isArray(window.PRAYERS_DATA) && window.PRAYERS_DATA.length > 0) {
      renderPrayer(window.PRAYERS_DATA, prayerId);
      return;
    }

    fetch('prayers_data.json?v=2.0')
      .then(function (res) {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(function (categories) {
        renderPrayer(categories, prayerId);
      })
      .catch(function (err) {
        if (window.PRAYERS_DATA && Array.isArray(window.PRAYERS_DATA) && window.PRAYERS_DATA.length > 0) {
          renderPrayer(window.PRAYERS_DATA, prayerId);
          return;
        }
        console.error('Failed to load prayer:', err);
        showError();
      });
  }

  // ────────────────────────────────────────────────
  // Render Prayer
  // ────────────────────────────────────────────────
  function renderPrayer(categories, targetId) {
    let foundPrayer = null;
    let foundCategory = null;
    let prayerIndexInCat = -1;

    for (let c = 0; c < categories.length; c++) {
      const cat = categories[c];
      for (let p = 0; p < cat.prayers.length; p++) {
        if (cat.prayers[p].id === targetId) {
          foundPrayer = cat.prayers[p];
          foundCategory = cat;
          prayerIndexInCat = p;
          break;
        }
      }
      if (foundPrayer) break;
    }

    if (!foundPrayer) {
      showError();
      return;
    }

    currentPrayer = foundPrayer;
    currentCategoryObj = foundCategory;

    // Update document title, rich SEO meta & Schema.org JSON-LD
    updateSEOMetadata(foundPrayer, foundCategory, targetId);

    // Breadcrumbs
    breadCategory.textContent = foundPrayer.category || foundCategory.name;
    breadTitle.textContent = foundPrayer.title;

    // Hero details
    const iconName = CATEGORY_ICONS[foundPrayer.category] || CATEGORY_ICONS['default'];
    catIcon.textContent = iconName;
    catName.textContent = foundPrayer.category || foundCategory.name;
    heading.textContent = foundPrayer.title;

    // Virtue / Source
    if (foundPrayer.virtue && foundPrayer.virtue.trim()) {
      virtueText.textContent = foundPrayer.virtue.trim();
      virtueBox.classList.remove('hidden');
    } else {
      virtueBox.classList.add('hidden');
    }

    // Full text
    fullTextEl.textContent = foundPrayer.text || '';

    // Prev / Next inside this category
    setupPrevNext(foundCategory.prayers, prayerIndexInCat);

    // Related prayers
    renderRelated(foundCategory.prayers, targetId);

    // Reveal
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentBox.style.display = 'block';

    // Smooth scroll to top of main content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ────────────────────────────────────────────────
  // SEO Metadata & Schema.org Structured Data
  // ────────────────────────────────────────────────
  function updateSEOMetadata(prayer, category, targetId) {
    if (!prayer) return;
    const catNameStr = prayer.category || (category ? category.name : 'مكتبة الأدعية');
    const pageTitle = `${prayer.title} مكتوب كامل بالتشكيل | سِراج الأطهار`;
    document.title = pageTitle;

    // Clean snippet for description
    const rawText = (prayer.text || '').replace(/\s+/g, ' ').trim();
    const textSnippet = rawText.length > 140 ? rawText.substring(0, 140) + '...' : rawText;
    const virtueSnippet = prayer.virtue && prayer.virtue.trim() ? ` مع فضل الدعاء ومصدره.` : '';
    const pageDesc = `قراءة ${prayer.title} مكتوباً بالتشكيل الكامل وبخط واضح من قسم ${catNameStr}.${virtueSnippet} عبر سِراج الأطهار: ${textSnippet}`;

    const canonicalHref = `https://siraj-website.wghom02.workers.dev/prayers/${encodeURIComponent(targetId)}.html`;

    // Description
    const descEl = document.getElementById('meta-description') || document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', pageDesc);

    // Keywords
    const keywordsEl = document.getElementById('meta-keywords') || document.querySelector('meta[name="keywords"]');
    if (keywordsEl) {
      const keywords = [
        prayer.title,
        `${prayer.title} مكتوب`,
        `${prayer.title} كامل`,
        `${prayer.title} بالتشكيل`,
        `قراءة ${prayer.title}`,
        catNameStr,
        'سراج الأطهار',
        'مفاتيح الجنان',
        'الصحيفة السجادية',
        'أدعية أهل البيت'
      ].join(', ');
      keywordsEl.setAttribute('content', keywords);
    }

    // Canonical link
    const canonEl = document.getElementById('canonical-url') || document.querySelector('link[rel="canonical"]');
    if (canonEl) canonEl.setAttribute('href', canonicalHref);

    // OpenGraph
    const ogTitle = document.getElementById('og-title') || document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.getElementById('og-description') || document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', pageDesc);

    const ogUrl = document.getElementById('og-url') || document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalHref);

    // Twitter Cards
    const twTitle = document.getElementById('twitter-title') || document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', pageTitle);

    const twDesc = document.getElementById('twitter-description') || document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', pageDesc);

    // Schema.org JSON-LD Structured Data
    const schemaEl = document.getElementById('prayer-schema-ld');
    if (schemaEl) {
      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            "@id": canonicalHref + "#prayer",
            "url": canonicalHref,
            "name": prayer.title,
            "headline": `${prayer.title} مكتوب كامل بالتشكيل`,
            "description": pageDesc,
            "inLanguage": "ar",
            "isAccessibleForFree": true,
            "genre": "Islamic Prayer & Dua",
            "text": textSnippet,
            "publisher": {
              "@type": "Organization",
              "name": "سِراج الأطهار",
              "url": "https://siraj-website.wghom02.workers.dev/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://siraj-website.wghom02.workers.dev/images/logo.png"
              }
            },
            "author": {
              "@type": "Organization",
              "name": "أهل البيت عليهم السلام"
            }
          },
          {
            "@type": "BreadcrumbList",
            "@id": canonicalHref + "#breadcrumb",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "الرئيسية",
                "item": "https://siraj-website.wghom02.workers.dev/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "مكتبة الأدعية",
                "item": "https://siraj-website.wghom02.workers.dev/duas-sitemap.html"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": catNameStr,
                "item": "https://siraj-website.wghom02.workers.dev/duas-sitemap.html"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": prayer.title,
                "item": canonicalHref
              }
            ]
          }
        ]
      };
      schemaEl.textContent = JSON.stringify(schemaData, null, 2);
    }
  }

  // ────────────────────────────────────────────────
  // Prev & Next Navigation
  // ────────────────────────────────────────────────
  function setupPrevNext(prayersList, currentIndex) {
    // Previous (older / earlier in category list)
    if (currentIndex > 0) {
      const prev = prayersList[currentIndex - 1];
      prevLink.href = 'prayer.html?id=' + encodeURIComponent(prev.id);
      prevTitle.textContent = prev.title;
      prevLink.classList.remove('disabled');
    } else {
      prevLink.href = '#';
      prevTitle.textContent = 'بداية القسم';
      prevLink.classList.add('disabled');
    }

    // Next (following in category list)
    if (currentIndex < prayersList.length - 1) {
      const next = prayersList[currentIndex + 1];
      nextLink.href = 'prayer.html?id=' + encodeURIComponent(next.id);
      nextTitle.textContent = next.title;
      nextLink.classList.remove('disabled');
    } else {
      nextLink.href = '#';
      nextTitle.textContent = 'نهاية القسم';
      nextLink.classList.add('disabled');
    }
  }

  // ────────────────────────────────────────────────
  // Related Prayers
  // ────────────────────────────────────────────────
  function renderRelated(prayersList, currentId) {
    const others = prayersList.filter(function (p) { return p.id !== currentId; });
    if (others.length === 0) {
      document.getElementById('prayer-related-section').style.display = 'none';
      return;
    }

    relatedHeading.textContent = 'أدعية أخرى من ' + (currentCategoryObj ? currentCategoryObj.name : 'نفس الفئة');
    relatedGrid.innerHTML = '';

    // Take up to 3 items
    const sample = others.slice(0, 3);
    sample.forEach(function (prayer) {
      const icon = CATEGORY_ICONS[prayer.category] || CATEGORY_ICONS['default'];
      const preview = (prayer.text || '').replace(/\n/g, ' ').slice(0, 110);

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
        '<p class="dua-card-preview">' + escapeHtml(preview) + '...</p>' +
        '<div class="dua-card-footer">' +
          '<span class="dua-card-read-btn">' +
            'قراءة في صفحة خاصة' +
            '<span class="material-symbols-rounded">arrow_back_ios</span>' +
          '</span>' +
        '</div>';

      relatedGrid.appendChild(card);
    });
  }

  // ────────────────────────────────────────────────
  // Font Size Adjuster
  // ────────────────────────────────────────────────
  function setupFontSize() {
    applyFontSize(currentFontSize);

    btnFontInc.addEventListener('click', function () {
      if (currentFontSize < 38) {
        currentFontSize += 2;
        applyFontSize(currentFontSize);
      }
    });

    btnFontDec.addEventListener('click', function () {
      if (currentFontSize > 18) {
        currentFontSize -= 2;
        applyFontSize(currentFontSize);
      }
    });
  }

  function applyFontSize(size) {
    document.documentElement.style.setProperty('--prayer-font-size', size + 'px');
    fontSizeLabel.textContent = size + 'px';
    localStorage.setItem('siraj_prayer_font_size', size);
  }

  // ────────────────────────────────────────────────
  // Reading Counter (Tasbeeh)
  // ────────────────────────────────────────────────
  function setupTasbeeh() {
    btnTasbeehInc.addEventListener('click', function () {
      tasbeehCount++;
      tasbeehCounter.textContent = tasbeehCount;
    });

    btnTasbeehReset.addEventListener('click', function () {
      tasbeehCount = 0;
      tasbeehCounter.textContent = '0';
    });
  }

  // ────────────────────────────────────────────────
  // Action Buttons: Copy, Share, Print
  // ────────────────────────────────────────────────
  function setupActions() {
    // Copy
    btnCopy.addEventListener('click', function () {
      if (!currentPrayer) return;
      const copyText = currentPrayer.title + '\n\n' +
        (currentPrayer.virtue ? ('[ ' + currentPrayer.virtue + ' ]\n\n') : '') +
        (currentPrayer.text || '');

      navigator.clipboard.writeText(copyText)
        .then(function () {
          showToast('تم نسخ نص الدعاء كاملاً بنجاح');
        })
        .catch(function () {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = copyText;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('تم نسخ نص الدعاء كاملاً بنجاح');
        });
    });

    // Share
    btnShare.addEventListener('click', function () {
      if (!currentPrayer) return;
      const shareData = {
        title: currentPrayer.title + ' - سِراج الأطهار',
        text: 'اقرأ ' + currentPrayer.title + ' عبر موقع وتطبيق سِراج الأطهار:',
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(function () {
          showToast('تم نسخ رابط الصفحة لمشاركته');
        });
      }
    });

    // Print
    btnPrint.addEventListener('click', function () {
      window.print();
    });
  }

  // ────────────────────────────────────────────────
  // Toast Notification
  // ────────────────────────────────────────────────
  function showToast(msg) {
    if (!toastEl) return;
    toastMsg.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('visible');
    }, 2500);
  }

  // ────────────────────────────────────────────────
  // Error state
  // ────────────────────────────────────────────────
  function showError() {
    loadingEl.style.display = 'none';
    if (contentBox) contentBox.style.display = 'none';
    errorEl.style.display = 'block';
  }

  // ────────────────────────────────────────────────
  // Helpers
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
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
