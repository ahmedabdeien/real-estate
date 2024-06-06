import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className=' w-full h-[90vh] bg-transparent
     bg-[url("https://images.unsplash.com/photo-1634635720982-88d440c3f4a7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")]
    '>
        <div className='dark:bg-gray-800/70 bg-white/80 flex justify-center items-center w-full h-full'>
          <div >
            <h1 className='text-6xl font-bold text-gray-800 dark:text-gray-200 '>404</h1>
            <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-200'>Page Not Found</h2>
            <p className='text-gray-600 mt-2 dark:text-gray-400'>Sorry, the page you are looking for does not exist.</p>
            <div className='mt-5'> 
            <Link to={'/'} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full'>Go Back Home</Link>
            </div>
          </div>
        </div>

    </div>
  )
}
