import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaRegSave, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../../firebase.js';
import { updateFailure, updateStart, updateSuccess } from '../redux/user/userSlice.js';
import { Helmet } from "react-helmet";
import Button from "../UI/Button";
import Input from "../UI/Input";

const CustomizedDashProfile = () => {
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


  // ... (keep existing state and logic)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>Profile</title>
        <meta name="description" content="User Profile" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[var(--background)] p-4 md:p-8 transition-colors duration-500"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto bg-[var(--card)] rounded-none shadow-premium border border-[var(--border)] overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-primary p-6 text-white">
            <motion.h1 variants={itemVariants} className="text-3xl font-black">حسابي</motion.h1>
            <motion.p variants={itemVariants} className="text-lg mt-2 font-medium">
              مرحباً، <span className="font-black">{currentUser.name}</span>
            </motion.p>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            {/* Avatar Section */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
              <div className="relative group w-32 h-32">
                <CircularProgressbar
                  value={imageFileUploadProgress || 0}
                  text={imageFileUploadProgress ? `${imageFileUploadProgress}%` : ''}
                  strokeWidth={5}
                  className="absolute inset-0"
                  styles={{
                    path: { stroke: `rgba(255,255,255,${imageFileUploadProgress / 100})` },
                    text: { fill: '#fff', fontSize: '24px' }
                  }}
                />
                <img
                  src={imageFileUrl || currentUser.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-none border-4 border-white shadow-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <button
                  onClick={() => filePickerRef.current.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-none transition-opacity"
                >
                  <FaCamera className="text-2xl text-white" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={filePickerRef}
                  hidden
                />
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.form variants={containerVariants} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <Input
                    id="name"
                    label="Full Name"
                    type="text"
                    defaultValue={currentUser.name}
                    onChange={handleChange}
                  />

                  <Input
                    id="username"
                    label="اسم المستخدم"
                    type="text"
                    defaultValue={currentUser.username}
                    onChange={handleChange}
                  />

                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    defaultValue={currentUser.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <Input
                    id="number"
                    label="Phone Number"
                    type="tel"
                    defaultValue={currentUser.number}
                    onChange={handleChange}
                    disabled={!currentUser.isAdmin && !currentUser.isBroker}
                  />

                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    onChange={handleChange}
                  />

                  <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      <span className={`px-3 py-1 rounded-none text-sm ${currentUser.isAdmin ? 'bg-red-100 text-red-800' :
                        currentUser.isBroker ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {currentUser.isAdmin ? 'Admin' : currentUser.isBroker ? 'Broker' : 'User'}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  disabled={imageFileUploading}
                  isLoading={imageFileUploading}
                  variant="primary"
                  fullWidth
                  className="py-4 font-black"
                >
                  <FaRegSave className="text-lg mr-2" />
                  <span>تحديث البيانات</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-50 py-3"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                >
                  <FaSignOutAlt className="text-lg mr-2" />
                  <span>Logout</span>
                </Button>
              </motion.div>
            </motion.form>

            {/* Notifications */}
            <AnimatePresence>
              {(updateUserSuccess || updateUserError || imageFileUploadError) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 space-y-4"
                >
                  {updateUserSuccess && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-none border border-green-200">
                      {updateUserSuccess}
                    </div>
                  )}
                  {(updateUserError || imageFileUploadError) && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-none border border-red-200">
                      {updateUserError || imageFileUploadError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CustomizedDashProfile;