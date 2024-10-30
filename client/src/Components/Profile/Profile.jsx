import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, Button, Alert } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice';

export default function CustomizedProfile() {
  const { currentUser, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const filePickerRef = useRef();
  const [formData, setFormData] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    // Implement your image upload logic here
    // For now, we'll just simulate progress
    setImageFileUploadProgress(0);
    const interval = setInterval(() => {
      setImageFileUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement your update logic here
    setUpdateUserSuccess("Profile updated successfully!");
  };

<<<<<<< HEAD
  return (
    <div className="bg-gradient-to-b from-stone-100 to-stone-200 min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Personal Information</h1>
          <p className="text-xl">Welcome, <span className="font-semibold">{currentUser.name}!</span></p>
        </div>
=======
 

  return <>
    <div>
      <h2 className='text-2xl font-bold py-2 text-white w-full bg-[#023E8A]  text-center'>Profile page</h2>
    </div>

      <div className="col-span-1 lg:col-span-2 justify-center flex items-center text-2xl font-bold shadow py-3 mb-3 lg:mb-0">
        <h2>
          Helloo <span className="text-blue-600">{currentUser.name}</span>
        </h2>
      </div>
    <div className='grid grid-cols-1 lg:gap-2 lg:grid-cols-2 md:px-10 p-4  '>

      <div className=''>
>>>>>>> 0ea3d3ab38f1a6f93b269704f997aea5d29a010f
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
                <img
                  src={imageFileUrl || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full border-4 border-blue-200"
                />
                {imageFileUploadProgress !== null && (
                  <div className="absolute inset-0">
                    <CircularProgressbar
                      value={imageFileUploadProgress}
                      text={`${imageFileUploadProgress}%`}
                      styles={{
                        root: { width: '100%', height: '100%' },
                        path: { stroke: `rgba(59, 130, 246, ${imageFileUploadProgress / 100})` },
                      }}
                    />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={filePickerRef}
                hidden
              />
              <Button
                onClick={() => filePickerRef.current.click()}
                gradientDuoTone="cyanToBlue"
                className="mb-4"
              >
                Change Avatar
              </Button>
              <Badge
                color={currentUser.isAdmin ? 'failure' : currentUser.isBroker ? 'warning' : 'success'}
                size="xl"
              >
                {currentUser.isAdmin ? 'Admin' : currentUser.isBroker ? 'Broker' : 'User'}
              </Badge>
            </div>
<<<<<<< HEAD
=======
          
         </div>
         <p className="text-sm text-stone-600 mt-2 text-center">click for input change name and email and phone number and password ahd avatar </p>
      </div>
      <div className="mt-8 border-t-2 pt-4 lg:mt-0 lg:border-none lg:pt-0"> 
          <div className="flex justify-center items-center relative border rounded py-2 overflow-hidden">
          <svg className="absolute top-0 left-0 -z-10 animate-pulse" id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(65)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke='hsla(259, 0%, 92%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(-1,-2)' fill='url(#a)'/></svg>
        <Link to={"/create-page"} className="group/acss bg-green-600 font-semibold text-white p-5 rounded  hover:bg-green-800 hover:scale-105 transition-all flex justify-center items-center">
          <FaPlus className="me-1"/>
          <span>Create Page</span>  
>>>>>>> 0ea3d3ab38f1a6f93b269704f997aea5d29a010f
            
            <div className="md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      defaultValue={currentUser.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      defaultValue={currentUser.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      defaultValue={currentUser.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="number"
                      number="number"
                      defaultValue={currentUser.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button type="submit" gradientDuoTone="greenToBlue">
                    Update Profile
                  </Button>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(currentUser.updatedAt).toLocaleString()}
                  </p>
                </div>
              </form>
              
              {updateUserSuccess && (
                <Alert color="success" className="mt-4">
                  {updateUserSuccess}
                </Alert>
              )}
              {updateUserError && (
                <Alert color="failure" className="mt-4">
                  {updateUserError}
                </Alert>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 text-center">
          <Button
            color="failure"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}