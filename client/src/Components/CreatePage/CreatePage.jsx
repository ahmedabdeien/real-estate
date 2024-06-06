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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Alert } from "flowbite-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


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
  const [error , setError] = useState(false);
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: '',
    address: "",
    available: '',
    numberFloors: 1,
    propertySize: 1,
    titleApartments: {},
    imageUrls: [],
    imagePlans: [],
    imageApartments: [],
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
          setImageUploadError("Image upload failed (2 MB max size per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images");
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
            "Image upload failed (2 MB max size per image)"
          );
          setUploadingPlan(false);
        });
    } else {
      setImageUploadErrorPlan("You can only upload 1 image");
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
            "Image upload failed (2 MB max size per image)"
          );
          setUploadingApartment(false);
        });
    } else {
      setImageUploadErrorApartment("You can only upload 8 images");
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
    if(e.target.id === 'available' || e.target.id === 'notAvailable'){
      setFormData({
        ...formData,
        available: e.target.id
      })
    }
    if(e.target.id === 'number' || e.target.id === 'text'){
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
           
        })
    }
    if(e.target.name === 'description'){
      setFormData({
        ...formData,
        description: e.target.value,
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
        if(data.success === false){
            setError(data.message)
        }
        navigate(`/pagesFinished/${data.slug}`)
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
    
  } 
 
  return (
    <div className=" w-full"> 
       <div className="w-full bg-stone-50 dark:bg-gray-800">
      <h1 className="text-center p-2 text-3xl font-bold border-b-2 bg-white dark:bg-gray-700 dark:border-gray-600">
        Create A Page
      </h1>

      <div className="md:container">
        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full space-y-2">
            <div>
              <label htmlFor="name">Title</label>
              <input
                type="text"
                placeholder="Title"
                id="name"
                maxLength={60}
                minLength={3}
                required
                className="w-full p-3 border-stone-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300 rounded"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input
                type="text"
                placeholder="Address"
                id="address"
                required
                className="w-full p-3 border-stone-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300 rounded"
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <ReactQuill 
                theme="snow" 
                className="w-full bg-white dark:bg-gray-600 dark:placeholder:text-gray-300 dark:border-gray-500  rounded p-2"
                type="text"
                placeholder="Description"
                id="description"
                name="description"
                required
                onChange={(value) => setFormData({...formData, description: value})}
                
                />
            </div>
            <div className="w-full dark:bg-gray-700 dark:placeholder:text-gray-300 rounded-sm">
              <p>There are apartments</p>
              <div className="flex space-x-8 bg-white dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300 shadow-sm p-2">
                <div className="space-x-1">
                  <input type="checkbox" name="" id="available" checked={formData.available === 'available'} onChange={handleChange}/>
                  <label htmlFor="available">Available</label>
                </div>
                <div className="space-x-1">
                  <input type="checkbox" id="notAvailable" checked={formData.available === 'notAvailable'} onChange={handleChange}/>
                  <label htmlFor="notAvailable">Not Available</label>
                </div>
              </div>
            
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div>
                <label htmlFor="numberFloors">Number Floors</label>
                <input
                  type="number"
                  placeholder="Number Floors"
                  id="numberFloors"
                  min={1}
                  max={20}
                  required
                  className="w-full p-4 rounded border-stone-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300"
                  onChange={(e) => setFormData({...formData, numberFloors: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="Property Size">Property Size</label>
                <input
                  type="number"
                  placeholder="Property Size"
                  id="propertySize"
                  min={1}
                  required
                  className="w-full p-4 border-stone-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300 rounded"
                  onChange={(e) => setFormData({...formData, propertySize: e.target.value})}
                />
              </div>
            </div>

            <div className="w-full bg-stone-50 dark:bg-gray-800 pt-7">
              <p className="">
                <span className="font-bold text-black dark:text-white">Image Plan:</span> The
                first image will be the cover (max 1)
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
                className="w-full border dark:border-gray-500 rounded bg-white dark:bg-gray-600 p-3 mt-2 overflow-hidden relative"
              >
                <span className="absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer"></span>
                <div className="flex justify-center items-center flex-col p-3 h-40 border-dashed dark:border-gray-500 border-2">
                  <HiPhotograph  className="text-5xl text-[#023E8A]/90 dark:text-blue-500" />
                  <p>Upload an Image</p>
                  <div
                    className={` mt-2`}
                  >
                    {filesPlan.length ? (
                      <Alert color={`${filesPlan.length > 1?"failure":"success"}`} icon={HiCursorClick}>
                        <span>{filesPlan.length}</span>
                        <span>images selected</span>
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
                  <div className="dark:bg-gray-600 dark:border-gray-500 bg-white border mt-3 flex p-1 rounded">
                    {formData.imagePlans.map((url, index) => (
                      <div key={index} className="p-1 ">
                        <div className="flex justify-between items-center rounded overflow-hidden">
                          <div className="flex items-center group/item relative dark:border-gray-400 border">
                            <img
                              src={url}
                              alt="image"
                              className="w-20 h-20 object-cover"
                            />
                            <div className="group-hover/item:block hidden absolute top-0 left-0">
                              <button
                                type="button"
                                onClick={handleRemoveImagePlan(index)}
                                className="bg-[#fefcfb] dark:bg-red-600 dark:border-none dark:text-red-100 border transition-opacity text-red-600 font-semibold py-1 p-3"
                              >
                                delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={uploadingPlan}
                onClick={handleImageSubmitPlan}
                className="bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none"
              >
                {uploadingPlan ? "uploading..." : "upload"}
              </button>
            </div>

            <div className="w-full  bg-stone-50 dark:bg-gray-800 pt-7">
              <p className="">
                <span className="font-bold text-black dark:text-white">Image Apartments:</span>{" "}
                The first image will be the cover (max 8)
              </p>
              <input
                type="file"
                id="imageApartments"
                onChange={(e) => setFilesApartment(Array.from(e.target.files))}
                ref={fileRefApartment}
                className="hidden"
                accept="image/*"
                multiple
              />
              <div
                onClick={() => fileRefApartment.current.click()}
                className="w-full border rounded dark:border-gray-500 bg-white dark:bg-gray-600 p-3 mt-2 overflow-hidden relative"
              >
                <span className="absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer"></span>
                <div className="flex justify-center items-center flex-col p-3 h-40 border-dashed dark:border-gray-500 border-2">
                  <HiPhotograph  className={` text-5xl text-[#023E8A]/90 dark:text-blue-500`}/>
                  <p>Upload an Image</p>
                  <div
                    className='mt-2'
                  >
                    {filesApartment.length ? (
                        <Alert color={`${filesApartment.length > 8 ?"failure":"success"}`} icon={HiCursorClick}>
                        <span>{filesApartment.length}</span>
                        <span>images selected</span>
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
                  <div className="dark:bg-gray-600 dark:border-gray-500 bg-white mt-3 flex flex-wrap rounded border p-[4px]">
                    {formData.imageApartments.map((url, index) => (
                      <div key={index} className="p-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center group/item relative rounded overflow-hidden dark:border-gray-400 border">
                            <img
                              src={url}
                              alt="image"
                              className="w-20 h-20 object-cover"
                            />
                            <div className="group-hover/item:block hidden absolute top-0 left-0">
                              <button
                                type="button"
                                onClick={handleRemoveImageApartment(index)}
                                className="bg-[#fefcfb] dark:bg-red-600 dark:border-none dark:text-red-100 border transition-opacity text-red-600 font-semibold py-1 p-3"
                              >
                                delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center">
                {uploadingApartment ? (
                  <FaCircleNotch className="animate-spin mt-3 text-[#023E8A] dark:text-blue-400 " />
                ) : (
                  ""
                )}
              </div>
              <button
                type="button"
                disabled={uploadingApartment}
                onClick={handleImageSubmitApartment}
                className="bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none"
              >
                {uploadingApartment ? "uploading..." : "upload"}
              </button>
            </div>

            <div className="w-full">
              <label htmlFor="titleApartments">Title Apartments</label>
              <input
                type="text"
                id="titleApartments"
                placeholder="Title Apartments"
                className="rounded p-3 w-full border-stone-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder:text-gray-300"
                onChange={(e) => setFormData({...formData, titleApartments: e.target.value})}
              />
            </div>
          </div>

          <div className=" order-first md:order-2">
            <div className="sticky top-14 w-full  ">
            <p className="">
              <span className="font-bold text-black dark:text-white">Images:</span> The first
              image will be the cover (max 6)
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
              className="w-full border rounded dark:border-gray-500 bg-white dark:bg-gray-600 p-3 overflow-hidden relative"
            >
              <span className="absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer"></span>
              <div className="flex justify-center items-center flex-col p-3 h-80 border-dashed dark:border-gray-500 border-2">
                <HiPhotograph className="text-7xl text-[#034078]/90 dark:text-blue-500" />
                <p>Upload an Image</p>
                <div
                  className={`mt-2`}
                >
                  {files.length ? (
                    <Alert color={`${files.length > 6 ?"failure":"success"}`} icon={HiCursorClick}>
                    <span>{files.length}</span>
                    <span>images selected</span>
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
                <div className="dark:bg-gray-600 dark:border-gray-500 bg-white border mt-3 flex flex-wrap p-1 rounded">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="p-1 ">
                      <div className="flex items-center rounded overflow-hidden border dark:border-gray-400 ">
                        <div className="flex items-center group/item relative">
                          <img
                            src={url}
                            alt="image"
                            className="w-24 h-24 object-cover"
                          />
                          <div className="group-hover/item:block hidden absolute top-0 left-0">
                            <button
                              type="button"
                              onClick={handleRemoveImage(index)}
                              className="bg-[#fefcfb] dark:bg-red-600 dark:border-none dark:text-red-100 border transition-opacity text-red-600 font-semibold py-1 p-3"
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-center items-center">
              {uploading ? (
                <FaCircleNotch className="animate-spin mt-3 text-[#023E8A] dark:text-blue-400" />
              ) : (
                ""
              )}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none"
            >
              {uploading ? "uploading..." : "upload"}
            </button>
            </div>
          </div>





          <div className="order-last">
            <button disabled={loading || uploading == uploadingApartment == uploadingPlan} className="bg-green-700 dark:bg-green-600 disabled:bg-green-700/60 disabled:hover:-skew-y-0 uppercase hover:-skew-y-1 transition-all font-bold text-white rounded active:scale-95 active:transition-all p-4 w-full hover:shadow-lg my-3">
               {loading ? <FaCircleNotch className="animate-spin" /> : "Publish A Page"}
            </button>
            
            {error && <Alert color="failure" icon={HiInformationCircle}>{error}</Alert> }
          </div>
        </form>
      </div>
    </div>
    </div>
   
  );
}

export default CreatePage;
