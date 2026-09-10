// ============================================
// BUILD & OPTIMIZATION SCRIPT
// Siraj Al-Athar - Production Build
// ============================================

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...\n');

// Configuration
const CONFIG = {
    sourceDir: './',
    distDir: './dist',
    minifyJS: true,
    minifyCSS: true,
    inlineCSS: false,
    generateReport: true
};

/**
 * Simple CSS minification
 */
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around special characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove last semicolon
        .replace(/;}/g, '}')
        // Remove unnecessary zeros
        .replace(/:0(px|em|rem|%)/g, ':0')
        .trim();
}

/**
 * Simple JS minification (basic)
 */
function minifyJS(js) {
    return js
        // Remove single-line comments (but keep URLs)
        .replace(/(?:^|\s)\/\/(?![^\n]*:\/\/).*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around operators
        .replace(/\s*([=+\-*/<>!&|,;:?{}()\[\]])\s*/g, '$1')
        .trim();
}

/**
 * Extract critical CSS
 */
function extractCriticalCSS(html, css) {
    const criticalSelectors = new Set();
    
    // Find all classes and IDs in HTML
    const classMatches = html.match(/class="([^"]+)"/g) || [];
    classMatches.forEach(match => {
        const classes = match.match(/class="([^"]+)"/)[1].split(' ');
        classes.forEach(cls => criticalSelectors.add(`.${cls}`));
    });
    
    const idMatches = html.match(/id="([^"]+)"/g) || [];
    idMatches.forEach(match => {
        const id = match.match(/id="([^"]+)"/)[1];
        criticalSelectors.add(`#${id}`);
    });
    
    // Extract matching CSS rules (simplified)
    let criticalCSS = '';
    const rules = css.split('}');
    
    rules.forEach(rule => {
        const selector = rule.split('{')[0].trim();
        criticalSelectors.forEach(critSel => {
            if (selector.includes(critSel.replace('.', '').replace('#', ''))) {
                criticalCSS += rule + '}\n';
            }
        });
    });
    
    return criticalCSS;
}

/**
 * Build process
 */
async function build() {
    try {
        // Create dist directory
        if (!fs.existsSync(CONFIG.distDir)) {
            fs.mkdirSync(CONFIG.distDir, { recursive: true });
        }
        
        const stats = {
            originalSize: 0,
            minifiedSize: 0,
            files: []
        };
        
        // Process CSS
        if (CONFIG.minifyCSS) {
            console.log('📦 Minifying CSS...');
            const cssPath = path.join(CONFIG.sourceDir, 'styles.css');
            
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                const minified = minifyCSS(css);
                
                fs.writeFileSync(path.join(CONFIG.distDir, 'styles.min.css'), minified);
                
                stats.originalSize += css.length;
                stats.minifiedSize += minified.length;
                stats.files.push({
                    name: 'styles.css',
                    original: css.length,
                    minified: minified.length,
                    reduction: ((1 - minified.length / css.length) * 100).toFixed(2)
                });
                
                console.log(`  ✓ styles.css → styles.min.css (${((1 - minified.length / css.length) * 100).toFixed(1)}% reduction)`);
            }
        }
        
        // Process JavaScript files
        if (CONFIG.minifyJS) {
            console.log('\n📦 Minifying JavaScript...');
            
            const jsFiles = [
                'script.js',
                'analytics.js',
                'accessibility.js',
                'image-optimizer.js'
            ];
            
            jsFiles.forEach(file => {
                const jsPath = path.join(CONFIG.sourceDir, file);
                
                if (fs.existsSync(jsPath)) {
                    const js = fs.readFileSync(jsPath, 'utf8');
                    const minified = minifyJS(js);
                    
                    const outFile = file.replace('.js', '.min.js');
                    fs.writeFileSync(path.join(CONFIG.distDir, outFile), minified);
                    
                    stats.originalSize += js.length;
                    stats.minifiedSize += minified.length;
                    stats.files.push({
                        name: file,
                        original: js.length,
                        minified: minified.length,
                        reduction: ((1 - minified.length / js.length) * 100).toFixed(2)
                    });
                    
                    console.log(`  ✓ ${file} → ${outFile} (${((1 - minified.length / js.length) * 100).toFixed(1)}% reduction)`);
                }
            });
        }
        
        // Copy other necessary files
        console.log('\n📋 Copying assets...');
        const filesToCopy = [
            'index.html',
            'manifest.json',
            'service-worker.js',
            'robots.txt',
            'sitemap.xml',
            '.htaccess',
            '_headers'
        ];
        
        filesToCopy.forEach(file => {
            const srcPath = path.join(CONFIG.sourceDir, file);
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, path.join(CONFIG.distDir, file));
                console.log(`  ✓ ${file}`);
            }
        });
        
        // Copy directories
        const dirsToCopy = ['images', 'screenshots'];
        dirsToCopy.forEach(dir => {
            const srcPath = path.join(CONFIG.sourceDir, dir);
            if (fs.existsSync(srcPath)) {
                copyDir(srcPath, path.join(CONFIG.distDir, dir));
                console.log(`  ✓ ${dir}/`);
            }
        });
        
        // Generate report
        if (CONFIG.generateReport) {
            console.log('\n📊 Build Summary:');
            console.log('═'.repeat(70));
            console.log(`Total Original Size: ${formatBytes(stats.originalSize)}`);
            console.log(`Total Minified Size: ${formatBytes(stats.minifiedSize)}`);
            console.log(`Total Reduction: ${((1 - stats.minifiedSize / stats.originalSize) * 100).toFixed(2)}%`);
            console.log(`Saved: ${formatBytes(stats.originalSize - stats.minifiedSize)}`);
            console.log('═'.repeat(70));
            
            console.log('\nFile Details:');
            stats.files.forEach(file => {
                console.log(`  ${file.name}:`);
                console.log(`    Original: ${formatBytes(file.original)}`);
                console.log(`    Minified: ${formatBytes(file.minified)}`);
                console.log(`    Saved: ${file.reduction}%`);
            });
        }
        
        console.log('\n✅ Build completed successfully!');
        console.log(`📁 Output directory: ${CONFIG.distDir}\n`);
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run build
build();
