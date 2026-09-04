import type { AnyToolDefinition } from "../types";
import { blogCreatePost } from "./blog-create-post";
import { blogGetPost } from "./blog-get-post";
import { blogListPosts } from "./blog-list-posts";
import { blogUpdatePost } from "./blog-update-post";
import { blogValidatePost } from "./blog-validate-post";

export const tools: AnyToolDefinition[] = [
  blogValidatePost,
  blogCreatePost,
  blogUpdatePost,
  blogListPosts,
  blogGetPost,
];
