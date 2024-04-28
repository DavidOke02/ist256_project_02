import mongoose from "mongoose";
const {Schema, model} = mongoose;

const commentSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String},
    likes: {type: Number, default: 0},
    timestamp: {type: Date, default: Date.now, immutable: true},
})

const CommentModel = model("Comment", commentSchema);
export default CommentModel;