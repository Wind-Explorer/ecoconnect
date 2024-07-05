import axios from "axios";
import config from "../config";

const instance = axios.create({
  baseURL: config.serverAddress,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    console.log("yessss");
    // Do something before request is sent
    let accessToken = localStorage.getItem("accessToken");
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
