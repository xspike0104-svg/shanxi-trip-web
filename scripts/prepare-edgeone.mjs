import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

mkdirSync("edgeone-dist", { recursive: true });
rmSync("edgeone-dist/edge-functions", { recursive: true, force: true });
rmSync("edgeone-dist/cloud-functions", { recursive: true, force: true });
cpSync("cloud-functions", "edgeone-dist/cloud-functions", { recursive: true });
writeFileSync(
  "edgeone-dist/edgeone.json",
  `${JSON.stringify(
    {
      overseasRegions: ["ap-hongkong"],
      rewrites: [
        {
          source: "/*",
          destination: "/index.html",
        },
      ],
    },
    null,
    2,
  )}\n`,
);
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
