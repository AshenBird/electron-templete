import * as Path from "path";

const HOME =
  process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;

export const USER_DIR = HOME ? Path.resolve(HOME) : "";

export const LOCAL_DIR = USER_DIR ? Path.resolve(USER_DIR, "local") : "";

// @ts-ignore
export const APP_NAME:string = $$APP_NAME