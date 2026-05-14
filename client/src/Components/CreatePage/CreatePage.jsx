
import { useRef, useState } from "react";
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import { FaCircleNotch } from "react-icons/fa6";
import { HiCursorClick, HiInformationCircle, HiPhotograph } from "react-icons/hi";
import 'react-quill/dist/quill.snow.css';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiArchive, HiExclamationCircle } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";


function CreatePage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const fileRefPlan = useRef(null);
  const fileRefApartment = useRef(null);
  const [files, setFiles] = useState([]);
  const [filesPlan, setFilesPlan] = useState([]);
  const [filesApartment, setFilesApartment] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const [uploadingApartment, setUploadingApartment] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [imageUploadErrorPlan, setImageUploadErrorPlan] = useState(false);
  const [imageUploadErrorApartment, setImageUploadErrorApartment] =
    useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    address: { en: '', ar: '' },
    city: { en: '', ar: '' },
    propertyType: 'Apartment',
    price: 0,
    available: true,
    numberFloors: 0,
    propertySize: 0,
    rooms: 0,
    bathrooms: 0,
    sizeApartmentsOne: 0,
    sizeApartmentsTwo: 0,
    sizeApartmentsThree: 0,
    sizeApartmentsFour: 0,
    sizeApartmentsFive: 0,
    sizeApartmentsSix: 0,
    sizeApartmentsSeven: 0,
    sizeApartmentsEight: 0,
    imageUrls: [],
    imagePlans: [],
    imageApartments: [],
    status: 'Available',
  });


  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = files.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch(() => {
          setImageUploadError("فشل تحميل الصورة (الحد الأقصى لحجم الصورة الواحدة هو 2 ميجا بايت)");
          setUploading(false);
        });
    } else {
      setImageUploadError("يمكنك تحميل 6 صور فقط");
      setUploading(false);
    }
  };

  const handleImageSubmitPlan = () => {
    if (
      filesPlan.length > 0 &&
      filesPlan.length + formData.imagePlans.length < 2
    ) {
      setUploadingPlan(true);
      setImageUploadErrorPlan(false);
      const promises = filesPlan.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imagePlans: formData.imagePlans.concat(urls),
          });
          setImageUploadErrorPlan(false);
          setUploadingPlan(false);
        })
        .catch(() => {
          setImageUploadErrorPlan(
            "فشل تحميل الصورة (الحد الأقصى لحجم الصورة الواحدة هو 2 ميجا بايت)"
          );
          setUploadingPlan(false);
        });
    } else {
      setImageUploadErrorPlan("يمكنك تحميل صورة واحدة فقط");
      setUploadingPlan(false);
    }
  };

  const handleImageSubmitApartment = () => {
    if (
      filesApartment.length > 0 &&
      filesApartment.length + formData.imageApartments.length < 9
    ) {
      setUploadingApartment(true);
      setImageUploadErrorApartment(false);
      const promises = filesApartment.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageApartments: formData.imageApartments.concat(urls),
          });
          setImageUploadErrorApartment(false);
          setUploadingApartment(false);
        })
        .catch(() => {
          setImageUploadErrorApartment(
            "فشل تحميل الصورة (الحد الأقصى لحجم الصورة الواحدة هو 2 ميجا بايت)"
          );
          setUploadingApartment(false);
        });
    } else {
      setImageUploadErrorApartment("يمكنك تحميل 8 صور فقط");
      setUploadingApartment(false);
    }
  };

  const handleRemoveImage = (index) => () => {
    const newImages = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imageUrls: newImages,
    });
  };
  const handleRemoveImagePlan = (index) => () => {
    const newImages = formData.imagePlans.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imagePlans: newImages,
    });
  };
  const handleRemoveImageApartment = (index) => () => {
    const newImages = formData.imageApartments.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imageApartments: newImages,
    });
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;

    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [id]: type === 'number' ? parseInt(value) || 0 : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) {
        setError('يرجى تحميل صورة واحدة على الأقل');
        return;
      }
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        })
      })
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message)
      } else {
        navigate(`/Projects/${data.data.slug}`)
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }

  }

  const fieldStyle = { border: '1.5px solid #e2e8f0', background: 'white' };
  const labelStyle = { color: '#12283C' };
  const Field = ({ label, id, type = 'text', value, required, min }) => (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={id} value={value} onChange={handleChange} required={required} rows={3}
          className="w-full px-4 py-3 text-sm transition-all focus:outline-none resize-none"
          style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#8A6924'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      ) : (
        <input id={id} type={type} value={value} onChange={handleChange} required={required} min={min}
          className="w-full px-4 py-3 text-sm transition-all focus:outline-none"
          style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#8A6924'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      )}
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen py-8 px-4 lg:px-12" style={{ background: '#faf8f4' }}>
      {/* هيدر الصفحة */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(138,105,36,0.12)', border: '1px solid rgba(138,105,36,0.25)' }}>
          <HiArchive size={20} style={{ color: '#8A6924' }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#12283C' }}>إضافة مشروع جديد</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6b5e3e' }}>أضف تفاصيل المشروع العقاري الجديد</p>
        </div>
      </div>

      <div className="bg-white p-8" style={{ border: '1px solid rgba(138,105,36,0.12)', boxShadow: '0 4px 24px rgba(18,40,60,0.06)', borderTop: '3px solid #8A6924' }}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* العمود الأول: التفاصيل */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="اسم المشروع (بالإنجليزية)" id="name.en" value={formData.name.en} required />
              <Field label="اسم المشروع (بالعربية)" id="name.ar" value={formData.name.ar} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="المدينة (بالإنجليزية)" id="city.en" value={formData.city.en} required />
              <Field label="المدينة (بالعربية)" id="city.ar" value={formData.city.ar} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="العنوان (بالإنجليزية)" id="address.en" value={formData.address.en} required />
              <Field label="العنوان (بالعربية)" id="address.ar" value={formData.address.ar} required />
            </div>
            <Field label="الوصف (بالإنجليزية)" id="description.en" type="textarea" value={formData.description.en} required />
            <Field label="الوصف (بالعربية)" id="description.ar" type="textarea" value={formData.description.ar} required />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={labelStyle}>نوع العقار</label>
                <select id="propertyType" value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#8A6924'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                  <option value="apartment">شقة</option>
                  <option value="villa">فيلا</option>
                  <option value="office">مكتب</option>
                  <option value="commercial">تجاري</option>
                  <option value="duplex">دوبلكس</option>
                  <option value="penthouse">بنتهاوس</option>
                </select>
              </div>
              <Field label="السعر (ج.م)" id="price" type="number" value={formData.price} required />
            </div>

            <div>
              <p className="text-xs font-bold mb-2" style={labelStyle}>حالة التوفر</p>
              <div className="flex gap-3">
                {[{ val: true, label: 'متاح', color: '#8A6924' }, { val: false, label: 'مباع', color: '#dc2626' }].map(opt => (
                  <button key={opt.label} type="button"
                    onClick={() => setFormData({ ...formData, available: opt.val })}
                    className="flex-1 py-3 text-xs font-black tracking-widest transition-all"
                    style={formData.available === opt.val
                      ? { background: opt.color, color: 'white', border: `1.5px solid ${opt.color}` }
                      : { background: 'white', color: '#6b5e3e', border: '1.5px solid #e2e8f0' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="عدد الطوابق" id="numberFloors" type="number" value={formData.numberFloors} min={0} required />
              <Field label="المساحة (م²)" id="propertySize" type="number" value={formData.propertySize} min={1} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="عدد الغرف" id="rooms" type="number" value={formData.rooms} min={0} />
              <Field label="عدد الحمامات" id="bathrooms" type="number" value={formData.bathrooms} min={0} />
            </div>
          </div>

          {/* العمود الثاني: رفع الصور */}
          <div className="space-y-6">
            {/* صور الغلاف */}
            <div>
              <p className="text-xs font-bold mb-3" style={labelStyle}>صور الغلاف (حتى 6 صور)</p>
              <div onClick={() => fileRef.current.click()}
                className="w-full h-40 flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(138,105,36,0.3)', background: 'rgba(138,105,36,0.03)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#8A6924'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)'}>
                <HiPhotograph size={36} style={{ color: 'rgba(138,105,36,0.5)' }} />
                <span className="text-xs font-bold mt-2" style={{ color: '#8A6924' }}>اختر الصور</span>
                <input type="file" ref={fileRef} hidden accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={handleImageSubmit} disabled={uploading}
                className="w-full mt-3 py-2.5 text-xs font-black transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#12283C', color: '#DFBA6B', border: '1px solid rgba(223,186,107,0.2)' }}>
                {uploading ? <><TbLoaderQuarter className="animate-spin" size={14} /> جارٍ الرفع...</> : 'رفع الصور'}
              </button>
              {imageUploadError && <p className="text-xs text-red-600 mt-1">{imageUploadError}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.imageUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 group">
                    <img src={url} className="w-full h-full object-cover" style={{ border: '1px solid rgba(138,105,36,0.15)' }} />
                    <button type="button" onClick={handleRemoveImage(i)}
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(220,38,38,0.85)' }}>حذف</button>
                  </div>
                ))}
              </div>
            </div>

            {/* صورة المخطط */}
            <div>
              <p className="text-xs font-bold mb-3" style={labelStyle}>صورة المخطط</p>
              <div onClick={() => fileRefPlan.current.click()}
                className="w-full h-28 flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(138,105,36,0.3)', background: 'rgba(138,105,36,0.03)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#8A6924'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)'}>
                <HiPhotograph size={28} style={{ color: 'rgba(138,105,36,0.5)' }} />
                <input type="file" ref={fileRefPlan} hidden accept="image/*" onChange={(e) => setFilesPlan(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={handleImageSubmitPlan} disabled={uploadingPlan}
                className="w-full mt-3 py-2.5 text-xs font-black transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#12283C', color: '#DFBA6B', border: '1px solid rgba(223,186,107,0.2)' }}>
                {uploadingPlan ? <><TbLoaderQuarter className="animate-spin" size={14} /> جارٍ الرفع...</> : 'رفع المخطط'}
              </button>
              {imageUploadErrorPlan && <p className="text-xs text-red-600 mt-1">{imageUploadErrorPlan}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.imagePlans.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 group">
                    <img src={url} className="w-full h-full object-cover" style={{ border: '1px solid rgba(138,105,36,0.15)' }} />
                    <button type="button" onClick={handleRemoveImagePlan(i)}
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(220,38,38,0.85)' }}>حذف</button>
                  </div>
                ))}
              </div>
            </div>

            {/* زر النشر */}
            <div className="pt-4" style={{ borderTop: '1px solid rgba(138,105,36,0.1)' }}>
              <button type="submit" disabled={loading || uploading || uploadingPlan}
                className="w-full py-4 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)', boxShadow: '0 6px 24px rgba(138,105,36,0.4)' }}>
                {loading ? <><TbLoaderQuarter className="animate-spin" size={18} /> جارٍ النشر...</> : 'نشر المشروع'}
              </button>
              {error && (
                <div className="mt-3 flex items-center gap-2 p-3 text-xs font-bold"
                  style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
                  <HiExclamationCircle size={15} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;
