import mongoose from "mongoose";


const listingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        availableOrNot:{
            type: Boolean,
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
        imageUrls:{
            type: Array,
            required: true
        },
        imagePlans:{
            type: String,
            required: true
        },
        imageApartments:{
            type: Array,
            required: true
        },
        titleApartments:{
            type: String,
            required: true
        },
        useRef:{
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;