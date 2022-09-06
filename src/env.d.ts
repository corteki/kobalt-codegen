import type { ProjectEnv } from "./project-env";

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProjectEnv {}
  }
}
