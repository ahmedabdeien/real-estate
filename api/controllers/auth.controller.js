import { errorHandler } from "../Utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs'
export const signup = async (req ,res,next)=>{
    const { username , email ,phoneNumber, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser = new User({username ,phoneNumber, email , password: hashedPassword});
    try{
        await newUser.save();
        res.status(201).json('use created successfully!');
    } catch(error){
        next(error);
    }       
    
};