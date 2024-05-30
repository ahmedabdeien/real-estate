import elsarhLoge from "../../assets/images/logoElsarh.png";

function About() {
  return (
    <section className="">
      <div className="w-full rounded-b-2xl overflow-hidden h-80 bg-fixed bg-cover bg-zinc-600 bg-[url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODZ8fHJlYWwlMjBzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D)]">
        <div className="w-full h-full bg-[#1282a2]/80 flex justify-center items-center">
          
          <h1 className="text-4xl md:text-5xl font-bold text-white ">
           About <p className="text-[#034078] bg-white">ELSARH Real Estate</p>
          </h1>
         
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 container m-auto py-3 lg:p-7 ">
       <div className=" flex justify-center items-center bg-[#fefcfb] p-3 border">
         <div className="bg-[#001f54] p-2 border-b-4 border-[#c98d00]">
            <img src={elsarhLoge} alt="elsarhLoge" className="w-72 " />
         </div>
       </div>
       <div className="w-full  text-stone-600 lg:col-span-2 p-2 ">
        <div>
          <h4 className="text-2xl font-bold text-stone-900">
          El Sarh Real Estate Investment Company
          </h4>
          <p className=" text-zinc-900  py-5 ">
            Investment Company (El Sarh) stands out as a premier developer in
            Egypt, renowned for its transformative vision and dedication to
            crafting exceptional living spaces. Since its inception in 2005, El
            Sarh has carved a path of excellence, leaving an indelible mark on
            the Egyptian real estate landscape.
          </p>
          <p className=" text-zinc-900  py-5 ">
            Unmatched quality and exceptional construction standards Innovative
            designs and contemporary architectural styles Diverse portfolio
            catering to a variety of needs and preferences Commitment to
            building vibrant communities with unparalleled amenities Sustainable
            practices and a clear focus on environmental responsibility El Sarh
            is not just a real estate company; it&apos;s a visionary force
            transforming the face of Egypt and crafting living spaces that
            transcend expectations.
          </p>
          <p className=" text-zinc-900  py-5">
            Building Dreams and Fostering Communities
          </p>
         
        </div>
      </div>
      </div>
    </section>
  );
}

export default About;
