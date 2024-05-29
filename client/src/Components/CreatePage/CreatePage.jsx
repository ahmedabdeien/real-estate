import React, { useRef, useState } from 'react'
import { FaRegImages } from "react-icons/fa6";
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../../firebase';
import { FaCircleNotch } from "react-icons/fa6";

function CreatePage() {
    const fileRef = useRef(null)
    const [files,setFiles] = useState([])
    const handleImageSubmit = ()=>{
        if(files.length > 0 && files.length + formData.imageUrls.length < 7){
        setUploading(true);
        setImageUploadError(false);
         const promises =[];
         for(let i = 0; i<files.length; i++){
            promises.push(storeImage(files[i]));
         }
            Promise.all(promises).then((urls)=>{
                setFormData({...formData,
                imageUrls:formData.imageUrls.concat(urls)
            });
             setImageUploadError(false);
             setUploading(false);
             
            }).catch((error)=>{
            
                setImageUploadError("image upload failed (2 mb max size per image)");
                setUploading(false);
                 });
            
        }else{
            setImageUploadError("You can only upload 6 images");
            setUploading(false);
        }
    }
   const storeImage = async (file)=>{
    return new Promise((resolve,reject)=>{
        const storage = getStorage(app);
        const fileName = new Date().getTime + file.name;
        const storageRef = ref(storage,fileName);
        const uploadTask = uploadBytesResumable(storageRef,file);
        uploadTask.on(
            'state_changed',
            (snapshot)=>{
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error)=>{
                reject(error)
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                    resolve(downloadURL);
                });
            }

        )
    });
   }
  
   const [formData ,setFormData]= useState({
         imageUrls:[],
 


   })
   const [imageUploadError,setImageUploadError] = useState(false)
    const handleRemoveImage = (index)=>()=>{
        const newImages = formData.imageUrls.filter((url,i)=>i !== index);
        setFormData({
            ...formData,
            imageUrls:newImages
        })
    };
    const [uploading,setUploading] = useState(false)
   return (
    <div className='w-full bg-stone-50'>
        <h1 className='text-center text-white bg-[#023E8A] p-2 text-xl font-semibold '>Create A Page</h1>
        <div className="w-full flex items-center justify-center col-span-1 md:col-span-2 text-stone-600 bg-white py-2 shadow ">
            
                <p className='font-medium' >
                  Note please fill in the empty fields to create a good page  
                </p>
            </div>
        <div className=' md:container'>
        <form className='p-5  grid grid-cols-1 md:grid-cols-2 gap-4  '>
            
                <div className="w-full space-y-2  ">
                    <div>
                       <label htmlFor="name">Title</label>
                       <input type="text" placeholder='Title' id='name' maxLength={60} minLength={3} required className='w-full p-3 border rounded'/>
                    </div>
                    <div>
                       <label htmlFor="address">Address</label>
                       <input type="address" placeholder='Address' id='address' required className='w-full p-3 border rounded'/>
                    </div>
                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea type="text" placeholder='Description' id='description' required className='w-full p-2 border rounded max-h-60 min-h-32' />
                    </div>
                    <div className="w-full  rounded-sm  ">
                      <p>Available Or Not</p>
                      <select className=' p-3 border rounded w-full ' required id="availableOrNot">
                         <option value="Available">Available</option>
                         <option value="Unavailable">Unavailable</option>
                         <option value="other">Other</option>
                      </select>
                    </div>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-2'>
                        <div className=''>
                           <label htmlFor="numberFloors">Number Floors</label>
                           <input type="number" placeholder='Number Floors' id='numberFloors' min={1} max={20} required className='w-full p-4 border rounded'/>
                        </div>
                        <div>
                           <label htmlFor="Property Size">Property Size</label>
                           <input type="number" placeholder='Property Size' id='propertySize' min={1} required className='w-full p-4 border rounded'/>
                        </div>
                    </div>

                


                <div className="w-full bg-stone-50  pt-7 ">
                    <p className='text-stone-600'><span className='font-bold text-black'>Image Plan:</span> The first image will be the cover (max 1)</p>
                    <input type="file" id='imagePlans'  ref={fileRef} className='hidden' accept='image/*' multiple/>
                    <div onClick={()=>fileRef.current.click()} className='w-full border rounded bg-white p-3 mt-2 overflow-hidden relative'>
                        <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer '></span>
                        <div className='flex justify-center items-center flex-col p-3 h-40 border-dashed  border-2'>
                        <FaRegImages className='text-5xl text-[#023E8A]/90'/>   
                        <p>
                          Upload an Image
                        </p>
                     </div>
                    </div>
                </div>

                
                <div className="w-full bg-stone-50 pt-7">
                    <p className='text-stone-600'><span className='font-bold text-black'>Image Apartments:</span> The first image will be the cover (max 8)</p>
                    <input type="file" id='imageApartments' ref={fileRef} className='hidden' accept='image/*' multiple/>
                    <div onClick={()=>fileRef.current.click()} className='w-full border rounded bg-white p-3 mt-2 overflow-hidden relative'>
                        <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer '></span>
                        <div className='flex justify-center items-center flex-col p-3 h-40 border-dashed  border-2'>
                        <FaRegImages className='text-5xl text-[#023E8A]/90'/>   
                        <p>
                           Upload an Image
                        </p>
                     </div>
                    </div>
                </div>
                <div className="w-full  ">
                    <label htmlFor="titleApartments">Title Apartments</label>
                    <input type="text" id='titleApartments' placeholder='Title Apartments' className='rounded p-3 w-full border'/>
                </div>

            </div>


            <div className="w-full   order-first md:order-2">
                <p className='text-stone-600'><span className='font-bold text-black'>Images:</span> The first image will be the cover (max 6)</p>
                <input onChange={(e)=>setFiles(e.target.files)}  type="file" id='imageUrls' ref={fileRef} className='hidden' accept='image/*' multiple/>
                <div onClick={()=>fileRef.current.click()} className='w-full border rounded bg-white p-3 overflow-hidden relative'>
                    <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer '></span>
                    <div className='flex justify-center items-center flex-col p-3 h-80 border-dashed  border-2'>
                   <FaRegImages className='text-7xl text-[#023E8A]/90'/>   
                     <p>
                        Upload an Image
                     </p>
                     <div className={` ${files.length > 6 ? "text-red-600":"text-green-600"}`}>
                          { files.length?<p className='space-x-1'><span>{files.length}</span><span>images selected</span> </p>:''}
                     </div>
                     </div>
                </div> 
              <p className='text-red-600 text-center'>{imageUploadError && imageUploadError }</p>
              
               <div>
                     {formData.imageUrls.length > 0 && <div className='grid grid-cols-1 bg-white rounded-md mt-3 divide-y '>
                          {formData.imageUrls.map((url,index)=><div key={index} className='p-2 '>
                            <div className='flex justify-between items-center'>
                                <div className='flex items-center '>
                                   <img src={url} alt="image" className=' w-16 h-16 rounded-md object-cover'/>
                                   <p className='text-sm ms-3'>
                                       <p className='text-green-600'> <span className='font-semibold text-black'>image number :</span> {1+ index}</p>
                                      <p className='text-black/70'>{formData.imageUrls.join().slice(131,181)}</p>
                                   </p>
                                </div>
                                <div>
                                  <button type='button' onClick={handleRemoveImage(index)} className='bg-red-600 hover:bg-red-600/85 transition-opacity text-white font-semibold rounded py-2 px-4'> delete</button>  
                                </div>
                            </div>
                            
                           
                          </div>)}
                     </div>}
               </div>
                <div className=' flex justify-center items-center'>
                   {uploading?<FaCircleNotch className="animate-spin mt-3 text-[#023E8A]"/>:""}
                </div>
                <button type='button' disabled={uploading} onClick={handleImageSubmit} className='bg-[#023E8A] rounded mt-4 font-bold  text-white p-4 w-full hover:shadow-lg flex justify-center items-center disabled:bg-[#023E8A]/70 disabled:shadow-none'>{uploading?"upload...":"upload"}</button>
               
            </div>
           <div className='order-last '>
            <button className='bg-green-700 uppercase hover:-skew-y-1 transition-all font-bold text-white rounded active:scale-95 active:transition-all p-4 w-full hover:shadow-lg'>Publish A Page</button>
           </div>
          
        </form>          
        </div>

    </div>
  )
}

export default CreatePage