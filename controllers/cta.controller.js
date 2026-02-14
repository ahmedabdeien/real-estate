import CTA from '../models/cta.model.js';
import { errorHandler } from '../Utils/error.js';

export const createCTA = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        const newCTA = new CTA(req.body);
        const savedCTA = await newCTA.save();
        res.status(201).json(savedCTA);
    } catch (error) {
        next(error);
    }
};

export const getCTAs = async (req, res, next) => {
    try {
        const ctas = await CTA.find().sort({ createdAt: -1 });
        res.status(200).json(ctas);
    } catch (error) {
        next(error);
    }
};

export const updateCTA = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        const updatedCTA = await CTA.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedCTA);
    } catch (error) {
        next(error);
    }
};

export const deleteCTA = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        await CTA.findByIdAndDelete(req.params.id);
        res.status(200).json('CTA has been deleted');
    } catch (error) {
        next(error);
    }
};
