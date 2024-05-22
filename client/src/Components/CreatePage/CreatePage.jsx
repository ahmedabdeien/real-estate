import React, { useRef } from 'react'
import { FaRegImages } from "react-icons/fa6";

function CreatePage() {
    const fileRef = useRef(null)
   
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
                <input type="file" id='imageUrls' ref={fileRef} className='hidden' accept='image/*' multiple/>
                <div onClick={()=>fileRef.current.click()} className='w-full border rounded bg-white p-3 mt-2 overflow-hidden relative'>
                    <span className='absolute top-0 left-0 w-full h-full hover:bg-stone-900/15 cursor-pointer '></span>
                    <div className='flex justify-center items-center flex-col p-3 h-80 border-dashed  border-2'>
                   <FaRegImages className='text-7xl text-[#023E8A]/90'/>   
                     <p>
                        Upload an Image
                     </p>
                     </div>
                </div>
            </div>
           <div className='order-last '>
            <button className='bg-green-700 hover:-skew-y-1 transition-all font-bold text-white rounded active:scale-95 active:transition-all p-4 w-full hover:shadow-lg'>Publish A Page</button>
           </div>
        </form>          
        </div>

    </div>
  )
}

export default CreatePage