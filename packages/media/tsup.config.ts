import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "schema/index": "src/schema/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "@heybray/identity",
    "@heybray/server-kit",
    "drizzle-orm",
    "express",
    "multer",
  ],
});
