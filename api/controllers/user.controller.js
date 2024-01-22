import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from './../models/user.model.js';

export const test = (req,res) => {
    res.json({
        message: 'api route is working!',
    });
}

export const updateUser = async (req,res,next) =>{
    if(req.user.id !== req.params.id) 
    return next(errorHandler(401,'you can only update your own account!'))
    try{
        if(req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password,10)
        } 
        const updateUser = await User.findByIdAndUpdate(req.params.id,{
            $set:{
                name:req.body.name,
                username: req.body.username,
                email:req.body.email,
                number:req.body.number,
                password:req.body.password,
                avatar:req.body.avatar,
            } 
        }, {new:true})
        const {password,...rest} = updateUser._doc
        res.status(200).json(rest);
    }catch(error){
        return next(error)}
}

export const deleteUser = async (req,res,next) =>{
    if(req.user.id!== req.params.id) 
    return next(errorHandler(401,'you can only delete your own account!'))
    try{
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token");
        res.status(200).json('user has been deleted...!');
    }catch(error){
        return next(error)}
}

