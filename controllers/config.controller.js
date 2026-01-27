import Config from '../models/config.model.js';
import { errorHandler } from '../Utils/error.js';

export const getConfig = async (req, res, next) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            // Create default if not found
            config = await Config.create({});
        }
        res.status(200).json(config);
    } catch (error) {
        next(error);
    }
};

export const updateConfig = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        const config = await Config.findOneAndUpdate(
            {},
            { $set: req.body, lastUpdatedBy: req.user.id },
            { new: true, upsert: true }
        );
        res.status(200).json(config);
    } catch (error) {
        next(error);
    }
};
