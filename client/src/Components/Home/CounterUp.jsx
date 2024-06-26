import { useState } from 'react';
import CountUp from 'react-countup';
import ScrollTrigger from 'react-scroll-trigger'; 
export default function CounterUp() {
    const [counterOn, setCounterOn] = useState(false);
  return (
    <ScrollTrigger onEnter={() => setCounterOn(true)} onExit={()=>setCounterOn(false)}>
      <div className=' bg-imagess w-full'>
        <div className='py-8 px-5 md:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  text-xl font-medium items-center  bg-[#033e8a]/90 dark:bg-stone-800/90 divide-y md:divide-y-0 '>

          <div className=' text-center space-y-2 p-16 text-white '>
            <h1 className='text-5xl text-[#ff9505] font-medium'>
              {counterOn && <CountUp start={0} end={280} duration={3}/>}+
            </h1> 
            <p>Our Projects</p>
         </div>
         <div className='text-center space-y-2 p-16 text-white   '>
            <h1 className='text-5xl text-[#ff9505] font-medium'>
              {counterOn && <CountUp start={0} end={30} duration={3}/>}+
            </h1> 
            <p>Projects Under Constructions</p>
         </div>
         <div className='text-center space-y-2 p-16 text-white '>
            <h1 className='text-5xl  text-[#ff9505] font-medium '>
              {counterOn && <CountUp start={0} end={3570} duration={3}/>}+
            </h1> 
            <p>Units Delivered</p>
         </div>

       </div>
     </div>
    </ScrollTrigger>
  )
}
