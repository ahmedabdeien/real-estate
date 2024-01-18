import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs'
export const signup = async (req ,res,next)=>{
    const {name, username , email,number , password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser = new User({name,username , email,number, password: hashedPassword});
    try{
        await newUser.save();
        res.status(201).json('use created successfully!');
    } catch(error){
        next(error);
    }       
    
};