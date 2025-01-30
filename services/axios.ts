// axios.tsx

import { getLocalStorageItem, setLocalStorageItem } from "@/util";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ToastAndroid } from "react-native";

// export const API_BASE_PATH = 'http://188.166.239.38:9000/api';
export const API_BASE_PATH = 'https://pharmassist.cloud/api';
// export const API_BASE_PATH = 'http://139.59.116.222:9000/api';
export const BEARER = 'Bearer ';

const axiosInstance = axios.create({
  baseURL: API_BASE_PATH,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getLocalStorageItem('token');
      console.log('Token', token);

      if (!token) {
        // Token is invalid or missing; handle this case (e.g., redirect to login)
        setLocalStorageItem('user', null);
        setLocalStorageItem('token', null);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `${BEARER}${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error during token retrieval or request setup:', error);
      throw error;
    }
  },
  (error: AxiosError) => {
    console.error(`Request error from ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log('Response:', response.data);
    return response;
  },
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    if (error.response?.status !== 404) {
      ToastAndroid.show(`Error Message: ${error.message}, Status: ${error.response?.status}`, ToastAndroid.LONG)
    }
    if (error.response) {
      console.error(`Response error from ${method} ${url}`, error.response);
    } else if (error.request) {
      console.error(`No response received from ${method} ${url}`, error.request);
    } else {
      console.error(`Error during request setup for ${method} ${url}:`, error.message);
    }
    throw new Error(`${error.response?.status}`);
  }
);

export default axiosInstance;
