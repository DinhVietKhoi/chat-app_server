import Message from "../models/messageModel.js";
import User from "../models/userModel.js"
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const addMessage = async (req, res, next) => {
    try {
        const { text, sender, receiver, type } = req.body;
        if (type !== 'group') {
            const senderIsFriend = await User.exists({ _id: sender, listFriend: receiver });
            const senderIsRequest = await User.exists({ _id: sender, listRequests: receiver });

            const receiverIsRequest = await User.exists({ _id: receiver, listRequests: sender });
            const receiverIsFriend = await User.exists({ _id: receiver, listFriend: sender });

            const newMessage = await Message.create({
                message: { text },
                sender,
                receiver,
                users: [sender, receiver],
            })
            
            const populateMessage = await newMessage.populate({
                    path: 'sender receiver',
                    select: 'avatarImage fullname _id'
            });
            if (populateMessage) { 
                if (!senderIsFriend) {
                    await User.updateOne(
                        { _id: sender },
                        { $addToSet: { listFriend: receiver } }
                    );
                }
                if (senderIsRequest) {
                    await User.updateOne(
                        { _id: sender },
                        { $pull: { listRequests: receiver }}
                    );
                }
                if (!receiverIsRequest && !receiverIsFriend) {
                    await User.updateOne(
                        { _id: receiver },
                        { $addToSet: { listRequests: sender } }
                    );
                }
                return res.json({ status: true, msg: "Message added successfully.", populateMessage });
            } 
        }
        else {
            const newMessage = await Message.create({
                message: { text },
                sender,
                receiver,
                users: [sender, receiver],
                type
            })
            
            const populateMessage = await newMessage.populate({
                    path: 'sender receiver',
                    select: 'avatarImage fullname _id'
            });
            if (populateMessage) {
                return res.json({ status: true, msg: "Message added successfully.", populateMessage });
            }
        }
        
        return  res.json({ status: false, msg: "Failed to add message to the database." });
    } catch (error) {
        next(error);
    }
}
export const getAllMessage = async (req, res, next) => {
    try {
        const { sender, receiver, skip, type } = req.query;
        let messages;
        if (type === 'users') {
            messages = await Message.find({
                users: {
                    $all: [sender, receiver]
                }
            })
                .sort({ createdAt: -1 })
                .skip(parseInt(skip, 10))
                .limit(20)
                .populate({
                    path: 'sender receiver',
                    select: 'avatarImage fullname _id'
            })
        }
        else {
            messages = await Message.find({type: 'group'})
                .sort({ createdAt: -1 })
                .skip(parseInt(skip, 10))
                .limit(20)
                .populate({
                    path: 'sender receiver',
                    select: 'avatarImage fullname _id'
            })
        }
            const reversedMessages = messages.reverse();

        res.json(reversedMessages)
    }
    catch (ex) {
        next(ex);
    }
}

export const getLatestMessage = async (req, res, next) => {
    try {
        const { senderId, receiverId } = req.query
        const latestMessage = await Message
        .find({
            $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
            ]
        })
        .sort({ createdAt: -1 })
            .limit(1)
        res.json(latestMessage[0])
    } catch (error) {
        console.error(error);
    }
};