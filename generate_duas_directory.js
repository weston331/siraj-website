/**
 * Generates duas-sitemap.html - A fully accessible, crawler-friendly HTML index of all 650+ prayers
 * With complete SEO, Open Graph, Twitter Cards, and Schema.org JSON-LD
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://siraj-website.wghom02.workers.dev';
const prayersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'prayers_data.json'), 'utf8'));

let totalPrayers = 0;
prayersData.forEach(cat => totalPrayers += cat.prayers.length);

const pageTitle = `فهرس الأدعية والزيارات الشريفة (650 دعاء ومناجاة) | سِراج الأطهار`;
const pageDesc = `فهرس شامل لكافة الأدعية والزيارات والمناجاة المأثورة عن النبي وأهل بيته الأطهار (عليهم السلام) بالتشكيل الكامل والخط الواضح من تطبيق سِراج الأطهار.`;

const schemaGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${DOMAIN}/duas-sitemap#page`,
      "url": `${DOMAIN}/duas-sitemap`,
      "name": pageTitle,
      "description": pageDesc,
      "inLanguage": "ar",
      "isPartOf": {
        "@type": "WebSite",
        "name": "سِراج الأطهار",
        "url": `${DOMAIN}/`
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": totalPrayers,
        "itemListElement": prayersData.slice(0, 10).flatMap((cat, cIdx) => 
          cat.prayers.slice(0, 5).map((p, pIdx) => ({
            "@type": "ListItem",
            "position": (cIdx * 5) + pIdx + 1,
            "name": p.title,
            "url": `${DOMAIN}/prayers/${p.id}`
          }))
        )
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": `${DOMAIN}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "فهرس الأدعية",
          "item": `${DOMAIN}/duas-sitemap`
        }
      ]
    }
  ]
};

let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="title" content="${pageTitle}">
    <meta name="description" content="${pageDesc}">
    <meta name="keywords" content="فهرس الأدعية, زيارات, مناجاة, دعاء كميل, دعاء الصباح, دعاء الأربعاء, مفاتيح الجنان, سراج الأطهار">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${DOMAIN}/duas-sitemap">
    <meta name="theme-color" content="#001A3F">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="سِراج الأطهار">
    <meta property="og:url" content="${DOMAIN}/duas-sitemap">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDesc}">
    <meta property="og:image" content="${DOMAIN}/images/logo.png">
    <meta property="og:locale" content="ar_AR">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${DOMAIN}/duas-sitemap">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${pageDesc}">
    <meta name="twitter:image" content="${DOMAIN}/images/logo.png">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="images/logo.svg">
    <link rel="alternate icon" type="image/png" href="images/logo.png">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schemaGraph, null, 2)}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0">
    <link rel="stylesheet" href="styles.css?v=2.7">
    <style>
        .directory-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .directory-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .directory-title {
            font-size: 2.2rem;
            color: var(--primary);
            margin-bottom: 12px;
            font-family: var(--font-heading);
        }
        .directory-desc {
            color: var(--on-surface-variant);
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
        }
        .directory-category {
            background: white;
            border-radius: var(--radius-lg);
            border: 1.5px solid rgba(0, 26, 63, 0.08);
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: var(--shadow-sm);
        }
        .category-heading {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.4rem;
            color: var(--primary);
            border-bottom: 2px solid rgba(212, 175, 55, 0.2);
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .category-badge {
            background: rgba(212, 175, 55, 0.15);
            color: var(--secondary);
            font-size: 0.85rem;
            padding: 4px 10px;
            border-radius: var(--radius-full);
            font-weight: 600;
        }
        .prayers-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .prayer-item-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            background: #FAFAFB;
            border-radius: var(--radius-md);
            border: 1px solid rgba(0, 26, 63, 0.06);
            color: var(--primary);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .prayer-item-link:hover {
            background: rgba(212, 175, 55, 0.1);
            border-color: var(--gold);
            color: var(--secondary);
            transform: translateX(-4px);
        }
        .prayer-item-link .material-symbols-rounded {
            font-size: 18px;
            color: var(--gold);
            flex-shrink: 0;
        }
    </style>
</head>
<body class="prayer-page-body">
    <header class="prayer-navbar">
        <div class="container prayer-navbar-content">
            <a href="/" class="prayer-nav-brand" aria-label="سِراج الأطهار - الصفحة الرئيسية">
                <img src="images/logo.png" alt="شعار سِراج الأطهار" class="brand-logo-img">
                <span class="brand-title-text">سِراج الأطهار</span>
            </a>
            <div class="prayer-nav-actions">
                <a href="/#duas" class="prayer-back-btn">
                    <span class="material-symbols-rounded">arrow_forward</span>
                    <span>الرئيسية</span>
                </a>
            </div>
        </div>
    </header>

    <main class="directory-container">
        <div class="directory-header">
            <h1 class="directory-title">فهرس الأدعية والزيارات الشريفة</h1>
            <p class="directory-desc">مكتبة كاملة تضم 650 دعاء ومناجاة وزيارة منتقاة من تراث أهل البيت (عليهم السلام) بالتشكيل الكامل</p>
        </div>
`;

prayersData.forEach(cat => {
    html += `
        <section class="directory-category" id="cat-${cat.id}">
            <h2 class="category-heading">
                <span class="material-symbols-rounded">auto_stories</span>
                <span>${cat.name}</span>
                <span class="category-badge">${cat.prayers.length} دعاء</span>
            </h2>
            <ul class="prayers-list">
`;
    cat.prayers.forEach(p => {
        html += `                <li>
                    <a href="prayers/${p.id}" class="prayer-item-link" title="${p.title} مكتوب بالتشكيل">
                        <span class="material-symbols-rounded">menu_book</span>
                        <span>${p.title}</span>
                    </a>
                </li>\n`;
    });

    html += `            </ul>
        </section>
`;
});

html += `
    </main>

    <footer class="footer">
        <div class="container footer-content" style="text-align: center; padding: 24px 0;">
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                سِراج الأطهار - نور الهداية في راحة يدك © 2026. جميع الحقوق محفوظة.
            </p>
        </div>
    </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'duas-sitemap.html'), html, 'utf8');
console.log('Successfully generated duas-sitemap.html with clean URLs and complete SEO!');
