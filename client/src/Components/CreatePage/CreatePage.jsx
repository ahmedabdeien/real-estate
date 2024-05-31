import { useRef, useState } from 'react'
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../../firebase';
import { FaCircleNotch } from "react-icons/fa6";
import { HiCloudUpload } from 'react-icons/hi';

function CreatePage() {
    const fileRef = useRef(null)
    const fileRefPlan = useRef(null)
    const fileRefApartment = useRef(null)
    const [files, setFiles] = useState([])
    const [filesPlan, setFilesPlan] = useState([])
    const [filesApartment, setFilesApartment] = useState([])
    const [uploading, setUploading] = useState(false)
    const [uploadingPlan, setUploadingPlan] = useState(false)
    const [uploadingApartment, setUploadingApartment] = useState(false)
    const [imageUploadError, setImageUploadError] = useState(false)
    const [imageUploadErrorPlan, setImageUploadErrorPlan] = useState(false)
    const [imageUploadErrorApartment, setImageUploadErrorApartment] = useState(false)
    
    const [formData, setFormData] = useState({
        imageUrls: [],
        imagePlans: [],
        imageApartments: [],
    })

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = `${new Date().getTime()}-${file.name}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    }

    const handleImageSubmit = () => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = files.map(file => storeImage(file));
            Promise.all(promises).then((urls) => {
                setFormData({
                    ...formData,
                    imageUrls: formData.imageUrls.concat(urls)
                });
                setImageUploadError(false);
                setUploading(false);
            }).catch(() => {
                setImageUploadError("Image upload failed (2 MB max size per image)");
                setUploading(false);
            });
        } else {
            setImageUploadError("You can only upload 6 images");
            setUploading(false);
        }
    }

    const handleImageSubmitPlan = () => {
        if (filesPlan.length > 0 && filesPlan.length + formData.imagePlans.length < 2) {
            setUploadingPlan(true);
            setImageUploadErrorPlan(false);
            const promises = filesPlan.map(file => storeImage(file));
            Promise.all(promises).then((urls) => {
                setFormData({
                    ...formData,
                    imagePlans: formData.imagePlans.concat(urls)
                });
                setImageUploadErrorPlan(false);
                setUploadingPlan(false);
            }).catch(() => {
                setImageUploadErrorPlan("Image upload failed (2 MB max size per image)");
                setUploadingPlan(false);
            });
        } else {
            setImageUploadErrorPlan("You can only upload 1 image");
            setUploadingPlan(false);
        }
    }
    const handleImageSubmitApartment = () => {
        if (filesApartment.length > 0 && filesApartment.length + formData.imageApartments.length < 9) {
            setUploadingApartment(true);
            setImageUploadErrorApartment(false);
            const promises = filesApartment.map(file => storeImage(file));
            Promise.all(promises).then((urls) => {
                setFormData({
                    ...formData,
                    imageApartments: formData.imageApartments.concat(urls)
                });
                setImageUploadErrorApartment(false);
                setUploadingApartment(false);
            }).catch(() => {
                setImageUploadErrorApartment("Image upload failed (2 MB max size per image)");
                setUploadingApartment(false);
            });
        } else {
            setImageUploadErrorApartment("You can only upload 8 images");
            setUploadingApartment(false);
        }
    }

    const handleRemoveImage = (index) => () => {
        const newImages = formData.imageUrls.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            imageUrls: newImages
        });
    }
    const handleRemoveImagePlan = (index) => () => {
        const newImages = formData.imagePlans.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            imagePlans: newImages
        });
    }
    const handleRemoveImageApartment = (index) => () => {
        const newImages = formData.imageApartments.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            imageApartments: newImages
        });
    }

    return (
        <div className='w-full bg-stone-50'>
            <h1 className='text-center text-[#fefcfb] bg-gradient-to-r from-[#1282a2] to-[#034078]  p-2 text-3xl font-semibold'>Create A Page</h1>

            <div className='md:container'>
                <form className='p-5 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className="w-full space-y-2">
                        <div>
                            <label htmlFor="name">Title</label>
                            <input type="text" placeholder='Title' id='name' maxLength={60} minLength={3} required className='w-full p-3 border-stone-300 rounded'/>
                        </div>
                        <div>
                            <label htmlFor="address">Address</label>
                            <input type="text" placeholder='Address' id='address' required className='w-full p-3 border-stone-300 rounded'/>
                        </div>
                        <div>
                            <label htmlFor="description">Description</label>
                            <textarea type="text" placeholder='Description' id='description' required className='w-full p-2 border-stone-300 rounded max-h-60 min-h-32'/>
                        </div>
                        <div className="w-full rounded-sm">
                            <p>Available Or Not</p>
                            <select className='p-3 border-stone-300 rounded w-full' required id="availableOrNot">
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-2'>
                            <div>
                                <label htmlFor="numberFloors">Number Floors</label>
                                <input type="number" placeholder='Number Floors' id='numberFloors' min={1} max={20} required className='w-full p-4 rounded border-stone-300'/>
                            </div>
                            <div>
                                <label htmlFor="Property Size">Property Size</label>
                                <input type="number" placeholder='Property Size' id='propertySize' min={1} required className='w-full p-4 border-stone-300 rounded'/>
                            </div>
                        </div>

                        <div className="w-full bg-stone-50 pt-7">
                            <p className='text-stone-600'><span className='font-bold text-black'>Image Plan:</span> The first image will be the cover (max 1)</p>
                            <input type="file" id='imagePlans' onChange={(e) => setFilesPlan(Array.from(e.target.files))} ref={fileRefPlan} className='hidden' accept='image/*' multiple/>
                            <div onClick={() => fileRefPlan.current.click()} className='w-full border rounded bg-white p-3 mt-2 overflow-hidden relative'>
                                <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer'></span>
                                <div className='flex justify-center items-center flex-col p-3 h-40 border-dashed border-2'>
                                    <HiCloudUpload className='text-5xl text-[#023E8A]/90'/>
                                    <p>Upload an Image</p>
                                    <div className={` ${filesPlan.length > 1 ? "text-red-600" : "text-green-600"}`}>
                                        {filesPlan.length ? <p className='space-x-1'><span>{filesPlan.length}</span><span>images selected</span></p> : ''}
                                    </div>
                                </div>
                            </div>
                            <p className='text-red-600 text-center'>{imageUploadErrorPlan && imageUploadErrorPlan}</p>
                            <div className='flex justify-center items-center'>
                            {uploadingPlan ? <FaCircleNotch className="animate-spin mt-3 text-[#023E8A]"/> : ""}
                            </div>
                            <div>
                                {formData.imagePlans.length > 0 && <div className='bg-white border mt-3 flex p-1 rounded'>
                                    {formData.imagePlans.map((url, index) => <div key={index} className='p-1 '>
                                        <div className='flex justify-between items-center rounded overflow-hidden'>
                                            <div className='flex items-center group/item relative'>
                                                <img src={url} alt="image" className='w-20 h-20 object-cover'/>
                                                <div className='group-hover/item:block hidden absolute top-0 left-0'>
                                                    <button type='button' onClick={handleRemoveImagePlan(index)} className='bg-[#fefcfb] border transition-opacity text-red-600 font-semibold py-1 p-3'>delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                                </div>}
                            </div>
                            <button type='button' disabled={uploadingPlan} onClick={handleImageSubmitPlan} className='bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none'>{uploadingPlan ? "uploading..." : "upload"}</button>
                        </div>

                        <div className="w-full bg-stone-50 pt-7">
                            <p className='text-stone-600'><span className='font-bold text-black'>Image Apartments:</span> The first image will be the cover (max 8)</p>
                            <input type="file" id='imageApartments' onChange={(e) => setFilesApartment(Array.from(e.target.files))} ref={fileRefApartment} className='hidden' accept='image/*' multiple/>
                            <div onClick={() => fileRefApartment.current.click()} className='w-full border rounded bg-white p-3 mt-2 overflow-hidden relative'>
                                <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer'></span>
                                <div className='flex justify-center items-center flex-col p-3 h-40 border-dashed border-2'>
                                    <div className='bg-green-600 p-2 rounded-md'>

                                    <HiCloudUpload className='text-5xl text-white'/>
                                    </div>
                                    <p>Upload an Image</p>
                                    <div className={` ${filesApartment.length > 8 ? "text-red-600" : "text-green-600"}`}>
                                        {filesApartment.length ? <p className='space-x-1'><span>{filesApartment.length}</span><span>images selected</span></p> : ''}
                                    </div>
                                </div>
                            </div>
                            <p className='text-red-600 text-center'>{imageUploadErrorApartment && imageUploadErrorApartment}</p>
                            <div>
                            {formData.imageApartments.length > 0 && <div className='bg-white mt-3 flex flex-wrap rounded border p-[4px]'>
                                {formData.imageApartments.map((url, index) => <div key={index} className='p-1'>
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center group/item relative rounded overflow-hidden border'>
                                            <img src={url} alt="image" className='w-20 h-20 object-cover'/>
                                            <div className='group-hover/item:block hidden absolute top-0 left-0'>
                                                <button type='button' onClick={handleRemoveImageApartment(index)} className='bg-[#fefcfb] border transition-opacity text-red-600 font-semibold py-1 p-3'>delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                            </div>}
                        </div>
                        <div className='flex justify-center items-center'>
                            {uploadingApartment ? <FaCircleNotch className="animate-spin mt-3 text-[#023E8A]"/> : ""}
                        </div>
                        <button type='button' disabled={uploadingApartment} onClick={handleImageSubmitApartment} className='bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none'>{uploadingApartment ? "uploading..." : "upload"}</button>
                        </div>

                        <div className="w-full">
                            <label htmlFor="titleApartments">Title Apartments</label>
                            <input type="text" id='titleApartments' placeholder='Title Apartments' className='rounded p-3 w-full border-stone-300'/>
                        </div>
                    </div>

                    <div className="w-full order-first md:order-2">
                        <p className='text-stone-600'><span className='font-bold text-black'>Images:</span> The first image will be the cover (max 6)</p>
                        <input onChange={(e) => setFiles(Array.from(e.target.files))} type="file" id='imageUrls' ref={fileRef} className='hidden' accept='image/*' multiple/>
                        <div onClick={() => fileRef.current.click()} className='w-full border rounded bg-white p-3 overflow-hidden relative'>
                            <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer'></span>
                            <div className='flex justify-center items-center flex-col p-3 h-80 border-dashed border-2'>
                                <HiCloudUpload className='text-7xl text-[#023E8A]/90'/>
                                <p>Upload an Image</p>
                                <div className={` ${files.length > 6 ? "text-red-600" : "text-green-600"}`}>
                                    {files.length ? <p className='space-x-1'><span>{files.length}</span><span>images selected</span></p> : ''}
                                </div>
                            </div>
                        </div>
                        <p className='text-red-600 text-center'>{imageUploadError && imageUploadError}</p>
                        <div>
                            {formData.imageUrls.length > 0 && <div className='bg-white border mt-3 flex flex-wrap p-1 rounded'>
                                {formData.imageUrls.map((url, index) => <div key={index} className='p-1 '>
                                    <div className='flex items-center rounded overflow-hidden border '>
                                        <div className='flex items-center group/item relative'>
                                            <img src={url} alt="image" className='w-28 h-28 object-cover'/>
                                            <div className='group-hover/item:block hidden absolute top-0 left-0'>
                                                <button type='button' onClick={handleRemoveImage(index)} className='bg-[#fefcfb] border transition-opacity text-red-600 font-semibold py-1 p-3'>delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                            </div>}
                        </div>
                        <div className='flex justify-center items-center'>
                            {uploading ? <FaCircleNotch className="animate-spin mt-3 text-[#023E8A]"/> : ""}
                        </div>
                        <button type='button' disabled={uploading} onClick={handleImageSubmit} className='bg-[#023E8A] rounded mt-4 font-bold text-white p-3 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none'>{uploading ? "uploading..." : "upload"}</button>
                    </div>
                    <div className='order-last'>
                        <button className='bg-green-700 uppercase hover:-skew-y-1 transition-all font-bold text-white rounded active:scale-95 active:transition-all p-4 w-full hover:shadow-lg'>Publish A Page</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePage;
