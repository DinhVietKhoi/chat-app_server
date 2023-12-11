import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const register = async (req, res, next) =>{
    try {
        const { username, password, email } = req.body;
        const userameCheck = await User.findOne({ username })
        if (userameCheck)
            return res.json({ msg: "Tài khoản đã tồn tại.", status: false });
        const emailCheck = await User.findOne({ email })
        if (emailCheck)
            return res.json({ msg: "Email đã được sử dụng.", status: false });
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            password: passwordHash,
            email
        });
        // const userShow = user.toObject();
        // delete userShow.password;
        return res.json({status: true, user})
    }
    catch (ex){
        next(ex);
    }
}
export const login = async (req, res, next)=>{
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        if (!user)
            return res.json({ msg: "Tài khoản không tồn tài.", status: false });
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (passwordCheck || password == user.password) {
            return res.json({status:true,user})
        }

        return res.json({status:false,msg:"Mật khẩu chưa chính xác."})
    }
    catch (ex) {
        next(ex);
    }
}
export const setProfile = async (req, res, next) => {
    try {
        const { image, fullname, address, sex, about } = req.body;
        const id = req.params.id
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.json({ msg: "Người dùng không tồn tại.", status: false });
        }
        if (image) {
            const imageCloudinary = await cloudinary.uploader.upload(image, {
                folder: "images",
            })
            user.avatarImage = imageCloudinary.secure_url;
        }
        
        // Cập nhật thông tin người dùng
        user.isInfoSet = true;
        if (fullname)
            user.fullname = fullname;
        if (address)
            user.address = address;
        if (sex)
            user.sex = sex;
        if (about)
            user.about = about;
        await user.save()
        
        return res.json(
            {
                status: true,
                user,
                userId: { _id: id, fullname: user.fullname, avatarImage: user.avatarImage }
        }
        )
    }
    catch (ex) {
        next(ex);
    }
}


export const getUser = async (req, res, next) => {
    try {
        const user = await User.findOne({
            _id:  req.query.id
        }).select('-password')
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user)

    }
    catch (ex) {
        next(ex);
    }
}
export const getAllUser = async (req, res, next) => {
    try {
        const users = await User.find({
            _id: { $ne: req.params.id },
            isInfoSet: true
        }).select('fullname avatarImage _id')
        if (!users) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(users)
    }
    catch (ex) {
        next(ex);
    }
}
export const getAllFriend = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
            .populate({
                path: 'listFriend listRequests',
                select: 'avatarImage fullname _id'
            })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const listFriend = user.listFriend;
        const listRequest = user.listRequests;
        return res.json({ listFriend, listRequest});
    }
    catch (ex) {
        next(ex);
    }
}

export const searchUser = async (req, res, next) => {
    try {
        const { valueSearch } = req.query;
        // Sử dụng biểu thức chính quy để tìm kiếm theo tên người dùng
        const regex = new RegExp(`.*${valueSearch}.*`, 'i');
        const users = await User.find({ fullname: { $regex: regex } }).select('_id');
        const idSearch = users.map(e=>e._id)

        res.json(idSearch);
    } catch (ex) {
        next(ex);
    }
};