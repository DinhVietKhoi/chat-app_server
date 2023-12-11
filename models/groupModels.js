import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const GroupSchema = new mongoose.Schema(
    {
        listMember: [{
            type: ObjectId,
            ref: "Users",
            require: true
        }]
    },
    {
        timestamps: true
    }
);
const Group = mongoose.model("Groups", GroupSchema);

export default Group;
