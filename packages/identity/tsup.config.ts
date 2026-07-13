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
    "@heybray/server-kit",
    "@node-saml/node-saml",
    "bcrypt",
    "drizzle-orm",
    "drizzle-zod",
    "express",
    "jsonwebtoken",
    "nanoid",
    "openid-client",
    "selfsigned",
    "zod",
  ],
});
