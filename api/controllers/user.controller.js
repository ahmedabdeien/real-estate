import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from './../models/user.model.js';
import Listing from './../models/listing.model.js';

export const test = (req,res) => {
    res.json({
        message: 'api route is working!',
    });
}

export const updateUser = async (req,res,next) =>{
    if(req.user.id !== req.params.useId){
       return next(errorHandler(403,'you are not allowed to update this user!'))
    }
    if(req.body.password) {
       if(req.body.password.length < 6){
            return next(errorHandler(400,'password must be at least 6 characters long!'))
        }
        req.body.password =  bcryptjs.hashSync(req.body.password,10)
    }
    if(req.body.username){
        if(req.body.username.length < 7 || req.body.username.length > 20){
            return next(errorHandler(400,'username must be between 7 and 20 characters!'))
        }
        if(req.body.username.includes(' ')){
            return next(errorHandler(400,'username must not contain spaces!'))
        }
        if(req.body.username !== req.body.username.toLowerCase()){
            return next(errorHandler(400,'username must be lowercase!'))
        }
        if(!req.body.username.match(/^[a-zA-Z0-9]+$/)){
            return next(errorHandler(400,'username must contain only letters, numbers, underscores, dots, and hyphens!'))
        }
    }
    if (req.body.email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(req.body.email)) {
            return next(errorHandler(400, 'Invalid email format!'));
        }
    }

    // Validate number (Egyptian pattern)
    if (req.body.number) {
        const egyptNumberPattern = /^(\+20|0)?1[0125][0-9]{8}$/;
        if (!egyptNumberPattern.test(req.body.number)) {
            return next(errorHandler(400, 'Invalid Egyptian phone number format!'));
        }
    }

    // Validate name
    if (req.body.name) {
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(req.body.name)) {
            return next(errorHandler(400, 'Name must contain only letters and spaces!'));
        }
    }
    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.useId,{
            $set:{
                name:req.body.name,
                username: req.body.username,
                email:req.body.email,
                number:req.body.number,
                password:req.body.password,
                avatar:req.body.avatar,
            }
        }, {new:true});
        const {password,...rest} = updatedUser._doc
        res.status(200).json(rest);
    } catch(error){
        next(error)
       }

}

export const deleteUser = async (req,res,next) =>{
    if(!req.user.isAdmin && req.user.id!== req.params.id){
        return next(errorHandler(403,'You are not allowed to delete this user!')) 
    } 
    try{
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token");
        res.status(200).json('user has been deleted...!');
    }catch(error){
        return next(error)}
}

export const signout = async (req,res,next) =>{
    try{
        res.clearCookie("access_token").status(200).json('user has been signed out...!');
    }catch(error){
        return next(error)}
}

export const getUserListing = async (req,res,next) =>{
    if(req.userId._id === req.params._id){
       try {
         const listings = await Listing.find({userRef:req.params._id})
         res.status(200).json(listings);
       } catch (error) {
        next(error );
       }
    }else{
        return next(errorHandler(401,'You can only view your own listings!'))
    }
     
}

export const getUsers = async (req,res,next) =>{
    if(!req.user.isAdmin){
        return next(errorHandler(403,'You are not allowed to view all users!'))
    }
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find()
        .sort({createdAt:sortDirection})
        .skip(startIndex)
        .limit(limit);

        const usersWithoutPassword = users.map((user) =>{
            const {password,...rest} = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments();

        const now = new Date();

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        
        const lastMonthUsers = await User.countDocuments({
            createdAt:{$gte:oneMonthAgo}
        });

        res.status(200).json({
            users:usersWithoutPassword,
            totalUsers,
            lastMonthUsers
        });

    }catch(error){
        next(error)
    }
}

