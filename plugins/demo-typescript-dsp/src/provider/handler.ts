import axios from "axios";

export const handler = (nativeBridge) => (params) => {
  const { type, url } = params;

  if (type !== "feed") {
    return Promise.reject(new Error("unknown type"));
  }

  return axios.get(url);
};
