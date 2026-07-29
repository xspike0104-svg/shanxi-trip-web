import { cpSync, mkdirSync, writeFileSync } from "node:fs";

mkdirSync("edgeone-dist", { recursive: true });
cpSync("edge-functions", "edgeone-dist/edge-functions", { recursive: true });
writeFileSync(
  "edgeone-dist/package.json",
  `${JSON.stringify(
    {
      name: "shanxi-four-person-trip-edgeone",
      private: true,
      type: "module",
      dependencies: {
        "@edgeone/pages-blob": "^0.0.14",
      },
    },
    null,
    2,
  )}\n`,
);
