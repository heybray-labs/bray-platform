import { globSync } from "glob";
import { defineConfig } from "tsup";

function entriesFor(dir: string, ext: string) {
  const entries: Record<string, string> = {};
  for (const file of globSync(`src/${dir}/*.${ext}`)) {
    if (file.includes(".test.")) continue;
    const name = file.split("/").pop()!.replace(new RegExp(`\\.${ext}$`), "");
    entries[`${dir}/${name}`] = file;
  }
  return entries;
}

export default defineConfig({
  entry: {
    "config/app-config": "src/config/app-config.tsx",
    "errors/index": "src/errors/index.ts",
    ...entriesFor("lib", "ts"),
    ...entriesFor("hooks", "ts"),
    ...entriesFor("components", "tsx"),
    ...entriesFor("admin", "tsx"),
    ...entriesFor("pages", "tsx"),
    ...entriesFor("classifications", "tsx"),
    ...entriesFor("extensions", "ts"),
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "@heybray/identity",
    "@heybray/taxonomy",
    "@heybray/ui",
    "@dnd-kit/core",
    "@dnd-kit/sortable",
    "@dnd-kit/utilities",
    "@tanstack/react-query",
    "lucide-react",
    "wouter",
  ],
  onSuccess: "cp -r src/assets dist/assets",
});
