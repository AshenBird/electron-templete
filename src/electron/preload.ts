import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("$electron", {ipcRenderer});
