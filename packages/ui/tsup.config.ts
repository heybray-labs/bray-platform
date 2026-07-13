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
    utils: "src/utils.ts",
    ContentHeaderCard: "src/ContentHeaderCard.tsx",
    "tailwind-preset": "src/tailwind-preset.ts",
    ...entriesFor("components", "tsx"),
    ...entriesFor("hooks", "ts"),
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "date-fns",
    "@radix-ui/react-avatar",
    "@radix-ui/react-collapsible",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-label",
    "@radix-ui/react-progress",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-toast",
    "@radix-ui/react-tooltip",
    "class-variance-authority",
    "clsx",
    "lucide-react",
    "tailwind-merge",
    "tailwindcss-animate",
  ],
});
