/**
 * Cloudinary Direct Upload (Unsigned Preset)
 * مجاني 25GB — لا يحتاج backend
 *
 * الإعداد (مرة واحدة فقط):
 * 1. اشترك على cloudinary.com (مجاني)
 * 2. Settings > Upload > Upload presets > Add preset
 *    - Signing mode: Unsigned
 *    - Folder: elsarh
 *    - سمّيه: elsarh_unsigned
 * 3. ضع cloud name في .env كـ VITE_CLOUDINARY_CLOUD_NAME
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "elsarh_unsigned";

if (!CLOUD_NAME) {
  console.warn("⚠️ VITE_CLOUDINARY_CLOUD_NAME غير موجود في .env");
}

/**
 * Upload a single file to Cloudinary with progress callback
 * @param {File} file
 * @param {(percent: number) => void} onProgress
 * @returns {Promise<{ url: string, publicId: string, name: string, type: string, size: number, folder: string }>}
 */
export function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME) {
      reject(new Error("VITE_CLOUDINARY_CLOUD_NAME غير موجود — راجع ملف .env"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "elsarh");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const mimeType = file.type || "";
        const fileType = mimeType.startsWith("video/") ? "video" : mimeType.startsWith("image/") ? "image" : "document";
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          name: file.name,
          type: fileType,
          size: file.size,
          folder: "elsarh",
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "فشل الرفع"));
        } catch {
          reject(new Error(`فشل الرفع (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("خطأ في الاتصال"));
    xhr.send(formData);
  });
}

/**
 * Delete from Cloudinary — يحتاج Backend (server-side API secret)
 * الـ publicId بيتبعت للـ backend ويعمل destroy
 */
export function getCloudinaryThumb(url, width = 400) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_fill,f_auto,q_auto/`);
}
