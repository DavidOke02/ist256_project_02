import mongoose from "mongoose";
const {Schema, model} = mongoose;

const blogPostSchema = new Schema({
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true},
    likes: {type: Number, default: 0},
    url: {type: String, required: false},
    timestamp: {type: Date, default: Date.now, immutable: true},
    comments:  [{type: Schema.Types.ObjectId, ref: "Comment"}],
});

const BlogModel = model("Blog", blogPostSchema);
export default BlogModel;