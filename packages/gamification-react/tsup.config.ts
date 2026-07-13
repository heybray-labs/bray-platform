import { globSync } from "node:fs";
import { defineConfig } from "tsup";

function entriesFor(dir: string, ext: string) {
  const entries: Record<string, string> = {};
  for (const file of globSync(`src/${dir}/*.${ext}`)) {
    const name = file.split("/").pop()!.replace(new RegExp(`\\.${ext}$`), "");
    entries[`${dir}/${name}`] = file;
  }
  return entries;
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "teams/star-map-types": "src/teams/star-map-types.ts",
    "teams/star-map-utils": "src/teams/star-map-utils.ts",
    "teams/drawer-pink-styles": "src/teams/drawer-pink-styles.ts",
    "reveal/stages": "src/reveal/stages.ts",
    "reveal/reveal-hooks": "src/reveal/reveal-hooks.ts",
    ...entriesFor("points", "tsx"),
    ...entriesFor("teams", "tsx"),
    ...entriesFor("reveal", "tsx"),
    ...entriesFor("lib", "ts"),
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "@heybray/gamification",
    "@heybray/react",
    "@heybray/ui",
    "@tanstack/react-query",
    "lucide-react",
    "wouter",
  ],
});
