# دليل النشر والاستضافة 🚀

هذا الدليل يشرح طرق مختلفة لنشر موقع سِراج الأطهار على الإنترنت

---

## 1️⃣ النشر على GitHub Pages (مجاني)

### الخطوات:

1. **إنشاء حساب GitHub** (إذا لم يكن لديك): https://github.com/join

2. **إنشاء Repository جديد:**
   - اذهب إلى: https://github.com/new
   - اسم الـ Repo: `siraj-athar-website`
   - اجعله Public
   - اضغط "Create repository"

3. **رفع الملفات:**

```bash
# افتح PowerShell في مجلد New folder
cd "c:\Users\Mohammed\Desktop\New folder"

# تهيئة Git
git init
git add .
git commit -m "Initial commit: Siraj Al-Athar website"

# ربط مع GitHub (استبدل YOUR-USERNAME باسم المستخدم)
git remote add origin https://github.com/YOUR-USERNAME/siraj-athar-website.git
git branch -M main
git push -u origin main
```

4. **تفعيل GitHub Pages:**
   - اذهب إلى Settings > Pages
   - Source: اختر `main` branch
   - اضغط Save
   - سيكون رابط الموقع: `https://YOUR-USERNAME.github.io/siraj-athar-website/`

### 🎯 ربط دومين مخصص (اختياري):
1. اشترِ دومين من Namecheap أو GoDaddy
2. في GitHub Pages Settings، أضف الدومين
3. في إعدادات DNS للدومين، أضف:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```

---

## 2️⃣ النشر على Netlify (مجاني + سهل)

### الطريقة 1: Drag & Drop

1. اذهب إلى: https://app.netlify.com/drop
2. اسحب مجلد `New folder` كاملاً
3. الموقع سيُنشر فوراً!
4. ستحصل على رابط مثل: `https://random-name.netlify.app`

### الطريقة 2: عبر Git (احترافي)

```bash
# تسجيل الدخول (أول مرة فقط)
npm install -g netlify-cli
netlify login

# نشر الموقع
cd "c:\Users\Mohammed\Desktop\New folder"
netlify deploy --prod
# اختر: Create & configure a new site
# البناء: .
```

### 🎯 ربط دومين مخصص:
1. Domains > Add custom domain
2. أدخل اسم الدومين
3. أضف DNS records في مزود الدومين

---

## 3️⃣ النشر على Vercel (مجاني + سريع)

### الخطوات:

1. اذهب إلى: https://vercel.com/
2. سجّل دخول بحساب GitHub
3. اضغط "New Project"
4. استورد الـ Repository من GitHub
5. اضغط Deploy
6. الموقع جاهز على: `https://project-name.vercel.app`

### عبر CLI:

```bash
npm install -g vercel
cd "c:\Users\Mohammed\Desktop\New folder"
vercel
```

---

## 4️⃣ النشر على Cloudflare Pages (مجاني + سريع)

1. اذهب إلى: https://pages.cloudflare.com/
2. Connect to Git > اختر GitHub
3. Select repository: `siraj-athar-website`
4. Build settings:
   - Framework preset: None
   - Build command: (اتركه فارغاً)
   - Build output directory: `/`
5. اضغط "Save and Deploy"

---

## 5️⃣ النشر على استضافة تقليدية (cPanel)

### ملفات تحتاج رفعها:

```
New folder/
├── index.html
├── styles.css
├── script.js
├── screenshots/
├── favicon.ico
├── apple-touch-icon.png
├── icon-*.png
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── .htaccess
└── 404.html
```

### الخطوات:

1. **رفع الملفات عبر FTP:**
   - استخدم FileZilla أو cPanel File Manager
   - ارفع كل الملفات إلى `/public_html/`

2. **التحقق من .htaccess:**
   - تأكد من تفعيل `mod_rewrite`
   - تأكد من تفعيل `mod_deflate` للضغط

3. **اختبار:**
   - افتح `https://yourdomain.com`
   - تحقق من عمل جميع الروابط

---

## 6️⃣ النشر على Firebase Hosting (مجاني)

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
cd "c:\Users\Mohammed\Desktop\New folder"
firebase init hosting

# اختيارات:
# - Use existing project أو Create new project
# - Public directory: . (النقطة)
# - Configure as single-page app: No
# - Set up automatic builds: No

# النشر
firebase deploy --only hosting
```

---

## ✅ Checklist ما بعد النشر

بعد نشر الموقع، تأكد من:

### 1. الأداء والسرعة:
- [ ] اختبار على PageSpeed Insights: https://pagespeed.web.dev/
- [ ] اختبار على GTmetrix: https://gtmetrix.com/
- [ ] تأكد من سرعة التحميل < 3 ثواني

### 2. SEO:
- [ ] أضف Google Search Console
- [ ] أرسل sitemap.xml
- [ ] تحقق من Meta tags في أدوات Facebook/Twitter

### 3. الأمان:
- [ ] تفعيل HTTPS (SSL Certificate)
- [ ] التحقق من Security Headers
- [ ] اختبار على https://securityheaders.com/

### 4. التوافق:
- [ ] اختبار على Chrome, Firefox, Safari, Edge
- [ ] اختبار على Android و iOS
- [ ] اختبار على أحجام شاشات مختلفة

### 5. التحليلات (اختياري):
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔧 تحديث الموقع

### GitHub Pages / Netlify / Vercel:
```bash
git add .
git commit -m "Update content"
git push origin main
# سيُنشر تلقائياً!
```

### FTP:
- ارفع الملفات المحدثة فقط

---

## 🌍 ربط الموقع بمتاجر التطبيقات

### 1. Google Play Console:
- اذهب إلى: Store presence > Store listing
- أضف رابط الموقع في "Website"

### 2. Apple App Store Connect:
- اذهب إلى: App Information
- أضف رابط الموقع في "Marketing URL"

---

## 📊 مراقبة الأداء

### أدوات مجانية:

1. **Google Analytics**: تتبع الزيارات
2. **Google Search Console**: تتبع SEO
3. **Uptime Robot**: مراقبة التوقف
4. **Hotjar**: تتبع سلوك المستخدمين

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الموقع لا يظهر بعد النشر
**الحل:**
- انتظر 5-10 دقائق (DNS propagation)
- امسح الكاش: Ctrl+Shift+R
- تحقق من إعدادات DNS

### المشكلة: الصور لا تظهر
**الحل:**
- تأكد من رفع مجلد `screenshots/`
- تحقق من case sensitivity في أسماء الملفات
- تحقق من المسارات في HTML

### المشكلة: الخطوط لا تعمل
**الحل:**
- تحقق من اتصال الإنترنت (Google Fonts)
- تأكد من تحميل ملفات CSS بشكل صحيح

---

## 💡 نصائح للأداء الأفضل

1. **استخدم CDN** (Cloudflare مجاني)
2. **ضغط الصور** (TinyPNG)
3. **تقليل حجم CSS/JS** (Minification)
4. **استخدام WebP للصور** (أصغر حجماً)
5. **Lazy loading للصور**

---

**جاهز للإطلاق! 🎉**

إذا واجهت أي مشكلة، ارجع لهذا الدليل أو ابحث في الـ docs الخاصة بكل منصة.
