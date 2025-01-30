import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='w-full min-h-[100vh] bg-transparent flex items-center justify-center p-4'>
      <div className='absolute inset-0 dark:bg-gray-900/70 bg-stone-100/95 backdrop-blur-sm' />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='relative z-10 dark:bg-gray-800 bg-white p-8 rounded-2xl shadow-2xl border dark:border-gray-700 max-w-md w-full'
      >
        <div className='space-y-6 text-center'>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='flex flex-col items-center'
          >
            <div className='text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              404
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className='h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full'
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='space-y-3'
          >
            <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
              Lost in the Void
            </h2>
            <p className='text-gray-600 dark:text-gray-300'>
              The page you're seeking has vanished into the digital abyss. Let's get you back home.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='mt-6'
          >
            <Link
              to='/'
              className='inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300'
            >
              <Home className='w-5 h-5' />
              Return to Home
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                className='ml-1'
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden z-0'>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1 h-1 bg-blue-400/20 rounded-full'
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}