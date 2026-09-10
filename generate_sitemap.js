/**
 * Comprehensive Sitemap Generator for Siraj Al-Athar
 * Generates an SEO-optimized sitemap.xml with all 650+ prayers, Quran, Calendar, and Core pages
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://siraj-website.wghom02.workers.dev';
const TODAY = new Date().toISOString().split('T')[0];

// Load prayers data
const prayersDataPath = path.join(__dirname, 'prayers_data.json');
const categories = JSON.parse(fs.readFileSync(prayersDataPath, 'utf8'));

// XML escape helper
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

const urls = [];

// 1. Core Pages
urls.push({
    loc: `${DOMAIN}/`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '1.0'
});

urls.push({
    loc: `${DOMAIN}/calendar.html`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.95'
});

urls.push({
    loc: `${DOMAIN}/quran.html`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.95'
});

urls.push({
    loc: `${DOMAIN}/duas-sitemap.html`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.85'
});

urls.push({
    loc: `${DOMAIN}/privacy-policy.html`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.3'
});

urls.push({
    loc: `${DOMAIN}/terms.html`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.3'
});

// 2. All 650 Prayers & Ziyarat
categories.forEach(cat => {
    cat.prayers.forEach(prayer => {
        let priority = '0.75';
        let changefreq = 'monthly';

        // High priority for famous prayers and daily prayers
        if (cat.name === 'أدعية الأيام') {
            priority = '0.95';
            changefreq = 'weekly';
        } else if (cat.name === 'الأدعية المشهورة') {
            priority = '0.95';
            changefreq = 'weekly';
        } else if (cat.name === 'مناجاة خمسة عشر' || cat.name === 'تعقيبات الصلاة') {
            priority = '0.85';
            changefreq = 'weekly';
        } else if (cat.name === 'فهرس أعمال أشهر السنة') {
            priority = '0.85';
            changefreq = 'monthly';
        }

        urls.push({
            loc: `${DOMAIN}/prayers/${prayer.id}.html`,
            lastmod: TODAY,
            changefreq: changefreq,
            priority: priority,
            title: prayer.title
        });
    });
});

// Build XML string
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

urls.forEach(item => {
    xml += '    <url>\n';
    xml += `        <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `        <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `        <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `        <priority>${item.priority}</priority>\n`;
    if (item.title) {
        xml += '        <image:image>\n';
        xml += `            <image:loc>${DOMAIN}/images/logo.png</image:loc>\n`;
        xml += `            <image:title>${escapeXml(item.title)} - سِراج الأطهار</image:title>\n`;
        xml += '        </image:image>\n';
    }
    xml += '    </url>\n';
});

xml += '</urlset>\n';

const sitemapPath = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Successfully generated sitemap.xml with ${urls.length} URLs!`);
