import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "@heybray/server-kit",
    "@langchain/anthropic",
    "@langchain/core",
    "@langchain/google-genai",
    "@langchain/openai",
  ],
});
