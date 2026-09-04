import type { ResourceDefinition } from "../types";
import {
  FORMATTING_CONTRACT,
  FORMATTING_RESOURCE_URI,
} from "./formatting";

export const resources: ResourceDefinition[] = [
  {
    uri: FORMATTING_RESOURCE_URI,
    name: "Blog formatting contract",
    description:
      "Renderer constraints for blog Markdown. Read this before writing content.",
    mimeType: "text/markdown",
    text: FORMATTING_CONTRACT,
  },
];
