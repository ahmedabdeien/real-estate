import express from 'express'
import { deleteUser, signout, test, updateUser,getUserListing } from '../controllers/user.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();
router.get('/test', test);
router.put('/update/:useId',verifyToken, updateUser)
router.delete('/delete/:id',verifyToken, deleteUser)
router.post('/signout', signout)

export default router;