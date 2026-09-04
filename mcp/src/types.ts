import type { ZodType } from "zod";
import type { BlogApiRequest } from "./http/client";

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export type ToolContext = {
  baseUrl: string;
  token: string;
  request: BlogApiRequest;
};

export type ToolDefinition<I = unknown> = {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodType<I>;
  annotations: { readOnlyHint: boolean; destructiveHint: boolean };
  handler: (input: I, ctx: ToolContext) => Promise<ToolResult>;
};

export function defineTool<I>(definition: ToolDefinition<I>): ToolDefinition<I> {
  return definition;
}

// Heterogeneous registry: each tool carries its own input type.
export type AnyToolDefinition = ToolDefinition<any>;

export type ResourceDefinition = {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  text: string;
};
