import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import OAuth from '../../OAuth/OAuth';

import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";


function Signup() {

  const StyleInput = 'border p-2 rounded bg-gray-50 focus:outline-blue-600'
  const [visible,setVisible] = useState()

  const [formData,SetFormData] = useState({});
  const [erorr,setError] = useState(null);
  const [loading,setLoading] =useState(false)
  const navigate = useNavigate();
  const handelChange = (e)=>{ 
    SetFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  }
  const handelSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const res = await fetch('/api/auth/signUp',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if(data.success === false){
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/signin');
    }catch(error){
      setLoading(false);
      setError(error.message);
    }
    
    
  };

  return (
    <section className='p-5 flex justify-center  items-center flex-col w-full h-[85vh]'>
    <h1 className='text-2xl font-bold'>SignUp</h1>
    <form   onSubmit={handelSubmit} className='mt-4 flex flex-col space-y-2 w-full sm:w-2/3 md:w-1/2 lg:w-[30%]'>
      <input type="text"   className={StyleInput}  id='name' placeholder='Name' onChange={handelChange}/>
      <input type="text"   className={StyleInput}  id='username' placeholder='Username' onChange={handelChange}/>
      <input type="email"  className={StyleInput}  id='email' placeholder='Email' onChange={handelChange}/>
      <input type="number" className={StyleInput} number="number"  id='number' placeholder='Phone Number' onChange={handelChange}/>
      <div className='relative'>
      <input type={visible?"text":"password"} className={`${StyleInput} w-full`} name='password' id='password' placeholder='Password' onChange={handelChange}/>
          <div onClick={()=>setVisible(!visible)} className="absolute top-[50%] translate-y-[-50%] right-2">
          {visible?<FaEye/>:<FaEyeSlash/>}
          </div>
      </div>
      <button disabled={loading} className='bg-[#034078] text-white py-2 rounded hover:ring-offset-2 
      hover:ring-2 active:ring-offset-0 disabled:bg-[#1282a2] disabled:hover:ring-offset-0 
      disabled:hover:ring-0 '>{loading?'Loading...':"Sign Up"}</button>
      <OAuth/>
    </form>
    <div className='flex p-1 w-full sm:w-2/3 md:w-1/2 lg:w-[30%] text-sm'>
      <p className='text-black/80'>have an account?</p>
      <Link to="/signin">
        <span className='text-blue-700 hover:underline ms-1'>Sign In</span>
      </Link>
    </div>
    {erorr && <p className='text-red-500 text-sm'>{erorr}</p>}
</section>
  )
}

export default Signup