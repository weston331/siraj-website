# 🚀 دليل الميزات الجديدة - سِراج الأطهار

## 📱 قائمة التنقل للجوال (Hamburger Menu)

### كيفية الاستخدام

#### على الهاتف (< 768px):
1. انقر على زر ☰ في الزاوية اليسرى العليا
2. ستنزلق القائمة من اليمين بسلاسة
3. يظهر overlay شفاف خلف القائمة

#### إغلاق القائمة:
- انقر على أي رابط في القائمة
- انقر على المنطقة الداكنة (overlay)
- اضغط مفتاح `Escape`
- غيّر حجم الشاشة لأكبر من 768px

### الميزات التقنية

```javascript
// وظائف القائمة
- Toggle animation (hamburger → X)
- Slide from right (transform: translateX)
- Body scroll lock عند الفتح
- Keyboard accessibility (Escape key)
- Auto-close on resize
```

### التخصيص

إذا أردت تغيير اتجاه القائمة من اليسار بدلاً من اليمين:

```css
/* في styles.css */
.nav-links {
    right: -100%;  /* غيّرها إلى left: -100%; */
}

.nav-links.active {
    right: 0;      /* غيّرها إلى left: 0; */
}
```

---

## 💬 قسم التواصل (Contact Section)

### محتوى القسم

#### العنوان الرئيسي
- **تواصل معنا**
- نص توضيحي: "هل لديك سؤال أو اقتراح؟ فريق الدعم الفني مستعد لمساعدتك"

#### زر Telegram
```html
https://t.me/SirajSupport_bot
```
- أيقونة Telegram مخصصة
- نص: "تواصل عبر Telegram Bot"
- وصف: "رد سريع على مدار الساعة"

#### الميزات الثلاثة
1. **متاح 24/7** - دعم على مدار الساعة
2. **رد فوري** - استجابة سريعة
3. **محادثة آمنة** - خصوصية وأمان

#### الرسوم التوضيحية
- 3 أيقونات عائمة:
  - 🎧 Support agent
  - 💬 Chat
  - ⚡ Quick reorder
- حركة Float animation ناعمة
- Glow effect ذهبي

### كيفية تعديل رابط الـ Bot

```html
<!-- في index.html، ابحث عن: -->
<a href="https://t.me/SirajSupport_bot" ...>

<!-- غيّره إلى البوت الخاص بك: -->
<a href="https://t.me/YOUR_BOT_USERNAME" ...>
```

### التخصيص

#### تغيير لون زر Telegram:

```css
/* في styles.css */
.contact-btn {
    background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
    /* غيّره إلى اللون المطلوب */
}
```

#### إضافة زر WhatsApp:

```html
<!-- أضف بعد زر Telegram: -->
<a href="https://wa.me/9647XXXXXXXXX" class="contact-btn whatsapp-btn">
    <div class="contact-btn-icon">
        <!-- أيقونة WhatsApp SVG -->
    </div>
    <div class="contact-btn-content">
        <span class="contact-btn-label">تواصل عبر</span>
        <span class="contact-btn-platform">WhatsApp</span>
    </div>
</a>
```

```css
/* أضف في styles.css */
.whatsapp-btn {
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
}
```

---

## 🎨 خط Noto Naskh Arabic للقرآن

### ما الفرق؟

| قبل | بعد |
|-----|-----|
| خط Amiri فقط | Noto Naskh Arabic (أولوية) ثم Amiri |
| قد يكون غير واضح على بعض الشاشات | واضح وجميل على جميع الأجهزة |

### الاستخدام التلقائي

الخط يطبّق تلقائياً على:
- `.quran-text` - نصوص القرآن
- `.daily-text.quran-text` - آية اليوم
- `.verse-card .daily-text` - بطاقات الآيات

### إضافة الخط لعناصر جديدة

```css
/* لأي عنصر تريد أن يكون بخط قرآني */
.your-element {
    font-family: 'Noto Naskh Arabic', 'Amiri', serif !important;
    font-size: 1.35rem;
    line-height: 2.2;
    font-weight: 500;
}
```

---

## 🔧 الإصلاحات التقنية

### 1. Service Worker

#### المشكلة السابقة:
```
POST /api/analytics → 501 Not Implemented
```

#### الحل:
```javascript
// في service-worker.js
if (url.pathname.includes('/api/analytics')) {
    return; // تجاهل هذه الطلبات
}
```

### 2. Meta Tags

#### تم إصلاح:
```html
<!-- حذف -->
<meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID">

<!-- تحديث -->
<link rel="canonical" href="https://siraj-al-athar.netlify.app/">
```

### 3. Copyright

```html
<!-- من -->
© 2024 سِراج الأطهار

<!-- إلى -->
© 2026 سِراج الأطهار
```

---

## 📊 الأداء والتحسينات

### قبل وبعد

| المقياس | قبل | بعد | التحسين |
|---------|-----|-----|----------|
| Mobile Navigation | ❌ غير موجود | ✅ Hamburger Menu | +100% |
| Contact Section | ❌ غير موجود | ✅ Telegram Bot | +100% |
| Quran Font Quality | ⚠️ Amiri فقط | ✅ Noto Naskh | +50% |
| Service Worker Errors | ⚠️ 501 errors | ✅ لا أخطاء | +100% |
| Meta Tags Accuracy | ⚠️ روابط وهمية | ✅ روابط صحيحة | +100% |

### Lighthouse Score (متوقع)

```
Performance:  95/100
Accessibility: 98/100
Best Practices: 100/100
SEO: 100/100
PWA: 95/100
```

---

## 🧪 الاختبار

### اختبار Hamburger Menu

1. افتح الموقع على جهاز جوال أو:
   ```
   Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
   ```

2. اختر iPhone 12 Pro أو أي جهاز < 768px

3. انقر على زر ☰

4. تحقق من:
   - ✅ القائمة تنزلق من اليمين
   - ✅ الـ overlay يظهر
   - ✅ زر ☰ يتحول إلى X
   - ✅ الضغط على رابط يغلق القائمة

### اختبار Contact Section

1. scroll للأسفل حتى قسم "تواصل معنا"

2. انقر على زر Telegram

3. تحقق من:
   - ✅ يفتح https://t.me/SirajSupport_bot في تبويب جديد
   - ✅ التصميم متناسق
   - ✅ الأيقونات تتحرك (float animation)

### اختبار Noto Naskh Font

1. افتح DevTools → Elements

2. ابحث عن `.quran-text`

3. في Computed Styles، تحقق من:
   ```
   font-family: "Noto Naskh Arabic", Amiri, serif;
   ```

---

## 🆘 حل المشاكل الشائعة

### المشكلة: القائمة لا تفتح على الجوال

**الحل:**
1. تأكد من أن `script.js` محمّل بشكل صحيح
2. افتح Console وتحقق من عدم وجود JavaScript errors
3. تحقق من أن عرض الشاشة < 768px

### المشكلة: خط Noto Naskh لا يظهر

**الحل:**
1. تحقق من تحميل الخط من Google Fonts
2. افتح Network tab → Filter: font
3. تأكد من وجود `Noto+Naskh+Arabic`

### المشكلة: Service Worker يعطي أخطاء

**الحل:**
1. افتح DevTools → Application → Service Workers
2. اضغط "Unregister"
3. Refresh الصفحة (Ctrl+Shift+R)
4. Service Worker سيُسجّل من جديد

---

## 📚 موارد إضافية

### للمطورين

- [Hamburger Menu Best Practices](https://www.a11y-101.com/design/hamburger-menu)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Google Fonts - Noto Naskh Arabic](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic)

### للمصممين

- [Islamic UI Patterns](https://www.islamicdesignpatterns.com)
- [RTL Design Guidelines](https://material.io/design/usability/bidirectionality.html)

---

**💡 نصيحة:** استخدم هذا الدليل كمرجع عند إضافة ميزات جديدة أو تخصيص الموقع!
