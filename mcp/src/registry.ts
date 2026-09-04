import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { McpConfig } from "./config";
import type { BlogApiRequest } from "./http/client";
import type { ResourceDefinition, ToolDefinition, ToolResult } from "./types";

export type Registry = {
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
};

export function listToolDescriptors(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: toJsonSchema(tool.inputSchema),
    annotations: tool.annotations,
  }));
}

export function listResourceDescriptors(resources: ResourceDefinition[]) {
  return resources.map((resource) => ({
    uri: resource.uri,
    name: resource.name,
    description: resource.description,
    mimeType: resource.mimeType,
  }));
}

export function readResource(
  resources: ResourceDefinition[],
  uri: string,
): ResourceDefinition | undefined {
  return resources.find((resource) => resource.uri === uri);
}

export async function callRegisteredTool(
  tools: ToolDefinition[],
  name: string,
  args: unknown,
  ctx: { baseUrl: string; token: string; request: BlogApiRequest },
): Promise<ToolResult> {
  const tool = tools.find((entry) => entry.name === name);

  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const parsed = tool.inputSchema.safeParse(args ?? {});

  if (!parsed.success) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ok: false,
              error: "Invalid tool arguments.",
              issues: parsed.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              })),
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }

  return tool.handler(parsed.data, ctx);
}

export function createMcpServer(
  registry: Registry,
  config: McpConfig,
  request: BlogApiRequest,
): Server {
  const server = new Server(
    { name: "mdivani-blog", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: listToolDescriptors(registry.tools),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (requestMessage) => {
    return callRegisteredTool(
      registry.tools,
      requestMessage.params.name,
      requestMessage.params.arguments,
      {
        baseUrl: config.baseUrl,
        token: config.token,
        request,
      },
    );
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: listResourceDescriptors(registry.resources),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (requestMessage) => {
    const resource = readResource(registry.resources, requestMessage.params.uri);

    if (!resource) {
      throw new Error(`Unknown resource: ${requestMessage.params.uri}`);
    }

    return {
      contents: [
        {
          uri: resource.uri,
          mimeType: resource.mimeType,
          text: resource.text,
        },
      ],
    };
  });

  return server;
}

function toJsonSchema(schema: ToolDefinition["inputSchema"]) {
  const json = zodToJsonSchema(schema, {
    target: "jsonSchema7",
    $refStrategy: "none",
  }) as Record<string, unknown>;

  const { $schema: _schema, ...rest } = json;
  return rest;
}
