import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className='flex justify-center items-center w-full h-[90vh]'>

        <div className=''>
            <h1 className='text-6xl font-bold text-gray-800'>404</h1>
            <h2 className='text-2xl font-bold text-gray-800'>Page Not Found</h2>
            <p className='text-gray-600 mt-2'>Sorry, the page you are looking for does not exist.</p>
            <div className='mt-5'> 
            <Link to={'/'} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full'>Go Back Home</Link>
            </div>

        </div>

    </div>
  )
}
