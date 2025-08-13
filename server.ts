import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Create server instance
const server = new Server({
  name: "s3tools",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

export { server, type Server }