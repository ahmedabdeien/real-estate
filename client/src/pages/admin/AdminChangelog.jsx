import { Box, Group, Stack, Text, Title, Card, ThemeIcon, Badge, Timeline } from "@mantine/core";
import { FaClockRotateLeft, FaWandMagicSparkles, FaWrench, FaBolt } from "react-icons/fa6";

const TYPE_META = {
  feature: { icon: FaWandMagicSparkles, color: "teal" },
  fix: { icon: FaWrench, color: "yellow" },
  improvement: { icon: FaBolt, color: "blue" },
};

const VERSIONS = [
  {
    version: "2.9.0", date: "2026-05-17", title: "إصلاح تسجيل العملاء ومنتقي التاريخ",
    items: [
      { type: "fix", text: "إصلاح خطأ 400 عند تسجيل عميل جديد — تصحيح حقل مصدر التسجيل" },
      { type: "fix", text: "منتقي التاريخ يفتح الآن فوق المحتوى بشكل صحيح دون اقتطاع في الجداول" },
      { type: "improvement", text: "منتقي التاريخ يستخدم portal ليظهر دائماً في المكان الصحيح" },
    ],
  },
  {
    version: "2.8.0", date: "2026-05-17", title: "تعديل المشروع مباشرة من صفحة التفاصيل",
    items: [
      { type: "fix", text: "زر تعديل المشروع من الموقع يفتح نافذة التعديل مباشرةً للمشروع الصحيح" },
      { type: "improvement", text: "URL ينظّف تلقائياً بعد فتح نافذة التعديل" },
    ],
  },
  {
    version: "2.7.0", date: "2026-05-17", title: "صفحة تسجيل العملاء وإعادة تصميم تفاصيل المشروع",
    items: [
      { type: "feature", text: "صفحة تسجيل العملاء — للمبيعات والتسويق مع رؤية منفصلة لكل موظف" },
      { type: "feature", text: "المسؤول يرى من أضاف العميل مع التاريخ والوقت" },
      { type: "improvement", text: "إعادة تصميم كاملة لصفحة تفاصيل المشروع بشكل أنيق وسلس" },
      { type: "improvement", text: "وحدات المشروع بتصميم قائمة أفقية مع زر مقارنة أنيق" },
      { type: "improvement", text: "نافذة مقارنة الوحدات محسّنة مع حساب سعر المتر المربع" },
      { type: "improvement", text: "الشريط الجانبي في تفاصيل المشروع على اليمين بشكل صحيح" },
    ],
  },
  {
    version: "2.6.0", date: "2026-05-17", title: "الإشعارات وسلة مهملات الصفوف",
    items: [
      { type: "fix", text: "إصلاح رسالة تأكيد الحذف: قسم الحسابات لا يرى ذكر سلة المحذوفات" },
      { type: "fix", text: "إصلاح موضع منتقي التاريخ: يفتح للأعلى عند الاقتراب من أسفل الصفحة" },
      { type: "feature", text: "تكبير وتصغير حجم خط الجداول المحاسبية" },
      { type: "feature", text: "إشعار للمسؤول عند وصول عميل محتمل جديد" },
      { type: "feature", text: "إرسال إشعار واتساب لأرقام متعددة عند وصول عميل" },
      { type: "feature", text: "ترقية زوار الموقع إلى موظفين من صفحة إدارة المستخدمين" },
      { type: "feature", text: "سلة مهملات للصفوف المحذوفة في الحسابات (للمسؤول فقط)" },
    ],
  },
  {
    version: "2.5.0", date: "2026-05-17", title: "سلة المحذوفات وتحسينات سجل النشاط وتجربة المستخدم",
    items: [
      { type: "feature", text: "سلة محذوفات للسجلات المحاسبية — استعادة أو حذف نهائي (للمسؤول فقط)" },
      { type: "improvement", text: "حذف ناعم (Soft Delete) للجداول المحاسبية بدلاً من الحذف الفوري" },
      { type: "feature", text: "حذف سجلات النشاط منفردةً أو مسح الكل مع تأكيد" },
      { type: "improvement", text: "تحديث مدة الاحتفاظ بسجل النشاط إلى ٧ أيام مع ملاحظة تلقائية" },
      { type: "improvement", text: "تقسيم صفحة المستخدمين إلى تبويبين: الموظفون وزوار الموقع" },
      { type: "improvement", text: "مزامنة تسميات الإحصائيات بين الرئيسية ولوحة إدارة المحتوى" },
    ],
  },
  {
    version: "2.4.0", date: "2026-05-17", title: "منتقي التاريخ العربي وتحسينات الأداء",
    items: [
      { type: "feature", text: "منتقي تاريخ عربي مخصص في جميع أنحاء لوحة التحكم" },
      { type: "feature", text: "ربط Cloudinary لعرض المساحة المستخدمة في مكتبة الوسائط" },
      { type: "improvement", text: "تحسين مكتبة الوسائط: بار المساحة وإحصائيات التخزين" },
      { type: "feature", text: "زر تعديل سريع للمسؤول من صفحات الموقع العامة" },
      { type: "improvement", text: "تقسيم الكود (Code Splitting) لتحميل أسرع للصفحات" },
      { type: "improvement", text: "إعادة تنظيم الإعدادات وإدارة المحتوى" },
      { type: "improvement", text: "تواريخ بمراحل منطقية تبدأ من يونيو ٢٠٢٥" },
    ],
  },
  {
    version: "2.3.0", date: "2026-04-01", title: "إعادة تصميم تفاصيل المشروع وإصلاحات الحسابات",
    items: [
      { type: "improvement", text: "إزالة صفحة الوحدات من قائمة التنقل العامة" },
      { type: "feature", text: "نقل عرض الوحدات إلى تفاصيل كل مشروع مع فلترة (متاح/مباعة/محجوز)" },
      { type: "feature", text: "إضافة ميزة مقارنة الوحدات جنباً إلى جنب في صفحة تفاصيل المشروع" },
      { type: "improvement", text: "إعادة تصميم صفحة تفاصيل المشروع بشكل كامل مع عرض بطولي للصور" },
      { type: "improvement", text: "استبدال حقلي خط العرض/الطول برابط تضمين Google Maps" },
      { type: "feature", text: "إضافة ميزة إدخال مميزات مخصصة في المشاريع والوحدات" },
      { type: "fix", text: "إصلاح خطأ 500 عند إضافة جدول حسابي جديد (إضافة أنواع formula وpercentage)" },
      { type: "fix", text: "إصلاح عرض القائمة المنسدلة (select) في الحسابات مع إمكانية إدخال الخيارات" },
      { type: "fix", text: "إصلاح حجم الأرقام عند إضافة صف جديد في الجداول" },
      { type: "improvement", text: "تحسين عرض التواريخ بالعربية في جداول الحسابات" },
      { type: "feature", text: "إضافة Vercel Speed Insights لتتبع أداء الموقع" },
    ],
  },
  {
    version: "2.2.0", date: "2026-02-14", title: "إصلاحات وتحسينات الموقع العام",
    items: [
      { type: "fix", text: "إصلاح حفظ صور معرض المشاريع (كانت لا تحفظ بسبب خطأ في اسم الحقل)" },
      { type: "fix", text: "إصلاح حفظ إحداثيات الخريطة للمشاريع (lat/lng)" },
      { type: "feature", text: "عرض خريطة Google Maps في صفحة تفاصيل المشروع" },
      { type: "feature", text: "عرض المميزات والمرافق في صفحة تفاصيل المشروع" },
      { type: "feature", text: "عرض اسم المطوّر العقاري في بطاقات المشاريع" },
      { type: "feature", text: "فيديو YouTube في صفحة تفاصيل المشروع" },
      { type: "feature", text: "زر واتساب في صفحة تفاصيل المشروع" },
      { type: "improvement", text: "إعادة تصميم صفحة المشاريع العامة ببطاقات أجمل" },
      { type: "improvement", text: "بحث تلقائي في المشاريع بدون ضغط Enter" },
      { type: "fix", text: "إصلاح CMS: بيانات الرئيسية (Hero + Stats) تتحدث فوراً" },
      { type: "fix", text: "useCms يحتفظ بالبيانات في localStorage لعرض فوري" },
      { type: "feature", text: "واتساب العملاء: رسالة منسقة تلقائية من صفحة العملاء" },
      { type: "feature", text: "زر واتساب عائم في جميع صفحات الموقع" },
      { type: "feature", text: "مقارنة الوحدات للمستخدمين المسجلين في الموقع" },
      { type: "feature", text: "عرض مساحة Cloudinary المستخدمة في مكتبة الوسائط" },
      { type: "improvement", text: "إعادة تصميم صفحة الوحدات العامة ببطاقات احترافية" },
      { type: "improvement", text: "واجهة المهام موحدة لجميع الأدوار" },
      { type: "fix", text: "أيقونة وعنوان تاب المتصفح باللغة العربية" },
    ],
  },
  {
    version: "2.1.0", date: "2025-12-10", title: "تحديث التحسينات الشاملة",
    items: [
      { type: "feature", text: "واجهة موحدة لجميع الأدوار (مشرف، موظف، مبيعات، حسابات)" },
      { type: "feature", text: "صلاحيات مفصّلة: كل دور يرى القائمة الخاصة به فقط" },
      { type: "feature", text: "سجلات محاسبية بالقيد المزدوج (مدين / دائن)" },
      { type: "feature", text: "أعمدة معادلات في جداول الحسابات (مثال: col1 * col2)" },
      { type: "feature", text: "لوحة معدلات وتحليل: مجموع، متوسط، أدنى، أقصى لكل عمود" },
      { type: "feature", text: "صفحة الإشعارات المستقلة مع فلترة وترقيم صفحات" },
      { type: "feature", text: "طباعة صفوف محددة من جداول الحسابات" },
      { type: "feature", text: "بحث فوري وملاحظات لكل صف في الجدول" },
      { type: "feature", text: "استيراد ملفات Excel مع إنشاء جدول تلقائي" },
      { type: "feature", text: "مرافق وخصائص موسّعة للوحدات (30+ ميزة)" },
      { type: "feature", text: "مقارنة جانبية لـ 3 وحدات عقارية في آنٍ واحد" },
      { type: "feature", text: "نوع الإنهاء والجهة للوحدات (تشطيب، إطلالة)" },
      { type: "feature", text: "حقل 'الدور' للوحدات يقبل حروفاً وأرقاماً (أرضي، الدور الأول، B1)" },
      { type: "feature", text: "معرض صور متعدد للمشاريع مع إحداثيات الخريطة" },
      { type: "feature", text: "تاريخ التسليم المتوقع وعرض البطاقات للمشاريع" },
      { type: "feature", text: "المفضلة في المشاريع والوحدات (يحفظ محلياً)" },
      { type: "feature", text: "تحديد جماعي وتغيير حالة متعدد الوحدات" },
      { type: "improvement", text: "عرض كانبان للمهام: 3 أعمدة (معلق / جارٍ / مكتمل)" },
      { type: "improvement", text: "شريط تقدم المهام وفلتر الأولوية وزر الإنجاز السريع" },
      { type: "improvement", text: "تحسينات الموبايل في المهام والحسابات" },
      { type: "fix", text: "حماية أمنية: mongoSanitize، HPP، GZIP، Rate Limiting" },
      { type: "fix", text: "التحقق من صحة البيانات على مسارات الحسابات" },
      { type: "improvement", text: "شروحات الاستخدام (HelpCard) في كل قسم" },
      { type: "improvement", text: "تنظيم الإعدادات والمحتوى بشكل أوضح" },
    ],
  },
  {
    version: "2.0.0", date: "2025-10-01", title: "نظام الحسابات والمهام — المرحلة الثانية",
    items: [
      { type: "feature", text: "نظام الحسابات المتكامل (دفاتر، جداول، صفوف)" },
      { type: "feature", text: "استيراد ملفات Excel" },
      { type: "feature", text: "طباعة صفوف محددة من الجداول" },
      { type: "feature", text: "سجل التدقيق للعمليات المحاسبية" },
      { type: "feature", text: "إشعارات المهام مع جرس التنبيه" },
      { type: "feature", text: "واجهة المبيعات (مشاريع، وحدات، عملاء، مقالات)" },
      { type: "improvement", text: "تحسينات عرض المحتوى وإدارته" },
      { type: "feature", text: "أقسام صفحة الخدمات" },
      { type: "feature", text: "شعار قابل للتغيير من لوحة الإدارة" },
      { type: "improvement", text: "فصل المهام حسب القسم والدور" },
    ],
  },
  {
    version: "1.5.0", date: "2025-08-20", title: "تطوير المحتوى والإدارة",
    items: [
      { type: "feature", text: "قسم إدارة المحتوى" },
      { type: "feature", text: "صفحة الوظائف" },
      { type: "feature", text: "نظام الإشعارات" },
      { type: "feature", text: "لوحة التحكم مع الإحصائيات" },
      { type: "feature", text: "صفحات الوحدات والمشاريع" },
    ],
  },
  {
    version: "1.1.0", date: "2025-07-15", title: "تحسينات ما بعد الإطلاق",
    items: [
      { type: "improvement", text: "تحسين أداء تحميل الصور" },
      { type: "fix", text: "إصلاح مشكلة تسجيل الدخول على الأجهزة المحمولة" },
      { type: "feature", text: "إضافة نظام الأدوار والصلاحيات" },
      { type: "improvement", text: "تحسين تجربة المستخدم في لوحة التحكم" },
    ],
  },
  {
    version: "1.0.0", date: "2025-06-01", title: "إطلاق المشروع — المرحلة الأولى",
    items: [
      { type: "feature", text: "إطلاق الموقع الأول" },
      { type: "feature", text: "نظام تسجيل الدخول" },
      { type: "feature", text: "إدارة المشاريع" },
      { type: "feature", text: "المدونة والأخبار" },
    ],
  },
];

export default function AdminChangelog() {
  return (
    <Box dir="rtl">
      <Group gap="sm" mb="lg">
        <ThemeIcon size={44} color="brand"><FaClockRotateLeft size={20} /></ThemeIcon>
        <Box>
          <Title order={2} size="h3">سجل التحديثات</Title>
          <Text size="sm" c="dimmed">تاريخ التحسينات والميزات الجديدة في النظام</Text>
        </Box>
      </Group>

      <Timeline active={0} bulletSize={26} lineWidth={2} color="brand">
        {VERSIONS.map((v, i) => (
          <Timeline.Item key={v.version} title={
            <Group gap={8}>
              <Text fw={800} c="brand.7">الإصدار {v.version}</Text>
              {i === 0 && <Badge color="teal" size="sm">الأحدث</Badge>}
              <Text size="xs" c="dimmed" ml="auto">{v.date}</Text>
            </Group>
          }>
            <Card withBorder mt={6}>
              <Text size="sm" c="dimmed" mb="sm">{v.title}</Text>
              <Stack gap={8}>
                {v.items.map((item, idx) => {
                  const meta = TYPE_META[item.type] || TYPE_META.improvement;
                  return (
                    <Group key={idx} gap={10} wrap="nowrap" align="flex-start">
                      <ThemeIcon size={26} variant="light" color={meta.color} style={{ flexShrink: 0 }}>
                        <meta.icon size={13} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" pt={3}>{item.text}</Text>
                    </Group>
                  );
                })}
              </Stack>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>

      <Text ta="center" size="xs" c="dimmed" mt="lg">AG Development © 2026</Text>
    </Box>
  );
}
