import React from 'react'

function CreatePage() {
  return (
    <main className='w-full '>
        <h1 className='text-center text-white bg-[#023E8A] p-2 text-xl font-semibold '>Create A Page</h1>
        <div className="w-full flex items-center justify-center col-span-1 md:col-span-2 text-stone-600 py-2 shadow ">
            
                <p className='font-medium' >
                  Note please fill in the empty fields to create a good page  
                </p>
            </div>
        <div className=' md:container'>
        <form className='p-5 grid grid-cols-1 md:grid-cols-2 gap-4  '>

         
                <div className="w-full  space-y-2">
                    <label htmlFor="name">Title</label>
                    <input type="text" placeholder='Title' id='name' maxLength={60} minLength={5} required className='w-full p-2 border rounded'/>
                    <label htmlFor="address">Address</label>
                    <input type="address" placeholder='Address' id='address' required className='w-full p-2 border rounded'/>
                   <label htmlFor="description">Description</label>
                    <textarea type="text" placeholder='Description' id='description' required className='w-full p-2 border rounded max-h-52 min-h-14' />

                <div className="w-full shadow-sm rounded-md p-1 border">
                    <div className='w-full flex gap-1 mb-1'>
                    <input type="number" placeholder='Regular Price' id='regularPrice' min={1} required className=' p-4 border w-1/2 rounded'/>
                    <input type="number" placeholder='Regular Price' id='regularPrice' min={1} required className=' p-4 border w-1/2 rounded'/>
                    </div>
                <select className=' p-4 border rounded w-full bg-yellow-50' name="" id="">
                    <option value="">Available</option>
                    <option value="room">Unavailable</option>
                    <option value="other">Other</option>
                </select>
                </div>
                </div>


                <div className="w-full flex items-center justify-center space-x-2 row-span-1 md:row-span-4 bg-[#023E8A] md:bg-stone-100 border rounded p-4">
                    <input type="file"  id='regularPrice'  required className=' p-4 border md:rounded-full cursor-copy md:bg-white w-full md:w-auto font-semibold 
                    md:file:bg-[#023E8A] file:border-none md:text-[#023E8A] file:text-[#023E8A] text-white md:file:text-white file:p-4 rounded file:rounded-full'/>
                </div>
                <div className="w-full  space-x-2 justify-between bg-yellow-50 p-4">
                    <label htmlFor="imagePlans">Image Plans</label>
                    <input type="file" name='imagePlans'  id='imagePlans'  required className=' p-4 border md:rounded-full cursor-copy md:bg-white w-full md:w-auto font-semibold 
                    md:file:bg-[#023E8A] file:border-none md:text-[#023E8A] file:text-[#023E8A] text-white md:file:text-white file:p-4 rounded file:rounded-full'/>
                   
                </div>
            </form>
                

        </div>

    </main>
  )
}

export default CreatePage