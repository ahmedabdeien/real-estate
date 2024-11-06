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
    <div className="bg-white p-4 py-6 border-t">
      <div className='bg-[#004483]/20 px-4 py-6 mb-4 rounded-lg'>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
            <p className="text-xl">Welcome, <span className="font-semibold text-blue-600">{currentUser.name} . . !</span></p>
            </div>
      <div className=" mx-auto dark:bg-gray-800 overflow-hidden bg-white border-stone-200">
       
        <form onSubmit={handleSubmit} className=" gap-8">
          <div className=" flex flex-col items-center">

          <div className='bg-cover bg-[url("https://images.pexels.com/photos/6271074/pexels-photo-6271074.jpeg")]  w-full border rounded-lg mb-4'>
           <div className='bg-white/60 w-full flex flex-col md:flex-row gap-4 justify-around items-center p-4 backdrop-blur-sm'>

           
            <div className="relative w-48 h-48 cursor-pointer rounded-full bg-white overflow-hidden mb-4 group/item ">
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
                className={`${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'} rounded-full w-full h-full object-cover border dark:border-gray-600 border-[#353531]/30  `}
              />
              <button
              onClick={() => filePickerRef.current.click()}
              className="w-full h-full px-4 py-1 text-white rounded-sm text-xs bg-[#353531]/90 flex justify-center items-center invisible  group-hover/item:visible space-x-2 absolute top-0 left-0"
              >
              <FaCamera/> <span>Change image</span>
            </button>
            </div>
            <div className='text-center md:text-start'>
              <h2>{currentUser.name}</h2>
              <h2>{currentUser.username}@</h2>
              <h2>{currentUser.email}</h2>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />
            <div>
            <Badge
              color={currentUser.isAdmin ? 'failure' : currentUser.isBroker ? 'warning' : 'success'}
              size="xl"
            >
              {currentUser.isAdmin ? 'Admin' : currentUser.isBroker ? 'Broker' : 'User'}
            </Badge>
            </div>
            </div>
         </div>
          </div>
          
          <div className=" space-y-4 rounded-lg border p-4">
            {imageFileUploadError && (
              <Alert color="failure" className="text-center">{imageFileUploadError}</Alert>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
             <div className='space-y-3'>
            <input
              type="text"
              id="name"
              variant="filled"
              placeholder='Full Name'
              defaultValue={currentUser.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="text"
              id="username"
              variant="filled"
              placeholder='Username'
              defaultValue={currentUser.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="email"
              id="email"
              variant="filled"
              placeholder='Email'
              defaultValue={currentUser.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="tel"
              id="number"
              variant="filled"
              number="number"
              placeholder="Phone Number"
              defaultValue={currentUser.number}
              disabled={currentUser._id && !currentUser.isAdmin ||!currentUser.isBroker}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            <input
              type="password"
              id="password"
              variant="filled"
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md focus:ring-0 border-stone-200 bg-white dark:bg-gray-700 focus:border-[#016FB9]"
            />
            
            <div className="space-y-2">
              <button type="submit" className='hover:bg-green-600 px-4 py-2 rounded-md text-white bg-green-500 w-full' >
                Update Profile
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(currentUser.updatedAt).toLocaleString()}
              </p>
            </div>
            
            </div>

            <div className='bg-zinc-800 rounded-lg flex justify-center items-center'>
              <p>elsarh real estate</p>
            </div>
            </div>

          </div>
        </form>

        <div className="mt-4">
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
          <button className="p-3 px-6 text-red-600 hover:bg-red-200 w-full font-semibold bg-red-300 outline-2 rounded-md"
            
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