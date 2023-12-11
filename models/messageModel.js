import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const MessageSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                require: true
            },
        },
        users: Array,
        sender: {
            type: ObjectId,
            ref: "Users",
            require: true
        },
        receiver: {
            type: ObjectId,
            ref: "Users",
            require: true
        },
        type: {
            type: String,
            enum: ["user", "group"], 
            default: "user"
        }
    },
    {
        timestamps: true
    }
);
const Message = mongoose.model("Messages", MessageSchema);

export default Message;
