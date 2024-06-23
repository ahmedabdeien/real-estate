// models/listing.model.js
import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        
    },
    address: {
        type: String,
        required: true
    },
    available: {
        type: String,
        required: true
    },
    numberFloors: {
        type: Number,
        required: true
    },
    propertySize: {
        type: Number,
        required: true
    },
    imageUrls: {
        type: Array,
        required: true
    },
    imagePlans: {
        type: Array,
        required: true
    },
    imageApartments: {
        type: Array,
        required: true
    },
    titleApartments: {
        type: Array,
        required: true
    },
    slug:{
        type: String,
        required: true,
        unique: true,
    },
    

}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
