import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className=' w-full h-[90vh] bg-transparent'>
        <div className='dark:bg-gray-800/70 bg-stone-100 flex justify-center items-center w-full h-full'>
          <div className='bg-white p-12 border-stone-300 border rounded-sm'>
            <h1 className='text-6xl font-bold text-gray-800 dark:text-gray-200 '>404</h1>
            <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-200'>Page Not Found</h2>
            <p className='text-gray-600 mt-2 dark:text-gray-400'>Sorry, the page you are looking for does not exist.</p>
            <div className='mt-5'> 
            <Link to={'/'} className='bg-[#016FB9] hover:bg-[#016FB9]/90 text-white font-bold py-2 px-4 rounded-sm'>Go Back Home</Link>
            </div>
          </div>
        </div>

    </div>
  )
}
