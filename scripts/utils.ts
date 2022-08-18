import { ChildProcess } from "child_process";
import * as path from "path"
import { createServer } from "vite"
import appConfig from "../app.config.json" 
export const getPath = (p:string) => path.resolve(__dirname, "../", p);

export const buildDefine = {
  $$MODE:"'production'",
  $$APP_NAME:appConfig.name
}


export const createWebServer = async () => {
  const server = await createServer({
    root: getPath("./"),
    server: {
      port: Number(process.env.DEV_PORT) || 8000,
    },
  });
  await server.listen();

  server.printUrls();
  return server;
};

export const closeElectron = (p:null|ChildProcess) => {
  if (!p) return true;
  const result = p.kill("SIGINT");
  if (result) {
    p = null;
  }
  return result;
};


export const getDevelopMode = () => {
  const args = process.argv;
  if (args.includes("--electron")) {
    return "electron";
  }
  if (args.includes("--web")) {
    return "web";
  }
  if (args.includes("--flutter")) {
    return "flutter";
  }
};
