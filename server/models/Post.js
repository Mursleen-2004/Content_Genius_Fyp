import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      required: true,
    },
    post: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ userId: 1, topic: 1, tone: 1, post: 1 }, { unique: true });
const Post = mongoose.model("Post", postSchema);

export default Post;
