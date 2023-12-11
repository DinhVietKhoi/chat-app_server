import express from 'express'
import { register,login, getAllUser, setProfile, getAllFriend, getUser, searchUser } from '../controllers/userController.js';
const router = express.Router();

router.post('/register', register)
router.post('/login', login)
router.get('/allusers/:id', getAllUser)
router.get('/getuser/', getUser)
router.get('/searchuser/', searchUser)
router.get('/listfriend/:id', getAllFriend)
router.post('/setprofile/:id', setProfile)

export default router;