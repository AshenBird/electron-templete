import {
  UnwrapNestedRefs,
  ReactiveEffect,
  reactive,
} from "@vue/reactivity";
import { app } from "electron";
import * as FS from "fs-extra"
import { APP_NAME, LOCAL_DIR } from "./const";
import * as Path from "path"
// import { traverse } from "./watch";
// import * as Path from "path"
export type CreateStoreOptions<T extends Object> = {
  state: T;
  level?: "local" | "session";
  name?: string;
};

export type AppStore<T extends Object> = {
  state: UnwrapNestedRefs<T>;
};

export type CreateStoreArg<T extends Object> = CreateStoreOptions<T>;


// const simpleWatch = ( source:any, cb:any )=>{
//   const getter=()=>traverse(source)
//   const job =()=>{
//     cb()
//   }
//   const effect = new ReactiveEffect(getter,job)
  
//   effect.run();
// }


export const createStore = <T extends Object>(option: CreateStoreArg<T>) => {
  const state = reactive(option.state);
  if (option.level === "local") {
    if (!option.name) {
      throw new Error("持久化存储，必须命名");
    }
    
    FS.ensureFile(
      Path.join(LOCAL_DIR,`${APP_NAME}/${option.name}.json`)
    )
    app.on("will-quit",()=>{
      
    })
    // simpleWatch(state, ()=>{
    //   console.log(Date.now())
    // })
    // watch(state,(n,o)=>{
    //   console.log(n.width)
    // });
  }
  return { state };
};
