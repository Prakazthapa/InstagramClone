import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import { populate } from "dotenv";
import { Comment } from "../models/commentModel.js";
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image)
      return res
        .status(400)
        .json({ message: "Image is required", success: false });

    //image upload

    //resize image
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    //buffer to data uri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);

    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      success: true,
      post,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username,profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username,profilePicture" },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username,profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username,profilePicture" },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    //like logic
    await post.updateOne({ $addToSet: { likes: authorId } });
    await Post.save();

    //implement socket.io for real time notification

    return res.status(200).json({ message: "Post Liked", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    await post.updateOne({ $pull: { likes: authorId } });
    await Post.save();

    return res.status(200).json({ message: "Post DisLiked", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!text)
      return res
        .status(400)
        .json({ message: "Text is required", success: false });

    const comment = await Comment.create({
      text,
      author: authorId,
      post: postId,
    }).populate({
      path: "author",
      select: "username,profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment added",
      success: true,
      comment,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username,profilePicture"
    );

    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });

    return res.status(200).json({
      comments,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    //check if the logged-in user is the owner of the post

    if (post.author.toString() !== authorId)
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });

    //delete post
    await Post.findByIdAndDelete(postId);

    //remove the post id from the user's post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({ message: "Post deleted", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      //already bookmarked -> remove from bookmarks
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        message: "Post removed from bookmarks",
        success: true,
        type: "unsaved",
      });
    } else {
      //not bookmarked -> add to bookmarks
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({ message: "Post bookmarked", success: true, type: "saved" });
    }
  } catch (error) {
    console.log(error);
  }
};
