import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../../OAuth/OAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FloatingLabel } from 'flowbite-react';

function Signup() {
  const StyleInput = 'border p-2 rounded bg-gray-50 focus:outline-blue-600';
  const [visible, setVisible] = useState(false);
  const [formData, SetFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define regex patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const egyptianPhonePattern = /^(01)[0125][0-9]{8}$/; // Updated regex for Egyptian phone numbers

  const handleChange = (e) => {
    SetFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateForm = () => {
    const { email, password, number } = formData;
    let validationError = '';

    if (!emailPattern.test(email)) {
      validationError = 'Invalid email format.';
    } else if (!passwordPattern.test(password)) {
      validationError = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    } else if (number && !egyptianPhonePattern.test(number)) {
      validationError = 'Invalid phone number. Must be a valid Egyptian phone number.';
    }

    return validationError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/signin');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <section className='p-5 flex justify-center items-center flex-col w-full h-[85vh]'>
      <h1 className='text-2xl font-bold'>SignUp</h1>
      <form onSubmit={handleSubmit} className='mt-4 flex flex-col w-full sm:w-2/3 md:w-1/2 lg:w-[30%]'>
        <FloatingLabel variant="filled" label="name" type="text" id='name' onChange={handleChange} />
        <FloatingLabel variant="filled" label="username" type="text" id='username' onChange={handleChange} />
        <FloatingLabel variant="filled" label="email" type="email" id='email' onChange={handleChange} />
        <FloatingLabel variant="filled" label="number" type="text" id='number' onChange={handleChange} />
        <div className='relative'>
          <FloatingLabel variant="filled" label="password" type={visible ? "text" : "password"} id='password' onChange={handleChange} />
          <div onClick={() => setVisible(!visible)} className="absolute top-[50%] translate-y-[-50%] right-2 cursor-pointer">
            {visible ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>
        <button disabled={loading} className='bg-[#034078] mb-2 text-white py-2 rounded hover:ring-offset-2 hover:ring-2 active:ring-offset-0 disabled:bg-[#1282a2] disabled:hover:ring-offset-0 disabled:hover:ring-0'>
          {loading ? 'Loading...' : "Sign Up"}
        </button>
        <OAuth />
      </form>
      <div className='flex p-1 w-full sm:w-2/3 md:w-1/2 lg:w-[30%] text-sm'>
        <p className=''>Have an account?</p>
        <Link to="/signin">
          <span className='text-blue-700 hover:underline ms-1'>Sign In</span>
        </Link>
      </div>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </section>
  );
}

export default Signup;
