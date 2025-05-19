import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: Number,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    avatar:{
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    isBroker:{
        type: Boolean,
        default: false,
    },
    
    
    
},{timestamps:true});

const User = mongoose.model('user', userSchema);
export default User;