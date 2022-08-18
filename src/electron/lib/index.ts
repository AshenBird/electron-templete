import { app, BrowserWindowConstructorOptions, BrowserWindow } from "electron";
import { nanoid } from "nanoid";
import * as Path from "path";
import "dotenv/config";
import { extractConfig } from "./config";
import { createStore } from "./store";

export const windowMap = new Map();

export interface WindowOptions extends BrowserWindowConstructorOptions {
  maximize?: boolean;
}

export const createWindow = (config: WindowOptions) => {
  const key = nanoid();
  
  const configStore = createStore({
    state: extractConfig(config),
    level: "local",
    name:"app-config"
  });
  const window = new BrowserWindow(config);
  if (config.maximize) {
    window.maximize();
  } else {
    window.unmaximize();
  }

  windowMap.set(key, window);

  // 监听 window 尺寸变化，写进设置。
  window.on("resize", () => {
    if (!window) return;
    const [width, height] = window.getSize();
    configStore.state.width = width;
    configStore.state.height = height;
  });
  window.on("move", () => {
    if (!window) return;
    const [x, y] = window.getPosition();
    configStore.state.x = x;
    configStore.state.y = y;
  });
  window.on("maximize", () => {
    if (!window) return;
    configStore.state.maximize = true;
  });
  window.on("unmaximize", () => {
    if (!window) return;
    configStore.state.maximize = false;
  });
  //@ts-ignore
  const isDevelopment = $$MODE === "development";

  if (isDevelopment) {
    window.loadURL(`http://${process.env.URL}`); // 载入开发时地址
  } else {
    window.loadFile("out/dist/view/index.html");
  }
  return window;
};
