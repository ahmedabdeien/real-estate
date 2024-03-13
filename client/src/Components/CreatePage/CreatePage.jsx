import React from 'react'
import { FaExclamation } from "react-icons/fa6";
function CreatePage() {
  return (
    <main className='w-full '>
        <h1 className='text-center text-white bg-[#023E8A] p-2 text-xl font-semibold '>Create A Page</h1>
        <div className="w-full flex items-center justify-center col-span-1 md:col-span-2 text-stone-600 py-2 bg-stone-50 ">
                
                <FaExclamation className='text-lg'/>
                <p className='font-medium' >
                  Note please fill in the empty fields to create a good page  
                </p>
            </div>
        <div className=' lg:container'>
        <form className='p-5 grid grid-cols-1 md:grid-cols-2 gap-4  '>

         
                <div className="w-full  space-y-2">
                    <label htmlFor="name">Title</label>
                    <input type="text" placeholder='Title' id='name' maxLength={60} minLength={5} required className='w-full p-2 border rounded'/>
                </div>
                <div className="w-full space-y-2">
                <label htmlFor="address">Address</label>
                    <input type="address" placeholder='Address' id='address' required className='w-full p-2 border rounded'/>
                </div>
                <div className="w-full  space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="description">Description</label>
                    <textarea type="text" placeholder='Description' id='description' required className='w-full p-2 border rounded max-h-52 min-h-14' />
                </div>
                <div className='gap-3  flex flex-wrap md:justify-between justify-start  bg-amber-100 p-4 rounded border border-amber-200 '>
                    <label className='cursor-copy flex items-center'>
                    <input type="checkbox" name="" id="sale" className="accent-[#023E8A] cursor-copy size-5 me-1"/><span>Sale</span></label> 
                    <label className='cursor-copy flex items-center'>
                    <input type="checkbox" name="" id="rent" className="accent-[#023E8A] cursor-copy size-5 me-1" /><span>Rent</span></label>
                    <label className='cursor-copy flex items-center'>
                    <input type="checkbox" name="" id="parking" className="accent-[#023E8A] cursor-copy size-5 me-1"/><span>Parking Spot</span></label>
                    <label className='cursor-copy flex items-center'>
                    <input type="checkbox" name="" id="furnished" className="accent-[#023E8A] cursor-copy size-5 me-1"/><span>Furnished</span></label>
                    <label className='cursor-copy flex items-center'>
                    <input type="checkbox" name="" id="offer" className="accent-[#023E8A] cursor-copy size-5 me-1"/><span>Offer</span></label>
                </div>
                <div className="w-full flex items-center justify-center space-x-2 row-span-1 md:row-span-4 bg-[#023E8A] md:bg-blue-200 rounded p-4">
                    <input type="file"  id='regularPrice'  required className=' p-4 border md:rounded-full cursor-copy md:bg-white w-full md:w-auto font-semibold 
                    md:file:bg-[#023E8A] file:border-none md:text-[#023E8A] file:text-[#023E8A] text-white md:file:text-white file:p-4 rounded file:rounded-full'/>
                
                </div>
                <div className="w-full flex items-center space-x-2">
                    <input type="number" placeholder='Regular Price' id='regularPrice' min={1} max={10} required className=' p-4 border rounded'/>
                    <input type="number" placeholder='Regular Price' id='regularPrice' min={1} max={10} required className=' p-4 border rounded'/>
                </div>
            </form>

        </div>

    </main>
  )
}

export default CreatePage