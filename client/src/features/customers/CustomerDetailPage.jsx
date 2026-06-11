import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customersAPI, contractsAPI, invoicesAPI, documentsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FaArrowRight, FaUser, FaPhone, FaEnvelope, FaLocationDot,
  FaIdCard, FaFileContract, FaFileInvoice, FaMoneyBillWave,
  FaFolder, FaDownload, FaFileLines, FaFileImage, FaFile,
} from 'react-icons/fa6';

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG') : '—';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <Icon className="text-sm opacity-40 flex-shrink-0" />
    <span className="text-xs opacity-50 w-24 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium">{value || '—'}</span>
  </div>
);

const CONTRACT_STATUS = { active: { l: 'نشط', c: 'success' }, completed: { l: 'منتهي', c: 'info' }, cancelled: { l: 'ملغي', c: 'danger' }, draft: { l: 'مسودة', c: 'default' } };
const INVOICE_STATUS  = { paid: { l: 'مدفوعة', c: 'success' }, partial: { l: 'جزئية', c: 'warning' }, overdue: { l: 'متأخرة', c: 'danger' }, sent: { l: 'مرسلة', c: 'info' }, draft: { l: 'مسودة', c: 'default' } };

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: custData, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersAPI.getOne(id).then(r => r.data.data),
  });

  const { data: contractsData } = useQuery({
    queryKey: ['customer-contracts', id],
    queryFn: () => contractsAPI.getAll({ customerId: id, limit: 50 }).then(r => r.data),
    enabled: !!id,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['customer-invoices', id],
    queryFn: () => invoicesAPI.getAll({ customerId: id, limit: 50 }).then(r => r.data),
    enabled: !!id,
  });

  const { data: docsData } = useQuery({
    queryKey: ['customer-docs', id],
    queryFn: () => documentsAPI.getByRelated('customer', id).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  const c = custData || {};
  const contracts = contractsData?.data || [];
  const invoices  = invoicesData?.data  || [];
  const docs      = docsData?.data      || [];

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalDue  = invoices.reduce((s, i) => s + (i.balanceDue || i.balance || 0), 0);

  return (
    <div>
      <PageHeader
        title={c.name || 'ملف العميل'}
        subtitle="ملف العميل الكامل"
        actions={<Button variant="outline" onClick={() => navigate('/customers')}><FaArrowRight /> رجوع</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #da1f27, #b01820)' }}>
              {c.name?.charAt(0)}
            </div>
            <h2 className="text-lg font-bold">{c.name}</h2>
            <p className="text-sm opacity-50">{c.type === 'investor' ? 'مستثمر' : c.type === 'company' ? 'شركة' : 'فرد'}</p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge color={c.status === 'active' ? 'success' : 'default'}>{c.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
            </div>
          </div>

          {/* Info card */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3">بيانات التواصل</h3>
            <InfoRow icon={FaPhone} label="الهاتف" value={c.phone} />
            <InfoRow icon={FaEnvelope} label="البريد" value={c.email} />
            <InfoRow icon={FaIdCard} label="الرقم القومي" value={c.nationalId} />
            <InfoRow icon={FaLocationDot} label="العنوان" value={c.address} />
          </div>

          {/* Summary numbers */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-bold mb-1">الملخص المالي</h3>
            {[
              { label: 'إجمالي المشتريات', value: `${fmt(c.totalPurchases)} ج.م`, color: '#1a56db' },
              { label: 'إجمالي المدفوع', value: `${fmt(totalPaid)} ج.م`, color: '#16a34a' },
              { label: 'إجمالي المتبقي', value: `${fmt(totalDue)} ج.م`, color: '#dc2626' },
              { label: 'عدد العقود', value: contracts.length },
              { label: 'عدد الفواتير', value: invoices.length },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-xs opacity-60">{item.label}</span>
                <span className="text-sm font-bold" style={item.color ? { color: item.color } : {}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contracts + Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contracts */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <FaFileContract className="opacity-60" />
              <h3 className="font-semibold">العقود ({contracts.length})</h3>
            </div>
            {contracts.length === 0 ? (
              <p className="text-center py-8 text-sm opacity-40">لا توجد عقود</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table text-sm w-full">
                  <thead><tr><th>رقم العقد</th><th>المشروع</th><th>النوع</th><th>القيمة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                  <tbody>
                    {contracts.map(con => {
                      const s = CONTRACT_STATUS[con.status] || { l: con.status, c: 'default' };
                      return (
                        <tr key={con._id}>
                          <td className="font-mono text-xs">{con.contractNumber}</td>
                          <td>{con.propertyId?.name}</td>
                          <td><Badge color="info">{con.type === 'sale' ? 'بيع' : 'إيجار'}</Badge></td>
                          <td className="font-semibold">{fmt(con.totalPrice)} ج.م</td>
                          <td><Badge color={s.c}>{s.l}</Badge></td>
                          <td className="text-xs opacity-60">{fmtDate(con.startDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <FaFileInvoice className="opacity-60" />
              <h3 className="font-semibold">الفواتير ({invoices.length})</h3>
            </div>
            {invoices.length === 0 ? (
              <p className="text-center py-8 text-sm opacity-40">لا توجد فواتير</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table text-sm w-full">
                  <thead><tr><th>رقم الفاتورة</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>الاستحقاق</th></tr></thead>
                  <tbody>
                    {invoices.map(inv => {
                      const s = INVOICE_STATUS[inv.status] || { l: inv.status, c: 'default' };
                      return (
                        <tr key={inv._id}>
                          <td className="font-mono text-xs">{inv.invoiceNumber}</td>
                          <td className="font-semibold">{fmt(inv.total)} ج.م</td>
                          <td className="text-green-700">{fmt(inv.paidAmount)} ج.م</td>
                          <td className="text-red-700">{fmt(inv.balance)} ج.م</td>
                          <td><Badge color={s.c}>{s.l}</Badge></td>
                          <td className="text-xs opacity-60">{fmtDate(inv.dueDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Documents */}
          {docs.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <FaFolder className="opacity-60" />
                <h3 className="font-semibold">المستندات ({docs.length})</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {docs.map(doc => {
                  const DocIcon = doc.mimeType?.includes('image') ? FaFileImage
                    : doc.mimeType?.includes('pdf') ? FaFileLines : FaFile;
                  return (
                    <a key={doc._id} href={doc.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#fee2e215', color: '#c8161d' }}>
                        <DocIcon className="text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-dark)' }}>{doc.name}</p>
                        <p className="text-[10px] opacity-50">{doc.type}</p>
                      </div>
                      <FaDownload className="text-xs opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
