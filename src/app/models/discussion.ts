import { Post } from "../../api/backend";

export type PostsMap = {[postId: number]: Post};

export type PostReplyMode = 'reply' | 'edit' | 'new-thread';
