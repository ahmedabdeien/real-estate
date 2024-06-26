import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png'

export default function AboutHome() {
  return (
    <>
    <div className='bg-stone-100 dark:bg-stone-800'>
      <div className='py-8 grid gap-3 grid-cols-1 lg:grid-cols-2 items-center container  '>
        <div className=''>
          <h2 className='text-3xl font-semibold mb-2'>ElSarh Real Estate Investment Company</h2>
          <p>
            Investment Company (ElSarh) stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces. Since its inception in 2005, El Sarh has carved a path of excellence, leaving an indelible mark on the Egyptian real estate landscape.
           </p> 
        </div>
        <div className='flex justify-end'>
        <iframe className=' w-full lg:w-[84%]' width="560" height="315" src="https://www.youtube.com/embed/5r-IJ2CcGIs?si=_fKg71zXOGam7A7R&amp;start=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
    </div>
    </div>
    <div className='bg-white dark:bg-stone-900'>
    <div className='py-8 grid gap-3 grid-cols-1 md:grid-cols-2 items-center container '>
        <div className='flex justify-start md:p-5'>
        <img src={imgElsarh} alt="imgElsarh" className='md:rounded-2xl' />
        </div>
        <div className=''>
          <h2 className='text-3xl font-semibold mb-2'>ElSarh Real Estate Investment Company</h2>
          <p>
            Investment Company (ElSarh) stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces. Since its inception in 2005, El Sarh has carved a path of excell
          </p>
          <p>
           ence, leaving an indelible mark on the Egyptian real estate landscape.
           </p>
           </div>
           </div>
    </div>

    </>
  )
}
