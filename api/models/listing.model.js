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
    sizeApartmentsOne: {
        type: Number,
    },
    sizeApartmentsTwo: {
        type: Number,
    },
    sizeApartmentsThree: {
        type: Number,
    },
    sizeApartmentsFour: {
        type: Number,
    },
    sizeApartmentsFive: {
        type: Number,
    },
    sizeApartmentsSix: {
        type: Number,
    },
    sizeApartmentsSeven: {
        type: Number,
    },
    sizeApartmentsEight: {
        type: Number,
    },
    userRef: {
        type: String,
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
