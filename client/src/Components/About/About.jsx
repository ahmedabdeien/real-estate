import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      <div className="w-full h-80 lg:h-auto bg-fixed bg-cover bg-zinc-600 bg-[url(https://images.unsplash.com/photo-1700836548081-2e8a10a24519?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)]">
        <div className="w-full h-full flex flex-col justify-center items-center  bg-stone-800/80">
          <h1 className="text-4xl font-bold text-white mb-4 underline  decoration-wavy underline-offset-8 decoration-stone-200">
            ABOUT ELSARH
          </h1>
          <p>
            <Link to="/" className="text-white underline">
              Home
            </Link>
          </p>
        </div>
      </div>
      <div className="w-full text-stone-600">
        <div className="py-10 container">
          <h4 className="text-2xl font-bold text-stone-900">
          El Sarh Real Estate Investment Company
          </h4>
          <p className=" text-zinc-900  py-5">
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
            is not just a real estate company; it's a visionary force
            transforming the face of Egypt and crafting living spaces that
            transcend expectations.
          </p>
          <p className=" text-zinc-900  py-5">
            Building Dreams and Fostering Communities
          </p>
         
        </div>

      </div>
    </section>
  );
}

export default About;
