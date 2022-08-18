import { WindowOptions } from "."

export type CacheConfig = {
  maximize?:boolean,
  x?:number,
  y?:number,
  width?:number,
  height?:number
}


export const extractConfig = (config:WindowOptions):CacheConfig=>{
  const  {
    maximize,
    x,
    y,
    width,
    height,
  } = config
  return {
    maximize,
    x,
    y,
    width,
    height,
  }
}