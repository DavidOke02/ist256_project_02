import BlogModel from "../model/blogModel.js";
import CommentModel from "../model/commentModel.js";

export async function getAllPosts(req, res) {
    try {
        const posts = await BlogModel.find().populate("comments");
        res.json(posts);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function getPost(req, res) {
    try {
        const post = await BlogModel.findById(req.params.id).populate("comments");
        if (!post) {
            res.status(404).json({message: "Post not found"});
        }
        else {
            res.json(post);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function createPost(req, res) {
    try {
        const newPost = new BlogModel({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            comments: [],
        });

        newPost.url = `http://localhost:3000/posts/${newPost.id}`;
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);

    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export async function likePost(req, res) {
    try {
        const post = await BlogModel.findById(req.params.id).populate("comments");
        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }
            post.likes++;
            const updatedPost = await post.save();
            res.json(updatedPost);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function addComment(req, res) {
    try{
        const post = await BlogModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }
        const newComment = new CommentModel ({
            user: req.body.user,
            text: req.body.text
        });
        await newComment.save();
        post.comments.push(newComment);
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function deletePost(req, res) {
    try{
        const postToDelete = await BlogModel.findByIdAndDelete(req.params.id).populate("comments");
        if (!postToDelete) {
            res.status(404).json({message: "Post not found"});
        }
            res.json(postToDelete)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}