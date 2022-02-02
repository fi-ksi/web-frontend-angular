import { Post } from "../../api";

export type PostsMap = {[postId: number]: Post};

export type PostReplyMode = 'reply' | 'edit';
