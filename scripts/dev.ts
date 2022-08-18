import * as fs from "fs-extra"
import {ViteDevServer} from "vite"
import {
  getPath,
  closeElectron,
  createWebServer,
  getDevelopMode,
  buildDefine,
} from "./utils"

import * as esbuild from "esbuild"
import { spawn, ChildProcess } from "child_process"
import * as dotenv from "dotenv"
import { AddressInfo } from "net"
const electron = require("electron") as unknown as string;

dotenv.config();

fs.ensureDir(getPath("dist"));

const watch = async () => {
  let isOver = true;

  const mode = getDevelopMode();

  const server = await createWebServer();

  let electronProcess:null|ChildProcess = null;
  if (mode === "electron") {
    const startElectron = (viteServer:ViteDevServer) => {
      const { address, port } = (viteServer.httpServer?.address()) as AddressInfo
      
      const child = spawn(electron, [ getPath("./dist/electron/"), ], {
        stdio: "inherit",
        windowsHide: false,
        env:Object.assign({URL:`${address}:${port}`},process.env)
      });
      child.on("close", function (code, signal) {
        if (!isOver) {
          electronProcess = startElectron(viteServer);
          isOver = true;
          return;
        }
        if (code === null) {
          console.error(electron, "exited with signal", signal);
          process.exit(1);
        }
        process.exit(code);
      });
      return child;
    };
    
    await esbuild
      .build({
        entryPoints: [getPath("./src/electron/preload.ts")],
        bundle: true,
        outdir: getPath("./dist/electron"),
        format: "iife",
        target:["es2020"],
        platform: "browser",
        external: ["electron"],
        define:buildDefine
      })
    esbuild
      .build({
        target: ["es2020"],
        entryPoints: [getPath("./src/electron/index.ts")],
        bundle: true,
        outdir: getPath("./dist/electron"),
        format: "cjs",
        platform: "node",
        external: ["electron"],
        define:buildDefine,
        watch: {
          onRebuild: () => {
            console.log("rebuilding...");
            isOver = false;
            closeElectron(electronProcess);
          },
        },
      })
      .then(() => {
        electronProcess = startElectron(server);
      });
  }
  // 监听父进程
  
  ["SIGTERM",  "SIGHUP", "SIGINT"].forEach((e) => {
    process.once(e, (code, signal) => {
      isOver = true;
      server.close();
      if (mode !== "electron") return;
      if (!electronProcess || !electronProcess.killed) return;
      electronProcess.kill(signal);
    });
  });
};

watch();
