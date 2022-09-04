import axios from "axios";
import type { AxiosRequestHeaders } from "axios";
import "dotenv/config";

const headers: AxiosRequestHeaders = {
  "X-Figma-Token": process.env["FIGMA_ACCESS_TOKEN"],
};

const instance = axios.create({
  baseURL: "https://api.figma.com/v1/files",
  headers,
});

export const figma = {
  getProject: async <T = {}>() => {
    const { data } = await instance.get<T>(
      `/${process.env["FIGMA_PROJECT_ID"]}`
    );
    return data;
  },
};
