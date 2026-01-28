
import { useEffect, useRef, useState } from "react";
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
import { Alert } from "flowbite-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { HiArchive } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../UI/Spinner";

function UpdatePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
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
  });

  useEffect(() => {
    const fetchPage = async () => {
      const pageId = params.pageId;
      const res = await fetch(`/api/listing/get/${pageId}`);
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      // Ensure nested objects exist to prevent crashes
      const listingData = data.data;
      const sanitizedData = {
        ...listingData,
        name: typeof listingData.name === 'string' ? { en: listingData.name, ar: listingData.name } : listingData.name,
        description: typeof listingData.description === 'string' ? { en: listingData.description, ar: listingData.description } : listingData.description,
        address: typeof listingData.address === 'string' ? { en: listingData.address, ar: listingData.address } : listingData.address,
        city: typeof listingData.city === 'string' ? { en: listingData.city, ar: listingData.city } : (listingData.city || { en: '', ar: '' }),
      };
      setFormData(sanitizedData);
    }
    fetchPage();
  }, [params.pageId])


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
      const res = await fetch(`/api/listing/update/${params.pageId}`, {
        method: 'PUT',
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
        // Success
        navigate(`/Projects/${data.data.slug}`)
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }

  }

  return (
    <div className="w-full bg-slate-50 py-6">
      <div className="w-full">
        <div className="container mb-6">
          <h1 className="text-3xl font-black flex items-center text-slate-900">
            <HiArchive className="me-2 text-primary-600" />
            <span>{t('update_listing')}</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {t('form_subtitle')}
          </p>
        </div>

        <div className="md:container">
          <div className="bg-white p-8 rounded-none shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Column 1: Details */}
              <div className="space-y-8">
                {/* Multilingual Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('project_name_en')}
                    type="text"
                    id="name.en"
                    required
                    onChange={handleChange}
                    value={formData.name.en}
                  />
                  <Input
                    label={t('project_name_ar')}
                    type="text"
                    id="name.ar"
                    required
                    onChange={handleChange}
                    value={formData.name.ar}
                  />
                </div>

                {/* Multilingual City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('city_en')}
                    type="text"
                    id="city.en"
                    required
                    onChange={handleChange}
                    value={formData.city.en}
                  />
                  <Input
                    label={t('city_ar')}
                    type="text"
                    id="city.ar"
                    required
                    onChange={handleChange}
                    value={formData.city.ar}
                  />
                </div>

                {/* Multilingual Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('project_address_en')}
                    type="text"
                    id="address.en"
                    required
                    onChange={handleChange}
                    value={formData.address.en}
                  />
                  <Input
                    label={t('project_address_ar')}
                    type="text"
                    id="address.ar"
                    required
                    onChange={handleChange}
                    value={formData.address.ar}
                  />
                </div>

                {/* Multilingual Description */}
                <div className="space-y-4">
                  <Input
                    label={t('project_desc_en')}
                    type="textarea"
                    id="description.en"
                    required
                    onChange={handleChange}
                    value={formData.description.en}
                  />
                  <Input
                    label={t('project_desc_ar')}
                    type="textarea"
                    id="description.ar"
                    required
                    onChange={handleChange}
                    value={formData.description.ar}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('property_type')}</label>
                    <select
                      id="propertyType"
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full p-3 border-gray-200 border-[1px] rounded-none focus:border-primary-600 outline-none"
                    >
                      <option value="Apartment">{t('Apartment') || 'Apartment'}</option>
                      <option value="Villa">{t('Villa') || 'Villa'}</option>
                      <option value="Office">{t('Office') || 'Office'}</option>
                      <option value="Shop">{t('Shop') || 'Shop'}</option>
                      <option value="Land">{t('Land') || 'Land'}</option>
                    </select>
                  </div>
                  <Input
                    label={t('price')}
                    type="number"
                    id="price"
                    required
                    onChange={handleChange}
                    value={formData.price}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">{t('availability_status')}</p>
                  <div className="flex gap-4">
                    <div
                      onClick={() => setFormData({ ...formData, available: true })}
                      className={`flex items-center p-3 rounded-none border-[1px] cursor-pointer transition-all flex-1 justify-center font-bold text-xs uppercase tracking-widest ${formData.available === true ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      <span>{t('available')}</span>
                    </div>
                    <div
                      onClick={() => setFormData({ ...formData, available: false })}
                      className={`flex items-center p-3 rounded-none border-[1px] cursor-pointer transition-all flex-1 justify-center font-bold text-xs uppercase tracking-widest ${formData.available === false ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      <span>{t('sold')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('number_of_floors')}
                    type="number"
                    id="numberFloors"
                    min={1}
                    required
                    onChange={handleChange}
                    value={formData.numberFloors}
                  />
                  <Input
                    label={t('project_size')}
                    type="number"
                    id="propertySize"
                    min={1}
                    required
                    onChange={handleChange}
                    value={formData.propertySize}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('rooms')}
                    type="number"
                    id="rooms"
                    min={0}
                    onChange={handleChange}
                    value={formData.rooms}
                  />
                  <Input
                    label={t('bathrooms')}
                    type="number"
                    id="bathrooms"
                    min={0}
                    onChange={handleChange}
                    value={formData.bathrooms}
                  />
                </div>
              </div>

              {/* Column 2: Uploads */}
              <div className="space-y-8">
                {/* Cover Images */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">{t('upload_cover')}</p>
                  <div
                    onClick={() => fileRef.current.click()}
                    className="w-full h-48 border-2 border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <HiPhotograph className="text-4xl text-primary-600 mb-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('upload_images')}</span>
                    <input type="file" ref={fileRef} hidden accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
                  </div>
                  <Button variant="outline" fullWidth onClick={handleImageSubmit} isLoading={uploading} disabled={uploading} className="uppercase tracking-widest text-xs font-bold">
                    {uploading ? t('uploading') : t('upload_images')}
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 border border-slate-200 group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={handleRemoveImage(index)} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-[10px] uppercase">
                          {t('delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* internal plans */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">{t('upload_plans')}</p>
                  <div
                    onClick={() => fileRefPlan.current.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <HiPhotograph className="text-3xl text-primary-600 mb-2" />
                    <input type="file" ref={fileRefPlan} hidden accept="image/*" onChange={(e) => setFilesPlan(Array.from(e.target.files))} />
                  </div>
                  <Button variant="outline" fullWidth onClick={handleImageSubmitPlan} isLoading={uploadingPlan} disabled={uploadingPlan} className="uppercase tracking-widest text-xs font-bold">
                    {t('upload_image')}
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    {formData.imagePlans.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 border border-slate-200 group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={handleRemoveImagePlan(index)} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-[10px] uppercase">
                          {t('delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <Button
                    type="submit"
                    fullWidth
                    variant="primary"
                    size="lg"
                    className="py-5 font-black uppercase tracking-[0.2em]"
                    disabled={loading || uploading || uploadingPlan || uploadingApartment}
                    isLoading={loading}
                  >
                    {loading ? t('loading') : t('save_changes')}
                  </Button>
                  {error && <Alert color="failure" icon={HiInformationCircle} className="mt-4 rounded-none">{error}</Alert>}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePage;
