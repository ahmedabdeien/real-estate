import { useEffect, useState, useRef, useCallback } from "react";
import {
  FaTrash, FaUpload, FaImage, FaCopy, FaCheck,
  FaCloudArrowUp, FaCircleExclamation, FaCloud, FaHardDrive, FaWifi, FaBolt,
  FaMagnifyingGlass, FaTableCellsLarge, FaTableList, FaChevronRight, FaChevronLeft,
  FaFolderPlus, FaFolder, FaXmark, FaPen, FaArrowRight, FaSquareCheck,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary, getCloudinaryThumb } from "../../lib/cloudinary";
import api from "../../api/axios";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 1024 ? `${mb.toFixed(1)} MB` : `${(mb / 1024).toFixed(2)} GB`;
}

// ── Upload progress item ───────────────────────────────────────────────────────
function UploadItem({ file, queueId, onDone, onError }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("uploading");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    uploadToCloudinary(file, setProgress)
      .then((data) => { setStatus("done"); onDone(data, queueId); })
      .catch((err) => { setStatus("error"); onError(file.name, err.message, queueId); });
  }, []);

  const style = {
    uploading: { border: "border-blue-200", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500", icon: "text-blue-400" },
    done:      { border: "border-green-200", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600", icon: "text-green-500" },
    error:     { border: "border-red-200",   bg: "bg-red-50 dark:bg-red-900/20",   text: "text-red-500",   icon: "text-red-400" },
  }[status];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${style.border} ${style.bg}`}>
      <ImageIcon className={`w-5 h-5 shrink-0 ${style.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        {status === "uploading" && (
          <div className="mt-1">
            <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className={`text-xs mt-0.5 ${style.text}`}>{progress}%</p>
          </div>
        )}
        {status === "done"  && <p className={`text-xs ${style.text}`}>تم الرفع بنجاح</p>}
        {status === "error" && <p className={`text-xs ${style.text}`}>فشل الرفع</p>}
      </div>
    </div>
  );
}

// ── Setup banner ───────────────────────────────────────────────────────────────
function SetupBanner() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
      <FaCircleExclamation className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">إعداد Cloudinary مطلوب</p>
        <ol className="text-amber-700 dark:text-amber-400 space-y-1 list-decimal list-inside">
          <li>اشترك مجاناً على <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline font-medium">cloudinary.com</a></li>
          <li>من Dashboard انسخ الـ <strong>Cloud Name</strong></li>
          <li>Settings → Upload → Upload Presets → Add preset → <strong>Unsigned</strong> → سمّيه <code className="bg-amber-100 px-1 rounded">elsarh_unsigned</code></li>
          <li>أضف للـ .env: <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME=اسم_السحابة</code></li>
          <li>أعد تشغيل الـ Frontend</li>
        </ol>
      </div>
    </div>
  );
}

// ── Lightbox ───────────────────────────────────────────────────────────────────
function Lightbox({ items, index, onClose, onNavigate, onDelete, onRename }) {
  const item = items[index];
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(item?.name || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNameVal(item?.name || "");
    setEditingName(false);
  }, [index, item]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(-1);
      if (e.key === "ArrowLeft") onNavigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!item) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveRename = () => {
    if (nameVal.trim() && nameVal !== item.name) onRename(item._id, nameVal.trim());
    setEditingName(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center gap-4 p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition">
          <FaXmark className="w-5 h-5" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onNavigate(-1)}
          disabled={index === 0}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition shrink-0"
        >
          <FaChevronRight className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="flex-1 max-w-3xl max-h-[80vh] flex items-center justify-center">
          <img
            src={getCloudinaryThumb(item.url, 900)}
            alt={item.name}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>

        {/* Next */}
        <button
          onClick={() => onNavigate(1)}
          disabled={index === items.length - 1}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition shrink-0"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>

        {/* Details panel */}
        <div className="absolute left-4 top-16 bottom-4 w-64 bg-white dark:bg-gray-900 rounded-2xl p-4 overflow-y-auto flex flex-col gap-4 shadow-xl">
          {/* Name */}
          <div>
            <p className="text-xs text-gray-400 mb-1">الاسم</p>
            {editingName ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 text-sm border border-[var(--primary)] rounded-lg px-2 py-1 outline-none"
                />
                <button onClick={saveRename} className="text-[var(--primary)]"><FaCheck className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{item.name}</p>
                <button onClick={() => setEditingName(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[var(--primary)] transition">
                  <FaPen className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">الحجم</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{formatBytes(item.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المجلد</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.folder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">التاريخ</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {new Date(item.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
            {item.uploadedBy?.name && (
              <div className="flex justify-between">
                <span className="text-gray-400">رُفع بواسطة</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">{item.uploadedBy.name}</span>
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <p className="text-xs text-gray-400 mb-1">الرابط</p>
            <div className="flex gap-1">
              <input readOnly value={item.url} className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 truncate outline-none" />
              <button onClick={copyUrl} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition ${copied ? "bg-green-100 text-green-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"}`}>
                {copied ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => { onDelete(item._id); onClose(); }}
            className="mt-auto w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2.5 text-sm font-medium transition"
          >
            <FaTrash className="w-4 h-4" />
            حذف الصورة
          </button>
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
          {index + 1} / {items.length}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminMedia() {
  const toast = useToast();
  const inputRef = useRef();

  // data
  const [media, setMedia]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [totalAll, setTotalAll] = useState(0);

  // filters
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewSize, setViewSize] = useState("md"); // sm | md | lg

  // selection
  const [selected, setSelected] = useState(new Set());
  const lastSelectedRef = useRef(null);

  // modals
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragging, setIsDragging]   = useState(false);

  // move folder modal
  const [moveTarget, setMoveTarget] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);

  // bulk delete confirm
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [cloudUsage, setCloudUsage] = useState(null);

  // Stats derived
  const thisMonth = media.filter((m) => {
    const d = new Date(m.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalSize = media.reduce((acc, m) => acc + (m.size || 0), 0);

  // ── Load folders
  const loadFolders = async () => {
    try {
      const r = await api.get("/media/folders");
      setFolders(r.data.folders || []);
      setTotalAll(r.data.total || 0);
    } catch {}
  };

  useEffect(() => {
    api.get("/media/cloudinary-usage").then((r) => setCloudUsage(r.data)).catch(() => {});
    loadFolders();
  }, []);

  // ── Load media
  const load = async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      if (activeFolder !== "all") params.folder = activeFolder;
      if (search) params.search = search;
      const res = await api.get("/media", { params });
      setMedia(res.data.media || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error("فشل تحميل الصور"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [activeFolder, search, sort]);

  useEffect(() => { load(); }, [page, activeFolder, search, sort]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Drag & drop
  const onDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDrop      = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) { toast.error("يرجى سحب صور فقط"); return; }
    addToQueue(files);
  }, []);

  const onFileInput = (e) => { addToQueue(Array.from(e.target.files)); e.target.value = ""; };

  const addToQueue = (files) => {
    const valid = files.filter((f) => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`"${f.name}" أكبر من 10MB`); return false; }
      return true;
    });
    setUploadQueue((prev) => [...prev, ...valid.map((f) => ({ id: `${Date.now()}_${Math.random()}`, file: f }))]);
  };

  const removeFromQueue = (id) => setUploadQueue((prev) => prev.filter((i) => i.id !== id));

  const handleUploadDone = async (data, queueId) => {
    try {
      const res = await api.post("/media", data);
      setMedia((prev) => [res.data.media, ...prev]);
      setTotal((prev) => prev + 1);
      toast.success(`تم رفع ${data.name}`);
      loadFolders();
    } catch { toast.error("فشل حفظ الصورة"); }
    finally { removeFromQueue(queueId); }
  };

  const handleUploadError = (_name, _err, queueId) => {
    toast.error("فشل رفع الصورة — تحقق من إعداد Cloudinary");
    setTimeout(() => removeFromQueue(queueId), 3000);
  };

  // ── Selection
  const toggleSelect = (id, e) => {
    const idx = media.findIndex((m) => m._id === id);
    if (e.shiftKey && lastSelectedRef.current !== null) {
      const lastIdx = media.findIndex((m) => m._id === lastSelectedRef.current);
      const [from, to] = [Math.min(idx, lastIdx), Math.max(idx, lastIdx)];
      setSelected((prev) => {
        const next = new Set(prev);
        media.slice(from, to + 1).forEach((m) => next.add(m._id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      lastSelectedRef.current = id;
    }
  };

  // ── Delete single
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/media/${deleteId}`);
      setMedia((prev) => prev.filter((m) => m._id !== deleteId));
      setTotal((prev) => prev - 1);
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteId); return n; });
      toast.success("تم حذف الصورة");
      loadFolders();
    } catch { toast.error("فشل الحذف"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  // ── Bulk delete
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const ids = [...selected];
      await api.post("/media/bulk-delete", { ids });
      setMedia((prev) => prev.filter((m) => !selected.has(m._id)));
      setTotal((prev) => prev - ids.length);
      setSelected(new Set());
      toast.success(`تم حذف ${ids.length} صورة`);
      loadFolders();
    } catch { toast.error("فشل الحذف"); }
    finally { setBulkDeleting(false); setShowBulkDelete(false); }
  };

  // ── Move to folder
  const moveToFolder = async () => {
    if (!moveTarget) return;
    try {
      await Promise.all([...selected].map((id) => api.put(`/media/${id}`, { folder: moveTarget })));
      toast.success(`تم نقل ${selected.size} صورة إلى "${moveTarget}"`);
      setSelected(new Set());
      setShowMoveModal(false);
      setMoveTarget("");
      load();
      loadFolders();
    } catch { toast.error("فشل النقل"); }
  };

  // ── Rename from lightbox
  const handleRename = async (id, name) => {
    try {
      const r = await api.put(`/media/${id}/rename`, { name });
      setMedia((prev) => prev.map((m) => m._id === id ? { ...m, name: r.data.media.name } : m));
      toast.success("تم تغيير الاسم");
    } catch { toast.error("فشل تغيير الاسم"); }
  };

  // ── New folder
  const createFolder = () => {
    const name = window.prompt("اسم المجلد الجديد:");
    if (!name?.trim()) return;
    // Folder is created implicitly when images are moved/uploaded there
    setFolders((prev) => [...prev, { name: name.trim(), count: 0 }]);
    toast.success(`تم إنشاء مجلد "${name.trim()}" — يظهر بعد نقل صور إليه`);
  };

  // ── Grid cols
  const gridCols = { sm: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5", md: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4", lg: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" }[viewSize];

  return (
    <div className="flex h-full gap-0" dir="rtl">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col py-4 px-3 gap-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">المجلدات</p>

        {/* All */}
        <button
          onClick={() => setActiveFolder("all")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
            activeFolder === "all"
              ? "bg-[var(--primary)] text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            كل الصور
          </div>
          <span className={`text-xs rounded-full px-2 py-0.5 ${activeFolder === "all" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
            {totalAll}
          </span>
        </button>

        {/* Folders */}
        {folders.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFolder(f.name)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
              activeFolder === f.name
                ? "bg-[var(--primary)] text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaFolder className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{f.name}</span>
            </div>
            <span className={`text-xs rounded-full px-2 py-0.5 ${activeFolder === f.name ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
              {f.count}
            </span>
          </button>
        ))}

        {/* New folder */}
        <button
          onClick={createFolder}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 transition mt-2 border-2 border-dashed border-[var(--primary)]/30"
        >
          <FaFolderPlus className="w-4 h-4" />
          مجلد جديد
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex flex-wrap items-center gap-3">
          {/* Title */}
          <div className="me-auto">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">مكتبة الوسائط</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeFolder === "all" ? "كل الصور" : `📁 ${activeFolder}`} — {total} صورة
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث بالاسم..."
              className="pr-9 pl-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-[var(--primary)] w-48 transition"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="name">الاسم</option>
            <option value="size">الحجم</option>
          </select>

          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[["sm", Rows3], ["md", Grid2X2], ["lg", LayoutGrid]].map(([size, Icon]) => (
              <button
                key={size}
                onClick={() => setViewSize(size)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${viewSize === size ? "bg-white dark:bg-gray-700 shadow text-[var(--primary)]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Upload */}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={!CLOUD_NAME}
            className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[#245079] disabled:opacity-40 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            <FaUpload className="w-4 h-4" />
            رفع صور
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileInput} />

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-[var(--primary)]">{selected.size} محدد</span>
              <button
                onClick={() => setShowMoveModal(true)}
                className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl transition"
              >
                <FaArrowRight className="w-4 h-4" />
                نقل
              </button>
              <button
                onClick={() => setShowBulkDelete(true)}
                className="flex items-center gap-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl transition"
              >
                <FaTrash className="w-4 h-4" />
                حذف ({selected.size})
              </button>
              <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600">
                <FaXmark className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 px-5 py-2 flex gap-6 text-xs text-gray-500">
          <span>إجمالي الصور: <strong className="text-gray-800 dark:text-gray-200">{total}</strong></span>
          <span>المساحة: <strong className="text-gray-800 dark:text-gray-200">{formatBytes(totalSize)}</strong></span>
          <span>هذا الشهر: <strong className="text-gray-800 dark:text-gray-200">{thisMonth} صورة جديدة</strong></span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!CLOUD_NAME && <SetupBanner />}

          {/* Drag & drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => CLOUD_NAME && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 select-none ${
              !CLOUD_NAME ? "opacity-50 cursor-not-allowed" :
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01] shadow-lg cursor-copy"
                : "border-gray-200 dark:border-gray-700 hover:border-[var(--primary)]/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            }`}
          >
            <FaCloudArrowUp className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? "text-[var(--primary)]" : "text-gray-300 dark:text-gray-600"}`} />
            <p className={`font-bold text-base transition-colors ${isDragging ? "text-[var(--primary)]" : "text-gray-500 dark:text-gray-400"}`}>
              {isDragging ? "أفلت الصور هنا!" : "اسحب وأفلت الصور هنا"}
            </p>
            <p className="text-xs text-gray-400 mt-1.5">أو اضغط هنا • PNG, JPG, WEBP, GIF • الحد الأقصى 10MB</p>
          </div>

          {/* Upload queue */}
          <AnimatePresence>
            {uploadQueue.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    جاري رفع {uploadQueue.length} صورة...
                  </p>
                  {uploadQueue.map(({ id, file }) => (
                    <UploadItem key={id} file={file} queueId={id} onDone={handleUploadDone} onError={handleUploadError} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gallery */}
          {loading ? (
            <LoadingSpinner className="h-40" size="lg" />
          ) : media.length === 0 ? (
            <EmptyState icon={ImageIcon} title="لا توجد صور" description="ارفع أول صورة بالسحب والإفلات" />
          ) : (
            <>
              <div className={`grid ${gridCols} gap-3`}>
                <AnimatePresence>
                  {media.map((item, idx) => {
                    const isSelected = selected.has(item._id);
                    return (
                      <motion.div
                        key={item._id} layout
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                            : "border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-[var(--primary)]/30"
                        }`}
                        onClick={(e) => {
                          if (e.target.closest(".cb-btn")) return;
                          if (selected.size > 0) { toggleSelect(item._id, e); return; }
                          setLightboxIdx(idx);
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className={`cb-btn absolute top-2 right-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          onClick={(e) => { e.stopPropagation(); toggleSelect(item._id, e); }}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${isSelected ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-white/80 border-gray-300"}`}>
                            {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={getCloudinaryThumb(item.url, 300)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end pb-2 px-2 gap-1.5 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                            className="flex-1 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium py-1.5 rounded-lg transition text-center"
                          >
                            عرض
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(item._id); }}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(item.size)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <Pagination page={page} pages={pages} onPage={setPage} />
            </>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            items={media}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onNavigate={(dir) => setLightboxIdx((prev) => Math.max(0, Math.min(media.length - 1, prev + dir)))}
            onDelete={(id) => setDeleteId(id)}
            onRename={handleRename}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirm ── */}
      <ConfirmModal
        open={!!deleteId}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة نهائياً؟ لا يمكن التراجع."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {/* ── Bulk delete confirm ── */}
      <ConfirmModal
        open={showBulkDelete}
        title={`حذف ${selected.size} صورة`}
        message={`هل أنت متأكد من حذف ${selected.size} صورة نهائياً؟ لا يمكن التراجع.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
        loading={bulkDeleting}
      />

      {/* ── Move to folder modal ── */}
      <AnimatePresence>
        {showMoveModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowMoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">نقل {selected.size} صورة إلى مجلد</h3>
              <select
                value={moveTarget}
                onChange={(e) => setMoveTarget(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] bg-white dark:bg-gray-800 mb-4"
              >
                <option value="">اختر مجلداً...</option>
                <option value="general">general</option>
                {folders.map((f) => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={moveToFolder} disabled={!moveTarget} className="flex-1 bg-[var(--primary)] hover:bg-[#245079] disabled:opacity-40 text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  نقل
                </button>
                <button onClick={() => setShowMoveModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold text-sm transition">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
