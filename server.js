const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 5000;
const HOST = '0.0.0.0';
const BASE_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
};

// HTML escape helper
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Pre-load prayers data for high-speed SSR & Search Engine Crawlers
let prayersMap = new Map();
try {
    const prayersJson = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'prayers_data.json'), 'utf8'));
    prayersJson.forEach(cat => {
        cat.prayers.forEach(p => {
            prayersMap.set(p.id, { ...p, categoryName: cat.name });
        });
    });
    console.log(`Indexed ${prayersMap.size} prayers for instant SSR.`);
} catch (e) {
    console.error('Warning: Could not pre-index prayers_data.json:', e);
}

// Server pre-renderer for prayer pages
function renderPrayerSSR(htmlTemplate, prayerId) {
    const prayer = prayersMap.get(prayerId);
    if (!prayer) return htmlTemplate;

    const pageTitle = `${prayer.title} مكتوب كامل بالتشكيل | سِراج الأطهار`;
    const rawText = (prayer.text || '').replace(/\s+/g, ' ').trim();
    const textSnippet = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;
    const virtueSnippet = prayer.virtue && prayer.virtue.trim() ? ` مع بيان فضل الدعاء ومصدره.` : '';
    const pageDesc = `قراءة ${prayer.title} مكتوباً بالتشكيل الكامل وبخط عربي واضح من قسم ${prayer.categoryName}.${virtueSnippet} عبر سِراج الأطهار: ${textSnippet}`;
    const canonicalHref = `https://siraj-alathar.com/prayer.html?id=${prayer.id}`;
    const keywords = [
        prayer.title,
        `${prayer.title} مكتوب`,
        `${prayer.title} كامل`,
        `${prayer.title} بالتشكيل`,
        `قراءة ${prayer.title}`,
        prayer.categoryName,
        'سراج الأطهار',
        'مفاتيح الجنان',
        'الصحيفة السجادية',
        'أدعية أهل البيت'
    ].join(', ');

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CreativeWork",
                "@id": `${canonicalHref}#prayer`,
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
                    "url": "https://siraj-alathar.com/",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://siraj-alathar.com/images/logo.png"
                    }
                },
                "author": {
                    "@type": "Organization",
                    "name": "أهل البيت عليهم السلام"
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${canonicalHref}#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "الرئيسية",
                        "item": "https://siraj-alathar.com/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "مكتبة الأدعية",
                        "item": "https://siraj-alathar.com/#duas"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": prayer.categoryName,
                        "item": "https://siraj-alathar.com/duas-sitemap.html"
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

    let result = htmlTemplate;

    // Replace Title
    result = result.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);

    // Replace Description
    result = result.replace(/(<meta name="description"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(pageDesc)}$3`);

    // Replace Keywords
    result = result.replace(/(<meta name="keywords"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(keywords)}$3`);

    // Replace Canonical
    result = result.replace(/(<link rel="canonical"[^>]*href=")([^"]*)(")/, `$1${escapeHtml(canonicalHref)}$3`);

    // Replace OpenGraph
    result = result.replace(/(<meta property="og:title"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(pageTitle)}$3`);
    result = result.replace(/(<meta property="og:description"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(pageDesc)}$3`);
    result = result.replace(/(<meta property="og:url"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(canonicalHref)}$3`);

    // Replace Twitter
    result = result.replace(/(<meta name="twitter:title"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(pageTitle)}$3`);
    result = result.replace(/(<meta name="twitter:description"[^>]*content=")([^"]*)(")/, `$1${escapeHtml(pageDesc)}$3`);

    // Replace Schema.org JSON-LD
    result = result.replace(
        /<script type="application\/ld\+json" id="prayer-schema-ld">[\s\S]*?<\/script>/,
        `<script type="application/ld+json" id="prayer-schema-ld">\n${JSON.stringify(schemaData, null, 2)}\n    </script>`
    );

    // Pre-populate Heading and Category in HTML
    result = result.replace(/<h1 id="prayer-heading"[^>]*>.*?<\/h1>/, `<h1 id="prayer-heading" class="prayer-heading">${escapeHtml(prayer.title)}</h1>`);
    result = result.replace(/<span class="bread-cat" id="bread-category">.*?<\/span>/, `<span class="bread-cat" id="bread-category">${escapeHtml(prayer.categoryName)}</span>`);
    result = result.replace(/<span class="current" id="bread-title">.*?<\/span>/, `<span class="current" id="bread-title">${escapeHtml(prayer.title)}</span>`);
    result = result.replace(/<span id="prayer-cat-name">.*?<\/span>/, `<span id="prayer-cat-name">${escapeHtml(prayer.categoryName)}</span>`);

    // Pre-populate Virtue Callout
    if (prayer.virtue && prayer.virtue.trim()) {
        result = result.replace(/id="prayer-virtue-callout" class="prayer-virtue-callout"/, 'id="prayer-virtue-callout" class="prayer-virtue-callout" style="display: flex;"');
        result = result.replace(/<div id="prayer-virtue-text">.*?<\/div>/, `<div id="prayer-virtue-text">${escapeHtml(prayer.virtue)}</div>`);
    } else {
        result = result.replace(/id="prayer-virtue-callout" class="prayer-virtue-callout"/, 'id="prayer-virtue-callout" class="prayer-virtue-callout hidden" style="display: none;"');
    }

    // Pre-populate Full Text
    result = result.replace(/<div id="prayer-full-text" class="prayer-full-text">.*?<\/div>/, `<div id="prayer-full-text" class="prayer-full-text">${escapeHtml(prayer.text)}</div>`);

    // Pre-hide loading state and pre-show content box for 0ms SSR
    result = result.replace(/<div id="prayer-loading-state"[^>]*>/, '<div id="prayer-loading-state" class="duas-loading" style="display:none;">');
    result = result.replace(/<div id="prayer-content-box" style="display: none;">/, '<div id="prayer-content-box" style="display:block;">');

    return result;
}

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.normalize(path.join(BASE_DIR, reqPath));

    // Security check: ensure path is within BASE_DIR
    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }

    // SSR Pre-rendering for prayer.html
    if (reqPath === '/prayer.html') {
        const prayerId = parseInt(parsedUrl.searchParams.get('id'), 10);
        if (!isNaN(prayerId) && prayersMap.has(prayerId)) {
            try {
                const template = fs.readFileSync(path.join(BASE_DIR, 'prayer.html'), 'utf8');
                const ssrHtml = renderPrayerSSR(template, prayerId);
                const htmlBuffer = Buffer.from(ssrHtml, 'utf8');

                res.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Content-Length': htmlBuffer.length,
                    'Cache-Control': 'public, max-age=3600'
                });
                res.end(htmlBuffer);
                return;
            } catch (err) {
                console.error('Error during SSR rendering:', err);
            }
        }
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': 'no-cache'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Mobile Access on Wi-Fi: http://192.168.0.108:${PORT}`);
});
