import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

/* Wraps any async PDF export with loading/success/error toasts */
const withToast = (fn) => async (...args) => {
  const id = toast.loading('جارٍ إنشاء ملف PDF...');
  try {
    await fn(...args);
    toast.success('تم تنزيل الملف بنجاح', { id });
  } catch (err) {
    console.error(err);
    toast.error('فشل إنشاء الملف، يرجى المحاولة مجدداً', { id });
  }
};

/* ─── Brand ─────────────────────────────── */
const PRIMARY  = '#c8161d';
const DARK     = '#231f20';
const GOLD     = '#fbb140';
const GREEN    = '#009756';

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtStatus = (s) => ({ paid: 'مدفوع', pending: 'قيد الانتظار', overdue: 'متأخر', partial: 'جزئي', cancelled: 'ملغي' }[s] || s || '—');
const fmtPayMethod = (m) => ({ cash: 'كاش', bank: 'تحويل بنكي', check: 'شيك', installments: 'تقسيط' }[m] || m || '—');

/* ─── Build header HTML from company data ─── */
const makeHeader = (company, docType, docNum) => {
  const name = company?.name || 'EgyEstate';
  const sub  = company?.city ? `${company.city} — نظام إدارة العقارات` : 'نظام إدارة العقارات';
  const logoHtml = company?.logo
    ? `<img src="${company.logo}" style="height:44px;max-width:120px;object-fit:contain;filter:brightness(0)invert(1)" onerror="this.style.display='none'" />`
    : `<div class="name">${name}</div><div class="sub">${sub}</div>`;
  return `
    <div class="header">
      <div class="header-logo">${logoHtml}${company?.logo ? `<div class="sub" style="margin-top:4px">${name}</div>` : ''}</div>
      <div class="header-title">
        <div class="doc-type">${docType}</div>
        <div class="doc-num">${docNum}</div>
      </div>
    </div>
  `;
};

const makeFooter = (company, page, total) => {
  const name = company?.name || 'EgyEstate';
  return `
    <div class="footer">
      <span>${name} © ${new Date().getFullYear()} — جميع الحقوق محفوظة</span>
      <span>${page} / ${total}</span>
    </div>
  `;
};

/* ─── Base styles (injected in every template) ─── */
const BASE_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, div, td, th, p, span, h1, h2, h3 {
    font-family: 'Cairo', 'Tajawal', Arial, sans-serif !important;
    direction: rtl; text-align: right;
  }
  .page { width: 794px; min-height: 1123px; background: #fff; padding: 0; position: relative; }
  .header { background: ${PRIMARY}; padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; }
  .header-logo { color: #fff; }
  .header-logo .name { font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
  .header-logo .sub  { font-size: 11px; opacity: 0.8; margin-top: 2px; }
  .header-title { text-align: left; color: #fff; }
  .header-title .doc-type { font-size: 13px; opacity: 0.8; }
  .header-title .doc-num  { font-size: 18px; font-weight: 700; margin-top: 2px; }
  .body { padding: 28px 32px; }
  .section { margin-bottom: 22px; }
  .section-title {
    font-size: 12px; font-weight: 700; color: ${PRIMARY};
    border-right: 4px solid ${PRIMARY}; padding-right: 10px;
    margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .info-row { display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
  .info-label { font-size: 11px; color: #888; font-weight: 600; }
  .info-value { font-size: 12px; color: #1a1a1a; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: ${PRIMARY}; color: #fff; padding: 9px 12px; font-weight: 700; font-size: 11px; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0eded; color: #1a1a1a; }
  tr:nth-child(even) td { background: #faf8f8; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-paid    { background: #dcfce7; color: #166534; }
  .badge-pending { background: #fef9c3; color: #854d0e; }
  .badge-overdue { background: #fee2e2; color: #991b1b; }
  .badge-partial { background: #dbeafe; color: #1e40af; }
  .total-box { background: #fff8f8; border: 2px solid ${PRIMARY}; border-radius: 8px; padding: 14px 18px; margin-top: 10px; }
  .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #333; }
  .total-row.grand { font-size: 15px; font-weight: 900; color: ${PRIMARY}; border-top: 1px solid #e5c0c0; margin-top: 6px; padding-top: 8px; }
  .sig-area { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 20px; border-top: 1px solid #eee; }
  .sig-box { text-align: center; width: 180px; }
  .sig-line { border-top: 1.5px solid #ccc; margin: 40px auto 6px; width: 140px; }
  .sig-label { font-size: 11px; color: #888; font-weight: 600; }
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    border-top: 1px solid #eee; padding: 10px 32px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer span { font-size: 9px; color: #aaa; }
  .gold-bar { height: 4px; background: linear-gradient(to left, ${PRIMARY}, ${GOLD}); }
  .page-num { position: absolute; bottom: 10px; left: 32px; font-size: 9px; color: #aaa; }
`;

/* ─── Core renderer ─────────────────────── */
const renderToPDF = async (pages, filename) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW  = 794; // px @ 96dpi ≈ A4 width

  for (let i = 0; i < pages.length; i++) {
    const container = document.createElement('div');
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${PW}px;background:#fff;`;
    container.innerHTML = `<style>${BASE_STYLE}</style>${pages[i]}`;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: PW,
    });
    document.body.removeChild(container);

    const imgData   = canvas.toDataURL('image/jpeg', 0.95);
    const pdfW      = pdf.internal.pageSize.getWidth();
    const pdfH      = (canvas.height * pdfW) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
  }

  pdf.save(filename);
};

/* ─── Paginate rows (for long tables) ─── */
const chunkRows = (rows, size = 25) => {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) chunks.push(rows.slice(i, i + size));
  return chunks.length ? chunks : [[]];
};

/* ══════════════════════════════════════════
   CONTRACT PDF
══════════════════════════════════════════ */
export const exportContractPDF = withToast(async (contract, company) => {
  const installRows = contract.installments || [];
  const rowChunks   = chunkRows(installRows, 20);
  const totalPages  = rowChunks.length;

  const pages = rowChunks.map((chunk, pageIdx) => {
    const isFirst = pageIdx === 0;

    const infoSection = isFirst ? `
      <div class="section">
        <div class="section-title">بيانات العميل</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">الاسم</span><span class="info-value">${contract.customerId?.name || '—'}</span></div>
          <div class="info-row"><span class="info-label">الهاتف</span><span class="info-value">${contract.customerId?.phone || '—'}</span></div>
          <div class="info-row"><span class="info-label">الرقم القومي</span><span class="info-value">${contract.customerId?.nationalId || '—'}</span></div>
          <div class="info-row"><span class="info-label">العنوان</span><span class="info-value">${contract.customerId?.address || '—'}</span></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">بيانات الوحدة</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">المشروع</span><span class="info-value">${contract.propertyId?.name || '—'}</span></div>
          <div class="info-row"><span class="info-label">رقم الوحدة</span><span class="info-value">${contract.unitId?.unitNumber || '—'}</span></div>
          <div class="info-row"><span class="info-label">الدور</span><span class="info-value">${contract.unitId?.floor || '—'}</span></div>
          <div class="info-row"><span class="info-label">المساحة</span><span class="info-value">${contract.unitId?.area ? contract.unitId.area + ' م²' : '—'}</span></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">بيانات العقد</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">قيمة العقد</span><span class="info-value">${fmt(contract.totalPrice)} ج.م</span></div>
          <div class="info-row"><span class="info-label">المقدم</span><span class="info-value">${fmt(contract.downPayment)} ج.م</span></div>
          <div class="info-row"><span class="info-label">المتبقي</span><span class="info-value">${fmt(contract.remainingAmount)} ج.م</span></div>
          <div class="info-row"><span class="info-label">طريقة السداد</span><span class="info-value">${fmtPayMethod(contract.paymentMethod)}</span></div>
          <div class="info-row"><span class="info-label">تاريخ البداية</span><span class="info-value">${fmtDate(contract.startDate)}</span></div>
          <div class="info-row"><span class="info-label">تاريخ النهاية</span><span class="info-value">${fmtDate(contract.endDate)}</span></div>
        </div>
      </div>
    ` : '';

    const tableRows = chunk.map((inst, i) => {
      const globalIdx = pageIdx * 20 + i + 1;
      const badge     = `<span class="badge badge-${inst.status}">${fmtStatus(inst.status)}</span>`;
      return `<tr>
        <td style="text-align:center;color:#888">${globalIdx}</td>
        <td>${fmtDate(inst.dueDate)}</td>
        <td style="font-weight:700">${fmt(inst.amount)} ج.م</td>
        <td style="color:${GREEN};font-weight:600">${fmt(inst.paidAmount)} ج.م</td>
        <td style="text-align:center">${badge}</td>
      </tr>`;
    }).join('');

    const installTable = installRows.length ? `
      <div class="section">
        <div class="section-title">جدول الأقساط${totalPages > 1 ? ` (صفحة ${pageIdx + 1} من ${totalPages})` : ''}</div>
        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center">#</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ</th>
              <th>المدفوع</th>
              <th style="text-align:center">الحالة</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    ` : '';

    const sigArea = (pageIdx === totalPages - 1) ? `
      <div class="sig-area">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع البائع / الشركة</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع المشتري / العميل</div>
        </div>
      </div>
    ` : '';

    return `
      <div class="page">
        <div class="gold-bar"></div>
        ${makeHeader(company, `عقد ${contract.type === 'sale' ? 'بيع' : 'إيجار'}`, contract.contractNumber)}
        <div class="body">
          ${isFirst ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:11px;color:#888;padding-bottom:10px;border-bottom:2px solid #f5f5f5">
              <span>تاريخ الطباعة: ${fmtDate(new Date())}</span>
              <span>حالة العقد: <strong style="color:${PRIMARY}">${fmtStatus(contract.status)}</strong></span>
            </div>
          ` : ''}
          ${infoSection}
          ${installTable}
          ${sigArea}
        </div>
        ${makeFooter(company, pageIdx + 1, totalPages)}
      </div>
    `;
  });

  await renderToPDF(pages, `contract-${contract.contractNumber}.pdf`);
});

/* ══════════════════════════════════════════
   INVOICE PDF
══════════════════════════════════════════ */
export const exportInvoicePDF = withToast(async (invoice, company) => {
  const items = invoice.items?.length
    ? invoice.items
    : [{ description: 'دفعة عقارية', quantity: 1, unitPrice: invoice.subtotal, total: invoice.subtotal }];

  const itemRows = items.map(item => `
    <tr>
      <td>${item.description || '—'}</td>
      <td style="text-align:center">${item.quantity || 1}</td>
      <td style="font-weight:600">${fmt(item.unitPrice)} ج.م</td>
      <td style="font-weight:700;color:${PRIMARY}">${fmt(item.total)} ج.م</td>
    </tr>
  `).join('');

  const tax      = invoice.taxRate ? invoice.subtotal * invoice.taxRate / 100 : 0;
  const discount = invoice.discount || 0;

  const page = `
    <div class="page">
      <div class="gold-bar"></div>
      ${makeHeader(company, 'فاتورة رسمية', invoice.invoiceNumber)}
      <div class="body">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:11px;color:#888;padding-bottom:10px;border-bottom:2px solid #f5f5f5">
          <span>تاريخ الطباعة: ${fmtDate(new Date())}</span>
          <span>الحالة: <strong style="color:${invoice.status === 'paid' ? GREEN : invoice.status === 'overdue' ? '#dc2626' : '#d97706'}">${fmtStatus(invoice.status)}</strong></span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div style="background:#faf8f8;border-radius:8px;padding:14px">
            <div class="section-title" style="margin-bottom:10px">بيانات العميل</div>
            <div class="info-row"><span class="info-label">الاسم</span><span class="info-value">${invoice.customerId?.name || '—'}</span></div>
            <div class="info-row"><span class="info-label">الهاتف</span><span class="info-value">${invoice.customerId?.phone || '—'}</span></div>
            <div class="info-row"><span class="info-label">العقد</span><span class="info-value">${invoice.contractId?.contractNumber || '—'}</span></div>
          </div>
          <div style="background:#faf8f8;border-radius:8px;padding:14px">
            <div class="section-title" style="margin-bottom:10px">تفاصيل الفاتورة</div>
            <div class="info-row"><span class="info-label">تاريخ الإصدار</span><span class="info-value">${fmtDate(invoice.issueDate)}</span></div>
            <div class="info-row"><span class="info-label">تاريخ الاستحقاق</span><span class="info-value">${fmtDate(invoice.dueDate)}</span></div>
            <div class="info-row"><span class="info-label">طريقة الدفع</span><span class="info-value">${fmtPayMethod(invoice.paymentMethod)}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">بنود الفاتورة</div>
          <table>
            <thead>
              <tr>
                <th>البيان</th>
                <th style="text-align:center;width:60px">الكمية</th>
                <th style="width:100px">سعر الوحدة</th>
                <th style="width:100px">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:flex-start;margin-top:4px">
          <div class="total-box" style="min-width:260px">
            <div class="total-row"><span>المجموع الفرعي</span><span>${fmt(invoice.subtotal)} ج.م</span></div>
            ${invoice.taxRate ? `<div class="total-row"><span>ضريبة (${invoice.taxRate}%)</span><span>+ ${fmt(tax)} ج.م</span></div>` : ''}
            ${discount ? `<div class="total-row" style="color:#dc2626"><span>خصم</span><span>- ${fmt(discount)} ج.م</span></div>` : ''}
            <div class="total-row grand"><span>الإجمالي النهائي</span><span>${fmt(invoice.total)} ج.م</span></div>
            <div class="total-row" style="color:${GREEN}"><span>المدفوع</span><span>${fmt(invoice.paidAmount)} ج.م</span></div>
            <div class="total-row" style="color:${invoice.balanceDue > 0 ? '#dc2626' : GREEN};font-weight:700">
              <span>المتبقي</span><span>${fmt(invoice.balanceDue)} ج.م</span>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div style="margin-top:20px;padding:12px 14px;background:#fffbf0;border-right:3px solid ${GOLD};border-radius:4px">
            <p style="font-size:10px;color:#888;margin-bottom:4px;font-weight:700">ملاحظات:</p>
            <p style="font-size:11px;color:#333;line-height:1.6">${invoice.notes}</p>
          </div>
        ` : ''}
      </div>
      ${makeFooter(company, 1, 1)}
    </div>
  `;

  await renderToPDF([page], `invoice-${invoice.invoiceNumber}.pdf`);
});

/* ══════════════════════════════════════════
   FINANCIAL REPORT PDF
══════════════════════════════════════════ */
export const exportFinancialReportPDF = withToast(async (data, dateRange, company) => {
  const payRows = (data.payments || []).slice(0, 50).map(p => `
    <tr>
      <td>${p.customerId?.name || '—'}</td>
      <td style="text-align:center">${p.invoiceId?.invoiceNumber || '—'}</td>
      <td>${fmtDate(p.date)}</td>
      <td style="text-align:center">${fmtPayMethod(p.method)}</td>
      <td style="font-weight:700;color:${GREEN}">${fmt(p.amount)} ج.م</td>
    </tr>
  `).join('');

  const page = `
    <div class="page">
      <div class="gold-bar"></div>
      ${makeHeader(company, 'التقرير المالي', dateRange ? `${dateRange.start} — ${dateRange.end}` : 'إجمالي')}
      <div class="body">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:24px">
          ${[
            { label: 'إجمالي الإيرادات', value: fmt(data.totalRevenue) + ' ج.م', color: GREEN, bg: '#f0fdf4' },
            { label: 'إجمالي المصروفات', value: fmt(data.totalExpenses) + ' ج.م', color: '#dc2626', bg: '#fef2f2' },
            { label: 'صافي الربح', value: fmt(data.netProfit) + ' ج.م', color: data.netProfit >= 0 ? GREEN : '#dc2626', bg: data.netProfit >= 0 ? '#f0fdf4' : '#fef2f2' },
          ].map(b => `
            <div style="background:${b.bg};border-radius:10px;padding:16px;border-right:4px solid ${b.color}">
              <p style="font-size:10px;color:#888;font-weight:600;margin-bottom:6px">${b.label}</p>
              <p style="font-size:18px;font-weight:900;color:${b.color}">${b.value}</p>
            </div>
          `).join('')}
        </div>

        ${payRows ? `
          <div class="section">
            <div class="section-title">سجل المدفوعات</div>
            <table>
              <thead>
                <tr>
                  <th>العميل</th>
                  <th style="text-align:center">رقم الفاتورة</th>
                  <th>التاريخ</th>
                  <th style="text-align:center">طريقة الدفع</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>${payRows}</tbody>
            </table>
          </div>
        ` : '<p style="color:#888;text-align:center;padding:40px;font-size:13px">لا توجد مدفوعات في هذه الفترة</p>'}
      </div>
      ${makeFooter(company, 1, 1)}
    </div>
  `;

  await renderToPDF([page], `financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
});
