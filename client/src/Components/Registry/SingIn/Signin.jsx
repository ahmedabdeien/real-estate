import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../../redux/user/userSlice";
import OAuth from "./../../OAuth/OAuth";

import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { Alert, FloatingLabel } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

function Signin() {
  const [visible, setVisible] = useState();
  const [formData, SetFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handelChange = (e) => {
    SetFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handelSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <section className="p-5 flex justify-center  items-center flex-col w-full h-[85vh]">
      <h1 className="text-2xl font-bold">SignIn</h1>
      <form
        onSubmit={handelSubmit}
        className="mt-4 flex flex-col w-full sm:w-2/3 md:w-1/2 lg:w-[30%]"
      >
        <FloatingLabel
          type="email"
          id="email"
          onChange={handelChange}
          variant="filled" 
          label="Email"
        />
        <div className="relative">
          <FloatingLabel
            type={visible ? "text" : "password"}
            id="password"
            onChange={handelChange}
            variant="filled" 
            label="Password"
          />
          <div
            onClick={() => setVisible(!visible)}
            className="absolute top-[50%] -translate-y-[50%] right-3"
          >
            {visible ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>
        <button
          disabled={loading}
          className="bg-[#034078] text-white py-2 mb-2 rounded hover:ring-offset-2 
      hover:ring-2 active:ring-offset-0 disabled:bg-[#1282a2] disabled:hover:ring-offset-0 
      disabled:hover:ring-0 "
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
        <OAuth />
      </form>
      <div className="flex p-1 w-full sm:w-2/3 md:w-1/2 lg:w-[30%] text-sm">
        <p className="">Dont have an account?</p>
        <Link to="/signup">
          <span className="text-blue-700 hover:underline ms-1">Sign Up</span>
        </Link>
      </div>
      {error && <Alert className="w-full sm:w-2/3 md:w-1/2 lg:w-[30%] mt-2" color="failure" icon={HiInformationCircle}>
      {error}
    </Alert>}
    </section>
  );
}

export default Signin;
