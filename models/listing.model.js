// models/listing.model.js
import mongoose from 'mongoose';



const listingSchema = new mongoose.Schema(
    {
        name: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        description: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        address: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        city: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        propertyType: {
            type: String,
            enum: ['Apartment', 'Villa', 'Office', 'Shop', 'Land'],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        available: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            enum: ['Available', 'Sold'],
            default: 'Available'
        },
        numberFloors: {
            type: Number,
            default: 1
        },
        propertySize: {
            type: Number,
            required: true
        },
        rooms: {
            type: Number,
            default: 0
        },
        bathrooms: {
            type: Number,
            default: 0
        },
        videoUrl: {
            type: String
        },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
        imageUrls: {
            type: Array,
            required: true
        },
        userRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        featured: {
            type: Boolean,
            default: false
        }

    }, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
