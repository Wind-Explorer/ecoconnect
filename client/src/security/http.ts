import axios from "axios";
import config from "../config";

const instance = axios.create({
  baseURL: config.serverAddress,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (config.data && config.data.user) {
      delete config.data.user;
    }
    return config;
  },
  function (error) {
    // Do something with request error

    localStorage.clear();
    return Promise.reject(error);
  }
);
export default instance;
