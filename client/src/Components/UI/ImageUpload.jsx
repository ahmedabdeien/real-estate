/**
 * ImageUpload — drag & drop + Cloudinary direct upload
 * Props:
 *   value     {string}   current image URL
 *   onChange  {fn}       called with new URL string
 *   label     {string}   optional field label
 *   className {string}   wrapper class
 */
import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Link2 } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useToast } from "../../context/ToastContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export default function ImageUpload({ value, onChange, label, className = "" }) {
  const toast = useToast();
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const MAX_SIZE_MB = 2;
  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("يرجى اختيار ملف صورة"); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة كبير — الحد الأقصى ${MAX_SIZE_MB} ميجابايت`);
      return;
    }
    if (!CLOUD_NAME) { toast.error("Cloudinary غير مضبوط — تحقق من VITE_CLOUDINARY_CLOUD_NAME"); return; }
    setUploading(true); setProgress(0);
    try {
      const data = await uploadToCloudinary(file, setProgress);
      onChange(data.url);
      toast.success("تم رفع الصورة بنجاح ✓");
    } catch (err) {
      toast.error(err.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const onDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDrop      = useCallback((e) => { e.preventDefault(); setIsDragging(false); upload(e.dataTransfer.files[0]); }, []);
  const onFileInput = (e) => { upload(e.target.files[0]); e.target.value = ""; };

  const confirmUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) { onChange(trimmed); setUrlInput(""); setUrlMode(false); }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      )}

      {/* ── Uploading progress ── */}
      {uploading && (
        <div className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">جاري الرفع... {progress}%</p>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ── Image preview ── */}
      {!uploading && value && (
        <div className="relative rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-600">
          <img src={value} alt="" className="w-full h-44 object-cover" />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> تغيير
            </button>
            <button type="button" onClick={() => onChange("")}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> حذف
            </button>
          </div>
        </div>
      )}

      {/* ── URL input mode ── */}
      {!uploading && !value && urlMode && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmUrl()}
            placeholder="https://..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm"
          />
          <button type="button" onClick={confirmUrl}
            className="px-4 py-2 bg-[#2d5d89] text-white rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
            إضافة
          </button>
          <button type="button" onClick={() => { setUrlMode(false); setUrlInput(""); }}
            className="w-10 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Drop zone ── */}
      {!uploading && !value && !urlMode && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => CLOUD_NAME && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 select-none ${
            !CLOUD_NAME
              ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-600"
              : isDragging
              ? "border-[#2d5d89] bg-[#2d5d89]/5 scale-[1.01] cursor-copy"
              : "border-gray-200 dark:border-gray-600 hover:border-[#2d5d89]/60 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
          }`}
        >
          <ImageIcon className={`w-9 h-9 mx-auto mb-2 transition-colors ${isDragging ? "text-[#2d5d89]" : "text-gray-300 dark:text-gray-600"}`} />
          <p className={`text-sm font-medium transition-colors ${isDragging ? "text-[#2d5d89]" : "text-gray-500 dark:text-gray-400"}`}>
            {isDragging ? "🎉 أفلت الصورة هنا" : "اسحب صورة أو اضغط للاختيار"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP • يرفع مباشرة على Cloudinary</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setUrlMode(true); }}
            className="mt-3 text-xs text-[#2d5d89] hover:underline flex items-center gap-1 mx-auto"
          >
            <Link2 className="w-3 h-3" /> أو أدخل رابط URL
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
    </div>
  );
}
