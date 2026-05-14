import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { getListings, deleteListing } from '../../lib/api';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';

export default function ListingsTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery('all-listings', () =>
    getListings({ limit: 200 }).then((r) => r.data)
  );

  const deleteMutation = useMutation((id) => deleteListing(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('all-listings');
      setConfirmDelete(null);
    },
  });

  const listings = (data?.listings || data || []).filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#12283C] font-black text-xl">إدارة المشاريع</h2>
          <p className="text-[#6b5e3e] text-sm">
            {listings.length} مشروع
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="flex items-center gap-2 px-4 py-2 bg-[#8A6924] text-white font-bold text-sm hover:bg-[#DFBA6B] hover:text-[#12283C] transition-colors"
        >
          <FaPlus />
          إضافة مشروع
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A6924] text-xs" />
        <input
          type="text"
          placeholder="ابحث عن مشروع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pr-8 pl-3 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border-collapse">
            <thead>
              <tr className="bg-[#12283C] text-[#DFBA6B]">
                <th className="px-4 py-3 font-bold">المشروع</th>
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">المدينة</th>
                <th className="px-4 py-3 font-bold">السعر</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <motion.tr
                  key={l._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#8A6924]/10 hover:bg-[#8A6924]/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {l.imageUrls?.[0] && (
                        <img
                          src={l.imageUrls[0]}
                          alt={l.name}
                          className="w-10 h-8 object-cover flex-shrink-0"
                        />
                      )}
                      <span className="font-bold text-[#12283C] line-clamp-1">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6b5e3e]">{l.type || '-'}</td>
                  <td className="px-4 py-3 text-[#6b5e3e]">{l.city || '-'}</td>
                  <td className="px-4 py-3 text-[#8A6924] font-bold">
                    {l.price ? `${Number(l.price).toLocaleString('ar-SA')} ريال` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge type={l.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/listings/${l.slug || l._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#6b5e3e] hover:text-[#12283C] transition-colors"
                        title="عرض"
                      >
                        <FaEye size={13} />
                      </a>
                      <button
                        onClick={() => navigate(`/dashboard/update/${l._id}`)}
                        className="p-1.5 text-[#8A6924] hover:text-[#DFBA6B] transition-colors"
                        title="تعديل"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(l._id)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                        title="حذف"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <div className="text-center py-12 text-[#6b5e3e]">لا توجد مشاريع</div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 max-w-sm w-full mx-4 shadow-xl border border-red-200">
            <h3 className="font-black text-[#12283C] text-lg mb-2">تأكيد الحذف</h3>
            <p className="text-[#6b5e3e] text-sm mb-4">هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(confirmDelete)}
                disabled={deleteMutation.isLoading}
                className="flex-1 py-2 bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
              >
                {deleteMutation.isLoading ? 'جاري الحذف...' : 'حذف'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-[#8A6924]/30 text-[#12283C] font-bold text-sm hover:bg-[#8A6924]/5 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
