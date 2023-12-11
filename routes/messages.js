import express from 'express'
import { addMessage, getAllMessage, getLatestMessage } from '../controllers/messagesController.js';
const router = express.Router();

router.post('/addmsg', addMessage)
router.get('/getmsg', getAllMessage)
router.get('/getlastmsg', getLatestMessage)

export default router;