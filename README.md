# نظام التعليم المتقدم - Advanced Education Platform

## 📋 نظرة عامة على المشروع

منصة تعليمية متكاملة مع تحكم فائق، حماية متقدمة، تحليل ذكي، ونظام دفع.

## ✨ المميزات الرئيسية

### 1. 🔐 نظام المصادقة (Authentication)
- **تسجيل دخول أونلاين**: البريد الإلكتروني + كلمة المرور
- **تسجيل دخول سنتر**: الاسم + الكود + الهاتف
- **دخول الأدمن الآمن**: نظام توكن مشفر بدون كلمة مرور مباشرة

### 2. 📊 لوحة تحكم الطالب
- عرض الدروس مع بانرات مخصصة
- تتبع تقدم المشاهدة (%) 
- نظام المحفظة والدفع
- تغيير كلمة المرور
- إدارة الأجهزة المسجلة

### 3. 🔥 لوحة تحكم الأدمن الفائقة
- مراقبة جميع الطلاب
- حظر/فك حظر الحسابات
- إدارة الأجهزة والتحكم بها
- مراجعة المدفوعات (موافقة/رفض)
- إضافة وحذف الدروس
- تحليلات الذكاء الاصطناعي لمستوى الطلاب

### 4. 🎥 حماية الفيديو
- Embed آمن من YouTube
- علامة مائية باسم الطالب ورقمه
- منع النقر بزر الماوس الأيمن
- تتبع وقت المشاهدة والتقدم

### 5. 📈 التحليلات المتقدمة
- حساب مستوى الطالب تلقائياً:
  - ممتاز (score > 80 && watch > 90)
  - جيد (score > 60)
  - متوسط (score > 50)
  - ضعيف (أقل من ذلك)
- توزيع المستويات في رسوم بيانية
- إحصائيات الوقت والإكمال

### 6. 💳 نظام الدفع
- رفع لقطة شاشة للتحويل
- مراجعة الأدمن (موافقة/رفض)
- إضافة الرصيد للمحفظة تلقائياً
- إشعارات للطلاب

### 7. 📱 التصميم المتجاوب
- يعمل على الموبايل واللابتوب
- Flexbox و Grid
- Media Queries

## 📁 هيكل الملفات

```
/workspace
├── index.html          # صفحة تسجيل الدخول
├── dashboard.html      # لوحة تحكم الطالب
├── admin.html          # لوحة تحكم الأدمن
├── style.css           # التنسيقات الكاملة
├── app.js              # كود Firebase والمصادقة
├── dashboard.js        # وظائف لوحة الطالب
├── admin.js            # وظائف لوحة الأدمن
└── README.md           # هذا الملف
```

## ⚙️ الإعداد المطلوب

### 1. إنشاء مشروع Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعل الخدمات التالية:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

### 2. تحديث إعدادات Firebase
في ملف `app.js`، استبدل البيانات التالية:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
```

### 3. إنشاء قواعد البيانات (Firestore)

#### مجموعة `users`:
```json
{
  "uid": "user_id",
  "name": "Ahmed",
  "email": "a@gmail.com",
  "phone": "010...",
  "type": "online|center",
  "password": "hashed",
  "devices": ["dev1", "dev2"],
  "blocked": false,
  "wallet": 50,
  "role": "user|admin",
  "adminToken": "encrypted_token",
  "watchProgress": 80,
  "completedLessons": ["lesson1"],
  "lessonProgress": {"lesson1": 75},
  "totalWatchTime": 120,
  "averageScore": 85
}
```

#### مجموعة `lessons`:
```json
{
  "title": "الحصة 1",
  "description": "وصف الدرس",
  "videoUrl": "https://youtube.com/watch?v=...",
  "banner": "image.jpg",
  "order": 1,
  "createdAt": "timestamp",
  "createdBy": "admin_uid"
}
```

#### مجموعة `payments`:
```json
{
  "userId": "user_id",
  "userName": "Ahmed",
  "phone": "010...",
  "amount": 100,
  "screenshot": "url_to_image",
  "status": "pending|approved|rejected",
  "createdAt": "timestamp",
  "reviewedBy": "admin_uid",
  "reviewedAt": "timestamp"
}
```

#### مجموعة `analytics`:
```json
{
  "userId": "user_id",
  "lessonId": "lesson_id",
  "progress": 75,
  "timestamp": "timestamp",
  "deviceId": "device_id",
  "completed": false
}
```

### 4. إنشاء أول أدمن

استخدم Firebase Console لإضافة مستخدم جديد في مجموعة `users`:

```json
{
  "uid": "admin_uid",
  "name": "Super Admin",
  "email": "admin@platform.com",
  "phone": "0000000000",
  "type": "online",
  "role": "admin",
  "blocked": false,
  "wallet": 0,
  "devices": [],
  "adminToken": ""
}
```

## 🔒 قواعد الأمان (Security Rules)

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
                   (request.auth.uid == userId || 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Lessons collection
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Analytics collection
    match /analytics/{analyticId} {
      allow read: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /payments/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 التشغيل

1. افتح ملف `index.html` في المتصفح
2. سجل دخول كأدمن أولاً لإنشاء المحتوى
3. أضف الدروس من لوحة الأدمن
4. جرب تسجيل دخول طالب

## 🛡️ ملاحظات الأمان الهامة

### ✅ ما تم تطبيقه:
- نظام توكن للأدمن بدلاً من كلمة المرور المباشرة
- التحقق من IP عند توليد التوكن
- منع النقر بزر الماوس الأيمن على الفيديو
- علامة مائية ديناميكية على الفيديو
- تحديد عدد الأجهزة (2 كحد أقصى)
- حظر الحسابات
- قواعد أمان Firebase

### ⚠️ تحذيرات هامة:
- ❌ لا يوجد منع 100% لتسجيل الشاشة (هذا قيد تقني عالمي)
- ❌ لا يوجد تشفير كامل للفيديو 100% (YouTube له حدود)
- ✔️ لكن النظام يجعل القرصنة صعبة جداً

## 📊 الإحصائيات والتحليلات

النظام يحلل تلقائياً:
- وقت المشاهدة الكلي
- نسبة إكمال الدروس
- عدد المحاولات
- متوسط الدرجات
- توزيع مستويات الطلاب

## 💡 أفكار للتطوير المستقبلي

1. إضافة اختبارات بعد كل درس
2. نظام إشعارات push notifications
3. بث مباشر للدروس
4. تطبيق موبايل (React Native / Flutter)
5. بوابة دفع إلكتروني (Fawry, Paymob)
6. شهادات إتمام تلقائية
7. نظام محادثة بين الطلاب والأدمن

## 📞 الدعم

لأي استفسار أو مشكلة تقنية، تواصل مع فريق التطوير.

---

**تم تطوير هذا النظام بأحدث التقنيات لضمان أفضل تجربة تعليمية وآمنة.** 🎓
