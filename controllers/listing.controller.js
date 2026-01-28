import Listing from '../models/listing.model.js';
import { errorHandler } from '../Utils/error.js';



import { validationResult } from "express-validator";

export const createListing = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorHandler(400, errors.array()[0].msg));
    }
    if (req.user.role !== 'Admin' && req.user.role !== 'Sales') {
        return next(errorHandler(403, "You are not allowed to create a listing"));
    }
    if (!req.body.name || !req.body.name.en) {
        return next(errorHandler(400, "English name is required for slug generation"));
    }
    const slug = req.body.name.en.split(' ').join('-').toLowerCase().replace(/[^a-zA-z0-9-]/g, '-') + '-' + Math.random().toString(36).slice(-4);
    const newListing = new Listing({
        ...req.body,
        slug,
        userRef: req.user.id
    });
    try {
        const savedListing = await newListing.save();
        res.status(201).json({ success: true, data: savedListing, message: "Listing created successfully" });
    } catch (error) {
        next(error);
    }
}

export const getListing = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 1000;
        const sortDirection = req.query.order === 'asc' ? 1 : -1;
        const listings = await Listing.find({
            ...(req.query.userRef && { userRef: req.query.userRef }),
            ...(req.query.propertyType && { propertyType: req.query.propertyType }),
            ...(req.query.city && {
                $or: [
                    { "city.en": new RegExp(req.query.city, 'i') },
                    { "city.ar": new RegExp(req.query.city, 'i') }
                ]
            }),
            ...(req.query.minPrice || req.query.maxPrice ? {
                price: {
                    ...(req.query.minPrice && { $gte: parseInt(req.query.minPrice) }),
                    ...(req.query.maxPrice && { $lte: parseInt(req.query.maxPrice) })
                }
            } : {}),
            ...(req.query.rooms && { rooms: parseInt(req.query.rooms) }),
            ...(req.query.propertySize && { propertySize: { $gte: parseInt(req.query.propertySize) } }),
            ...(req.query.available && { available: req.query.available === 'true' }),
            ...(req.query.slug && { slug: req.query.slug }),
            ...(req.query.listingId && { _id: req.query.listingId }),
            ...(req.query.searchTerm && {
                $or: [
                    { "name.en": new RegExp(req.query.searchTerm, 'i') },
                    { "name.ar": new RegExp(req.query.searchTerm, 'i') },
                    { "description.en": new RegExp(req.query.searchTerm, 'i') },
                    { "description.ar": new RegExp(req.query.searchTerm, 'i') },
                    { "address.en": new RegExp(req.query.searchTerm, 'i') },
                    { "address.ar": new RegExp(req.query.searchTerm, 'i') },
                ]
            })

        }).sort({ updatedAt: sortDirection }).skip(startIndex).limit(limit);

        const totalPages = await Listing.countDocuments({});

        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
        );
        const lastMonthPages = await Listing.countDocuments({
            createdAt: {
                $gte: oneMonthAgo
            }
        });
        res.status(200).json({ success: true, listings, totalPages, lastMonthPages });
    } catch (error) {
        next(error);
    }
}

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return next(errorHandler(404, 'Listing not found'));

    if (req.user.role !== 'Admin' && req.user.id !== listing.userRef.toString()) {
        return next(errorHandler(403, "You are not allowed to delete this listing"));
    }
    try {
        await Listing.findByIdAndDelete(req.params.listingId);
        res.status(200).json({ success: true, message: 'The listing has been deleted successfully!' });
    } catch (error) {
        next(error);
    }
}

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return next(errorHandler(404, "Listing not found"));
    }
    if (req.user.role !== 'Admin' && req.user.id !== listing.userRef.toString()) {
        return next(errorHandler(403, "You are not allowed to update this listing"));
    }
    try {
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json({ success: true, data: updatedListing, message: "Listing updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const getPage = async (req, res, next) => {
    try {
        const page = await Listing.findById(req.params.id);
        if (!page) {
            return next(errorHandler(404, "page not found"));
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
}