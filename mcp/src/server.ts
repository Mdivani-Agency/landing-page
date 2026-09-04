import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config";
import { createBlogApiClient } from "./http/client";
import { createMcpServer } from "./registry";
import { resources } from "./resources/index";
import { tools } from "./tools/index";

async function main() {
  const config = loadConfig();
  // stderr only — stdout is the MCP transport.
  console.error(`mdio-blog-mcp: targeting ${config.baseUrl}`);

  const server = createMcpServer(
    { tools, resources },
    config,
    createBlogApiClient(config),
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
