import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            min: 5,
            max: 20,
            unique: true,
        },
        fullname: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        status: {
            type: Boolean,
            default: true
        },
        about: {
            type: String,
            default: ""
        },
        sex: {
            type: String,
            default: ""
        },
        password: {
            type: String,
            require: true,
            min: 8,
        },
        email: {
            type: String,
            require: true,
            min: 2,
            max: 50,
            trim: true,
        },
        isInfoSet: {
            type: Boolean,
            default: false
        },
        avatarImage: {
            type: String,
            default: ""
        },
        listRequests: [{
            type: ObjectId,
            ref: "Users",
            require: true
        }],
        listFriend: [{
            type: ObjectId,
            ref: "Users",
            require: true
        }]
    },
    {
        timestamps: true
    }
);
const User = mongoose.model("Users", UserSchema);

export default User;
