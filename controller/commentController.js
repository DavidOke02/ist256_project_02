import CommentModel from '../model/commentModel.js';

export async function getAllComments(req, res) {
    try {
        const comments = await CommentModel.find();
        res.json(comments);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function getComment(req, res) {
    try {
        const comment = await CommentModel.findById(req.params.id);
        if (!comment) {
            res.status(404).json({message: "Comment not found"});
        }
        else {
            res.json(comment);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function likeComment(req, res) {
    try {
        const comment = await CommentModel.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({message: "Comment not found"});
        }
        comment.likes++;
        const updatedComment = await comment.save();
        res.json(updatedComment);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}