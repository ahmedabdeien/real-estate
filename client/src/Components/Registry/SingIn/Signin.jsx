import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import {  useSelector,useDispatch } from 'react-redux';
import { signInStart,signInSuccess,signInFailure} from '../../redux/user/userSlice'
import OAuth from './../../OAuth/OAuth';

import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";

function Signin() {
  const [visible,setVisible] = useState()
  const StyleInput = 'border p-2 rounded bg-gray-50 focus:outline-blue-600'
  const [formData,SetFormData] = useState({});
  const {loading,error} = useSelector((state)=> state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handelChange = (e)=>{
    SetFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  }
  const handelSubmit = async (e) => {
    e.preventDefault();
    try{
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    }catch(error){
      dispatch(signInFailure(error.message));
    }
    
    
  };

  return (
    <section className='p-5 flex justify-center  items-center flex-col w-full h-[85vh]'>
    <h1 className='text-2xl font-bold'>SignIn</h1>
    <form  onSubmit={handelSubmit} className='mt-4 flex flex-col space-y-2 w-full sm:w-2/3 md:w-1/2 lg:w-[30%]'>
      <input type="email" className={StyleInput} id='email' placeholder='Email' onChange={handelChange}/>
      <div className='relative'>
        <input type={visible?"text":"password"} className={`${StyleInput} w-full`} id='password' placeholder='Password' onChange={handelChange}/>
          <div onClick={()=>setVisible(!visible)} className="absolute top-[50%] translate-y-[-50%] right-2">
          {visible?<FaEye/>:<FaEyeSlash/>}
       </div>
      </div>
      <button disabled={loading} className='bg-blue-600 text-white py-2 rounded hover:ring-offset-2 
      hover:ring-2 active:ring-offset-0 disabled:bg-blue-600/70 disabled:hover:ring-offset-0 
      disabled:hover:ring-0 '>{loading?'Loading...':"Sign In"}</button>
      <OAuth/>
    </form>
    <div className='flex p-1 w-full sm:w-2/3 md:w-1/2 lg:w-[30%] text-sm'>
      <p className='text-black/80'>Dont have an account?</p>
      <Link to="/signup">
        <span className='text-blue-700 hover:underline ms-1'>Sign Up</span>
      </Link>
    </div>
    {error && <p className='text-red-500 text-sm'>{error}</p>}
</section>
  )
}

export default Signin