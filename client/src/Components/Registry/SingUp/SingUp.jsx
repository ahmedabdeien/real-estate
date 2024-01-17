import React from 'react'
import { Link } from 'react-router-dom'

function SingUp() {
  const StyleInput = 'border p-2 rounded bg-gray-50 focus:outline-blue-600'
  return (
    <section className='p-5 flex justify-center items-center flex-col w-full h-[85vh]'>
    <h1 className='text-2xl font-bold'>SignUp</h1>
    <form className='mt-4 flex flex-col space-y-2 w-full sm:w-2/3 md:w-1/2 lg:w-[30%]'>
      <input type="text" className={StyleInput} placeholder='UserName'/>
      <input type="email" className={StyleInput} placeholder='Email'/>
      <input type="text" className={StyleInput} placeholder='Phone Number'/>
      <input type="password" className={StyleInput} placeholder='Password'/>
      <button className='bg-blue-600 text-white py-2 rounded hover:ring-offset-2 hover:ring-2 active:ring-offset-0 disabled:bg-blue-600/70 disabled:hover:ring-offset-0 disabled:hover:ring-0 '>SignUp</button>
    </form>
    <div className='flex p-1 w-full sm:w-2/3 md:w-1/2 lg:w-[30%] text-sm'>
      <p className='text-black/80'>have an account?</p>
      <Link to="/singIn">
        <span className='text-blue-700 hover:underline ms-1'>Sign in</span>
      </Link>
    </div>
</section>
  )
}

export default SingUp