import { app, BrowserWindow } from "electron";
import { createWindow } from "./lib";
import "dotenv/config";

let mainWindow: BrowserWindow | null = null;
//@ts-ignore
const isDevelopment = $$MODE === "development";


const main = async () => {
  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (mainWindow) return;
    mainWindow = createWindow({
      width: 800,
      height: 800,
      x: undefined,
      y: undefined,
    });
  });

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === "win32") {
      process.on("message", (data) => {
        if (data === "graceful-exit") {
          app.quit();
        }
      });
    } else {
      process.on("SIGTERM", () => {
        app.quit();
      });
    }
  }

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  await app.whenReady();
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Plugins
  }

  mainWindow = createWindow({
    width: 800,
    height: 800,
    x: undefined,
    y: undefined,
  });
};

main();
