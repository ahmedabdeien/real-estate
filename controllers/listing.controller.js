import Listing from '../models/listing.model.js';
import { errorHandler } from '../Utils/error.js';



export const createListing = async (req, res ,next) => { 
    
        if(!req.user.isAdmin){
            return next(errorHandler(403,"you are not allowed to create a page"));
        }
        const slug = req.body.name.split(' ').join('-').toLowerCase().replace(/[^a-zA-z0-9-]/g,'-');
        const newListing = new Listing({
            ...req.body,slug ,userId: req.user.id
        });
        try{
            const savedListing = await newListing.save();
            res.status(201).json(savedListing);
            }catch(error){
                next(error);
            }
}
export const getListing = async (req,res,next) =>{
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 1000;
        const sortDirection = req.query.order === 'asc' ? 1 :-1;
        const listings = await Listing.find({
            ...(req.query.userId && {userId: req.query.userId}),
            ...(req.query.name && {name: req.query.name}),
            ...(req.query.address && {address: req.query.address}),
            ...(req.query.description && {description: req.query.description}),
            ...(req.query.numberFloors && {numberFloors: req.query.numberFloors}),
            ...(req.query.propertySize && {propertySize: req.query.propertySize}),
            ...(req.query.titleApartments && {titleApartments: req.query.titleApartments}),
            ...(req.query.available && {available: req.query.available}),
            ...(req.query.slug && {slug: req.query.slug}),
            ...(req.query.listingId && {_id: req.query.listingId}),
            ...(req.query.searchTerm &&{
                $or:[
                    {name: new RegExp(req.query.searchTerm, 'i')},
                    {description: new RegExp(req.query.searchTerm, 'i')},
                    {address: new RegExp(req.query.searchTerm, 'i')},
                    {available: new RegExp(req.query.searchTerm, 'i')},
                    {numberFloors: new RegExp(req.query.searchTerm, 'i')},
                    {propertySize: new RegExp(req.query.searchTerm, 'i')},
                    {titleApartments: new RegExp(req.query.searchTerm, 'i')},
                    {userRef: new RegExp(req.query.searchTerm, 'i')},
                    {imageUrls: new RegExp(req.query.searchTerm, 'i')},
                    {imagePlans: new RegExp(req.query.searchTerm, 'i')},
                ]
            })
           
        }).sort({ updatedAt: sortDirection}).skip(startIndex).limit(limit);

        const totalPages = await Listing.countDocuments({});

        const now = new Date();
    
        
  

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
            
        );
        const lastMonthPages = await Listing.countDocuments({
            createAt: {
                $gte: oneMonthAgo
            }
        });
        res.status(200).json({listings, totalPages, lastMonthPages});
    }catch(error){
        next(error);
    }
}

export const deletePage = async (req,res,next) =>{
    if(!req.user.isAdmin || req.user.id !== req.params.userId){
        return next(errorHandler(403,"you are not allowed to delete a page"));
    }
    try{
        await Listing.findByIdAndDelete(req.params.pageId);
        res.status(200).json('the page has been deleted successfully!');
    }catch(error){
        next(error);
    }
}

export const updatePage = async (req,res,next) =>{
    const updatePage = await Listing.findById(req.params.id);
    if(!updatePage){
        return next(errorHandler(404,"page not found"));
    }
    if(!req.user.isAdmin || req.user.id !== updatePage.userId){
        return next(errorHandler(403,"you are not allowed to update a page"));
    }
    try{
        const updatedPage = await Listing.findByIdAndUpdate(req.params.id,{$set: req.body},{new:true});
        res.status(200).json(updatedPage);
    }catch(error){
        next(error);
    }
};

export const getPage = async (req,res,next) =>{
    try{
        const page = await Listing.findById(req.params.id);
        if(!page){
            return next(errorHandler(404,"page not found"));
        }
        res.status(200).json(page);
    }catch(error){
        next(error);
    }
}