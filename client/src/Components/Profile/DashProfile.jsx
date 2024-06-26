import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FloatingLabel} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { app } from "../../firebase.js";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateFailure,
  updateStart,
  updateSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
function DashProfile() {
  const { currentUser,error } = useSelector((state) => state.user);
  // change the avatar to the user's avatar
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const filePickerRef = useRef();
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
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
  // upload image to firebase storage
  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          "Could not upload image (file must be less than 2MB)"
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
  // update user profile function
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setUpdateUserError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made!");
      return;
    }
    if (imageFileUploading) {
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
    <div className="max-w-2xl mx-auto p-6 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <h1 className="text-center text-[#034078] dark:text-blue-500 font-semibold text-4xl mb-6">
        Profile
    </h1>
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={filePickerRef}
            hidden
        />
        <div
            className="relative w-32 h-32 self-center cursor-pointer shadow-md rounded-full overflow-hidden mb-4"
            onClick={() => filePickerRef.current.click()}
        >
            {imageFileUploadProgress && (
                <CircularProgressbar
                    value={imageFileUploadProgress || 0}
                    text={`${imageFileUploadProgress}%`}
                    strokeWidth={5}
                    styles={{
                        root: {
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            textColor: "#034078",
                            trailColor: "#034078",
                        },
                        path: {
                            stroke: `rgba(3, 64, 120, ${imageFileUploadProgress / 100})`,
                        },
                        text: { fill: "#034078", fontSize: "16px" },
                    }}
                />
            )}
            <img
                src={imageFileUrl || currentUser.avatar}
                alt="user"
                className={`${imageFileUploadProgress && imageFileUploadProgress < 100 && "opacity-60"} rounded-full w-full h-full object-cover border-4 dark:border-gray-600 border-white`}
            />
        </div>
        {imageFileUploadError && (
            <Alert color="failure" className="text-center">{imageFileUploadError}</Alert>
        )}

        <div className="space-y-4">
            <FloatingLabel
                type="text"
                id="name"
                variant="filled"
                label="Name"
                defaultValue={currentUser.name}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-gray-300"
            />
            <FloatingLabel
                type="text"
                id="username"
                variant="filled"
                label="Username"
                defaultValue={currentUser.username}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-gray-300"
            />
            <FloatingLabel
                type="email"
                id="email"
                variant="filled"
                label="Email"
                defaultValue={currentUser.email}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-gray-300"
            />
            <FloatingLabel
                type="tel"
                id="number"
                variant="filled"
                label="Number"
                defaultValue={currentUser.number}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-gray-300"
            />
            <FloatingLabel
                type="password"
                id="password"
                variant="filled"
                label="Password"
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-gray-300"
            />
            <Button type="submit" className="w-full py-3 bg-[#034078] text-white rounded-md shadow-md hover:bg-[#034078]/80 transition duration-200">
                Update
            </Button>
        </div>
    </form>

    <div className="mt-5">
        {updateUserSuccess && (
            <Alert color="success" className="text-center">
                {updateUserSuccess}
            </Alert>
        )}
    </div>
    <div className="mt-5">
        {updateUserError && (
            <Alert color="failure" className="text-center">
                {updateUserError}
            </Alert>
        )}
    </div>
</div>

  );
}

export default DashProfile;
