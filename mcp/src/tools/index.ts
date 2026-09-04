import type { ToolDefinition } from "../types";
import { blogCreatePost } from "./blog-create-post";
import { blogGetPost } from "./blog-get-post";
import { blogListPosts } from "./blog-list-posts";
import { blogUpdatePost } from "./blog-update-post";
import { blogValidatePost } from "./blog-validate-post";

export const tools: ToolDefinition[] = [
  blogValidatePost,
  blogCreatePost,
  blogUpdatePost,
  blogListPosts,
  blogGetPost,
];
