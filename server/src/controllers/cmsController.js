const CmsPage = require('../models/CmsPage');
const { success, error } = require('../utils/response');

const DEFAULT_LANDING = {
  pageKey: 'landing',
  title: 'الصفحة الرئيسية',
  sections: [
    {
      key: 'hero', type: 'hero', order: 0, visible: true,
      title: 'إدارة عقاراتك بذكاء واحترافية',
      subtitle: 'منصة EgyEstate السحابية — كل ما تحتاجه لإدارة مشاريعك العقارية في مكان واحد',
      items: [],
    },
    {
      key: 'stats', type: 'stats', order: 1, visible: true,
      title: 'أرقام تتحدث عن نفسها',
      items: [
        { label: 'شركة عقارية', value: '150+' },
        { label: 'وحدة مُدارة', value: '12,000+' },
        { label: 'عقد مُوثَّق', value: '45,000+' },
        { label: 'نسبة رضا العملاء', value: '98%' },
      ],
    },
    {
      key: 'features', type: 'features', order: 2, visible: true,
      title: 'كل ما تحتاجه في منصة واحدة',
      subtitle: 'أدوات متكاملة مصممة خصيصاً للسوق العقاري العربي',
      items: [
        { icon: 'FaBuilding', title: 'إدارة المشاريع والوحدات', desc: 'تتبع كامل لجميع مشاريعك وحالة كل وحدة لحظة بلحظة' },
        { icon: 'FaFileContract', title: 'العقود والأقساط', desc: 'إنشاء وإدارة العقود مع جدول أقساط تلقائي وتنبيهات الاستحقاق' },
        { icon: 'FaChartLine', title: 'تقارير مالية متقدمة', desc: 'تحليل الإيرادات والمصروفات وصافي الربح بمخططات تفاعلية' },
        { icon: 'FaUsers', title: 'إدارة العملاء CRM', desc: 'ملفات عملاء شاملة مع تاريخ كامل للتعاملات والمدفوعات' },
        { icon: 'FaBell', title: 'إشعارات فورية', desc: 'تنبيهات لحظية للأقساط المستحقة وكل الأحداث المهمة' },
        { icon: 'FaShield', title: 'صلاحيات متقدمة RBAC', desc: 'تحكم كامل في صلاحيات كل مستخدم وحماية البيانات' },
      ],
    },
    {
      key: 'pricing', type: 'pricing', order: 3, visible: true,
      title: 'باقات تناسب كل حجم شركة',
      subtitle: 'ابدأ مجاناً وطور خطتك مع نمو أعمالك',
      items: [],
    },
    {
      key: 'faq', type: 'faq', order: 4, visible: true,
      title: 'الأسئلة الشائعة',
      items: [
        { q: 'هل يمكنني تجربة المنصة قبل الدفع؟', a: 'نعم، نقدم تجربة مجانية لمدة 14 يوماً بدون الحاجة لبيانات بنكية.' },
        { q: 'هل البيانات محمية ومشفرة؟', a: 'نعم، نستخدم تشفير SSL من الدرجة الأولى وخوادم AWS موثوقة.' },
        { q: 'هل يدعم النظام اللغة العربية بالكامل؟', a: 'نعم، النظام مصمم بالكامل للغة العربية ويدعم RTL.' },
        { q: 'هل يمكن استخدام النظام من الجوال؟', a: 'نعم، النظام متجاوب بالكامل مع جميع أحجام الشاشات.' },
      ],
    },
    {
      key: 'cta', type: 'cta', order: 5, visible: true,
      title: 'ابدأ الآن وحوّل إدارة عقاراتك',
      subtitle: 'انضم لأكثر من 150 شركة عقارية تثق في EgyEstate',
      items: [],
    },
  ],
};

const getTenantId = (req) => req.tenantId || req.user?._id;

exports.getCmsPage = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { pageKey = 'landing' } = req.params;
    let page = await CmsPage.findOne({ companyId: tenantId, pageKey });
    if (!page) {
      page = await CmsPage.create({ companyId: tenantId, ...DEFAULT_LANDING });
    }
    return success(res, page);
  } catch (err) { return error(res, err.message); }
};

exports.updateCmsPage = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { pageKey = 'landing' } = req.params;
    const page = await CmsPage.findOneAndUpdate(
      { companyId: tenantId, pageKey },
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: false }
    );
    return success(res, page, 'تم حفظ المحتوى بنجاح');
  } catch (err) { return error(res, err.message); }
};

exports.updateSection = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { pageKey = 'landing', sectionKey } = req.params;
    const page = await CmsPage.findOne({ companyId: tenantId, pageKey });
    if (!page) return error(res, 'الصفحة غير موجودة', 404);
    const idx = page.sections.findIndex(s => s.key === sectionKey);
    if (idx === -1) {
      page.sections.push({ key: sectionKey, ...req.body });
    } else {
      Object.assign(page.sections[idx], req.body);
    }
    page.updatedBy = req.user._id;
    page.markModified('sections');
    await page.save();
    return success(res, page, 'تم تحديث القسم');
  } catch (err) { return error(res, err.message); }
};

exports.getPublicPage = async (req, res) => {
  try {
    const { companyId, pageKey = 'landing' } = req.query;
    if (!companyId) return error(res, 'companyId مطلوب', 400);
    let page = await CmsPage.findOne({ companyId, pageKey, published: true });
    if (!page) page = { sections: DEFAULT_LANDING.sections };
    return success(res, page);
  } catch (err) { return error(res, err.message); }
};
