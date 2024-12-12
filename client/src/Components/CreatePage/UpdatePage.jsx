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
import { useNavigate,useParams } from "react-router-dom";
import { HiArchive } from "react-icons/hi";

function UpdatePage() {
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
  const [error , setError] = useState(false);
  const [loading, setLoading] = useState(false)
  const params = useParams();

 
  const [formData, setFormData] = useState({
    name: "",
    description: '',
    address: "",
    available: '',
    numberFloors: 0,
    propertySize: 0,
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
        if(data.success === false){
          console.log(data.message);
          return;
        }
        setFormData(data);
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
    if (e.target.id === 'متاح' || e.target.id === 'غير متاح') {
      setFormData({
        ...formData,
        available: e.target.id,
      });
    }
    if(e.target.type === 'number'|| e.target.type === 'text'|| e.target.type === 'textarea'){
      setFormData({
        ...formData,
        [e.target.id]: e.target.value
      })
    }
    
  }
  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
        if(formData.imageUrls.length < 1){
            setError('Please upload at least one image');
            return;
        }
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/listing/updatePage/${params.pageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                userRef:currentUser._id,
            })
        })
        const data = await res.json();
        setLoading(false);
        if(data.success === false){
            setError(data.message)
        }
        navigate(`/Projects/${data.slug}`)
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
    
  } 
  let styleIuput = "w-full p-3 border-gray-200 border-2 dark:bg-gray-800/30 dark:border-gray-500 dark:placeholder:text-gray-300 rounded-lg focus:transition-shadow focus:duration-300 focus:ring-0 focus:border-white focus:shadow-[0_0px_0px_2px] focus:shadow-blue-600 dark:focus:border-gray-700";
  return (
    <div className=" w-full bg-gradient-to-r from-gray-50 via-amber-50 to-blue-50 dark:from-gray-800 dark:via-amber-800/20 dark:to-blue-800/30 py-6"> 
       <div className="w-full  ">
        <div className="container mb-6">
          <h1 className=" text-3xl font-bold flex items-center text-black dark:text-white ">
          <HiArchive className="me-2 text-blue-600"/><span>تحديث الصفحة</span>
          </h1>
          <p className=" text-gray-500 dark:text-gray-400">
          يرجى تصحيح البيانات أدناه لتحديث صفحتك
          </p>
        </div>
      

      <div className="md:container">
        <div className="bg-white dark:bg-gray-700 p-5 rounded-2xl shadow-sm">
           <form onSubmit={handleSubmit} className=" grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full space-y-2">
            <div>
              <label htmlFor="name">اسم المشروع</label>
              <input
                type="text"
                placeholder="اسم المشروع"
                id="name"
                maxLength={60}
                minLength={3}
                required
                className={styleIuput}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                value={formData.name}
              />
            </div>
            <div>
              <label htmlFor="address">عنوان المشروع</label>
              <input
                type="text"
                placeholder="عنوان المشروع"
                id="address"
                required
                className={styleIuput}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                value={formData.address}
              />
            </div>
            <div>
              <label htmlFor="description">تفاصيل المشروع</label>
              <textarea
                type="text"
                placeholder="تفاصيل المشروع"
                id="description"
                required
                className={`${styleIuput} max-h-48 min-h-14`}
                onChange={handleChange}
                value={formData.description}
              />
            </div>
            <div className="w-full dark:bg-gray-700 dark:placeholder:text-gray-300 rounded-lg">
    <p>اختار هل؟متاح ام غير متاح شقق</p>
    <div className={`${styleIuput} p-1 flex space-x-5`}>
      <div className=" has-[:checked]:bg-blue-100 has-[:checked]:text-blue-800 has-[:checked]:ring-blue-500 flex items-center p-3 rounded-md">
        <input
          type="checkbox"
          name=""
          id="متاح"
          checked={formData.available === 'متاح'}
          onChange={handleChange}
          className="me-2"
        />
        <label htmlFor="متاح">متاح</label>
      </div>
      <div className=" has-[:checked]:bg-red-100 has-[:checked]:text-red-800 has-[:checked]:ring-red-500 flex items-center p-3 rounded-md">
        <input
          className="checked:bg-red-600 me-2 checked:ring-red-600"
          type="checkbox"
          id="غير متاح"
          checked={formData.available === 'غير متاح'}
          onChange={handleChange}
        />
        <label htmlFor="غير متاح">غير متاح</label>
      </div>
    </div>
  </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div>
                <label htmlFor="numberFloors">عدد الادوار</label>
                <input
                  type="number"
                  placeholder="عدد الادوار"
                  id="numberFloors"
                  min={1}
                  max={20}
                  required
                  className={styleIuput}
                  onChange={(e) => setFormData({...formData, numberFloors: e.target.value})}
                  value={formData.numberFloors}
                />
              </div>
              <div>
                <label htmlFor="Property Size">مساحة المشروع</label>
                <input
                  type="number"
                  placeholder="مساحة المشروع"
                  id="propertySize"
                  min={1}
                  required
                  className={styleIuput}
                  onChange={(e) => setFormData({...formData, propertySize: e.target.value})}
                  value={formData.propertySize}
                />
              </div>
            </div>

            <div className="w-full pt-7">
              <p className="">
                <span className="font-bold text-black dark:text-white">تقسييم الدخلي الصورة:</span> 
                الصورة الأولى ستكون الغلاف (حد أقصى 1)
              </p>
              <input
                type="file"
                id="imagePlans"
                onChange={(e) => setFilesPlan(Array.from(e.target.files))}
                ref={fileRefPlan}
                className="hidden"
                accept="image/*"
                multiple
              />
              <div
                onClick={() => fileRefPlan.current.click()}
                className="w-full rounded-2xl hover:bg-gray-300/15 dark:hover:bg-gray-500/15 bg-white dark:bg-gray-700 mt-2 overflow-hidden relative border-dashed dark:border-gray-500 border-2"
              >
                <span className="absolute top-0 left-0 w-full h-full cursor-pointer"></span>
                <div className="flex justify-center items-center flex-col p-3 h-40">
                  <HiPhotograph  className="text-5xl text-blue-600" />
                  <p>تحميل تقسييم الداخلي الصورة</p>
                  <div
                    className={` mt-2`}
                  >
                    {filesPlan.length ? (
                      <Alert color={`${filesPlan.length > 1?"failure":"success"}`} icon={HiCursorClick}>
                        <span>{filesPlan.length}</span>
                        <span>الصور المختارة</span>
                       </Alert>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
                {imageUploadErrorPlan ? <Alert color="failure" className="mt-3" icon={HiInformationCircle}>{imageUploadErrorPlan}</Alert> : ""}
              <div className="flex justify-center items-center">
                {uploadingPlan ? (
                  <FaCircleNotch className="animate-spin mt-3 text-[#023E8A] dark:text-blue-400" />
                ) : (
                  ""
                )}
              </div>
              <div>
                {formData.imagePlans.length > 0 && (
                  <div className="dark:border-gray-500 mt-3 rounded-xl border ">
                  <div className="bg-img-createPage p-[2px] flex flex-wrap">
                    {formData.imagePlans.map((url, index) => (
                      <div key={index} className="p-1 ">
                        <div className="flex justify-between items-center rounded overflow-hidden">
                          <div className="flex items-center group/item relative rounded-md overflow-hidden dark:border-gray-500 border-2 shadow-md">
                            <img
                              src={url}
                              alt="image"
                              className="w-20 h-20 object-cover"
                            />
                            <div className="group-hover/item:translate-y-0 -translate-y-40 transition-transform ease-in-out absolute top-0 left-0 w-full">
                              <button
                                type="button"
                                onClick={handleRemoveImagePlan(index)}
                                className=" bg-red-600 text-red-100 font-semibold py-1 p-3 w-full"
                              >
                                مسح
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={uploadingPlan}
                onClick={handleImageSubmitPlan}
                className="bg-blue-600 rounded-lg mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-blue-600/50 disabled:shadow-none"
              >
                {uploadingPlan ? "جاري التحميل..." : "رفع الصورة"}
              </button>
            </div>

            <div className="w-full pt-7">
              <p className="">
                <span className="font-bold text-black dark:text-white">صور الشقق:</span>{" "}
                الصورة الأولى ستكون الغلاف (بحد أقصى 8)
              </p>
              <input type="file" id="imageApartments" onChange={(e) => setFilesApartment(Array.from(e.target.files))} ref={fileRefApartment} className="hidden" accept="image/*" multiple />
              <div onClick={() => fileRefApartment.current.click()}
                className="w-full rounded-2xl hover:bg-gray-300/15 dark:hover:bg-gray-500/15 bg-white dark:bg-gray-700 mt-2 overflow-hidden relative border-dashed dark:border-gray-500 border-2" >
                <span className="absolute top-0 left-0 w-full h-full cursor-pointer"></span>
                <div className="flex justify-center items-center flex-col p-3 h-40 ">
                  <HiPhotograph  className={` text-5xl text-blue-600`}/>
                  <p>تحميل صور الشقق</p>
                  <div
                    className='mt-2'
                  >
                    {filesApartment.length ? (
                        <Alert color={`${filesApartment.length > 8 ?"failure":"success"}`} icon={HiCursorClick}>
                        <span>{filesApartment.length}</span>
                        <span>الصور المختارة</span>
                       </Alert>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              {imageUploadErrorApartment ? <Alert color="failure" className="mt-3" icon={HiInformationCircle}>{imageUploadErrorApartment}</Alert> : ""}
              <div>
                {formData.imageApartments.length > 0 && (
                  <div className=" dark:border-gray-500 mt-3  rounded-xl border ">
                    <div className="bg-img-createPage p-[2px] flex flex-wrap">
                    {formData.imageApartments.map((url, index) => (
                      <div key={index} className="p-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center group/item relative rounded-md overflow-hidden dark:border-gray-500 border-2 shadow-md">
                            <img
                              src={url}
                              alt="image"
                              className="w-20 h-20 object-cover"
                            />
                            <div className="group-hover/item:translate-y-0 -translate-y-40 transition-transform ease-in-out absolute top-0 left-0 w-full">
                              <button
                                type="button"
                                onClick={handleRemoveImageApartment(index)}
                                className=" bg-red-600 text-red-100 font-semibold py-1 p-3 w-full"
                              >
                                مسح
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center">
                {uploadingApartment ? (
                  <FaCircleNotch className="animate-spin mt-3 text-blue-600 " />
                ) : (
                  ""
                )}
              </div>
              <button
                type="button"
                disabled={uploadingApartment}
                onClick={handleImageSubmitApartment}
                className="bg-blue-600 rounded-lg mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-blue-600/50 disabled:shadow-none"
              >
                {uploadingApartment ? "جاري التحميل..." : "رفع الصور"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
            <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (1)</label>
              <input
                type="number"
                id="sizeApartmentsOne"
                placeholder="مساحة شقة (1)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsOne}
              />
            </div>
            <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (2)</label>
              <input
                type="number"
                id="sizeApartmentsTwo"
                placeholder="مساحة شقة (2)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsTwo}
              />
            </div>
            <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (3)</label>
              <input
                type="number"
                id="sizeApartmentsThree"
                placeholder="مساحة شقة (3)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsThree}
              />
              </div>
              <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (4)</label>
              <input
                type="number"
                id="sizeApartmentsFour"
                placeholder="مساحة شقة (4)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsFour}
              />
              </div>
              <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (5)</label>
              <input
                type="number"
                id="sizeApartmentsFive"
                placeholder="مساحة شقة (5)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsFive}
              />
              </div>
              <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (6)</label>
              <input
                type="number"
                id="sizeApartmentsSix"
                placeholder="مساحة شقة (6)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsSix}
              />
              </div>
              <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (7)</label>
              <input
                type="number"
                id="sizeApartmentsSeven"
                placeholder="مساحة شقة (7)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsSeven}
                />
                </div>
                <div className="w-full">
              <label htmlFor="titleApartments">مساحة شقة (8)</label>
              <input
                type="number"
                id="sizeApartmentsEight"
                placeholder="مساحة شقة (8)"
                className={styleIuput}
                onChange={handleChange}
                value={formData.sizeApartmentsEight}
              />
              </div>
            
            </div>
          </div>

          <div className=" order-first md:order-2">
            <div className="sticky top-16 w-full  ">
            <p className="mb-2">
              <span className="font-bold text-black dark:text-white">الصور: </span> 
              الصورة الأولى ستكون الغلاف (بحد أقصى 6)
            </p>
            <input
              onChange={(e) => setFiles(Array.from(e.target.files))}
              type="file"
              id="imageUrls"
              ref={fileRef}
              className="hidden"
              accept="image/*"
              multiple
            />
            <div
              onClick={() => fileRef.current.click()}
              className="w-full bg-white dark:bg-gray-700 overflow-hidden relative hover:bg-gray-300/15 dark:hover:bg-gray-500/15 cursor-pointer border-dashed dark:border-gray-500 border-2 rounded-2xl"
            >
              <span className="absolute top-0 left-0 w-full h-full"></span>
              <div className="flex justify-center items-center flex-col p-3 h-80 ">
                <HiPhotograph  className="text-7xl text-blue-600" />
                <p>تحميل صور الغلاف</p>
                <div
                  className={`mt-2`}
                >
                  {files.length ? (
                    <Alert color={`${files.length > 6 ?"failure":"success"}`} icon={HiCursorClick}>
                    <span>{files.length}</span>
                    <span>الصور المختارة</span>
                   </Alert>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            
              {imageUploadError ? <Alert color="failure" className="mt-3" icon={HiInformationCircle}>{imageUploadError}</Alert> : ""}
             
           
            <div>
              {formData.imageUrls.length > 0 && (
                <div className="dark:border-gray-500 mt-3  rounded-xl border overflow-hidden ">
                  <div className="bg-img-createPage p-[2px] flex flex-wrap">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="p-1 ">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center group/item relative rounded-md overflow-hidden dark:border-gray-500 border-2 shadow-md">
                          <img
                            src={url}
                            alt="image"
                            className="w-24 h-24 object-cover"
                          />
                          <div className="group-hover/item:translate-y-0 -translate-y-40 transition-transform ease-in-out absolute top-0 left-0 w-full">
                            <button
                              type="button"
                              onClick={handleRemoveImage(index)}
                              className=" bg-red-600 text-red-100 font-semibold py-1 p-3 w-full"
                            >
                              مسح
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center">
              {uploading ? (
                <FaCircleNotch className="animate-spin mt-3 text-blue-600" />
              ) : (
                ""
              )}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="bg-blue-600 rounded-lg mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-blue-600/50 disabled:shadow-none"
            >
              {uploading ? "جاري التحميل..." :"رفع الصور"}
            </button>
            </div>
          </div>





          <div className="order-last">
            <button disabled={loading || uploading == uploadingApartment == uploadingPlan} className="bg-green-600 dark:bg-green-600 disabled:bg-green-700/60 disabled:hover:-skew-y-0 uppercase hover:-skew-y-1 transition-all font-bold text-white rounded-lg active:scale-95 active:transition-all p-4 w-full hover:shadow-lg my-3">
               {loading ? <FaCircleNotch className="animate-spin" /> : "نشر الصفحة بعد التعديل"}
            </button>
            
            {error && <Alert color="failure" icon={HiInformationCircle}>{error}</Alert> }
          </div>
        </form>
        </div>
       
      </div>
    </div>
    </div>
   
  );
}

export default UpdatePage;
