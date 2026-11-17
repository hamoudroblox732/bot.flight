# Karen Flight Discord Bot

بوت تجهيز سيرفر شركة Karen Flight الافتراضية الخاصة بـ Roblox PTFS.

## المتطلبات
- Node.js 20 أو أحدث
- تطبيق Bot من Discord Developer Portal
- صلاحيات البوت داخل السيرفر: Manage Channels, Manage Roles, View Channels, Send Messages, Embed Links, Read Message History

## 1. إعداد المتغيرات
انسخ `.env.example` إلى ملف باسم `.env` ثم عبّئ:
- `DISCORD_TOKEN`: توكن البوت من صفحة Bot في Discord Developer Portal
- `CLIENT_ID`: Application ID من صفحة General Information
- `GUILD_ID`: Server ID لسيرفر Discord

لا ترفع ملف `.env` إلى GitHub ولا تشارك التوكن مع أي شخص.

## 2. تثبيت الحزم
```bash
npm install
```

## 3. تسجيل الأمر
```bash
npm run deploy
```

## 4. تشغيل البوت
```bash
npm start
```

## 5. استخدامه
من داخل سيرفر Discord اكتب `/setup`. يحتاج المستخدم صلاحية Manage Server.

الأمر ينشئ التصنيفات والرومات والرتب ورسائل التعليمات. إذا شغلته مرة ثانية، يتعرف على الرومات الموجودة ولا يكررها. الرتب تُنشأ فقط ولا يوزعها تلقائياً على الأعضاء.

## ملاحظات مهمة
- لا يمنح البوت رتبة Owner لأي عضو تلقائياً.
- رتب الطاقم والإدارة تحتاج توزيعاً يدوياً من إدارة السيرفر.
- القنوات الخاصة تظهر فقط للرتب المحددة أعلاه.
- القنوات التي تبدأ بإعلانات أو معلومات تكون للقراءة فقط للأعضاء.
- إذا غيّرت أسماء الرومات يدوياً، قد ينشئ الأمر نسخة جديدة بالاسم المعتمد في الإعداد.
- لا تضع توكن البوت في الكود أو في رسائل Discord.
