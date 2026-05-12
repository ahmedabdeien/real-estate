import { useEffect, useState, useRef, useCallback } from "react";
import { Trash2, Upload, Image as ImageIcon, Copy, Check, CloudUpload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary, getCloudinaryThumb } from "../../lib/cloudinary";
import api from "../../api/axios";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Pagination from "../../components/UI/Pagination";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// ── Single file upload progress ────────────────────────────────────────────────
function UploadItem({ file, queueId, onDone, onError }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("uploading"); // uploading | done | error
  const started = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke
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
        {status === "done"  && <p className={`text-xs ${style.text}`}>تم الرفع ✓</p>}
        {status === "error" && <p className={`text-xs ${style.text}`}>فشل الرفع</p>}
      </div>
    </div>
  );
}

// ── No cloud name banner ───────────────────────────────────────────────────────
function SetupBanner() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
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

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminMedia() {
  const toast = useToast();
  const inputRef = useRef();
  const [media, setMedia]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading]   = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied]     = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragging, setIsDragging]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/media", { params: { page } });
      setMedia(res.data.media  || []);
      setTotal(res.data.total  || 0);
      setPages(res.data.pages  || 1);
    } catch { toast.error("فشل تحميل الصور"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  // Drag & Drop
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
      if (f.size > 2 * 1024 * 1024) { toast.error(`"${f.name}" أكبر من 2MB`); return false; }
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
    } catch { toast.error("فشل حفظ الصورة"); }
    finally  { removeFromQueue(queueId); }
  };

  const handleUploadError = (_name, _err, queueId) => {
    toast.error("فشل رفع الصورة — تحقق من إعداد Cloudinary");
    setTimeout(() => removeFromQueue(queueId), 3000);
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/media/${deleteId}`);
      setMedia((prev) => prev.filter((m) => m._id !== deleteId));
      setTotal((prev) => prev - 1);
      toast.success("تم حذف الصورة");
    } catch { toast.error("فشل الحذف"); }
    finally  { setDeleting(false); setDeleteId(null); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مكتبة الصور</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} صورة • Cloudinary مجاني 25GB</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!CLOUD_NAME}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          رفع صور
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileInput} />
      </div>

      {/* Setup banner when no cloud name */}
      {!CLOUD_NAME && <SetupBanner />}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => CLOUD_NAME && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 select-none ${
          !CLOUD_NAME ? "opacity-50 cursor-not-allowed" :
          isDragging
            ? "border-[#2d5d89] bg-[#2d5d89]/5 scale-[1.01] shadow-lg cursor-copy"
            : "border-gray-200 dark:border-gray-700 hover:border-[#2d5d89]/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        }`}
      >
        <CloudUpload className={`w-14 h-14 mx-auto mb-4 transition-colors duration-200 ${isDragging ? "text-[#2d5d89]" : "text-gray-300 dark:text-gray-600"}`} />
        <p className={`font-bold text-xl transition-colors ${isDragging ? "text-[#2d5d89]" : "text-gray-500 dark:text-gray-400"}`}>
          {isDragging ? "🎉 أفلت الصور هنا!" : "اسحب وأفلت الصور هنا"}
        </p>
        <p className="text-sm text-gray-400 mt-2">أو اضغط هنا • PNG, JPG, WEBP, GIF • الحد الأقصى 2MB</p>
        <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200 dark:border-green-700">
          <span>🆓</span>
          <span>Cloudinary — 25GB مجاني بدون بطاقة بنكية</span>
        </div>
      </div>

      {/* Upload queue */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                جاري رفع {uploadQueue.length} صورة إلى Cloudinary...
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
        <EmptyState icon={ImageIcon} title="لا توجد صور بعد" description="ارفع أول صورة بالسحب والإفلات" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {media.map((item) => (
                <motion.div
                  key={item._id} layout
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={getCloudinaryThumb(item.url, 300)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(item.url, item._id)} title="نسخ الرابط"
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow">
                      {copied === item._id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteId(item._id)} title="حذف"
                      className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-400 truncate">{item.name}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة نهائياً؟ لا يمكن التراجع."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
