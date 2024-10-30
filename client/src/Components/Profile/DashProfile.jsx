import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Badge } from 'flowbite-react';
import { FaCamera } from "react-icons/fa";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase.js';
import {
  updateFailure,
  updateStart,
  updateSuccess,
} from '../redux/user/userSlice.js';
import { Helmet } from "react-helmet";
function CustomizedDashProfile() {
  const { currentUser, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const filePickerRef = useRef();
  const [formData, setFormData] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          'Could not upload image (file must be less than 2MB)'
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, avatar: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setUpdateUserError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made!');
      return;
    }
    if (imageFileUploading) {
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's Profile updated successfully!");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  return (
    <>
    <Helmet>
      <title>Profile</title>
      <meta name="description" content="User Profile" />
    </Helmet>
    <div className="bg-white min-h-screen py-8 border-t">
      <div className="max-w-4xl mx-auto dark:bg-gray-800 overflow-hidden bg-white shadow-sm border border-stone-200">

       
        
        <form onSubmit={handleSubmit} className="p-4  gap-8">
          <div className=" flex flex-col items-center">

          <div className='bg-slate-50 w-full flex flex-col justify-center items-center'>
           <div className=" text-black p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-xl">Welcome, <span className="font-semibold text-[#ff9505]">{currentUser.name}!</span></p>
        </div>
        <div
              className="relative w-48 h-48 cursor-pointer shadow-md overflow-hidden mb-4"
              onClick={() => filePickerRef.current.click()}
            >
              {imageFileUploadProgress && (
                <CircularProgressbar
                  value={imageFileUploadProgress || 0}
                  text={`${imageFileUploadProgress}%`}
                  strokeWidth={5}
                  styles={{
                    root: {
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    },
                    path: {
                      stroke: `rgba(59, 130, 246, ${imageFileUploadProgress / 100})`,
                    },
                    text: { fill: '#034078', fontSize: '16px' },
                  }}
                />
              )}
              <img
                src={imageFileUrl || currentUser.avatar}
                alt="user"
                className={`${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'} w-full h-full object-cover border dark:border-gray-600 border-[#353531]/30`}
              />
              <button
              onClick={() => filePickerRef.current.click()}
              className="hover:bg-[#353531] w-full px-4 py-1 text-white rounded-sm bg-[#353531]/90 flex justify-center items-center space-x-2 absolute bottom-0 left-0"
              >
              <FaCamera/> <span>Change image</span>
            </button>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />
            <Badge
              color={currentUser.isAdmin ? 'failure' : currentUser.isBroker ? 'warning' : 'success'}
              size="xl"
            >
              {currentUser.isAdmin ? 'Admin' : currentUser.isBroker ? 'Broker' : 'User'}
            </Badge>
         </div>
          </div>
          
          <div className=" space-y-4">
            {imageFileUploadError && (
              <Alert color="failure" className="text-center">{imageFileUploadError}</Alert>
            )}
            <input
              type="text"
              id="name"
              variant="filled"
              placeholder='Full Name'
              defaultValue={currentUser.name}
              onChange={handleChange}
              className="w-full px-4 py-2  focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="text"
              id="username"
              variant="filled"
              placeholder='Username'
              defaultValue={currentUser.username}
              onChange={handleChange}
              className="w-full px-4 py-2  focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="email"
              id="email"
              variant="filled"
              placeholder='Email'
              defaultValue={currentUser.email}
              onChange={handleChange}
              className="w-full px-4 py-2  focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="number"
              id="number"
              variant="filled"
              number="number"
              placeholder="Phone Number"
              defaultValue={currentUser.number}
              onChange={handleChange}
              className="w-full px-4 py-2  focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="password"
              id="password"
              variant="filled"
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full px-4 py-2  focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <div className="flex justify-between items-center">
              <button type="submit" className='hover:bg-green-600 px-4 py-2 text-white bg-green-500' >
                Update Profile
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(currentUser.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </form>

        <div className="p-4">
          {updateUserSuccess && (
            <Alert color="success" className="text-center mb-4 rounded-none py-3 border border-red-200">
              {updateUserSuccess}
            </Alert>
          )}
          {updateUserError && (
            <Alert color="failure" className="text-center mb-4 rounded-none py-3 border border-red-200">
              {updateUserError}
            </Alert>
          )}
          <div className='flex justify-end'>
          <button className="p-3 px-6 text-red-600 w-full font-semibold bg-[#353531]/30 outline-2"
            
            onClick={() => {
              localStorage.removeItem('token');
              window.location.reload();
            }}
          >
            Logout
          </button> 
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default CustomizedDashProfile;