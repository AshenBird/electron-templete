import * as fs from "fs-extra";
import { buildDefine, getPath } from "./utils";

import * as esbuild from "esbuild";
import * as dotenv from "dotenv";
dotenv.config();
fs.ensureDir(getPath("dist"));

const build = async () => {
  await esbuild.build({
    entryPoints: [getPath("./src/electron/preload.ts")],
    bundle: true,
    outdir: getPath("./dist/electron"),
    format: "iife",
    target: ["es2020"],
    platform: "browser",
    external: ["electron","@electron/fuses"],
    define:buildDefine
  });
  await esbuild.build({
    target: ["es2020"],
    entryPoints: [getPath("./src/electron/index.ts")],
    bundle: true,
    outdir: getPath("./dist/electron"),
    format: "cjs",
    platform: "node",
    external: ["electron","@electron/fuses"],
    define:buildDefine
  });
  // exec("npm run make")
};

build();
